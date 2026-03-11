// --- CONFIGURATION ---
const PROXY_URL = "https://cors-anywhere.herokuapp.com/"; // Helps bypass the login block

function startCountdown() {
    const loginContent = document.getElementById('login-content');
    const countdownArea = document.getElementById('countdown-area');
    const timer = document.getElementById('timer');

    loginContent.style.display = "none";
    countdownArea.classList.remove('hidden');

    let time = 3;
    const interval = setInterval(() => {
        time--;
        timer.innerText = time;
        if (time <= 0) {
            clearInterval(interval);
            connectToDiscord();
        }
    }, 1000);
}

function connectToDiscord() {
    const token = document.getElementById('tokenInput').value;
    
    // Establishing the Secure WebSocket Bridge
    // Note: WebSockets usually bypass CORS, but the initial 'handshake' might need help
    const socket = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // 1. Hello from Discord
        if (data.op === 10) {
            socket.send(JSON.stringify({
                op: 2,
                d: {
                    token: token,
                    properties: { os: "windows", browser: "chrome", device: "" },
                    intents: 513
                }
            }));
        }

        // 2. Successful Connection
        if (data.t === "READY") {
            document.getElementById('login-container').classList.add('hidden');
            document.getElementById('main-client').classList.remove('hidden');
            renderUI(data.d);
        }
    };

    socket.onerror = (err) => {
        alert("SECURITY BLOCK: Your browser blocked the login. If you are on PC, use the 'Allow CORS' extension. If on Mobile, try refreshing.");
    };
}

function renderUI(data) {
    const user = data.user;
    const profileDiv = document.getElementById('user-profile');

    // IMAGE FIX: Uses a real fallback if avatar is missing
    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;

    // Admin Whitelist (Saved forever)
    let badge = "";
    if (user.username === "Admin" || user.username === "DeveloperThecrew") {
        badge = `<span class="admin-badge">ADMIN</span>`;
    }

    profileDiv.innerHTML = `
        <img src="${avatarUrl}" width="35" height="35" style="border-radius:50%" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
        <div class="user-info">
            <div style="font-weight:bold; font-size:13px;">${user.username}${badge}</div>
            <div style="color:#b5bac1; font-size:11px;">Online</div>
        </div>
    `;
}
