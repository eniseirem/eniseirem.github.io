<script lang="ts">
  import type { wType } from "../types/wType";
  import { closeWindow, toggleMinimize, toggleMaximize } from "../stores/windowStore";

  export let startDrag: (e: MouseEvent, id: string, action: 'move' | 'resize') => void;
  export let window: wType;

  const resumeUrl = 'https://flowcv.com/resume/snwh9bj7jw';
</script>

<div class="bg-white h-full rounded-lg flex flex-col overflow-hidden font-sans">
  <!-- Resume Header -->
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
    <div class="flex-grow text-center font-semibold">Resume</div>
    <div class="flex space-x-2">
      <a 
        href={resumeUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        class="text-gray-600 hover:text-gray-800 px-2 py-1 text-sm"
        title="Open in new tab"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  </div>

  <!-- Resume Body -->
  <div class="flex-grow relative bg-gray-50">
    <iframe 
      src={resumeUrl}
      title="Resume"
      class="w-full h-full border-none"
      sandbox="allow-scripts allow-same-origin allow-forms"
    ></iframe>
  </div>
</div>

