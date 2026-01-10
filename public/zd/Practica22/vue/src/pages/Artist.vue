<template>
  <div :class="styles.artistPage">
    <!-- Header -->
    <div :class="styles.header" v-if="info">
      <img :src="info.image" :class="styles.artistImage" />
      <div :class="styles.headerInfo">
        <h1 :class="styles.artistName">{{ info.name }}</h1>
        <p :class="styles.artistDesc">{{ info.description }}</p>
        <button :class="styles.likeButton" @click="toggleArtistLike">
           {{ isLiked ? '❤️' : '🤍' }}
        </button>
      </div>
    </div>

    <!-- Top Tracks -->
    <div :class="styles.section" v-if="topTracks.length">
      <h2 :class="styles.sectionTitle">Популярные треки</h2>
      <table :class="styles.trackTable">
        <tbody>
          <tr 
            v-for="(track, index) in topTracks" 
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

    <!-- Albums -->
    <div :class="styles.section" v-if="albums.length">
      <h2 :class="styles.sectionTitle">Альбомы</h2>
      <div :class="styles.albumGrid">
        <div v-for="album in albums" :key="album.id" :class="styles.albumItem">
           <RouterLink :to="'/album/' + (album.idStr || album.id)" :class="styles.linkWrapper">
             <AlbumCard :album="album" />
           </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { usePlayerStore } from '../stores/player';
import { useLikesStore } from '../stores/likes';
import AlbumCard from '../components/AlbumCard.vue';
import Audio_Track from '../components/Audio_Track.vue';
import styles from './Artist.module.css';

export default {
  name: 'ArtistPage',
  components: {
    AlbumCard,
    Audio_Track
  },
  data() {
    return {
      styles,
      info: null,
      topTracks: [],
      albums: [],
    };
  },
  computed: {
    ...mapStores(usePlayerStore, useLikesStore)
  },
  async mounted() {
    const artistId = this.$route.params.id;
    if (artistId) {
      await this.fetchArtist(artistId);
    }
  },
  watch: {
    '$route.params.id'(newId) {
      if (newId) this.fetchArtist(newId);
    }
  },
  methods: {
    async fetchArtist(id) {
       try {
         const response = await fetch(`http://localhost:3000/api/artist/${id}`);
         if (response.ok) {
           const data = await response.json();
           this.info = data.info;
           this.topTracks = data.topTracks;
           this.albums = data.albums;
         }
       } catch (e) {
         console.error("Failed to fetch artist", e);
       }
    },
    playTrack(track) {
      this.playerStore.setTrack(track);
    },
    toggleLike(id) {
       const track = this.topTracks.find(t => t.id === id);
       if (track) this.likesStore.toggleLike(track);
    },
    toggleArtistLike() {
        if (!this.info) return;
        // Construct artist object to save
        const artist = {
            id: this.$route.params.id,
            name: this.info.name,
            image: this.info.image,
            description: this.info.description
        };
        this.likesStore.toggleArtistLike(artist);
    }
  },
  computed: {
    ...mapStores(usePlayerStore, useLikesStore),
    isLiked() {
        return this.likesStore.isArtistLiked(this.$route.params.id);
    }
  },
}
</script>
