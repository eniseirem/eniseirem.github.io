import { writable } from 'svelte/store';
import type { ProjectData } from '../types/projectType';
import { portfolio } from '../utils/portfolioData';

// Helper function to create project ID from title
function createProjectId(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Helper function to get GitHub URL from project links - only if it exists
function getGitHubUrl(project: any): string {
  if (project.links?.github) {
    return project.links.github;
  }
  // Return empty string if no GitHub link exists - don't generate fake URLs
  return '';
}

// Helper function to get WandB URL from project links - only if it exists
// Supports both 'wandb' and 'results' fields for backward compatibility
function getWandbUrl(project: any): string {
  if (project.links?.wandb) {
    return project.links.wandb;
  }
  // Check if results field contains a wandb.ai URL (backward compatibility)
  if (project.links?.results && project.links.results.includes('wandb.ai')) {
    return project.links.results;
  }
  // Return empty string if no WandB link exists
  return '';
}

// Helper function to get PDF URL from project links - only if it exists
function getPdfUrl(project: any): string {
  if (project.links?.pdf) {
    return project.links.pdf;
  }
  // Return empty string if no PDF link exists
  return '';
}

// Helper function to get Demo URL from project links - only if it exists
function getDemoUrl(project: any): string {
  if (project.links?.demo) {
    return project.links.demo;
  }
  // Return empty string if no demo link exists
  return '';
}

// Helper function to get README URL - only if GitHub URL exists
// Tries multiple common branch names
function getReadmeUrl(project: any): string {
  const githubUrl = getGitHubUrl(project);
  if (githubUrl && githubUrl.includes('github.com')) {
    const repoPath = githubUrl.replace('https://github.com/', '').replace(/\/$/, '');
    // Try main branch first, then master (common alternatives)
    // The component will handle 404s gracefully
    return `https://raw.githubusercontent.com/${repoPath}/main/README.md`;
  }
  return '';
}

// Helper function to extract year for sorting
function getYearForSorting(year?: string): number {
  if (!year) return 0; // Ongoing projects without year go to top
  if (year.includes('Present') || year.includes('Ongoing')) return 9999; // Ongoing projects at top
  // Extract first year from strings like "2022-Present" or just "2025"
  const yearMatch = year.match(/\d{4}/);
  return yearMatch ? parseInt(yearMatch[0]) : 0;
}

// Map all projects from portfolio data
const mapProjects = (projectList: any[], type: string): ProjectData[] => {
  return projectList.map(project => ({
    id: createProjectId(project.title),
    name: project.title,
    icon: project.icon || 'code',
    shortDescription: project.description,
    githubUrl: getGitHubUrl(project),
    wandbUrl: getWandbUrl(project),
    pdfUrl: getPdfUrl(project),
    demoUrl: getDemoUrl(project),
    readmeUrl: getReadmeUrl(project),
    technologies: project.tech || [],
    type: type,
    status: project.status || undefined,
    year: project.year || undefined
  }));
};

const initialProjects: ProjectData[] = [
  ...mapProjects(portfolio.projects.professional, 'professional'),
  ...mapProjects(portfolio.projects.academic, 'academic'),
  ...mapProjects(portfolio.projects.personal, 'personal'),
  ...mapProjects(portfolio.projects.research, 'research'),
];

// Sort projects: Ongoing/status projects first, then by year (newest first)
const sortedProjects = initialProjects.sort((a, b) => {
  // First, prioritize ongoing/status projects
  const aIsOngoing = a.status === 'Ongoing' || a.year?.includes('Present') || a.year?.includes('Ongoing');
  const bIsOngoing = b.status === 'Ongoing' || b.year?.includes('Present') || b.year?.includes('Ongoing');
  
  if (aIsOngoing && !bIsOngoing) return -1;
  if (!aIsOngoing && bIsOngoing) return 1;
  
  // If both are ongoing or both are not, sort by year (newest first)
  const aYear = getYearForSorting(a.year);
  const bYear = getYearForSorting(b.year);
  
  // If both have no year, maintain original order
  if (aYear === 0 && bYear === 0) return 0;
  
  return bYear - aYear;
});

export const projects = writable<ProjectData[]>(sortedProjects);