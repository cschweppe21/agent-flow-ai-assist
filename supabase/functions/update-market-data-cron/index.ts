import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MarketDataResponse {
  city: string
  state: string
  median_home_price?: number
  price_change_percent?: number
  days_on_market?: number
  active_listings?: number
  sales_volume?: number
  price_per_sqft?: number
  inventory_months?: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting monthly market data update...')

    // Major cities to update automatically
    const citiesToUpdate = [
      { city: 'San Francisco', state: 'CA' },
      { city: 'New York', state: 'NY' },
      { city: 'Los Angeles', state: 'CA' },
      { city: 'Chicago', state: 'IL' },
      { city: 'Houston', state: 'TX' },
      { city: 'Boston', state: 'MA' },
      { city: 'Seattle', state: 'WA' },
      { city: 'Denver', state: 'CO' },
      { city: 'Austin', state: 'TX' },
      { city: 'Miami', state: 'FL' },
      { city: 'Atlanta', state: 'GA' },
      { city: 'Dallas', state: 'TX' },
      { city: 'Phoenix', state: 'AZ' },
      { city: 'San Diego', state: 'CA' },
      { city: 'Portland', state: 'OR' }
    ]

    // Log update start
    const { data: logData } = await supabase
      .from('data_refresh_log')
      .insert({
        data_source: 'monthly_cron_update',
        status: 'in_progress'
      })
      .select()
      .single()

    let updatedCount = 0
    const errors: string[] = []

    for (const location of citiesToUpdate) {
      try {
        console.log(`Updating data for ${location.city}, ${location.state}`)
        
        // Generate sample data for each city (in production, this would call real APIs)
        const marketData = generateSampleData(location.city, location.state)

        // Store/update in database
        const { error: upsertError } = await supabase
          .from('market_data')
          .upsert({
            city: marketData.city,
            state: marketData.state,
            median_home_price: marketData.median_home_price,
            price_change_percent: marketData.price_change_percent,
            days_on_market: marketData.days_on_market,
            active_listings: marketData.active_listings,
            sales_volume: marketData.sales_volume,
            price_per_sqft: marketData.price_per_sqft,
            inventory_months: marketData.inventory_months,
            data_source: 'monthly_cron_update',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'city,state,data_source'
          })

        if (upsertError) {
          throw upsertError
        }

        updatedCount++
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        const errorMsg = `Failed to update ${location.city}, ${location.state}: ${error.message}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    // Update refresh log
    if (logData) {
      await supabase
        .from('data_refresh_log')
        .update({
          status: errors.length > 0 ? 'completed' : 'completed',
          refresh_completed_at: new Date().toISOString(),
          records_updated: updatedCount,
          error_message: errors.length > 0 ? errors.join('; ') : null
        })
        .eq('id', logData.id)
    }

    console.log(`Monthly update completed. Updated ${updatedCount} cities.`)
    
    if (errors.length > 0) {
      console.warn(`Errors occurred: ${errors.join('; ')}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated: updatedCount, 
        errors: errors.length,
        message: `Updated ${updatedCount} cities with ${errors.length} errors`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in monthly update:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function generateSampleData(city: string, state: string): MarketDataResponse {
  // Generate realistic sample data based on location and current date
  const stateMultipliers: Record<string, number> = {
    'CA': 1.8, 'NY': 1.6, 'WA': 1.4, 'MA': 1.5, 'HI': 2.0,
    'TX': 0.9, 'FL': 1.1, 'AZ': 1.0, 'NV': 1.2, 'CO': 1.3,
    'OH': 0.7, 'PA': 0.8, 'MI': 0.6, 'IN': 0.6, 'MO': 0.7
  }
  
  const basePrice = 300000
  const multiplier = stateMultipliers[state] || 0.8
  const monthlyVariation = 0.95 + Math.random() * 0.1 // Monthly variation 0.95 to 1.05
  
  return {
    city,
    state,
    median_home_price: Math.round(basePrice * multiplier * monthlyVariation),
    price_change_percent: Math.round((Math.random() * 20 - 5) * 100) / 100, // -5% to 15%
    days_on_market: Math.round(15 + Math.random() * 45), // 15 to 60 days
    active_listings: Math.round(50 + Math.random() * 500),
    sales_volume: Math.round(10 + Math.random() * 100),
    price_per_sqft: Math.round((100 + Math.random() * 200) * multiplier),
    inventory_months: Math.round((2 + Math.random() * 4) * 100) / 100 // 2 to 6 months
  }
}