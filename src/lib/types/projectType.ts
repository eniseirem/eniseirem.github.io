export interface ProjectData {
  id: string;
  name: string;
  icon: string;
  shortDescription: string;
  githubUrl: string;
  wandbUrl: string;
  pdfUrl: string;
  demoUrl: string;
  readmeUrl: string;
  technologies: string[];
  type: string;
  status?: string;
  year?: string;
  }