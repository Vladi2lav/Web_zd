import express from 'express';
import cors from 'cors';
import { Innertube } from 'youtubei.js';
import play from 'play-dl';

const app = express();
const port = 3000;

app.use(cors());

let youtube;

/* ---------- INIT ---------- */
(async () => {
  youtube = await Innertube.create();
  console.log('YouTube initialized');
})();

/* ---------- HOME (10 tracks) ---------- */
app.get('/api/home', async (req, res) => {
  try {
    const feed = await youtube.music.getHomeFeed();

    const section = feed.sections?.find(s =>
      s.type === 'MusicCarouselShelf' &&
      s.contents?.some(i => i.type === 'MusicResponsiveListItem')
    );

    if (!section) return res.json([]);

    const songs = section.contents
      .filter(i => i.type === 'MusicResponsiveListItem')
      .slice(0, 10)
      .map(item => ({
        id: item.id,                              // videoId
        title: item.title,
        artists: item.artists?.map(a => a.name),
        duration: item.duration?.text,
        thumbnail: item.thumbnail?.contents?.[0]?.url
      }));

    res.json(songs);
  } catch (e) {
    console.error(e);
    res.status(500).json([]);
  }
});

/* ---------- SEARCH ---------- */
app.get('/api/search', async (req, res) => {
  try {
    if (!req.query.q) return res.status(400).json([]);

    const search = await youtube.music.search(req.query.q, { type: 'song' });

    const songs = search.songs.map(s => ({
      id: s.id,
      title: s.title,
      artists: s.artists?.map(a => a.name),
      duration: s.duration?.text,
      thumbnail: s.thumbnail?.contents?.[0]?.url
    }));

    res.json(songs);
  } catch (e) {
    console.error(e);
    res.status(500).json([]);
  }
});

/* ---------- AUDIO STREAM (REAL) ---------- */
app.get('/api/stream/:videoId', async (req, res) => {
  try {
    const url = `https://www.youtube.com/watch?v=${req.params.videoId}`;

    const stream = await play.stream(url, { quality: 2 });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');

    stream.stream.pipe(res);

    stream.stream.on('error', err => {
      console.error('Stream error:', err);
      if (!res.headersSent) res.sendStatus(500);
    });
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.sendStatus(500);
  }
});

/* ---------- START ---------- */
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
