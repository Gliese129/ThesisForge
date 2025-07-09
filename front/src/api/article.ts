import type { ArticleOutlineState } from '@/store/outline'
import axios from './config'

const getOutlinePrompt = async (
  data: ArticleOutlineState
): Promise<{
  [key: string]: any
}> => {
  // filter out undefined values
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ''
    )
  )
  return await axios.post('/article/outline/get-prompt', filteredData)
}

const updateOutlineManually = async (
  data: string
): Promise<{
  [key: string]: any
}> => {
  return await axios.post('/article/outline/update/manual', {
    text: data
  })
}

const updateOutline = async (data: ArticleOutlineState) => {
  // filter out undefined values
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ''
    )
  )
  return await axios.post('/article/outline/update', filteredData)
}

const generateStructure = async (data: ArticleOutlineState) => {
  // filter out undefined values
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ''
    )
  )
  return await axios.post('/article/outline/generate', filteredData)
}

export default {
  getOutlinePrompt,
  updateOutline,
  updateOutlineManually,
  generateStructure
}
