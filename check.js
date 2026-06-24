
// --- Security Check Start ---
(function() {
    const authorizedDomains = [
        "ahmad-bhai-android-feed.vercel.app",
        "check-scripts.vercel.app",
        "quotex.market",
        "qtxbrk.com",
        "quotex-ir.com",
        "broker-qx.pro",
        "market-qx.pro",
        "market-qx.trade",
        "qxbroker.com",
        "brokerqx.com",
        "qxbroker.pro",
        "brokerqx.pro"
    ];
    
    const currentHost = window.location.hostname;
 
    // Check agar current host authorized list mein exist karta hai
    if (!authorizedDomains.includes(currentHost)) {
        window.location.href = window.location.origin + "/error";
    }
})();
// --- Security Check End ---
(function() {

    /* ------------------ 1. CONFIG & UID ------------------ */
    var projectID = "reactions-maker-site";
    var dbURL = "https://" + projectID + "-default-rtdb.firebaseio.com/users.json";

    var myUID = localStorage.getItem('ahmad_script_uid');
    if (!myUID) {
        myUID = "";
        for (var i = 0; i < 20; i++) myUID += Math.floor(Math.random() * 10);
        localStorage.setItem('ahmad_script_uid', myUID);
    }

    /* ------------------ 2. LOCK SCREEN UI ------------------ */
    var overlay = document.createElement('div');
    overlay.id = "ahmad-lock-screen";
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        background: '#0e121a', zIndex: '2147483647', display: 'flex', 
        justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif'
    });

    overlay.innerHTML = `
        <div style="background:white;width:320px;padding:30px;border-radius:20px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <img src="tg.webp" style="width:70px;margin-bottom:15px;">
            <div style="color:#222;font-size:22px;font-weight:bold;margin-bottom:5px;">ACCESS LOCKED</div>
            <div id="status-msg" style="color:#666;font-size:13px;margin-bottom:15px;">Verifying your ID...</div>
            <div style="background:#f1f5f9;color:#334155;padding:12px;border-radius:8px;font-family:monospace;font-size:14px;border:1px dashed #0088cc;margin-bottom:20px;word-break:break-all;">${myUID}</div>
            <div style="text-align:left;font-size:14px;color:#444;line-height:1.6;border-top:1px solid #eee;padding-top:15px;margin-bottom:15px;">
                <b>Whatsapp:</b> <span style="color:#25d366;">+923120883884</span><br>
                <b>Telegram:</b> <span style="color:#0088cc;">@AhmadTrader3</span>
            </div>
            <button onclick="location.reload()" style="width:100%;background:#0088cc;color:white;border:none;padding:12px;border-radius:10px;font-weight:bold;cursor:pointer;">RETRY</button>
        </div>`;
    document.body.appendChild(overlay);

    /* ------------------ 3. AUTH CHECK ------------------ */
    fetch(dbURL).then(r => r.json()).then(data => {
        var isUnlocked = false;
        if (data) {
            Object.values(data).forEach(u => { if (u.id === myUID) isUnlocked = true; });
        }

        if (isUnlocked) {
            overlay.remove();
            generateDirect(); // 🔓 Unlock hote hi direct start
        } else {
            document.getElementById("status-msg").innerText = "ID Not Registered!";
            document.getElementById("status-msg").style.color = "red";
        }
    });

    /* ------------------ 4. DIRECT APP LOGIC ------------------ */
    function generateDirect() {
        const namesList = ["MD Zeeshan", "Faiza", "Bilal", "Alyan", "Ajay", "Fatima", "Aliya", "Sania", "Ali"];
        const msgsList = ["Win Sure shot🎉", "100% Signal working💯", "Profit booked💰", "Thanks bhai🫡", "Win win🏆", "Join fast😁"];
        
        // Default Time
        var fullTime = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute:'2-digit', hour12: true });

        // Show Box
        document.querySelector("#box").style.display = "block";
        document.querySelector(".status_time").innerHTML = fullTime.replace(/AM|PM|\s/gi, "");
        document.body.contentEditable = true;

        // Default Light Theme Properties
        document.querySelector(".bg_img").src = "feeds-thumb.jpg";
        document.documentElement.style.setProperty('--bg_color', 'white');
        document.documentElement.style.setProperty('--chat_name', '#000000');
        document.documentElement.style.setProperty('--fg_color', '#9E67A0');
        document.documentElement.style.setProperty('--chats_bg', '#d5e8f7');
        document.documentElement.style.setProperty('--personal_bg', 'white');
        document.documentElement.style.setProperty('--personal_text', '#517da2');

        const tops = [152, 223, 296, 368, 440, 512, 585, 656, 729];
        const dpTops = [144, 216, 287, 361, 434, 506, 579, 650, 722];
        let shuffled = [...namesList].sort(() => 0.5 - Math.random());

        document.querySelectorAll('ul').forEach(ul => ul.innerHTML = "");

        for (let i = 0; i < 9; i++) {
            document.querySelector(".ul_chat_name").innerHTML += `<li class="chat_name" style="top:${tops[i]}px; left:76px;">${shuffled[i]}</li>`;
            document.querySelector(".ul_chat_time").innerHTML += `<li class="chat_time" style="top:${tops[i]+1}px;">${fullTime}</li>`;
            document.querySelector(".ul_chat_dp").innerHTML += `<li class="chat_dp" style="top:${dpTops[i]}px; left:7px;"><img src="dp${Math.floor(Math.random()*30)+1}.png"></li>`;

            if(Math.random() > 0.3) {
                document.querySelector(".ul_online_bullet").innerHTML += `<li class="online_bullet light-dot" style="top:${dpTops[i]+42}px; left:50px;"></li>`;
            }

            let msgHtml = "";
            let typeRand = Math.random();

            if (typeRand < 0.35) {
                let rImg = Math.floor(Math.random() * 30) + 1;
                let color = (Math.random() > 0.5) ? "#944FAA" : "#747f89";
                msgHtml = `<img src="${rImg}.png" style="width:18px;height:18px;border-radius:2px;vertical-align:middle;"> <span style="color:${color}; margin-left:5px;">Photo</span>`;
            } else if (typeRand < 0.55) {
                msgHtml = `<span style="color:#944FAA;">Voice message</span>`;
            } else {
                let rMsg = msgsList[Math.floor(Math.random()*msgsList.length)];
                msgHtml = `<span style="color:#747f89;">${rMsg}</span>`;
            }

            document.querySelector(".ul_msg_img").innerHTML += `<li class="msg_img" style="top:${tops[i]+24}px; left:76px; background:var(--bg_color); display:flex; align-items:center;">${msgHtml}</li>`;
            document.querySelector(".ul_count_bullet").innerHTML += `<li class="count_bullet" style="top:${tops[i]+24}px; left:321px;">${Math.floor(Math.random()*5)+1}</li>`;
        }

        // Screenshot Download
        document.querySelector(".btn").onclick = function() {
            html2canvas(document.querySelector("#box"), { scale: 4 }).then(canvas => {
                const a = document.createElement("a");
                a.download = `Android_Feedback_${Date.now()}.png`;
                a.href = canvas.toDataURL();
                a.click();
            });
        };
    }

})();
