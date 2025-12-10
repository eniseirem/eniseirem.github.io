import { writable } from 'svelte/store';
import type { BlogPost } from '../types/blogType';
import { portfolio } from '../utils/portfolioData';

// Substack posts - add your posts here
// Note: This is a static list. For dynamic Substack posts, you would need to fetch from their API
const substackPosts: BlogPost[] = [
  {
    id: 'substack-1',
    title: 'Trustworthy AI Isn\'t Optional: The Case of ChatGPT and Adam Raine',
    description: 'A reflection on how accountability defines trust in AI.',
    published_at: new Date().toISOString(), // Update with actual date
    url: `${portfolio.socialLinks.substack}/p/trustworthy-ai-isnt-optional-the`,
    type: 'substack',
    substackEmbedUrl: `${portfolio.socialLinks.substack}/p/trustworthy-ai-isnt-optional-the`,
    tag_list: ['AI', 'Ethics', 'Trustworthy AI']
  }
];

export const blogPosts = writable<BlogPost[]>([]);

// Fetch Medium posts from RSS feed (client-side)
async function fetchMediumPosts(): Promise<BlogPost[]> {
  try {
    // Check cache first (cache for 1 hour to reduce API calls)
    const cacheKey = 'medium_posts_cache';
    const cacheTimeKey = 'medium_posts_cache_time';
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
    
    const mediumUrl = portfolio.socialLinks.medium;
    const mediumMatch = mediumUrl.match(/@([^/]+)/);
    const mediumUsername = mediumMatch ? mediumMatch[1] : 'eniseirem';
    const rssUrl = `https://medium.com/feed/@${mediumUsername}`;

    let items: any[] = [];

    const normalizeDescription = (htmlOrText: string): string => {
      if (!htmlOrText) return '';
      let text = htmlOrText
        .replace(/<!\[CDATA\[/g, '')
        .replace(/\]\]>/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (text.length > 200) {
        const truncated = text.substring(0, 200);
        const lastSentenceEnd = Math.max(
          truncated.lastIndexOf('. '),
          truncated.lastIndexOf('! '),
          truncated.lastIndexOf('? ')
        );
        if (lastSentenceEnd > 50) {
          text = truncated.substring(0, lastSentenceEnd + 1) + '...';
        } else {
          const lastSpace = truncated.lastIndexOf(' ');
          text = lastSpace > 50 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
        }
      }
      return text;
    };

    // Primary: RSS2JSON (CORS-friendly)
    try {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      const response = await fetch(apiUrl);

      if (response.status === 429) {
        console.warn('RSS2JSON rate limit; using cache if available.');
        if (cached) {
          try { return JSON.parse(cached); } catch {}
        }
        return [];
      }

      if (!response.ok) throw new Error(`RSS2JSON failed: ${response.status} ${response.statusText}`);

      const data = await response.json();
      if (data?.status === 'error') throw new Error(`RSS2JSON error: ${data.message}`);

      if (data?.items && Array.isArray(data.items)) {
        items = data.items;
        console.log(`Successfully fetched ${items.length} Medium posts via RSS2JSON`);
      }
    } catch (rssErr) {
      console.warn('RSS2JSON failed, trying jina.ai proxy:', rssErr);
    }

    // Fallback: jina.ai proxy (CORS-friendly fetch of the RSS XML)
    if (items.length === 0) {
      try {
        const jinaUrl = `https://r.jina.ai/https://medium.com/feed/@${mediumUsername}`;
        const resp = await fetch(jinaUrl);
        if (!resp.ok) throw new Error(`jina proxy failed: ${resp.status}`);
        const xmlString = await resp.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        const rssItems = xmlDoc.querySelectorAll('item');
        items = Array.from(rssItems).map((item: any) => {
          const title = item.querySelector('title')?.textContent || 'Untitled';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();

          // Prefer content:encoded, else description
          let rawContent = '';
          let contentEl: Element | null = null;
          try { contentEl = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0]; } catch {}
          if (!contentEl) {
            const allElements = item.getElementsByTagName('*');
            for (let i = 0; i < allElements.length; i++) {
              const el = allElements[i];
              if (el.localName === 'encoded' || el.tagName === 'content:encoded') {
                contentEl = el;
                break;
              }
            }
          }
          if (contentEl?.textContent) rawContent = contentEl.textContent;
          if (!rawContent) rawContent = item.querySelector('description')?.textContent || '';

          const description = normalizeDescription(rawContent);
          const categories = Array.from(item.querySelectorAll('category')).map((cat: any) => cat.textContent);

          return {
            title,
            link,
            pubDate,
            description,
            contentSnippet: description,
            categories
          };
        });
        console.log(`Successfully parsed ${items.length} Medium posts via jina proxy`);
      } catch (jinaErr) {
        console.error('jina proxy also failed:', jinaErr);
      }
    }
    
    // If no items found, return cached or empty
    if (items.length === 0) {
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          // Invalid cache
        }
      }
      return [];
    }
    
    // Convert RSS items to BlogPost format (handle both CORS proxy and RSS2JSON formats)
    const mediumPosts: BlogPost[] = items.map((item: any, index: number) => {
      // Handle both formats: CORS proxy (direct RSS) and RSS2JSON
      const title = item.title || 'Untitled';
      const url = item.link || item.guid || '';
      const pubDate = item.pubDate || item.pubDate || new Date().toISOString();
      
      // Extract description - handle both formats
      let description = item.contentSnippet || item.description || '';
      // Remove HTML tags and clean up
      description = description
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // If longer than 200 chars, find the last complete sentence
      if (description.length > 200) {
        const truncated = description.substring(0, 200);
        // Find the last sentence ending (. ! ?) before the 200 char limit
        const lastSentenceEnd = Math.max(
          truncated.lastIndexOf('. '),
          truncated.lastIndexOf('! '),
          truncated.lastIndexOf('? ')
        );
        
        if (lastSentenceEnd > 50) {
          // Use the text up to the last complete sentence
          description = truncated.substring(0, lastSentenceEnd + 1) + '...';
        } else {
          // If no sentence ending found, find the last word boundary
          const lastSpace = truncated.lastIndexOf(' ');
          if (lastSpace > 50) {
            description = truncated.substring(0, lastSpace) + '...';
          } else {
            description = truncated + '...';
          }
        }
      }
      
      // Extract tags from categories if available (handle both array and NodeList)
      let tag_list: string[] = [];
      if (item.categories) {
        if (Array.isArray(item.categories)) {
          tag_list = item.categories.slice(0, 5);
        } else if (typeof item.categories === 'object' && item.categories.length) {
          tag_list = Array.from(item.categories).slice(0, 5).map((cat: any) => 
            typeof cat === 'string' ? cat : (cat.textContent || cat)
          );
        }
      }
      
      // Generate unique ID from URL or use index
      const urlSlug = url.split('/').pop() || `post-${index}`;
      const id = `medium-${urlSlug}`;
      
      return {
        id: id,
        title: title,
        description: description || 'No description available',
        published_at: pubDate,
        url: url,
        type: 'medium',
        tag_list: tag_list
      };
    });
    
    // Cache the results
    try {
      localStorage.setItem(cacheKey, JSON.stringify(mediumPosts));
      localStorage.setItem(cacheTimeKey, Date.now().toString());
    } catch (e) {
      // localStorage might be disabled, ignore
    }
    
    return mediumPosts;
  } catch (error) {
    console.error('Error fetching Medium posts:', error);
    // Try to return cached data as fallback
    const cacheKey = 'medium_posts_cache';
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

// Clear Medium posts cache
export function clearBlogCache(): void {
  try {
    localStorage.removeItem('medium_posts_cache');
    localStorage.removeItem('medium_posts_cache_time');
    console.log('Blog posts cache cleared');
  } catch (e) {
    console.warn('Failed to clear blog cache:', e);
  }
}

export async function fetchBlogPosts(maxRetries = 2, delay = 2000, clearCache: boolean = false) {
  if (clearCache) {
    clearBlogCache();
  }
  
  let retries = 0;
  const allPosts: BlogPost[] = [...substackPosts]; // Start with Substack posts
  
  while (retries < maxRetries) {
    try {
      // Fetch Medium posts directly from client-side
      const mediumPosts = await fetchMediumPosts();
      if (Array.isArray(mediumPosts) && mediumPosts.length > 0) {
        allPosts.push(...mediumPosts);
      }
      
      // Sort by published date (newest first)
      allPosts.sort((a, b) => {
        const dateA = new Date(a.published_at).getTime();
        const dateB = new Date(b.published_at).getTime();
        return dateB - dateA;
      });
      blogPosts.set(allPosts);
      return;
    } catch (error: any) {
      // If it's a rate limit error, don't retry immediately
      if (error?.message?.includes('429') || error?.status === 429) {
        console.warn('Rate limit reached. Using cached or fallback data.');
        // Still show Substack posts even if Medium fails
        blogPosts.set(allPosts);
        return;
      }
      
      console.error('Error fetching blog posts:', error);
      retries++;
      if (retries < maxRetries) {
        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
  
  // If fetching fails, still show Substack posts
  blogPosts.set(allPosts);
}