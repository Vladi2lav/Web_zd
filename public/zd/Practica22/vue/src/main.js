import './assets/main.css'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Home from './pages/Home.vue'
import Search from './pages/Search.vue'
import LikedSongs from './pages/LikedSongs.vue'
import Album from './pages/Album.vue'

const pinia = createPinia()
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/search',
      name: 'search',
      component: Search
    },
    {
      path: '/liked-songs',
      name: 'liked-songs',
      component: LikedSongs
    },
    {
      path: '/album/:id',
      name: 'album',
      component: Album
    }
  ]
})

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
