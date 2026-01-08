<template>
  <main>
    <section :class="styles.hero">
      <div :class="styles.heroBackground"></div>
      <div :class="styles.heroGradientOverlay"></div>
      
      <div :class="styles.heroContentOverlay">
        <div :class="styles.albumHeaderContent">
          <div :class="styles.leftContent">
            <div :class="styles.coverWrapper">
              <img 
                src="@/assets/PosterAlbum.webp" 
                alt="Cover" 
                :class="styles.albumIcon" 
                fetchpriority="high"
                loading="eager"
              />
            </div>
            
            <div :class="styles.textInfo">
              <span v-if="album.artist" :class="styles.subTitle">Альбом • {{ album.artist }}</span>
              <h1 :class="styles.albumName">{{ album.name || 'Скрытая личность' }}</h1>
              <p v-if="album.info" :class="styles.description">{{ album.info }}</p>
            </div>
          </div>

          <div :class="styles.rightContent">
            <div :class="styles.actions">
              <button :class="styles.playPill" @click="$emit('play-album')">PLAY</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <SongList 
      :tracks="tracks"
      :likedIds="likedIds"
      @track-selected="$emit('track-selected', $event)"
      @toggle-like="$emit('toggle-like', $event)"
    />
  </main>
</template>

<script>
import SongList from '../components/SongList.vue';
import styles from './Album.module.css';

export default {
  name: 'AlbumPage',
  components: {
    SongList,
  },
  props: ['album', 'tracks', 'likedIds'],
  data() {
    return {
      styles: styles
    }
  }
};
</script>
