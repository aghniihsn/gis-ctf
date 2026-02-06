import * as JSROOT from "./jsroot/modules/core.mjs";
console.log("JSROOT OK:", JSROOT.version);

const canvas = document.getElementById("map-canvas");
const ctx = canvas.getContext("2d");
const coordDisplay = document.getElementById("coord-display");
const clockEl = document.getElementById("clock");
const packetsSec = document.getElementById("packets-sec");
const activePacketCount = document.getElementById("active-packet-count");
const nodeInfo = document.getElementById("node-info");
const flagBox = document.getElementById("flag-box");
const networkStatus = document.getElementById("network-status");
const teamCardsContainer = document.getElementById("team-cards");

const teamColors = [
  "#ff4466",  
  "#ffaa33",  
  "#00cc66",  
  "#ffcc00",  
  "#cc66ff",  
];

const nodes = [
  { id: "N1", num: 1, city: "Tokyo", country: "Japan", team: "Team Glend", ip: "192.168.1.101", lat: 35.6, lng: 139.6, color: teamColors[0], members: 5, score: 0, solved: 0, threat: "LOW", pending: 0, networkPct: 75 },
  { id: "N2", num: 2, city: "San Francisco", country: "USA", team: "Team Bona", ip: "192.168.1.102", lat: 37.7, lng: -122.4, color: teamColors[1], members: 5, score: 0, solved: 0, threat: "LOW", pending: 0, networkPct: 62 },
  { id: "N3", num: 3, city: "Berlin", country: "Germany", team: "Team Arief", ip: "192.168.1.103", lat: 52.5, lng: 13.4, color: teamColors[2], members: 5, score: 0, solved: 0, threat: "LOW", pending: 0, networkPct: 88 },
  { id: "N4", num: 4, city: "Singapore", country: "Singapore", team: "Team Irfan", ip: "192.168.1.104", lat: 1.3, lng: 103.8, color: teamColors[3], members: 5, score: 0, solved: 0, threat: "LOW", pending: 0, networkPct: 59 },
  { id: "N5", num: 5, city: "Sydney", country: "Australia", team: "Team Deni", ip: "192.168.1.105", lat: -33.8, lng: 151.2, color: teamColors[4], members: 5, score: 0, solved: 0, threat: "LOW", pending: 0, networkPct: 69 },
];

let mapZoom = 1;
let showLines = true;
let animFrame = 0;
let packets = [];

