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
    
    // Use CORS proxy to fetch RSS directly (more reliable than RSS2JSON)
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;
    let videoIds: string[] = [];
    
    // Method 1: Try CORS proxy first (more reliable, no rate limits)
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
      console.log('Fetching YouTube RSS via CORS proxy...');
      const proxyResponse = await fetch(proxyUrl);
      
      if (proxyResponse.ok) {
        const proxyData = await proxyResponse.json();
        
        if (!proxyData.contents) {
          console.error('CORS proxy returned empty contents');
          throw new Error('CORS proxy returned empty contents');
        }
        
        console.log('CORS proxy returned data, parsing XML...');
        
        // Parse XML manually
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(proxyData.contents, 'text/xml');
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
          console.error('XML parsing error:', parserError.textContent);
          throw new Error('XML parsing failed');
        }
        
        // Try different selectors for entries
        let entries = xmlDoc.querySelectorAll('entry');
        if (entries.length === 0) {
          // Try alternative namespace
          entries = xmlDoc.getElementsByTagName('entry');
        }
        
        console.log(`Found ${entries.length} entries in RSS feed`);
        
        if (entries.length === 0) {
          throw new Error('No entries found in RSS feed');
        }
        
        // Limit to first 10 entries before processing to avoid unnecessary work
        const maxEntries = 10;
        const entriesToProcess = Array.from(entries).slice(0, maxEntries);
        console.log(`Processing first ${entriesToProcess.length} entries (limited to ${maxEntries})`);
        
        entriesToProcess.forEach((entry: any) => {
          // Try different methods to get video ID
          let videoId: string | null = null;
          
          // Method 1: Extract from id element (YouTube RSS format: yt:video:VIDEO_ID)
          const idEl = entry.getElementsByTagName('id')[0];
          if (idEl && idEl.textContent) {
            const match = idEl.textContent.match(/yt:video:([a-zA-Z0-9_-]{11})/);
            if (match && match[1]) {
              videoId = match[1];
            }
          }
          
          // Method 2: Try yt:videoId namespace (YouTube RSS format)
          if (!videoId) {
            try {
              const ytVideoId = entry.getElementsByTagNameNS('http://www.youtube.com/xml/schemas/2015', 'videoId')[0];
              if (ytVideoId && ytVideoId.textContent) {
                videoId = ytVideoId.textContent.trim();
              }
            } catch (e) {
              // Namespace method failed, try others
            }
          }
          
          // Method 3: Extract from link (most reliable fallback)
          if (!videoId) {
            const linkEls = entry.getElementsByTagName('link');
            for (let i = 0; i < linkEls.length; i++) {
              const linkEl = linkEls[i];
              const href = linkEl.getAttribute('href') || linkEl.textContent;
              if (href) {
                const match = href.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
                if (match && match[1]) {
                  videoId = match[1];
                  break;
                }
              }
            }
          }
          
          // Method 4: Try without namespace as last resort
          if (!videoId) {
            const videoIdEls = entry.getElementsByTagName('videoId');
            if (videoIdEls.length > 0 && videoIdEls[0].textContent) {
              videoId = videoIdEls[0].textContent.trim();
            }
          }
          
          if (videoId && videoId.length === 11) {
            videoIds.push(videoId);
          } else {
            console.warn('Could not extract video ID from entry:', entry);
          }
        });
        
        if (videoIds.length > 0) {
          console.log(`Successfully extracted ${videoIds.length} video IDs from RSS via CORS proxy`);
          // Skip RSS2JSON fallback since we have video IDs
        } else {
          throw new Error('No video IDs extracted from RSS');
        }
      } else {
        throw new Error(`CORS proxy failed: ${proxyResponse.status}`);
      }
    } catch (proxyError: any) {
      console.warn('CORS proxy method failed, trying RSS2JSON fallback:', proxyError.message);
      
      // Only try RSS2JSON if we don't have any video IDs yet
      if (videoIds.length === 0) {
        // Method 2: Fallback to RSS2JSON
        try {
          const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
          const rssResponse = await fetch(apiUrl);
          
          // Handle rate limiting (429) gracefully
          if (rssResponse.status === 429) {
            console.warn('RSS2JSON API rate limit reached. Using cached data if available.');
            if (cached) {
              try {
                return JSON.parse(cached);
              } catch (e) {
                // Invalid cache, return empty
              }
            }
            return [];
          }
          
          if (rssResponse.ok) {
            const rssData = await rssResponse.json();
            
            // Check if response has error
            if (rssData.status === 'error') {
              throw new Error(`RSS2JSON error: ${rssData.message}`);
            }
            
            if (rssData.items && Array.isArray(rssData.items)) {
              // Limit to first 10 items before processing
              const maxItems = 10;
              const itemsToProcess = rssData.items.slice(0, maxItems);
              console.log(`Processing first ${itemsToProcess.length} items from RSS2JSON (limited to ${maxItems})`);
              
              // Extract video IDs from RSS
              itemsToProcess.forEach((item: any) => {
                const link = item.link || '';
                const videoIdMatch = link.match(/[?&]v=([^&]+)/);
                if (videoIdMatch) {
                  videoIds.push(videoIdMatch[1]);
                }
              });
              console.log(`Successfully extracted ${videoIds.length} video IDs via RSS2JSON`);
            }
          } else {
            throw new Error(`RSS2JSON failed: ${rssResponse.status} ${rssResponse.statusText}`);
          }
        } catch (rss2jsonError) {
          console.error('RSS2JSON also failed:', rss2jsonError);
          // Return cached data if available
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
