<template>
  <main>
    <section :class="styles.hero">
      <div :class="styles.heroBackground"></div>
      <div :class="styles.heroGradientOverlay"></div>
      
      <div :class="styles.heroContentOverlay">
        <div :class="styles.albumHeaderContent">
          <div :class="styles.leftContent">
            <div :class="styles.coverWrapper">
              <div :class="styles.heartIcon">❤️</div>
            </div>
            
            <div :class="styles.textInfo">
              <span :class="styles.subTitle">Плейлист</span>
              <h1 :class="styles.albumName">My Favorites</h1>
              <p :class="styles.description">
                {{ likedTracks.length }} {{ pluralize(likedTracks.length, 'трек', 'трека', 'треков') }}
              </p>
            </div>
          </div>

          <div :class="styles.rightContent">
            <div :class="styles.actions">
              <button 
                v-if="likedTracks.length > 0" 
                :class="styles.playPill" 
                @click="playAll"
              >
                PLAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <SongList 
      v-if="likedTracks.length > 0"
      :tracks="likedTracks"
      :likedIds="localLikedIds"
      @track-selected="playTrack"
      @toggle-like="toggleLike"
    />

    <div v-else :class="styles.emptyState">
      <h2>Нет избранных треков</h2>
      <p>Лайкните треки, чтобы они появились здесь</p>
      <a href="#" @click.prevent="$router.push('/search')">Перейти к поиску</a>
    </div>
  </main>
</template>

<script>
import { mapStores } from 'pinia';
import { usePlayerStore } from '../stores/player';
import SongList from '../components/SongList.vue';
import styles from './LikedSongs.module.css';

export default {
  name: 'LikedSongsPage',
  components: {
    SongList,
  },
  props: {
    album: Object,
    tracks: Array,
    likedIds: Array
  },
  data() {
    return {
      styles: styles
    };
  },
  computed: {
    ...mapStores(usePlayerStore),
    
    // Get liked track IDs from props (which come from App.vue cookies)
    localLikedIds() {
      return this.likedIds || [];
    },
    
    // Filter tracks from player store playlist that are liked
    likedTracks() {
      if (!this.playerStore.playlist || this.playerStore.playlist.length === 0) {
        return [];
      }
      
      return this.playerStore.playlist.filter(track => 
        this.localLikedIds.includes(track.id)
      );
    }
  },
  methods: {
    playTrack(index) {
      const track = this.likedTracks[index];
      if (track) {
        this.playerStore.setTrack(track);
      }
    },

    playAll() {
      if (this.likedTracks.length > 0) {
        this.playerStore.setTrack(this.likedTracks[0]);
      }
    },

    toggleLike(trackId) {
      // Emit to parent (App.vue) to handle cookie update
      this.$emit('toggle-like', trackId);
    },

    pluralize(count, one, few, many) {
      const mod10 = count % 10;
      const mod100 = count % 100;
      
      if (mod10 === 1 && mod100 !== 11) {
        return one;
      } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return few;
      } else {
        return many;
      }
    }
  }
};
</script>
