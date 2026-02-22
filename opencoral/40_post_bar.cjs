const postBarHtml = `
<div class="post-bar-container">
    <div class="post-bar-glass">
        <textarea id="post-input" placeholder="Broadcast to the sea of signals..." rows="1"></textarea>
        <button id="btn-broadcast">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
        </button>
    </div>
</div>
`;

const postBarCss = `
.post-bar-container {
    padding: 20px;
    display: flex;
    justify-content: center;
    pointer-events: none !important;
}

.post-bar-glass {
    width: 100%;
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(0, 229, 255, 0.4);
    border-radius: 24px;
    display: flex;
    align-items: center;
    padding: 8px 16px;
    gap: 12px;
    box-shadow: 0 4px 16px rgba(0, 136, 255, 0.1);
    backdrop-filter: blur(20px);
    pointer-events: auto !important;
}

#post-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #006064;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    resize: none;
    outline: none;
    padding: 8px 0;
    max-height: 120px;
}

#post-input::placeholder {
    color: #80DEEA;
}

#btn-broadcast {
    background: #FF4081;
    color: #fff;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 0 15px rgba(255, 64, 129, 0.4);
}

#btn-broadcast:hover {
    transform: scale(1.1) rotate(-10deg);
}

#btn-broadcast:disabled {
    background: #E0E0E0;
    color: #9E9E9E;
    box-shadow: none;
    cursor: not-allowed;
}
`;

const postBarJs = `
(function() {
    const VERSION = "2.2.19";
    console.log("🖋️ OpenCoral Post Bar v" + VERSION + " Online.");

    const input = document.getElementById('post-input');
    const btn = document.getElementById('btn-broadcast');
    
    const getCellTag = (x, y, precision = 1) => {
        const cx = Math.floor(x * precision);
        const cy = Math.floor(y * precision);
        return \`\${cx}:\${cy}\`;
    };
    
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
    });

    btn.addEventListener('click', async () => {
        const content = input.value.trim();
        if (!content) return;

        if (!window.WALLET_ADDRESS) {
            alert("Please connect your wallet first.");
            return;
        }

        try {
            btn.disabled = true;
            btn.innerHTML = '<span class="loading-spinner"></span>';
            
            console.log("[Broadcast] Initiating Deep Sea Signal Transmission...");
            
            const irys = await window.GET_IRYS();
            
            // Spatial context (current map position)
            const mapX = document.getElementById('input-x')?.value || "0";
            const mapY = document.getElementById('input-y')?.value || "0";
            const x = parseFloat(mapX) || 0;
            const y = parseFloat(mapY) || 0;

            const postObj = {
                content: content,
                timestamp: Date.now()
            };

            const tags = [
                { name: "App-Name", value: "Web4SNS" },
                { name: "Object-Type", value: "post" },
                { name: "Content-Type", value: "application/json" },
                { name: "Spatial-X", value: mapX },
                { name: "Spatial-Y", value: mapY },
                { name: "Cell-R1", value: getCellTag(x, y, 1) },
                { name: "Cell-R4", value: getCellTag(x, y, 10) },
                { name: "Tag-Coral", value: "OpenCoral" }
            ];

            // Extract hashtags
            const hashtags = content.match(/#\w+/g);
            if (hashtags) {
                hashtags.forEach((tag, idx) => {
                    tags.push({ name: 'Tag-' + idx, value: tag.replace('#', '') });
                });
            }

            const receipt = await irys.upload(JSON.stringify(postObj), { tags });
            console.log("[Broadcast] Signal Anchored:", receipt.id);
            
            alert("Signal Successfully Broadcasted to the Archipelago!");
            input.value = '';
            input.style.height = 'auto';

        } catch (err) {
            console.error("Broadcast failed:", err);
            alert("Broadcast Interrupted: " + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>';
        }
    });
})();
`;

module.exports = {
    widget: {
        metadata: { name: 'OpenCoral Post Bar', version: '2.2.19' },
        html: postBarHtml,
        css: postBarCss,
        js: postBarJs
    }
};
