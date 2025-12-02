const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('video');
const videoContainer = document.getElementById('videoContainer');
const handCanvas = document.getElementById('handCanvas');
const handCtx = handCanvas.getContext('2d');
const moodDisplay = document.getElementById('moodDisplay');
const startButton = document.getElementById('startButton');
const statusText = document.getElementById('status');

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Scene configurations
const scenes = {
    'Forest Mist': {
        particleShape: 'circle',
        gravity: 0.02,
        wind: 0.1,
        blur: 3,
        glow: true
    },
    'Cyber City': {
        particleShape: 'rect',
        gravity: -0.05,
        wind: 0.3,
        blur: 0,
        glow: true
    },
    'Starlit Room': {
        particleShape: 'star',
        gravity: 0,
        wind: 0.02,
        blur: 1,
        glow: true
    }
};

// Color palettes
const palettes = {
    'Serene Blues': ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd'],
    'Warm Sunset': ['#dc2626', '#f97316', '#fbbf24', '#fef3c7'],
    'Electric Violet': ['#7c3aed', '#a78bfa', '#c4b5fd', '#e9d5ff'],
    'Forest Green': ['#064e3b', '#047857', '#10b981', '#6ee7b7'],
    'Rose Gold': ['#9f1239', '#e11d48', '#fb7185', '#fda4af']
};

// State
let currentScene = 'Forest Mist';
let currentPalette = 'Serene Blues';
let currentMood = 'CALM';
let particles = [];
let hands = null;
let camera = null;
let isRunning = false;
let lastFrameTime = Date.now();
let fpsCounter = 0;
let fpsLastUpdate = Date.now();

// Gesture tracking
let handPositions = [];
let lastHandPositions = [];
let gestureState = {
    leftFist: false,
    rightFist: false,
    clapDetected: false,
    clapCooldown: 0,
    swipeDirection: null,
    swipeForce: 0,
    middleFingerDetected: false,
    middleFingerCooldown: 0,
    blurHand: false
};
let attractionPoints = [];

// Mood parameters (smoothly interpolated)
let moodParams = {
    speed: 1,
    emission: 5,
    size: 3,
    spread: 100,
    clustering: 0
};
let targetMoodParams = { ...moodParams };

// Create UI chips
function createChips(container, items, activeItem, onSelect) {
    container.innerHTML = '';
    items.forEach(item => {
        const chip = document.createElement('div');
        chip.className = 'chip' + (item === activeItem ? ' active' : '');
        chip.textContent = item;
        chip.onclick = () => {
            onSelect(item);
            createChips(container, items, item, onSelect);
        };
        container.appendChild(chip);
    });
}

createChips(
    document.getElementById('sceneChips'),
    Object.keys(scenes),
    currentScene,
    scene => currentScene = scene
);

createChips(
    document.getElementById('paletteChips'),
    Object.keys(palettes),
    currentPalette,
    palette => currentPalette = palette
);

