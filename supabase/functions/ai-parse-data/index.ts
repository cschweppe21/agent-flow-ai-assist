import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type, userId } = await req.json();
    console.log(`Processing ${type} prompt: ${prompt}`);

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    let extractedData: any = {};
    let success = false;

    switch (type) {
      case 'buyer':
        extractedData = await processBuyerPrompt(prompt, userId, supabase);
        success = true;
        break;

      case 'listing':
        extractedData = await processListingPrompt(prompt, userId, supabase);
        success = true;
        break;

      case 'vendor':
        extractedData = await processVendorPrompt(prompt, userId, supabase);
        success = true;
        break;

      case 'task':
        extractedData = await processTaskPrompt(prompt, userId, supabase);
        success = true;
        break;

      case 'close_buyer':
        extractedData = await processCloseBuyerPrompt(prompt, userId, supabase);
        success = true;
        break;

      default:
        throw new Error(`Unsupported type: ${type}`);
    }

    return new Response(JSON.stringify({ 
      success, 
      extractedData,
      type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-parse-data function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processBuyerPrompt(prompt: string, userId: string, supabase: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract buyer information from the following text. Return a JSON object with these fields (only include fields that are mentioned):
          - name (required)
          - email
          - phone
          - budget_min (number in dollars)
          - budget_max (number in dollars)
          - preferred_bedrooms (number)
          - preferred_bathrooms (number)
          - preferred_areas (array of strings)
          - notes (any additional context or selling information)
          
          If someone mentions selling properties, add that to the notes field. Convert all monetary amounts to numbers (e.g., "600k" = 600000).`
        },
        { role: 'user', content: prompt }
      ],
    }),
  });

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  // Remove markdown code blocks if present
  if (content.startsWith('```json')) {
    content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (content.startsWith('```')) {
    content = content.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  
  const extractedData = JSON.parse(content);
  console.log('Extracted data:', extractedData);

  const { data: buyer, error } = await supabase
    .from('buyers')
    .insert({
      user_id: userId,
      name: extractedData.name,
      email: extractedData.email || null,
      phone: extractedData.phone || null,
      budget_min: extractedData.budget_min || null,
      budget_max: extractedData.budget_max || null,
      preferred_bedrooms: extractedData.preferred_bedrooms || null,
      preferred_bathrooms: extractedData.preferred_bathrooms || null,
      preferred_areas: extractedData.preferred_areas || null,
      status: 'active',
      notes: extractedData.notes || null
    })
    .select()
    .single();

  if (error) throw error;
  console.log('Successfully created buyer:', buyer);
  
  return buyer;
}

async function processListingPrompt(prompt: string, userId: string, supabase: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract listing information from the following text. Return a JSON object with these fields (only include fields that are mentioned):
          - address (required)
          - price (required, number in dollars)
          - bedrooms (number)
          - bathrooms (number)
          - square_feet (number)
          - description
          - mls_number
          - status (default: "active")
          
          Convert all monetary amounts to numbers (e.g., "975k" = 975000, "$1.2M" = 1200000).`
        },
        { role: 'user', content: prompt }
      ],
    }),
  });

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  // Remove markdown code blocks if present
  if (content.startsWith('```json')) {
    content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (content.startsWith('```')) {
    content = content.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  
  const extractedData = JSON.parse(content);
  console.log('Extracted data:', extractedData);

  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      user_id: userId,
      address: extractedData.address,
      price: extractedData.price,
      bedrooms: extractedData.bedrooms || null,
      bathrooms: extractedData.bathrooms || null,
      square_feet: extractedData.square_feet || null,
      description: extractedData.description || null,
      mls_number: extractedData.mls_number || null,
      status: extractedData.status || 'active',
      listing_date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (error) throw error;
  console.log('Successfully created listing:', listing);
  
  return listing;
}

async function processVendorPrompt(prompt: string, userId: string, supabase: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract vendor information from the following text. Return a JSON object with these fields (only include fields that are mentioned):
          - name (required)
          - business_name
          - category (required - choose from: attorney, appraiser, inspector, insurance, lender, contractor, stager, photographer, other)
          - phone
          - email
          - website
          - address
          - notes
          - rating (number between 1-5)
          - is_preferred (boolean, default false)
          
          Map service types to categories: lawyer/attorney -> attorney, home inspector -> inspector, photographer -> photographer, etc.`
        },
        { role: 'user', content: prompt }
      ],
    }),
  });

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  // Remove markdown code blocks if present
  if (content.startsWith('```json')) {
    content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (content.startsWith('```')) {
    content = content.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  
  const extractedData = JSON.parse(content);
  console.log('Extracted data:', extractedData);

  const { data: vendor, error } = await supabase
    .from('vendors')
    .insert({
      user_id: userId,
      name: extractedData.name,
      business_name: extractedData.business_name || null,
      category: extractedData.category,
      phone: extractedData.phone || null,
      email: extractedData.email || null,
      website: extractedData.website || null,
      address: extractedData.address || null,
      notes: extractedData.notes || null,
      rating: extractedData.rating || null,
      is_preferred: extractedData.is_preferred || false
    })
    .select()
    .single();

  if (error) throw error;
  console.log('Successfully created vendor:', vendor);
  
  return vendor;
}

async function processTaskPrompt(prompt: string, userId: string, supabase: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract task information from the following text. Return a JSON object with these fields:
          - title (required)
          - description
          - due_date (YYYY-MM-DD format if mentioned, null otherwise)
          - priority (low, medium, high, urgent - default: medium)
          - completed (always false for new tasks)
          - listing_id (null - will be linked later if needed)
          
          For dates, convert relative dates to absolute dates. If no specific date is mentioned, leave due_date as null.`
        },
        { role: 'user', content: prompt }
      ],
    }),
  });

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  // Remove markdown code blocks if present
  if (content.startsWith('```json')) {
    content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (content.startsWith('```')) {
    content = content.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  
  const extractedData = JSON.parse(content);
  console.log('Extracted data:', extractedData);

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: extractedData.title,
      description: extractedData.description || null,
      due_date: extractedData.due_date || null,
      priority: extractedData.priority || 'medium',
      completed: false,
      listing_id: extractedData.listing_id || null
    })
    .select()
    .single();

  if (error) throw error;
  console.log('Successfully created task:', task);
  
  return task;
}

async function processCloseBuyerPrompt(prompt: string, userId: string, supabase: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract information about closing a buyer's profile from the following text. Return a JSON object with these fields:
          - buyer_name (required - the name to search for)
          - sale_price (number in dollars)
          - commission_rate (number as percentage, e.g., 2.5 for 2.5%)
          - commission_amount (number in dollars - calculate if rate and price given, or extract directly)
          - notes (any additional notes to add to the buyer profile)
          - close_reason (brief description of why closing)
          
          Convert monetary amounts to numbers (e.g., "575k" = 575000, "$1.2M" = 1200000).
          If commission rate and sale price are given, calculate commission_amount = (sale_price * commission_rate / 100).`
        },
        { role: 'user', content: prompt }
      ],
    }),
  });

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  // Remove markdown code blocks if present
  if (content.startsWith('```json')) {
    content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (content.startsWith('```')) {
    content = content.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  
  const extractedData = JSON.parse(content);
  console.log('Extracted close buyer data:', extractedData);

  // Find the buyer by name
  const { data: buyers, error: searchError } = await supabase
    .from('buyers')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', `%${extractedData.buyer_name}%`)
    .limit(1);

  if (searchError) throw searchError;
  
  if (!buyers || buyers.length === 0) {
    throw new Error(`Buyer "${extractedData.buyer_name}" not found`);
  }

  const buyer = buyers[0];

  // Calculate commission if needed
  let commissionAmount = extractedData.commission_amount;
  if (!commissionAmount && extractedData.sale_price && extractedData.commission_rate) {
    commissionAmount = (extractedData.sale_price * extractedData.commission_rate) / 100;
  }

  // Update buyer status to closed and add notes
  const updatedNotes = buyer.notes 
    ? `${buyer.notes}\n\n[CLOSED] ${extractedData.notes || extractedData.close_reason || 'Deal completed'}`
    : `[CLOSED] ${extractedData.notes || extractedData.close_reason || 'Deal completed'}`;

  const { data: updatedBuyer, error: updateError } = await supabase
    .from('buyers')
    .update({
      status: 'closed',
      notes: updatedNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', buyer.id)
    .select()
    .single();

  if (updateError) throw updateError;

  // Create commission record if we have commission data
  let commission = null;
  if (commissionAmount && commissionAmount > 0) {
    const { data: newCommission, error: commissionError } = await supabase
      .from('commissions')
      .insert({
        user_id: userId,
        buyer_id: buyer.id,
        amount: commissionAmount,
        commission_type: 'buying',
        description: `Commission from ${buyer.name} - ${extractedData.close_reason || 'buyer transaction'}`,
        date_earned: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (commissionError) {
      console.error('Error creating commission:', commissionError);
    } else {
      commission = newCommission;
      console.log('Successfully created commission:', commission);
    }
  }

  console.log('Successfully closed buyer profile:', updatedBuyer);
  
  return {
    buyer: updatedBuyer,
    commission: commission,
    sale_price: extractedData.sale_price,
    commission_amount: commissionAmount
  };
}