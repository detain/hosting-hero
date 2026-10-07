import { createApp } from "vue";
import App from "./App.vue";
import { installHueVars } from "./chrome/hueVars";
import "./chrome/styles/era-tokens.css";
import "./chrome/styles/chrome.css";

installHueVars(document); // HUE_LEDGER → :root --hh-hue-* vars, applied once before mount
createApp(App).mount("#app");
