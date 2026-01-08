import { defineStore } from 'pinia';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentTrack: null,
    playlist: [],
    isPlaying: false,
    volume: 75,
  }),
  actions: {
    setTrack(track) {
      this.currentTrack = track;
      this.isPlaying = true;
    },
    setPlaylist(tracks) {
      this.playlist = tracks;
    },
    togglePlay() {
      this.isPlaying = !this.isPlaying;
    },
    setVolume(volume) {
      this.volume = volume;
    },
    playNext() {
      const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack.id);
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % this.playlist.length;
        this.setTrack(this.playlist[nextIndex]);
      }
    },
    playPrev() {
      const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack.id);
      if (currentIndex !== -1) {
        const prevIndex = (currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.setTrack(this.playlist[prevIndex]);
      }
    },
  },
});
