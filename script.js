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
    const socket = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // HELLO: Heartbeat interval setup
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

        // READY: Connection established
        if (data.t === "READY") {
            document.getElementById('login-container').classList.add('hidden');
            document.getElementById('main-client').classList.remove('hidden');
            
            loadUI(data.d);
        }
    };

    socket.onerror = () => alert("Bridge connection failed. Check your token.");
}

function loadUI(data) {
    const user = data.user;
    const profileDiv = document.getElementById('user-profile');

    // FIX BROKEN IMAGES: Use default avatar if bot has no pfp
    const pfp = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/0.png`;

    // Forever Whitelisted Admin Check
    let badge = "";
    if (user.username === "Admin") {
        badge = `<span class="admin-badge">ADMIN</span>`;
    }

    profileDiv.innerHTML = `
        <img src="${pfp}" width="32" height="32" style="border-radius:50%">
        <div style="font-size:13px; font-weight:bold;">
            ${user.username}${badge}<br>
            <span style="color:#b5bac1; font-weight:normal; font-size:11px;">#${user.discriminator || '0000'}</span>
        </div>
    `;

    // Render server icons from data
    const serverList = document.getElementById('server-icons-list');
    data.guilds.slice(0, 8).forEach(guild => {
        const icon = document.createElement('div');
        icon.className = 'nav-item';
        icon.innerText = guild.name ? guild.name.charAt(0) : "G";
        serverList.appendChild(icon);
    });
}
