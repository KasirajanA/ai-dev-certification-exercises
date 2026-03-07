import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// TODO: Use Claude Code to build this weather API!
//
// Ask Claude:
// "Create three endpoints: GET /health, GET /weather/:city,
//  and GET /forecast/:city with mock weather data. Then add
//  a beautiful HTML dashboard at GET / showing weather for
//  5 cities in a responsive grid."

app.get("/", (_req, res) => {
  res.send("Weather API — use Claude Code to build me!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
