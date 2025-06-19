<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>
    
    <template v-else-if="workspace">
      <v-row>
        <v-col cols="12">
          <v-btn icon variant="text" @click="router.push('/dashboard')">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4 d-inline-block ml-2">{{ workspace.name }}</h1>
          <p class="text-subtitle-1 mt-2">{{ workspace.description }}</p>
        </v-col>
      </v-row>
      
      <v-row>
        <!-- Chat Section -->
        <v-col cols="12" md="8">
          <v-card height="600">
            <v-card-title>AI Assistant</v-card-title>
            <v-card-text class="flex-grow-1 overflow-y-auto" style="height: 450px;">
              <div v-if="messages.length === 0" class="text-center text-grey">
                <v-icon size="64">mdi-robot-happy</v-icon>
                <p class="mt-4">Start a conversation with your AI assistant!</p>
              </div>
              
              <div v-for="message in messages" :key="message.id" class="mb-4">
                <div :class="message.role === 'user' ? 'text-right' : 'text-left'">
                  <v-chip
                    :color="message.role === 'user' ? 'primary' : 'grey'"
                    :class="message.role === 'user' ? 'ml-auto' : 'mr-auto'"
                  >
                    {{ message.role === 'user' ? 'You' : 'AI' }}
                  </v-chip>
                  <div class="mt-2">
                    <template v-if="message.role === 'assistant' && message.content === 'Thinking...'">
                      <v-progress-circular
                        indeterminate
                        size="20"
                        width="2"
                        color="primary"
                      ></v-progress-circular>
                      <span class="ml-2 text-grey">Thinking...</span>
                    </template>
                    <div v-else class="message-content" v-html="formatMessage(message.content)"></div>
                  </div>
                </div>
              </div>
            </v-card-text>
            
            <v-card-actions>
              <v-text-field
                v-model="newMessage"
                label="Type your message..."
                variant="outlined"
                density="compact"
                hide-details
                @keyup.enter="sendMessage"
              >
                <template v-slot:append-inner>
                  <v-btn
                    icon
                    variant="text"
                    @click="sendMessage"
                    :loading="sending"
                  >
                    <v-icon>mdi-send</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-card-actions>
          </v-card>
        </v-col>
        
        <!-- Sidebar -->
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title>Quick Actions</v-card-title>
            <v-card-text>
              <v-alert
                v-if="needsChatflowSetup"
                type="warning"
                variant="tonal"
                class="mb-4"
              >
                <v-alert-title>Setup Required</v-alert-title>
                Configure Flowise chatflow to enable AI chat
              </v-alert>
              
              <v-btn block color="primary" class="mb-2">
                <v-icon start>mdi-file-upload</v-icon>
                Upload Document
              </v-btn>
              <v-btn 
                block 
                variant="outlined" 
                class="mb-2"
                @click="settingsDialog = true"
              >
                <v-icon start>mdi-cog</v-icon>
                Settings
              </v-btn>
            </v-card-text>
          </v-card>
          
          <v-card>
            <v-card-title>Documents</v-card-title>
            <v-card-text>
              <p class="text-grey">No documents uploaded yet.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
    
    <!-- Settings Dialog -->
    <v-dialog v-model="settingsDialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon start>mdi-cog</v-icon>
          Workspace Settings
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveSettings">
            <v-text-field
              v-model="workspaceSettings.name"
              label="Workspace Name"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-text-field>
            
            <v-textarea
              v-model="workspaceSettings.description"
              label="Description"
              variant="outlined"
              density="comfortable"
              rows="2"
              class="mb-4"
            ></v-textarea>
            
            <v-text-field
              v-model="workspaceSettings.flowise_chatflow_id"
              label="Flowise Chatflow ID"
              variant="outlined"
              density="comfortable"
              placeholder="e.g., abc123def-456g-789h-ijkl-mnopqrstuvwx"
              hint="Get this from your Flowise dashboard"
              persistent-hint
            ></v-text-field>
            
            <v-alert type="info" variant="tonal" class="mt-4">
              <v-alert-title>How to get Chatflow ID:</v-alert-title>
              1. Go to your Flowise dashboard<br>
              2. Create or select a chatflow<br>
              3. Copy the ID from the URL or API endpoint
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="settingsDialog = false" variant="text">Cancel</v-btn>
          <v-btn @click="saveSettings" color="primary" :loading="savingSettings">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { flowise } from '@/services/flowise'

const route = useRoute()
const router = useRouter()

