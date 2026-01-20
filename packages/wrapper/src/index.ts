// TODO loader needed
// import logoPNG from "./../assets/logo.png";

// const png = document.createElement("img");
// png.width = 100;
// png.height = 100;
// png.src = logoPNG;
// root.appendChild(png);

import "@falkura-pet/shared/normalize/normalize.css";

import gamesMeta from "@gamesMeta";

import Engine from "@falkura-pet/engine";

Object.entries(gamesMeta).map(([gamePath, data]) => {
  // @ts-ignore
  const { route, title } = data;
  const a = document.createElement("a");
  a.href = route || gamePath;
  a.text = title;

  root.appendChild(a);
});

Engine.initEngine();
Engine.initGame(gamesMeta);

console.log("Wrapper Loaded Successfully");
console.log(gamesMeta);
