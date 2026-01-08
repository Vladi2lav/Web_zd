import play from 'play-dl';

const videoId = 'ZQD3r3d3eFc'; // The ID from your log
const url = `https://www.youtube.com/watch?v=${videoId}`;

console.log(`[Diagnostic] Testing play-dl with fixed URL: ${url}`);

try {
    const stream = await play.stream(url, { quality: 2 });
    console.log('[Diagnostic] SUCCESS: Stream created.');
} catch (error) {
    console.error('[Diagnostic] FAILURE: play-dl crashed.');
    console.error(error);
}
