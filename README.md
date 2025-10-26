<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
    
    body {
      background: #0a0a0a;
      color: #33ff00;
      font-family: 'Orbitron', monospace;
      margin: 0;
      padding: 20px;
      overflow-x: hidden;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .glitch-container {
      position: relative;
      height: 120px;
      margin: 40px 0;
    }
    
    .glitch {
      font-size: 50px;
      font-weight: 900;
      text-transform: uppercase;
      position: relative;
      text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff,
        0.025em 0.04em 0 #fffc00;
      animation: glitch 725ms infinite;
      text-align: center;
    }
    
    .glitch span {
      position: absolute;
      top: 0;
      left: 0;
    }
    
    .glitch span:first-child {
      animation: glitch 500ms infinite;
      clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
      transform: translate(-0.04em, -0.03em);
      opacity: 0.75;
    }
    
    .glitch span:last-child {
      animation: glitch 375ms infinite;
      clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
      transform: translate(0.04em, 0.03em);
      opacity: 0.75;
    }
    
    @keyframes glitch {
      0% {
        text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff,
          0.025em 0.04em 0 #fffc00;
      }
      15% {
        text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff,
          0.025em 0.04em 0 #fffc00;
      }
      16% {
        text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.035em 0 #fc00ff,
          -0.05em -0.05em 0 #fffc00;
      }
      49% {
        text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.035em 0 #fc00ff,
          -0.05em -0.05em 0 #fffc00;
      }
      50% {
        text-shadow: 0.05em 0.035em 0 #00fffc, 0.03em 0 0 #fc00ff,
          0 -0.04em 0 #fffc00;
      }
      99% {
        text-shadow: 0.05em 0.035em 0 #00fffc, 0.03em 0 0 #fc00ff,
          0 -0.04em 0 #fffc00;
      }
      100% {
        text-shadow: -0.05em 0 0 #00fffc, -0.025em -0.04em 0 #fc00ff,
          -0.04em -0.025em 0 #fffc00;
      }
    }
    
    .wolf-image {
      position: relative;
      text-align: center;
      margin: 40px 0;
    }
    
    .wolf-img {
      width: 500px;
      height: 600px;
      border: 2px solid #33ff00;
      box-shadow: 0 0 20px #33ff00, 0 0 40px #33ff00;
      filter: hue-rotate(0deg);
      animation: pulse 4s infinite;
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 20px #33ff00, 0 0 40px #33ff00; }
      50% { box-shadow: 0 0 30px #33ff00, 0 0 60px #33ff00, 0 0 80px #33ff00; }
      100% { box-shadow: 0 0 20px #33ff00, 0 0 40px #33ff00; }
    }
    
    .badges {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
      margin: 30px 0;
    }
    
    .badge {
      padding: 10px 20px;
      background: #111;
      border: 1px solid #33ff00;
      border-radius: 5px;
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    
    .section {
      border: 1px solid #33ff00;
      padding: 20px;
      margin: 30px 0;
      position: relative;
      overflow: hidden;
    }
    
    .section::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(51, 255, 0, 0.1), transparent);
      animation: shine 3s infinite;
    }
    
    @keyframes shine {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    
    .typing {
      border-right: 2px solid #33ff00;
      animation: blink 1s infinite;
      white-space: nowrap;
      overflow: hidden;
    }
    
    @keyframes blink {
      0%, 100% { border-color: transparent; }
      50% { border-color: #33ff00; }
    }
    
    .footer {
      text-align: center;
      margin-top: 50px;
      padding: 20px;
      border-top: 1px solid #33ff00;
    }
    
    .hacker-text {
      font-family: monospace;
      background: #111;
      padding: 10px;
      border: 1px solid #33ff00;
      margin: 10px 0;
    }
    
    .matrix-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.1;
    }
  </style>
</head>
<body>
  <canvas class="matrix-bg" id="matrix"></canvas>
  
  <div class="container">
    <div class="glitch-container">
      <div class="glitch" data-text="WOLFBOT">WOLFBOT
        <span>WOLFBOT</span>
        <span>WOLFBOT</span>
      </div>
    </div>
    
    <div class="wolf-image">
      <img class="wolf-img" src="https://files.catbox.moe/j0r1ob.jpg" alt="Wolf Bot — Silent Wolf Aura" />
    </div>
    
    <h1 align="center">
      ⚡🐺<br>
      <span style="font-size: 42px;">
        <b>🅆🄾🄻🄵 ⓑⓞⓣ</b>
      </span><br>
      <i><sub>by Silent Wolf •</sub></i>
    </h1>
    
    <p align="center"><i>"Silence kills. So does this bot."</i></p>
    
    <p align="center">
      <b>Spawned by <code>Silent Wolf</code>, refined in digital darkness — blessed by Meiser's shadow 🖤👁️‍🗨️</b>
    </p>
    
    <div class="badges">
      <div class="badge">Node.js 🟢 v18+</div>
      <div class="badge">Discord.js 💜 v14</div>
      <div class="badge">MEISER Enhanced 🔮 Aura</div>
      <div class="badge">Rage Fueled 🔥 No Mercy</div>
    </div>
    
    <div class="section">
      <h2>🌑 𝙰𝚋𝚘𝚞𝚝</h2>
      <div class="hacker-text">
        > 🧊 Silent Wolf doesn't yap.<br>
        > 💻 It calculates.<br>
        > ⚙️ A Node.js creation with zero emotions and maximum disrespect.<br>
        > 🧠 It doesn't serve — it <em class="typing">dominates</em>.<br>
        > 🌘 Your server becomes its <strong>territory</strong>
      </div>
    </div>
    
    <div class="section">
      <h2>💀 𝕎𝕙𝕒𝕥 𝕀𝕥 𝔻𝕠𝕖𝕤</h2>
      <div class="hacker-text">
        - 💬 Replies like it's been eavesdropping since birth<br>
        - 🧠 Smarter than your whole admin team combined<br>
        - 🐾 Tracks your every move like prey<br>
        - 🕵️ Operates in silence… then strikes without warning<br><br>
        
        > Looking for a cuddly chatbot?<br>
        > ❌ Wrong cave.<br>
        > ✅ This one <strong class="typing">bites first</strong>, then logs it 🔪🐺
      </div>
    </div>
    
    <div class="section">
      <h2>⚙️ 𝕋𝕖𝕔𝕙 𝕊𝕥𝕒𝕔𝕜</h2>
      <div class="hacker-text">
        - ⚡ <strong>Node.js</strong> — because speed > mercy<br>
        - 💬 <strong>Discord.js</strong> — because wolves hunt in packs<br>
        - 🌌 <strong>Eternal night-fuelled rage</strong><br>
        - 🩸 <strong>Meiser's shadow protocol</strong> — coded in the dark, tested on light
      </div>
    </div>
    
    <div class="section">
      <h2>🙊 𝔻𝕚𝕤𝕔𝕝𝕒𝕚𝕞𝕖𝕣</h2>
      <div class="hacker-text">
        > ⚖️ Bug reports will be <em>judged</em><br>
        > 🔥 Crashes are... <strong>sacrifices</strong><br>
        > 👁️ This bot doesn't crash — it <strong class="typing">resets reality</strong>
      </div>
    </div>
    
    <div class="footer">
      <p>
        👤 Built by <b>Silent Wolf</b><br>
        💀 Enhanced by <b>Meiser</b> — the King behind the curtain 👑🩸💀<br><br>
        <i>You're not running a bot.<br>You're unleashing a <strong class="typing">predator</strong>.</i>
      </p>
    </div>
  </div>

  <script>
    // Matrix background effect
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = "01010101010101010101010101010101";
    const charArray = chars.split("");
    
    const font_size = 14;
    const columns = canvas.width/font_size;
    
    const drops = [];
    for(let x = 0; x < columns; x++)
      drops[x] = 1; 
    
    function drawMatrix() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "#0F0";
      ctx.font = font_size + "px arial";
      
      for(let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random()*charArray.length)];
        ctx.fillText(text, i*font_size, drops[i]*font_size);
        
        if(drops[i]*font_size > canvas.height && Math.random() > 0.975)
          drops[i] = 0;
        
        drops[i]++;
      }
    }
    
    setInterval(drawMatrix, 35);
    
    // Glitch effect on hover
    document.querySelector('.glitch').addEventListener('mouseover', function() {
      this.style.animation = 'glitch 150ms infinite';
    });
    
    document.querySelector('.glitch').addEventListener('mouseout', function() {
      this.style.animation = 'glitch 725ms infinite';
    });
    
    // Random glitch effect
    setInterval(() => {
      if(Math.random() > 0.7) {
        document.querySelector('.wolf-img').style.filter = `hue-rotate(${Math.random() * 360}deg)`;
        setTimeout(() => {
          document.querySelector('.wolf-img').style.filter = 'hue-rotate(0deg)';
        }, 100);
      }
    }, 2000);
  </script>
</body>
</html>
