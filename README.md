<h1 align="center">
 macOS-Themed Portfolio
</h1>

  <br>

A unique, interactive portfolio website inspired by the macOS interface.

<p align="center">
  <a href="#original-repository">Original Repository</a> •
  <a href="#whats-new">What's New</a> •
  <a href="#customization">Customization</a> •
  <a href="#installation">Installation</a> •
  <a href="#deployment">Deployment</a>
</p>

![macOS-Themed Portfolio](https://github.com/user-attachments/assets/2859e409-c4d2-47ce-a810-885c01cddd83)

  Powered by [SvelteKit](https://kit.svelte.dev/), [TailwindCSS](https://tailwindcss.com/) and [TypeScript](https://www.typescriptlang.org/).

---

## Original Repository

This portfolio is a customized version of the **macOS-Themed-Portfolio** template.

**Original Repository:** [https://github.com/ansxuman/macOS-Themed-Portfolio](https://github.com/ansxuman/macOS-Themed-Portfolio)  
**Created by:** [ansxuman](https://github.com/ansxuman)

This fork has been extensively customized with dynamic content loading, new applications, and enhanced features. All content is now managed through a centralized JSON configuration file.

---

## What's New

### 🎯 Major Changes

1. **Dynamic Content System**
   - All personal information, projects, and content now loaded from `src/lib/data/portfolio-data.json`
   - No more hardcoded values scattered throughout the codebase
   - Easy content updates without touching component files

2. **New Applications**
   - **📚 Books App**: Displays currently reading research papers and books with cover images
   - **📇 Contact App**: macOS Contacts-style app showing personal info, social links, work experience, and education
   - **📄 Resume App**: Embedded FlowCV resume viewer
   - **🎮 Games App**: Game Center-style showcase of favorite games

3. **Enhanced Blog Integration**
   - **Medium Integration**: Fetches and displays Medium posts via RSS feed
   - **Substack Integration**: Embedded Substack posts
   - **CORS Proxy Fallback**: Reliable fetching with multiple fallback methods
   - **Caching**: LocalStorage caching to reduce API calls and handle rate limits

4. **Music Player Improvements**
   - **YouTube Playlist Integration**: Fetches videos from YouTube playlists
   - **Dynamic Playlist**: Automatically updates from YouTube playlist
   - **Better Error Handling**: Graceful fallbacks for API rate limits

5. **Mobile Support**
   - **Responsive Redirect**: Automatically redirects mobile users to a simplified v1 page
   - **First-Visit Popup**: Informs mobile users about the desktop version
   - **Static v1 Pages**: Legacy portfolio pages for mobile devices

6. **Project Enhancements**
   - **Status Tags**: Visual indicators for project status (Ongoing, Completed, Confidential)
   - **Year Information**: Projects display year and are sorted chronologically
   - **Emoji Support**: Projects can include emojis in titles
   - **Better GitHub Integration**: Only shows GitHub links when available

7. **Terminal Improvements**
   - **Auto-typing Animation**: Terminal automatically types `cat about` on page load
   - **Dynamic Username**: Extracted from email in portfolio data
   - **Reference File**: Terminal includes a reference file with original repository info

8. **Desktop Widgets**
   - **Quote Widget**: Displays inspirational quotes on the desktop
   - **Compact Design**: More space-efficient widget layouts

9. **GitHub Pages Ready**
   - **Static Adapter**: Configured for static site generation
   - **Base Path Support**: Works correctly with GitHub Pages subdirectories
   - **Client-Side API Calls**: All API functionality moved to client-side for static hosting
   - **Automated Deployment**: Emotion Field and v1 directories automatically copied to root after build

### 🔧 Technical Improvements

- **Type Safety**: Enhanced TypeScript interfaces for all data structures
- **Error Handling**: Comprehensive error handling with fallbacks
- **Performance**: LocalStorage caching for API responses
- **Code Organization**: Better separation of concerns and data management

---

## Customization

All content is managed through the **`src/lib/data/portfolio-data.json`** file. Simply edit this JSON file to update your portfolio without touching any component code.

### 📝 JSON Structure Overview

```json
{
  "personalInfo": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "role": "Your Role",
    "work": "Your Current Position",
    "location": { ... },
    "timezone": [ ... ]
  },
  "socialLinks": {
    "github": "https://github.com/yourusername",
    "linkedin": "https://linkedin.com/in/yourusername",
    "medium": "https://medium.com/@yourusername",
    "substack": "https://substack.com/@yourusername"
  },
  "bio": {
    "short": "Short bio for meta tags",
    "full": "Full bio displayed in the portfolio"
  },
  "projects": {
    "professional": [ ... ],
    "academic": [ ... ],
    "personal": [ ... ],
    "research": [ ... ]
  },
  "experience": [ ... ],
  "education": [ ... ],
  "currentlyReading": [ ... ],
  "currentlyReadingBooks": [ ... ],
  "games": [ ... ],
  "techStack": { ... }
}
```

### 📋 Key Sections to Customize

#### 1. Personal Information
```json
"personalInfo": {
  "name": "Your Full Name",
  "pronunciation": "phonetic-pronunciation",
  "email": "your.email@example.com",
  "role": "Your Role (e.g., Data Scientist)",
  "currentPosition": "Your Current Position",
  "work": "Your Job Title at Company",
  "location": {
    "primary": "City, Country 🇺🇸",
    "secondary": "City, Country 🇺🇸"
  },
  "timezone": ["Timezone 1", "Timezone 2"]
}
```

#### 2. Social Links
```json
"socialLinks": {
  "github": "https://github.com/yourusername",
  "linkedin": "https://www.linkedin.com/in/yourusername",
  "twitter": "https://twitter.com/yourusername",
  "substack": "https://substack.com/@yourusername",
  "medium": "https://medium.com/@yourusername"
}
```

#### 3. Projects
```json
"projects": {
  "professional": [
    {
      "title": "🎛️ Project Name",
      "description": "Project description",
      "tech": ["Python", "JavaScript"],
      "status": "Ongoing",  // or "Completed", "Confidential"
      "year": "2025",
      "links": {
        "github": "https://github.com/...",
        "demo": "https://..."
      }
    }
  ]
}
```

**Project Status Options:**
- `"Ongoing"` - Yellow badge
- `"Completed"` - Green badge
- `"Confidential"` - Red badge

#### 4. Experience & Education
```json
"experience": [
  {
    "title": "Job Title",
    "company": "Company Name",
    "period": "2022 — Present",
    "focus": "Technologies Used",
    "location": "City, Country",
    "responsibilities": [
      "Responsibility 1",
      "Responsibility 2"
    ]
  }
]
```

#### 5. Currently Reading
```json
"currentlyReading": [
  {
    "title": "Paper Title",
    "url": "https://arxiv.org/abs/..."
  }
],
"currentlyReadingBooks": [
  {
    "title": "Book Title",
    "type": "Book" or "Manga",
    "author": "Author Name",
    "image": "/images/books/book-cover.jpg"
  }
]
```

#### 6. Games
```json
"games": [
  {
    "title": "Game Name",
    "image": "/images/games/game-cover.png",
    "url": "https://game-website.com",
    "description": "Game description"
  }
]
```

#### 7. Tech Stack
```json
"techStack": {
  "programmingLanguages": {
    "proficient": ["Python", "JavaScript"],
    "familiar": ["Go", "Rust"]
  },
  "machineLearning": [
    "Classification",
    "Regression",
    "Clustering"
  ],
  "dataScienceFrameworks": [
    "Scikit-Learn",
    "TensorFlow",
    "PyTorch"
  ]
}
```

### 🖼️ Adding Images

1. **Book Covers**: Place images in `static/images/books/` and reference as `/images/books/filename.jpg`
2. **Game Covers**: Place images in `static/images/games/` and reference as `/images/games/filename.png`
3. **Profile Picture**: Place as `static/images/pp.jpg` (used in Contact app)

### 🔄 Syncing v1 Data

After updating `src/lib/data/portfolio-data.json`, sync it to the v1 pages:

```bash
npm run sync:v1-data
```

This copies the JSON file to `static/v1/portfolio-data.json` for the mobile version.

### 📁 Project Structure

The project follows this structure:
- **`src/`**: SvelteKit source files and components
- **`static/`**: Static assets (images, HTML files for emotion-field and v1)
- **`build/`**: Build output directory (generated by `npm run build`)
- **Root directories**: `emotion-field/` and `v1/` are automatically copied from `build/` after each build for GitHub Pages deployment

**Note**: The `emotion-field/` and `v1/` directories in the root are automatically generated during the build process. Do not edit them manually - edit the source files in `static/emotion-field/` and `static/v1/` instead.

---

## Installation

### Prerequisites
- Node.js 18+ and npm

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/macOS-Themed-Portfolio.git
   cd macOS-Themed-Portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Customize your content:**
   - Edit `src/lib/data/portfolio-data.json` with your information
   - Add your images to `static/images/`
   - Update `static/spirited-away-haku.jpg` with your preferred background

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:1111 in your browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

### 📜 Available Scripts

- **`npm run dev`**: Start development server
- **`npm run build`**: Build for production (automatically runs `deploy:copy` after build)
- **`npm run build:preview`**: Build with empty base path for local preview
- **`npm run build:production`**: Build with subdirectory base path
- **`npm run preview`**: Preview the production build locally
- **`npm run preview:local`**: Build and preview with empty base path
- **`npm run sync:v1-data`**: Sync portfolio data to v1 mobile pages
- **`npm run deploy:copy`**: Copy emotion-field and v1 directories from build to root (runs automatically after build)
- **`npm run check`**: Type check the project
- **`npm run check:watch`**: Type check in watch mode

---

## Deployment

### GitHub Pages

This project is configured for GitHub Pages deployment:

1. **Update `svelte.config.js`** if your repository name differs:
   ```js
   paths: {
     base: process.env.BASE_PATH || (process.env.NODE_ENV === 'production' ? '/your-repo-name' : '')
   }
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   ```
   The build process will:
   - Generate static files in the `build` directory
   - Automatically copy `emotion-field/` and `v1/` directories from `build/` to root (required for GitHub Pages root domain deployment)
   
   The `build` directory contains the static files, and the root directories are automatically synced for GitHub Pages.

3. **Deployment Options:**
   - **Root Domain** (`username.github.io`): The build script automatically copies required directories to root. Just push the changes.
   - **Subdirectory**: Configure `svelte.config.js` with the correct base path
   - **GitHub Actions** (optional): Set up GitHub Actions to automatically build and deploy on push

### Other Static Hosts

The project uses `@sveltejs/adapter-static`, so it can be deployed to any static hosting service:
- Netlify
- Vercel
- Cloudflare Pages
- Any static file server

---

## Features

### Core Features
- 🖥️ Desktop-like interface with Status Bar, Widgets, and Dock
- 🚀 Launchpad for app-like experience
- 📱 Responsive design with mobile redirect
- 🪟 Draggable, resizable, minimizable windows

### Applications
- **Terminal**: Interactive command-line interface
- **Blog**: Medium and Substack integration
- **Projects**: GitHub repository showcase
- **Safari**: In-app browser
- **Books**: Reading list and research papers
- **Contact**: Personal information and social links
- **Resume**: Embedded resume viewer
- **Games**: Game collection showcase
- **Emotion Field**: Interactive mood-driven particle visualization (standalone demo)

### Desktop Widgets
- **Music Player**: YouTube playlist integration
- **Clock**: Live date and time
- **Quote**: Inspirational quotes

---

## Contributing

This is a customized fork. If you'd like to contribute to the original project, please visit:
[https://github.com/ansxuman/macOS-Themed-Portfolio](https://github.com/ansxuman/macOS-Themed-Portfolio)

---

## License

This project is licensed under the [Apache-2.0 license](LICENSE).

**Original Project:** Copyright (c) ansxuman  
**This Fork:** Customized for personal use

---

## Acknowledgments

- **Original Creator**: [ansxuman](https://github.com/ansxuman) for the amazing macOS-themed portfolio template
- **Technologies**: SvelteKit, TypeScript, TailwindCSS
- **APIs**: Medium RSS, YouTube RSS, Substack Embed API

---

Made with 💖 between Istanbul & Berlin
