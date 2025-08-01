import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User, Session } from '@supabase/supabase-js'
import { supabase } from "@/integrations/supabase/client"

interface Profile {
  id: string
  user_id: string
  display_name: string | null
  email: string | null
  role: 'free' | 'pro' | 'team'
  subscription_active: boolean
  subscription_tier: string
  subscription_end_date: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (displayName: string) => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, !!session)
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false) // Set loading to false on any auth state change
        
        if (session?.user) {
          // Use setTimeout to avoid deadlock in auth callback
          setTimeout(() => {
            fetchProfile(session.user.id)
          }, 0)
        } else {
          setProfile(null)
        }
      }
    )

    // Fetch profile function
    const fetchProfile = async (userId: string) => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
        
        if (error) {
          console.error('Error fetching profile:', error)
        } else {
          console.log('Profile fetched:', profileData)
          setProfile(profileData as Profile)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', !!session, error)
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
      
      // Fetch profile if user exists
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    }).catch((error) => {
      console.error('Error getting session:', error)
      setIsLoading(false) // Make sure to set loading to false even on error
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName || ''
        }
      }
    })
    
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (displayName: string) => {
    if (!user) throw new Error('No user logged in')
    
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id)
    
    if (error) throw error
    
    // Update local profile state
    setProfile(prev => prev ? { ...prev, display_name: displayName } : null)
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}