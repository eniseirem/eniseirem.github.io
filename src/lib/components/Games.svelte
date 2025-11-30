<script lang="ts">
  import type { wType } from "../types/wType";
  import { closeWindow, toggleMinimize, toggleMaximize } from "../stores/windowStore";
  import { portfolio } from "../utils/portfolioData";
  import { base } from "$app/paths";

  export let startDrag: (e: MouseEvent, id: string, action: 'move' | 'resize') => void;
  export let window: wType;

  let activeTab = "home";

  function handleTabClick(tab: string) {
    activeTab = tab;
  }

  function handleGameClick(game: any) {
    if (game.url && typeof globalThis !== 'undefined') {
      globalThis.window.open(game.url, '_blank');
    }
  }
</script>

<div class="bg-white h-full rounded-lg flex flex-col overflow-hidden font-sans">
  <!-- Header -->
  <div class="header" on:mousedown={(e) => startDrag(e, window.id, "move")}>
    <div class="mac-buttons">
      <button class="mac-btn red" on:click={() => closeWindow(window.id)}></button>
      <button class="mac-btn yellow" on:click={() => toggleMinimize(window.id)}></button>
      <button class="mac-btn green" on:click={() => toggleMaximize(window.id)}></button>
    </div>
    <div class="nav-tabs">
      <div class="nav-tab" class:active={activeTab === "home"} on:click={() => handleTabClick("home")}>Home</div>
      <div class="nav-tab" class:active={activeTab === "arcade"} on:click={() => handleTabClick("arcade")}>Arcade</div>
    </div>
    <div class="profile-icon">E</div>
  </div>

  <!-- Main Content -->
  <div class="main-content">
    <!-- Your Games Section -->
    <div class="section-header">
      <h2 class="section-title">Your Games</h2>
      <button class="filter-btn">
        <span>⚙️</span>
        <span>Filter</span>
      </button>
    </div>

    <!-- Games Grid -->
    {#if portfolio.games && portfolio.games.length > 0}
      <div class="projects-grid">
        {#each portfolio.games as game, index}
          <div class="project-card" on:click={() => handleGameClick(game)}>
            {#if game.image}
              <div class="project-icon-image">
                <img src="{base}{game.image}" alt={game.title} />
              </div>
            {:else}
              <div class="project-icon {['blue', 'orange', 'green', 'purple', 'red'][index % 5]}">{game.icon || '🎮'}</div>
            {/if}
            <div class="project-info">
              <div class="project-header">
                <div class="project-title">{game.title}</div>
                {#if game.lastPlayed}
                  <div class="project-meta">Played {game.lastPlayed}</div>
                {:else if game.addedDate}
                  <div class="project-meta">Added {game.addedDate}</div>
                {/if}
              </div>
              {#if game.description}
                <div class="project-description">
                  {game.description}
                </div>
              {/if}
              <div class="project-footer">
                <button class="project-btn" on:click|stopPropagation={() => handleGameClick(game)}>
                  {game.url ? 'Play' : 'View'}
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-icon">🎮</div>
        <div class="empty-text">No games in your library</div>
      </div>
    {/if}
  </div>
</div>

<style>
  .header {
    background: #fafafa;
    border-bottom: 1px solid #e5e5e5;
    padding: 16px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: move;
  }

  .mac-buttons {
    display: flex;
    gap: 8px;
  }

  .mac-btn {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 0.5px solid rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .mac-btn:hover {
    opacity: 0.8;
  }

  .mac-btn.red { background: #ff5f57; }
  .mac-btn.yellow { background: #ffbd2e; }
  .mac-btn.green { background: #28ca42; }

  .nav-tabs {
    display: flex;
    gap: 32px;
    flex: 1;
    justify-content: center;
  }

  .nav-tab {
    color: #86868b;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    padding: 8px 0;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .nav-tab:hover {
    color: #1d1d1f;
  }

  .nav-tab.active {
    color: #1d1d1f;
    border-bottom-color: #007aff;
  }

  .profile-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 14px;
  }

  .main-content {
    padding: 32px 48px 48px;
    overflow-y: auto;
    flex: 1;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 24px;
    font-weight: 700;
    color: #1d1d1f;
  }

  .filter-btn {
    background: #f5f5f7;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #1d1d1f;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
  }

  .filter-btn:hover {
    background: #e8e8ea;
  }

  .library-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 48px;
  }

  .library-card {
    background: #fafafa;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .library-card:hover {
    background: #f5f5f7;
    border-color: #e5e5e5;
    transform: translateY(-2px);
  }

  .library-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .library-info {
    flex: 1;
  }

  .library-title {
    font-size: 17px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 4px;
  }

  .library-count {
    font-size: 14px;
    color: #86868b;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 24px;
  }

  .project-card {
    background: #fafafa;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    gap: 16px;
    transition: all 0.2s;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .project-card:hover {
    background: #f5f5f7;
    border-color: #e5e5e5;
    transform: translateY(-2px);
  }

  .project-icon {
    width: 80px;
    height: 80px;
    border-radius: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .project-icon.orange {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .project-icon.blue {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  .project-icon.green {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }

  .project-icon.purple {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }

  .project-icon.red {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  }

  .project-icon-image {
    width: 80px;
    height: 80px;
    border-radius: 16px;
    flex-shrink: 0;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .project-icon-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .project-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .project-header {
    margin-bottom: 8px;
  }

  .project-title {
    font-size: 17px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 4px;
  }

  .project-meta {
    font-size: 13px;
    color: #86868b;
  }

  .project-description {
    font-size: 14px;
    color: #515154;
    line-height: 1.4;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .project-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .project-btn {
    background: #007aff;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .project-btn:hover {
    background: #0051d5;
  }

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

  /* Responsive */
  @media (max-width: 768px) {
    .header,
    .main-content {
      padding-left: 24px;
      padding-right: 24px;
    }

    .projects-grid {
      grid-template-columns: 1fr;
    }

    .nav-tabs {
      display: none;
    }
  }
</style>