const worldPolygons = [
  [[60,-140],[64,-168],[70,-162],[72,-157],[71,-136],[68,-138],[65,-137],[60,-130],
   [55,-125],[50,-127],[48,-124],[45,-124],[40,-124],[35,-121],[33,-118],[32,-117],
   [29,-105],[26,-97],[25,-90],[30,-88],[30,-84],[25,-80],[27,-77],[30,-81],
   [35,-75],[39,-74],[41,-72],[43,-66],[45,-61],[47,-53],[50,-56],[53,-60],
   [55,-60],[60,-64],[62,-75],[60,-80],[58,-92],[55,-82],[52,-79],[49,-88],
   [49,-95],[52,-97],[54,-100],[57,-110],[60,-120],[58,-125],[55,-128],[60,-140]],
  [[12,-72],[10,-76],[8,-77],[4,-77],[1,-80],[-5,-81],[-6,-77],[-4,-70],
   [2,-67],[7,-60],[7,-56],[5,-52],[2,-51],[0,-50],[-2,-44],[-5,-35],[-8,-35],
   [-13,-39],[-18,-40],[-23,-43],[-25,-48],[-30,-51],[-33,-53],[-40,-62],
   [-46,-66],[-50,-69],[-53,-70],[-55,-67],[-54,-64],[-50,-66],[-44,-65],
   [-40,-62],[-36,-56],[-33,-52],[-28,-49],[-25,-46],[-20,-40],[-15,-39],
   [-10,-37],[-5,-35],[-2,-44],[0,-50],[5,-52],[8,-60],[7,-60],[2,-67],
   [-4,-70],[-6,-77],[-5,-81],[1,-80],[4,-77],[8,-77],[10,-76],[12,-72]],
  [[36,-10],[37,-5],[38,0],[40,0],[43,-2],[43,-8],[46,-2],[48,-5],[51,-5],
   [52,-1],[53,1],[54,8],[55,12],[56,10],[58,12],[60,5],[62,5],[65,14],
   [70,20],[70,30],[68,28],[63,22],[60,25],[60,30],[65,30],[70,40],
   [65,40],[60,38],[55,38],[50,40],[46,38],[45,35],[42,28],[40,26],
   [38,24],[36,22],[38,20],[40,18],[42,15],[44,10],[43,5],[41,2],
   [40,0],[38,0],[37,-5],[36,-10]],
  [[35,-10],[30,-10],[25,-15],[20,-17],[15,-17],[10,-15],[5,-10],[5,-3],
   [5,2],[5,10],[3,10],[0,10],[-3,10],[-7,14],[-12,15],[-18,12],
   [-22,15],[-27,15],[-30,18],[-34,19],[-35,20],[-34,26],[-30,31],
   [-25,35],[-18,38],[-12,44],[-5,42],[2,42],[5,44],[10,50],[12,51],
   [15,50],[18,40],[22,37],[27,34],[30,32],[33,35],[35,33],[37,25],
   [37,11],[35,10],[33,10],[34,10],[37,2],[37,-5],[35,-10]],
  [[70,40],[68,50],[64,70],[66,72],[68,80],[65,78],[60,70],[55,68],
   [50,60],[46,48],[42,44],[38,44],[35,45],[30,48],[25,55],[22,60],
   [20,63],[15,74],[10,78],[8,80],[15,80],[22,78],[22,88],[25,92],
   [22,96],[18,98],[14,100],[10,104],[8,106],[2,110],[1,104],
   [-6,106],[-8,115],[-6,115],[-8,110],[-6,106],[1,104],[2,110],
   [8,106],[14,100],[22,96],[25,92],[24,90],[22,88],[22,78],
   [28,85],[32,80],[38,75],[42,70],[48,65],[50,60],[55,55],
   [55,48],[53,48],[50,53],[45,55],[40,60],[35,65],[30,70],
   [28,72],[30,80],[35,78],[42,70],[48,65],[55,68],[60,70],
   [68,80],[70,70],[73,80],[75,100],[73,110],[72,120],[70,130],
   [68,140],[65,142],[60,145],[58,140],[55,135],[52,130],[48,132],
   [44,135],[40,130],[35,129],[33,130],[35,137],[40,142],[44,146],
   [48,140],[52,140],[55,135],[55,140],[60,160],[65,170],[70,180],[70,40]],
  [[-12,130],[-12,136],[-15,141],[-19,147],[-23,151],[-28,153],[-33,152],
   [-37,150],[-39,146],[-38,144],[-36,137],[-34,135],[-33,134],[-30,130],
   [-26,126],[-24,122],[-20,119],[-16,119],[-14,125],[-12,130]],
  [[60,-45],[65,-40],[70,-28],[75,-18],[78,-20],[82,-30],[83,-40],
   [82,-50],[78,-60],[74,-58],[70,-52],[65,-45],[60,-45]],
  [[31,130],[33,131],[35,133],[37,137],[39,140],[42,141],[44,145],
   [43,141],[40,140],[38,139],[36,140],[35,137],[33,133],[31,130]],
  [[50,-5],[52,-3],[54,-3],[56,-5],[58,-5],[58,-3],[56,0],[54,0],
   [52,2],[51,1],[50,0],[50,-5]],
  [[-34,172],[-37,176],[-40,176],[-44,172],[-46,168],[-44,168],
   [-40,176],[-37,176],[-34,172]],
  [[64,-22],[66,-18],[66,-14],[64,-16],[63,-20],[64,-22]],
  [[-2,100],[-1,104],[1,104],[2,108],[0,110],[-2,112],[-5,115],
   [-7,116],[-8,115],[-8,112],[-6,108],[-4,105],[-2,100]],
  [[-12,49],[-16,46],[-20,44],[-25,47],[-22,49],[-18,48],[-12,49]]
];

function project(lat, lng) {
  const x = ((lng + 180) / 360) * canvas.width * mapZoom;
  const y = ((90 - lat) / 180) * canvas.height * mapZoom;
  return { x, y };
}

function resizeCanvas() {
  const container = document.getElementById("map-container");
  canvas.width = container.clientWidth;
  canvas.height = Math.min(container.clientWidth * 0.52, window.innerHeight - 200);
}
window.addEventListener("resize", () => { resizeCanvas(); });

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = "rgba(0,170,255,0.06)";
  ctx.lineWidth = 0.5;
  for (let lat = -75; lat <= 75; lat += 15) {
    const p1 = project(lat, -180);
    const p2 = project(lat, 180);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  for (let lng = -180; lng <= 180; lng += 15) {
    const p1 = project(90, lng);
    const p2 = project(-90, lng);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(0,170,255,0.12)";
  ctx.lineWidth = 1;
  let a = project(0, -180), b = project(0, 180);
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  a = project(90, 0); b = project(-90, 0);
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();

  ctx.font = "9px monospace";
  ctx.fillStyle = "rgba(0,170,255,0.18)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let lng = -150; lng <= 150; lng += 30) {
    const p = project(-88, lng);
    ctx.fillText(lng + "°", p.x, p.y);
  }
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (let lat = -60; lat <= 75; lat += 30) {
    const p = project(lat, -178);
    ctx.fillText(lat + "°", p.x + 2, p.y);
  }
  ctx.restore();
}

