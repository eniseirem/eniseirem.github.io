import { developer } from "./devInfo";
import { syncProjectsToFileSystem } from "./syncProjects";
import { portfolio } from "./portfolioData";

// Helper function to wrap text to fit terminal width
function wrapText(text: string, maxWidth: number = 70): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines.join('\n');
}

export const fileSystem: FileSystem = {
  home: {
    about: `
${wrapText(developer.about)}

Role: ${portfolio.personalInfo.role}
Current Position: ${wrapText(portfolio.personalInfo.currentPosition)}
Work: ${portfolio.personalInfo.work}

Programming Languages: ${developer.code.join(", ")}
    `,
    projects: {},
    interests: `
${developer.interests.join("\n")}
    `,
    reference: `
Portfolio Website Reference
===========================

Original Repository & Creator:
https://github.com/ansxuman/macOS-Themed-Portfolio
Created by: ansxuman (https://github.com/ansxuman)

This portfolio is a customized version of the macOS-Themed-Portfolio
template by ansxuman, adapted for personal use with dynamic content
loading from portfolio data.

Built with:
- SvelteKit
- TypeScript
- TailwindCSS
    `,
  },
};

syncProjectsToFileSystem(fileSystem);

export interface FileSystem {
  [key: string]: string | FileSystem;
}
