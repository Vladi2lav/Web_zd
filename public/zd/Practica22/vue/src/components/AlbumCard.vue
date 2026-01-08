<template>
  <div :class="styles.albumCard">
    <img :src="album.cover" :alt="album.title" />
    <div :class="styles.albumInfo">
      <p :class="styles.albumTitle">{{ album.title }}</p>
      <p :class="styles.albumArtist">{{ album.artist }}</p>
    </div>
  </div>
</template>

<script>
import styles from './AlbumCard.module.css';
export default {
  name: 'AlbumCard',
  props: ['album'],
  data() {
    return {
      styles
    }
  }
};
</script>
