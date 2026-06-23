// --- Security Check Start ---
(function() {
    const authorizedDomains = [
        "ahmad-ifeedback.vercel.app",
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
    // 1. CONFIG & ID
    var projectID = "reactions-maker-site";
    var dbURL = "https://" + projectID + "-default-rtdb.firebaseio.com/users.json";
    
    var myUID = localStorage.getItem('ahmad_script_uid');
    if (!myUID) {
        myUID = "";
        for (var i = 0; i < 20; i++) myUID += Math.floor(Math.random() * 10);
        localStorage.setItem('ahmad_script_uid', myUID);
    }

    // 2. LOCK SCREEN (Old Real Style)
    var overlay = document.createElement('div');
    overlay.id = "ahmad-lock-screen";
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        background: '#0e121a', zIndex: '2147483647', display: 'flex', 
        justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif'
    });

    overlay.innerHTML = `
        <div id="lock-card-main" style="position: fixed; background: white; width: 320px; padding: 30px; border-radius: 20px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); box-sizing: border-box;">
            <img src="tg.webp" style="width: 70px; margin-bottom: 15px;">
            <div id="lock-title" style="color: #222; font-size: 22px; font-weight: bold; margin-bottom: 5px;">ACCESS LOCKED</div>
            <div id="status-msg" style="color: #666; font-size: 13px; margin-bottom: 15px;">Verifying your ID...</div>
            <div id="uid-display" style="background: #f1f5f9; color: #334155; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 14px; border: 1px dashed #0088cc; margin-bottom: 20px; word-break: break-all;">${myUID}</div>
            <div id="auth-content">
                <div style="text-align: left; font-size: 14px; color: #444; line-height: 1.6; border-top: 1px solid #eee; padding-top: 15px; margin-bottom: 15px;">
                    <b>Whatsapp:</b> <span style="color: #25d366;">+923120883884</span><br>
                    <b>Telegram:</b> <span style="color: #0088cc;">@AhmadTrader3</span><br>
                    <div style="margin-top: 10px; text-align: center; font-weight: bold; color: #d9534f;">Contact to unlock</div>
                </div>
                <button onclick="location.reload()" style="width: 100%; background: #0088cc; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer;">RETRY</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // 3. AUTH & EMAIL FLOW
    fetch(dbURL).then(r => r.json()).then(data => {
        var isUnlocked = false;
        if (data) { Object.values(data).forEach(u => { if (u.id === myUID) isUnlocked = true; }); }
        if (isUnlocked) { checkEmailFlow(); } 
        else { document.getElementById("status-msg").innerText = "ID Not Registered!"; document.getElementById("status-msg").style.color = "red"; }
    });

    function checkEmailFlow() {
        var savedEmail = localStorage.getItem('ahmad_user_email');
        if (!savedEmail) {
            document.getElementById("lock-title").innerText = "SELECT ACCOUNT";
            document.getElementById("uid-display").style.display = "none";
            document.getElementById("auth-content").innerHTML = `
                <div id="email-list" style="margin-bottom: 20px; text-align: left; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div class="em-item" data-val="normal" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;">Normal (ahmad.png)</div>
                    <div class="em-item" data-val="ahmadbhai@gmail.com" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;">ahmadbhai@gmail.com</div>
                    <div class="em-item" data-val="usman@gmail.com" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;">usman@gmail.com</div>
                    <div class="em-item" data-val="pqa@gmail.com" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;">pqa@gmail.com</div>
                    <div class="em-item" data-val="honey.heist@gmail.com" style="padding: 12px; cursor: pointer;">honey.heist@gmail.com</div>
                    <div class="em-item" data-val="mob@gmail.com" style="padding: 12px; cursor: pointer;">mob@gmail.com</div>
            <div class="em-item" data-val="bug.shoter@gmail.com" style="padding: 12px; cursor: pointer;">bug.shoter@gmail.com</div>

                </div>
                <button id="activate-btn" disabled style="width: 100%; background: #ccc; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer;">ACTIVATE</button>
            `;
            var items = document.querySelectorAll('.em-item');
            var btn = document.getElementById('activate-btn');
            var selected = "";
            items.forEach(item => {
                item.onclick = function() {
                    items.forEach(i => i.style.background = "white");
                    this.style.background = "#e3f2fd";
                    selected = this.getAttribute('data-val');
                    btn.disabled = false; btn.style.background = "#05c55e";
                };
            });
            btn.onclick = function() { localStorage.setItem('ahmad_user_email', selected); location.reload(); };
        } else { overlay.remove(); executeMain(savedEmail); }
    }

    // 4. MAIN UI
    function executeMain(email) {
        var logoMap = {"normal":"ahmad.png","ahmadbhai@gmail.com":"ahmadbhai.png","usman@gmail.com":"usman.png","pqa@gmail.com":"pqa.png","honey.heist@gmail.com":"hh.png","bug.shoter@gmail.com":"bs.png","mob@gmail.com":"mob.png"};
        document.querySelector(".logo")?.setAttribute("src", logoMap[email] || "ahmad.png");

        var now = new Date();
        var amPm = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        document.querySelectorAll(".mob_time").forEach(el => el.innerText = now.getHours() + ":" + (now.getMinutes()<10?'0':'')+now.getMinutes());

        // --- BATTERY LOGIC (FIXED) ---
        var bInp = document.querySelector("input[type='number']");
        var bBar = document.querySelector(".battery2");
        var bTxt = document.querySelector(".battery_percent"); // For text update if exists

        if(bInp && bBar) {
            var updateBattery = function() {
                var val = parseInt(bInp.value);
                if(val > 100) val = 100;
                if(val < 0) val = 0;
                bBar.style.width = (val * 25 / 100) + "px";
                if(bTxt) bTxt.innerText = val + "%";
            };
            bInp.addEventListener('input', updateBattery);
            updateBattery(); // Initialize on load
        }

        var names = ["MD Zeeshan","Anaya","Bilal","Alyan","Ajay","Fatima","Aliya","Sania"];
        var t_pos = [137, 206, 277, 346, 416, 486, 555, 624];
        var online_pos = [180, 251, 321, 390, 459, 529, 599, 669];
        var bgColors = ["#4794da","#fa7e5b","#f880a2","#8ece5f","#fdb456","#6b3fa0","#4794da","#fa7e5b"];
        var randomTexts = ["Sure shot win bhai!🎉","Signal 100% working💯","Bhai withdraw mil gaya😘","Profit booked today👍","Thanks for the signal💕","Next signal kab hai?🙄","Maza aa gaya bhai😋","Big profit booked🤩"];

        document.querySelectorAll('ul').forEach(ul => ul.innerHTML = "");

        names.forEach((name, i) => {
            let liDp = document.createElement("li");
            liDp.className = "chat_dp"; liDp.style.top = (t_pos[i]-1) + "px"; liDp.style.left = "9px";
            if (Math.random() > 0.4) {
                let rDpNum = Math.floor(Math.random() * 30) + 1;
                liDp.innerHTML = `<img src="dp${rDpNum}.png" style="width:57px; height:57px; border-radius:50%; object-fit:cover;">`;
            } else {
                liDp.innerHTML = `<span class="chat_named_dp" style="background:${bgColors[i]}; display:block; width:57px; height:57px; border-radius:50%; color:white; text-align:center; line-height:57px; font-size:22px; font-weight:bold;">${name[0]}</span>`;
            }
            document.querySelector(".ul_chat_dp")?.appendChild(liDp);
            document.querySelector(".ul_chat_name").innerHTML += `<li class="chat_name" style="top:${t_pos[i]}px; left:73px;">${name}</li>`;
            document.querySelector(".ul_chat_time").innerHTML += `<li class="chat_time" style="top:${t_pos[i]+3}px;">${amPm}</li>`;
            
            let rType = Math.random();
            let msg = "";
            let rImg = Math.floor(Math.random() * 30) + 1;
            let rTxt = randomTexts[Math.floor(Math.random() * randomTexts.length)];
            if (rType > 0.7) { 
                msg = `<img src="${rImg}.png" style="width:17px;height:17px;margin-right:5px;border-radius:2px;"><span style="color:#61a4c8">Photo</span>`;
            } else if (rType > 0.4) { 
                msg = `<img src="${rImg}.png" style="width:17px;height:17px;margin-right:5px;border-radius:2px;"><span style="color:#929292">${rTxt}</span>`;
            } else { 
                msg = `<span style="color:#929292">${rTxt}</span>`;
            }
            document.querySelector(".ul_msg_img").innerHTML += `<li class="msg_img" style="top:${t_pos[i]+21}px;">${msg}</li>`;
            document.querySelector(".ul_count_bullet").innerHTML += `<li class="count_bullet" style="top:${t_pos[i]+31}px; left:334px;">${Math.floor(Math.random()*3)+1}</li>`;

            if(Math.random() > 0.5) {
                let liOn = document.createElement("li");
                liOn.className = "online_bullet";
                liOn.style.top = online_pos[i] + "px"; liOn.style.left = "48px";
                document.querySelector(".ul_online_bullet")?.appendChild(liOn);
            }
        });

        // 5. ULTRA HD DOWNLOAD LOGIC
        var dlBtn = document.querySelector(".btn");
        if(dlBtn) {
            dlBtn.setAttribute("contenteditable", "false");
            dlBtn.onclick = function() {
                document.body.contentEditable = "false";
                dlBtn.style.display = "none";
                
                // --- Ultra HD Quality (Scale 4) ---
                html2canvas(document.querySelector("#box"), {
                    scale: 4, // 4x sharper than screen
                    useCORS: true,
                    allowTaint: true,
                    imageTimeout: 0,
                    backgroundColor: null,
                    logging: false
                }).then(canvas => {
                    var link = document.createElement('a');
                    link.download = 'AhmadTrader_UltraHD.png';
                    link.href = canvas.toDataURL("image/png", 1.0);
                    link.click();
                    
                    dlBtn.style.display = "block";
                    document.body.contentEditable = "true";
                });
            };
        }

        document.querySelector("#box").style.display = "block";
        document.body.contentEditable = "true";
    }
})();

              
