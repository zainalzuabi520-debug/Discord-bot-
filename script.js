function renderUI(data) {
    const user = data.user;
    const profileDiv = document.getElementById('user-profile');

    // IMAGE FIX: Multiple fallbacks
    const primaryPfp = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    const defaultPfp = `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
    
    // Check for Admin whitelisting
    let adminStatus = "";
    if (user.username === "Admin" || user.id === "YOUR_ID_HERE") {
        adminStatus = `<span class="admin-badge">ADMIN</span>`;
    }

    profileDiv.innerHTML = `
        <img src="${user.avatar ? primaryPfp : defaultPfp}" 
             width="32" height="32" 
             style="border-radius:50%" 
             onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
        <div class="user-info">
            <strong>${user.username}</strong>${adminStatus}<br>
            <span style="color:#b5bac1; font-size:10px;">Online</span>
        </div>
    `;
}
