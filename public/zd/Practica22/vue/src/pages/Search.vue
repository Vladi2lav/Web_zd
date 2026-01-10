<template>
  <div class="search-page">
    <div class="search-container">
      
      
      <div class="search-input-wrapper">
        <input 
          type="text" 
          v-model="searchQuery"
          @input="onSearchInput"
          placeholder="search" 
          class="search-input"
        />
        <span v-if="isSearching" class="search-spinner">🔍</span>
      </div>

      <div v-if="searchQuery && searchQuery.length < 3" class="hint">
        Введите минимум 3 символа для поиска
      </div>

      <div v-if="isSearching && results.length === 0" class="loading">
        Поиск...
      </div>

      <div v-if="!isSearching && searchQuery.length >= 3 && results.length === 0" class="no-results">
        Ничего не найдено по запросу "{{ searchQuery }}"
      </div>

      <div v-if="results.length > 0" class="results-info">
        Найдено: {{ totalResults }} {{ pluralize(totalResults, 'трек', 'трека', 'треков') }}
      </div>

      <div class="results-container">
        <table class="tracklist" v-if="results.length > 0">
          <thead>
            <tr>
              <th class="col-num">#</th>
              <th class="col-name">НАЗВАНИЕ</th>
              <th class="col-alb">АЛЬБОМ</th>
              <th class="col-time">🕒</th>
              <th class="col-fav"></th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(track, index) in results" 
              :key="track.id"
              class="track-row"
              @click="playTrack(track)"
            >
              <Audio_Track 
                :track="track"
                :index="index"
                :likedIds="localLikedIds"
                @toggleLike="toggleLike"
              />
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="hasMore && !isLoadingMore" class="load-more-container">
        <button @click="loadMore" class="load-more-btn">
          Показать больше
        </button>
      </div>

      <div v-if="isLoadingMore" class="loading">
        Загрузка...
      </div>
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useLikesStore } from '../stores/likes';
import { usePlayerStore } from '../stores/player';
import Audio_Track from '../components/Audio_Track.vue';

export default {
  name: 'SearchPage',
  components: {
    Audio_Track
  },
  data() {
    return {
      searchQuery: '',
      results: [],
      isSearching: false,
      isLoadingMore: false,
      hasMore: false,
      totalResults: 0,
      offset: 0,
      limit: 10,
      searchTimeout: null
    };
  },
  computed: {
    ...mapStores(usePlayerStore, useLikesStore),
    localLikedIds() {
      return this.likesStore.likedIds;
    }
  },
  methods: {
    onSearchInput() {
      
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      
      this.results = [];
      this.offset = 0;
      this.hasMore = false;
      this.totalResults = 0;

      // Don't search if less than 3 characters
      if (this.searchQuery.length < 3) {
        return;
      }

      // Debounce search - wait 500ms after user stops typing
      this.searchTimeout = setTimeout(() => {
        this.performSearch();
      }, 500);
    },

    async performSearch() {
      if (this.searchQuery.length < 3) return;

      this.isSearching = true;
      
      try {
        const response = await fetch(
          `http://localhost:3000/api/search/smart?q=${encodeURIComponent(this.searchQuery)}&offset=${this.offset}&limit=${this.limit}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        this.results = data.results || [];
        this.hasMore = data.hasMore || false;
        this.totalResults = data.total || 0;

        console.log(`Search results: ${this.results.length} tracks, hasMore: ${this.hasMore}`);
      } catch (error) {
        console.error('Search error:', error);
        this.results = [];
        this.hasMore = false;
        this.totalResults = 0;
      } finally {
        this.isSearching = false;
      }
    },

    async loadMore() {
      if (!this.hasMore || this.isLoadingMore) return;

      this.isLoadingMore = true;
      this.offset += this.limit;

      try {
        const response = await fetch(
          `http://localhost:3000/api/search/smart?q=${encodeURIComponent(this.searchQuery)}&offset=${this.offset}&limit=${this.limit}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Append new results to existing ones
        this.results = [...this.results, ...(data.results || [])];
        this.hasMore = data.hasMore || false;

        console.log(`Loaded more: ${data.results.length} tracks, total now: ${this.results.length}`);
      } catch (error) {
        console.error('Load more error:', error);
      } finally {
        this.isLoadingMore = false;
      }
    },

    playTrack(track) {
      console.log('Playing track:', track);
      // Update playlist to search results context
      this.playerStore.setPlaylist(this.results);
      this.playerStore.setTrack(track);
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
    },

    toggleLike(trackId) {
      // Find the track in search results
      const track = this.results.find(t => t.id === trackId);
      
      if (track) {
        this.likesStore.toggleLike(track);
      }
    }
  }
};
</script>

<style scoped>
.search-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 120px);
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 16px 50px 16px 20px;
  font-size: 18px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  outline: none;
  transition: all 0.3s ease;
  background: rgb(27, 27, 28);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  color: #ffffff;
}

.search-input:focus {
  border-color: #e9eaf2;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.search-spinner {
  position: absolute;
  right: 20px;
  font-size: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hint {
  color: #666;
  font-size: 14px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 18px;
}

.results-info {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.results-container {
  background: rgb(27, 27, 28);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tracklist {
  width: 100%;
  border-collapse: collapse;
}

.tracklist thead tr {
  border-bottom: 2px solid #e0e0e0;
}

.tracklist th {
  padding: 12px 15px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.col-num {
  width: 40px;
  text-align: center !important;
}

.col-name {
  width: auto;
}

.col-alb {
  width: 200px;
}

.col-time {
  width: 80px;
  text-align: center !important;
}

.col-fav {
  width: 60px;
  text-align: center !important;
}

.track-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.track-row:hover {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.track-row:active {
  transform: scale(0.98);
}


.load-more-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.load-more-btn {
  padding: 14px 40px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.load-more-btn:active {
  transform: translateY(0);
}

/* Responsive design */
@media (max-width: 768px) {
  .search-page {
    padding: 15px;
  }

  h1 {
    font-size: 2rem;
  }

  .search-input {
    font-size: 16px;
    padding: 14px 45px 14px 16px;
  }

  .col-alb {
    display: none;
  }

  .tracklist th {
    padding: 10px 8px;
    font-size: 11px;
  }
}
</style>
