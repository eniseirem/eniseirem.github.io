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
    
    // Extract Medium username from portfolio socialLinks.medium
    const mediumUrl = portfolio.socialLinks.medium;
    const mediumMatch = mediumUrl.match(/@([^/]+)/);
    const mediumUsername = mediumMatch ? mediumMatch[1] : 'eniseirem';
    const rssUrl = `https://medium.com/feed/@${mediumUsername}`;
    
    // Use CORS proxy to fetch RSS directly (more reliable than RSS2JSON)
    // Try allorigins.win first, then RSS2JSON as fallback
    let data: any = null;
    let items: any[] = [];
    
    // Method 1: Try CORS proxy to fetch and parse RSS directly
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
      const proxyResponse = await fetch(proxyUrl);
      
      if (proxyResponse.ok) {
        const proxyData = await proxyResponse.json();
        // Parse XML manually
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(proxyData.contents, 'text/xml');
        const rssItems = xmlDoc.querySelectorAll('item');
        
        items = Array.from(rssItems).map((item: any) => {
          // Try multiple description sources
          let description = '';
          
          // Method 1: Try content:encoded (Medium uses this with full HTML content)
          // Need to handle namespace properly
          let contentEl = null;
          try {
            // Try with namespace
            contentEl = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0];
          } catch (e) {
            // Namespace method failed, try without
          }
          
          if (!contentEl) {
            // Try different ways to find content:encoded
            const allElements = item.getElementsByTagName('*');
            for (let i = 0; i < allElements.length; i++) {
              const el = allElements[i];
              if (el.localName === 'encoded' || el.tagName === 'content:encoded') {
                contentEl = el;
                break;
              }
            }
          }
          
          if (contentEl && contentEl.textContent) {
            // Extract first meaningful paragraph from HTML content
            const htmlContent = contentEl.textContent;
            // Remove HTML tags
            let textContent = htmlContent.replace(/<[^>]*>/g, '');
            // Remove CDATA markers if present
            textContent = textContent.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '');
            // Get first paragraph or first 200 characters
            let firstParagraph = textContent
              .split('\n')
              .find((p: string) => p.trim().length > 20) || textContent.substring(0, 200);
            
            // Clean up whitespace
            firstParagraph = firstParagraph.replace(/\s+/g, ' ').trim();
            
            // If longer than 200 chars, find the last complete sentence
            if (firstParagraph.length > 200) {
              const truncated = firstParagraph.substring(0, 200);
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
            } else {
              description = firstParagraph;
            }
          }
          
          // Method 2: Try description tag (fallback)
          if (!description) {
            const descEl = item.querySelector('description');
            if (descEl && descEl.textContent) {
              let descText = descEl.textContent
                .replace(/<[^>]*>/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              
              // If longer than 200 chars, find the last complete sentence
              if (descText.length > 200) {
                const truncated = descText.substring(0, 200);
                const lastSentenceEnd = Math.max(
                  truncated.lastIndexOf('. '),
                  truncated.lastIndexOf('! '),
                  truncated.lastIndexOf('? ')
                );
                
                if (lastSentenceEnd > 50) {
                  description = truncated.substring(0, lastSentenceEnd + 1) + '...';
                } else {
                  const lastSpace = truncated.lastIndexOf(' ');
                  if (lastSpace > 50) {
                    description = truncated.substring(0, lastSpace) + '...';
                  } else {
                    description = truncated + '...';
                  }
                }
              } else {
                description = descText;
              }
            }
          }
          
          return {
            title: item.querySelector('title')?.textContent || 'Untitled',
            link: item.querySelector('link')?.textContent || '',
            pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
            description: description,
            contentSnippet: description, // Also set contentSnippet for compatibility
            categories: Array.from(item.querySelectorAll('category')).map((cat: any) => cat.textContent)
          };
        });
        
        console.log(`Successfully parsed ${items.length} Medium posts via CORS proxy`);
      }
    } catch (proxyError) {
      console.warn('CORS proxy method failed, trying RSS2JSON:', proxyError);
      
      // Method 2: Fallback to RSS2JSON
      try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        const response = await fetch(apiUrl);
        
        // Handle rate limiting (429) gracefully
        if (response.status === 429) {
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
        
        if (!response.ok) {
          throw new Error(`RSS2JSON failed: ${response.status} ${response.statusText}`);
        }
        
        data = await response.json();
        
        // Check if response has error
        if (data && data.status === 'error') {
          throw new Error(`RSS2JSON error: ${data.message}`);
        }
        
        if (data && data.items && Array.isArray(data.items)) {
          items = data.items;
          console.log(`Successfully fetched ${items.length} Medium posts via RSS2JSON`);
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