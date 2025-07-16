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
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single()
              
              setProfile(profileData as Profile)
            } catch (error) {
              console.error('Error fetching profile:', error)
            }
          }, 0)
        } else {
          setProfile(null)
        }
      }
    )

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
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

  const value: AuthContextType = {
    user,
    profile,
    session,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}