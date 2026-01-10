<template>
  <div :class="styles.appContainer" :style="{ '--sidebar-width': sidebarWidth + 'px' }">
    <div :class="styles.sidebarArea">
      <Sidebar 
        :width="sidebarWidth"
        @resize-start="startResize"
      />
    </div>

    <main :class="styles.mainContent">
      <RouterView />
    </main>

    <div :class="styles.playerArea">
      <FunctionalPlayer />
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useLikesStore } from './stores/likes';
import { usePlayerStore } from './stores/player'; 
import FunctionalPlayer from './components/Functional_player.vue';
import Sidebar from './components/Sidebar.vue';
import styles from './App.module.css';

export default {
  components: {
    FunctionalPlayer,
    Sidebar
  },
  data() {
    return {
      styles: styles,
      sidebarWidth: 250, // Default width
      minSidebarWidth: 100,
      isResizing: false
    };
  },
  computed: {
    ...mapStores(useLikesStore, usePlayerStore)
  },
  created() {
    this.likesStore.loadLikes();
    // Add global event listeners for drag
    window.addEventListener('mousemove', this.handleResize);
    window.addEventListener('mouseup', this.stopResize);
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.handleResize);
    window.removeEventListener('mouseup', this.stopResize);
  },
  methods: {
    startResize(event) {
      this.isResizing = true;
    },
    handleResize(event) {
      if (!this.isResizing) return;
      
      const newWidth = event.clientX;
      const maxSidebarWidth = window.innerWidth / 2; // Max 50% screen

      if (newWidth >= this.minSidebarWidth && newWidth <= maxSidebarWidth) {
        this.sidebarWidth = newWidth;
      }
    },
    stopResize() {
      this.isResizing = false;
    }
  }
};
</script>