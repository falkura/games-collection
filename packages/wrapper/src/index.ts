import logoPNG from "./../assets/logo.png";
// import { GamesList } from "./gamesLocal";

const wrapperRoot = window["wrapper"] as HTMLDivElement;

const png = document.createElement("img");
png.width = 100;
png.height = 100;
png.src = logoPNG;
wrapperRoot.appendChild(png);

const btn = document.createElement("button");
btn.innerText = "Load Game 1";
btn.onclick = () => {
  wrapperRoot.removeChild(btn);

  globalThis.loadGame1();
};
wrapperRoot.appendChild(btn);

console.log("Wrapper Loaded Successfully");

globalThis.loadGame = loadGame;
globalThis.loadGame1 = async () => {
  const game_module = await loadGame("/games/gameOne");
  const gameInstance = new game_module.Game();

  return gameInstance;
};

export async function loadGame(game: string) {
  // if (import.meta.env.DEV) {
  //   return GamesList[game]();
  // }

  return await import(`../../../dist/games/template`);
}
