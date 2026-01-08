<template>
  <div class="search-page">
    <h1>Search</h1>
    <input type="text" placeholder="Search for artists, songs, or albums..." />
    <p>Search results will appear here.</p>
  </div>
</template>

<script>
export default {
  name: 'SearchPage',
};
</script>

<style scoped>
.search-page {
  padding: 20px;
}
input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 20px;
}
</style>
