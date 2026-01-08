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
      if (this.playlist.length > 0) {
        this.playlist.forEach(t => t.active = false);
      }
      // If the track is part of the playlist, mark it active there too
      const foundTrack = this.playlist.find(t => t.id === track.id);
      if (foundTrack) {
        foundTrack.active = true;
      }
      
      // Ensure the current track object also represents active state if needed, 
      // but primarily we rely on the playlist items being updated for the list view.
      track.active = true; 
      
      this.currentTrack = track;
      this.isPlaying = true;
    },
    setPlaylist(tracks) {
      this.playlist = tracks.map(t => ({ ...t, active: false }));
    },
    togglePlay() {
      this.isPlaying = !this.isPlaying;
    },
    setVolume(volume) {
      this.volume = volume;
    },
    playNext() {
      if (!this.currentTrack || this.playlist.length === 0) return;
      
      const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack.id);
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % this.playlist.length;
        this.setTrack(this.playlist[nextIndex]);
      }
    },
    playPrev() {
      if (!this.currentTrack || this.playlist.length === 0) return;

      const currentIndex = this.playlist.findIndex(t => t.id === this.currentTrack.id);
      if (currentIndex !== -1) {
        const prevIndex = (currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.setTrack(this.playlist[prevIndex]);
      }
    },
  },
});
