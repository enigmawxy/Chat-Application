import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    roomId: '',
    currentUser: '',
    connected: false,
    messages: [],
    users: []
  }),
  actions: {
    setRoomId(id) {
      this.roomId = id
    },
    setCurrentUser(user) {
      this.currentUser = user
    },
    setConnected(status) {
      this.connected = status
    },
    addMessage(message) {
      this.messages.push(message)
    },
    setUsers(users) {
      this.users = users
    }
  }
}) 