const walletHtml = `
<div class="wallet-container">
    <div id="wallet-status" class="wallet-pill">
        <div class="status-dot"></div>
        <span id="wallet-address">CONNECTING...</span>
    </div>
    <div id="wallet-dropdown" class="wallet-menu hidden">
        <button id="btn-copy-address">Copy Address</button>
        <button id="btn-disconnect">Disconnect</button>
    </div>
</div>
`;

const walletCss = `
.wallet-container {
    position: relative;
}

.wallet-pill {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: var(--ui-glass);
    border: 1px solid var(--ui-border);
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.wallet-pill:hover {
    border-color: var(--coral-accent);
    box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
}

.status-dot {
    width: 8px;
    height: 8px;
    background: #FF4D4D;
    border-radius: 50%;
    box-shadow: 0 0 5px #ff4d4d;
}

.status-dot.connected {
    background: #00FFCC;
    box-shadow: 0 0 5px #00FFCC;
}

#wallet-address {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    color: #fff;
    letter-spacing: 0.05rem;
}

.wallet-menu {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 180px;
    background: var(--ui-glass);
    border: 1px solid var(--ui-border);
    border-radius: 12px;
    overflow: hidden;
    backdrop-filter: blur(20px);
    animation: slideIn 0.3s ease forwards;
}

@keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.wallet-menu.hidden {
    display: none;
}

.wallet-menu button {
    width: 100%;
    padding: 12px;
    background: transparent;
    border: none;
    color: #ccc;
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
}

.wallet-menu button:hover {
    background: rgba(0, 255, 204, 0.1);
    color: var(--coral-accent);
}
`;

const walletJs = `
(function() {
    console.log("💳 OpenCoral Wallet Component Init v2.3.0. Mod: Solana (WebIrys compat)");

    const pill = document.getElementById('wallet-status');
    const dot = pill.querySelector('.status-dot');
    const addressSpan = document.getElementById('wallet-address');
    const menu = document.getElementById('wallet-dropdown');
    
    let currentAddress = null;
    let irysUploaderObj = null;

    async function checkWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const resp = await window.solana.connect({ onlyIfTrusted: true });
                if (resp && resp.publicKey) {
                    await onConnected(resp.publicKey.toString());
                } else {
                    onDisconnected();
                }
            } catch (err) {
                // User hasn't authorized before
                onDisconnected();
            }
        } else {
            addressSpan.innerText = "NO PHANTOM";
            onDisconnected();
        }
    }

    async function initIrys() {
        if (!window.WebIrys) throw new Error("WebIrys SDK not loaded");
        
        // Patch signMessage for Phantom compatibility
        const originalSignMessage = window.solana.signMessage;
        window.solana.signMessage = async (msg) => {
            const signedMessage = await originalSignMessage.call(window.solana, msg);
            return signedMessage.signature || signedMessage;
        };

        // Patch sendTransaction for Irys fund() compatibility
        if (!window.solana.sendTransaction && window.solana.signAndSendTransaction) {
            window.solana.sendTransaction = async (transaction) => {
                const signed = await window.solana.signAndSendTransaction(transaction);
                return signed.signature;
            };
        }

        const webUploader = window.WebIrys.WebUploader || window.WebUploader;
        const webSolana = window.WebIrys.WebSolana || window.WebSolana;

        if (webUploader && webSolana) {
             const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=e4424c51-3087-470d-8399-b38c1eacc90f';
             irysUploaderObj = await webUploader(webSolana).withProvider(window.solana).withRpc(rpcUrl);
             window.irysUploader = irysUploaderObj;
        } else {
             throw new Error("IRYS_SOL_FACTORY_NOT_FOUND");
        }
    }

    async function onConnected(addr) {
        currentAddress = addr;
        addressSpan.innerText = "IRYS_INIT...";
        try {
            await initIrys();
        } catch(e) {
            console.error("Irys init failed:", e);
        }

        dot.classList.add('connected');
        addressSpan.innerText = addr.slice(0, 4) + "..." + addr.slice(-4);
        window.WALLET_ADDRESS = addr; // Global for other components
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('w4ap:walletConnected', { detail: { address: addr } }));
    }

    function onDisconnected() {
        currentAddress = null;
        irysUploaderObj = null;
        window.irysUploader = null;
        
        dot.classList.remove('connected');
        if (!window.solana || !window.solana.isPhantom) {
            addressSpan.innerText = "NO PHANTOM";
        } else {
            addressSpan.innerText = "CONNECT WALLET";
        }
        window.WALLET_ADDRESS = null;
        window.dispatchEvent(new CustomEvent('w4ap:walletDisconnected'));
    }

    pill.addEventListener('click', async () => {
        if (!currentAddress) {
            if (!window.solana || !window.solana.isPhantom) {
                window.open("https://phantom.app/", "_blank");
                return;
            }
            try {
                addressSpan.innerText = "CONNECTING...";
                const resp = await window.solana.connect();
                await onConnected(resp.publicKey.toString());
            } catch (err) {
                console.error("Connect fail:", err);
                addressSpan.innerText = "CONNECT WALLET";
            }
        } else {
            menu.classList.toggle('hidden');
        }
    });

    document.getElementById('btn-copy-address').addEventListener('click', () => {
        if (currentAddress) {
            navigator.clipboard.writeText(currentAddress);
            menu.classList.add('hidden');
        }
    });

    document.getElementById('btn-disconnect').addEventListener('click', () => {
        if (window.solana && window.solana.disconnect) {
            window.solana.disconnect();
        }
        onDisconnected();
        menu.classList.add('hidden');
    });

    // Handle account changes
    if (window.solana) {
        window.solana.on('accountChanged', async (publicKey) => {
            if (publicKey) {
                window.dispatchEvent(new CustomEvent('w4ap:walletDisconnected'));
                await onConnected(publicKey.toString());
            }
            else onDisconnected();
        });
        window.solana.on('disconnect', () => {
            onDisconnected();
        });
    }

    window.GET_IRYS = async function() {
        if (!irysUploaderObj) throw new Error("Irys not initialized. Connect wallet first.");
        return irysUploaderObj;
    };

    // Export signTransaction for Post Bar to derive Whisper Key
    window.SIGN_W4AP = async function(messageBuffer) {
        if (!currentAddress || !window.solana) throw new Error("Wallet not connected");
        return await window.solana.signMessage(messageBuffer, 'utf8');
    };

    async function loadDependencies() {
        const scripts = [
            "https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js",
            "https://uploader.irys.xyz/Cip4wmuMv1K3bmcL4vYoZuV2aQQnnzViqwHm6PCei3QX/bundle.js"
        ];

        for (const src of scripts) {
            await new Promise((resolve) => {
                if (src.includes('ethers') && window.ethers) return resolve();
                if (src.includes('bundle.js') && window.WebIrys) return resolve();
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }
    }

    loadDependencies().then(() => checkWallet());
})();
`;

module.exports = {
    widget: {
        metadata: { name: 'OpenCoral Wallet', version: '2.3.0' },
        html: walletHtml,
        css: walletCss,
        js: walletJs
    }
};
