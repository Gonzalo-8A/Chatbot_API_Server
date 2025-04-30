// api/search.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!query || !apiKey) {
    return res.status(400).json({ error: 'Missing query or API key' });
  }

  try {
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${apiKey}&type=video&maxResults=1`
    );
    const searchData = await searchResponse.json();

    const videoId = searchData.items?.[0]?.id?.videoId;

    if (!videoId) {
      return res.status(404).json({ error: 'No video found' });
    }

    const videoDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );
    const videoDetails = await videoDetailsResponse.json();

    const title = videoDetails.items?.[0]?.snippet?.title;

    res.status(200).json({ videoId, title: title || null });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
}
