import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type, userId } = await req.json();
    
    if (!prompt || !type || !userId) {
      throw new Error('Missing required fields: prompt, type, userId');
    }

    console.log(`Processing ${type} prompt:`, prompt);

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Define the AI parsing prompt based on type
    let systemPrompt = '';
    let jsonSchema = {};

    if (type === 'buyer') {
      systemPrompt = `You are an AI assistant that extracts buyer information from natural language descriptions. Extract the following information and return it as JSON. If information is not provided, use null for that field.`;
      
      jsonSchema = {
        type: "object",
        properties: {
          name: { type: "string", description: "Full name of the buyer" },
          email: { type: ["string", "null"], description: "Email address" },
          phone: { type: ["string", "null"], description: "Phone number" },
          budget_min: { type: ["number", "null"], description: "Minimum budget in dollars" },
          budget_max: { type: ["number", "null"], description: "Maximum budget in dollars" },
          preferred_bedrooms: { type: ["integer", "null"], description: "Preferred number of bedrooms" },
          preferred_bathrooms: { type: ["number", "null"], description: "Preferred number of bathrooms" },
          preferred_areas: { type: "array", items: { type: "string" }, description: "Array of preferred areas/neighborhoods" },
          status: { type: "string", enum: ["active", "under_contract", "closed", "inactive"], default: "active" },
          notes: { type: ["string", "null"], description: "Additional notes about the buyer" }
        },
        required: ["name", "status"],
        additionalProperties: false
      };
    } else if (type === 'listing') {
      systemPrompt = `You are an AI assistant that extracts listing information from natural language descriptions. Extract the following information and return it as JSON. If information is not provided, use null for that field.`;
      
      jsonSchema = {
        type: "object",
        properties: {
          address: { type: "string", description: "Full property address" },
          price: { type: "number", description: "Listing price in dollars" },
          bedrooms: { type: ["integer", "null"], description: "Number of bedrooms" },
          bathrooms: { type: ["number", "null"], description: "Number of bathrooms" },
          square_feet: { type: ["integer", "null"], description: "Square footage" },
          status: { type: "string", enum: ["active", "pending", "sold", "withdrawn"], default: "active" },
          description: { type: ["string", "null"], description: "Property description" },
          mls_number: { type: ["string", "null"], description: "MLS number if provided" }
        },
        required: ["address", "price", "status"],
        additionalProperties: false
      };
    }

    // Call OpenAI to parse the data
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Extract information from this prompt: "${prompt}"`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: `${type}_data`,
            schema: jsonSchema
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
    const extractedData = JSON.parse(aiResponse.choices[0].message.content);
    
    console.log('Extracted data:', extractedData);

    // Add user_id to the extracted data
    extractedData.user_id = userId;

    // Insert the data into the appropriate table
    let result;
    if (type === 'buyer') {
      const { data, error } = await supabase
        .from('buyers')
        .insert([extractedData])
        .select()
        .single();
      
      if (error) {
        console.error('Database error inserting buyer:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      result = data;
    } else if (type === 'listing') {
      // Set listing_date to today if not provided
      if (!extractedData.listing_date) {
        extractedData.listing_date = new Date().toISOString().split('T')[0];
      }
      
      const { data, error } = await supabase
        .from('listings')
        .insert([extractedData])
        .select()
        .single();
      
      if (error) {
        console.error('Database error inserting listing:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      result = data;
    }

    console.log(`Successfully created ${type}:`, result);

    return new Response(JSON.stringify({ 
      success: true, 
      data: result,
      extractedData: extractedData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error in ai-parse-data function:`, error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});