<template>
  <div :class="styles.scrollerContainer">
    <div :class="styles.header">
      <h2 v-if="title" :class="styles.title">{{ title }}</h2>
      <div :class="styles.controls">
        <button @click="scroll('left')" :class="styles.navBtn" :disabled="!canScrollLeft">
          &lt;
        </button>
        <button @click="scroll('right')" :class="styles.navBtn" :disabled="!canScrollRight">
          &gt;
        </button>
      </div>
    </div>
    
    <div 
      ref="scrollContainer" 
      :class="styles.scrollContent" 
      @scroll="updateScrollState"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
// Inline styles mostly for now, or use module
import styles from './HorizontalScroller.module.css';

export default {
  name: 'HorizontalScroller',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      styles,
      canScrollLeft: false,
      canScrollRight: true // Assume initially true
    }
  },
  mounted() {
    this.updateScrollState();
  },
  methods: {
    scroll(direction) {
      const container = this.$refs.scrollContainer;
      const scrollAmount = container.clientWidth * 0.7; // Scroll 70% of viewing width
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    },
    updateScrollState() {
      const el = this.$refs.scrollContainer;
      if (!el) return;
      
      this.canScrollLeft = el.scrollLeft > 0;
      // tolerant comparison
      this.canScrollRight = Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth;
    }
  }
}
</script>