// State
const workspace = ref<any>(null)
const loading = ref(true)
const messages = ref<any[]>([])
const newMessage = ref('')
const sending = ref(false)
const sessionId = ref(`session-${Date.now()}`)
const needsChatflowSetup = computed(() => !workspace.value?.flowise_chatflow_id)
const settingsDialog = ref(false)
const savingSettings = ref(false)
const workspaceSettings = ref({
  name: '',
  description: '',
  flowise_chatflow_id: ''
})

// Fetch workspace details
const fetchWorkspace = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', route.params.id)
      .single()
    
    if (error) throw error
    workspace.value = data
    
    // Populate settings
    workspaceSettings.value = {
      name: data.name || '',
      description: data.description || '',
      flowise_chatflow_id: data.flowise_chatflow_id || ''
    }
  } catch (error) {
    console.error('Error fetching workspace:', error)
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
}

// Send message to AI
const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return
  
  // Check if chatflow is configured
  if (!workspace.value?.flowise_chatflow_id) {
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: 'This workspace needs a Flowise chatflow ID configured. Please set up a chatflow in Flowise and update the workspace settings.'
    })
    return
  }
  
  // Add user message
  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: newMessage.value
  }
  messages.value.push(userMessage)
  
  const messageText = newMessage.value
  newMessage.value = ''
  sending.value = true
  
  // Add a placeholder for the assistant's response
  const assistantMessage = {
    id: Date.now() + 1,
    role: 'assistant',
    content: 'Thinking...'
  }
  messages.value.push(assistantMessage)
  
  try {
    // Send to Flowise
    const response = await flowise.sendMessage(
      workspace.value.flowise_chatflow_id,
      messageText,
      sessionId.value
    )
    
    // Find the message in the array and update it properly for Vue reactivity
    const messageIndex = messages.value.findIndex(m => m.id === assistantMessage.id)
    if (messageIndex !== -1) {
      messages.value[messageIndex] = {
        ...messages.value[messageIndex],
        content: response.text
      }
    }
    
    // Save to database (optional)
    await saveMessageToDatabase(userMessage)
    await saveMessageToDatabase(assistantMessage)
    
  } catch (error: any) {
    console.error('Error sending message:', error)
    // Update the error message properly for Vue reactivity
    const messageIndex = messages.value.findIndex(m => m.id === assistantMessage.id)
    if (messageIndex !== -1) {
      messages.value[messageIndex] = {
        ...messages.value[messageIndex],
        content: `Sorry, I encountered an error: ${error.message || 'Failed to send message'}`
      }
    }
  } finally {
    sending.value = false
  }
}

// Save message to database for history
const saveMessageToDatabase = async (message: any) => {
  try {
    await supabase
      .from('chat_messages')
      .insert({
        workspace_id: workspace.value.id,
        role: message.role,
        content: message.content
      })
  } catch (error) {
    console.error('Failed to save message to database:', error)
  }
}

// Save workspace settings
const saveSettings = async () => {
  savingSettings.value = true
  try {
    const { error } = await supabase
      .from('workspaces')
      .update({
        name: workspaceSettings.value.name,
        description: workspaceSettings.value.description,
        flowise_chatflow_id: workspaceSettings.value.flowise_chatflow_id || null
      })
      .eq('id', workspace.value.id)
    
    if (error) throw error
    
    // Update local workspace object
    workspace.value = {
      ...workspace.value,
      ...workspaceSettings.value
    }
    
    settingsDialog.value = false
    
    // Show success message (you could add a snackbar here)
    console.log('Settings saved successfully')
  } catch (error) {
    console.error('Error saving settings:', error)
  } finally {
    savingSettings.value = false
  }
}

// Format message content for better display
const formatMessage = (content: string) => {
  return content
    // Replace double asterisks with bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Replace single asterisks with italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Replace numbered lists
    .replace(/^(\d+)\.\s/gm, '<br><strong>$1.</strong> ')
    // Replace bullet points
    .replace(/^[-*]\s/gm, '<br>• ')
    // Replace double line breaks with paragraph breaks
    .replace(/\n\n/g, '</p><p>')
    // Replace single line breaks with br tags
    .replace(/\n/g, '<br>')
    // Wrap in paragraph tags
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '')
    .replace(/<p><br>/g, '<p>')
}

// Load workspace on mount
onMounted(() => {
  fetchWorkspace()
})
</script>

<style scoped>
.message-content {
  line-height: 1.6;
  word-wrap: break-word;
}

.message-content :deep(p) {
  margin-bottom: 12px;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message-content :deep(strong) {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.message-content :deep(em) {
  font-style: italic;
  color: rgb(var(--v-theme-on-surface));
}

.message-content :deep(br) {
  line-height: 1.2;
}

/* Improve spacing for lists */
.message-content :deep(br + strong) {
  margin-top: 8px;
  display: inline-block;
}
</style>