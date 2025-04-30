import fetch from 'node-fetch';

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
    if (!videoId) return res.status(404).json({ error: 'No video found' });

    const details = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    ).then(r => r.json());
    const title = details.items?.[0]?.snippet?.title || null;

    return res.status(200).json({ videoId, title });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch video' });
  }
}
