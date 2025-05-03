<template>
  <div>
    <!-- the header -->
    <header class="dark:bg-gray-700 fixed w-full h-20 py-5 shadow items-center flex justify-around">
      <div>
        <h1 class="text-xl font-semibold">
          Room Name:<span> {{ roomId }}</span>
        </h1>
      </div>
      <div>
        <h1 class="text-xl font-semibold">
          Username: <span>{{ currentUser }}</span>
        </h1>
      </div>
      <div>
        <button
          @click="handleLogout"
          class="rounded-lg dark:bg-red-500 hover:dark:bg-red-700 px-3 py-2 cursor-pointer"
        >
          Leave Room
        </button>
      </div>
    </header>

    <!-- the message container -->
    <main
      ref="chatBoxRef"
      class="py-20 px-10 h-screen w-2/3 mx-auto dark:bg-slate-600 overflow-auto"
    >
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="`flex ${
          message.sender === currentUser ? 'justify-end' : 'justify-start'
        }`"
      >
        <div
          :class="`my-3 ${
            message.sender === currentUser ? 'bg-green-600' : 'bg-gray-800'
          } max-w-xs p-2 rounded-lg`"
        >
          <div class="flex flex-row gap-2">
            <img
              class="h-10 w-10 gap-2"
              :src="getAvatar(message.sender)"
              alt="icon"
            />
            <div class="flex flex-col gap-1">
              <p class="font-sm font-bold">{{ message.sender }}</p>
              <p>{{ message.content }}</p>
              <p class="text-xs text-gray-300">
                {{ timeAgo(message.timeStamp) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- the icons -->
    <div class="py-2 dark:bg-gray-700 fixed bottom-0 w-full h-16">
      <div class="gap-4 flex items-center justify-between h-full w-2/3 mx-auto">
        <input
          v-model="input"
          @keydown.enter="sendMessage"
          type="text"
          placeholder="Send a message..."
          class="h-full w-full px-5 py-3 border-2 rounded-full dark:bg-gray-950 dark:border-gray-500 focus:outline-none"
        />
        <div class="flex gap-4">
          <button class="dark:bg-purple-600 dark:hover:bg-purple-700 cursor-pointer h-10 w-10 flex justify-center items-center rounded-full">
            <!-- <i class="material-icons">attach_file</i> -->
            <IconPaperclip  />
          </button>
          <button
            @click="sendMessage"
            class="dark:bg-green-600 dark:hover:bg-green-700 cursor-pointer h-10 w-10 flex justify-center items-center rounded-full"
          >
            <!-- <i class="material-icons">send</i> -->
            <IconDeviceMobileMessage  />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { AvatarGenerator } from 'random-avatar-generator'
import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'
import { getRoomMessages } from '../services/RoomService'
import { baseURL } from '../config/AxiosHelper'
import { timeAgo } from '../config/helper'
import { IconPaperclip ,IconDeviceMobileMessage  } from '@tabler/icons-vue'
const router = useRouter()
const chatStore = useChatStore()
const generator = new AvatarGenerator()

const input = ref('')
const chatBoxRef = ref(null)
const stompClient = ref(null)
const messages = ref([])
const avatarsRef = ref(new Map())

const { roomId, currentUser, connected } = chatStore

// Function to get or generate an avatar
const getAvatar = (sender) => {
  if (!avatarsRef.value.has(sender)) {
    avatarsRef.value.set(sender, generator.generateRandomAvatar())
  }
  return avatarsRef.value.get(sender)
}

// Scroll to bottom of message container
watch(messages, () => {
  if (chatBoxRef.value) {
    chatBoxRef.value.scroll({
      top: chatBoxRef.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}, { deep: true })

// Setup connection using SockJS and use it for communication via STOMP protocol
onMounted(() => {
  if (!connected) {
    router.push('/')
    return
  }

  const connectWebSocket = () => {
    const socket = new SockJS(`${baseURL}/chat`)
    const client = Stomp.over(socket)

    client.connect({}, () => {
      stompClient.value = client

      client.subscribe(`/topic/room/${roomId}`, (message) => {
        console.log(message)
        const newMessage = JSON.parse(message.body)
        messages.value.push(newMessage)
      })
    })
  }

  if (connected) {
    connectWebSocket()
    loadMessages()
  }
})

// Function to load previous messages of a room
async function loadMessages() {
  try {
    const roomMessages = await getRoomMessages(roomId)
    messages.value = roomMessages
  } catch (error) {
    console.log(error)
  }
}

// Function to send messages
async function sendMessage() {
  if (stompClient.value && connected && input.value.trim()) {
    const newMessage = {
      sender: currentUser,
      content: input.value,
      roomId: roomId
    }

    stompClient.value.send(
      `/app/sendMessage/${roomId}`,
      {},
      JSON.stringify(newMessage)
    )

    input.value = ''
  }
}

// Function to handle logout event
const handleLogout = () => {
  if (stompClient.value) {
    stompClient.value.disconnect()
  }
  chatStore.setConnected(false)
  chatStore.setRoomId('')
  chatStore.setCurrentUser('')
  router.push('/')
}
</script> 