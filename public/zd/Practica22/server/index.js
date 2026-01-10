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


(async () => {
  youtube = await Innertube.create();
  console.log('init');
})();


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
        videoId: item.video_id || item.id,
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


app.get('/api/search', async (req, res) => {
  try {
    if (!req.query.q) return res.status(400).json([]);

    const search = await youtube.music.search(req.query.q, { type: 'song' });

    const songs = search.songs.map(s => ({
      id: s.id,
      videoId: s.id,
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


app.get('/api/search/smart', async (req, res) => {
  try {
    const query = req.query.q;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;

    if (!query || query.length < 3) {
      return res.json({ results: [], hasMore: false, total: 0 });
    }

    console.log(`[Smart Search] Query: "${query}", Offset: ${offset}, Limit: ${limit}`);

    const search = await youtube.music.search(query, { type: 'song' });

    console.log('[Smart Search] Search response keys:', Object.keys(search));
    let songs = [];
    if (search.contents && Array.isArray(search.contents)) {
      console.log(`[Smart Search] Found ${search.contents.length} shelves`);

      search.contents.forEach((shelf, shelfIndex) => {
        console.log(`[Smart Search] Shelf ${shelfIndex}: type=${shelf.type}, title=${shelf.title?.text}`);

        if (shelf.contents && Array.isArray(shelf.contents)) {
          console.log(`[Smart Search]   - Contains ${shelf.contents.length} items`);

          const items = shelf.contents.filter(item => {
            const isSong = item.type === 'MusicResponsiveListItem';
            if (shelfIndex === 0 && songs.length < 3) {
              console.log(`[Smart Search]     - Item type: ${item.type}, isSong: ${isSong}`);
            }
            return isSong;
          });

          songs = songs.concat(items);
          console.log(`[Smart Search]   - Added ${items.length} songs from this shelf`);
        }
      });
    }

    console.log(`[Smart Search] Total songs found: ${songs.length}`);

    if (songs.length === 0) {
      console.log('[Smart Search] No songs found');
      return res.json({ results: [], hasMore: false, total: 0 });
    }


    console.log('[Smart Search] First song item keys:', Object.keys(songs[0]));
    console.log('[Smart Search] First song item type:', songs[0].type);


    const scoredSongs = songs.map((s, index) => {
      try {

        const titleText = s.title?.text || s.title || '';
        const title = (typeof titleText === 'string' ? titleText : '').toLowerCase();

        // Extract artists - they're in an array
        const artistsText = s.artists?.map(a => a.name).join(' ') || '';
        const artists = artistsText.toLowerCase();

        const queryLower = query.toLowerCase();

        let score = 0;

        // Exact match gets highest score
        if (title === queryLower) score += 100;
        if (artists === queryLower) score += 100;

        // Starts with query
        if (title.startsWith(queryLower)) score += 50;
        if (artists.startsWith(queryLower)) score += 50;

        // Contains query as substring
        if (title.includes(queryLower)) score += 30;
        if (artists.includes(queryLower)) score += 30;

        // Split query into words and check each word
        const queryWords = queryLower.split(/\s+/).filter(w => w.length >= 2);
        const titleWords = title.split(/\s+/);
        const artistWords = artists.split(/\s+/);

        queryWords.forEach(queryWord => {
          // Exact word match
          if (titleWords.includes(queryWord)) score += 25;
          if (artistWords.includes(queryWord)) score += 25;

          // Word starts with query word
          titleWords.forEach(titleWord => {
            if (titleWord.startsWith(queryWord)) score += 15;
            // Partial match within word (at least 3 chars)
            if (queryWord.length >= 3 && titleWord.includes(queryWord)) score += 10;
          });

          artistWords.forEach(artistWord => {
            if (artistWord.startsWith(queryWord)) score += 15;
            // Partial match within word (at least 3 chars)
            if (queryWord.length >= 3 && artistWord.includes(queryWord)) score += 10;
          });
        });

        // If no query words, check if any part of query matches any word
        if (queryWords.length === 0 && queryLower.length >= 3) {
          titleWords.forEach(word => {
            if (word.includes(queryLower)) score += 10;
          });
          artistWords.forEach(word => {
            if (word.includes(queryLower)) score += 10;
          });
        }

        if (index === 0) {
          console.log('[Smart Search] First song scoring:');
          console.log('  - Title:', titleText);
          console.log('  - Artists:', artistsText);
          console.log('  - Query:', query);
          console.log('  - Query words:', queryWords);
          console.log('  - Score:', score);
        }

        return {
          song: s,
          score
        };
      } catch (err) {
        console.error('[Smart Search] Error scoring song:', err);
        console.error('[Smart Search] Problematic song:', JSON.stringify(s, null, 2).substring(0, 300));
        return { song: s, score: 0 };
      }
    });

    // Sort by relevance score (highest first)
    scoredSongs.sort((a, b) => b.score - a.score);

    // Filter out songs with score 0 (no match)
    const relevantSongs = scoredSongs.filter(s => s.score > 0);

    console.log(`[Smart Search] Relevant songs after filtering: ${relevantSongs.length}`);

    // Paginate
    const paginatedSongs = relevantSongs.slice(offset, offset + limit);
    const hasMore = offset + limit < relevantSongs.length;

    const results = paginatedSongs.map(({ song }) => ({
      id: song.id,
      videoId: song.id,
      title: song.title?.text || song.title || 'Unknown',
      artists: song.artists?.map(a => a.name) || [],
      duration: song.duration?.text || '',
      thumbnail: song.thumbnail?.contents?.[0]?.url || song.thumbnails?.[0]?.url || ''
    }));

    console.log(`[Smart Search] Returning ${results.length} results, hasMore: ${hasMore}`);

    res.json({
      results,
      hasMore,
      total: relevantSongs.length,
      offset,
      limit
    });

  } catch (e) {
    console.error('[Smart Search] Error:', e);
    console.error('[Smart Search] Stack:', e.stack);
    res.status(500).json({ results: [], hasMore: false, total: 0 });
  }
});


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


app.listen(port, () => {
  console.log(`рабоч ${port}`);
});
