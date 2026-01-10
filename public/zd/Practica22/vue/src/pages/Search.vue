<template>
  <div :class="styles.searchPage">
    <!-- Search Bar -->
    <div :class="styles.searchBarContainer">
      <input 
        v-model="query" 
        @input="onInput"
        :class="styles.searchInput"
        placeholder="Что хочешь послушать?"
        type="text"
      />
    </div>

    <!-- Results -->
    <div :class="styles.resultsContainer" v-if="hasResults">
      
      <!-- Artists Section (Top 5) -->
      <div v-if="artists.length > 0" :class="styles.section">
        <h2 :class="styles.sectionTitle">Исполнители</h2>
        <div :class="styles.artistList">
           <RouterLink 
             v-for="artist in artists" 
             :key="artist.id" 
             :to="'/artist/' + artist.id"
             :class="styles.artistCard"
           >
             <img :src="artist.image" :class="styles.artistImage" />
             <p :class="styles.artistName">{{ artist.name }}</p>
             <span :class="styles.artistTag">Artist</span>
           </RouterLink>
        </div>
      </div>

      <!-- Albums & Tracks Mixed -->
      <div :class="styles.section">
        <h2 :class="styles.sectionTitle">Лучшие результаты</h2>
        
        <!-- Albums Grid -->
        <div v-if="albums.length > 0" :class="styles.albumGrid">
           <div v-for="album in albums" :key="album.id" :class="styles.albumItem">
              <RouterLink :to="'/album/' + (album.idStr || album.id)" :class="styles.linkWrapper">
                <AlbumCard :album="album" />
              </RouterLink>
           </div>
        </div>

        <!-- Tracks List -->
        <div v-if="tracks.length > 0" :class="styles.trackList">
           <table :class="styles.trackTable">
             <tbody>
               <tr 
                 v-for="(track, index) in tracks" 
                 :key="track.id" 
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

    </div>

    <div v-else-if="query.length > 2 && !loading" :class="styles.noResults">
      Ничего не найдено
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { usePlayerStore } from '../stores/player';
import { useLikesStore } from '../stores/likes';
import AlbumCard from '../components/AlbumCard.vue';
import Audio_Track from '../components/Audio_Track.vue';
import styles from './Search.module.css';

export default {
  name: 'SearchPage',
  components: {
    AlbumCard,
    Audio_Track
  },
  data() {
    return {
      styles,
      query: '',
      loading: false,
      artists: [],
      albums: [],
      tracks: [],
      debounceTimer: null
    };
  },
  computed: {
    ...mapStores(usePlayerStore, useLikesStore),
    hasResults() {
      return this.artists.length > 0 || this.albums.length > 0 || this.tracks.length > 0;
    }
  },
  mounted() {
    const savedQuery = localStorage.getItem('search_query');
    if (savedQuery) {
      this.query = savedQuery;
      this.performSearch();
    }
  },
  methods: {
    onInput() {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.performSearch();
      }, 500);
    },
    async performSearch() {
      if (this.query.length < 2) {
        this.clearResults();
        return;
      }
      
      // Save query
      localStorage.setItem('search_query', this.query);

      this.loading = true;
      try {
        const response = await fetch(`http://localhost:3000/api/search/smart?q=${encodeURIComponent(this.query)}`);
        if (response.ok) {
           const data = await response.json();
           this.artists = data.artists || [];
           this.albums = data.albums || [];
           this.tracks = data.tracks || [];
        }
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        this.loading = false;
      }
    },
    clearResults() {
      this.artists = [];
      this.albums = [];
      this.tracks = [];
    },
    playTrack(track) {
      // Create context playlist matches search results
      // Combine tracks maybe? Or just play this track and set context as this list
      this.playerStore.setPlaylist(this.tracks);
      this.playerStore.setTrack(track);
    },
    toggleLike(id) {
       const track = this.tracks.find(t => t.id === id);
       if (track) this.likesStore.toggleLike(track);
    }
  }
}
</script>
