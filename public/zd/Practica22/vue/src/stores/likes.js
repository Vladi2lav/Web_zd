import { defineStore } from 'pinia';

export const useLikesStore = defineStore('likes', {
    state: () => ({
        likedIds: [],
        likedTracksData: {}, // Map of id -> track object for quick access to details
    }),
    getters: {
        isLiked: (state) => (id) => {
            return state.likedIds.includes(id);
        },
        getLikedTracks: (state) => {
            return state.likedIds
                .map(id => state.likedTracksData[id])
                .filter(track => track !== undefined);
        }
    },
    actions: {
        toggleLike(track) {
            const index = this.likedIds.indexOf(track.id);
            if (index === -1) {
                this.likedIds.push(track.id);
                this.likedTracksData[track.id] = track;
            } else {
                this.likedIds.splice(index, 1);
                delete this.likedTracksData[track.id];
            }
            this.saveLikes();
        },

        saveLikes() {
            // Save IDs to cookie for compatibility/persistence preference
            const expires = new Date(Date.now() + 30 * 864e5).toUTCString();
            document.cookie = `track_likes=${JSON.stringify(this.likedIds)}; expires=${expires}; path=/`;

            // Save full track data to localStorage for the Liked Songs page display
            // Convert map to array for storage
            const tracksArray = Object.values(this.likedTracksData);
            localStorage.setItem('likedTracksData', JSON.stringify(tracksArray));
        },

        loadLikes() {
            // Load IDs from Cookie
            const cookie = document.cookie
                .split('; ')
                .find(row => row.startsWith('track_likes='));

            if (cookie) {
                try {
                    this.likedIds = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
                } catch (e) {
                    console.error('Error parsing likedIds cookie:', e);
                    this.likedIds = [];
                }
            }

            // Load Track Data from LocalStorage
            const savedTracks = localStorage.getItem('likedTracksData');
            if (savedTracks) {
                try {
                    const tracksArray = JSON.parse(savedTracks);
                    this.likedTracksData = {};
                    tracksArray.forEach(track => {
                        // Only keep data if we still have the ID in cookies (optional sync check)
                        if (this.likedIds.includes(track.id)) {
                            this.likedTracksData[track.id] = track;
                        }
                    });
                } catch (e) {
                    console.error('Error parsing likedTracksData:', e);
                    this.likedTracksData = {};
                }
            }
        }
    }
});
