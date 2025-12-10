import type { Song } from '../types/music';
import { writable } from 'svelte/store';

const PLAYLIST_ID = 'PLTn24eAS2-fvP80Tf8VYzMIS81tS4b_om';

// Initial empty array - will be populated from API
export const ALL_MUSIC = writable<Song[]>([]);

// Fetch video title from YouTube oEmbed API (client-side)
async function fetchVideoTitleFromId(videoId: string): Promise<{ name: string; artist: string; fullTitle: string; youtubeId: string; youtubeEmbedUrl: string; genre: string }> {
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

// Fetch YouTube playlist videos (client-side)
async function fetchPlaylistVideos(): Promise<any[]> {
  try {
    // Check cache first (cache for 1 hour to reduce API calls)
    const cacheKey = 'youtube_playlist_cache';
    const cacheTimeKey = 'youtube_playlist_cache_time';
    const cached = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(cacheTimeKey);
    
    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      const oneHour = 60 * 60 * 1000;
      if (age < oneHour) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          // Invalid cache, continue to fetch
        }
      }
    }
    
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;
    let videoIds: string[] = [];

    const parseRssXml = (xmlString: string): string[] => {
      const ids: string[] = [];
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) throw new Error('XML parsing failed');

      let entries = xmlDoc.querySelectorAll('entry');
      if (entries.length === 0) entries = xmlDoc.getElementsByTagName('entry');

      const maxEntries = 10;
      const entriesToProcess = Array.from(entries).slice(0, maxEntries);
      entriesToProcess.forEach((entry: any) => {
        let videoId: string | null = null;

        const idEl = entry.getElementsByTagName('id')[0];
        if (idEl?.textContent) {
          const match = idEl.textContent.match(/yt:video:([a-zA-Z0-9_-]{11})/);
          if (match?.[1]) videoId = match[1];
        }

        if (!videoId) {
          try {
            const ytVideoId = entry.getElementsByTagNameNS('http://www.youtube.com/xml/schemas/2015', 'videoId')[0];
            if (ytVideoId?.textContent) videoId = ytVideoId.textContent.trim();
          } catch {}
        }

        if (!videoId) {
          const linkEls = entry.getElementsByTagName('link');
          for (let i = 0; i < linkEls.length; i++) {
            const href = linkEls[i].getAttribute('href') || linkEls[i].textContent;
            if (href) {
              const match = href.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
              if (match?.[1]) {
                videoId = match[1];
                break;
              }
            }
          }
        }

        if (!videoId) {
          const videoIdEls = entry.getElementsByTagName('videoId');
          if (videoIdEls.length > 0 && videoIdEls[0].textContent) {
            videoId = videoIdEls[0].textContent.trim();
          }
        }

        if (videoId?.length === 11) ids.push(videoId);
      });

      return ids;
    };

    // Method 1: Try RSS2JSON (CORS-friendly)
    try {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      const rssResponse = await fetch(apiUrl);

      if (rssResponse.status === 429) {
        console.warn('RSS2JSON rate limit; using cache if available.');
        if (cached) {
          try { return JSON.parse(cached); } catch {}
        }
        return [];
      }

      if (rssResponse.ok) {
        const rssData = await rssResponse.json();
        if (rssData.status === 'error') throw new Error(`RSS2JSON error: ${rssData.message}`);

        if (rssData.items && Array.isArray(rssData.items)) {
          const maxItems = 10;
          const itemsToProcess = rssData.items.slice(0, maxItems);
          itemsToProcess.forEach((item: any) => {
            const link = item.link || '';
            const match = link.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
            if (match?.[1]) videoIds.push(match[1]);
          });
        }
      } else {
        throw new Error(`RSS2JSON failed: ${rssResponse.status} ${rssResponse.statusText}`);
      }
    } catch (rssErr) {
      console.warn('RSS2JSON failed, trying jina proxy:', (rssErr as Error).message);
    }

    // Method 2: Fallback to jina.ai proxy (CORS-friendly fetch)
    if (videoIds.length === 0) {
      try {
        const jinaUrl = `https://r.jina.ai/https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;
        const resp = await fetch(jinaUrl);
        if (!resp.ok) throw new Error(`jina proxy failed: ${resp.status}`);
        const text = await resp.text();
        videoIds = parseRssXml(text);
      } catch (jinaErr) {
        console.error('jina proxy also failed:', jinaErr);
      }
    }
    
    // If no video IDs found, return cached or empty
    if (videoIds.length === 0) {
      console.warn('No video IDs extracted. Using cached data if available.');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          // Invalid cache
        }
      }
      return [];
    }
    
    // Fetch titles for all videos (with error handling)
    const videoPromises = videoIds.map(async (videoId) => {
      try {
        return await fetchVideoTitleFromId(videoId);
      } catch (error) {
        console.warn(`Failed to fetch title for video ${videoId}:`, error);
        // Return fallback video object
        return {
          youtubeId: videoId,
          youtubeEmbedUrl: `https://www.youtube.com/embed/${videoId}`,
          name: 'Unknown Song',
          artist: '',
          fullTitle: '',
          genre: 'Music'
        };
      }
    });
    
    const videos = await Promise.all(videoPromises);
    
    // Cache the results
    try {
      localStorage.setItem(cacheKey, JSON.stringify(videos));
      localStorage.setItem(cacheTimeKey, Date.now().toString());
    } catch (e) {
      // localStorage might be disabled, ignore
    }
    
    return videos;
  } catch (error) {
    console.error('Error fetching YouTube playlist:', error);
    // Try to return cached data as fallback
    const cacheKey = 'youtube_playlist_cache';
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Invalid cache
      }
    }
    return [];
  }
}

// Clear YouTube playlist cache
export function clearPlaylistCache(): void {
  try {
    localStorage.removeItem('youtube_playlist_cache');
    localStorage.removeItem('youtube_playlist_cache_time');
    console.log('YouTube playlist cache cleared');
  } catch (e) {
    console.warn('Failed to clear cache:', e);
  }
}

// Fetch playlist (client-side)
export async function fetchPlaylist(clearCache: boolean = false): Promise<Song[]> {
  try {
    if (clearCache) {
      clearPlaylistCache();
    }
    const videos = await fetchPlaylistVideos();
    const songs: Song[] = videos.map((video: any) => ({
      name: video.name || '',
      artist: video.artist || '',
      genre: video.genre || 'Music',
      youtubeId: video.youtubeId || '',
      youtubeEmbedUrl: video.youtubeEmbedUrl || ''
    }));
    ALL_MUSIC.set(songs);
    return songs;
  } catch (error) {
    console.error('Failed to fetch playlist:', error);
    return [];
  }
}
