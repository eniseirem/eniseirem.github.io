<script lang="ts">
    import { onMount } from 'svelte';
    import type { BlogPost } from '../types/blogType';
    import { blogPosts, fetchBlogPosts } from '../stores/blogStore';
    import { closeWindow, toggleMinimize, toggleMaximize } from "../stores/windowStore";
    import type { wType } from "../types/wType";
    import SvelteMarkdown from 'svelte-markdown';
    import 'github-markdown-css/github-markdown-light.css';
    import { portfolio } from '../utils/portfolioData';
  
    export let startDrag: (e: MouseEvent, id: string, action: 'move' | 'resize') => void;
    export let window: wType;
  
    let selectedPost: BlogPost | null = null;
    let isLoading: boolean = true;
    let substackScriptLoaded = false;
  
    onMount(async () => {
      isLoading = true;
      await fetchBlogPosts();
      isLoading = false;
      
      // Load Substack embed script
      if (!substackScriptLoaded && typeof document !== 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://substack.com/embedjs/embed.js';
        script.async = true;
        script.charset = 'utf-8';
        document.head.appendChild(script);
        substackScriptLoaded = true;
      }
    });
  
    function selectPost(post: BlogPost) {
      selectedPost = post;
    }
  
    function openPostLink(url: string) {
      if (typeof globalThis !== 'undefined') {
        globalThis.window.open(url, '_blank');
      }
    }
  
    function getRandomColor() {
      const colors = ['bg-red-200 text-red-800', 'bg-blue-200 text-blue-800', 'bg-green-200 text-green-800', 
                      'bg-yellow-200 text-yellow-800', 'bg-purple-200 text-purple-800', 'bg-pink-200 text-pink-800'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
</script>
  
<div class="bg-white h-full rounded-lg flex flex-col overflow-hidden font-sans">
  <!-- Blog Header -->
  <div class="bg-gray-100 px-2 py-2 flex items-center cursor-move border-b border-gray-200" on:mousedown={(e) => startDrag(e, window.id, "move")}>
    <div class="flex space-x-2 mr-4">
      <button class="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 focus:outline-none" on:click={() => closeWindow(window.id)}>
        <svg class="w-3 h-3 text-red-800 opacity-0 hover:opacity-100" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button class="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 focus:outline-none" on:click={() => toggleMinimize(window.id)}>
        <svg class="w-3 h-3 text-yellow-800 opacity-0 hover:opacity-100" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M20 12H4" />
        </svg>
      </button>
      <button class="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 focus:outline-none" on:click={() => toggleMaximize(window.id)}>
        <svg class="w-3 h-3 text-green-800 opacity-0 hover:opacity-100" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
        </svg>
      </button>
    </div>
    <div class="flex-grow text-center font-semibold">Blog Posts</div>
    <div class="flex space-x-2">
      {#if portfolio.socialLinks.medium}
      <a href={portfolio.socialLinks.medium} target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-gray-800">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
        </svg>
      </a>
      {/if}
      {#if portfolio.socialLinks.substack}
      <a href={portfolio.socialLinks.substack} target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-gray-800">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
        </svg>
      </a>
      {/if}
    </div>
  </div>
  
  <div class="flex-grow flex overflow-hidden">
    <div class="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50">
      {#if isLoading}
        <div class="flex justify-center items-center h-full">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      {:else}
        {#each $blogPosts as post, index}
          <div 
            class="p-4 hover:bg-gray-100 cursor-pointer transition-colors duration-200 {selectedPost === post ? 'bg-blue-100 border-l-2 border-blue-500' : ''}"
            on:click={() => selectPost(post)}
          >
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-semibold text-gray-800 truncate">{post.title}</h3>
              <button 
                class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                on:click|stopPropagation={() => openPostLink(post.url)}
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-gray-600 mb-2 line-clamp-2">{post.description}</p>
            <div class="flex justify-between items-center text-xs text-gray-500">
              <span>{new Date(post.published_at).toLocaleDateString()}</span>
              <div class="flex items-center gap-3">
                {#if post.reading_time_minutes}
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {post.reading_time_minutes}m
                </span>
                {/if}
                {#if post.page_views_count}
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {post.page_views_count.toLocaleString()}
                </span>
                {/if}
                {#if post.type === 'substack'}
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-orange-200 text-orange-800">Substack</span>
                {/if}
                {#if post.type === 'medium'}
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-200 text-green-800">Medium</span>
                {/if}
              </div>
            </div>
            {#if post.tag_list && post.tag_list.length > 0}
            <div class="flex flex-wrap gap-1 mt-2">
              {#each post.tag_list as tag}
                <span class="px-2 py-1 text-xs font-medium rounded-full {getRandomColor()}">{tag}</span>
              {/each}
            </div>
            {/if}
          </div>
          {#if index < $blogPosts.length - 1}
            <hr class="border-gray-300" />
          {/if}
        {/each}
      {/if}
    </div>
  
    <div class="flex-1 overflow-hidden flex flex-col bg-white">
      {#if selectedPost}
        <div class="overflow-y-auto flex-grow p-6">
          <h1 class="text-2xl font-bold mb-4">{selectedPost.title}</h1>
          {#if selectedPost.cover_image}
            <img src={selectedPost.cover_image} alt={selectedPost.title} class="w-full h-48 object-cover mb-4 rounded-lg" />
          {/if}
          
          {#if selectedPost.type === 'substack' && selectedPost.substackEmbedUrl}
            <div class="substack-post-embed mb-6 p-6 bg-orange-50 border border-orange-200 rounded-lg">
              <div class="flex items-center mb-3">
                <svg class="w-5 h-5 mr-2 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                </svg>
                <span class="text-sm font-semibold text-orange-600">Substack</span>
              </div>
              <p lang="en" class="text-lg font-semibold mb-2 text-gray-900">{selectedPost.title}</p>
              <p class="text-gray-600 mb-4">{selectedPost.description}</p>
              <a 
                data-post-link 
                href={selectedPost.substackEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Read on Substack
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          {:else if selectedPost.type === 'medium'}
            <div class="medium-post-embed mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center mb-3">
                <svg class="w-5 h-5 mr-2 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                </svg>
                <span class="text-sm font-semibold text-green-600">Medium</span>
              </div>
              <p lang="en" class="text-lg font-semibold mb-2 text-gray-900">{selectedPost.title}</p>
              <p class="text-gray-600 mb-4">{selectedPost.description}</p>
              <a 
                href={selectedPost.url}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Read on Medium
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          {:else if selectedPost.body_markdown}
          <div class="markdown-body prose prose-sm max-w-none">
            <SvelteMarkdown source={selectedPost.body_markdown} />
          </div>
          {:else}
            <div class="text-gray-600">
              <p>{selectedPost.description}</p>
              <a 
                href={selectedPost.url} 
                target="_blank" 
                rel="noopener noreferrer"
                class="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Read full article
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          {/if}
        </div>
      {:else}
        <div class="p-6 flex items-center justify-center h-full">
          <p class="text-gray-600 text-center">Select a blog post to view details</p>
        </div>
      {/if}
    </div>
  </div>
</div>
  
<style>
  :global(.markdown-body) {
    box-sizing: border-box;
    min-width: 200px;
    max-width: 980px;
    margin: 0 auto;
    padding: 45px;
  }
  
  @media (max-width: 767px) {
    :global(.markdown-body) {
      padding: 15px;
    }
  }
</style>