// Particle class
class Particle {
    constructor(x, y, mood, handIndex = 0) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * moodParams.spread * 0.02;
        this.vy = (Math.random() - 0.5) * moodParams.spread * 0.02;
        this.size = moodParams.size + Math.random() * moodParams.size;
        this.life = 1;
        this.decay = 0.003 + Math.random() * 0.004; // Faster decay for clearer trail
        this.handIndex = handIndex; // Track which hand created this particle
        this.baseColor = palettes[currentPalette][handIndex % palettes[currentPalette].length];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.mixedColor = null; // For color mixing zones
    }

    update() {
        const scene = scenes[currentScene];
        
        // Apply attraction to fist positions
        attractionPoints.forEach(point => {
            const dx = point.x - this.x;
            const dy = point.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0 && dist < 300) {
                const force = (300 - dist) / 300 * 2;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
        });
        
        // Apply swipe force
        if (gestureState.swipeForce > 0) {
            if (gestureState.swipeDirection) {
                this.vx += gestureState.swipeDirection.x * gestureState.swipeForce * 0.5;
                this.vy += gestureState.swipeDirection.y * gestureState.swipeForce * 0.5;
            }
        }
        
        // Apply gravity and wind
        this.vy += scene.gravity;
        this.vx += (Math.random() - 0.5) * scene.wind * 0.1;
        
        // Apply speed multiplier
        this.x += this.vx * moodParams.speed;
        this.y += this.vy * moodParams.speed;
        
        // Apply drag
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        // Clustering behavior
        if (moodParams.clustering > 0.5) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const dx = centerX - this.x;
            const dy = centerY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                this.vx += (dx / dist) * 0.5 * moodParams.clustering;
                this.vy += (dy / dist) * 0.5 * moodParams.clustering;
            }
        }
        
        // Rotation
        this.rotation += this.rotationSpeed;
        
        // Life decay
        this.life -= this.decay;
        
        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        
        // Check for color mixing with other particles
        this.checkColorMixing();
    }

    // Check if particle is near particles from different hand
    checkColorMixing() {
        if (handPositions.length < 2) return;
        
        const mixRadius = 50;
        for (let other of particles) {
            if (other === this || other.handIndex === this.handIndex) continue;
            
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < mixRadius) {
                // Mix the colors
                const rgb1 = this.hexToRgb(this.baseColor);
                const rgb2 = this.hexToRgb(other.baseColor);
                const ratio = 1 - (dist / mixRadius);
                
                this.mixedColor = `rgb(${
                    Math.floor((rgb1.r + rgb2.r) / 2)
                }, ${
                    Math.floor((rgb1.g + rgb2.g) / 2)
                }, ${
                    Math.floor((rgb1.b + rgb2.b) / 2)
                })`;
                return;
            }
        }
        this.mixedColor = null;
    }

    // Convert hex color to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    // Interpolate color from light to dark based on life
    getColor() {
        const baseColor = this.mixedColor || this.baseColor;
        const rgb = typeof baseColor === 'string' && baseColor.startsWith('rgb') 
            ? this.parseRgb(baseColor)
            : this.hexToRgb(baseColor);
        
        // Start bright (life = 1), fade to dark (life = 0)
        const brightness = this.life > 0.5 
            ? 1 + (this.life - 0.5) * 1.0  // 1.0 to 1.5 when fresh
            : 0.2 + (this.life * 1.6);      // 0.2 to 1.0 when fading
        
        const r = Math.min(255, Math.floor(rgb.r * brightness));
        const g = Math.min(255, Math.floor(rgb.g * brightness));
        const b = Math.min(255, Math.floor(rgb.b * brightness));
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    parseRgb(rgbString) {
        const matches = rgbString.match(/\d+/g);
        return {
            r: parseInt(matches[0]),
            g: parseInt(matches[1]),
            b: parseInt(matches[2])
        };
    }

    draw() {
        const scene = scenes[currentScene];
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.life;
        
        const currentColor = this.getColor();
        
        if (scene.glow) {
            // Glow is stronger for newer particles
            ctx.shadowBlur = 20 * this.life;
            ctx.shadowColor = currentColor;
        }
        
        ctx.fillStyle = currentColor;
        
        if (scene.particleShape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (scene.particleShape === 'rect') {
            ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        } else if (scene.particleShape === 'star') {
            this.drawStar(0, 0, 5, this.size, this.size / 2);
        }
        
        ctx.restore();
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Mood detection from hand data
function detectMood(handData) {
    if (!handData || handData.length === 0) {
        return 'CALM';
    }

    const hand = handData[0];
    const landmarks = hand.landmarks;
    
    // Calculate hand openness (distance between fingertips)
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const pinkyTip = landmarks[20];
    
    const openness = Math.sqrt(
        Math.pow(thumbTip.x - pinkyTip.x, 2) +
        Math.pow(thumbTip.y - pinkyTip.y, 2)
    );
    
    // Calculate movement speed (we'll track this over frames)
    if (!detectMood.lastPos) {
        detectMood.lastPos = landmarks[9]; // middle of hand
        detectMood.speed = 0;
    }
    
    const currentPos = landmarks[9];
    const speed = Math.sqrt(
        Math.pow(currentPos.x - detectMood.lastPos.x, 2) +
        Math.pow(currentPos.y - detectMood.lastPos.y, 2)
    );
    
    detectMood.lastPos = currentPos;
    detectMood.speed = detectMood.speed * 0.8 + speed * 0.2; // Smooth
    
    // Calculate movement area (bounding box)
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    landmarks.forEach(lm => {
        minX = Math.min(minX, lm.x);
        maxX = Math.max(maxX, lm.x);
        minY = Math.min(minY, lm.y);
        maxY = Math.max(maxY, lm.y);
    });
    const movementArea = (maxX - minX) * (maxY - minY);
    
    // Detect mood
    if (detectMood.speed < 0.01 && openness > 0.3) {
        // Slow, open movements
        targetMoodParams.speed = 0.5;
        targetMoodParams.emission = 3;
        targetMoodParams.size = 4;
        targetMoodParams.spread = 50;
        targetMoodParams.clustering = 0;
        return 'CALM';
    } else if (detectMood.speed > 0.05 && movementArea > 0.1) {
        // Fast, wide movements
        targetMoodParams.speed = 3;
        targetMoodParams.emission = 15;
        targetMoodParams.size = 2;
        targetMoodParams.spread = 200;
        targetMoodParams.clustering = 0;
        return 'ENERGETIC';
    } else if (detectMood.speed < 0.03 && movementArea < 0.05) {
        // Small, controlled movements
        targetMoodParams.speed = 1;
        targetMoodParams.emission = 8;
        targetMoodParams.size = 3;
        targetMoodParams.spread = 30;
        targetMoodParams.clustering = 0.8;
        return 'FOCUSED';
    } else {
        // Default
        targetMoodParams.speed = 1.5;
        targetMoodParams.emission = 7;
        targetMoodParams.size = 3;
        targetMoodParams.spread = 100;
        targetMoodParams.clustering = 0.3;
        return 'ACTIVE';
    }
}

// Detect if hand is in a fist
function isFist(landmarks) {
    // Check if all fingertips are close to palm
    const palm = landmarks[0];
    const fingertips = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky
    
    let closedCount = 0;
    fingertips.forEach(tip => {
        const dist = Math.sqrt(
            Math.pow(landmarks[tip].x - palm.x, 2) +
            Math.pow(landmarks[tip].y - palm.y, 2)
        );
        if (dist < 0.15) closedCount++;
    });
    
    return closedCount >= 4; // At least 4 fingers closed
}

// Detect middle finger gesture (F U sign)
function isMiddleFinger(landmarks) {
    const wrist = landmarks[0];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10]; // Middle joint of middle finger
    const middleMCP = landmarks[9]; // Base of middle finger
    
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];
    const thumbTip = landmarks[4];
    
    // Calculate distances from wrist
    const middleDist = Math.sqrt(
        Math.pow(middleTip.x - wrist.x, 2) +
        Math.pow(middleTip.y - wrist.y, 2)
    );
    
    const indexDist = Math.sqrt(
        Math.pow(indexTip.x - wrist.x, 2) +
        Math.pow(indexTip.y - wrist.y, 2)
    );
    
    const ringDist = Math.sqrt(
        Math.pow(ringTip.x - wrist.x, 2) +
        Math.pow(ringTip.y - wrist.y, 2)
    );
    
    const pinkyDist = Math.sqrt(
        Math.pow(pinkyTip.x - wrist.x, 2) +
        Math.pow(pinkyTip.y - wrist.y, 2)
    );
    
    // Middle finger should be significantly extended
    const middleExtended = middleDist > 0.22;
    
    // Other fingers should be folded (shorter distance from wrist)
    const indexFolded = indexDist < middleDist - 0.08;
    const ringFolded = ringDist < middleDist - 0.08;
    const pinkyFolded = pinkyDist < middleDist - 0.08;
    
    // Check if middle finger is straight (tip should be far from base)
    const middleStraight = Math.sqrt(
        Math.pow(middleTip.x - middleMCP.x, 2) +
        Math.pow(middleTip.y - middleMCP.y, 2)
    ) > 0.15;
    
    // Middle finger should be pointing up (tip Y < base Y)
    const middleUp = middleTip.y < middleMCP.y - 0.05;
    
    return middleExtended && indexFolded && ringFolded && pinkyFolded && middleStraight && middleUp;
}

// Detect clap gesture (two hands coming together quickly)
function detectClap(handData) {
    if (handData.length < 2) return false;
    if (gestureState.clapCooldown > 0) return false;
    
    const hand1Palm = handData[0].landmarks[9];
    const hand2Palm = handData[1].landmarks[9];
    
    const distance = Math.sqrt(
        Math.pow(hand1Palm.x - hand2Palm.x, 2) +
        Math.pow(hand1Palm.y - hand2Palm.y, 2)
    );
    
    // Initialize tracking
    if (!detectClap.lastDistance) {
        detectClap.lastDistance = distance;
        detectClap.maxDistance = distance;
        return false;
    }
    
    // Track the maximum distance to know when hands were far
    if (distance > detectClap.maxDistance) {
        detectClap.maxDistance = distance;
    }
    
    // Calculate velocity (how fast hands are approaching)
    const velocity = detectClap.lastDistance - distance;
    detectClap.lastDistance = distance;
    
    // Clap conditions (more lenient):
    // 1. Hands are currently close (< 25% of screen width)
    const handsClose = distance < 0.25;
    // 2. Hands were far apart at some point (> 30% of screen width)
    const wereFar = detectClap.maxDistance > 0.30;
    // 3. Approaching with decent velocity
    const fastApproach = velocity > 0.03;
    
    // Debug info (draw on canvas)
    if (handData.length >= 2) {
        handCtx.save();
        handCtx.scale(-1, 1);
        handCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        handCtx.font = '12px monospace';
        handCtx.fillText(`Dist: ${distance.toFixed(2)}`, -180, handCanvas.height - 50);
        handCtx.fillText(`Max: ${detectClap.maxDistance.toFixed(2)}`, -180, handCanvas.height - 35);
        handCtx.fillText(`Vel: ${velocity.toFixed(3)}`, -180, handCanvas.height - 20);
        handCtx.fillText(`Close: ${handsClose} Far: ${wereFar} Fast: ${fastApproach}`, -400, handCanvas.height - 5);
        handCtx.restore();
    }
    
    if (handsClose && wereFar && fastApproach) {
        // Reset tracking
        detectClap.lastDistance = null;
        detectClap.maxDistance = 0;
        return true;
    }
    
    // Reset max distance if hands move apart again
    if (distance > detectClap.maxDistance * 0.8) {
        detectClap.maxDistance = distance;
    }
    
    return false;
}

// Detect swipe gesture (fast directional movement)
function detectSwipe(handData) {
    if (handData.length === 0) return null;
    
    const palm = handData[0].landmarks[9];
    
    if (!detectSwipe.lastPos) {
        detectSwipe.lastPos = palm;
        return null;
    }
    
    const dx = palm.x - detectSwipe.lastPos.x;
    const dy = palm.y - detectSwipe.lastPos.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    
    detectSwipe.lastPos = palm;
    
    // Swipe detected if speed is high enough
    if (speed > 0.08) {
        return {
            x: dx / speed,
            y: dy / speed,
            force: Math.min(speed * 10, 5)
        };
    }
    
    return null;
}

// Create shockwave effect from clap
function createShockwave(x, y) {
    const particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 5 + Math.random() * 5;
        
        const particle = new Particle(x, y, currentMood, 0);
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        particle.size *= 1.5;
        particle.decay *= 0.5; // Live longer
        particles.push(particle);
    }
}