function drawContinents() {
  ctx.save();
  worldPolygons.forEach(poly => {
    if (poly.length < 3) return;
    ctx.beginPath();
    const s = project(poly[0][0], poly[0][1]);
    ctx.moveTo(s.x, s.y);
    for (let i = 1; i < poly.length; i++) {
      const pt = project(poly[i][0], poly[i][1]);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();

    ctx.fillStyle = "rgba(18,35,65,0.7)";
    ctx.fill();

    ctx.strokeStyle = "rgba(0,170,255,0.35)";
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.strokeStyle = "rgba(0,120,220,0.08)";
    ctx.lineWidth = 4;
    ctx.stroke();
  });

  const cityDots = [
    [48.8,2.3],[40.7,-74],[55.7,37.6],[39.9,116.4],[28.6,77.2],[19.4,-99.1],
    [-34.6,-58.4],[30,31],[6.5,3.4],[-1.3,36.8],[13.7,100.5],[14.6,121],
    [41,29],[59.9,10.7],[37.6,127],[31.2,121.5],[23.1,113.3],[34.7,135.5],
    [-6.2,106.8],[3.1,101.7],[-22.9,-43.2],[45.4,-75.7],[43.7,-79.4],
    [47.6,-122.3],[34.1,-118.2],[38.9,-77],[51.5,-0.1],[48.1,11.6],
    [50.1,8.7],[52.5,13.4],[41.9,12.5],[40.4,-3.7],[46.2,6.1]
  ];
  cityDots.forEach(([lat, lng]) => {
    const pt = project(lat, lng);
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,170,255,0.2)";
    ctx.fill();
  });

  ctx.restore();
}

function spawnPacket() {
  if (nodes.length < 2) return;
  const from = nodes[Math.floor(Math.random() * nodes.length)];
  let to = nodes[Math.floor(Math.random() * nodes.length)];
  while (to === from) to = nodes[Math.floor(Math.random() * nodes.length)];
  packets.push({ from, to, progress: 0, speed: 0.005 + Math.random() * 0.01, color: from.color });
}

function updatePackets() {
  packets = packets.filter(p => p.progress < 1);
  packets.forEach(p => { p.progress += p.speed; });
  activePacketCount.textContent = packets.length;
}

function drawConnections() {
  if (!showLines) return;
  ctx.save();

  const connectionPairs = [[0,1],[0,2],[0,3],[1,2],[2,3],[3,4],[1,4],[0,4],[2,4],[1,3]];

  function curveMid(a, b) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const offset = dist * 0.15;
    return { x: mx, y: my - offset };
  }

  function bezierPoint(a, cp, b, t) {
    const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cp.x + t * t * b.x;
    const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cp.y + t * t * b.y;
    return { x, y };
  }

  connectionPairs.forEach(([i, j]) => {
    if (i >= nodes.length || j >= nodes.length) return;
    const a = project(nodes[i].lat, nodes[i].lng);
    const b = project(nodes[j].lat, nodes[j].lng);
    const cp = curveMid(a, b);

    ctx.strokeStyle = hexAlpha(nodes[i].color, 0.12);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(cp.x, cp.y, b.x, b.y);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  packets.forEach(p => {
    const a = project(p.from.lat, p.from.lng);
    const b = project(p.to.lat, p.to.lng);
    const cp = curveMid(a, b);
    const pt = bezierPoint(a, cp, b, p.progress);

    const trailSteps = 20;
    const trailStart = Math.max(0, p.progress - 0.25);
    ctx.beginPath();
    const sp = bezierPoint(a, cp, b, trailStart);
    ctx.moveTo(sp.x, sp.y);
    for (let s = 1; s <= trailSteps; s++) {
      const tt = trailStart + (p.progress - trailStart) * (s / trailSteps);
      const tp = bezierPoint(a, cp, b, tt);
      ctx.lineTo(tp.x, tp.y);
    }
    const trailGrad = ctx.createLinearGradient(sp.x, sp.y, pt.x, pt.y);
    trailGrad.addColorStop(0, "transparent");
    trailGrad.addColorStop(1, hexAlpha(p.color, 0.7));
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
    const glowG = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 8);
    glowG.addColorStop(0, hexAlpha(p.color, 0.4));
    glowG.addColorStop(1, hexAlpha(p.color, 0));
    ctx.fillStyle = glowG;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });

  ctx.restore();
}

