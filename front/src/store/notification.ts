interface Notification {
  text: string
  color: string
  timeout: number
}

export interface NotificationState {
  data: Notification[]
}

export const Notification = {
  namespaced: true,
  state: () =>
    ({
      data: [] as Notification[]
    }) as NotificationState,
  mutations: {
    setMessages(
      state: NotificationState,
      payload: Partial<NotificationState>[]
    ) {
      state.data = payload as any
    },
    clearMessages(state: NotificationState) {
      state.data = []
    },
    info(state: NotificationState, text: string) {
      state.data.push({
        text,
        color: 'info',
        timeout: 3000
      })
    },
    success(state: NotificationState, text: string) {
      state.data.push({
        text,
        color: 'success',
        timeout: 1500
      })
    },
    warning(state: NotificationState, text: string) {
      state.data.push({
        text,
        color: 'warning',
        timeout: 3000
      })
    },
    error(state: NotificationState, text: string) {
      state.data.push({
        text,
        color: 'error',
        timeout: 3000
      })
    }
  }
}
