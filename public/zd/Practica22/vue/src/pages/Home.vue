<template>
  <div class="home-page">
    <h1>Home</h1>
    <p>Welcome to your music app. Here you can find new releases and featured albums.</p>
    <div class="album-grid">
      <AlbumCard v-for="album in albums" :key="album.id" :album="album" />
    </div>
  </div>
</template>

<script>
import AlbumCard from '../components/AlbumCard.vue';

export default {
  name: 'HomePage',
  components: {
    AlbumCard,
  },
  data() {
    return {
      albums: [
        { id: 1, title: 'Engineer Album', artist: 'MGE', cover: '/src/assets/PosterAlbum.webp' },
        // Add more placeholder albums as needed
      ],
    };
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
}
</style>
