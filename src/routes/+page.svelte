<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from '$app/environment';
  import { base } from '$app/paths';
  import Desktop from "./../lib/components/Desktop.svelte";
  import Dock from "../lib/components/Dock.svelte";
  import Window from "../lib/components/Window.svelte";
  import Launchpad from "../lib/components/Launchpad.svelte";
  import { windows, addWindow, isAppRunning, isAppMinimized } from "../lib/stores/windowStore";

  let isLaunchpadOpen = false;
  let isMobile = false;

  import { portfolio } from '../lib/utils/portfolioData';

  function isMobileDevice(): boolean {
    if (!browser || typeof window === 'undefined') return false;
    // Check screen width (works in responsive mode)
    if (window.innerWidth < 768) return true;
    // Check user agent for mobile devices
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  }

  onMount(() => {
    if (browser) {
      // Check immediately on mount
      isMobile = isMobileDevice();
      
      if (isMobile) {
        window.location.href = '/v1/index.html';
        return;
      }
      
      document.title = `Home | ${portfolio.personalInfo.name}`;
      if (window.innerWidth >= 768) {
        addWindow("terminal");
      }

      // Listen for resize events (for responsive mode testing)
      const handleResize = () => {
        if (isMobileDevice() && window.location.pathname !== '/v1/index.html' && !window.location.pathname.startsWith('/v1/')) {
          window.location.href = '/v1/index.html';
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  });

  function handleOpenLaunchpad() {
    isLaunchpadOpen = true;
  }

  function handleLaunchApp(event: CustomEvent<string>) {
    addWindow(event.detail as "terminal" | "safari" | "blog" | "projects" | "resume" | "books" | "contact" | "games" | "github");
    isLaunchpadOpen = false;
  }
</script>

{#if !isMobile}
<main class="min-h-screen font-mono relative overflow-hidden">
  <div 
    class="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style="background-image: url('{base}/spirited-away-haku.jpg');"
  >
    <div class="absolute inset-0 bg-black/20"></div>
  </div>
  
  <Desktop />
  
  {#each $windows as window (window.id)}
    <Window {window} />
  {/each}
  
  <div class="dock-wrapper">
  <Dock {isAppRunning} {isAppMinimized} {addWindow} on:openLaunchpad={handleOpenLaunchpad} />
  </div>
  
  <Launchpad isOpen={isLaunchpadOpen} on:launchApp={handleLaunchApp} on:closeLaunchpad={() => isLaunchpadOpen = false} />
</main>
{:else}
  <!-- Mobile: Show loading or redirect message -->
  <div class="min-h-screen flex items-center justify-center">
    <p>Redirecting...</p>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  .dock-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    pointer-events: none;
    isolation: isolate;
    contain: layout style paint;
    transform: translate3d(0, 0, 0);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 16px;
  }

  .dock-wrapper :global(*) {
    pointer-events: auto;
  }
</style>
