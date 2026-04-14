import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// --- Seeded pseudo-random helpers ---

function cityHash(city: string): number {
  let hash = 5381;
  for (let i = 0; i < city.length; i++) {
    hash = (hash * 33) ^ city.toLowerCase().charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const CONDITIONS = [
  "Sunny",
  "Partly Cloudy",
  "Cloudy",
  "Rainy",
  "Thunderstorm",
  "Foggy",
  "Windy",
  "Snowy",
];

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function inRange(min: number, max: number, rand: () => number): number {
  return Math.round(min + rand() * (max - min));
}

// --- Route handlers ---

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/weather/:city", (req: Request, res: Response) => {
  const city = req.params["city"] as string;
  const rand = seededRng(cityHash(city));

  res.json({
    city,
    temperature: inRange(5, 38, rand),
    unit: "C",
    condition: pick(CONDITIONS, rand),
    humidity: inRange(30, 90, rand),
    wind_kph: inRange(5, 60, rand),
  });
});

app.get("/forecast/:city", (req: Request, res: Response) => {
  const city = req.params["city"] as string;
  const rand = seededRng(cityHash(city) ^ 0xdeadbeef);

  const today = new Date();
  const forecast = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i + 1);
    const high = inRange(10, 40, rand);
    const low = high - inRange(3, 12, rand);
    return {
      date: date.toISOString().split("T")[0],
      high,
      low,
      condition: pick(CONDITIONS, rand),
      humidity: inRange(30, 90, rand),
    };
  });

  res.json({ city, forecast });
});

