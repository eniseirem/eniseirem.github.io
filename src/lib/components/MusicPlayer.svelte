<script lang="ts">
  import type { Song } from "../types/music";
  import { ALL_MUSIC, fetchPlaylist } from "../utils/musicPlaylists";
  import { onMount } from "svelte";

  let musicIndex = 0;
  let isPlaylistVisible = true;
  let selectedGenre = 'All';
  let songTitles: Map<string, { name: string; artist: string; fullTitle: string }> = new Map();
  let titlesLoaded = false; // Reactive trigger
  let isLoading = true;
  
  $: genres = ['All', ...new Set($ALL_MUSIC.map(song => song.genre))];
  $: filteredPlaylist = selectedGenre === 'All' 
    ? $ALL_MUSIC 
    : $ALL_MUSIC.filter(song => song.genre === selectedGenre);
  $: currentSong = $ALL_MUSIC.length > 0 ? ($ALL_MUSIC[musicIndex] || $ALL_MUSIC[0]) : null;
  $: currentEmbedUrl = currentSong ? (currentSong.youtubeEmbedUrl || 
    (currentSong.youtubePlaylistId 
      ? `https://www.youtube.com/embed/videoseries?list=${currentSong.youtubePlaylistId}`
      : (currentSong.youtubeId && currentSong.youtubeId !== '' && currentSong.youtubeId !== 'placeholder'
        ? `https://www.youtube.com/embed/${currentSong.youtubeId}` 
        : ''))) : '';

  // Fetch video title from YouTube and parse artist/song
  async function fetchVideoTitle(videoId: string): Promise<{ name: string; artist: string; fullTitle: string } | null> {
    if (!videoId || videoId === 'placeholder' || videoId === '') return null;
    
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        let title = data.title || '';
        
        // Remove common suffixes like [Official Music Video], (Official Video), etc.
        title = title.replace(/\s*\[.*?\]/g, '').replace(/\s*\(.*?\)/g, '').trim();
        
        // Try to parse "Artist - Song" format
        const dashPatterns = [
          /^(.+?)\s*-\s*(.+)$/,  // "Artist - Song"
          /^(.+?)\s*–\s*(.+)$/,  // "Artist – Song" (en dash)
          /^(.+?)\s*—\s*(.+)$/,  // "Artist — Song" (em dash)
        ];
        
        for (const pattern of dashPatterns) {
          const match = title.match(pattern);
          if (match) {
            const artist = match[1].trim();
            const song = match[2].trim();
            // If both parts exist and are reasonable length
            if (artist.length > 0 && song.length > 0 && artist.length < 100 && song.length < 200) {
              return { name: song, artist: artist, fullTitle: title };
            }
          }
        }
        
        // If can't parse, return full title as song name
        return { name: title, artist: '', fullTitle: title };
      }
    } catch (error) {
      console.error('Failed to fetch video title:', error);
    }
    return null;
  }

  // Fetch playlist and titles on mount (only on page load)
  onMount(async () => {
    await loadPlaylist();
  });
  
  // Load playlist and fetch missing titles
  async function loadPlaylist() {
    isLoading = true;
    const previousCount = $ALL_MUSIC.length;
    
    // Fetch playlist from API
    await fetchPlaylist();
    isLoading = false;
    
    // If playlist changed, reset index if needed
    if ($ALL_MUSIC.length > 0 && musicIndex >= $ALL_MUSIC.length) {
      musicIndex = 0;
    }
    
    // Fetch titles for songs that need them
    $ALL_MUSIC.forEach((song) => {
      if (song.youtubeId && song.youtubeId !== '' && song.youtubeId !== 'placeholder') {
        // Fetch if name/artist are missing, empty, or placeholders
        if (song.name === 'Song Title' || song.name === '' || 
            song.artist === 'Artist Name' || song.artist === '' ||
            (song.name === song.artist && song.name !== '')) { // Also fetch if name and artist are the same (likely placeholder)
          fetchVideoTitle(song.youtubeId).then((titleData) => {
            if (titleData) {
              songTitles.set(song.youtubeId, titleData);
              titlesLoaded = !titlesLoaded; // Trigger reactivity
            }
          });
        }
      }
    });
  }

  // Get display name and artist with fallback
  function getDisplayName(song: Song): string {
    // Reference titlesLoaded to trigger reactivity
    const _ = titlesLoaded;
    
    // If we have a valid name, use it
    if (song.name && song.name !== 'Song Title' && song.name !== '') {
      return song.name;
    }
    
    // Try to get from fetched title
    if (song.youtubeId && songTitles.has(song.youtubeId)) {
      const titleData = songTitles.get(song.youtubeId)!;
      return titleData.name || titleData.fullTitle;
    }
    
    // Fallback
    return song.youtubeId ? `Video ${song.youtubeId}` : 'Unknown Song';
  }

  function getDisplayArtist(song: Song): string {
    // Reference titlesLoaded to trigger reactivity
    const _ = titlesLoaded;
    
    // If we have a valid artist, use it
    if (song.artist && song.artist !== 'Artist Name' && song.artist !== '') {
      return song.artist;
    }
    
    // Try to get from fetched title
    if (song.youtubeId && songTitles.has(song.youtubeId)) {
      const titleData = songTitles.get(song.youtubeId)!;
      // If artist is empty but we have full title, show empty (will show full title as name)
      if (titleData.artist) {
        return titleData.artist;
      }
      // If no artist but we have full title, return empty so name shows full title
      return '';
  }

    // Fallback
    return '';
  }
  
  // Get full title for display when artist is missing
  function getDisplayTitle(song: Song): { name: string; artist: string } {
    const name = getDisplayName(song);
    const artist = getDisplayArtist(song);
    
    // If no artist but we have a fetched full title, show full title as name
    if (!artist && song.youtubeId && songTitles.has(song.youtubeId)) {
      const titleData = songTitles.get(song.youtubeId)!;
      if (titleData.fullTitle && !titleData.artist) {
        return { name: titleData.fullTitle, artist: '' };
      }
    }
    
    return { name, artist };
  }
  
  // Reactive statements to update display when titles are loaded
  $: currentDisplay = currentSong ? getDisplayTitle(currentSong) : { name: '', artist: '' };
  $: currentDisplayName = currentDisplay.name;
  $: currentDisplayArtist = currentDisplay.artist;
  
  // Ensure musicIndex is valid
  $: if ($ALL_MUSIC.length > 0 && musicIndex >= $ALL_MUSIC.length) {
    musicIndex = 0;
  }

  function prevSong() {
    if ($ALL_MUSIC.length === 0) return;
    let newIndex = (musicIndex - 1 + $ALL_MUSIC.length) % $ALL_MUSIC.length;
    while (!filteredPlaylist.includes($ALL_MUSIC[newIndex])) {
      newIndex = (newIndex - 1 + $ALL_MUSIC.length) % $ALL_MUSIC.length;
    }
    musicIndex = newIndex;
  }

  function nextSong() {
    if ($ALL_MUSIC.length === 0) return;
    let newIndex = (musicIndex + 1) % $ALL_MUSIC.length;
    while (!filteredPlaylist.includes($ALL_MUSIC[newIndex])) {
      newIndex = (newIndex + 1) % $ALL_MUSIC.length;
    }
    musicIndex = newIndex;
  }

  function togglePlaylist() {
    isPlaylistVisible = !isPlaylistVisible;
  }

  function selectSong(index: number) {
    musicIndex = getGlobalIndex(index);
    // Keep playlist visible - don't close it when selecting a song
  }

  function changeGenre(genre: string) {
    selectedGenre = genre;
    const newFilteredPlaylist = selectedGenre === 'All' 
      ? $ALL_MUSIC 
      : $ALL_MUSIC.filter(song => song.genre === selectedGenre);
    
    if (!newFilteredPlaylist.includes($ALL_MUSIC[musicIndex])) {
      musicIndex = $ALL_MUSIC.findIndex(song => newFilteredPlaylist.includes(song));
    }
    
    filteredPlaylist = newFilteredPlaylist;
  }

  function getGlobalIndex(filteredIndex: number): number {
    return $ALL_MUSIC.findIndex(song => song === filteredPlaylist[filteredIndex]);
  }
