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
      :tracks="tracks"
      :likedIds="likedIds"
      @play-album="playFirst"
      @track-selected="setActive"
      @toggle-like="toggleLike"
    >
    </component>

    <FunctionalPlayer :track="activeTrack" @playNext="playNext" @playPrev="playPrev" />
  </div>
</template>

<script>
import Home from './pages/Home.vue';
import Search from './pages/Search.vue';
import LikedSongs from './pages/LikedSongs.vue';
import Album from './pages/Album.vue';
import FunctionalPlayer from './components/Functional_player.vue';
import styles from './App.module.css';

const rawTracks = import.meta.glob("@/assets/*.mp3", { eager: true });

export default {
  components: {
    Home,
    Search,
    LikedSongs,
    Album,
    FunctionalPlayer
  },
  data() {
    const autor = 'MGE';
    const preparedTracks = Object.entries(rawTracks).map(([path, module]) => {
      const filename = path.split('/').pop().replace(/\.mp3$/, '');
      return { 
        id: path, 
        title: filename,
        artist: autor,
        audio: module.default,
        duration: '--:--', 
        active: false
      };
    });

    return {
      styles: styles,
      currentPage: 'Album', // Default page
      album: {
        name: 'Engineer Album',
        artist: autor,
        info: 'This album contains some of the best songs from various artists, blending different genres and styles to create a unique listening experience.',
      },
      tracks: preparedTracks,
      likedIds: [] 
    };
  },
  computed: {
    activeTrack() {
      return this.tracks.find(track => track.active);
    }
  },
  mounted() {
    this.loadLikesFromCookie();
  },

  methods: {
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
    },

    setActive(index) {
      if (index < 0) index = this.tracks.length - 1;
      if (index >= this.tracks.length) index = 0;

      this.tracks.forEach((t, i) => {
        t.active = (i === index);
      });
    },

    playNext() {
      const currentIndex = this.tracks.findIndex(t => t.active);
      if (currentIndex !== -1) {
        this.setActive(currentIndex + 1);
      }
    },

    playPrev() {
      const currentIndex = this.tracks.findIndex(t => t.active);
      if (currentIndex !== -1) {
        this.setActive(currentIndex - 1);
      }
    },

    playFirst() {
      const hasActive = this.tracks.some(t => t.active);
      if (!hasActive) {
        this.setActive(0);
      }
    }
  }
};
</script>