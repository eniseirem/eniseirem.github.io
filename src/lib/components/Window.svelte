<script lang="ts">
    import type { wType } from "../types/wType";
    import { focusWindow, closeWindow, toggleMinimize, toggleMaximize } from "../stores/windowStore";
    import Terminal from "./Terminal.svelte";
    import Safari from "./Safari.svelte";
    import Projects from "./Projects.svelte";
    import Blog from "./Blog.svelte";
    import Books from "./Books.svelte";
    import Resume from "./Resume.svelte";
    import Contact from "./Contact.svelte";
    import Games from "./Games.svelte";
  
    export let window: wType;
  
    export function startDrag(event: MouseEvent, id: string, type: "move" | "resize") {
      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = window.size.width;
      const startHeight = window.size.height;
      const startLeft = window.position.x;
      const startTop = window.position.y;
  
      function onMouseMove(e: MouseEvent) {
        if (type === "move") {
          window.position.x = startLeft + e.clientX - startX;
          window.position.y = startTop + e.clientY - startY;
        } else {
          window.size.width = Math.max(300, startWidth + e.clientX - startX);
          window.size.height = Math.max(200, startHeight + e.clientY - startY);
        }
      }
  
      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }
  
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  </script>
  
  <div
    id={window.id}
    class="absolute rounded-lg shadow-2xl overflow-hidden"
    style="left: {window.position.x}px; top: {window.position.y}px; width: {window.size.width}px; height: {window.size.height}px; z-index: {window.zIndex}; pointer-events: auto; isolation: isolate; contain: layout style paint; transform: translate3d(0, 0, 0);"
    class:hidden={window.minimized}
    on:mousedown={() => focusWindow(window.id)}
  >
  {#if window.type === "terminal"}
  <Terminal {window} {startDrag} />
{:else if window.type === "safari"}
  <Safari {window} {startDrag} />
{:else if window.type === "projects"} 
  <Projects {window} {startDrag} />
{:else if window.type === "blog"}
  <Blog {window} {startDrag} />
{:else if window.type === "books"}
  <Books {window} {startDrag} />
{:else if window.type === "resume"}
  <Resume {window} {startDrag} />
{:else if window.type === "contact"}
  <Contact {window} {startDrag} />
{:else if window.type === "games"}
  <Games {window} {startDrag} />
{/if}
    
    {#if !window.maximized}
      <div
        class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        on:mousedown={(e) => startDrag(e, window.id, "resize")}
      ></div>
    {/if}
  </div>