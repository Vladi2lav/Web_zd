<template>
  <div v-if="track" :class="styles.spotifyPlayer">
    <audio ref="audio" :src="track.audio" @timeupdate="updateProgress" @loadedmetadata="setDuration" @ended="$emit('playNext')"></audio>

    <div :class="styles.songInfo">
      <img :src="track.albumArt || 'https://via.placeholder.com/64'" alt="Album Art" :class="styles.albumArt">
      <div :class="styles.songDetails">
        <div :class="styles.songTitle">{{ track.title || 'Unknown Title' }}</div>
        <div :class="styles.songArtist">{{ track.artist || 'Unknown Artist' }}</div>
      </div>
    </div>

    <div :class="styles.playerControls">
      <button :class="styles.controlButton" @click="$emit('playPrev')">⏮️</button>
      <button :class="[styles.controlButton, styles.playPause]" @click="togglePlay">{{ isPlaying ? '❚❚' : '▶' }}</button>
      <button :class="styles.controlButton" @click="$emit('playNext')">⏭️</button>
    </div>

    <div :class="styles.progressBarContainer">
      <span>{{ formatTime(currentTime) }}</span>
      <div :class="styles.progressBar" @click="seek">
        <div :class="styles.progress" :style="{ width: (currentTime / duration * 100) + '%' }"></div>
      </div>
      <span>{{ formatTime(duration) }}</span>
    </div>

    <div :class="styles.volumeControl">
      <button :class="styles.controlButton" @click="toggleMute">{{ isMuted ? '🔇' : '🔊' }}</button>
      <div :class="styles.volumeSlider" @click="setVolume">
        <div :class="styles.volumeLevel" :style="{ width: volume + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
import styles from './Functional_player.module.css';

export default {
  name: 'FunctionalPlayer',
  props: {
    track: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      styles: styles,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 75,
      isMuted: false,
    };
  },
  methods: {
    togglePlay() {
      if (this.isPlaying) {
        this.$refs.audio.pause();
      } else {
        this.$refs.audio.play();
      }
      this.isPlaying = !this.isPlaying;
    },
    updateProgress(event) {
      this.currentTime = event.target.currentTime;
    },
    setDuration(event) {
      this.duration = event.target.duration;
    },
    formatTime(seconds) {
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

        this.volume = newVolume;
        this.$refs.audio.volume = newVolume / 100;
        this.isMuted = newVolume === 0;
    },
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.$refs.audio.muted = this.isMuted;
    }
  },
  watch: {
    track(newTrack) {
      if (newTrack) {
        this.$nextTick(() => {
          this.isPlaying = false;
          setTimeout(() => {
              this.togglePlay();
          }, 100);
        });
      }
    },
  },
};
</script>