// Smooth parameter interpolation
function interpolateParams(dt) {
    const lerpSpeed = 0.05;
    for (let key in moodParams) {
        moodParams[key] += (targetMoodParams[key] - moodParams[key]) * lerpSpeed;
    }
}

// Initialize MediaPipe Hands
async function initializeHands() {
    const Hands = window.Hands;
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onHandsResults);
}

function onHandsResults(results) {
    // Clear hand canvas
    handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
    
    // Update last hand positions for gesture detection
    lastHandPositions = [...handPositions];
    handPositions = [];
    attractionPoints = [];
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const handData = results.multiHandLandmarks.map((landmarks, index) => ({
            landmarks: landmarks,
            handedness: results.multiHandedness ? results.multiHandedness[index].label : 'Unknown',
            index: index
        }));
        
        // Store hand positions
        handData.forEach(hand => {
            const palm = hand.landmarks[9];
            handPositions.push({
                x: palm.x,
                y: palm.y,
                handIndex: hand.index
            });
        });
        
        // Detect gestures
        handData.forEach((hand, idx) => {
            const fist = isFist(hand.landmarks);
            if (fist) {
                const palm = hand.landmarks[9];
                attractionPoints.push({
                    x: (1 - palm.x) * canvas.width, // Mirror x position
                    y: palm.y * canvas.height
                });
            }
        });
        
        // Detect clap
        if (detectClap(handData)) {
            const midX = (1 - (handPositions[0].x + handPositions[1].x) / 2) * canvas.width; // Mirror x
            const midY = (handPositions[0].y + handPositions[1].y) / 2 * canvas.height;
            createShockwave(midX, midY);
            gestureState.clapCooldown = 20; // Reduced cooldown (was 30)
            gestureState.clapDetected = true;
        }
        
        // Visual feedback on hand canvas (counter-mirror the text)
        if (gestureState.clapCooldown > 0) {
            handCtx.save();
            handCtx.scale(-1, 1);
            handCtx.fillStyle = `rgba(255, 255, 0, ${gestureState.clapCooldown / 20})`;
            handCtx.font = 'bold 32px sans-serif';
            handCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            handCtx.lineWidth = 3;
            handCtx.strokeText('💥 CLAP! 💥', -handCanvas.width / 2 - 80, 40);
            handCtx.fillText('💥 CLAP! 💥', -handCanvas.width / 2 - 80, 40);
            handCtx.restore();
        }
        
        // Detect swipe
        const swipe = detectSwipe(handData);
        if (swipe) {
            gestureState.swipeDirection = swipe;
            gestureState.swipeForce = swipe.force;
        } else {
            gestureState.swipeForce *= 0.9; // Decay swipe force
        }
        
        // Draw particle bridges between two hands
        if (handData.length >= 2) {
            const palm1 = handData[0].landmarks[9];
            const palm2 = handData[1].landmarks[9];
            
            const x1 = (1 - palm1.x) * canvas.width; // Mirror x positions
            const y1 = palm1.y * canvas.height;
            const x2 = (1 - palm2.x) * canvas.width; // Mirror x positions
            const y2 = palm2.y * canvas.height;
            
            // Create particles along the bridge
            const bridgeParticles = 5;
            for (let i = 0; i <= bridgeParticles; i++) {
                const t = i / bridgeParticles;
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                
                // Add some wave to the bridge
                const wave = Math.sin(t * Math.PI * 3 + Date.now() * 0.01) * 20;
                const perpX = -(y2 - y1);
                const perpY = (x2 - x1);
                const perpLen = Math.sqrt(perpX * perpX + perpY * perpY);
                
                if (perpLen > 0) {
                    const finalX = x + (perpX / perpLen) * wave;
                    const finalY = y + (perpY / perpLen) * wave;
                    
                    // Alternate between hand colors
                    const handIndex = Math.floor(t * 2);
                    particles.push(new Particle(finalX, finalY, currentMood, handIndex));
                }
            }
            
            // Draw bridge visualization on hand canvas
            handCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            handCtx.lineWidth = 2;
            handCtx.setLineDash([5, 5]);
            handCtx.beginPath();
            handCtx.moveTo(palm1.x * handCanvas.width, palm1.y * handCanvas.height);
            handCtx.lineTo(palm2.x * handCanvas.width, palm2.y * handCanvas.height);
            handCtx.stroke();
            handCtx.setLineDash([]);
        }
        
        // Draw hand visualization
        handData.forEach((hand, index) => {
            const landmarks = hand.landmarks;
            const isFistClosed = isFist(landmarks);
            const isFlippingOff = isMiddleFinger(landmarks);
            
            // Detect middle finger gesture
            if (isFlippingOff && gestureState.middleFingerCooldown === 0) {
                gestureState.middleFingerDetected = true;
                gestureState.middleFingerCooldown = 120; // 2 seconds cooldown
                gestureState.blurHand = true;
                
                // Create particle explosion at middle finger
                const middleTip = landmarks[12];
                const x = (1 - middleTip.x) * canvas.width;
                const y = middleTip.y * canvas.height;
                
                // Red angry particles
                for (let i = 0; i < 50; i++) {
                    const angle = (Math.PI * 2 * i) / 50;
                    const speed = 3 + Math.random() * 3;
                    const particle = new Particle(x, y, currentMood, index);
                    particle.vx = Math.cos(angle) * speed;
                    particle.vy = Math.sin(angle) * speed;
                    particle.baseColor = '#ff0000'; // Force red color
                    particle.size *= 1.2;
                    particles.push(particle);
                }
            }
            
            // Apply blur effect if middle finger was detected
            const shouldBlur = isFlippingOff || (gestureState.blurHand && gestureState.middleFingerCooldown > 90);
            
            // Calculate bounding box
            let minX = 1, maxX = 0, minY = 1, maxY = 0;
            landmarks.forEach(lm => {
                minX = Math.min(minX, lm.x);
                maxX = Math.max(maxX, lm.x);
                minY = Math.min(minY, lm.y);
                maxY = Math.max(maxY, lm.y);
            });
            
            // Add padding to bounding box
            const padding = 0.02;
            minX = Math.max(0, minX - padding);
            maxX = Math.min(1, maxX + padding);
            minY = Math.max(0, minY - padding);
            maxY = Math.min(1, maxY + padding);
            
            // Draw blur effect over hand if needed
            if (shouldBlur) {
                handCtx.save();
                handCtx.filter = 'blur(20px)';
                handCtx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                handCtx.fillRect(
                    minX * handCanvas.width,
                    minY * handCanvas.height,
                    (maxX - minX) * handCanvas.width,
                    (maxY - minY) * handCanvas.height
                );
                handCtx.restore();
            }
            
            // Color based on gesture
            handCtx.strokeStyle = isFlippingOff ? '#ff0000' :
                                  isFistClosed ? '#ff0000' : 
                                  currentMood === 'CALM' ? '#60a5fa' :
                                  currentMood === 'ENERGETIC' ? '#f97316' :
                                  currentMood === 'FOCUSED' ? '#a78bfa' : '#10b981';
            handCtx.lineWidth = isFlippingOff ? 4 : 3;
            handCtx.strokeRect(
                minX * handCanvas.width,
                minY * handCanvas.height,
                (maxX - minX) * handCanvas.width,
                (maxY - minY) * handCanvas.height
            );
            
            // Draw hand label (counter-mirror the text to make it readable)
            handCtx.save();
            handCtx.scale(-1, 1); // Flip text horizontally to counter the mirror
            handCtx.fillStyle = handCtx.strokeStyle;
            handCtx.font = 'bold 14px sans-serif';
            const label = isFlippingOff ? `🚫 CENSORED` :
                          isFistClosed ? `Hand ${index + 1} - FIST` : 
                          `Hand ${index + 1}`;
            const labelWidth = handCtx.measureText(label).width;
            handCtx.fillText(
                label,
                -(minX * handCanvas.width + 5 + labelWidth),
                minY * handCanvas.height - 5
            );
            handCtx.restore();
            
            // Draw landmarks
            landmarks.forEach((landmark, i) => {
                const x = landmark.x * handCanvas.width;
                const y = landmark.y * handCanvas.height;
                
                // Different colors for different finger parts
                if (i === 0) {
                    // Wrist - larger
                    handCtx.fillStyle = '#ffffff';
                    handCtx.beginPath();
                    handCtx.arc(x, y, 6, 0, Math.PI * 2);
                    handCtx.fill();
                } else if ([4, 8, 12, 16, 20].includes(i)) {
                    // Fingertips - highlighted
                    handCtx.fillStyle = '#ffff00';
                    handCtx.beginPath();
                    handCtx.arc(x, y, 5, 0, Math.PI * 2);
                    handCtx.fill();
                } else {
                    // Other joints
                    handCtx.fillStyle = handCtx.strokeStyle;
                    handCtx.beginPath();
                    handCtx.arc(x, y, 3, 0, Math.PI * 2);
                    handCtx.fill();
                }
            });
            
            // Draw connections between landmarks
            handCtx.strokeStyle = handCtx.fillStyle;
            handCtx.lineWidth = 2;
            handCtx.globalAlpha = 0.6;
            
            // Hand connections (simplified finger structure)
            const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
                [0, 5], [5, 6], [6, 7], [7, 8], // Index
                [0, 9], [9, 10], [10, 11], [11, 12], // Middle
                [0, 13], [13, 14], [14, 15], [15, 16], // Ring
                [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
                [5, 9], [9, 13], [13, 17] // Palm connections
            ];
            
            connections.forEach(([start, end]) => {
                const startLm = landmarks[start];
                const endLm = landmarks[end];
                handCtx.beginPath();
                handCtx.moveTo(startLm.x * handCanvas.width, startLm.y * handCanvas.height);
                handCtx.lineTo(endLm.x * handCanvas.width, endLm.y * handCanvas.height);
                handCtx.stroke();
            });
            
            handCtx.globalAlpha = 1;
        });
        
        const mood = detectMood(handData);
        if (mood !== currentMood) {
            currentMood = mood;
            updateMoodDisplay();
        }
        
        // Emit particles from hand position (mirror x-coordinate)
        handData.forEach((hand, idx) => {
            const palm = hand.landmarks[9];
            const x = (1 - palm.x) * canvas.width; // Mirror x position
            const y = palm.y * canvas.height;
            
            for (let i = 0; i < moodParams.emission; i++) {
                particles.push(new Particle(x, y, currentMood, idx));
            }
        });
    }
    
    // Decrease clap cooldown
    if (gestureState.clapCooldown > 0) {
        gestureState.clapCooldown--;
    }
    
    // Decrease middle finger cooldown
    if (gestureState.middleFingerCooldown > 0) {
        gestureState.middleFingerCooldown--;
    }
}

