import express from 'express';
import cors from 'cors';
import { Innertube } from 'youtubei.js';
import ytdl from 'ytdl-core';

const app = express();
const port = 3000;

app.use(cors());

// Step 2: Integrate youtubei.js
const setupYouTube = async () => {
  const youtube = await Innertube.create();
  
  // Home Route
  app.get('/api/home', async (req, res) => {
    try {
      const home_feed = await youtube.music.getHomeFeed();
      
      // The home feed contains 'sections'. We need to find a section that contains songs.
      const songs_section = home_feed.sections?.find(section => 
        section.type === 'MusicCarouselShelf' &&
        section.contents?.some(item => item.type === 'MusicResponsiveListItem')
      );

      if (songs_section && songs_section.contents) {
        // We found a section with songs, now extract them.
        const songs_raw = songs_section.contents.filter(item => item.type === 'MusicResponsiveListItem');
        
        if (songs_raw.length > 0) {
          // Take the top 10 songs
          const top_songs_raw = songs_raw.slice(0, 10);

          // Simplify the objects for a clean response
          const simplified_songs = top_songs_raw.map(song => ({
            id: song.id,
            title: song.title,
            artists: song.artists?.map(artist => artist.name),
            album: song.album?.name,
            duration: song.duration?.text,
            thumbnail: song.thumbnail.contents[0].url // Get a thumbnail URL
          }));

          console.log(`Successfully found and processed ${simplified_songs.length} songs.`);
          res.json(simplified_songs);
        } else {
          console.log('Found a songs section, but it contains no songs.');
          res.json([]);
        }
      } else {
        console.log('Could not find a section with songs in the home feed data.');
        res.json([]);
      }
    } catch (error) {
      console.error('Error fetching home feed:', error);
      console.error(error); 
      res.status(500).json({ error: 'Failed to fetch home feed' });
    }
  });

  app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    try {
      const search = await youtube.music.search(query, { type: 'song' });
      res.json(search.songs);
    } catch (error) {
      console.error('Error searching:', error);
      res.status(500).json({ error: 'Failed to search' });
    }
  });
};

setupYouTube();



app.get('/api/stream/:videoId', (req, res) => {
  const videoId = req.params.videoId;
  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    const audioStream = ytdl(videoId, {
      quality: 'highestaudio',
      filter: 'audioonly'
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    
    audioStream.pipe(res);

    audioStream.on('error', (err) => {
      console.error('Error streaming audio:', err);
      res.status(500).send('Error streaming audio');
    });

  } catch (error) {
    console.error('Error in stream route:', error);
    res.status(500).send('Error processing stream request');
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
