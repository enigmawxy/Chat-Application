<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="p-10 border dark:border-gray-700 w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900">
      <div>
        <img :src="chatIcon" class="w-24 h-24 mx-auto" />
      </div>
      <h1 class="text-2xl font-semibold text-center shadow">
        Join Or Create a Room
      </h1>
      <div>
        <label for="name" class="block font-medium mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="userName"
          v-model="details.userName"
          placeholder="Enter name"
          class="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label for="roomId" class="block font-medium mb-2">
          Room ID / New Room ID
        </label>
        <input
          type="text"
          id="roomId"
          name="roomId"
          v-model="details.roomId"
          placeholder="Enter Room ID"
          class="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div class="flex justify-center gap-8 mt-4">
        <button
          @click="joinRoom"
          class="px-3 py-2 cursor-pointer rounded-lg dark:bg-blue-500 hover:dark:bg-blue-800"
        >
          Join Room
        </button>
        <button
          @click="createRoom"
          class="px-3 py-2 cursor-pointer rounded-lg dark:bg-green-500 hover:dark:bg-green-800"
        >
          Create Room
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import chatIcon from '../assets/chat.png'
import { createRoomService, joinRoomService } from '../services/RoomService'
import { useChatStore } from '../stores/chat'

const router = useRouter()
const toast = useToast()
const chatStore = useChatStore()

const details = ref({
  userName: '',
  roomId: ''
})

async function joinRoom() {
  if (validateInput()) {
    try {
      const response = await joinRoomService(details.value.roomId)
      toast.success('Joined room successfully!!')

      chatStore.setRoomId(response.roomId)
      chatStore.setCurrentUser(details.value.userName)
      chatStore.setConnected(true)

      router.push({ name: 'chat', params: { roomId: response.roomId } })
    } catch (error) {
      if (error.status === 400) {
        toast.error('Room does not exist')
      } else {
        toast.error('Failed to join room')
      }
    }
  }
}

async function createRoom() {
  if (validateInput()) {
    try {
      const response = await createRoomService(details.value.roomId)
      toast.success('Room created successfully!!')

      chatStore.setRoomId(response.roomId)
      chatStore.setCurrentUser(details.value.userName)
      chatStore.setConnected(true)

      router.push({ name: 'chat', params: { roomId: response.roomId } })
    } catch (error) {
      if (error.status === 400) {
        toast.error('Room already exists')
      } else {
        toast.error('Unable to create room')
      }
    }
  }
}

function validateInput() {
  if (details.value.roomId === '' || details.value.userName === '') {
    toast.error('Invalid input')
    return false
  }
  return true
}
</script> 