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
        title: item.title?.text || item.title,
        artists: parseArtists(item), // Use helper
        duration: item.duration?.text,
        thumbnail: item.thumbnail?.contents?.[0]?.url || item.thumbnails?.[0]?.url
      }));

    res.json(songs);
  } catch (e) {
    console.error(e);
    res.status(500).json([]);
  }
});

function parseArtists(item) {
  // youtubei.js usually provides structured artists
  if (Array.isArray(item.artists)) {
    return item.artists.map(a => ({
      name: a.name,
      id: a.channel_id || a.id
    }));
  }
  // Fallback if not parsed well (rare)
  return [];
}

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


app.get('/api/album/:id', async (req, res) => {
  try {
    const album = await youtube.music.getAlbum(req.params.id);

    const simpleAlbum = {
      title: album.header.title.text,
      artist: album.header.author?.name || 'Unknown Artist',
      cover: album.header.thumbnails?.[0]?.url,
      tracks: album.contents.map(item => ({
        id: item.id,
        videoId: item.id,
        title: item.title,
        artists: item.artists?.map(a => a.name) || [],
        duration: item.duration?.text,
        thumbnail: item.thumbnail?.contents?.[0]?.url
      }))
    };

    res.json(simpleAlbum);
  } catch (e) {
    console.error("Error fetching album:", e);
    res.status(500).json({ error: "Failed to fetch album" });
  }
});


app.get('/api/artist/:id', async (req, res) => {
  try {
    const artist = await youtube.music.getArtist(req.params.id);

    // Extract basic info
    // Extract basic info
    let name = artist.header?.title?.text || artist.name || 'Unknown Artist';
    let description = artist.header?.description?.text || '';
    let image = artist.header?.thumbnails?.[0]?.url;

    // Fallback: If image is missing, try to find it via search (like Search page)
    if (!image && name !== 'Unknown Artist') {
      try {
        const search = await youtube.music.search(name, { type: 'artist' });
        const match = search.artists?.find(a => a.name === name) || search.artists?.[0];
        if (match) {
          image = match.thumbnail?.contents?.[0]?.url;
        }
      } catch (err) {
        console.error("Fallback artist image search failed:", err);
      }
    }

    const info = {
      name,
      description,
      image,
    };

    // Extract Top Songs
    const topSongsShelf = artist.sections?.find(s => s.title?.text === 'Top songs' || s.title?.text === 'Popular');
    const topTracks = topSongsShelf?.contents?.map(item => ({
      id: item.id,
      videoId: item.id,
      title: item.title,
      artists: [{ name: info.name, id: req.params.id }],
      duration: item.duration?.text,
      thumbnail: item.thumbnail?.contents?.[0]?.url
    })) || [];


    // Extract Albums
    let albums = [];
    const albumShelves = artist.sections?.filter(s =>
      s.title?.text?.includes('Albums') ||
      s.title?.text?.includes('Singles') ||
      s.title?.text?.includes('EPs')
    );

    if (albumShelves) {
      albumShelves.forEach(shelf => {
        const items = shelf.contents?.map(item => ({
          id: item.id,
          idStr: item.browse_endpoint?.browse_id,
          title: item.title,
          artist: info.name,
          cover: item.thumbnail?.contents?.[0]?.url,
          year: item.subtitle
        }));
        if (items) albums = albums.concat(items);
      });
    }

    res.json({
      info,
      topTracks: topTracks.slice(0, 10),
      albums
    });
  } catch (e) {
    console.error("Error fetching artist:", e);
    res.status(500).json({ error: "Failed to fetch artist" });
  }
});


