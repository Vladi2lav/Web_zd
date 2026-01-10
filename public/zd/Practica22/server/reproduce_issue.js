import play from 'play-dl';

const videoId = 'dQw4w9WgXcQ'; 
const url = `https://www.youtube.com/watch?v=${videoId}`;
const stream = await play.stream(url, { quality: 2 });
