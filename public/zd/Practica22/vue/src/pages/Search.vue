<template>
  <div class="search-page">
    <div class="search-container">
      <h1>Поиск музыки</h1>
      
      <div class="search-input-wrapper">
        <input 
          type="text" 
          v-model="searchQuery"
          @input="onSearchInput"
          placeholder="Введите название песни или исполнителя (минимум 3 буквы)..." 
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
        <div 
          v-for="(track, index) in results" 
          :key="track.id"
          class="track-item"
          @click="playTrack(track)"
        >
          <div class="track-thumbnail">
            <img :src="track.thumbnail" :alt="track.title" />
            <div class="play-overlay">▶</div>
          </div>
          
          <div class="track-info">
            <div class="track-title">{{ track.title }}</div>
            <div class="track-artist">{{ track.artists?.join(', ') || 'Unknown Artist' }}</div>
          </div>
          
          <div class="track-duration">{{ track.duration }}</div>
        </div>
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
import { usePlayerStore } from '../stores/player';

export default {
  name: 'SearchPage',
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
    ...mapStores(usePlayerStore)
  },
  methods: {
    onSearchInput() {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Reset results when query changes
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
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  border-color: #667eea;
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.track-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.track-thumbnail {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.track-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.track-item:hover .play-overlay {
  opacity: 1;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.track-artist {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-duration {
  font-size: 14px;
  color: #999;
  font-weight: 500;
  flex-shrink: 0;
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

  .track-item {
    gap: 12px;
    padding: 10px;
  }

  .track-thumbnail {
    width: 50px;
    height: 50px;
  }

  .track-title {
    font-size: 15px;
  }

  .track-artist {
    font-size: 13px;
  }
}
</style>
