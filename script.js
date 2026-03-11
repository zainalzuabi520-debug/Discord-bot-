function startCountdown() {
    const form = document.getElementById('login-form');
    const timerArea = document.getElementById('countdown-area');
    const timerText = document.getElementById('timer');
    
    form.classList.add('hidden');
    timerArea.classList.remove('hidden');

    let count = 3;
    const interval = setInterval(() => {
        count--;
        timerText.innerText = count;
        
        if (count <= 0) {
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

        // Gateway Hello
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

        // Successfully Logged In
        if (data.t === "READY") {
            document.getElementById('login-container').classList.add('hidden');
            document.getElementById('main-client').classList.remove('hidden');
            
            const user = data.d.user;
            const profileDiv = document.getElementById('user-profile');
            
            // Your custom Admin badge logic
            let badge = "";
            if (user.username === "Admin") {
                badge = `<span class="admin-badge">WEBSITE ADMIN</span>`;
            }

            profileDiv.innerHTML = `
                <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" width="80" style="border-radius:50%">
                <h2>${user.username}${badge}</h2>
            `;
        }
    };

    socket.onerror = () => {
        alert("Connection Error. Make sure your token is correct and CORS is allowed.");
    };
}
