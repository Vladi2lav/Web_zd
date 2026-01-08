import express from 'express';
import cors from 'cors';
import { Innertube } from 'youtubei.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

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
        id: item.id,
        videoId: item.video_id || item.id, // Explicit videoId for streaming
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
      videoId: s.id, // For search results, id is usually the videoId
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
    const { videoId } = req.params;

    if (!videoId || videoId === 'undefined') {
      return res.status(400).json({
        error: 'Invalid videoId',
        received: videoId
      });
    }

    console.log(`[Stream] Request for videoId: ${videoId}`);

    const url = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      // Используем yt-dlp для получения прямой ссылки на аудио
      const { stdout } = await execPromise(`yt-dlp -f bestaudio --get-url "${url}"`);
      const directUrl = stdout.trim();

      if (!directUrl) {
        throw new Error('yt-dlp returned empty URL');
      }

      console.log(`[Stream] Got direct URL, redirecting...`);
      res.redirect(directUrl);
    } catch (ytdlpError) {
      console.error('[Stream] yt-dlp error:', ytdlpError.message);
      res.status(500).json({ error: 'Failed to get stream URL' });
    }
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.sendStatus(500);
  }
});

/* ---------- START ---------- */
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
