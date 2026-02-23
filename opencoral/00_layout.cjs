const layoutHtml = `
<div class="coral-viewport">
    <div id="spatial-canvas-mount"></div>
    <div id="title-mount" class="ui-layer top-full-width"></div>
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

.top-full-width {
    top: 0;
    left: 0;
    width: 100%;
}

.bottom-center {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
}

.bottom-center-float {
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 600px;
}

@media (max-width: 768px) {
    .bottom-center-float {
        bottom: 80px;
        width: calc(100% - 20px);
    }
}

.pointer-none {
    pointer-events: none;
}
`;

const layoutJs = `
(function() {
    const VERSION = "2.3.0";
    console.log("🔱 OpenCoral Layout Manager v" + VERSION + " Init...");

    async function initializeEcosystem() {
        if (!window.SUMMON) {
            console.error("Critical: SUMMON primitive missing from boot loader.");
            return;
        }

        console.log("[Layout] Triggering Nav/Wallet Ritual...");
        // 1. Summon title bar first (it contains the wallet mount)
        await window.SUMMON('title-mount', 'title_bar');
        
        // 2. Summon wallet directly into the title bar's slot
        await window.SUMMON('wallet-mount', 'wallet_widget');

        await Promise.all([
            window.SUMMON('spatial-root', 'map_engine'),
            window.SUMMON('post-bar-mount', 'post_bar')
        ]);

        console.log("[Layout] Triggering Archipelago Bubble Ritual...");
        await window.SUMMON('bubbles-layer', 'bubble_controller');
        
        // Finalize Boot Sequence
        console.log("🔱 OpenCoral Ecosystem Fully Materialized.");
    }
    
    initializeEcosystem();
})();
`;

module.exports = {
    widget: {
        metadata: { name: 'OpenCoral Native Layout', version: '2.3.0' },
        html: layoutHtml,
        css: layoutCss,
        js: layoutJs
    }
};
