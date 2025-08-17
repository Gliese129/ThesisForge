import axios from './config'

const baseUrl = '/article'

interface Prompt {
  prompt: string
}

interface Response {
  sections: {
    title: string
    description: string
    expectedWordCount?: number
    note?: string
  }[]
  qaSummary: string
  completed: boolean
}

const GenerateStructureApi = {
  getPrompt: async (data: any): Promise<Prompt> => {
    // filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    )
    return await axios.post(
      `${baseUrl}/generate-structure/get-prompt`,
      filteredData
    )
  },
  updateManually: async (data: string): Promise<Response> => {
    return await axios.post(`${baseUrl}/generate-structure/manual`, {
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
    return await axios.post(`${baseUrl}/generate-structure`, filteredData)
  }
}

const UpdateStructureApi = {
  getPrompt: async (data: any): Promise<Prompt> => {
    // filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    )

    return await axios.post(
      `${baseUrl}/update-structure/get-prompt`,
      filteredData
    )
  },
  updateManually: async (data: string): Promise<Response> => {
    return await axios.post(`${baseUrl}/update-structure/manual`, {
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
    return await axios.post(`${baseUrl}/update-structure`, filteredData)
  }
}

export { GenerateStructureApi, UpdateStructureApi }
