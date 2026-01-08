<template>
  <div class="home-page">
    <h1>Home</h1>
    <p>Welcome to your music app. Here you can find new releases and featured albums.</p>
    
    <h2>Albums</h2>
    <div class="album-grid">
      <AlbumCard v-for="album in albums" :key="album.id" :album="album" />
    </div>

    <h2 class="tracks-title">Recommended Tracks</h2>
    <SongList 
      :tracks="tracks" 
      :likedIds="likedIds"
      @track-selected="$emit('track-selected', $event)"
      @toggle-like="$emit('toggle-like', $event)"
    />
  </div>
</template>

<script>
import AlbumCard from '../components/AlbumCard.vue';
import SongList from '../components/SongList.vue';

export default {
  name: 'HomePage',
  components: {
    AlbumCard,
    SongList,
  },
  props: ['tracks', 'likedIds'],
  data() {
    return {
      albums: [
        { id: 1, title: 'Engineer Album', artist: 'MGE', cover: '/src/assets/PosterAlbum.webp' },
        // Add more placeholder albums as needed
      ],
    };
  },
  mounted() {
    console.log('Home.vue mounted. Tracks received:', this.tracks);
  },
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
