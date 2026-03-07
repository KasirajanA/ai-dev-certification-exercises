# Module 0: Weather Dashboard API

**Exercise:** Build a Weather Dashboard API with Claude Code

## Setup

```bash
npm install
claude
```

## Your Task

Use Claude Code to build a weather dashboard API. Follow the exercise instructions in the certification platform (Module 0 → Unit 3 → "Hello Claude: Your First AI-Driven Task").

## Expected Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Returns `{ status: "ok", uptime: ... }` |
| `GET /weather/:city` | Returns mock weather data for a city |
| `GET /forecast/:city` | Returns 5-day mock forecast |
| `GET /` | HTML dashboard showing weather for 5 cities |

## Verify

```bash
npm start
# Then in another terminal:
curl http://localhost:3000/health
curl http://localhost:3000/weather/london
curl http://localhost:3000/forecast/tokyo
# Open http://localhost:3000 in your browser for the dashboard
```
