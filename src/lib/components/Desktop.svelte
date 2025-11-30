<script lang="ts">
  import TopBar from "./TopBar.svelte";
  import MusicPlayer from "./MusicPlayer.svelte";
  import { onMount } from "svelte";
  import { portfolio } from "../utils/portfolioData";

  let currentTime = new Date();

  onMount(() => {
    const timer = setInterval(() => {
      currentTime = new Date();
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  });
</script>

<div class="h-screen w-screen overflow-hidden font-sf">
  <TopBar />
  <div class="p-4 flex flex-col items-start">
    <!-- Clock Widget -->
    <div
      class="bg-white/10 backdrop-blur-md rounded-xl p-5 text-white w-full max-w-sm mb-3 shadow-lg"
    >
      <div class="flex flex-col items-center">
        <div class="text-5xl font-light mb-1.5">
          {currentTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
        <div class="text-base font-medium mb-2.5">
          {currentTime.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
        {#if portfolio.quote}
          <div class="quote-widget">
            <p class="quote-text">"{portfolio.quote.text}"</p>
            <p class="quote-author">— {portfolio.quote.author}</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Music Player Widget -->
    <MusicPlayer />
  </div>
</div>

<style>
  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .bg-gradient-to-r {
    background-size: 200% 200%;
    animation: gradient 5s ease infinite;
  }

  .font-sf {
    font-family: -apple-system, BlinkMacSystemFont, "San Francisco",
      "Helvetica Neue", sans-serif;
  }

  .quote-widget {
    text-align: center;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 6px;
  }

  .quote-text {
    font-size: 12px;
    font-style: italic;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.3;
    margin-bottom: 3px;
  }

  .quote-author {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }
</style>