</script>

<div
  class="bg-white/10 backdrop-blur-md rounded-xl p-5 pb-6 text-white w-full max-w-sm"
>
  {#if isLoading}
    <div class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      <span class="ml-3">Loading playlist...</span>
    </div>
  {:else if $ALL_MUSIC.length === 0}
    <div class="text-center py-8">
      <p class="text-gray-300">No songs in playlist</p>
    </div>
  {:else}
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-semibold">Now Playing</h2>
    <div class="flex items-center space-x-2">
      <button 
        class="focus:outline-none transform transition hover:scale-110" 
        on:click={() => loadPlaylist()}
        title="Refresh playlist"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
      <div class="relative">
        <select 
          bind:value={selectedGenre} 
          on:change={() => changeGenre(selectedGenre)}
          class="appearance-none bg-white/10 border border-white/20 text-white py-1 px-2 pr-8 rounded leading-tight focus:outline-none focus:bg-white/20 focus:border-white"
        >
          {#each genres as genre}
            <option value={genre}>{genre}</option>
          {/each}
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      <button class="focus:outline-none" on:click={togglePlaylist}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  </div>

  <div class="mb-4">
    <div class="flex-1 min-w-0 text-center mb-3">
      {#if currentDisplayArtist}
        <p class="font-bold text-xl mb-1">{currentDisplayName}</p>
        <p class="text-base text-gray-200">{currentDisplayArtist}</p>
      {:else}
        <p class="font-bold text-xl">{currentDisplayName}</p>
      {/if}
    </div>
  </div>

  {#if currentEmbedUrl}
  <div class="mb-4">
      <div class="relative w-full max-w-sm mx-auto" style="padding-bottom: 45%;">
        <iframe
          src={currentEmbedUrl}
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          class="absolute top-0 left-0 w-full h-full rounded-lg"
        ></iframe>
    </div>
    </div>
  {/if}

  <div class="flex justify-between items-center mb-4">
    <button
      class="focus:outline-none transform transition hover:scale-110"
      on:click={prevSong}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
        />
      </svg>
    </button>
    <button
      class="focus:outline-none transform transition hover:scale-110"
      on:click={nextSong}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 5l7 7-7 7M5 5l7 7-7 7"
        />
      </svg>
    </button>
  </div>

  {#if isPlaylistVisible}
    <div class="mt-4 bg-white/5 rounded-lg p-4 max-h-60 overflow-y-auto custom-scrollbar">
      <h3 class="text-lg font-semibold mb-2">Playlist</h3>
      <ul class="px-2">
        {#each filteredPlaylist as song, index}
          <li class="py-2 px-3 cursor-pointer hover:bg-white/10 rounded" on:click={() => selectSong(index)}>
            <div class="flex justify-between items-center">
              <div>
                {#if getDisplayArtist(song)}
                  <p class="font-medium">{getDisplayName(song)}</p>
                  <p class="text-sm text-gray-300">{getDisplayArtist(song)}</p>
                {:else}
                  <p class="font-medium">{getDisplayName(song)}</p>
                {/if}
              </div>
              {#if song === currentSong}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
  {/if}
</div>

<style>
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
</style>
