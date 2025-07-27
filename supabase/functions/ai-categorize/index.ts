import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text) {
      throw new Error('Missing required field: text');
    }

    console.log(`Categorizing text:`, text);

    // Call OpenAI to categorize the input
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that categorizes real estate CRM input. Analyze the text and determine if it describes:
            
            1. "buyer" - A potential buyer or client interested in purchasing property (includes contact info, budget, preferences)
            2. "seller" - A client who is selling property or wants to list their property (includes listing details, property info)
            3. "vendor" - A service provider, contractor, photographer, inspector, or business contact
            4. "task" - A standalone to-do item, appointment, reminder, or action (not related to creating client/vendor profiles)
            
            IMPORTANT: If the text mentions both a client AND a task (like "Add John as client and remind me to call"), categorize as the client type (buyer/seller) since the client profile is the primary intent.
            
            Return only the category name as a single word: "buyer", "seller", "vendor", or "task".`
          },
          {
            role: 'user',
            content: `Categorize this text: "${text}"`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "category_result",
            schema: {
              type: "object",
              properties: {
                 category: {
                   type: "string",
                   enum: ["buyer", "seller", "vendor", "task"],
                   description: "The determined category"
                 },
                confidence: {
                  type: "number",
                  description: "Confidence score between 0 and 1"
                }
              },
              required: ["category", "confidence"],
              additionalProperties: false
            }
          }
        },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const result = JSON.parse(aiResponse.choices[0].message.content);
    
    console.log('Categorization result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error in ai-categorize function:`, error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});