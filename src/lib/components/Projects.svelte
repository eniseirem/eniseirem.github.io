<script lang="ts">
  import { onMount } from 'svelte';
  import type { ProjectData } from '../types/projectType';
  import { projects } from '../stores/projectStore';
  import { closeWindow, toggleMinimize, toggleMaximize } from "../stores/windowStore";
  import type { wType } from "../types/wType";
  import SvelteMarkdown from 'svelte-markdown';
  import CodeBlockWrapper from './CodeBlockWrapper.svelte';
  import ProjectIcons from './ProjectIcons.svelte';
  import { getTagColor, getTypeColor, getStatusColor } from '../utils/tagColors';
  import 'github-markdown-css/github-markdown-light.css';

  export let startDrag: (e: MouseEvent, id: string, action: 'move' | 'resize') => void;
  export let window: wType;

  let selectedProject: ProjectData | null = null;
  let readmeContent: string = '';
  let isLoading: boolean = false;

  onMount(() => {
    if ($projects.length > 0) {
      selectProject($projects[0]);
    }
  });

  async function selectProject(project: ProjectData) {
    selectedProject = project;
    isLoading = true;
    readmeContent = '';
    
    if (project.readmeUrl) {
    try {
      const response = await fetch(project.readmeUrl);
        if (response.ok) {
      readmeContent = await response.text();
        } else if (response.status === 404) {
          // Try master branch if main doesn't exist
          const masterUrl = project.readmeUrl.replace('/main/README.md', '/master/README.md');
          try {
            const masterResponse = await fetch(masterUrl);
            if (masterResponse.ok) {
              readmeContent = await masterResponse.text();
            } else {
              throw new Error('README not found on main or master branch');
            }
          } catch (masterError) {
            throw new Error('README not found');
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
      console.error('Failed to fetch README:', error);
        // Generate fallback content with project info (GitHub link is shown in button at top)
        const noRepoNote = project.githubUrl 
          ? '' 
          : '\n\n*No GitHub repository available for this project.*';
        const yearInfo = project.year ? `\n\n**Year:** ${project.year}` : '';
        readmeContent = `# ${project.name}\n\n${project.shortDescription}${yearInfo}\n\n**Technologies:** ${project.technologies.join(', ')}${noRepoNote}`;
      }
    } else {
      // No README URL but might have GitHub URL (GitHub link is shown in button at top)
      const noRepoNote = project.githubUrl 
        ? '' 
        : '\n\n*No GitHub repository available for this project.*';
      const yearInfo = project.year ? `\n\n**Year:** ${project.year}` : '';
      readmeContent = `# ${project.name}\n\n${project.shortDescription}${yearInfo}\n\n**Technologies:** ${project.technologies.join(', ')}${noRepoNote}`;
    }
    
    isLoading = false;
  }

  function openProjectLink(url: string) {
    if (typeof globalThis !== 'undefined') {
      // For relative paths (starting with /), use window.location for same-origin navigation
      // For absolute URLs, open in new tab
      if (url.startsWith('/')) {
        globalThis.window.location.href = url;
      } else {
        globalThis.window.open(url, '_blank');
      }
    }
  }

  const renderers = {
    code: CodeBlockWrapper
  };

</script>

<div class="bg-white h-full rounded-lg flex flex-col overflow-hidden font-sans">
  <!-- Projects Header -->
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
    <div class="flex-grow text-center font-semibold">Projects</div>
  </div>

  <div class="flex-grow flex overflow-hidden">
    <div class="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50">
      {#each $projects as project,index}
        <div 
          class="p-4 hover:bg-gray-100 cursor-pointer transition-colors duration-200 {selectedProject === project ? 'bg-blue-100 border-l-2 border-blue-500' : ''}"
          on:click={() => selectProject(project)}
        >
          <div class="flex items-center mb-2">
            <div class="w-6 h-6 mr-2 text-gray-600">
              <ProjectIcons iconName={project.icon} />
            </div>
            <h3 class="font-semibold flex-grow text-gray-800 truncate">{project.name}</h3>
            <div class="flex items-center gap-1">
              {#if project.demoUrl}
              <button 
                class="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                on:click|stopPropagation={() => openProjectLink(project.demoUrl)}
                title="View Demo"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </button>
              {/if}
              {#if project.pdfUrl}
              <button 
                class="text-gray-500 hover:text-red-600 transition-colors duration-200"
                on:click|stopPropagation={() => openProjectLink(project.pdfUrl)}
                title="View Docs"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </button>
              {/if}
              {#if project.wandbUrl}
              <button 
                class="text-gray-500 hover:text-purple-600 transition-colors duration-200"
                on:click|stopPropagation={() => openProjectLink(project.wandbUrl)}
                title="View on Weights & Biases"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </button>
              {/if}
              {#if project.githubUrl}
              <button 
                class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                on:click|stopPropagation={() => openProjectLink(project.githubUrl)}
                title="View on GitHub"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </button>
              {/if}
            </div>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <p class="text-sm text-gray-600 flex-grow line-clamp-2">{project.shortDescription}</p>
            {#if project.year}
            <span class="text-xs text-gray-500 font-medium whitespace-nowrap">{project.year}</span>
            {/if}
          </div>
          <div class="flex flex-wrap gap-1 mt-2">
            <span class="px-2 py-1 text-xs font-medium rounded-full capitalize {getTypeColor(project.type)}">
              {project.type}
            </span>
            {#if project.status}
            <span class="px-2 py-1 text-xs font-medium rounded-full capitalize {getStatusColor(project.status)}">
              {project.status}
            </span>
            {/if}
            {#each project.technologies as tech}
              <span class="px-2 py-1 text-xs font-medium rounded-full {getTagColor(tech)}">
                {tech}
              </span>
            {/each}
          </div>
        </div>
        {#if index < $projects.length - 1}
          <hr class="border-gray-300" />
        {/if}
      {/each}
    </div>

    <div class="flex-1 overflow-hidden flex flex-col bg-white">
      {#if selectedProject}
        <div class="overflow-y-auto flex-grow p-6">
          {#if isLoading}
            <div class="flex justify-center items-center h-64">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          {:else}
            {#if selectedProject.githubUrl || selectedProject.wandbUrl || selectedProject.pdfUrl}
            <div class="mb-4 pb-4 border-b border-gray-200 flex gap-2">
              {#if selectedProject.pdfUrl}
              <a 
                href={selectedProject.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                View Docs
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              {/if}
              {#if selectedProject.wandbUrl}
              <a 
                href={selectedProject.wandbUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                View on WandB
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              {/if}
              {#if selectedProject.githubUrl}
              <a 
                href={selectedProject.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              {/if}
            </div>
            {/if}
            <div class="markdown-body prose prose-sm max-w-none">
              <SvelteMarkdown source={readmeContent} {renderers} />
            </div>
          {/if}
        </div>
      {:else}
        <div class="p-6 flex items-center justify-center h-full">
          <p class="text-gray-600 text-center">Select a project to view details</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  :global(.markdown-body) {
    box-sizing: border-box;
    min-width: 200px;
    max-width: 980px;
    margin: 0 auto;
    padding: 45px;
  }

  @media (max-width: 767px) {
    :global(.markdown-body) {
      padding: 15px;
    }
  }
</style>
