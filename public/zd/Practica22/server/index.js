import express from 'express';
import cors from 'cors';
import { Innertube, Platform } from 'youtubei.js';
import vm from 'vm';

Platform.shim.eval = (code, env) => {
  const sandbox = { 
    ...env,
    String, Array, Math, Object, Number, Date, RegExp
  };
  try {
    return vm.runInNewContext(code, sandbox);
  } catch (e) {
    return vm.runInNewContext('(function() {\n' + code + '\n})()', sandbox);
  }
};

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
      
      const songs_section = home_feed.sections?.find(section => 
        section.type === 'MusicCarouselShelf' &&
        section.contents?.some(item => item.type === 'MusicResponsiveListItem')
      );

      if (songs_section && songs_section.contents) {
        const songs_raw = songs_section.contents.filter(item => item.type === 'MusicResponsiveListItem');
        
        if (songs_raw.length > 0) {
          const top_songs_raw = songs_raw.slice(0, 10);

          const simplified_songs = top_songs_raw.map(song => ({
            id: song.id,
            title: song.title,
            artists: song.artists?.map(artist => artist.name),
            album: song.album?.name,
            duration: song.duration?.text,
            thumbnail: song.thumbnail.contents[0].url
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

  // Stream route is now inside setupYouTube to access the 'youtube' instance
  app.get('/api/stream/:videoId', async (req, res) => {
    try {
      const videoId = req.params.videoId;
      if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required' });
      }
  
      const stream = await youtube.download(videoId, {
        type: 'audio'
      });
  
      res.setHeader('Content-Type', 'audio/mpeg');
      
      // Pipe the stream to the response
      stream.pipe(res);
  
      stream.on('error', (err) => {
        console.error('Error streaming audio:', err);
        if (!res.headersSent) {
          res.status(500).send('Error streaming audio');
        }
      });

      stream.on('end', () => {
        res.end();
      });
  
    } catch (error) {
      console.error('Error in stream route:', error);
      if (!res.headersSent) {
        res.status(500).send('Error processing stream request');
      }
    }
  });
};

setupYouTube();

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});