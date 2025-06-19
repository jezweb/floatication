interface FlowiseMessage {
  question: string
  overrideConfig?: {
    sessionId?: string
    [key: string]: any
  }
}

interface FlowiseResponse {
  text: string
  question: string
  chatId?: string
  chatMessageId?: string
  sessionId?: string
  [key: string]: any
}

class FlowiseService {
  private apiUrl: string
  private apiKey: string

  constructor() {
    this.apiUrl = import.meta.env.VITE_FLOWISE_API_URL
    this.apiKey = import.meta.env.VITE_FLOWISE_API_KEY

    if (!this.apiUrl || !this.apiKey) {
      console.warn('Flowise API credentials not configured')
    }
  }

  async sendMessage(
    chatflowId: string,
    message: string,
    sessionId?: string
  ): Promise<FlowiseResponse> {
    const url = `${this.apiUrl}/api/v1/prediction/${chatflowId}`
    
    const body: FlowiseMessage = {
      question: message,
      overrideConfig: {
        sessionId: sessionId || `session-${Date.now()}`
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`Flowise API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Flowise API error:', error)
      throw error
    }
  }

  // Stream messages for real-time responses
  async streamMessage(
    chatflowId: string,
    message: string,
    sessionId?: string,
    onMessage?: (chunk: string) => void
  ): Promise<void> {
    const url = `${this.apiUrl}/api/v1/prediction/${chatflowId}`
    
    const body: FlowiseMessage = {
      question: message,
      overrideConfig: {
        sessionId: sessionId || `session-${Date.now()}`
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`Flowise API error: ${response.status} ${response.statusText}`)
      }

      // Check if response is streaming
      const reader = response.body?.getReader()
      if (!reader) {
        // Fallback to non-streaming response
        const data = await response.json()
        onMessage?.(data.text)
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        
        // Process complete chunks
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return
            
            try {
              const parsed = JSON.parse(data)
              onMessage?.(parsed.token || parsed.text || '')
            } catch (e) {
              // Not JSON, might be plain text
              onMessage?.(data)
            }
          }
        }
      }
    } catch (error) {
      console.error('Flowise streaming error:', error)
      throw error
    }
  }

  // Get available chatflows (if your Flowise instance supports it)
  async getChatflows(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/chatflows`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch chatflows: ${response.status}`)
      }

      const data = await response.json()
      return data.chatflows || []
    } catch (error) {
      console.error('Failed to fetch chatflows:', error)
      return []
    }
  }
}

export const flowise = new FlowiseService()