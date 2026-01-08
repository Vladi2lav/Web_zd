import play from 'play-dl';

const videoId = 'dQw4w9WgXcQ'; // Rick Roll (Known good ID)
const url = `https://www.youtube.com/watch?v=${videoId}`;

console.log(`Testing stream with URL: ${url}`);

try {
    const stream = await play.stream(url, { quality: 2 });
    console.log('Stream successfully created');
} catch (error) {
    console.error('Error creating stream:', error);
}

console.log('--- Testing with "undefined" string ---');
try {
    const stream = await play.stream('https://www.youtube.com/watch?v=undefined', { quality: 2 });
    console.log('Undefined stream created (unexpected)');
} catch (error) {
    console.error('Expected error with undefined:', error);
}
