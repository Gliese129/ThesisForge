import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
  timeout: 100000
})

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    // You can modify the request config here if needed
    return config
  },
  (error) => {
    // Handle the error before the request is sent
    console.error('Request error: ', error)
    return Promise.reject(error)
  }
)

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    // You can modify the response data here if needed
    return response.data
  },
  (error) => {
    // Handle the error response
    console.error('Response error: ', error)
    return Promise.reject(error)
  }
)

export default instance
