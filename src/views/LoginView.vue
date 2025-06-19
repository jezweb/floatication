<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" lg="4">
        <div class="text-center mb-8">
          <v-icon size="64" color="primary">mdi-robot-happy</v-icon>
          <h1 class="text-h4 font-weight-bold mt-4">Floatication</h1>
          <p class="text-body-1 text-grey-darken-1">AI-Powered Workspace Management</p>
        </div>
        
        <v-card elevation="8" rounded="lg">
          <v-card-title class="text-h5 text-center pa-6 pb-2">
            {{ isSignUp ? 'Create Account' : 'Welcome Back' }}
          </v-card-title>
          
          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-email"
                class="mb-4"
              ></v-text-field>
              
              <v-text-field
                v-model="password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                required
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                class="mb-4"
              ></v-text-field>
              
              <v-alert
                v-if="error"
                type="error"
                class="mb-4"
                dismissible
                @click:close="error = ''"
              >
                {{ error }}
              </v-alert>
              
              <v-btn
                type="submit"
                block
                color="primary"
                size="large"
                variant="elevated"
                :loading="loading"
                class="mb-4"
              >
                {{ isSignUp ? 'Create Account' : 'Sign In' }}
              </v-btn>
              
              <v-divider class="mb-4"></v-divider>
              
              <v-btn
                block
                variant="text"
                @click="isSignUp = !isSignUp"
              >
                {{ isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up' }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { signIn, signUp } = useAuth()

// Form state
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSignUp = ref(false)
const loading = ref(false)
const error = ref('')

// Handle form submission
const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  
  try {
    if (isSignUp.value) {
      const { error: signUpError } = await signUp(email.value, password.value)
      if (signUpError) throw signUpError
      // Show success message
      error.value = 'Check your email to confirm your account!'
    } else {
      const { error: signInError } = await signIn(email.value, password.value)
      if (signInError) throw signInError
      // Redirect to dashboard on successful login
      router.push('/dashboard')
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>