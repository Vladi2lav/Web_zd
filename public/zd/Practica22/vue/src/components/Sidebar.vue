<template>
  <nav :class="[styles.sidebar, isCollapsed ? styles.collapsed : '']">
    <div :class="styles.desktopHeader">
      <div v-if="!isCollapsed" :class="styles.logo">Моя медиатека</div>
      <div v-else :class="styles.logoIcon">🎵</div>
    </div>

    <div :class="styles.navItems">
      <RouterLink to="/" :class="styles.navItem" active-class="active">
        <span :class="styles.icon">🏠</span>
        <span v-if="!isCollapsed" :class="styles.label">Главная</span>
      </RouterLink>

      <RouterLink to="/search" :class="styles.navItem" active-class="active">
        <span :class="styles.icon">🔍</span>
        <span v-if="!isCollapsed" :class="styles.label">Поиск</span>
      </RouterLink>

      <RouterLink to="/liked-songs" :class="styles.navItem" active-class="active">
        <span :class="styles.icon">📚</span>
        <span v-if="!isCollapsed" :class="styles.label">Моя библиотека</span>
      </RouterLink>

      <div :class="styles.divider"></div>

      <button :class="styles.createPlaylist">
        <span :class="styles.plus">➕</span> 
        <span v-if="!isCollapsed">Создать плейлист</span>
      </button>

      <RouterLink to="/liked-songs" :class="styles.likedSongsLink">
        <span :class="styles.heart">❤️</span> 
        <span v-if="!isCollapsed">Избранное</span>
      </RouterLink>

      <div v-if="!isCollapsed" :class="styles.scrollableList">
        <a href="#" :class="styles.listItem">Ваши плейлисты</a>
        <a href="#" :class="styles.listItem">Любимые треки</a>
        <a href="#" :class="styles.listItem">Мои выпуски</a>
        <a href="#" :class="styles.listItem">Welcome to ado</a>
        <a href="#" :class="styles.listItem">MAGIC</a>
        <a href="#" :class="styles.listItem">Мой плейлист №11</a>
      </div>
    </div>

    <!-- Drag Handle -->
    <div :class="styles.resizer" @mousedown="startResize"></div>

    <!-- Mobile Navigation -->
    <div :class="styles.mobileNav">
      <RouterLink to="/" :class="styles.mobileItem" active-class="active">
        <span :class="styles.icon">🏠</span>
        <span :class="styles.mobileLabel">Главная</span>
      </RouterLink>

      <RouterLink to="/search" :class="styles.mobileItem" active-class="active">
        <span :class="styles.icon">🔍</span>
        <span :class="styles.mobileLabel">Поиск</span>
      </RouterLink>

      <RouterLink to="/liked-songs" :class="styles.mobileItem" active-class="active">
        <span :class="styles.icon">📚</span>
        <span :class="styles.mobileLabel">Медиатека</span>
      </RouterLink>
      
      <div :class="styles.mobileItem" @click="showMore = !showMore">
        <span :class="styles.icon">☰</span>
        <span :class="styles.mobileLabel">Еще</span>
      </div>

       <div v-if="showMore" :class="styles.moreMenu">
          <button :class="styles.moreBtn">Placeholder 1</button>
          <button :class="styles.moreBtn">Placeholder 2</button>
          <button :class="styles.moreBtn">Placeholder 3</button>
          <button :class="styles.moreBtn">Placeholder 4</button>
       </div>
    </div>
  </nav>
</template>

<script>
import styles from './Sidebar.module.css';

export default {
  name: 'Sidebar',
  props: {
    width: {
      type: Number,
      default: 250
    }
  },
  data() {
    return {
      styles,
      showMore: false
    }
  },
  computed: {
    isCollapsed() {
      // Collapse if width is less than threshold (e.g. 150px)
      return this.width < 180;
    }
  },
  methods: {
    startResize(event) {
      // Prevent text selection during drag
      event.preventDefault(); 
      this.$emit('resize-start', event);
    }
  }
}
</script>
