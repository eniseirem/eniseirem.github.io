import { portfolio } from './portfolioData';

export interface Developer {
  about: string;
  code: string[];
  interests: string[];
  operatingSystems: string[];
  toolsUsed: string[];
  ides: string[];
}

// Extract languages from techStack
const languages = portfolio.techStack.languages.map(lang => lang.name);
// Combine all tech tools
const allTools = [
  ...portfolio.techStack.mlFrameworks,
  ...portfolio.techStack.webFrameworks,
  ...portfolio.techStack.tools
];

export const developer: Developer = {
  about: portfolio.bio.full,
  code: languages,
  interests: portfolio.researchInterests,
  operatingSystems: portfolio.systemInfo.find(info => info.label === "OS")?.value ? 
    [portfolio.systemInfo.find(info => info.label === "OS")!.value] : 
    ["Mac OS 9.2.1 (Retro Edition)"],
  toolsUsed: allTools,
  ides: ["Cursor", "VSCode", "Jupyter", "PyCharm"],
};