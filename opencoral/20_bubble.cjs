const bubbleHtml = `
<!-- OpenCoral Bubble Space: Navigational Precision v2.2.4 -->
`;

const bubbleCss = `
.w4-bubble {
    position: absolute;
    min-width: 140px;
    max-width: 320px;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    border-bottom-left-radius: 4px;
    box-shadow: 0 8px 32px rgba(0, 229, 255, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 229, 255, 0.2);
    color: #006064;
    font-size: 0.95rem;
    line-height: 1.5;
    transition: opacity 0.3s ease, transform 0.3s ease;
    pointer-events: auto;
    cursor: pointer;
    z-index: 100;
    will-change: transform, opacity;
}

.w4-bubble:hover {
    z-index: 1000;
    box-shadow: 0 15px 45px rgba(255, 64, 129, 0.2);
    border: 1px solid rgba(255, 64, 129, 0.5);
}

.w4-bubble::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 14px;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid rgba(255, 255, 255, 0.95);
}

.bubble-author {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    border-bottom: 2px solid rgba(0, 229, 255, 0.1);
    padding-bottom: 6px;
}

.author-avatar {
    width: 24px;
    height: 24px;
    background: #00E5FF;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.05);
}

.author-name {
    font-size: 0.75rem;
    font-weight: 800;
    color: #00838F;
    font-family: 'JetBrains Mono', monospace;
}

.bubble-content {
    word-wrap: break-word;
    font-weight: 400;
}
`;

