# Emotion Field - Mood-Driven Particle Auras

An interactive web application that uses hand tracking to create dynamic particle effects based on your mood and gestures.

## Features

- **Real-time Hand Tracking**: Uses MediaPipe Hands to track hand movements
- **Mood Detection**: Automatically detects your mood (CALM, ACTIVE, ENERGETIC, FOCUSED) based on hand movements
- **Gesture Recognition**: 
  - Fist gestures create particle attraction points
  - Clapping creates shockwave effects
  - Swipe gestures affect particle movement
- **Multiple Scenes**: Choose from Forest Mist, Cyber City, or Starlit Room
- **Color Palettes**: Select from 5 different color schemes
- **Interactive Particles**: Particles respond to your gestures and create beautiful visual effects

## How to Use

1. Open `index.html` in a modern web browser
2. Click "Start Camera" to begin
3. Allow camera permissions when prompted
4. Move your hands in front of the camera to create particle effects
5. Try different gestures:
   - Open hands: Creates flowing particles
   - Fists: Attracts particles to your hands
   - Clap: Creates a shockwave effect
   - Swipe: Pushes particles in the swipe direction

## Requirements

- Modern web browser with camera access
- HTTPS connection (required for camera access on GitHub Pages)
- MediaPipe Hands library (loaded from CDN)

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may require HTTPS)
- Mobile browsers: Supported (camera access required)

## Files

- `index.html` - Main HTML structure
- `styles.css` - All styling and animations
- `script.js` - Core application logic and hand tracking

## GitHub Pages Compatibility

✅ **Yes, this will work on GitHub Pages!**

The application is fully static and uses:
- CDN-hosted MediaPipe Hands library (no local dependencies)
- Standard web APIs (getUserMedia, Canvas API)
- No server-side requirements

**Note**: Camera access requires HTTPS, which GitHub Pages provides automatically. Users will need to grant camera permissions when prompted.

