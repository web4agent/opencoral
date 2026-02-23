const mapHtml = `
<div class="map-viewport">
    <!-- Coordinate HUD -->
    <div class="coord-hud">
        <div class="coord-display">
            X: <input type="number" id="input-x" value="0">
            Y: <input type="number" id="input-y" value="0">
        </div>
        <div class="coord-hint">ENTER TO JUMP...</div>
    </div>

    <div id="map-grid" class="map-grid"></div>
    <div id="procedural-terrain" class="procedural-terrain"></div>
    <div id="bubbles-layer" class="bubbles-layer"></div>
    
    <!-- Timeline & Navigation Control -->
    <div class="nav-control-container">
        <button id="home-btn" class="home-btn" title="Return to Origin (NOW)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
        </button>

        <div class="timeline-container">
            <div class="slider-wrapper">
                <button id="time-prev" class="time-nudge-btn" title="Nudge back 5 mins (Towards NOW)">◀</button>
                <input type="range" id="timeline-slider" min="0" max="10080" value="0" step="1">
                <button id="time-next" class="time-nudge-btn" title="Nudge forward 5 mins (Into History)">▶</button>
            </div>
            <div class="timeline-labels">
                <span>NOW</span>
                <span>-1D</span>
                <span>-3D</span>
                <span>-7D</span>
            </div>
            <div id="timeline-indicator" class="active-indicator">NOW</div>
        </div>
    </div>
</div>
`;

const mapCss = `
.map-viewport {
    width: 100vw;
    height: 100vh;
    cursor: grab;
    user-select: none;
    background: #E0F7FA;
    background: radial-gradient(circle at center, #E0F7FA 0%, #80DEEA 100%);
    overflow: hidden;
    pointer-events: auto;
}

.map-viewport:active {
    cursor: grabbing;
}

/* Coordinate HUD */
.coord-hud {
    position: fixed;
    top: 80px; /* Moved down to avoid 60px title bar */
    left: 20px;
    z-index: 2000;
    background: rgba(255, 255, 255, 0.7);
    padding: 10px 15px;
    border-radius: 12px;
    border: 1px solid rgba(0, 229, 255, 0.4);
    box-shadow: 0 4px 16px rgba(0, 136, 255, 0.1);
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.coord-display {
    color: #006064;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

.coord-display input {
    background: rgba(0, 0, 0, 0.05);
    border: none;
    border-bottom: 1px solid rgba(0, 136, 255, 0.3);
    color: #006064;
    width: 60px;
    font-family: inherit;
    font-size: inherit;
    padding: 2px 4px;
    text-align: right;
}

.coord-hint {
    color: #00838F;
    font-size: 0.5rem;
    letter-spacing: 1px;
    font-weight: bold;
}

.map-grid {
    position: absolute;
    inset: -100px;
    background-image: 
        linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px);
    background-size: 100px 100px;
    pointer-events: none;
    z-index: 2;
}

.procedural-terrain {
    position: absolute;
    width: 0;
    height: 0;
    top: 0;
    left: 0;
    pointer-events: none;
    will-change: transform;
    z-index: 1;
}

.bubbles-layer {
    position: absolute;
    width: 0;
    height: 0;
    top: 0;
    left: 0;
    pointer-events: none;
    will-change: transform;
    z-index: 5;
}

.bubbles-layer > * {
    pointer-events: auto;
}

.tech-island {
    position: absolute;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 0 15px rgba(0, 255, 204, 0.2));
}

/* Nav & Timeline Control */
.nav-control-container {
    pointer-events: none;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background: linear-gradient(to top, rgba(224, 247, 250, 0.9) 0%, transparent 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 0 40px;
    z-index: 5000 !important;
    pointer-events: none;
}

.nav-control-container > * {
    pointer-events: auto !important;
}

.home-btn {
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(0, 229, 255, 0.4);
    color: #006064;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(8px);
}

.home-btn:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);
}

.timeline-container {
    flex: 1;
    max-width: 1000px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.slider-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 15px;
}

.time-nudge-btn {
    background: rgba(255, 64, 129, 0.1);
    border: 1px solid rgba(255, 64, 129, 0.4);
    color: #FF4081;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.time-nudge-btn:hover {
    background: rgba(255, 64, 129, 0.3);
    box-shadow: 0 0 10px rgba(255, 64, 129, 0.5);
}

#timeline-slider {
    flex: 1;
    background: transparent;
    -webkit-appearance: none;
}

#timeline-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 2px;
    background: rgba(0, 96, 100, 0.2);
}

#timeline-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #FF4081;
    box-shadow: 0 0 15px rgba(255, 64, 129, 0.6);
    border-radius: 50%;
    margin-top: -7px;
    cursor: pointer;
}

.timeline-labels {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    color: #00838F;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
}

.active-indicator {
    margin-top: 5px;
    color: #FF4081;
    font-size: 0.6rem;
    font-weight: bold;
}

@media (max-width: 768px) {
    .nav-control-container {
        padding: 0 15px;
        height: 70px;
        gap: 10px;
    }
    
    .home-btn {
        width: 36px;
        height: 36px;
    }
    
    .home-btn svg {
        width: 18px;
        height: 18px;
    }
    
    .time-nudge-btn {
        width: 24px;
        height: 24px;
        font-size: 0.6rem;
    }
    
    .timeline-labels span {
        font-size: 0.5rem;
    }
    
    .coord-hud {
        top: 70px;
        left: 10px;
        padding: 6px 10px;
    }
    
    .coord-display input {
        width: 40px;
    }
}
`;

