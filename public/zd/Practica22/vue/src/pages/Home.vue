<template>
  
  <div :class="styles.homePage">
    <!-- Hero Grid: Unified Grid for Functional Items & Albums relative to viewport -->
    <div :class="styles.gridContainer">
        <!-- 1. Search -->
        <RouterLink to="/search" :class="[styles.heroCard, styles.search]">
            <div :class="styles.heroIconBox">
                <span :class="styles.heroIcon">🔍</span>
            </div>
            <span :class="styles.heroText">Поиск</span>
        </RouterLink>
        
        <!-- 2. Liked Songs -->
        <RouterLink to="/liked" :class="[styles.heroCard, styles.liked]">
            <div :class="[styles.heroIconBox, styles.gradientPurple]">
                <span :class="styles.heroIcon">❤️</span>
            </div>
            <span :class="styles.heroText">Любимые треки</span>
        </RouterLink>

        <!-- 3. Create Playlist -->
        <div :class="[styles.heroCard, styles.create]">
            <div :class="[styles.heroIconBox, styles.gradientGrey]">
                <span :class="styles.heroIcon">➕</span>
            </div>
            <span :class="styles.heroText">Создать</span>
        </div>

        <!-- 4+. Albums -->
         <RouterLink 
            v-for="album in heroAlbums" 
            :key="'hero-'+(album.id || album.idStr)" 
            :to="'/album/' + (album.idStr || album.id)" 
            :class="styles.heroCard"
         >
            <img :src="album.cover || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='" :class="styles.heroImage" />
            <span :class="styles.heroText">{{ album.title }}</span>
         </RouterLink>
    </div>


    <!-- Section 2: Favorite Artists -->
    <HorizontalScroller title="Любимые артисты">
      <div v-for="artist in favoriteArtists" :key="artist.name" :class="styles.artistCard">
        <img :src="artist.image" :alt="artist.name" :class="styles.artistImage" />
        <p :class="styles.artistName">{{ artist.name }}</p>
      </div>
    </HorizontalScroller>


    <!-- Section 3: Recently Played -->
    <HorizontalScroller title="Недавно прослушано" v-if="playerStore.history.length > 0">
      <div 
        v-for="track in playerStore.history" 
        :key="'hist-'+track.id" 
        :class="styles.trackCard"
        @click="playHistoryTrack(track)"
      >
         <img :src="track.thumbnail" :class="styles.trackThumb" />
         <p :class="styles.trackTitle">{{ track.title }}</p>
         <p :class="styles.trackArtist">{{ track.artists }}</p>
      </div>
    </HorizontalScroller>


    <!-- Section 4: Popular Tracks (Vertical List) -->
    <h2 :class="styles.sectionTitle">Популярные треки</h2>
    <div :class="styles.trackListContainer">
       <table :class="styles.trackTable">
         <tbody>
           <!-- v-for loop matching user request -->
           <tr 
             v-for="(track, index) in playerStore.playlist" 
             :key="'rec-'+track.id" 
             :class="styles.trackRow"
             @click="playTrack(track)"
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
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { usePlayerStore } from '../stores/player';
import { useLikesStore } from '../stores/likes';
import AlbumCard from '../components/AlbumCard.vue';
import HorizontalScroller from '../components/HorizontalScroller.vue';
import Audio_Track from '../components/Audio_Track.vue';
import styles from './Home.module.css';

export default {
  name: 'HomePage',
  components: {
    AlbumCard,
    HorizontalScroller,
    Audio_Track
  },
  data() {
    return {
      styles,
      albums: [
        { id: 1, idStr: 'MPREb_Example1', title: 'Top Hits', artist: 'Various', cover: '' },
        { id: 2, idStr: 'MPREb_Example2', title: 'Chill Vibes', artist: 'Lo-Fi Girl', cover: '' },
        { id: 3, idStr: 'MPREb_Example3', title: 'Rock Classics', artist: 'Queen, etc.', cover: '' },
        { id: 4, idStr: 'MPREb_Example4', title: 'Jazz Club', artist: 'Miles Davis', cover: '' },
        { id: 5, idStr: 'MPREb_Example5', title: 'Pop Mix', artist: 'Dua Lipa', cover: '' },
        { id: 6, idStr: 'MPREb_Example6', title: 'Workout', artist: 'Gym', cover: '' },
      ],
      favoriteArtists: []
    };
  },
  computed: {
    ...mapStores(usePlayerStore, useLikesStore),
    heroAlbums() {
        const liked = this.likesStore.getLikedAlbums;
        if (liked && liked.length > 0) return liked;
        return this.albums; // Fallback to defaults
    }
  },
  async mounted() {
    try {
      // Fetch home data for popular tracks
      const response = await fetch('http://localhost:3000/api/home');
      if (response.ok) {
         const data = await response.json();      
         this.playerStore.setPlaylist(data);
      }
    } catch (error) {
      console.error("Could not fetch data from backend:", error);
    }
  },
  methods: {
    playTrack(track) {
      this.playerStore.setTrack(track);
    },
    toggleLike(id) {
       // Need full track object really, but we can find it in playlist
       // Actually toggleLike in store expects object.
       // The event from Audio_Track emits ID (based on file read).
       // Wait, step 228 shows: @click.stop="$emit('toggleLike', track.id)"
       // So I need to find the track by ID.
       const track = this.playerStore.playlist.find(t => t.id === id);
       if(track) {
           this.likesStore.toggleLike(track);
       }
    },
    playHistoryTrack(track) {
       this.playerStore.setTrack(track);
    }
  }
};
</script>
