<template>
  <div :class="styles.albumPage">
    <header :class="styles.siteHeader">
      <div :class="styles.logo">MGE</div>
      <nav :class="styles.navigation">
        <a href="#" @click.prevent="currentPage = 'Home'">Home</a>
        <a href="#" @click.prevent="currentPage = 'Search'">Search</a>
        <a href="#" @click.prevent="currentPage = 'LikedSongs'">Liked Songs</a>
        <a href="#" @click.prevent="currentPage = 'Album'">Album</a>
      </nav>
    </header>

    <component 
      :is="currentPage"
      :album="album"
      :tracks="playerStore.playlist"
      :likedIds="likedIds"
      @play-album="playFirst"
      @track-selected="selectTrack"
      @toggle-like="toggleLike"
    >
    </component>

    <FunctionalPlayer />
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { usePlayerStore } from './stores/player';

import Home from './pages/Home.vue';
import Search from './pages/Search.vue';
import LikedSongs from './pages/LikedSongs.vue';
import Album from './pages/Album.vue';
import FunctionalPlayer from './components/Functional_player.vue';
import styles from './App.module.css';


export default {
  components: {
    Home,
    Search,
    LikedSongs,
    Album,
    FunctionalPlayer
  },
  data() {
    return {
      styles: styles,
      currentPage: 'Home', // Default page
      album: { // This will also come from the API in the future
        name: 'Engineer Album',
        artist: 'MGE',
        info: 'This album contains some of the best songs from various artists, blending different genres and styles to create a unique listening experience.',
      },
      likedIds: [] 
    };
  },
  computed: {
    ...mapStores(usePlayerStore)
  },
  async created() {
    // Fetch initial data from our server
    try {
      console.log('Fetching initial data from backend...');
      const response = await fetch('http://localhost:3000/api/home');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Clean data received from backend:', data);
      
      this.playerStore.setPlaylist(data);
      console.log('Playlist set in Pinia store.');
    } catch (error) {
      console.error("Could not fetch data from backend:", error);
    }

    this.loadLikesFromCookie();
  },
  methods: {
    selectTrack(index) {
      this.playerStore.setTrack(this.playerStore.playlist[index]);
    },
    playFirst() {
      if(this.playerStore.playlist.length > 0) {
        this.playerStore.setTrack(this.playerStore.playlist[0]);
      }
    },
    toggleLike(id) {
      const index = this.likedIds.indexOf(id);
      if (index === -1) {
        this.likedIds.push(id);
      } else {
        this.likedIds.splice(index, 1);
      }
      this.saveLikesToCookie();
    },

    saveLikesToCookie() {
      const expires = new Date(Date.now() + 30 * 864e5).toUTCString();
      document.cookie = `track_likes=${JSON.stringify(this.likedIds)}; expires=${expires}; path=/`;
    },

    loadLikesFromCookie() {
      const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('track_likes='));
      
      if (cookie) {
        try {
          this.likedIds = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
        } catch (e) {
          this.likedIds = [];
        }
      }
    }
  }
};
</script>