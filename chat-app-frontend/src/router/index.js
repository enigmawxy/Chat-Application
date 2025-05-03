import { createRouter, createWebHistory } from 'vue-router'
import JoinOrCreateRoom from '../components/JoinOrCreateRoom.vue'
import ChatPage from '../components/ChatPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: JoinOrCreateRoom
    },
    {
      path: '/chat/:roomId?',
      name: 'chat',
      component: ChatPage,
      props: true
    }
  ]
})

export default router 