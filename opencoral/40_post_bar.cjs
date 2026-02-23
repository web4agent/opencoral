const postBarHtml = `
<div class="post-bar-container">
    <div class="post-bar-glass">
        <div class="channel-info" id="channel-toggle" style="cursor: pointer; user-select: none;">
            <span id="mode-world" class="mode-label active">WORLD</span>
            <span class="mode-sep">/</span>
            <span id="mode-whisper" class="mode-label">WHISPER</span>
        </div>
        <div class="recipient-wrapper" id="recipient-wrapper" style="display: none;">
            <span class="recipient-label">To:</span>
            <input type="text" id="recipient-input" placeholder="Address..." maxlength="44">
        </div>
        
        <div class="image-preview-area" id="image-preview-area"></div>
        
        <div class="input-wrapper" id="main-input-wrapper">
            <textarea id="post-input" placeholder="Broadcast to the sea of signals..." rows="1"></textarea>
        </div>
        
        <input type="file" id="image-file-input" accept="image/jpeg,image/png,image/gif,image/webp" multiple style="display:none">
        <button id="image-btn" class="action-btn" title="Add Image">
            <span>📷</span>
        </button>

        <button id="btn-broadcast">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
        </button>
        <div id="upload-status" class="upload-status-dot"></div>
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
    font-family: 'Inter', sans-serif;
    transition: all 0.3s ease;
}

.post-bar-glass.whisper-mode {
    border-color: rgba(255, 0, 255, 0.6);
    box-shadow: 0 4px 16px rgba(255, 0, 255, 0.15);
}

.channel-info {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    font-weight: bold;
}

.mode-label {
    opacity: 0.5;
    transition: all 0.2s;
}

.mode-label.active {
    opacity: 1;
    font-size: 0.9rem;
}

#mode-world.active {
    color: #00BFA5;
}

#mode-whisper.active {
    color: #D500F9;
}

.recipient-wrapper {
    display: flex;
    align-items: center;
    background: rgba(213, 0, 249, 0.1);
    border-radius: 12px;
    padding: 4px 10px;
    border: 1px solid rgba(213, 0, 249, 0.3);
}

.recipient-label {
    color: #D500F9;
    font-weight: bold;
    font-size: 0.75rem;
    margin-right: 6px;
}

#recipient-input {
    background: transparent;
    border: none;
    color: #333;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    width: 100px;
    outline: none;
}

.input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
}

#post-input {
    width: 100%;
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

.whisper-mode #post-input {
    color: #4A148C;
}

.whisper-mode #post-input::placeholder {
    color: #CE93D8;
}

.action-btn {
    background: transparent;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    transition: transform 0.2s;
    opacity: 0.7;
    margin-right: 4px;
}
.action-btn:hover {
    transform: scale(1.1);
    opacity: 1;
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
    flex-shrink: 0;
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

.whisper-mode #btn-broadcast {
    background: #D500F9;
    box-shadow: 0 0 15px rgba(213, 0, 249, 0.4);
}

.image-preview-area {
    display: flex;
    gap: 6px;
    overflow-x: auto;
}

.image-preview-item {
    position: relative;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #ccc;
}

.image-preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-preview-item .remove-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    background: rgba(0,0,0,0.5);
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    font-size: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.upload-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: transparent;
}

.upload-status-dot.active {
    background: #00BFA5;
    box-shadow: 0 0 8px #00BFA5;
}
`;

