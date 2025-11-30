// COMMENTED OUT: This API route is no longer needed as YouTube playlist is now fetched client-side
// The functionality has been moved to src/lib/utils/musicPlaylists.ts

/*
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const PLAYLIST_ID = 'PLTn24eAS2-fvP80Tf8VYzMIS81tS4b_om';

// Fetch video title from YouTube oEmbed API
async function fetchVideoTitleFromId(videoId: string): Promise<{ name: string; artist: string; fullTitle: string }> {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (response.ok) {
      const data = await response.json();
      let title = data.title || '';
      
      // Remove common suffixes
      title = title.replace(/\s*\[.*?\]/g, '').replace(/\s*\(.*?\)/g, '').trim();
      
      // Try to parse "Artist - Song" format
      const dashPatterns = [
        /^(.+?)\s*-\s*(.+)$/,  // "Artist - Song"
        /^(.+?)\s*–\s*(.+)$/,  // "Artist – Song" (en dash)
        /^(.+?)\s*—\s*(.+)$/,  // "Artist — Song" (em dash)
      ];
      
      let name = title;
      let artist = '';
      
      for (const pattern of dashPatterns) {
        const match = title.match(pattern);
        if (match) {
          const parsedArtist = match[1].trim();
          const parsedSong = match[2].trim();
          if (parsedArtist.length > 0 && parsedSong.length > 0 && parsedArtist.length < 100 && parsedSong.length < 200) {
            name = parsedSong;
            artist = parsedArtist;
            break;
          }
        }
      }
      
      return {
        youtubeId: videoId,
        youtubeEmbedUrl: `https://www.youtube.com/embed/${videoId}`,
        name: name || 'Unknown Song',
        artist: artist || '',
        fullTitle: data.title || title,
        genre: 'Music'
      };
    }
  } catch (error) {
    console.error(`Error fetching title for video ${videoId}:`, error);
  }
  
  // Fallback
  return {
    youtubeId: videoId,
    youtubeEmbedUrl: `https://www.youtube.com/embed/${videoId}`,
    name: 'Unknown Song',
    artist: '',
    fullTitle: '',
    genre: 'Music'
  };
}

// Fetch YouTube playlist videos - try multiple methods
async function fetchPlaylistVideos(): Promise<any[]> {
  try {
    // Method 1: Try RSS feed first (limited but fast)
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    const rssResponse = await fetch(apiUrl);
    let videoIds: string[] = [];
    
    if (rssResponse.ok) {
      const rssData = await rssResponse.json();
      if (rssData.items && Array.isArray(rssData.items)) {
        // Extract video IDs from RSS
        rssData.items.forEach((item: any) => {
          const link = item.link || '';
          const videoIdMatch = link.match(/[?&]v=([^&]+)/);
          if (videoIdMatch) {
            videoIds.push(videoIdMatch[1]);
          }
        });
      }
    }
    
    // Method 2: Try to get more videos from playlist page HTML
    // This is a fallback to get all videos if RSS is limited
    try {
      const playlistPageResponse = await fetch(`https://www.youtube.com/playlist?list=${PLAYLIST_ID}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (playlistPageResponse.ok) {
        const html = await playlistPageResponse.text();
        // Extract video IDs from the page
        const videoIdMatches = html.matchAll(/"videoId":"([^"]{11})"/g);
        const pageVideoIds = new Set<string>();
        
        for (const match of videoIdMatches) {
          if (match[1] && match[1].length === 11) {
            pageVideoIds.add(match[1]);
          }
        }
        
        // Combine RSS and page video IDs, removing duplicates
        pageVideoIds.forEach(id => {
          if (!videoIds.includes(id)) {
            videoIds.push(id);
          }
        });
      }
    } catch (pageError) {
      // Could not fetch playlist page, continue with RSS results
    }
    
    // Fetch titles for all videos
    const videoPromises = videoIds.map(videoId => fetchVideoTitleFromId(videoId));
    const videos = await Promise.all(videoPromises);
    
    return videos;
  } catch (error) {
    console.error('Error fetching YouTube playlist:', error);
    return [];
  }
}

export const GET: RequestHandler = async () => {
  try {
    const videos = await fetchPlaylistVideos();
    return json(videos);
  } catch (error) {
    console.error('Failed to fetch playlist videos:', error);
    return json([]);
  }
};
*/

