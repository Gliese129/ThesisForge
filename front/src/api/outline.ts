import type { ArticleOutlineState } from '@/store/outline'
import axios from './config'

let baseUrl = '/article/outline'

interface Prompt {
  prompt: string
}
interface Response {
  additionalQuestions: string[]
  completed: boolean
  suggestions: [string, string][]
}

export default {
  getPrompt: async (data: ArticleOutlineState): Promise<Prompt> => {
    // filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    )
    return await axios.post(`${baseUrl}/generate/get-prompt`, filteredData)
  },
  updateManually: async (data: string): Promise<Response> => {
    return await axios.post(`${baseUrl}/update/manual`, {
      text: data
    })
  },
  update: async (data: ArticleOutlineState): Promise<Response> => {
    // filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    )
    return await axios.post(`${baseUrl}/update`, filteredData)
  }
}
