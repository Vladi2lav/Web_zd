<template>
  <td :class="styles.colNum">
    <span v-if="isActive" :class="styles.playingIcon">▶️</span>
    <span v-else>{{ index + 1 }}</span>
  </td>

  <td :class="styles.colName">
    <div :class="styles.trackMeta">
      <img 
        v-if="track.thumbnail" 
        :src="track.thumbnail" 
        :alt="track.title" 
        :class="styles.trackThumbnail"
      />
      <div :class="styles.trackInfo">
        <span :class="[styles.tName, isActive ? styles.greenText : '']">{{ track.title }}</span>
        <span :class="styles.tArtist">
           {{ Array.isArray(track.artists) ? track.artists.map(a => a.name).join(', ') : track.artists }}
        </span>
      </div>
    </div>
  </td>

  <td :class="styles.colAlb">Best Album</td>
  <td :class="styles.colTime">{{ track.duration || '2:30' }}</td>
  
  <td :class="styles.colFav">
    <span :class="styles.heartIcon" @click.stop="$emit('toggleLike', track.id)">
      {{ likedIds.includes(track.id) ? '❤️' : '🤍' }}
    </span>
  </td>
</template>
<script>
import { mapStores } from 'pinia';
import { usePlayerStore } from '../stores/player';
import styles from './Audio_Track.module.css';

export default {
  name: 'Audio_Track',
  props: ['track', 'index', 'likedIds'],
  emits: ['toggleLike'],
  data() {
    return {
      styles: styles
    }
  },
  computed: {
    ...mapStores(usePlayerStore),
    isActive() {
      // Check if this track is the currently playing one in the store
      return this.playerStore.currentTrack && this.playerStore.currentTrack.id === this.track.id;
    }
  }
}
</script>
