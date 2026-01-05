
<template>
  <header>
   
  </header>

  <main>
    <div class="poster">
      <div class="content">
        <img :src="poster" alt="Vue.js Logo" class="logo"/>
        <div class="title">
          <h1>Practica 22 - Vue.js</h1>
        </div>
      </div>  
    </div>
    
  </main>
</template>

<script>

export default {
  data() {
    return {
      poster: '@/assets/poster.png',
      name: 'Best album',
      info: 'This album contains some of the best songs from various artists, blending different genres and styles to create a unique listening experience.',
      autor: 'ADO',
      track_1: '@/assets/Value.mp3',
      track_2: '@/assets/Backlight.mp3',
      track_3: '@/assets/Crime_and_Puishment.mp3',
      track_4: '@/assets/Senbonzakura.mp3',
    };
  },
};
</script>

<style scoped>

</style>
