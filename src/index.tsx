import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import { APP_VERSION } from './utils/version';

// Force reload if version changed (cache-buster)
if (localStorage.getItem('app_version') !== APP_VERSION) {
  localStorage.setItem('app_version', APP_VERSION);
  window.location?.reload(); // Bypass cache
}

const container = document.getElementById("root");

if (!container) {
    throw new Error("Root element not found");
}

const root = createRoot(container);

root.render(<App />);