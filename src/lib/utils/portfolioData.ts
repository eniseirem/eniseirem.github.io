import portfolioData from '../data/portfolio-data.json';

export interface PortfolioData {
  personalInfo: {
    name: string;
    pronunciation: string;
    email: string;
    role: string;
    currentPosition: string;
    work: string;
    location: {
      primary: string;
      secondary: string;
    };
    timezone: string[];
  };
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    substack: string;
    medium: string;
  };
  bio: {
    short: string;
    full: string;
  };
  researchInterests: string[];
  currentlyReading: Array<{
    title: string;
    url: string;
  }>;
  currentlyReadingBooks?: Array<{
    title: string;
    type: string;
    author: string;
    url?: string;
    image?: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    years: string;
    status: string;
    description: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    period: string;
    focus: string;
    location?: string;
    responsibilities: string[];
  }>;
  techStack: {
    languages: Array<{
      name: string;
      level: string;
      color: string;
    }>;
    mlFrameworks: string[];
    webFrameworks: string[];
    tools: string[];
    currentlyExploring: string[];
  };
  spokenLanguages: Array<{
    language: string;
    flag: string;
    level: string;
    proficiency: number;
  }>;
  projects: {
    professional: Array<{
      title: string;
      icon: string;
      description: string;
      tech: string[];
      impact?: string;
      status?: string;
      year: string;
      links?: Record<string, string>;
    }>;
    academic: Array<{
      title: string;
      icon: string;
      description: string;
      tech: string[];
      status?: string;
      year: string;
      links?: Record<string, string>;
    }>;
    personal: Array<{
      title: string;
      icon: string;
      description: string;
      tech: string[];
      status?: string;
      year?: string;
      builtWith?: string;
      links?: Record<string, string>;
    }>;
    research: Array<{
      title: string;
      icon: string;
      description: string;
      tech: string[];
      year: string;
      status?: string;
    }>;
  };
  collaborationInterests: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  systemInfo: Array<{
    icon: string;
    label: string;
    value: string;
  }>;
  games?: Array<{
    title: string;
    icon?: string;
    image?: string;
    description?: string;
    url?: string;
    lastPlayed?: string;
    addedDate?: string;
  }>;
  footer: {
    tagline: string;
    copyright: string;
    lastUpdated: string;
  };
}

export const portfolio: PortfolioData = portfolioData as PortfolioData;