function drawNodes() {
  ctx.save();
  nodes.forEach(n => {
    const p = project(n.lat, n.lng);
    n._x = p.x;
    n._y = p.y;

    const t = animFrame * 0.03 + n.num * 1.2;

    for (let r = 0; r < 2; r++) {
      const phase = (t * 1.5 + r * Math.PI) % (Math.PI * 2);
      const progress = phase / (Math.PI * 2);
      const ringRadius = 14 + progress * 30;
      const ringAlpha = (1 - progress) * 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = hexAlpha(n.color, ringAlpha);
      ctx.lineWidth = 1.5 * (1 - progress);
      ctx.stroke();
    }

    const sweepAngle = t * 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.arc(p.x, p.y, 28, sweepAngle, sweepAngle + 0.8);
    ctx.closePath();
    const sweepGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 28);
    sweepGrad.addColorStop(0, hexAlpha(n.color, 0.2));
    sweepGrad.addColorStop(1, hexAlpha(n.color, 0));
    ctx.fillStyle = sweepGrad;
    ctx.fill();

    const glowGrad = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, 26);
    glowGrad.addColorStop(0, hexAlpha(n.color, 0.12));
    glowGrad.addColorStop(0.5, hexAlpha(n.color, 0.04));
    glowGrad.addColorStop(1, hexAlpha(n.color, 0));
    ctx.beginPath();
    ctx.arc(p.x, p.y, 26, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
    ctx.strokeStyle = hexAlpha(n.color, 0.25);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(p.x, p.y, 13, 0, Math.PI * 2);
    const bgGrad = ctx.createRadialGradient(p.x, p.y - 3, 2, p.x, p.y, 13);
    bgGrad.addColorStop(0, hexAlpha(n.color, 0.35));
    bgGrad.addColorStop(1, hexAlpha(n.color, 0.1));
    ctx.fillStyle = bgGrad;
    ctx.fill();
    ctx.strokeStyle = n.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = n.color;
    ctx.font = "bold 13px Orbitron, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(n.num), p.x, p.y + 1);

    ctx.font = "10px monospace";
    ctx.fillStyle = hexAlpha(n.color, 0.85);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(n.city.toUpperCase(), p.x, p.y + 22);

    const orbitR = 20;
    const ox = p.x + Math.cos(t * 3) * orbitR;
    const oy = p.y + Math.sin(t * 3) * orbitR;
    ctx.beginPath();
    ctx.arc(ox, oy, 2, 0, Math.PI * 2);
    ctx.fillStyle = hexAlpha(n.color, 0.6);
    ctx.fill();
  });
  ctx.restore();
}

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0a0f1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawContinents();
  drawConnections();
  drawNodes();
}

function animate() {
  animFrame++;
  if (Math.random() < 0.12) spawnPacket();
  updatePackets();
  render();
  requestAnimationFrame(animate);
}

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  clockEl.textContent = h + ":" + m + ":" + s;
}

function updatePacketsPerSec() {
  packetsSec.textContent = 80 + Math.floor(Math.random() * 100);
}

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;

  const lat = ((my / (canvas.height * mapZoom)) * -180 + 90).toFixed(4);
  const lng = ((mx / (canvas.width * mapZoom)) * 360 - 180).toFixed(4);
  coordDisplay.textContent = "LAT: " + lat + " | LNG: " + lng;

  let hovered = null;
  for (const n of nodes) {
    if (Math.hypot(mx - n._x, my - n._y) < 18) { hovered = n; break; }
  }
  if (hovered) {
    nodeInfo.style.display = "block";
    nodeInfo.style.left = (e.clientX - rect.left + 20) + "px";
    nodeInfo.style.top = (e.clientY - rect.top - 10) + "px";
    nodeInfo.querySelector(".city-name").textContent = hovered.city + ", " + hovered.country;
    nodeInfo.querySelector(".team-detail").textContent = "Team: " + hovered.team;
    nodeInfo.querySelector(".ip-detail").textContent = "IP: " + hovered.ip;
    nodeInfo.querySelector(".lat-detail").textContent = "Lat: " + hovered.lat;
    nodeInfo.querySelector(".lng-detail").textContent = "Lng: " + hovered.lng;
    canvas.style.cursor = "pointer";
  } else {
    nodeInfo.style.display = "none";
    canvas.style.cursor = "crosshair";
  }
});

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;

  for (const n of nodes) {
    if (Math.hypot(mx - n._x, my - n._y) < 18) {
      nodeInfo.style.display = "block";
      nodeInfo.style.left = (e.clientX - rect.left + 20) + "px";
      nodeInfo.style.top = (e.clientY - rect.top - 10) + "px";
      nodeInfo.querySelector(".city-name").textContent = n.city + ", " + n.country;
      nodeInfo.querySelector(".team-detail").textContent = "Team: " + n.team;
      nodeInfo.querySelector(".ip-detail").textContent = "IP: " + n.ip;

      if (n.id === "N5") {
        flagBox.style.display = "block";
        flagBox.textContent = "FLAG{JSROOT_CYBER_MAP_SUCCESS}";
      }
      return;
    }
  }
});

