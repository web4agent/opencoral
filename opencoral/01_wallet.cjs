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
    console.log("💳 OpenCoral Wallet Component Init v2.2.4.");

    const pill = document.getElementById('wallet-status');
    const dot = pill.querySelector('.status-dot');
    const addressSpan = document.getElementById('wallet-address');
    const menu = document.getElementById('wallet-dropdown');
    
    let currentAddress = null;

    async function checkWallet() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    onConnected(accounts[0]);
                } else {
                    onDisconnected();
                }
            } catch (err) {
                console.error("Wallet check fail:", err);
            }
        } else {
            addressSpan.innerText = "NO WALLET";
        }
    }

    function onConnected(addr) {
        currentAddress = addr;
        dot.classList.add('connected');
        addressSpan.innerText = addr.slice(0, 6) + "..." + addr.slice(-4);
        window.WALLET_ADDRESS = addr; // Global for other components
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('w4ap:walletConnected', { detail: { address: addr } }));
    }

    function onDisconnected() {
        currentAddress = null;
        dot.classList.remove('connected');
        addressSpan.innerText = "CONNECT WALLET";
        window.WALLET_ADDRESS = null;
        window.dispatchEvent(new CustomEvent('w4ap:walletDisconnected'));
    }

    pill.addEventListener('click', async () => {
        if (!currentAddress) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                onConnected(accounts[0]);
            } catch (err) {
                console.error("Connect fail:", err);
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
        onDisconnected();
        menu.classList.add('hidden');
    });

    // Handle account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) onConnected(accounts[0]);
            else onDisconnected();
        });
    }

    window.GET_IRYS = async function() {
        if (!window.ethereum) throw new Error("No Ethereum provider found");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const irys = new Irys.WebIrys({
            url: "https://uploader.irys.xyz",
            token: "bnb",
            wallet: { provider }
        });
        await irys.ready();
        return irys;
    };

    // Export signTransaction for Post Bar
    window.SIGN_W4AP = async function(message) {
        if (!currentAddress) throw new Error("Wallet not connected");
        return await window.ethereum.request({
            method: 'personal_sign',
            params: [message, currentAddress]
        });
    };

    checkWallet();
})();
`;

module.exports = {
    widget: {
        metadata: { name: 'OpenCoral Wallet', version: '2.2.4' },
        html: walletHtml,
        css: walletCss,
        js: walletJs
    }
};