app.get("/", (_req: Request, res: Response) => {
  const CITIES = ["London", "Tokyo", "New York", "Sydney", "Cairo"];

  const ICON: Record<string, string> = {
    Sunny: "☀️",
    "Partly Cloudy": "⛅",
    Cloudy: "☁️",
    Rainy: "🌧️",
    Thunderstorm: "⛈️",
    Foggy: "🌫️",
    Windy: "💨",
    Snowy: "❄️",
  };

  // Accent colour per condition (top stripe + badge tint)
  const ACCENT: Record<string, string> = {
    Sunny:          "linear-gradient(90deg,#f59e0b,#fcd34d)",
    "Partly Cloudy":"linear-gradient(90deg,#38bdf8,#7dd3fc)",
    Cloudy:         "linear-gradient(90deg,#94a3b8,#cbd5e1)",
    Rainy:          "linear-gradient(90deg,#3b82f6,#60a5fa)",
    Thunderstorm:   "linear-gradient(90deg,#8b5cf6,#a78bfa)",
    Foggy:          "linear-gradient(90deg,#64748b,#94a3b8)",
    Windy:          "linear-gradient(90deg,#10b981,#34d399)",
    Snowy:          "linear-gradient(90deg,#bae6fd,#e0f2fe)",
  };

  function tempColor(t: number): string {
    if (t <= 5)  return "#93c5fd";
    if (t <= 15) return "#6ee7b7";
    if (t <= 25) return "#fcd34d";
    return "#f87171";
  }

  const cards = CITIES.map((city) => {
    const rand = seededRng(cityHash(city));
    const temp      = inRange(5, 38, rand);
    const condition = pick(CONDITIONS, rand);
    const humidity  = inRange(30, 90, rand);
    const wind      = inRange(5, 60, rand);
    const feelsLike = Math.max(temp - Math.round(wind / 12), temp - 6);

    const icon   = ICON[condition]   ?? "🌡️";
    const accent = ACCENT[condition] ?? "linear-gradient(90deg,#60a5fa,#818cf8)";

    return `
    <div class="card">
      <div class="card-stripe" style="background:${accent}"></div>
      <div class="card-body">
        <div class="city-row">
          <span class="city-name">${city}</span>
          <span class="badge">${condition}</span>
        </div>
        <div class="weather-main">
          <span class="icon">${icon}</span>
          <div>
            <div class="temp" style="color:${tempColor(temp)}">${temp}°C</div>
            <div class="feels-like">Feels like ${feelsLike}°C</div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="stats">
          <div class="stat-row">
            <span class="stat-label">💧 Humidity</span>
            <div class="hum-right">
              <div class="hum-track"><div class="hum-fill" style="width:${humidity}%"></div></div>
              <span class="stat-value">${humidity}%</span>
            </div>
          </div>
          <div class="stat-row">
            <span class="stat-label">💨 Wind</span>
            <span class="stat-value">${wind} km/h</span>
          </div>
        </div>
        <a class="forecast-btn" href="/forecast/${encodeURIComponent(city)}">5-day forecast →</a>
      </div>
    </div>`;
  }).join("\n");

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Weather Dashboard</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      background: #080f1e;
      min-height: 100vh;
      color: #e2e8f0;
    }

    /* Subtle radial glows in the background */
    .bg-glow {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background:
        radial-gradient(ellipse 60% 50% at 15% 15%, rgba(59,130,246,.13) 0%, transparent 70%),
        radial-gradient(ellipse 50% 45% at 85% 85%, rgba(139,92,246,.10) 0%, transparent 70%);
    }

    .page { position: relative; z-index: 1; padding: 3.5rem 1.5rem 4rem; }

    /* ── Header ── */
    header { text-align: center; margin-bottom: 3rem; }

    .eyebrow {
      display: inline-flex; align-items: center; gap: .4rem;
      font-size: .72rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
      color: #60a5fa;
      background: rgba(96,165,250,.08); border: 1px solid rgba(96,165,250,.22);
      padding: .3rem 1rem; border-radius: 999px; margin-bottom: 1rem;
    }

    h1 {
      font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 800; line-height: 1.1;
      background: linear-gradient(135deg, #f1f5f9 30%, #60a5fa 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: .6rem;
    }

    .subtitle { color: #475569; font-size: .95rem; }

    /* ── Grid ── */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.4rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* ── Card ── */
    .card {
      border-radius: 18px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.09);
      overflow: hidden;
      transition: transform .22s ease, box-shadow .22s ease;
      box-shadow: 0 4px 20px rgba(0,0,0,.35);
    }
    .card:hover {
      transform: translateY(-6px);
      box-shadow: 0 14px 42px rgba(0,0,0,.55);
    }

    .card-stripe { height: 3px; }

    .card-body { padding: 1.5rem 1.4rem 1.4rem; }

    /* City row */
    .city-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.1rem;
    }
    .city-name { font-size: 1rem; font-weight: 700; color: #f1f5f9; }
    .badge {
      font-size: .68rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
      color: #94a3b8; background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.1);
      padding: .2rem .55rem; border-radius: 999px; white-space: nowrap;
    }

    /* Icon + temp */
    .weather-main { display: flex; align-items: center; gap: .9rem; margin-bottom: 1.2rem; }
    .icon { font-size: 3rem; line-height: 1; }
    .temp { font-size: 2.6rem; font-weight: 800; line-height: 1; letter-spacing: -.02em; }
    .feels-like { font-size: .76rem; color: #475569; margin-top: .25rem; }

    /* Divider */
    .divider { height: 1px; background: rgba(255,255,255,.07); margin-bottom: 1rem; }

    /* Stats */
    .stats { display: flex; flex-direction: column; gap: .6rem; margin-bottom: 1.2rem; }
    .stat-row { display: flex; align-items: center; justify-content: space-between; }
    .stat-label { font-size: .78rem; color: #475569; }
    .stat-value { font-size: .8rem; font-weight: 600; color: #94a3b8; }

    /* Humidity bar */
    .hum-right { display: flex; align-items: center; gap: .5rem; }
    .hum-track {
      width: 56px; height: 4px; border-radius: 2px;
      background: rgba(255,255,255,.1); overflow: hidden;
    }
    .hum-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg,#3b82f6,#60a5fa); }

    /* Forecast button */
    .forecast-btn {
      display: block; text-align: center;
      padding: .6rem 1rem; border-radius: 10px;
      background: rgba(96,165,250,.09); border: 1px solid rgba(96,165,250,.2);
      color: #60a5fa; text-decoration: none;
      font-size: .82rem; font-weight: 600; letter-spacing: .02em;
      transition: background .18s, border-color .18s, color .18s;
    }
    .forecast-btn:hover {
      background: rgba(96,165,250,.18);
      border-color: rgba(96,165,250,.4);
      color: #93c5fd;
    }

    /* API explorer links */
    .api-bar {
      display: flex; flex-wrap: wrap; gap: .6rem; justify-content: center;
      max-width: 1200px; margin: 2.5rem auto 0;
    }
    .api-link {
      font-size: .76rem; font-family: ui-monospace, monospace;
      color: #334155; text-decoration: none;
      padding: .28rem .7rem;
      border: 1px solid rgba(255,255,255,.07); border-radius: 7px;
      transition: color .18s, border-color .18s;
    }
    .api-link:hover { color: #64748b; border-color: rgba(255,255,255,.15); }

    /* Footer */
    footer { text-align: center; margin-top: 1.5rem; color: #1e293b; font-size: .76rem; }
  </style>
</head>
<body>
  <div class="bg-glow"></div>
  <div class="page">
    <header>
      <div class="eyebrow">🌐 Global Overview</div>
      <h1>Weather Dashboard</h1>
      <p class="subtitle">Current conditions for 5 cities worldwide</p>
    </header>

    <div class="grid">
      ${cards}
    </div>

    <div class="api-bar">
      <a class="api-link" href="/health">GET /health</a>
      <a class="api-link" href="/weather/London">GET /weather/:city</a>
      <a class="api-link" href="/forecast/London">GET /forecast/:city</a>
    </div>

    <footer>Mock data · seeded by city name · deterministic across requests</footer>
  </div>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
