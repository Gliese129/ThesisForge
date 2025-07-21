import axios from './config'

const baseUrl = '/article/structure'

interface Prompt {
  prompt: string
}

interface Response {
  sections: {
    id: number
    title: string
    description: string
    expectedWordCount?: number
  }[]
  summary: string
}

const GenerateStructureApi = {
  getPrompt: async (data: any): Promise<Prompt> => {
    // filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    )
    return await axios.post(`${baseUrl}/generate/get-prompt`, filteredData)
  },
  updateManually: async (data: string): Promise<Response> => {
    return await axios.post(`${baseUrl}/generate/manual`, {
      text: data
    })
  },
  update: async (data: any): Promise<Response> => {
    // filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    )
    return await axios.post(`${baseUrl}/generate`, filteredData)
  }
}

export { GenerateStructureApi }
