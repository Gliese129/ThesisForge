import axios from './config'

const baseUrl = '/article'

// Types returned by backend
interface Prompt {
  prompt: string
}

interface ContentResponse {
  text: string
  summary: string
}

const GenerateContentApi = {
  // Build content prompt from outline/sections
  getPrompt: async (data: any): Promise<Prompt> => {
    // filter out undefined/null/empty values (keep payload clean)
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    )
    return await axios.post(
      `${baseUrl}/generate-content/get-prompt`,
      filteredData
    )
  },
  // Parse AI response manually to content + summary
  generateManually: async (text: string): Promise<ContentResponse> => {
    return await axios.post(`${baseUrl}/generate-content/manual`, { text })
  },
  // Ask backend to generate content for a section
  generate: async (data: any): Promise<ContentResponse> => {
    // filter out undefined/null/empty values (keep payload clean)
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    )
    return await axios.post(`${baseUrl}/generate-content`, filteredData)
  }
}

export { GenerateContentApi }
