const layoutHtml = `
<div class="coral-viewport">
    <div id="spatial-canvas-mount"></div>
    <div id="wallet-mount" class="ui-layer top-right"></div>
    <main id="spatial-root"></main>
    <div id="timeline-mount" class="ui-layer bottom-center"></div>
    <div id="post-bar-mount" class="ui-layer bottom-center-float"></div>
    <div id="spatial-overlay" class="pointer-none"></div>
</div>
`;

const layoutCss = `
:root {
    --coral-accent: #00E5FF;
    --coral-bg: #E0F7FA;
    --ui-glass: rgba(255, 255, 255, 0.85);
    --ui-border: rgba(0, 229, 255, 0.3);
}

.coral-viewport {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: var(--coral-bg);
    overflow: hidden;
}

#spatial-root {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
}

.ui-layer {
    position: fixed;
    z-index: 1000;
    pointer-events: none;
}

.ui-layer > * {
    pointer-events: auto;
}

.top-right {
    top: 20px;
    right: 20px;
}

.bottom-center {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
}

.bottom-center-float {
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 600px;
}

.pointer-none {
    pointer-events: none;
}
`;

const layoutJs = `
(function() {
    console.log("🔱 OpenCoral Layout v2.2.19 Online [Vibrant Aesthetic].");

    async function initializeEcosystem() {
        if (!window.SUMMON) {
            console.error("Critical: SUMMON primitive missing from boot loader.");
            return;
        }

        await Promise.all([
            window.SUMMON('spatial-root', 'map_engine'),
            window.SUMMON('post-bar-mount', 'post_bar')
        ]);

        console.log("[Layout] Triggering Archipelago Bubble Ritual...");
        await window.SUMMON('bubbles-layer', 'bubble_controller');
        
        console.log("🔱 OpenCoral Ecosystem Fully Materialized.");
    }

    initializeEcosystem();
})();
`;

module.exports = {
    widget: {
        metadata: {
            name: 'OpenCoral Spatial Layout',
            version: '2.2.19',
            author: 'Antigravity'
        },
        html: layoutHtml,
        css: layoutCss,
        js: layoutJs
    }
};
