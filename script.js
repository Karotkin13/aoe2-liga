const players = {
    "karotkin": { img: "dominik.jpg" },
    "kellny": { img: "petr.jpg" },
    "vrba.tomas": { img: "tomas.jpg" },
    "Líbezná princezna": { img: "jana.jpg" }
};

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLw51yY_EguWlTZcU72B7i_FlgSnbRmShlpOPHK8HI8WNH1qsR4SOk4q-vbRdVk1ACTcz1F5FDuAQf/pub?gid=0&single=true&output=csv";

let matches = [];

async function loadData() {
    try {
        const response = await fetch(SHEET_CSV_URL);
        const data = await response.text();
        parseCSV(data);
        updateStats();
    } catch (err) {
        console.error("Chyba při načítání dat:", err);
    }
}

function parseCSV(text) {
    const lines = text.split("\n");
    matches = lines.slice(1).filter(line => line.trim() !== "").map(line => {
        const cols = line.split(",").map(c => c.trim());
        const p1 = cols[0];
        const p2 = cols[1];
        const code = cols[2];
        return { p1, p2, winner: (code === "1" ? p1 : p2) };
    });
}

function updateStats() {
    let stats = {};
    let h2h = {};
    const names = Object.keys(players);

    names.forEach(p => {
        stats[p] = { wins: 0, losses: 0, total: 0 };
        h2h[p] = {};
        names.forEach(p2 => { if(p !== p2) h2h[p][p2] = 0; });
    });

    matches.forEach(m => {
        if(stats[m.p1] && stats[m.p2]) {
            stats[m.p1].total++; stats[m.p2].total++;
            if(m.winner === m.p1) {
                stats[m.p1].wins++; stats[m.p2].losses++;
                h2h[m.p1][m.p2]++;
            } else {
                stats[m.p2].wins++; stats[m.p1].losses++;
                h2h[m.p2][m.p1]++;
            }
        }
    });

    renderTable(stats);
    renderH2H(h2h, names);
    renderMatches();
}

function renderTable(stats) {
    const tbody = document.querySelector("#league-table tbody");
    const sorted = Object.entries(stats).sort((a, b) => (b[1].wins * 3) - (a[1].wins * 3));
    tbody.innerHTML = sorted.map(([name, data]) => {
        const wr = data.total > 0 ? ((data.wins/data.total)*100).toFixed(1) : 0;
        return `<tr>
            <td><img src="${players[name].img}" class="avatar"><strong>${name}</strong></td>
            <td>${data.total}</td><td>${data.wins}</td><td>${data.losses}</td>
            <td>${wr}%</td><td style="color:#ffcc00; font-weight:bold">${data.wins*3}</td>
        </tr>`;
    }).join('');
}

function renderH2H(h2h, names) {
    const container = document.getElementById("h2h-container");
    let html = "";
    for(let i=0; i<names.length; i++) {
        for(let j=i+1; j<names.length; j++) {
            const p1 = names[i]; const p2 = names[j];
            html += `<div class="h2h-row">${p1} ${h2h[p1][p2]} : ${h2h[p2][p1]} ${p2}</div>`;
        }
    }
    container.innerHTML = html;
}

function renderMatches() {
    const list = document.getElementById("matches-list");
    list.innerHTML = matches.slice(-10).reverse().map(m => 
        `<li><span>⚔️ ${m.p1} vs ${m.p2}</span> <strong>Vítěz: ${m.winner}</strong></li>`
    ).join('');
}

loadData();