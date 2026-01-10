import { defineStore } from 'pinia';

export const useLikesStore = defineStore('likes', {
    state: () => ({
        likedByIds: [], // Kept for backwards compatibility if needed, but tracks use tracksData

        // Tracks
        likedIds: [],
        likedTracksData: {},

        // Albums
        likedAlbumIds: [],
        likedAlbumsData: {},

        // Artists
        likedArtistIds: [],
        likedArtistsData: {},
    }),
    getters: {
        isLiked: (state) => (id) => state.likedIds.includes(id),
        isAlbumLiked: (state) => (id) => state.likedAlbumIds.includes(id),
        isArtistLiked: (state) => (id) => state.likedArtistIds.includes(id),

        getLikedTracks: (state) => state.likedIds.map(id => state.likedTracksData[id]).filter(t => t),
        getLikedAlbums: (state) => state.likedAlbumIds.map(id => state.likedAlbumsData[id]).filter(a => a),
        getLikedArtists: (state) => state.likedArtistIds.map(id => state.likedArtistsData[id]).filter(a => a),
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
        toggleAlbumLike(album) {
            // handle both id and idStr properties to be safe
            const id = album.idStr || album.id;
            const index = this.likedAlbumIds.indexOf(id);
            if (index === -1) {
                this.likedAlbumIds.push(id);
                this.likedAlbumsData[id] = album;
            } else {
                this.likedAlbumIds.splice(index, 1);
                delete this.likedAlbumsData[id];
            }
            this.saveLikes();
        },
        toggleArtistLike(artist) {
            const id = artist.id;
            const index = this.likedArtistIds.indexOf(id);
            if (index === -1) {
                this.likedArtistIds.push(id);
                this.likedArtistsData[id] = artist;
            } else {
                this.likedArtistIds.splice(index, 1);
                delete this.likedArtistsData[id];
            }
            this.saveLikes();
        },

        saveLikes() {
            // Tracks
            const expires = new Date(Date.now() + 30 * 864e5).toUTCString();
            document.cookie = `track_likes=${JSON.stringify(this.likedIds)}; expires=${expires}; path=/`;
            localStorage.setItem('likedTracksData', JSON.stringify(Object.values(this.likedTracksData)));

            // Albums
            localStorage.setItem('likedAlbumIds', JSON.stringify(this.likedAlbumIds));
            localStorage.setItem('likedAlbumsData', JSON.stringify(Object.values(this.likedAlbumsData)));

            // Artists
            localStorage.setItem('likedArtistIds', JSON.stringify(this.likedArtistIds));
            localStorage.setItem('likedArtistsData', JSON.stringify(Object.values(this.likedArtistsData)));
        },

        loadLikes() {
            // -- Tracks --
            const cookie = document.cookie.split('; ').find(row => row.startsWith('track_likes='));
            if (cookie) {
                try { this.likedIds = JSON.parse(decodeURIComponent(cookie.split('=')[1])); }
                catch (e) { this.likedIds = []; }
            }
            const savedTracks = localStorage.getItem('likedTracksData');
            if (savedTracks) {
                try {
                    const tracksArray = JSON.parse(savedTracks);
                    this.likedTracksData = {};
                    tracksArray.forEach(t => { if (this.likedIds.includes(t.id)) this.likedTracksData[t.id] = t; });
                } catch (e) { console.error(e); }
            }

            // -- Albums --
            try {
                this.likedAlbumIds = JSON.parse(localStorage.getItem('likedAlbumIds') || '[]');
                const savedAlbums = JSON.parse(localStorage.getItem('likedAlbumsData') || '[]');
                this.likedAlbumsData = {};
                savedAlbums.forEach(a => {
                    const id = a.idStr || a.id;
                    if (this.likedAlbumIds.includes(id)) this.likedAlbumsData[id] = a;
                });
            } catch (e) { console.error(e); }

            // -- Artists --
            try {
                this.likedArtistIds = JSON.parse(localStorage.getItem('likedArtistIds') || '[]');
                const savedArtists = JSON.parse(localStorage.getItem('likedArtistsData') || '[]');
                this.likedArtistsData = {};
                savedArtists.forEach(a => {
                    if (this.likedArtistIds.includes(a.id)) this.likedArtistsData[a.id] = a;
                });
            } catch (e) { console.error(e); }
        }
    }
});
