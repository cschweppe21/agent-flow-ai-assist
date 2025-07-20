import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface MarketData {
  id: string
  city: string
  state: string
  median_home_price?: number
  price_change_percent?: number
  days_on_market?: number
  active_listings?: number
  sales_volume?: number
  price_per_sqft?: number
  inventory_months?: number
  data_source: string
  updated_at: string
}

interface RefreshStatus {
  status: 'in_progress' | 'completed' | 'failed'
  last_updated?: string
  error_message?: string
}

export const useMarketData = (city?: string, state?: string) => {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus | null>(null)

  const fetchMarketData = async (targetCity: string, targetState: string, forceRefresh = false) => {
    setLoading(true)
    setError(null)

    try {
      // First, check if we have recent data in the database
      if (!forceRefresh) {
        const { data: cachedData, error: dbError } = await supabase
          .from('market_data')
          .select('*')
          .eq('city', targetCity)
          .eq('state', targetState)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (dbError) {
          console.error('Database error:', dbError)
        }

        // Use cached data if it's less than 24 hours old
        if (cachedData) {
          const lastUpdated = new Date(cachedData.updated_at)
          const now = new Date()
          const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)

          if (hoursDiff < 24) {
            setData(cachedData)
            setLoading(false)
            return cachedData
          }
        }
      }

      // Fetch fresh data from the edge function
      const { data: freshData, error: functionError } = await supabase.functions.invoke(
        'fetch-market-data',
        {
          body: { city: targetCity, state: targetState }
        }
      )

      if (functionError) {
        throw functionError
      }

      // Fetch the updated data from database
      const { data: updatedData, error: fetchError } = await supabase
        .from('market_data')
        .select('*')
        .eq('city', targetCity)
        .eq('state', targetState)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fetchError) {
        throw fetchError
      }

      setData(updatedData)
      return updatedData

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data'
      setError(errorMessage)
      console.error('Error fetching market data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRefreshStatus = async () => {
    try {
      const { data: statusData, error } = await supabase
        .from('data_refresh_log')
        .select('*')
        .order('refresh_started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching refresh status:', error)
        return
      }

      if (statusData) {
        setRefreshStatus({
          status: statusData.status as 'in_progress' | 'completed' | 'failed',
          last_updated: statusData.refresh_completed_at || statusData.refresh_started_at,
          error_message: statusData.error_message
        })
      }
    } catch (err) {
      console.error('Error getting refresh status:', err)
    }
  }

  useEffect(() => {
    if (city && state) {
      fetchMarketData(city, state)
    }
    getRefreshStatus()
  }, [city, state])

  return {
    data,
    loading,
    error,
    refreshStatus,
    fetchMarketData,
    getRefreshStatus
  }
}