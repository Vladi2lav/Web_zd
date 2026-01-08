<template>
  <div class="liked-songs-page">
    <h1>Liked Songs</h1>
    <SongList :tracks="likedTracks" />
  </div>
</template>

<script>
import SongList from '../components/SongList.vue';

export default {
  name: 'LikedSongsPage',
  components: {
    SongList,
  },
  data() {
    return {
      // This would typically come from a global store or be passed as props
      likedTracks: [], 
    };
  },
};
</script>

<style scoped>
.liked-songs-page {
  padding: 20px;
}
</style>
