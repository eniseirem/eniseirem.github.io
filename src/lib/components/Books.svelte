<script lang="ts">
  import type { wType } from "../types/wType";
  import { closeWindow, toggleMinimize, toggleMaximize } from "../stores/windowStore";
  import { portfolio } from "../utils/portfolioData";
  import { onMount } from "svelte";
  import { base } from "$app/paths";

  export let startDrag: (e: MouseEvent, id: string, action: 'move' | 'resize') => void;
  export let window: wType;

  let activeNav = "reading-list";

  function openPaper(url: string) {
    if (typeof globalThis !== 'undefined') {
      globalThis.window.open(url, '_blank');
    }
  }

  function handleBookClick(e: MouseEvent, url: string) {
    if ((e.target as HTMLElement).tagName !== 'A') {
      openPaper(url);
    }
  }

  // Color variations for book covers
  const coverColors = ['blue', 'orange', 'green', 'purple', 'red'];
  
  function getCoverColor(index: number): string {
    return coverColors[index % coverColors.length];
  }
</script>

<div class="bg-white h-full rounded-lg flex flex-col overflow-hidden font-sans">
  <!-- Books Header -->
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
    <div class="flex-grow text-center font-semibold">Books</div>
  </div>

  <!-- Books Body -->
  <div class="books-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-section">
        <div class="section-title">Library</div>
        <div class="nav-item" class:active={activeNav === "reading-list"} on:click={() => activeNav = "reading-list"}>
          <span class="nav-icon">📚</span>
          <span>Reading List</span>
        </div>
      </div>
      <div class="sidebar-section">
        <div class="section-title">Collections</div>
        <div class="nav-item" class:active={activeNav === "research"} on:click={() => activeNav = "research"}>
          <span class="nav-icon">🔬</span>
          <span>Research Papers</span>
        </div>
        <div class="nav-item" class:active={activeNav === "books"} on:click={() => activeNav = "books"}>
          <span class="nav-icon">📖</span>
          <span>Manga & Books</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      {#if activeNav === "reading-list" || activeNav === "research"}
        <div class="content-header">
          <h1 class="page-title">Research Papers</h1>
          <p class="page-subtitle">{portfolio.currentlyReading.length} {portfolio.currentlyReading.length === 1 ? 'paper' : 'papers'} in progress</p>
        </div>
        
        {#if portfolio.currentlyReading.length > 0}
          <div class="books-grid">
            {#each portfolio.currentlyReading as paper, index}
              <div class="book-card" on:click={(e) => handleBookClick(e, paper.url)}>
                <div class="book-cover {getCoverColor(index)}">
                  <div>{paper.title}</div>
                </div>
                <div class="book-info">
                  <div class="book-title">{paper.title}</div>
                  <div class="book-author">Research Paper</div>
                  <div class="book-meta">
                    <span class="book-badge research">Research Paper</span>
                  </div>
                  <a href={paper.url} class="book-link" target="_blank" on:click|stopPropagation>
                    📄 arXiv
                  </a>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-state">
            <div class="empty-icon">📚</div>
            <div class="empty-text">No papers in your reading list</div>
          </div>
        {/if}
      {:else if activeNav === "books"}
        <div class="content-header">
          <h1 class="page-title">Manga & Books</h1>
          <p class="page-subtitle">{portfolio.currentlyReadingBooks?.length || 0} {portfolio.currentlyReadingBooks?.length === 1 ? 'book' : 'books'} in progress</p>
        </div>
        
        {#if portfolio.currentlyReadingBooks && portfolio.currentlyReadingBooks.length > 0}
          <div class="books-grid">
            {#each portfolio.currentlyReadingBooks as book, index}
              <div class="book-card" on:click={(e) => book.url && handleBookClick(e, book.url)}>
                {#if book.image}
                  <div class="book-cover-image">
                    <img src="{base}{book.image}" alt={book.title} />
                  </div>
                {:else}
                  <div class="book-cover {getCoverColor(index)}">
                    <div>{book.title}</div>
                  </div>
                {/if}
                <div class="book-info">
                  <div class="book-title">{book.title}</div>
                  <div class="book-author">{book.author}</div>
                  <div class="book-meta">
                    <span class="book-badge manga">{book.type}</span>
                  </div>
                  {#if book.url}
                    <a href={book.url} class="book-link" target="_blank" on:click|stopPropagation>
                      📖 Read
                    </a>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-state">
            <div class="empty-icon">📖</div>
            <div class="empty-text">No books in your reading list</div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .books-container {
    display: flex;
    height: 100%;
    flex: 1;
    overflow: hidden;
  }

  /* Sidebar */
  .sidebar {
    width: 260px;
    background: #f5f5f7;
    border-right: 1px solid #e5e5e5;
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    overflow-y: auto;
  }

  .sidebar-section {
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: #86868b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 20px;
    margin-bottom: 8px;
  }

  .nav-item {
    padding: 8px 20px;
    color: #1d1d1f;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nav-item:hover {
    background: #e8e8ea;
  }

  .nav-item.active {
    background: #e8e8ea;
    font-weight: 600;
  }

  .nav-icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
  }

  /* Main Content */
  .main-content {
    flex: 1;
    overflow-y: auto;
    background: white;
  }

  .content-header {
    padding: 40px 48px 32px;
    border-bottom: 1px solid #f5f5f7;
  }

  .page-title {
    font-size: 36px;
    font-weight: 700;
    color: #1d1d1f;
    margin-bottom: 8px;
  }

  .page-subtitle {
    font-size: 17px;
    color: #86868b;
  }

  .books-grid {
    padding: 48px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 40px;
  }

  /* Book Card */
  .book-card {
    cursor: pointer;
    transition: transform 0.2s;
  }

  .book-card:hover {
    transform: translateY(-4px);
  }

  .book-cover {
    width: 100%;
    aspect-ratio: 2/3;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    text-align: center;
    color: white;
    font-weight: 600;
    font-size: 18px;
    line-height: 1.4;
    transition: box-shadow 0.2s;
  }

  .book-card:hover .book-cover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1);
  }

  .book-cover.blue {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .book-cover.orange {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .book-cover.green {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  .book-cover.purple {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    color: #1d1d1f;
  }

  .book-cover.red {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    color: #1d1d1f;
  }

  .book-cover-image {
    width: 100%;
    aspect-ratio: 2/3;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
    overflow: hidden;
    transition: box-shadow 0.2s;
  }

  .book-cover-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .book-card:hover .book-cover-image {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1);
  }

  .book-info {
    padding: 0 4px;
  }

  .book-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 4px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .book-author {
    font-size: 13px;
    color: #86868b;
    margin-bottom: 8px;
  }

  .book-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #86868b;
  }

  .book-badge {
    background: #007aff;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }

  .book-badge.research {
    background: #ff9500;
  }

  .book-badge.manga {
    background: #ff69b4;
  }

  .book-link {
    color: #007aff;
    text-decoration: none;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    transition: opacity 0.2s;
  }

  .book-link:hover {
    opacity: 0.7;
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #86868b;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.3;
  }

  .empty-text {
    font-size: 17px;
  }

  /* Scrollbar */
  .main-content::-webkit-scrollbar {
    width: 12px;
  }

  .main-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .main-content::-webkit-scrollbar-thumb {
    background: #d1d1d6;
    border-radius: 6px;
    border: 3px solid white;
  }

  .main-content::-webkit-scrollbar-thumb:hover {
    background: #a1a1a6;
  }

  .sidebar::-webkit-scrollbar {
    width: 8px;
  }

  .sidebar::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar::-webkit-scrollbar-thumb {
    background: #d1d1d6;
    border-radius: 4px;
  }

  .sidebar::-webkit-scrollbar-thumb:hover {
    background: #a1a1a6;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar {
      display: none;
    }

    .content-header {
      padding: 24px;
    }

    .books-grid {
      padding: 24px;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 24px;
    }

    .page-title {
      font-size: 28px;
    }
  }
</style>
