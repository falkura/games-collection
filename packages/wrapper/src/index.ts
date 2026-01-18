import logoPNG from "./../assets/logo.png";

const wrapperRoot = window["wrapper"] as HTMLDivElement;

const png = document.createElement("img");
png.width = 100;
png.height = 100;
png.src = logoPNG;
wrapperRoot.appendChild(png);

const a = document.createElement("a");
a.href = "game1";
a.text = "Game 1";
wrapperRoot.appendChild(a);

console.log("Wrapper Loaded Successfully");
