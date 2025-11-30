// COMMENTED OUT: This API route is no longer needed as Medium posts are now fetched client-side
// The functionality has been moved to src/lib/stores/blogStore.ts

/*
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { BlogPost } from '$lib/types/blogType';
import { portfolio } from '$lib/utils/portfolioData';

// Fetch Medium posts from RSS feed
async function fetchMediumPosts(): Promise<BlogPost[]> {
  try {
    // Use RSS2JSON API to convert Medium RSS feed to JSON
    // Extract Medium username from portfolio socialLinks.medium
    const mediumUrl = portfolio.socialLinks.medium;
    const mediumMatch = mediumUrl.match(/@([^/]+)/);
    const mediumUsername = mediumMatch ? mediumMatch[1] : 'eniseirem';
    const rssUrl = `https://medium.com/feed/@${mediumUsername}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Medium RSS: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }
    
    // Convert RSS items to BlogPost format
    const mediumPosts: BlogPost[] = data.items.map((item: any, index: number) => {
      // Extract description from content or use contentSnippet
      let description = item.contentSnippet || item.description || '';
      // Remove HTML tags and clean up
      description = description
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .substring(0, 200);
      
      // Extract tags from categories if available
      const tag_list = item.categories && Array.isArray(item.categories) 
        ? item.categories.slice(0, 5) 
        : [];
      
      // Generate unique ID from URL or use index
      const url = item.link || item.guid || '';
      const urlSlug = url.split('/').pop() || `post-${index}`;
      const id = `medium-${urlSlug}`;
      
      return {
        id: id,
        title: item.title || 'Untitled',
        description: description || 'No description available',
        published_at: item.pubDate || new Date().toISOString(),
        url: url,
        type: 'medium',
        tag_list: tag_list
      };
    });
    
    return mediumPosts;
  } catch (error) {
    console.error('Error fetching Medium posts:', error);
    return [];
  }
}

export const GET: RequestHandler = async () => {
  try {
    const mediumPosts = await fetchMediumPosts();
    return json(mediumPosts);
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return json([]);
  }
};
*/

