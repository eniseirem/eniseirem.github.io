import { writable, get } from 'svelte/store';
import type { wType } from '../types/wType';
import { portfolio } from '../utils/portfolioData';

export const windows = writable<wType[]>([]);
let nextZIndex = 10; // Start at 10 to leave room for other UI elements

export function addWindow(type: "terminal" | "safari" | "blog" | "projects" | "resume" | "books" | "github" | "contact" | "games") {

  if (type === "github") {
    window.open(portfolio.socialLinks.github, '_blank');
    return;
  }

  const currentWindows = get(windows);
  const existingWindow = currentWindows.find((w) => w.type === type);
  if (existingWindow) {
    focusWindow(existingWindow.id);
    if (existingWindow.minimized) {
      toggleMinimize(existingWindow.id);
    }
    return;
  }

  // Larger window for resume/PDF viewer, books, contact, and games
  const windowWidth = (type === 'resume' || type === 'books' || type === 'contact' || type === 'games') ? 1000 : 900;
  const windowHeight = (type === 'resume' || type === 'books' || type === 'contact' || type === 'games') ? 700 : 600;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const newWindow: wType = {
    id: `${type}-${Date.now()}`,
    type,
    minimized: false,
    maximized: false,
    position: {
      x: (screenWidth - windowWidth) / 2,
      y: (screenHeight - windowHeight) / 2,
    },
    size: { width: windowWidth, height: windowHeight },
    zIndex: nextZIndex++,
  };
  windows.update(w => [...w, newWindow]);
}

export function focusWindow(id: string) {
  windows.update(currentWindows => {
    return currentWindows
      .map((w) => ({
        ...w,
        zIndex: w.id === id ? nextZIndex++ : w.zIndex,
      }))
      .sort((a, b) => a.zIndex - b.zIndex);
  });
}

export function closeWindow(id: string) {
  windows.update(currentWindows => currentWindows.filter((w) => w.id !== id));
}

export function toggleMinimize(id: string) {
  windows.update(currentWindows => 
    currentWindows.map((w) =>
      w.id === id ? { ...w, minimized: !w.minimized } : w
    )
  );
}

export function toggleMaximize(id: string) {
  windows.update(currentWindows => 
    currentWindows.map((w) => {
      if (w.id === id) {
        if (!w.maximized) {
          return {
            ...w,
            maximized: true,
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight },
          };
        } else {
          return {
            ...w,
            maximized: false,
            position: {
              x: (window.innerWidth - 600) / 2,
              y: (window.innerHeight - 400) / 2,
            },
            size: { width: 600, height: 400 },
          };
        }
      }
      return w;
    })
  );
}

export function isAppRunning(type: 'terminal' | 'safari' | 'blog' | 'projects' | 'resume' | 'books' | 'contact' | 'games'): boolean {
  const currentWindows = get(windows);
  return currentWindows.some(w => w.type === type && !w.minimized);
}

export function isAppMinimized(type: 'terminal' | 'safari' | 'blog' | 'projects' | 'resume' | 'books' | 'contact' | 'games'): boolean {
  const currentWindows = get(windows);
  return currentWindows.some(w => w.type === type && w.minimized);
}