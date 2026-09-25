# 3D Pong

A two-player Pong game rendered with Three.js. The paddles and ball use 3D geometry and textures, while the game is played on a single plane.

## How to play

- Player 1 moves with **W** and **S**.
- Player 2 moves with **↑** and **↓**.
- The first player to reach **3 points** wins. Use the restart button to play again.

The ball bounces off the top and bottom edges, speeds up after hitting a paddle, and resets to the centre after a point. The game also includes sound effects and adapts its camera and canvas size when the window changes.

## Run locally

Open `index.html` in a browser with WebGL support. If local file restrictions prevent textures or sounds from loading, serve the repository directory with a simple local server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`. The page loads Three.js from a CDN, so that script requires an internet connection.

## Files

- `index.html` – page and Three.js script entry point.
- `js/app.js` – scene setup, input, collisions and scoring.
- `res/textures/` and `res/sounds/` – local game assets.

`a.js` is an additional commented version of the game code; `index.html` uses `js/app.js`.
