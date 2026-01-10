import { defineStore } from 'pinia';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentTrack: null,
    playlist: [],
    isPlaying: false,
    volume: 75,
    history: (function () {
      try {
        const raw = JSON.parse(localStorage.getItem('player_history') || '[]');
        // Normalize legacy data: if artists is string[], convert to object[]
        return raw.map(track => {
          if (Array.isArray(track.artists) && typeof track.artists[0] === 'string') {
            return {
              ...track,
              artists: track.artists.map(name => ({ name, id: null }))
            };
          }
          return track;
        });
      } catch (e) {
        return [];
      }
    })(),
  }),
  actions: {
    setTrack(track) {
      // Add to history
      this.addToHistory(track);

      //is active?
      if (this.playlist.length > 0) {
        this.playlist.forEach(t => t.active = false);
      }

      const foundTrack = this.playlist.find(t => t.id === track.id);
      if (foundTrack) {
        foundTrack.active = true;
      }
      //

      track.active = true;

      this.currentTrack = track;
      this.isPlaying = true;
    },
    addToHistory(track) {
      // Remove if already exists to move to top
      this.history = this.history.filter(t => t.id !== track.id);
      this.history.unshift(track);
      if (this.history.length > 50) {
        this.history.pop();
      }
      localStorage.setItem('player_history', JSON.stringify(this.history));
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