const bubbleJs = `
(function() {
    const VERSION = "2.2.19";
    console.log("💬 OpenCoral Bubble Engine v" + VERSION + " Online [Signal Restoration & Gravity].");

    if (window.CORAL_BUBBLE_INTERVAL) clearInterval(window.CORAL_BUBBLE_INTERVAL);

    const gateway = window.BOOT_GATEWAY || 'https://uploader.irys.xyz';
    const GQL_ENDPOINT = "https://uploader.irys.xyz/graphql";
    
    let activeSignals = [];
    let signalData = []; // [{ id, x, y, tags, el }]
    let currentOffset = 0;
    let currentZoom = 1.0;
    
    let currentMapX = 0;
    let currentMapY = 0;
    let spatialFetchTimeout = null;
    
    // v2.2.8: Render generation token to prevent async setTimeout leaks during fast timeline scrubs
    let renderTargetGen = 0;
    
    // v2.2.7: Background precache for historical signals to enable zero-latency timeline scrubbing
    window.W4AP_CACHE = window.W4AP_CACHE || [];
    let isPrimingCache = false;

    function getAnchor(address) {
        // v2.2.3: Reset fallback to Origin (0,0) per user request
        return { x: 0, y: 0 };
    }
    
    function getNearbyTags(x, y, precision = 1) {
        const cx = Math.floor(x * precision);
        const cy = Math.floor(y * precision);
        
        // Calculate viewport dimensions in world units (scaled by 1000 macro factor)
        const viewWidth = window.innerWidth / currentZoom / 1000;
        const viewHeight = window.innerHeight / currentZoom / 1000;
        
        // At precision 1 (Macro): cell is 1x1. At precision 10 (Micro): cell is 0.1x0.1
        // We calculate how many cells span the visible width/height
        const spanX = Math.min(6, Math.ceil((viewWidth * precision) / 2)); 
        const spanY = Math.min(6, Math.ceil((viewHeight * precision) / 2));
        
        // Cap massive arrays at 13x13 (169 cells) to prevent exploding the Irys Gateway
        const maxSpan = 6;
        const finalSpanX = Math.min(spanX, maxSpan) + 1; // +1 buffer for edge scrolling
        const finalSpanY = Math.min(spanY, maxSpan) + 1;
        
        const neighbors = [];
        for (let dx = -finalSpanX; dx <= finalSpanX; dx++) {
            for (let dy = -finalSpanY; dy <= finalSpanY; dy++) {
                neighbors.push(\`\${cx + dx}:\${cy + dy}\`);
            }
        }
        return neighbors;
    }
    
    // Silently pre-fetch 7 days of historical signals into cache in the background
    async function primeCache() {
        if (isPrimingCache || window.W4AP_CACHE.length > 0) return;
        isPrimingCache = true;
        console.log("[W4AP_BUBBLES] Priming historical cache...");
        
        const nowMs = Date.now();
        // BUGFIX: Irys requires 13-digit millisecond timestamps, not 10-digit seconds
        const from = nowMs - (7 * 24 * 60 * 60 * 1000);
        const to = nowMs;

        const queryStr = \`query { 
            transactions(
                tags: [{ name: "App-Name", values: ["Web4SNS"] }, { name: "Object-Type", values: ["post"] }],
                timestamp: { from: \${from}, to: \${to} },
                first: 100, 
                order: DESC
            ) { edges { node { id address timestamp tags { name value } } } } 
        }\`;
        
        try {
            const res = await fetch(GQL_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: queryStr }),
                signal: AbortSignal.timeout(10000)
            });
            const result = await res.json();
            if (result?.data?.transactions?.edges) {
                window.W4AP_CACHE = result.data.transactions.edges;
                console.log(\`[W4AP_BUBBLES] Cache primed with \${window.W4AP_CACHE.length} historical signals.\`);
            }
        } catch (err) {
            console.warn("[W4AP_BUBBLES] Cache prime failed:", err);
        } finally {
            isPrimingCache = false;
        }
    }

    async function fetchSignals() {
        const nowMs = Date.now();
        const targetMs = nowMs - (currentOffset * 60 * 1000);
        let windowMs = currentOffset === 0 ? 15 * 60 * 1000 : 5 * 60 * 1000;
        
        const isMicro = currentZoom >= 4.0;
        const precision = isMicro ? 10 : 1;
        const tagName = isMicro ? "Cell-R4" : "Cell-R1";
        
        const neighbors = getNearbyTags(currentMapX, currentMapY, precision);
        const fetchLegacy = (Math.abs(currentMapX) < 3 && Math.abs(currentMapY) < 3);
        
        const from = targetMs - windowMs;
        const to = targetMs;
        
        if (currentOffset !== 0) {
            if (window.W4AP_CACHE && window.W4AP_CACHE.length > 0) {
                const cachedEdges = window.W4AP_CACHE.filter(edge => {
                    const tsMs = edge.node.timestamp > 100000000000 ? edge.node.timestamp : edge.node.timestamp * 1000;
                    if (tsMs < from || tsMs > to) return false;
                    
                    const cellTag = edge.node.tags.find(t => t.name === tagName);
                    if (cellTag && neighbors.includes(cellTag.value)) return true;
                    
                    const hasAnyCell = edge.node.tags.some(t => t.name === 'Cell-R1');
                    if (!hasAnyCell && fetchLegacy) return true;
                    
                    return false;
                });
                if (cachedEdges.length > 0) {
                    console.log("[W4AP_BUBBLES] Archaeology CACHE HIT:", cachedEdges.length, "signals");
                    renderSignals(cachedEdges, targetMs, windowMs);
                    return; 
                }
            }
        }

        let queries = \`
            spatial: transactions(
                tags: [
                    { name: "App-Name", values: ["Web4SNS"] },
                    { name: "Object-Type", values: ["post"] },
                    { name: "\${tagName}", values: \${JSON.stringify(neighbors)} }
                ],
                \${currentOffset === 0 ? '' : \`timestamp: { from: \${from}, to: \${to} },\`}
                first: 100, 
                order: DESC
            ) { edges { node { id address timestamp tags { name value } } } } 
        \`;

        if (fetchLegacy) {
            queries += \`
                legacy: transactions(
                    tags: [
                        { name: "App-Name", values: ["Web4SNS"] },
                        { name: "Object-Type", values: ["post"] }
                    ],
                    \${currentOffset === 0 ? '' : \`timestamp: { from: \${from}, to: \${to} },\`}
                    first: 50, 
                    order: DESC
                ) { edges { node { id address timestamp tags { name value } } } } 
            \`;
        }
        
        const queryStr = \`query { \${queries} }\`;
        
        try {
            const res = await fetch(GQL_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: queryStr }),
                signal: AbortSignal.timeout(6000)
            });

            const result = await res.json();
            let allEdges = [];
            if (result?.data?.spatial?.edges) {
                allEdges = allEdges.concat(result.data.spatial.edges);
            }
            if (result?.data?.legacy?.edges) {
                const legacyOnly = result.data.legacy.edges.filter(edge => !edge.node.tags.some(t => t.name === 'Cell-R1'));
                allEdges = allEdges.concat(legacyOnly);
            }
            
            const uniqueEdges = [];
            const seen = new Set();
            for (const edge of allEdges) {
                if (!seen.has(edge.node.id)) {
                    seen.add(edge.node.id);
                    uniqueEdges.push(edge);
                }
            }
            
            uniqueEdges.sort((a, b) => {
                const getPos = (node) => {
                    const tx = node.tags.find(t => t.name === 'Spatial-X');
                    const ty = node.tags.find(t => t.name === 'Spatial-Y');
                    if (tx && ty) return { x: parseFloat(tx.value), y: parseFloat(ty.value) };
                    
                    const tr4 = node.tags.find(t => t.name === 'Cell-R4');
                    if (tr4) {
                        const p = tr4.value.split(':');
                        if (p.length === 2 && !isNaN(p[0]) && !isNaN(p[1])) return { x: parseInt(p[0], 10) / 10 + 0.05, y: parseInt(p[1], 10) / 10 + 0.05 };
                    }
                    
                    const tr1 = node.tags.find(t => t.name === 'Cell-R1');
                    if (tr1) {
                        const p = tr1.value.split(':');
                        if (p.length === 2 && !isNaN(p[0]) && !isNaN(p[1])) return { x: parseInt(p[0], 10) + 0.5, y: parseInt(p[1], 10) + 0.5 };
                    }
                    
                    return { x: 0, y: 0 };
                };
                const posA = getPos(a.node);
                const posB = getPos(b.node);
                const distA = Math.sqrt(Math.pow(posA.x - currentMapX, 2) + Math.pow(posA.y - currentMapY, 2));
                const distB = Math.sqrt(Math.pow(posB.x - currentMapX, 2) + Math.pow(posB.y - currentMapY, 2));
                return distA - distB;
            });
            
            if (uniqueEdges.length > 0) {
                renderSignals(uniqueEdges, targetMs, windowMs);
            }
        } catch (err) {
            console.warn("[W4AP_BUBBLES] SCAN_FAIL:", err);
        }
    }

    async function renderSignals(edges, targetMs, windowMs) {
        const layer = document.getElementById('bubbles-layer');
        if (!layer) return;

        let i = 0;
        const myGen = renderTargetGen; // Lock this loop to the current generation
        
        function processNextNode() {
            if (myGen !== renderTargetGen) return; // Cancel orphaned loops if user scrubbed timeline
            if (i >= edges.length) return;
            const node = edges[i].node;
            
            if (!activeSignals.includes(node.id)) {
                const tsMs = node.timestamp > 100000000000 ? node.timestamp : node.timestamp * 1000;
                
                let x = 0, y = 0;
                const tagX = node.tags.find(t => t.name === 'Spatial-X');
                const tagY = node.tags.find(t => t.name === 'Spatial-Y');
                const tagR4 = node.tags.find(t => t.name === 'Cell-R4');
                const tagR1 = node.tags.find(t => t.name === 'Cell-R1');
                
                if (tagX && tagY) {
                    x = parseFloat(tagX.value) * 1000;
                    y = parseFloat(tagY.value) * 1000;
                } else if (tagR4) {
                    const p = tagR4.value.split(':');
                    if (p.length === 2 && !isNaN(p[0]) && !isNaN(p[1])) {
                        x = (parseInt(p[0], 10) / 10 + 0.05) * 1000;
                        y = (parseInt(p[1], 10) / 10 + 0.05) * 1000;
                    }
                } else if (tagR1) {
                    const p = tagR1.value.split(':');
                    if (p.length === 2 && !isNaN(p[0]) && !isNaN(p[1])) {
                        x = (parseInt(p[0], 10) + 0.5) * 1000;
                        y = (parseInt(p[1], 10) + 0.5) * 1000;
                    }
                } else {
                    const anchor = getAnchor(node.address);
                    x = anchor.x;
                    y = anchor.y;
                }

                const bubble = document.createElement('div');
                bubble.className = 'w4-bubble';
                bubble.id = 'bubble-' + node.id;
                
                updateBubbleTransform(bubble, x, y);
                
                const ageInWindow = (targetMs - tsMs) / windowMs;
                bubble.style.opacity = Math.max(0.1, 1 - (ageInWindow * 0.9)); 

                bubble.dataset.worldX = x / 1000;
                bubble.dataset.worldY = y / 1000;
                bubble.dataset.timestamp = tsMs;

                const shortAddr = (node.address || "0x???").slice(0, 6);
                bubble.innerHTML = \`
                    <div class="bubble-author">
                        <div class="author-avatar" style="background: \${'#'+node.id.slice(-6)}"></div>
                        <span class="author-name">\${shortAddr}</span>
                    </div>
                    <div class="bubble-content">正在解密信号...</div>
                \`;

                layer.appendChild(bubble);
                activeSignals.push(node.id);
                signalData.push({
                    id: node.id,
                    x: x,
                    y: y,
                    tags: node.tags,
                    el: bubble
                });
                
                // Fire off the content fetch
                resolveContent(node);
            }
            
            i++;
            // v2.2.6 FIX: Introduce 100ms delay between resolving content to prevent 
            // net::ERR_INSUFFICIENT_RESOURCES from browser connection limits
            setTimeout(processNextNode, 100);
        }
        
        // Start processing the edges queue recursively with delay
        processNextNode();
    }

    function updateBubbleTransform(bubble, wx, wy) {
        const visualScale = 1 / currentZoom;
        const adaptiveScale = Math.min(1.5, Math.max(0.5, visualScale));
        bubble.style.left = wx + 'px';
        bubble.style.top = (-wy) + 'px'; // Invert Y axis visually (Up is positive Y)
        bubble.style.transform = \`translate(-50%, -100%) scale(\${adaptiveScale})\`;
    }

    // Semantic Gravity Loop
    function applyGravity() {
        const G = 0.05; // Gravity constant
        const MIN_DIST = 50;
        const COLLISION_DIST = 160; // Bubble physical width repulsion threshold

        for (let i = 0; i < signalData.length; i++) {
            const a = signalData[i];
            for (let j = i + 1; j < signalData.length; j++) {
                const b = signalData[j];
                
                // Compare tags
                const tagNamesA = a.tags.filter(t => t.name.startsWith('Tag-')).map(t => t.value);
                const tagNamesB = b.tags.filter(t => t.name.startsWith('Tag-')).map(t => t.value);
                
                let shared = tagNamesA.filter(t => tagNamesB.includes(t)).length;
                
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                // Inject artificial distance if bubbles spawn on the exact identical coordinate (e.g. 0,0)
                let dirX = dx; let dirY = dy;
                if (dist < 1) { 
                    dirX = (Math.random() - 0.5) * 2;
                    dirY = (Math.random() - 0.5) * 2;
                    dist = 1;
                }
                
                if (shared > 0 && dist > MIN_DIST) {
                    const force = (shared * G) / (dist / 100);
                    a.x += (dirX / dist) * force;
                    a.y += (dirY / dist) * force;
                    b.x -= (dirX / dist) * force;
                    b.y -= (dirY / dist) * force;
                }
                
                // Physical Collision Repulsion: Prevent tagless posts from stacking endlessly
                if (dist < COLLISION_DIST) {
                    const repelForce = (COLLISION_DIST - dist) * 0.05;
                    a.x -= (dirX / dist) * repelForce;
                    a.y -= (dirY / dist) * repelForce;
                    b.x += (dirX / dist) * repelForce;
                    b.y += (dirY / dist) * repelForce;
                }
            }
        }

        signalData.forEach(s => {
            updateBubbleTransform(s.el, s.x, s.y);
            s.el.dataset.worldX = s.x / 1000;
            s.el.dataset.worldY = s.y / 1000;
        });

        requestAnimationFrame(applyGravity);
    }

    async function resolveContent(node) {
        const id = node.id;
        try {
            const isManifest = node.tags.some(t => t.value === 'application/x.irys-manifest+json');
            const url = isManifest ? gateway + '/' + id + '/post.json' : gateway + '/' + id;
            const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
            const data = await res.json();
            const content = data.content?.body || data.summary || data.content || data.body || "SIGNAL_EMPTY";
            const bubble = document.getElementById('bubble-' + id);
            if (bubble) {
                const el = bubble.querySelector('.bubble-content');
                if (el) el.innerText = content.slice(0, 100) + (content.length > 100 ? '...' : '');
            }
        } catch (e) {
            const bubble = document.getElementById('bubble-' + id);
            if (bubble) {
                const el = bubble.querySelector('.bubble-content');
                if (el) el.innerText = "SIGNAL_LOST";
            }
        }
    }

    window.addEventListener('w4ap:zoomChange', (e) => {
        currentZoom = e.detail.zoom;
        signalData.forEach(s => updateBubbleTransform(s.el, s.x, s.y));
    });
    
    window.addEventListener('w4ap:spatialShift', (e) => {
        currentMapX = e.detail.x;
        currentMapY = e.detail.y;
        currentZoom = e.detail.zoom;
        
        clearTimeout(spatialFetchTimeout);
        spatialFetchTimeout = setTimeout(() => {
            fetchSignals();
        }, 800);
    });

    window.addEventListener('w4ap:timelineShift', (e) => {
        currentOffset = e.detail.offsetMinutes;
        const layer = document.getElementById('bubbles-layer');
        if (layer) layer.innerHTML = '';
        activeSignals = [];
        signalData = [];
        renderTargetGen++; // v2.2.8: Invalidate any old rendering loops
        fetchSignals();
    });

    window.addEventListener('w4ap:homeReset', () => {
        currentOffset = 0;
        currentZoom = 1.0;
        const layer = document.getElementById('bubbles-layer');
        if (layer) layer.innerHTML = '';
        activeSignals = [];
        signalData = [];
        renderTargetGen++; // v2.2.8: Invalidate any old rendering loops
        fetchSignals();
    });

    window.CORAL_BUBBLE_INTERVAL = setInterval(() => {
        if (currentOffset === 0) fetchSignals();
    }, 30000);
    
    // v2.2.7: Initialize background pre-fetch
    primeCache();
    fetchSignals();
    applyGravity();
})();
`;

module.exports = {
    widget: {
        metadata: { name: 'OpenCoral Bubble Controller', version: '2.2.19' },
        html: bubbleHtml,
        css: bubbleCss,
        js: bubbleJs
    }
};
