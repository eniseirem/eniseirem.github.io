<script lang="ts">
  import type { wType } from "../types/wType";
  import { closeWindow, toggleMinimize, toggleMaximize } from "../stores/windowStore";
  import { portfolio } from "../utils/portfolioData";
  import { base } from "$app/paths";

  export let startDrag: (e: MouseEvent, id: string, action: 'move' | 'resize') => void;
  export let window: wType;

  let searchQuery = "";
  let selectedContact = "enise";

  function getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  function openMailApp(email: string, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
    }
    
    // Use the anchor element click method (works best with user gestures)
    // This must happen synchronously within the user's click event
    try {
      const mailLink = document.createElement('a');
      mailLink.href = `mailto:${email}`;
      mailLink.style.display = 'none';
      document.body.appendChild(mailLink);
      
      // Click immediately while user gesture is still valid
      mailLink.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        if (document.body.contains(mailLink)) {
          document.body.removeChild(mailLink);
        }
      }, 100);
    } catch (error) {
      // Fallback: try direct navigation (less reliable but might work)
      try {
        const browserWindow = typeof globalThis !== 'undefined' ? globalThis.window : (typeof window !== 'undefined' ? window : null);
        if (browserWindow && (browserWindow as any).location) {
          (browserWindow as any).location.href = `mailto:${email}`;
        }
      } catch (err) {
        console.error('Error opening mailto link:', err);
      }
    }
  }

  function openLink(url: string) {
    if (typeof globalThis !== 'undefined') {
      globalThis.window.open(url, '_blank');
    }
  }

  function extractDisplayText(url: string, type: 'github' | 'linkedin' | 'twitter' | 'substack' | 'medium'): string {
    try {
      const urlObj = new URL(url);
      switch (type) {
        case 'github':
          return `github.com/${urlObj.pathname.replace(/^\//, '')}`;
        case 'linkedin':
          return `linkedin.com/in/${urlObj.pathname.replace(/^\/in\//, '').replace(/\/$/, '')}`;
        case 'twitter':
          return urlObj.pathname.replace(/^\//, '@');
        case 'substack':
          return urlObj.pathname.replace(/^\/@/, '@');
        case 'medium':
          return urlObj.pathname.replace(/^\/@/, '@');
        default:
          return url;
      }
    } catch (e) {
      return url;
    }
  }

  $: filteredContacts = searchQuery 
    ? [{
        id: "enise",
        name: portfolio.personalInfo.name,
        subtitle: portfolio.personalInfo.role,
        initials: getInitials(portfolio.personalInfo.name)
      }].filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [{
        id: "enise",
        name: portfolio.personalInfo.name,
        subtitle: portfolio.personalInfo.role,
        initials: getInitials(portfolio.personalInfo.name)
      }];
</script>

<div class="bg-white h-full rounded-lg flex flex-col overflow-hidden font-sans">
  <!-- Contact Header -->
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
    <div class="flex-grow text-center font-semibold">Contacts</div>
  </div>

  <!-- Contacts Body -->
  <div class="contacts-container">
    <!-- Left Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h1 class="sidebar-title">Contacts</h1>
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search"
            bind:value={searchQuery}
          />
        </div>
      </div>
      <div class="contact-list">
        {#each filteredContacts as contact}
          <div 
            class="contact-item" 
            class:active={selectedContact === contact.id}
            on:click={() => selectedContact = contact.id}
          >
            <div class="contact-avatar">
              {#if contact.id === 'enise'}
                <img src="{base}/images/pp.jpg" alt={contact.name} class="contact-avatar-image" />
              {:else}
                {contact.initials}
              {/if}
            </div>
            <div class="contact-name">{contact.name}</div>
            <div class="contact-subtitle">{contact.subtitle}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Right Panel - Details -->
    <div class="details-panel">
      <div class="details-container">
        <div class="details-header">
          <div class="details-avatar">
            <img src="{base}/images/pp.jpg" alt="{portfolio.personalInfo.name}" class="avatar-image" />
          </div>
          <h2 class="details-name">{portfolio.personalInfo.name}</h2>
          {#if portfolio.personalInfo.pronunciation}
            <p class="details-pronunciation">"{portfolio.personalInfo.pronunciation}"</p>
          {/if}
          <p class="details-title">{portfolio.personalInfo.currentPosition}</p>
          <p class="details-location">{portfolio.personalInfo.location.primary} • {portfolio.personalInfo.location.secondary}</p>
        </div>

        <!-- Contact Information -->
        <div class="info-section">
          <h3 class="section-title">Contact Information</h3>
          
          <div class="info-card">
            <div class="info-row">
              <div class="info-icon">📧</div>
              <div class="info-content">
                <div class="info-label">Email</div>
                <div class="info-value">
                  <a href="mailto:{portfolio.personalInfo.email}" on:click={(e) => openMailApp(portfolio.personalInfo.email, e)}>
                    {portfolio.personalInfo.email}
                  </a>
                </div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon">💻</div>
              <div class="info-content">
                <div class="info-label">GitHub</div>
                <div class="info-value">
                  <a href={portfolio.socialLinks.github} target="_blank" on:click|preventDefault={() => openLink(portfolio.socialLinks.github)}>
                    {extractDisplayText(portfolio.socialLinks.github, 'github')}
                  </a>
                </div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon">💼</div>
              <div class="info-content">
                <div class="info-label">LinkedIn</div>
                <div class="info-value">
                  <a href={portfolio.socialLinks.linkedin} target="_blank" on:click|preventDefault={() => openLink(portfolio.socialLinks.linkedin)}>
                    {extractDisplayText(portfolio.socialLinks.linkedin, 'linkedin')}
                  </a>
                </div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon">𝕏</div>
              <div class="info-content">
                <div class="info-label">Twitter</div>
                <div class="info-value">
                  <a href={portfolio.socialLinks.twitter} target="_blank" on:click|preventDefault={() => openLink(portfolio.socialLinks.twitter)}>
                    {extractDisplayText(portfolio.socialLinks.twitter, 'twitter')}
                  </a>
                </div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon">✍️</div>
              <div class="info-content">
                <div class="info-label">Substack</div>
                <div class="info-value">
                  <a href={portfolio.socialLinks.substack} target="_blank" on:click|preventDefault={() => openLink(portfolio.socialLinks.substack)}>
                    {extractDisplayText(portfolio.socialLinks.substack, 'substack')}
                  </a>
                </div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-icon">📝</div>
              <div class="info-content">
                <div class="info-label">Medium</div>
                <div class="info-value">
                  <a href={portfolio.socialLinks.medium} target="_blank" on:click|preventDefault={() => openLink(portfolio.socialLinks.medium)}>
                    {extractDisplayText(portfolio.socialLinks.medium, 'medium')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Work Information -->
        <div class="info-section">
          <h3 class="section-title">Work</h3>
          
          <div class="info-card">
            {#if portfolio.experience && portfolio.experience.length > 0}
              {#each portfolio.experience as exp, index}
                <div class="info-row">
                  <div class="info-icon">🏢</div>
                  <div class="info-content">
                    <div class="info-label">{index === 0 ? 'Current Position' : 'Previous Position'}</div>
                    <div class="info-value">
                      <strong>{exp.title}</strong> at {exp.company}
                      <div class="info-meta">{exp.period} • {exp.focus}</div>
                      {#if exp.location}
                        <div class="info-meta">📍 {exp.location}</div>
                      {/if}
                    </div>
                  </div>
                </div>
                {#if index < portfolio.experience.length - 1}
                  <div class="info-divider"></div>
                {/if}
              {/each}
            {:else}
              <div class="info-row">
                <div class="info-icon">🏢</div>
                <div class="info-content">
                  <div class="info-label">Current Position</div>
                  <div class="info-value">{portfolio.personalInfo.work}</div>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Education Information -->
        {#if portfolio.education && portfolio.education.length > 0}
          <div class="info-section">
            <h3 class="section-title">Education</h3>
            
            <div class="info-card">
              {#each portfolio.education as edu, index}
                <div class="info-row">
                  <div class="info-icon">🎓</div>
                  <div class="info-content">
                    <div class="info-label">{edu.degree}</div>
                    <div class="info-value">
                      {edu.institution}
                      <div class="info-meta">{edu.location} • {edu.years} • {edu.status}</div>
                      {#if edu.description}
                        <div class="info-description">{edu.description}</div>
                      {/if}
                    </div>
                  </div>
                </div>
                {#if index < portfolio.education.length - 1}
                  <div class="info-divider"></div>
                {/if}
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .contacts-container {
    display: flex;
    height: 100%;
    flex: 1;
    overflow: hidden;
    background: white;
  }

  /* Left Sidebar - Contact List */
  .sidebar {
    width: 320px;
    background: #fafafa;
    border-right: 1px solid #e5e5e5;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 20px 20px 16px;
    border-bottom: 1px solid #e5e5e5;
  }

  .sidebar-title {
    font-size: 28px;
    font-weight: 700;
    color: #1d1d1f;
    margin-bottom: 12px;
  }

  .search-box {
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: none;
    background: #f0f0f0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s;
  }

  .search-input:focus {
    background: #e8e8e8;
  }

  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #86868b;
    font-size: 16px;
    pointer-events: none;
  }

  .contact-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }

  .contact-item {
    padding: 16px 20px;
    cursor: pointer;
    transition: background 0.15s;
    border-left: 3px solid transparent;
  }

  .contact-item:hover {
    background: #f0f0f0;
  }

  .contact-item.active {
    background: #e8e8ea;
    border-left-color: #007aff;
  }

  .contact-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    font-weight: 600;
    margin-bottom: 8px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .contact-avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .contact-name {
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 2px;
  }

  .contact-subtitle {
    font-size: 13px;
    color: #86868b;
  }

  /* Right Panel - Contact Details */
  .details-panel {
    flex: 1;
    overflow-y: auto;
    background: white;
  }

  .details-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 60px 40px;
  }

  .details-header {
    text-align: center;
    margin-bottom: 48px;
  }

  .details-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    color: white;
    font-weight: 600;
    margin: 0 auto 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .details-name {
    font-size: 32px;
    font-weight: 700;
    color: #1d1d1f;
    margin-bottom: 4px;
  }

  .details-pronunciation {
    font-size: 15px;
    color: #86868b;
    font-style: italic;
    margin-bottom: 8px;
  }

  .details-title {
    font-size: 17px;
    color: #86868b;
    margin-bottom: 4px;
  }

  .details-location {
    font-size: 15px;
    color: #86868b;
  }

  /* Contact Info Section */
  .info-section {
    margin-bottom: 32px;
  }

  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: #86868b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 16px;
  }

  .info-card {
    background: #fafafa;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 12px;
  }

  .info-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .info-row:last-child {
    margin-bottom: 0;
  }

  .info-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin-right: 16px;
    flex-shrink: 0;
  }

  .info-content {
    flex: 1;
    padding-top: 2px;
  }

  .info-label {
    font-size: 13px;
    color: #86868b;
    margin-bottom: 4px;
  }

  .info-value {
    font-size: 15px;
    color: #1d1d1f;
    word-break: break-word;
  }

  .info-value a {
    color: #007aff;
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .info-value a:hover {
    opacity: 0.7;
  }

  .info-meta {
    font-size: 13px;
    color: #86868b;
    margin-top: 4px;
  }

  .info-description {
    font-size: 13px;
    color: #86868b;
    margin-top: 6px;
    font-style: italic;
  }

  .info-divider {
    height: 1px;
    background: #e5e5e5;
    margin: 16px 0;
  }

  /* Scrollbar */
  .contact-list::-webkit-scrollbar,
  .details-panel::-webkit-scrollbar {
    width: 8px;
  }

  .contact-list::-webkit-scrollbar-track,
  .details-panel::-webkit-scrollbar-track {
    background: transparent;
  }

  .contact-list::-webkit-scrollbar-thumb,
  .details-panel::-webkit-scrollbar-thumb {
    background: #d1d1d6;
    border-radius: 4px;
  }

  .contact-list::-webkit-scrollbar-thumb:hover,
  .details-panel::-webkit-scrollbar-thumb:hover {
    background: #a1a1a6;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar {
      width: 100%;
      border-right: none;
    }

    .details-panel {
      display: none;
    }

    .details-panel.show-mobile {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100;
    }
  }
</style>