function updateMoodDisplay() {
    moodDisplay.textContent = currentMood;
    const colors = {
        'CALM': '#60a5fa',
        'ENERGETIC': '#f97316',
        'FOCUSED': '#a78bfa',
        'ACTIVE': '#10b981'
    };
    moodDisplay.style.color = colors[currentMood] || '#ffffff';
}

// Start camera
async function startCamera() {
    try {
        startButton.disabled = true;
        statusText.textContent = 'Initializing...';
        statusText.classList.add('loading');
        
        await initializeHands();
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        });
        
        video.srcObject = stream;
        videoContainer.style.display = 'block';
        
        await video.play();
        
        // Set hand canvas dimensions to match video
        handCanvas.width = 240;
        handCanvas.height = 180;
        
        isRunning = true;
        statusText.textContent = 'Tracking hands...';
        statusText.classList.remove('loading');
        startButton.textContent = 'Running';
        
        processFrame();
    } catch (error) {
        console.error('Error starting camera:', error);
        statusText.textContent = 'Error: ' + error.message;
        statusText.classList.remove('loading');
        startButton.disabled = false;
    }
}

async function processFrame() {
    if (!isRunning) return;
    
    if (hands && video.readyState === 4) {
        await hands.send({ image: video });
    }
    
    requestAnimationFrame(processFrame);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const now = Date.now();
    const dt = now - lastFrameTime;
    lastFrameTime = now;
    
    // FPS counter
    fpsCounter++;
    if (now - fpsLastUpdate > 1000) {
        document.getElementById('fps').textContent = fpsCounter;
        fpsCounter = 0;
        fpsLastUpdate = now;
    }
    
    // Interpolate mood parameters
    interpolateParams(dt);
    
    // Clear canvas with stronger fade effect for better trail visibility
    const scene = scenes[currentScene];
    ctx.fillStyle = `rgba(0, 0, 0, ${0.15 + scene.blur * 0.01})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw middle finger warning banner on main canvas
    if (gestureState.middleFingerCooldown > 0) {
        const messages = [
            "🚫 Not appropriate!",
            "😱 Whoa there!",
            "🙈 Come on now...",
            "⚠️ Keep it friendly!",
            "😤 Not cool!",
            "🛑 Keep it PG!"
        ];
        
        if (!gestureState.selectedMessage) {
            gestureState.selectedMessage = messages[Math.floor(Math.random() * messages.length)];
        }
        
        const alpha = gestureState.middleFingerCooldown > 90 ? 1 : gestureState.middleFingerCooldown / 90;
        
        ctx.save();
        
        // Measure text to fit banner
        ctx.font = 'bold 24px sans-serif';
        const textWidth = ctx.measureText(gestureState.selectedMessage).width;
        const bannerWidth = textWidth + 60;
        const bannerHeight = 50;
        const bannerX = (canvas.width - bannerWidth) / 2;
        const bannerY = 20;
        
        // Background box
        ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.9})`;
        ctx.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);
        
        // Border
        ctx.strokeStyle = `rgba(139, 0, 0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(bannerX, bannerY, bannerWidth, bannerHeight);
        
        // Warning text
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.lineWidth = 3;
        ctx.strokeText(gestureState.selectedMessage, bannerX + 30, bannerY + 33);
        ctx.fillText(gestureState.selectedMessage, bannerX + 30, bannerY + 33);
        ctx.restore();
        
        if (gestureState.middleFingerCooldown === 1) {
            gestureState.selectedMessage = null;
            gestureState.blurHand = false;
        }
    }
    
    // Update and draw particles
    particles = particles.filter(p => {
        p.update();
        p.draw();
        return !p.isDead();
    });
    
    // Update particle count
    document.getElementById('particleCount').textContent = particles.length;
    
    // Emit ambient particles when no hands detected
    if (particles.length < 100 && Math.random() < 0.3) {
        particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            currentMood
        ));
    }
}

// Start button
startButton.addEventListener('click', startCamera);

// Start animation loop
animate();