const postBarJs = `
(function() {
    const VERSION = "2.3.0";
    console.log("💬 OpenCoral Post Bar v" + VERSION + " Online.");
    
    // Config
    const CONFIG = {
        MAX_IMAGES: 4,
        MAX_SIZE_MB: 2,
        FREE_THRESHOLD_KB: 100
    };

    const state = {
        mode: 'broadcast', // 'broadcast' | 'whisper'
        isPublishing: false,
        cryptoReady: false,
        keyPair: null,
        pendingImages: []
    };

    const elements = {
        container: document.querySelector('.post-bar-glass'),
        input: document.getElementById('post-input'),
        btn: document.getElementById('btn-broadcast'),
        status: document.getElementById('upload-status'),
        chToggle: document.getElementById('channel-toggle'),
        modeWorld: document.getElementById('mode-world'),
        modeWhisper: document.getElementById('mode-whisper'),
        recipWrapper: document.getElementById('recipient-wrapper'),
        recipInput: document.getElementById('recipient-input'),
        imgBtn: document.getElementById('image-btn'),
        fileInput: document.getElementById('image-file-input'),
        previewArea: document.getElementById('image-preview-area')
    };

    // --- Dynamic Crypto Loading ---
    async function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(\`script[src="\${src}"]\`)) return resolve();
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async function initCrypto() {
        try {
            if (!window.nacl) await loadScript('https://cdn.jsdelivr.net/npm/tweetnacl@1.0.3/nacl-fast.min.js');
            if (!window.nacl.util) await loadScript('https://cdn.jsdelivr.net/npm/tweetnacl-util@0.15.1/nacl-util.min.js');
            if (!window.bs58) await loadScript('https://bundle.run/bs58@4.0.1');
            state.cryptoReady = true;
            console.log('[PostBar] Crypto Engines Ready.');
        } catch (e) {
            console.error('[PostBar] Crypto Load Fail:', e);
        }
    }
    initCrypto();
    
    // Provide Buffer polyfill for encryption and Irys uploads
    function ensureBufferSupport() {
        if (window.Buffer && typeof window.Buffer.from === 'function') return;
        if (window.WebIrys && window.WebIrys.Buffer) {
            window.Buffer = window.WebIrys.Buffer;
            return;
        }
        window.Buffer = {
            from(value) {
                let buf;
                if (value instanceof ArrayBuffer) buf = new Uint8Array(value);
                else if (ArrayBuffer.isView(value)) buf = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
                else buf = new Uint8Array(value);
                buf._isBuffer = true;
                return buf;
            },
            isBuffer(value) {
                return value && (value instanceof Uint8Array || value._isBuffer === true);
            }
        };
    }
    ensureBufferSupport();

    const getCellTag = (x, y, precision = 1) => {
        const cx = Math.floor(x * precision);
        const cy = Math.floor(y * precision);
        return \`\${cx}:\${cy}\`;
    };

    const updateUIState = () => {
        const hasText = elements.input.value.trim().length > 0;
        const hasImages = state.pendingImages.length > 0;
        elements.btn.disabled = (!hasText && !hasImages) || state.isPublishing;
    };

    elements.input.addEventListener('input', () => {
        elements.input.style.height = 'auto';
        elements.input.style.height = elements.input.scrollHeight + 'px';
        updateUIState();
    });

    elements.chToggle.addEventListener('click', async () => {
        if (state.mode === 'broadcast') {
            state.mode = 'whisper';
            elements.modeWorld.classList.remove('active');
            elements.modeWhisper.classList.add('active');
            elements.recipWrapper.style.display = 'flex';
            elements.container.classList.add('whisper-mode');
            elements.input.placeholder = "Whisper into the void...";
            
            // Check crypto readiness
            if (!state.cryptoReady) await initCrypto();
            
            if (!state.keyPair && window.WALLET_ADDRESS) {
                try {
                    await publishMyKey();
                } catch(e) {
                    console.error("Failed to establish secure keys:", e);
                }
            }
        } else {
            state.mode = 'broadcast';
            elements.modeWhisper.classList.remove('active');
            elements.modeWorld.classList.add('active');
            elements.recipWrapper.style.display = 'none';
            elements.container.classList.remove('whisper-mode');
            elements.input.placeholder = "Broadcast to the sea of signals...";
        }
    });

    // --- Image Handling ---
    elements.imgBtn.addEventListener('click', () => {
        if (!window.WALLET_ADDRESS) {
            alert("Connect wallet to attach images.");
            return;
        }
        elements.fileInput.click();
    });

    window.addEventListener('w4ap:removeImage', (e) => {
        state.pendingImages.splice(e.detail.idx, 1);
        renderPreviews();
    });

    function renderPreviews() {
        elements.previewArea.innerHTML = state.pendingImages.map((img, idx) => \`
            <div class="image-preview-item" data-idx="\${idx}">
                <img src="\${img.preview}" />
                <button class="remove-btn" onclick="event.stopPropagation(); window.dispatchEvent(new CustomEvent('w4ap:removeImage', { detail: { idx: \${idx} } }))">×</button>
            </div>
        \`).join('');
        updateUIState();
    }

    elements.fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
            if (state.pendingImages.length >= CONFIG.MAX_IMAGES) break;
            const maxSize = state.mode === 'whisper' ? 1 : CONFIG.MAX_SIZE_MB;
            if (file.size > maxSize * 1024 * 1024) {
                alert('Image too large: ' + file.name + ' (max ' + maxSize + 'MB)');
                continue;
            }
            state.pendingImages.push({
                file,
                preview: URL.createObjectURL(file)
            });
        }
        renderPreviews();
        e.target.value = '';
    });

    // --- Crypto Core ---
    async function getStaticKeyPair() {
        if (state.keyPair) return state.keyPair;
        if (!window.WALLET_ADDRESS) throw new Error("Wallet not connected");
        if (!window.SIGN_W4AP) throw new Error("Wallet provider does not support signing.");
        
        const msg = new TextEncoder().encode("[W4AP] Authorize Secure Chat Access");
        const signature = await window.SIGN_W4AP(msg);
        
        let sigBuffer = signature.signature || signature;
        
        if (!(sigBuffer instanceof Uint8Array)) {
             console.error("Invalid signature format:", signature);
             throw new Error("Invalid signature format returned from wallet");
        }

        const hashBuffer = await window.crypto.subtle.digest('SHA-256', sigBuffer);
        const seed = new Uint8Array(hashBuffer);
        
        state.keyPair = window.nacl.box.keyPair.fromSecretKey(seed);
        return state.keyPair;
    }

    async function publishMyKey() {
        const keyPair = await getStaticKeyPair();
        const pubKeyBase58 = window.bs58.encode(keyPair.publicKey);
        const cacheKey = \`w4ap_key_\${window.WALLET_ADDRESS}\`;
        
        if (localStorage.getItem(cacheKey) === pubKeyBase58) return;

        console.log('[PostBar] Publishing Whisper Public Key to OpenCoral...');
        const newProfile = {
            type: 'w4ap-profile',
            updated: Date.now(),
            whisperPublicKey: pubKeyBase58
        };
        const tags = [
            { name: "Content-Type", value: "application/json" },
            { name: "App-Name", value: "Web4SNS" },
            { name: "Type", value: "Social-Profile" }
        ];

        try {
            const irys = await window.GET_IRYS();
            await irys.upload(JSON.stringify(newProfile), { tags });
            localStorage.setItem(cacheKey, pubKeyBase58);
            console.log('[PostBar] Secure Chat Enabled');
        } catch (e) {
            console.warn("Failed to publish key", e);
        }
    }

    async function resolveRecipientKey(address) {
        const query = \`query { transactions(owners: ["\${address}"], tags: [{ name: "App-Name", values: ["Web4SNS"] }, { name: "Type", values: ["Social-Profile"] }], first: 1, order: DESC) { edges { node { id } } } }\`;
        const res = await fetch('https://uploader.irys.xyz/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await res.json();
        const node = data.data?.transactions?.edges?.[0]?.node;
        if (!node) throw new Error("Recipient does not have an OpenCoral profile.");
        
        const pRes = await fetch(\`https://gateway.irys.xyz/\${node.id}\`);
        const profile = await pRes.json();
        
        if (!profile.whisperPublicKey) throw new Error("Recipient hasn't enabled Secure Chat.");
        return window.bs58.decode(profile.whisperPublicKey);
    }

    async function encryptPayload(text, recipientAddr) {
        const myKeys = await getStaticKeyPair();
        const recipientX25519 = await resolveRecipientKey(recipientAddr);
        
        const nonce = window.nacl.randomBytes(window.nacl.box.nonceLength);
        const msgUint8 = window.nacl.util.decodeUTF8(text);
        const box = window.nacl.box(msgUint8, nonce, recipientX25519, myKeys.secretKey);
        
        const fullPayload = new Uint8Array(nonce.length + box.length);
        fullPayload.set(nonce);
        fullPayload.set(box, nonce.length);
        
        return window.nacl.util.encodeBase64(fullPayload);
    }

    async function encryptFile(file) {
        const key = window.nacl.randomBytes(window.nacl.secretbox.keyLength);
        const nonce = window.nacl.randomBytes(window.nacl.secretbox.nonceLength);
        const fileBuf = new Uint8Array(await file.arrayBuffer());
        const encrypted = window.nacl.secretbox(fileBuf, nonce, key);
        return {
            encryptedData: encrypted,
            key: window.nacl.util.encodeBase64(key),
            nonce: window.nacl.util.encodeBase64(nonce)
        };
    }

    async function uploadWithFunding(irys, data, tags, sizeBytes) {
        if (sizeBytes > CONFIG.FREE_THRESHOLD_KB * 1024) {
            try {
                const price = await irys.getPrice(sizeBytes);
                const balance = await irys.getLoadedBalance();
                if (balance.lt(price)) {
                    console.log('[PostBar] Lazy funding required...');
                    elements.status.classList.add('active');
                    await irys.fund(price);
                }
            } catch(e) {
                 console.warn("Funding check error", e);
            }
        }
        return await irys.upload(data, { tags });
    }

    // --- Transmission ---
    elements.btn.addEventListener('click', async () => {
        let textContent = elements.input.value.trim();
        const hasImages = state.pendingImages.length > 0;
        if (!textContent && !hasImages) return;

        if (!window.WALLET_ADDRESS) {
            alert("Please connect your wallet first.");
            return;
        }

        const isWhisper = state.mode === 'whisper';
        const recipientAddr = elements.recipInput.value.trim();
        
        if (isWhisper && !recipientAddr) {
            alert("You must specify a recipient address for Whisper mode.");
            return;
        }

        try {
            state.isPublishing = true;
            updateUIState();
            elements.btn.innerHTML = '<span class="loading-spinner">...</span>';
            elements.status.classList.add('active');
            
            const irys = await window.GET_IRYS();
            let x = 0;
            let y = 0;

            // Dynamically grab from modern OpenCoral map engine if available
            if (window.MAP_ENGINE && window.MAP_ENGINE.camera) {
                x = window.MAP_ENGINE.camera.x || 0;
                y = window.MAP_ENGINE.camera.y || 0;
            } else {
                 // Fallback to legacy explicit inputs if testing isolated
                 x = parseFloat(document.getElementById('input-x')?.value) || 0;
                 y = parseFloat(document.getElementById('input-y')?.value) || 0;
            }

            const getCellR4 = (x, y) => {
                 return \`\${Math.floor(x * 10)}:\${Math.floor(y * 10)}\`;
            };

            const baseTags = [
                { name: "App-Name", value: "Web4SNS" },
                { name: "App-Version", value: "2.3.0" },
                { name: "Spatial-X", value: x.toFixed(2) },
                { name: "Spatial-Y", value: y.toFixed(2) },
                { name: "Cell-R1", value: getCellTag(x, y, 1) },
                { name: "Cell-R4", value: getCellR4(x, y) },
                { name: "Tag-Coral", value: "OpenCoral" }
            ];

            // 1. Upload Images
            const attachedImages = [];
            for (const img of state.pendingImages) {
                let dataToUpload, finalTags = [...baseTags];
                let sizeBytes;

                if (isWhisper) {
                    const result = await encryptFile(img.file);
                    dataToUpload = window.Buffer.from(result.encryptedData);
                    sizeBytes = dataToUpload.length;
                    
                    finalTags.push({ name: 'Content-Type', value: 'application/octet-stream' });
                    finalTags.push({ name: 'Object-Type', value: 'encrypted-image' });
                    // No need to send keys in image metadata, they go in the chat payload
                    
                    const receipt = await uploadWithFunding(irys, dataToUpload, finalTags, sizeBytes);
                    attachedImages.push({
                         txId: receipt.id,
                         encryption: { key: result.key, nonce: result.nonce, type: img.file.type }
                    });
                } else {
                    const arrayBuffer = await img.file.arrayBuffer();
                    dataToUpload = window.Buffer.from(arrayBuffer);
                    sizeBytes = dataToUpload.length;
                    
                    finalTags.push({ name: 'Content-Type', value: img.file.type });
                    finalTags.push({ name: 'Object-Type', value: 'image' });
                    
                    const receipt = await uploadWithFunding(irys, dataToUpload, finalTags, sizeBytes);
                    attachedImages.push({ txId: receipt.id });
                }
            }

            // 2. Upload Post Main Body
            let postContent = textContent;
            // If we have images, form a structural body
            if (attachedImages.length > 0) {
                 postContent = JSON.stringify({
                     body: textContent,
                     images: attachedImages
                 });
            }

            const postTags = [...baseTags];
            let payloadToUpload;

            if (isWhisper) {
                const ciphertext = await encryptPayload(postContent, recipientAddr);
                payloadToUpload = JSON.stringify({
                    ciphertext: ciphertext,
                    senderAddr: window.WALLET_ADDRESS,
                    timestamp: Date.now()
                });
                postTags.push({ name: "Object-Type", value: "encrypted-message" });
                postTags.push({ name: "Recipient", value: recipientAddr });
                postTags.push({ name: "Content-Type", value: "application/json" });
            } else {
                payloadToUpload = JSON.stringify({
                    content: postContent,
                    timestamp: Date.now()
                });
                postTags.push({ name: "Object-Type", value: "post" });
                postTags.push({ name: "Content-Type", value: "application/json" });
                
                // Hashtags
                const hashtags = textContent.match(/#\w+/g);
                if (hashtags) {
                    hashtags.forEach((tag, idx) => {
                        postTags.push({ name: 'Tag-' + idx, value: tag.replace('#', '') });
                    });
                }
            }

            const receipt = await irys.upload(payloadToUpload, { tags: postTags });
            console.log("[Broadcast] Tx Anchored:", receipt.id);
            
            elements.input.value = '';
            elements.input.style.height = 'auto';
            state.pendingImages = [];
            renderPreviews();
            
            window.dispatchEvent(new CustomEvent('w4ap:postSuccess', { detail: { id: receipt.id } }));

        } catch (err) {
            console.error("Transmission failed:", err);
            alert("Transmission Interrupted: " + err.message);
        } finally {
            state.isPublishing = false;
            updateUIState();
            elements.status.classList.remove('active');
            elements.btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>';
        }
    });
})();
`;

module.exports = {
    widget: {
        metadata: { name: 'OpenCoral Post Bar', version: '2.3.0' },
        html: postBarHtml,
        css: postBarCss,
        js: postBarJs
    }
};
