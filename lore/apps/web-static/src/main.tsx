import { createRoot } from "react-dom/client";
import "../../web/app/globals.css";
import App from "./App";

if (!window.location.hash) window.location.hash = "/";

const el = document.getElementById("root");
if (el) createRoot(el).render(<App />);
