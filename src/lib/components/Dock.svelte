<script lang="ts">
  import { createEventDispatcher,onMount } from 'svelte';
  import { windows } from '../stores/windowStore';
  import { portfolio } from '../utils/portfolioData';

  export let isAppRunning: (type: 'terminal' | 'safari' | 'blog' | 'projects' | 'resume' | 'books' | 'contact' | 'games') => boolean;
  export let isAppMinimized: (type: 'terminal' | 'safari' | 'blog' | 'projects' | 'resume' | 'books' | 'contact' | 'games') => boolean;
  export let addWindow: (type: 'terminal' | 'safari' | 'blog' | 'projects' | 'resume' | 'books' | 'contact' | 'games') => void;

  import launchpad from '$lib/assets/icons/launchpad.png';
  import terminal from '$lib/assets/icons/terminal.avif';
  import safari from '$lib/assets/icons/safari.png';
  import blog from '$lib/assets/icons/blog.png';
  import projects from '$lib/assets/icons/projects.png';
  import github from '$lib/assets/icons/github.png';
  import books from '$lib/assets/icons/books.png';
  import resume from '$lib/assets/icons/resume.png';
  import contact from '$lib/assets/icons/contact.png';
  import games from '$lib/assets/icons/games.png';

  const dispatch = createEventDispatcher();
  let showPopup = false;
  let windowWidth = 0;

  onMount(() => {
    windowWidth = window.innerWidth;

    const handleResize = () => {
      windowWidth = window.innerWidth;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  function handleDockClick(appType: string) {
    if (!isLargeScreen && appType !== 'github') {
      showPopup = true;
    } else {
      if (appType === 'launchpad') {
        dispatch('openLaunchpad');
      } else if (appType === 'github') {
        window.open(portfolio.socialLinks.github, '_blank');
      } else {
        addWindow(appType as 'terminal' | 'safari' | 'blog' | 'projects' | 'resume' | 'books' | 'contact' | 'games');
      }
    }
  }

  function closePopup() {
    showPopup = false;
  }

  $: terminalWindow = $windows.find(w => w.type === 'terminal');
  $: safariWindow = $windows.find(w => w.type === 'safari');
  $: blogWindow = $windows.find(w => w.type === 'blog');
  $: projectsWindow = $windows.find(w => w.type === 'projects');
  $: booksWindow = $windows.find(w => w.type === 'books');
  $: resumeWindow = $windows.find(w => w.type === 'resume');
  $: contactWindow = $windows.find(w => w.type === 'contact');
  $: gamesWindow = $windows.find(w => w.type === 'games');
  $: isLargeScreen = windowWidth >= 1024;

</script>

<div class="dock bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex space-x-4 items-end">
  <div class="dock-item" on:click={() => handleDockClick('launchpad')}>
    <img src={launchpad} alt="Launchpad" class="h-12 w-12" />
  </div>
  
  <div class="dock-item" on:click={() => handleDockClick("terminal")}>
    <img src={terminal} alt="Terminal" class="h-12 w-12" />
    {#if terminalWindow}
      <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
    {/if}
  </div>
  
  {#if isLargeScreen}
    <div class="dock-item" on:click={() => handleDockClick("safari")}>
      <img src={safari} alt="safari" class="h-12 w-12" />
      {#if safariWindow}
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
      {/if}
    </div>
  {/if}

  {#if isLargeScreen}
  <div class="dock-item" on:click={() => handleDockClick("blog")}>
    <img src={blog} alt="Blog" class="h-12 w-12" />
    {#if blogWindow}
      <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
    {/if}
    </div>
  {/if}

  <div class="dock-item" on:click={() => handleDockClick("projects")}>
    <img src={projects} alt="Projects" class="h-12 w-12" />
    {#if projectsWindow}
      <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
    {/if}
  </div>

  <div class="dock-item" on:click={() => handleDockClick("resume")}>
    <img src={resume} alt="Resume" class="h-12 w-12" />
    {#if resumeWindow}
      <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
    {/if}
  </div>

  <div class="dock-item" on:click={() => handleDockClick("books")}>
    <img src={books} alt="Books" class="h-12 w-12" />
    {#if booksWindow}
      <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
    {/if}
  </div>

  <div class="dock-item" on:click={() => handleDockClick("contact")}>
    <img src={contact} alt="Contact" class="h-12 w-12" />
    {#if contactWindow}
      <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
    {/if}
  </div>

  <div class="dock-item" on:click={() => handleDockClick("games")}>
    <img src={games} alt="Games" class="h-12 w-12" />
    {#if gamesWindow}
      <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
    {/if}
  </div>

  <div class="dock-item" on:click={() => handleDockClick("github")}>
    <img src={github} alt="Github" class="h-12 w-12" />
  </div>
</div>


{#if showPopup}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 shadow-lg text-center max-w-sm mx-auto">
      <h2 class="text-lg font-semibold mb-4">Limited Features</h2>
      <p class="mb-4">For full feature access, please use a desktop device.</p>
      <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={closePopup}>Close</button>
    </div>
  </div>
{/if}

<style>
  .dock {
    height: 68px;
    margin: 0 auto;
    margin-bottom: 16px;
    isolation: isolate;
    contain: layout style paint;
    transform: translate3d(0, 0, 0);
    will-change: transform;
  }

  .dock-item {
    @apply w-12 h-12 rounded-full flex items-center justify-center text-white cursor-pointer relative;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    pointer-events: auto;
    isolation: isolate;
    transform: translateZ(0);
    backface-visibility: hidden;
    overflow: visible;
  }

  .dock-item img {
    pointer-events: none;
    user-select: none;
    transform: translateZ(0);
    object-fit: contain;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }
  
  /* Ensure books, resume, and contact icons fit properly and scale correctly */
  .dock-item img[src*="books"],
  .dock-item img[src*="resume"],
  .dock-item img[src*="contact"] {
    object-fit: contain;
    width: 48px;
    height: 48px;
    padding: 2px;
    box-sizing: border-box;
  }

  .dock:hover .dock-item {
    transform: translateY(0px) scale(1) translateZ(0);
  }

  .dock .dock-item:hover {
    transform: translateY(-10px) scale(1.2) translateZ(0);
    z-index: 10000;
  }

  .dock:hover .dock-item:hover + .dock-item {
    transform: translateY(-5px) scale(1.1) translateZ(0);
  }

  .dock:hover .dock-item:hover + .dock-item + .dock-item {
    transform: translateY(-2px) scale(1.05) translateZ(0);
  }

  /* Prevent glitches when windows are open */
  .dock-item:active {
    transform: translateY(-8px) scale(1.15) translateZ(0) !important;
  }
</style>
