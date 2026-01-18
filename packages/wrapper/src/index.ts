// TODO loader needed
// import logoPNG from "./../assets/logo.png";

// const png = document.createElement("img");
// png.width = 100;
// png.height = 100;
// png.src = logoPNG;
// root.appendChild(png);

import "normalize.css";
import projectConfig from "../../../config.json";

import Engine from "@falkura-pet/engine";

Object.values(projectConfig.games.gamesList).forEach((game) => {
  if (game.enabled === false) return;

  const a = document.createElement("a");
  a.href = game.route || game.path;
  a.text = game.title;

  root.appendChild(a);
});

console.log("Wrapper Loaded Successfully");
