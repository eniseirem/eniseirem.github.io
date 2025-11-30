<script lang="ts">
    import "../app.css";
    import { portfolio } from '../lib/utils/portfolioData';
    import { base } from '$app/paths';
    
    // Construct og:url for static builds
    // For GitHub Pages, use the base path
    const ogUrl = base ? `https://eniseirem.github.io${base}` : 'https://eniseirem.github.io';
  </script>
  
  <svelte:head>
    <meta name="description" content="{portfolio.personalInfo.name} - {portfolio.personalInfo.role}. {portfolio.bio.short}" />
    <meta name="keywords" content="data science, explainable AI, machine learning, genomics, portfolio, {portfolio.personalInfo.name}" />
    <meta name="author" content={portfolio.personalInfo.name} />
    <meta property="og:title" content="{portfolio.personalInfo.name} - {portfolio.personalInfo.role} & Researcher" />
    <meta property="og:description" content={portfolio.bio.short} />
    <meta property="og:url" content={ogUrl} />
    <title>{portfolio.personalInfo.name} | {portfolio.personalInfo.role} & Researcher</title>
  </svelte:head>
  
  <slot />