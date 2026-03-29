import "@falkura-pet/shared/normalize/normalize.css";
import gamesMeta from "@gamesMeta";
import wrapperConfig from "../assets/wrapper.json";
import { Engine } from "@falkura-pet/engine";

declare global {
  const wrapper: HTMLDivElement;
}

Engine.initEvents();
Engine.initWrapper(gamesMeta);

document.getElementById("header-title")!.innerHTML = wrapperConfig.title;
document.getElementById("header-subtitle")!.innerHTML = wrapperConfig.subtitle;

wrapper.innerHTML = Object.entries(gamesMeta)
  .map(([gameFolder, game]) => {
    const iconExt = game.icon
      ? game.icon.substring(game.icon.lastIndexOf("."))
      : ".png";
    return `
      <div class="game-card">
        <div class="game-card-left">
          <div class="game-card-icon">
            <img src="/icons/${gameFolder}${iconExt}" alt="${game.title}" />
          </div>
          <div class="game-card-info">
            <h2 class="game-card-title">${game.title}</h2>
            <span class="game-card-meta">${game.version}</span>
          </div>
          <div class="game-card-description">${game.description}</div>
        </div>
        <button class="button-play" data-route="${game.route}">Play Now</button>
      </div>
    `;
  })
  .join("");

document.addEventListener("click", (e) => {
  const button = (e.target as HTMLElement).closest(".button-play");
  if (!button) return;

  const route = button.getAttribute("data-route")!;

  Engine.events.ui.emit("wrapper:chose-game", route);
  window.location.href = route;
});
