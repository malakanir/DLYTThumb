import { UrlParser } from "../../modules/parser/UrlParser.js";
import { UIInjector } from "./uiInjector.js";

const injector = new UIInjector();
let lastProcessedVideoId = null;

function handlePageChange() {
  const currentUrl = window.location.href;
  const videoId = UrlParser.extractVideoId(currentUrl);

  if (!videoId) {
    injector.removeButton();
    lastProcessedVideoId = null;
    return;
  }

  if (videoId === lastProcessedVideoId) return;

  lastProcessedVideoId = videoId;
  const isShorts = UrlParser.isShorts(currentUrl);

  injector.inject(videoId, isShorts);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", handlePageChange);
} else {
  handlePageChange();
}

window.addEventListener("yt-navigate-finish", handlePageChange);

let previousUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== previousUrl) {
    previousUrl = location.href;
    handlePageChange();
  }
});

observer.observe(document.querySelector("head") || document.body, {
  childList: true,
  subtree: true,
});
