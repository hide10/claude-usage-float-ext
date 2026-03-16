import ReactDOM from "react-dom/client";
import { PopupApp } from "./PopupApp";
import "./styles.css";

// Fix window size and apply zoom
const fixWindowSize = () => {
  const width = window.innerWidth;
  let zoomLevel = 1;

  // S: 240px, M: 280px, L: 340px
  if (width < 260) {
    zoomLevel = 0.7; // S
  } else if (width < 310) {
    zoomLevel = 0.82; // M
  }
  // else: zoomLevel = 1 (L)

  document.documentElement.style.zoom = `${zoomLevel}`;

  // Fix height to prevent resizing
  document.documentElement.style.height = "260px";
  document.body.style.height = "260px";
};

fixWindowSize();

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PopupApp />);
