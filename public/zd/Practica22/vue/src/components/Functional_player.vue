<template>
  <div v-if="playerStore.currentTrack" :class="styles.spotifyPlayer">
    <audio 
      ref="audio" 
      :key="playerStore.currentTrack?.id"
      :src="audioUrl" 
      :autoplay="playerStore.isPlaying"
      @timeupdate="updateProgress" 
      @loadedmetadata="setDuration" 
      @ended="playerStore.playNext()"
    ></audio>

    <div :class="styles.songInfo">
      <img :src="playerStore.currentTrack.thumbnail || 'https://via.placeholder.com/64'" alt="Album Art" :class="styles.albumArt">
      <div :class="styles.songDetails">
        <div :class="styles.songTitle">{{ playerStore.currentTrack.title || 'Unknown Title' }}</div>
        <div :class="styles.songArtist">
           <template v-if="Array.isArray(playerStore.currentTrack.artists)">
              <RouterLink 
                v-for="(artist, idx) in playerStore.currentTrack.artists" 
                :key="idx" 
                :to="artist.id ? '/artist/' + artist.id : ''"
                :class="styles.artistLink"
                @click.stop
              >
                {{ artist.name }}{{ idx < playerStore.currentTrack.artists.length - 1 ? ', ' : '' }}
              </RouterLink>
           </template>
           <span v-else>{{ playerStore.currentTrack.artists || 'Unknown Artist' }}</span>
        </div>
      </div>
    </div>

    <div :class="styles.playerControls">
      <button :class="styles.controlButton" @click="playerStore.playPrev()">⏮️</button>
      <button :class="[styles.controlButton, styles.playPause]" @click="togglePlay">{{ playerStore.isPlaying ? '❚❚' : '▶' }}</button>
      <button :class="styles.controlButton" @click="playerStore.playNext()">⏭️</button>
    </div>

    <div :class="styles.progressBarContainer">
      <span>{{ formatTime(currentTime) }}</span>
      <div :class="styles.progressBar" @click="seek">
        <div :class="styles.progress" :style="{ width: progressPercentage }"></div>
      </div>
      <span>{{ formatTime(duration) }}</span>
    </div>

    <div :class="styles.volumeControl">
      <button :class="styles.controlButton" @click="toggleMute">{{ isMuted ? '🔇' : '🔊' }}</button>
      <div class="volume-slider" @click="setVolume">
        <div class="volume-level" :style="{ width: playerStore.volume + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { usePlayerStore } from '../stores/player';
import styles from './Functional_player.module.css';

export default {
  name: 'FunctionalPlayer',
  data() {
    return {
      styles: styles,
      currentTime: 0,
      duration: 0,
      isMuted: false,
    };
  },
  computed: {
    ...mapStores(usePlayerStore),
    audioUrl() {
      if (this.playerStore.currentTrack) {
        return `http://localhost:3000/api/stream/${this.playerStore.currentTrack.videoId}`;
      }
      return null;
    },
    progressPercentage() {
      if (this.duration === 0) return '0%';
      return (this.currentTime / this.duration * 100) + '%';
    }
  },
  methods: {
    togglePlay() {
      this.playerStore.togglePlay();
    },
    updateProgress(event) {
      this.currentTime = event.target.currentTime;
    },
    setDuration(event) {
      this.duration = event.target.duration;
    },
    formatTime(seconds) {
      if (isNaN(seconds)) return '0:00';
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    },
    seek(event) {
      const progressBar = event.currentTarget;
      const clickPosition = event.offsetX;
      const barWidth = progressBar.clientWidth;
      const newTime = (clickPosition / barWidth) * this.duration;
      this.$refs.audio.currentTime = newTime;
    },
    setVolume(event) {
        const slider = event.currentTarget;
        const clickPosition = event.offsetX;
        const sliderWidth = slider.clientWidth;
        let newVolume = (clickPosition / sliderWidth) * 100;
        
        if (newVolume < 0) newVolume = 0;
        if (newVolume > 100) newVolume = 100;

        this.playerStore.setVolume(newVolume);
        this.$refs.audio.volume = newVolume / 100;
        this.isMuted = newVolume === 0;
    },
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.$refs.audio.muted = this.isMuted;
    }
  },
  watch: {
    'playerStore.isPlaying'(newVal) {
      if (!this.$refs.audio) return;
      if (newVal) {
        this.$refs.audio.play().catch(e => console.error("Play error:", e));
      } else {
        this.$refs.audio.pause();
      }
    }
  },
};
</script>
