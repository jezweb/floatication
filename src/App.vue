<template>
  <v-app>
    <!-- Navigation Bar -->
    <v-app-bar app elevation="2" color="white">
      <v-app-bar-title class="font-weight-bold">
        <v-icon start color="primary">mdi-robot-happy</v-icon>
        Floatication
      </v-app-bar-title>
      
      <template v-slot:append>
        <template v-if="user">
          <v-btn 
            icon="mdi-bell-outline" 
            variant="text"
            class="mr-2"
          ></v-btn>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn 
                v-bind="props"
                icon
                variant="text"
              >
                <v-avatar color="primary" size="32">
                  <span class="text-white">{{ user.email?.[0]?.toUpperCase() || 'U' }}</span>
                </v-avatar>
              </v-btn>
            </template>
            <v-list>
              <v-list-item>
                <v-list-item-title class="font-weight-bold">{{ user.email }}</v-list-item-title>
                <v-list-item-subtitle>Signed in</v-list-item-subtitle>
              </v-list-item>
              <v-divider class="my-2"></v-divider>
              <v-list-item @click="router.push('/dashboard')">
                <template v-slot:prepend>
                  <v-icon>mdi-view-dashboard</v-icon>
                </template>
                <v-list-item-title>Dashboard</v-list-item-title>
              </v-list-item>
              <v-list-item @click="signOut">
                <template v-slot:prepend>
                  <v-icon>mdi-logout</v-icon>
                </template>
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <v-btn 
          v-else 
          to="/login" 
          color="primary"
          variant="elevated"
        >
          Login
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { user, signOut: authSignOut } = useAuth()
const router = useRouter()

const signOut = async () => {
  await authSignOut()
  router.push('/login')
}
</script>
