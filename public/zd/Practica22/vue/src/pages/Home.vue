




<template>
  <div class="home-page">
    
    <div class="album-grid">
      <AlbumCard v-for="album in albums" :key="album.id" :album="album" />
    </div>

    <h2 class="tracks-title">Recommended Tracks</h2>
    <SongList 
      :tracks="playerStore.playlist" 
      :likedIds="likesStore.likedIds"
      @track-selected="playTrack"
      @toggle-like="toggleLike"
    />
  </div>
</template>









<script>
import { mapStores } from 'pinia';
import { usePlayerStore } from '../stores/player';
import { useLikesStore } from '../stores/likes';
import AlbumCard from '../components/AlbumCard.vue';
import SongList from '../components/SongList.vue';

export default {
  name: 'HomePage',
  components: {
    AlbumCard,
    SongList,
  },
  data() {
    return {
      albums: [
        { id: 1, title: 'Engineer Album', artist: 'MGE', cover: '/src/assets/PosterAlbum.webp' },
        // Add more placeholder albums as needed
      ],
    };
  },
  computed: {
    ...mapStores(usePlayerStore, useLikesStore)
  },
  async mounted() {
    try {
      // Fetch home data
      const response = await fetch('http://localhost:3000/api/home');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();      
      this.playerStore.setPlaylist(data);
    } catch (error) {
      console.error("Could not fetch data from backend:", error);
    }
  },
  methods: {
    playTrack(index) {
      this.playerStore.setTrack(this.playerStore.playlist[index]);
    },
    toggleLike(id) {
      // Find track to save full data
       const track = this.playerStore.playlist.find(t => t.id === id);
       if (track) {
         this.likesStore.toggleLike(track);
       }
    }
  }
};
</script>

<style scoped>
.home-page {
  padding: 20px;
}
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 40px;
}
.tracks-title {
  margin-top: 40px;
}
</style>
