import "@falkura-pet/shared/normalize/normalize.css";
import gamesMeta from "@gamesMeta";
import wrapperConfig from "../assets/wrapper.json";

const wrapper = document.getElementById("wrapper") as HTMLDivElement;

document.getElementById("header-title").innerHTML = wrapperConfig.title;
document.getElementById("header-subtitle").innerHTML = wrapperConfig.subtitle;

const sortedGames = Object.entries(gamesMeta).sort(([, a], [, b]) => {
  const ao = a.order ?? Number.NEGATIVE_INFINITY;
  const bo = b.order ?? Number.NEGATIVE_INFINITY;
  if (ao !== bo) return bo - ao;
  return a.title.localeCompare(b.title);
});

wrapper.innerHTML = sortedGames
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

  window.location.href = route;
});
