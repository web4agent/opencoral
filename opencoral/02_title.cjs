const titleHtml = `
<div class="oc-title-bar">
    <div class="oc-left-group">
        <div class="oc-brand" id="oc-home-logo" title="Return to Origin">
            OpenCoral
        </div>
        
        <div class="oc-nav-links">
            <a href="https://github.com/web4agent/web4agent/blob/main/README.md" target="_blank" class="oc-nav-link" title="Documentation">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                Docs
            </a>
        <a href="https://github.com/web4agent/web4agent" target="_blank" class="oc-nav-link" title="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
        </a>
        <a href="https://x.com/web4agentpro" target="_blank" class="oc-nav-link" title="Twitter / X">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Twitter
        </a>
    </div>
    </div>

    <!-- The Layout engine will inject the 01_wallet component here automatically -->
    <div id="wallet-mount" class="oc-wallet-slot"></div>
</div>
`;

const titleCss = `
.oc-title-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 60px;
    background: rgba(2, 4, 8, 0.45);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0, 229, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    z-index: 9000;
    box-sizing: border-box;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    pointer-events: auto; /* Re-enable pointer events for the bar */
}

.oc-brand {
    font-family: 'Staatliches', cursive, system-ui;
    font-size: 1.8rem;
    color: #00FFCC;
    letter-spacing: 0.2rem;
    text-shadow: 0 0 10px rgba(0, 255, 204, 0.4);
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
    display: flex;
    align-items: center;
}

.oc-brand:hover {
    text-shadow: 0 0 20px rgba(0, 255, 204, 0.8);
    transform: scale(1.02);
}

.oc-brand:active {
    transform: scale(0.98);
}

.oc-left-group {
    display: flex;
    align-items: center;
    gap: 40px;
}

.oc-nav-links {
    display: flex;
    align-items: center;
    gap: 25px;
}

.oc-nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #e0e0e0;
    text-decoration: none;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    opacity: 0.8;
}

.oc-nav-link svg {
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease;
}

.oc-nav-link:hover {
    color: #00FFCC;
    opacity: 1;
    text-shadow: 0 0 8px rgba(0, 255, 204, 0.4);
}

.oc-nav-link:hover svg {
    transform: translateY(-2px);
}

.oc-wallet-slot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 200px;
}

@media (max-width: 768px) {
    .oc-title-bar {
        padding: 0 15px;
    }
    
    .oc-brand {
        font-size: 1.2rem;
        letter-spacing: 0.1rem;
    }
    
    .oc-left-group {
        gap: 15px;
    }
    
    .oc-nav-links {
        gap: 15px;
    }
    
    .oc-wallet-slot {
        min-width: auto;
    }
    
    .oc-nav-link {
        font-size: 0; /* Hide text, show only SVG icons on mobile */
    }
    
    .oc-nav-link svg {
        width: 24px;
        height: 24px;
        margin: 0;
    }
}
`;

const titleJs = `
(function() {
    const VERSION = "2.2.30";
    console.log("🌟 OpenCoral Top Navigation Bar v" + VERSION + " Online.");

    const logo = document.getElementById('oc-home-logo');
    if (logo) {
        logo.addEventListener('click', () => {
            // Trigger the same spatial reset event as the bottom home button
            window.dispatchEvent(new CustomEvent('w4ap:homeReset'));
            
            // Add a brief pulse animation to the logo
            logo.style.transform = 'scale(0.9)';
            logo.style.textShadow = '0 0 30px rgba(0, 255, 204, 1)';
            setTimeout(() => {
                logo.style.transform = '';
                logo.style.textShadow = '';
            }, 150);
        });
    }
})();
`;

module.exports = {
    widget: {
        metadata: {
            name: 'OpenCoral Title Navigation',
            version: '2.3.0',
            author: 'Antigravity'
        },
        html: titleHtml,
        css: titleCss,
        js: titleJs
    }
};
