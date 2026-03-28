import "@falkura-pet/shared/normalize/normalize.css";
import gamesMeta from "@gamesMeta";
import wrapperConfig from "../assets/wrapper.json";
import { Engine } from "@falkura-pet/engine";

declare global {
  const wrapper: HTMLDivElement;
}

Engine.initWrapper(gamesMeta);

document.getElementById("header-title")!.innerHTML = wrapperConfig.title;
document.getElementById("header-subtitle")!.innerHTML = wrapperConfig.subtitle;

wrapper.innerHTML = Object.values(gamesMeta)
  .map(
    (game) => `
      <div class="game-card">
        <div class="game-card-left">
          <div class="game-card-icon">
            <span class="material-symbols-outlined">games</span>
          </div>
          <div class="game-card-info">
            <h2 class="game-card-title">${game.title}</h2>
            <span class="game-card-meta">${game.version}</span>
          </div>
          <div class="game-card-description">${game.description}</div>
        </div>
        <button class="button-play" data-route="${game.route}">Play Now</button>
      </div>
    `,
  )
  .join("");

let game1 = wrapper.innerHTML;
for (let i = 0; i < 5; i++) {
  wrapper.innerHTML += game1;
}

document.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest(".button-play");
  if (!btn) return;

  window.location.href = btn.getAttribute("data-route")!;
});
