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
                {{ displayedTracks.length }} {{ pluralize(displayedTracks.length, 'трек', 'трека', 'треков') }}
              </p>
            </div>
          </div>

          <div :class="styles.rightContent">
            <div :class="styles.actions">
              <button 
                v-if="displayedTracks.length > 0" 
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

    <div v-if="displayedTracks.length > 0" :class="styles.trackListContainer">
       <table :class="styles.trackTable">
         <tbody>
           <tr 
             v-for="(track, index) in displayedTracks" 
             :key="track.id" 
             :class="styles.trackRow"
             @click="playTrack(index)"
           >
             <Audio_Track 
               :track="track"
               :index="index"
               :likedIds="likesStore.likedIds"
               @toggleLike="toggleLike"
             />
           </tr>
         </tbody>
       </table>
    </div>

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
import { useLikesStore } from '../stores/likes';
import Audio_Track from '../components/Audio_Track.vue';
import styles from './LikedSongs.module.css';

export default {
  name: 'LikedSongsPage',
  components: {
    Audio_Track
  },
  data() {
    return {
      styles: styles
    };
  },
  computed: {
    ...mapStores(usePlayerStore, useLikesStore),
    
    displayedTracks() {
      return this.likesStore.getLikedTracks;
    }
  },
  methods: {
    playTrack(index) {
      // Update playlist context to liked songs
      this.playerStore.setPlaylist(this.displayedTracks);
      // Play the selected track
      const track = this.displayedTracks[index];
      if (track) {
        this.playerStore.setTrack(track);
      }
    },

    playAll() {
      if (this.displayedTracks.length > 0) {
        this.playTrack(0);
      }
    },

    toggleLike(trackId) {
      // We need the track object to toggle like properly if it's adding (but here we are removing usually)
      // If we are in LikedSongs, we definitely have the track data in store
      const track = this.displayedTracks.find(t => t.id === trackId);
      if (track) {
        this.likesStore.toggleLike(track);
      }
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
