
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: max 50 requests per hour for free users, 200 for pro/team
const RATE_LIMITS = {
  free: { requests: 50, windowMs: 60 * 60 * 1000 }, // 1 hour
  pro: { requests: 200, windowMs: 60 * 60 * 1000 },
  team: { requests: 500, windowMs: 60 * 60 * 1000 }
};

const AI_SYSTEM_PROMPT = `You are SlipStream AI, a professional real estate assistant. You help real estate professionals with:

ALLOWED TOPICS:
- Property analysis and market insights
- Lead generation strategies
- Real estate marketing advice
- Property valuation guidance
- Client communication tips
- Market trends and data interpretation
- Investment property analysis
- Real estate transaction processes

STRICT RESTRICTIONS:
- You CANNOT provide legal advice or act as a lawyer
- You CANNOT handle financial transactions or money
- You CANNOT access external APIs or browse the internet
- You CANNOT store or remember personal client information
- You CANNOT provide tax advice (refer to professionals)
- You CANNOT guarantee investment returns or property values
- You CANNOT help with anything outside real estate

IMPORTANT DISCLAIMERS:
- Always remind users to consult licensed professionals for legal/financial advice
- Emphasize that market data and valuations are estimates only
- Remind users to verify all information independently

Keep responses professional, helpful, and focused on real estate. Always include appropriate disclaimers when discussing valuations or investments.`;

async function checkRateLimit(userId: string, userTier: string): Promise<{ allowed: boolean; remaining: number }> {
  const limit = RATE_LIMITS[userTier as keyof typeof RATE_LIMITS] || RATE_LIMITS.free;
  const windowStart = new Date(Date.now() - limit.windowMs);

  const { count } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', windowStart.toISOString());

  const used = count || 0;
  const remaining = Math.max(0, limit.requests - used);

  return {
    allowed: used < limit.requests,
    remaining
  };
}

async function logUsage(userId: string, requestType: string, tokensUsed: number, costCents: number) {
  await supabase
    .from('ai_usage_logs')
    .insert({
      user_id: userId,
      request_type: requestType,
      tokens_used: tokensUsed,
      cost_cents: costCents
    });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile to check subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, subscription_active, subscription_tier')
      .eq('user_id', user.id)
      .single();

    const userTier = profile?.subscription_active ? (profile.subscription_tier || 'free') : 'free';

    // Check rate limiting
    const rateLimit = await checkRateLimit(user.id, userTier);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please upgrade your plan or try again later.',
        remaining: rateLimit.remaining 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, conversationId } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Content filtering - basic checks for inappropriate content
    const inappropriatePatterns = [
      /\b(hack|exploit|bypass|illegal)\b/i,
      /\b(steal|fraud|scam|cheat)\b/i,
      /personal.*information/i,
      /social.*security/i,
      /credit.*card/i
    ];

    if (inappropriatePatterns.some(pattern => pattern.test(message))) {
      return new Response(JSON.stringify({ 
        error: 'Your message contains inappropriate content. Please focus on real estate topics.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get conversation history if conversationId provided
    let conversationHistory: any[] = [];
    if (conversationId) {
      const { data: messages } = await supabase
        .from('ai_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20); // Limit context to last 20 messages

      conversationHistory = messages || [];
    }

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: 'system', content: AI_SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        max_tokens: userTier === 'free' ? 500 : 1000, // Limit tokens for free users
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;
    const costCents = Math.ceil(tokensUsed * 0.001); // Rough cost calculation

    // Log usage
    await logUsage(user.id, 'chat', tokensUsed, costCents);

    // Store conversation if conversationId provided
    if (conversationId) {
      // Store user message
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: message
        });

      // Store AI response
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: aiResponse
        });

      // Update conversation timestamp
      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      tokensUsed,
      remaining: rateLimit.remaining - 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error. Please try again later.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
