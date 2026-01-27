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

await Engine.initEngine();
await Engine.initUI();
await Engine.initWrapper(gamesMeta);

Engine.ui.screens.setScreen("wrapper_intro");
