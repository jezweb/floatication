import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// This composable manages user authentication
export function useAuth() {
  const user = ref<User | null>(null)
  const loading = ref(true)

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in with:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) {
        console.error('Sign in error:', error)
        throw error
      }
      console.log('Sign in successful:', data)
      return { data, error: null }
    } catch (error) {
      console.error('Sign in exception:', error)
      return { data: null, error }
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting sign up with:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) {
        console.error('Sign up error:', error)
        throw error
      }
      console.log('Sign up successful:', data)
      return { data, error: null }
    } catch (error) {
      console.error('Sign up exception:', error)
      return { data: null, error }
    }
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Check if user is logged in on component mount
  onMounted(async () => {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    loading.value = false

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })

    // Cleanup subscription when component unmounts
    return () => subscription.unsubscribe()
  })

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}