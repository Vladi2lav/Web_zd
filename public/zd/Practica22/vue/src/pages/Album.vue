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
              <button :class="styles.playPill" @click="playAlbum">PLAY</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <SongList 
      :tracks="playerStore.playlist"
      :likedIds="likesStore.likedIds"
      @track-selected="playTrack"
      @toggle-like="toggleLike"
    />
  </main>
</template>

<script>
import { mapStores } from 'pinia';
import { usePlayerStore } from '../stores/player';
import { useLikesStore } from '../stores/likes';
import SongList from '../components/SongList.vue';
import styles from './Album.module.css';

export default {
  name: 'AlbumPage',
  components: {
    SongList,
  },
  data() {
    return {
      styles: styles,
      album: {
        name: 'Engineer Album',
        artist: 'MGE',
        info: 'This album contains some of the best songs from various artists, blending different genres and styles to create a unique listening experience.',
      }
    }
  },
  computed: {
    ...mapStores(usePlayerStore, useLikesStore)
  },
  async mounted() {
    // If playlist is empty (e.g. reload on this page), fetch default data
    if (this.playerStore.playlist.length === 0) {
      try {
        const response = await fetch('http://localhost:3000/api/home');
        if (response.ok) {
          const data = await response.json();      
          this.playerStore.setPlaylist(data);
        }
      } catch (error) {
        console.error("Could not fetch data:", error);
      }
    }
  },
  methods: {
    playAlbum() {
       if (this.playerStore.playlist.length > 0) {
         this.playerStore.setTrack(this.playerStore.playlist[0]);
       }
    },
    playTrack(index) {
       this.playerStore.setTrack(this.playerStore.playlist[index]);
    },
    toggleLike(id) {
       const track = this.playerStore.playlist.find(t => t.id === id);
       if (track) this.likesStore.toggleLike(track);
    }
  }
};
</script>