app.get('/api/search/smart', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.length < 2) return res.json({ artists: [], albums: [], tracks: [] });

    console.log(`[Smart Search] Query: "${query}"`);
    const search = await youtube.music.search(query);

    let artists = [];
    let albums = [];
    let tracks = [];

    const processItem = (item, shelfType) => {
      if (!item) return;

      // Helper to get text from various layouts
      const getFlexText = (index) => {
        if (item.flex_columns && item.flex_columns[index]) {
          return item.flex_columns[index].title?.text || '';
        }
        return '';
      };

      const title = item.title?.text || item.title || getFlexText(0);
      const subtitle = item.subtitle?.text || item.subtitle || getFlexText(1);
      const id = item.id;

      // Determine type based on ID structure and text strings
      let type = 'unknown';

      const isArtist = (id && id.startsWith('UC')) || (subtitle && (subtitle.includes('Artist') || subtitle.includes('Profile')));
      const isAlbum = (id && id.startsWith('MPREb')) || (subtitle && subtitle.includes('Album')) || (getFlexText(1).includes('Album'));
      const isTrack = (item.video_id) || (subtitle && (subtitle.includes('Song') || subtitle.includes('Video'))) || (getFlexText(1).includes('Song'));

      if (isArtist) type = 'artist';
      else if (isAlbum) type = 'album';
      else if (isTrack) type = 'track';
      // Shelves Fallback
      else if (shelfType === 'Albums') type = 'album';
      else if (shelfType === 'Songs') type = 'track';
      else if (shelfType === 'Artists') type = 'artist';

      // Add to arrays
      if (type === 'artist') {
        artists.push({
          id: id,
          name: title,
          image: item.thumbnail?.contents?.[0]?.url,
          subscribers: subtitle
        });
      } else if (type === 'album') {
        albums.push({
          id: id,
          idStr: id,
          title: title,
          artist: subtitle.replace('Album • ', '').split(' • ')[0],
          cover: item.thumbnail?.contents?.[0]?.url
        });
      } else if (type === 'track') {
        tracks.push({
          id: id,
          videoId: item.video_id || id,
          title: title,
          artists: parseArtists(item),
          duration: item.duration?.text || '', // Duration sometimes in flex cols too?
          thumbnail: item.thumbnail?.contents?.[0]?.url
        });
      }
    };

    if (search.contents && Array.isArray(search.contents)) {
      search.contents.forEach(shelf => {
        let shelfTitle = shelf.title?.text || '';

        // Handle MusicCardShelf (Top Result)
        if (shelf.type === 'MusicCardShelf') {
          // The shelf *itself* is often the "Top Result" artist/album/song
          // Try to extract metadata from the shelf properties
          const isArtist = shelf.subtitle?.text?.includes('Artist') || shelf.title?.text === 'Ado'; // Heuristic
          // Note: youtubei.js structure for shelf properties might vary.
          // Depending on the version, title might be text, properties might be directly on shelf.

          // Let's create a synthetic item from the shelf metadata to pass to processItem
          // Or handle it directly.

          // Attempt to grab header data if available
          const header = shelf.header;
          if (header) {
            processItem(header, 'Top Result');
          }

          // ALSO process contents (usually songs/albums under the card)
          if (shelf.contents && Array.isArray(shelf.contents)) {
            shelf.contents.forEach(item => processItem(item, 'Top Result'));
          }

          // If header didn't exist or work, try shelf properties directly
          // Sometimes the shelf has title, thumbnail, navigation_endpoint
          if (!header && shelf.title) {
            const syntheticItem = {
              id: shelf.on_tap?.payload?.browseId || '', // browseId often in on_tap or main navigation
              title: shelf.title,
              subtitle: shelf.subtitle,
              thumbnail: shelf.thumbnail,
              navigation_endpoint: shelf.header?.navigation_endpoint || shelf.on_tap
            };
            // Only push if it looks like an artist/album
            processItem(syntheticItem, 'Top Result');
          }

        } else {
          if (shelf.contents && Array.isArray(shelf.contents)) {
            shelf.contents.forEach(item => processItem(item, shelfTitle));
          }
        }
      });
    }

    // Safety fallback for API libraries that pre-parse
    if (artists.length === 0 && search.artists?.length) artists = search.artists.map(a => ({ id: a.id, name: a.name, image: a.thumbnail?.contents?.[0]?.url }));
    if (albums.length === 0 && search.albums?.length) albums = search.albums.map(a => ({ id: a.id, idStr: a.id, title: a.title, artist: a.artist?.name, cover: a.thumbnail?.contents?.[0]?.url }));

    // Sort & Limit
    res.json({
      artists: artists.slice(0, 5),
      albums: albums.slice(0, 10),
      tracks: tracks.slice(0, 20)
    });

  } catch (e) {
    console.error('[Smart Search] Error:', e);
    res.status(500).json({ artists: [], albums: [], tracks: [] });
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