const mapEngineJs = `
(function() {
    const VERSION = "2.3.0";
    console.log("🗺️ OpenCoral Map Engine v" + VERSION + " [Navigational Precision] Online.");

    const viewport = document.querySelector('.map-viewport');
    const grid = document.getElementById('map-grid');
    const terrain = document.getElementById('procedural-terrain');
    const bubbleLayer = document.getElementById('bubbles-layer');
    const slider = document.getElementById('timeline-slider');
    const timePrev = document.getElementById('time-prev');
    const timeNext = document.getElementById('time-next');
    const indicator = document.getElementById('timeline-indicator');
    const homeBtn = document.getElementById('home-btn');
    const inputX = document.getElementById('input-x');
    const inputY = document.getElementById('input-y');

    let worldX = 0;
    let worldY = 0;
    let worldZoom = 1.0;
    
    let isDragging = false;
    let startX, startY;

    function hash(x, y) {
        let h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return h - Math.floor(h);
    }

    const TILE_SIZE = 3000; // Increased from 800 to 3000 for massive ocean gaps
    const activeTiles = new Map();

    function updateTiles() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        const visibleLeft = (-worldX - cx) / worldZoom;
        const visibleTop = (-worldY - cy) / worldZoom;
        const visibleRight = (window.innerWidth - worldX - cx) / worldZoom;
        const visibleBottom = (window.innerHeight - worldY - cy) / worldZoom;

        const startTileX = Math.floor(visibleLeft / TILE_SIZE);
        const startTileY = Math.floor(visibleTop / TILE_SIZE);
        const endTileX = Math.floor(visibleRight / TILE_SIZE);
        const endTileY = Math.floor(visibleBottom / TILE_SIZE);

        const currentKeys = new Set();
        for (let tx = startTileX; tx <= endTileX; tx++) {
            for (let ty = startTileY; ty <= endTileY; ty++) {
                const key = \`\${tx},\${ty}\`;
                currentKeys.add(key);
                if (!activeTiles.has(key)) createTile(tx, ty);
            }
        }

        for (const [key, el] of activeTiles.entries()) {
            if (!currentKeys.has(key)) {
                el.remove();
                activeTiles.delete(key);
            }
        }
    }

    function createTile(tx, ty) {
        const h = hash(tx, ty);
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.position = 'absolute';
        tile.style.left = (tx * TILE_SIZE) + 'px';
        tile.style.top = (ty * TILE_SIZE) + 'px';
        
        if (h > 0.7) {
            const island = document.createElement('div');
            island.className = 'tech-island';
            const size = 600 + (h * 600); // Scaled up islands for macroscopic view
            
            // Randomly select 1 of 5 variations based on the hash
            const variantType = Math.floor(h * 100) % 5;
            // Randomly select 1 of 5 color palettes based on the hash
            const paletteIdx = Math.floor(h * 1000) % 5;
            
            const palettes = [
                { main: '#FF4081', dark: '#F50057', light: '#FF80AB' }, // Vibrant Pink
                { main: '#FFD54F', dark: '#FFB300', light: '#FFE082' }, // Neon Yellow
                { main: '#D500F9', dark: '#AA00FF', light: '#E040FB' }, // Ultra Violet
                { main: '#00E676', dark: '#00C853', light: '#69F0AE' }, // Lime Green
                { main: '#FF6D00', dark: '#DD2C00', light: '#FF9E80' }  // Atomic Tangerine
            ];
            
            const c = palettes[paletteIdx];
            let svgContent = '';

            // Base Cyan Platform (Common to all)
            const basePlatform = \`
                <path d="M100 150 L30 115 L100 80 L170 115 Z" fill="#00E5FF" fill-opacity="0.8" stroke="#00B8D4" stroke-width="2"/>
                <path d="M30 115 L100 150 L100 170 L30 135 Z" fill="#00B8D4" fill-opacity="0.9"/>
                <path d="M170 115 L100 150 L100 170 L170 135 Z" fill="#00838F" fill-opacity="0.9"/>
            \`;

            // 5 Different Structure Variations injected with random colors
            if (variantType === 0) {
                // Variation 0: Triple Spike
                svgContent = basePlatform + \`
                    <path d="M80 85 L90 30 L100 80 Z" fill="\${c.main}" fill-opacity="0.9"/>
                    <path d="M110 90 L130 50 L120 100 Z" fill="\${c.dark}" fill-opacity="0.9"/>
                    <path d="M70 100 L50 60 L85 105 Z" fill="\${c.light}" fill-opacity="0.9"/>
                    <rect x="130" y="40" width="10" height="10" fill="white" fill-opacity="0.8"/>
                    <circle cx="100" cy="100" r="5" fill="#00E5FF" fill-opacity="0.9" />
                \`;
            } else if (variantType === 1) {
                // Variation 1: Blocky Core
                svgContent = basePlatform + \`
                    <rect x="80" y="50" width="40" height="40" fill="\${c.main}" fill-opacity="0.9" transform="rotate(45 100 70)"/>
                    <rect x="90" y="40" width="20" height="20" fill="\${c.dark}" fill-opacity="0.9" transform="rotate(45 100 50)"/>
                    <path d="M60 90 L70 60 L80 95 Z" fill="\${c.light}" fill-opacity="0.8"/>
                    <circle cx="140" cy="80" r="6" fill="white" fill-opacity="0.7" />
                \`;
            } else if (variantType === 2) {
                // Variation 2: Asymmetric Cluster
                svgContent = basePlatform + \`
                    <path d="M120 90 L150 40 L130 110 Z" fill="\${c.main}" fill-opacity="0.9"/>
                    <path d="M110 95 L140 50 L120 115 Z" fill="\${c.dark}" fill-opacity="0.6"/>
                    <circle cx="70" cy="90" r="15" fill="\${c.light}" fill-opacity="0.9"/>
                    <circle cx="70" cy="90" r="8" fill="white" fill-opacity="0.5"/>
                    <rect x="50" y="60" width="8" height="8" fill="#00E5FF" fill-opacity="0.9"/>
                \`;
            } else if (variantType === 3) {
                // Variation 3: Twin Towers
                svgContent = basePlatform + \`
                    <path d="M70 80 L70 30 L90 85 Z" fill="\${c.main}" fill-opacity="0.9"/>
                    <path d="M110 90 L110 40 L130 95 Z" fill="\${c.dark}" fill-opacity="0.9"/>
                    <path d="M90 100 L100 70 L110 100 Z" fill="\${c.light}" fill-opacity="0.7"/>
                    <circle cx="100" cy="40" r="4" fill="white" fill-opacity="0.8" />
                \`;
            } else {
                // Variation 4: Geo-Sphere
                svgContent = basePlatform + \`
                    <circle cx="100" cy="70" r="30" fill="\${c.main}" fill-opacity="0.9"/>
                    <circle cx="100" cy="70" r="20" fill="\${c.dark}" fill-opacity="0.8"/>
                    <path d="M50 80 L60 50 L70 85 Z" fill="\${c.light}" fill-opacity="0.9"/>
                    <rect x="130" y="50" width="12" height="12" fill="white" fill-opacity="0.6"/>
                    <circle cx="100" cy="70" r="8" fill="#00E5FF" fill-opacity="0.9"/>
                \`;
            }

            island.innerHTML = \`
                <svg width="\${size}" height="\${size}" viewBox="0 0 200 200">
                    \${svgContent}
                </svg>
            \`;
            island.style.left = (h * TILE_SIZE * 0.8 + TILE_SIZE * 0.1) + 'px';
            island.style.top = (hash(ty, tx) * TILE_SIZE * 0.8 + TILE_SIZE * 0.1) + 'px';
            tile.appendChild(island);
        }

        terrain.appendChild(tile);
        activeTiles.set(\`\${tx},\${ty}\`, tile);
    }

    viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.nav-control-container') || e.target.closest('.coord-hud')) return;
        isDragging = true;
        startX = e.clientX - worldX;
        startY = e.clientY - worldY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        worldX = e.clientX - startX;
        worldY = e.clientY - startY;
        updateMap();
    });

    window.addEventListener('mouseup', () => isDragging = false);

    // --- Touch Support for Mobile ---
    let initialPinchDistance = null;
    let initialZoom = 1;

    viewport.addEventListener('touchstart', (e) => {
        if (e.target.closest('.nav-control-container') || e.target.closest('.coord-hud')) return;
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - worldX;
            startY = e.touches[0].clientY - worldY;
        } else if (e.touches.length === 2) {
            isDragging = false;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
            initialZoom = worldZoom;
        }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isDragging) {
            worldX = e.touches[0].clientX - startX;
            worldY = e.touches[0].clientY - startY;
            updateMap();
        } else if (e.touches.length === 2 && initialPinchDistance !== null) {
            e.preventDefault(); // Prevent native scroll
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const scale = distance / initialPinchDistance;
            worldZoom = Math.min(15.0, Math.max(0.05, initialZoom * scale));
            
            // To be precise we should zoom into the center of the pinch, but center screen is passable for mvp
            updateMap();
            window.dispatchEvent(new CustomEvent('w4ap:zoomChange', { detail: { zoom: worldZoom } }));
        }
    }, { passive: false });

    window.addEventListener('touchend', () => {
        isDragging = false;
        initialPinchDistance = null;
    });

    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const nextZoom = Math.min(15.0, Math.max(0.05, worldZoom * delta)); // Extended zoom bounds
        
        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        const dx = (worldX + cx - mouseX) / worldZoom;
        const dy = (worldY + cy - mouseY) / worldZoom;

        worldZoom = nextZoom;
        worldX = (dx * worldZoom) + mouseX - cx;
        worldY = (dy * worldZoom) + mouseY - cy;

        updateMap();
        window.dispatchEvent(new CustomEvent('w4ap:zoomChange', { detail: { zoom: worldZoom } }));
    }, { passive: false });

    
    function dispatchSpatialShift() {
        const hudX = Math.round(-worldX / worldZoom) / 1000;
        const hudY = Math.round(worldY / worldZoom) / 1000;
        window.dispatchEvent(new CustomEvent('w4ap:spatialShift', { 
            detail: { x: hudX, y: hudY, zoom: worldZoom } 
        }));
    }

    function updateMap() {
        const gridSize = 100 * worldZoom;
        grid.style.backgroundSize = \`\${gridSize}px \${gridSize}px\`;
        grid.style.backgroundPosition = \`\${worldX}px \${worldY}px\`;

        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        
        terrain.style.transform = \`translate3d(\${worldX + cx}px, \${worldY + cy}px, 0) scale(\${worldZoom})\`;
        bubbleLayer.style.transform = \`translate3d(\${worldX + cx}px, \${worldY + cy}px, 0) scale(\${worldZoom})\`;
        
        // Update HUD (Scaled by 1000x for macroscopic Cartesian pos)
        if (!inputX.matches(':focus')) inputX.value = (Math.round(-worldX / worldZoom) / 1000).toFixed(1);
        if (!inputY.matches(':focus')) inputY.value = (Math.round(worldY / worldZoom) / 1000).toFixed(1);

        updateTiles();
        dispatchSpatialShift();
    }

    function jumpTo(x, y) {
        worldZoom = 1.0;
        worldX = -x;
        worldY = y;
        updateMap();
        window.dispatchEvent(new CustomEvent('w4ap:zoomChange', { detail: { zoom: worldZoom } }));
    }

    inputX.addEventListener('keydown', (e) => { if(e.key === 'Enter') jumpTo(parseFloat(inputX.value) * 1000, parseFloat(inputY.value) * 1000); });
    inputY.addEventListener('keydown', (e) => { if(e.key === 'Enter') jumpTo(parseFloat(inputX.value) * 1000, parseFloat(inputY.value) * 1000); });

    homeBtn.addEventListener('click', () => {
        worldX = 0;
        worldY = 0;
        worldZoom = 1.0;
        slider.value = 0;
        indicator.innerText = "NOW";
        updateMap();
        window.dispatchEvent(new CustomEvent('w4ap:zoomChange', { detail: { zoom: worldZoom } }));
        window.dispatchEvent(new CustomEvent('w4ap:timelineShift', { detail: { offsetMinutes: 0 } }));
        window.dispatchEvent(new CustomEvent('w4ap:homeReset'));
    });

    function formatTimeLabel(mins) {
        if (mins === 0) return "NOW";
        const days = Math.floor(mins / 1440);
        const hours = Math.floor((mins % 1440) / 60);
        const m = mins % 60;
        let label = "- ";
        if (days > 0) label += days + "D ";
        if (hours > 0) label += hours + "H ";
        if (m > 0 || (days === 0 && hours === 0)) label += m + "M";
        return label.trim() + " AGO";
    }

    function updateTimeline(val) {
        val = Math.max(0, Math.min(10080, parseInt(val)));
        if (parseInt(slider.value) !== val) {
            slider.value = val;
        }
        indicator.innerText = formatTimeLabel(val);
        window.dispatchEvent(new CustomEvent('w4ap:timelineShift', { detail: { offsetMinutes: val } }));
    }

    slider.addEventListener('input', (e) => {
        updateTimeline(e.target.value);
    });

    // Slider goes from 0 (Left, NOW) to 10080 (Right, -7D)
    // Left button (prev) should move thumb left (subtract from value)
    // Right button (next) should move thumb right (add to value)
    if (timePrev) timePrev.addEventListener('click', () => updateTimeline(parseInt(slider.value) - 5));
    if (timeNext) timeNext.addEventListener('click', () => updateTimeline(parseInt(slider.value) + 5));

    window.addEventListener('resize', updateMap);
    updateMap();
})();
`;

module.exports = {
    widget: {
        metadata: {
            name: 'OpenCoral Map Engine',
            version: '2.3.0',
            author: 'Antigravity'
        },
        html: mapHtml,
        css: mapCss,
        js: mapEngineJs
    }
};
