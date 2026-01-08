<template>
  <div :class="styles.songListContainer">
    <table :class="styles.tracklist">
      <thead>
        <tr>
          <th :class="styles.colNum">#</th>
          <th :class="styles.colName">НАЗВАНИЕ</th>
          <th :class="styles.colAlb">АЛЬБОМ</th>
          <th :class="styles.colTime">🕒</th>
          <th :class="styles.colFav"></th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(track, index) in tracks" 
          :key="track.id" 
          :class="[styles.trackRow, track.active ? styles.activeRow : '']" 
          @click="$emit('track-selected', index)"
        >
          <Audio_Track 
            :track="track"
            :index="index"
            :likedIds="likedIds"
            @toggleLike="$emit('toggle-like', track.id)"
          /> 
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import styles from './SongList.module.css';
import Audio_Track from './Audio_Track.vue';

export default {
  name: 'SongList',
  components: {
    Audio_Track
  },
  props: {
    tracks: {
      type: Array,
      required: true,
    },
    likedIds: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      styles: styles
    }
  }
}
</script>
