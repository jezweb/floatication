<template>
  <v-container>
    <!-- Alert for notifications -->
    <v-alert
      v-model="alert.show"
      :type="alert.type"
      dismissible
      elevation="2"
      class="mb-4"
    >
      {{ alert.message }}
    </v-alert>
    <v-row>
      <v-col cols="12">
        <div class="text-center mb-8">
          <h1 class="text-h3 font-weight-bold mb-4">Welcome to Your Dashboard</h1>
          <p class="text-h6 text-grey-darken-1">
            Manage your AI workspaces and interact with your intelligent assistants
          </p>
        </div>
      </v-col>
    </v-row>
    
    <v-row>
      <!-- Workspaces List -->
      <v-col cols="12" md="8">
        <v-card elevation="4" rounded="lg">
          <v-card-title>
            Your Workspaces
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="dialog = true">
              <v-icon start>mdi-plus</v-icon>
              New Workspace
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-row v-if="loading">
              <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-col>
            </v-row>
            
            <v-row v-else-if="workspaces.length === 0">
              <v-col cols="12" class="text-center py-8">
                <v-icon size="80" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
                <h3 class="text-h5 mt-4 mb-2">No workspaces yet</h3>
                <p class="text-body-1 text-grey-darken-1">Create your first workspace to get started!</p>
                <v-btn
                  color="primary"
                  size="large"
                  class="mt-4"
                  @click="dialog = true"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Create Your First Workspace
                </v-btn>
              </v-col>
            </v-row>
            
            <v-row v-else>
              <v-col
                v-for="workspace in workspaces"
                :key="workspace.id"
                cols="12"
                sm="6"
                md="4"
              >
                <v-hover v-slot="{ isHovering, props }">
                  <v-card
                    v-bind="props"
                    :elevation="isHovering ? 8 : 2"
                    @click="router.push(`/workspace/${workspace.id}`)"
                    class="cursor-pointer transition-swing"
                    rounded="lg"
                  >
                    <v-card-title class="text-h6 font-weight-bold">
                      {{ workspace.name }}
                    </v-card-title>
                    <v-card-subtitle class="text-body-2">
                      {{ workspace.description || 'No description' }}
                    </v-card-subtitle>
                    <v-card-text>
                      <v-chip size="small" color="primary" variant="tonal">
                        <v-icon start size="small">mdi-robot</v-icon>
                        AI Enabled
                      </v-chip>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        icon="mdi-arrow-right"
                        variant="text"
                        color="primary"
                      ></v-btn>
                    </v-card-actions>
                  </v-card>
                </v-hover>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Quick Stats -->
      <v-col cols="12" md="4">
        <v-card class="mb-4" elevation="4" rounded="lg">
          <v-card-title>Quick Stats</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Total Workspaces</v-list-item-title>
                <v-list-item-subtitle>{{ workspaces.length }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Active Sessions</v-list-item-title>
                <v-list-item-subtitle>0</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
        
        <v-card elevation="4" rounded="lg">
          <v-card-title>Getting Started</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-numeric-1-circle</v-icon>
                </template>
                <v-list-item-title>Create a workspace</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-numeric-2-circle</v-icon>
                </template>
                <v-list-item-title>Upload documents</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-numeric-3-circle</v-icon>
                </template>
                <v-list-item-title>Chat with AI</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Create Workspace Dialog -->
    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h5 font-weight-bold pa-6 pb-4">
          <v-icon start color="primary">mdi-folder-plus</v-icon>
          Create New Workspace
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <v-form @submit.prevent="createWorkspace">
            <v-text-field
              v-model="newWorkspace.name"
              label="Workspace Name"
              placeholder="My AI Project"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Workspace name is required']"
              class="mb-4"
            ></v-text-field>
            <v-textarea
              v-model="newWorkspace.description"
              label="Description (optional)"
              placeholder="Describe what this workspace is for..."
              variant="outlined"
              density="comfortable"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            @click="dialog = false" 
            variant="text"
            size="large"
            :disabled="creating"
          >
            Cancel
          </v-btn>
          <v-btn 
            @click="createWorkspace" 
            color="primary" 
            variant="elevated"
            size="large"
            :loading="creating"
          >
            Create Workspace
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user } = useAuth()

// Alert state
const alert = ref({
  show: false,
  type: 'success' as 'success' | 'error' | 'warning' | 'info',
  message: ''
})

const showAlert = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
  alert.value = { show: true, type, message }
  setTimeout(() => {
    alert.value.show = false
  }, 5000)
}

// State
const workspaces = ref<any[]>([])
const loading = ref(true)
const dialog = ref(false)
const creating = ref(false)
const newWorkspace = ref({
  name: '',
  description: ''
})

// Fetch workspaces
const fetchWorkspaces = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    workspaces.value = data || []
  } catch (error) {
    console.error('Error fetching workspaces:', error)
  } finally {
    loading.value = false
  }
}

// Create new workspace
const createWorkspace = async () => {
  // Validate form
  if (!newWorkspace.value.name.trim()) {
    showAlert('error', 'Please enter a workspace name')
    return
  }

  // Check if user is logged in
  if (!user.value?.id) {
    showAlert('error', 'You must be logged in to create a workspace')
    return
  }

  creating.value = true
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        name: newWorkspace.value.name.trim(),
        description: newWorkspace.value.description.trim(),
        owner_id: user.value.id,
        flowise_chatflow_id: null // Explicitly set to null if the column allows it
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Add to list and close dialog
    workspaces.value.unshift(data)
    dialog.value = false
    newWorkspace.value = { name: '', description: '' }
    
    // Show success message
    showAlert('success', 'Workspace created successfully!')
    
    // Navigate to the new workspace after a short delay
    setTimeout(() => {
      router.push(`/workspace/${data.id}`)
    }, 1000)
  } catch (error: any) {
    console.error('Error creating workspace:', error)
    showAlert('error', error.message || 'Failed to create workspace')
  } finally {
    creating.value = false
  }
}

// Load workspaces on mount
onMounted(() => {
  fetchWorkspaces()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.transition-swing {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Custom card hover effect */
.v-card:hover {
  transform: translateY(-2px);
}

/* Make the dashboard more modern */
:deep(.v-card) {
  transition: all 0.3s ease;
}
</style>