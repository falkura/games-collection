import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./theme.css";

export function mountUI() {
  createRoot(uiRoot).render(<App />);
}