document.getElementById("btn-zoom-in").addEventListener("click", () => {
  mapZoom = Math.min(3, mapZoom + 0.25);
});
document.getElementById("btn-zoom-out").addEventListener("click", () => {
  mapZoom = Math.max(0.5, mapZoom - 0.25);
});
document.getElementById("btn-reset").addEventListener("click", () => {
  mapZoom = 1;
});
document.getElementById("btn-toggle-lines").addEventListener("click", () => {
  showLines = !showLines;
});

function buildNetworkStatus() {
  let html = "";
  nodes.forEach(n => {
    html += '<div class="status-row">'
      + '<div class="status-dot" style="background:' + n.color + '"></div>'
      + '<div class="status-team-info">'
      +   '<div class="name">' + n.team + '</div>'
      +   '<div class="ip">' + n.ip + '</div>'
      + '</div>'
      + '<div class="status-bar-container">'
      +   '<div class="status-bar-fill" style="width:' + n.networkPct + '%;background:' + n.color + '" id="bar-' + n.id + '"></div>'
      + '</div>'
      + '<div class="status-percent" style="color:' + n.color + '" id="pct-' + n.id + '">' + n.networkPct + '%</div>'
      + '</div>';
  });
  networkStatus.innerHTML = html;
}

function animateNetworkBars() {
  nodes.forEach(n => {
    n.networkPct = Math.max(20, Math.min(99, n.networkPct + (Math.random() * 10 - 5)));
    const bar = document.getElementById("bar-" + n.id);
    const pct = document.getElementById("pct-" + n.id);
    if (bar) bar.style.width = Math.round(n.networkPct) + "%";
    if (pct) pct.textContent = Math.round(n.networkPct) + "%";
  });
}

function buildTeamCards() {
  let html = "";
  nodes.forEach(n => {
    html += '<div class="team-card" style="border-color:' + hexAlpha(n.color, 0.35) + '">'
      + '<div class="team-card-header">'
      +   '<div class="dot" style="background:' + n.color + '"></div>'
      +   '<span class="team-name">' + n.team + '</span>'
      +   '<span class="badge" style="background:' + hexAlpha(n.color, 0.15) + ';color:' + n.color + ';border:1px solid ' + hexAlpha(n.color, 0.3) + '">TEAM ' + n.num + '</span>'
      + '</div>'
      + '<div class="location">📍 ' + n.city + ', ' + n.country + '</div>'
      + '<div class="ip-addr">🖧 ' + n.ip + '</div>'
      + '<div class="team-card-stats">'
      +   '<div class="stat-box"><div class="value">' + n.members + '</div><div class="label">MEMBERS</div></div>'
      +   '<div class="stat-box"><div class="value">' + n.score + '</div><div class="label">SCORE</div></div>'
      +   '<div class="stat-box"><div class="value">' + n.solved + '</div><div class="label">SOLVED</div></div>'
      + '</div>'
      + '<div class="team-card-footer">'
      +   '<span class="threat-badge threat-' + n.threat.toLowerCase() + '">' + n.threat + '</span>'
      +   '<span class="pending-info">⏱ Pending: ' + n.pending + ' submissions</span>'
      + '</div>'
      + '</div>';
  });
  teamCardsContainer.innerHTML = html;
}

resizeCanvas();
buildNetworkStatus();
buildTeamCards();
updateClock();
updatePacketsPerSec();
document.getElementById("node-count").textContent = nodes.length + " ACTIVE NODES";

setInterval(updateClock, 1000);
setInterval(updatePacketsPerSec, 2000);
setInterval(animateNetworkBars, 3000);

animate();

console.log("Cyber Map initialized. Nodes:", nodes.length);
