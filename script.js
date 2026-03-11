function startCountdown() {
    const loginContent = document.getElementById('login-content');
    const countdownArea = document.getElementById('countdown-area');
    const timer = document.getElementById('timer');

    loginContent.classList.add('hidden');
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
    
    // Establishing the WebSocket Bridge
    const socket = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

    socket.onopen = () => console.log("Bridge Opened...");

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Send Identify when Discord says Hello (OP 10)
        if (data.op === 10) {
            socket.send(JSON.stringify({
                op: 2,
                d: {
                    token: token,
                    properties: { os: "linux", browser: "chrome", device: "" },
                    intents: 513
                }
            }));
        }

        // When Login is finished
        if (data.t === "READY") {
            document.getElementById('login-container').classList.add('hidden');
            document.getElementById('main-client').classList.remove('hidden');
            renderUI(data.d);
        }
    };

    socket.onerror = () => alert("FAILED: Browser blocked connection. Use the 'Allow CORS' extension!");
}

function renderUI(data) {
    const user = data.user;
    const profileDiv = document.getElementById('user-profile');

    // --- THE IMAGE FIX ---
    // If user.avatar is null, use the default Discord blue avatar
    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/0.png`;

    // Admin Check
    let badge = "";
    if (user.username === "Admin") {
        badge = `<span class="admin-badge">ADMIN</span>`;
    }

    profileDiv.innerHTML = `
        <img src="${avatarUrl}" width="32" height="32" style="border-radius:50%" onerror="this.src='https://cdn.discordapp.com/embed/avatars/1.png'">
        <div style="font-size:12px;">
            <strong>${user.username}</strong>${badge}<br>
            <span style="color:#b5bac1">Online</span>
        </div>
    `;

    // Load Servers
    const serverList = document.getElementById('server-icons-list');
    data.guilds.forEach(guild => {
        const icon = document.createElement('div');
        icon.className = 'nav-item';
        icon.innerText = guild.name ? guild.name.substring(0, 1) : "S";
        serverList.appendChild(icon);
    });
}
