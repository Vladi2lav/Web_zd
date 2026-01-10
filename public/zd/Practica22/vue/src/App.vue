<template>
  <div :class="styles.albumPage">
    <header :class="styles.siteHeader">
      <div :class="styles.logo">MGE</div>
      <nav :class="styles.navigation">
        <RouterLink to="/" :class="styles.navLink">Home</RouterLink>
        <RouterLink to="/search" :class="styles.navLink">Search</RouterLink>
        <RouterLink to="/liked-songs" :class="styles.navLink">Liked Songs</RouterLink>
      </nav>
    </header>
    <RouterView />
    <FunctionalPlayer />
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useLikesStore } from './stores/likes';
import { usePlayerStore } from './stores/player'; // Kept for consistency if needed later
import FunctionalPlayer from './components/Functional_player.vue';
import styles from './App.module.css';

export default {
  components: {
    FunctionalPlayer
  },
  data() {
    return {
      styles: styles
    };
  },
  computed: {
    ...mapStores(useLikesStore, usePlayerStore)
  },
  created() {
    // Load likes globally on app start
    this.likesStore.loadLikes();
  }
};
</script>