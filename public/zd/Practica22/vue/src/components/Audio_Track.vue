<template>
  <td :class="styles.colNum">
    <span v-if="track.active" :class="styles.playingIcon">▶️</span>
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
        <span :class="[styles.tName, track.active ? styles.greenText : '']">{{ track.title }}</span>
        <span :class="styles.tArtist">{{ track.artists?.join(', ') || 'Unknown Artist' }}</span>
      </div>
    </div>
  </td>

  <td :class="styles.colAlb">Best Album</td>
  <td :class="styles.colTime">{{ track.duration }}</td>
  
  <td :class="styles.colFav">
    <span :class="styles.heartIcon" @click.stop="$emit('toggleLike', track.id)">
      {{ likedIds.includes(track.id) ? '❤️' : '🤍' }}
    </span>
  </td>
</template>
<script>
import styles from './Audio_Track.module.css';

export default {
  name: 'Audio_Track',
  props: ['track', 'index', 'likedIds'],
  emits: ['toggleLike'],
  data() {
    return {
      styles: styles
    }
  }
}

</script>
