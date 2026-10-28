// sim-bridge.js — connects an app page to sim.html (phone frame + console + theme picker).
// Include it once in the app's <head>: <script src="sim-bridge.js"></script>
// Opened on its own (a real phone, an APK) the page has no parent frame and every call is a no-op.
// file:// pages cannot reach each other directly, so everything goes through postMessage.
(function () {
  "use strict";
  var hasParent = window.parent && window.parent !== window;
  function send(msg) { if (hasParent) window.parent.postMessage(msg, "*"); }

  // log("text") → one line in the simulator console. HTML is allowed: log("<b>buy</b> 50").
  window.log = function (msg) { send({ type: "log", msg: String(msg) }); };

  // simScreen("home") → console line "snapshot: screen home"; call it whenever the visible screen changes.
  window.simScreen = function (name) { send({ type: "snapshot", screen: name }); };

  // Uncaught errors land in the console in red, so a broken click is not silent.
  window.addEventListener("error", function (e) {
    send({ type: "error", msg: e.message + (e.filename ? " (" + e.filename.split("/").pop() + ":" + e.lineno + ")" : "") });
  });

  // onBack(fn) → fn runs when the phone's ◁ back button is pressed in the simulator.
  // What "back" means (previous screen, close a dialog, nothing) is the app's decision, as on Android.
  var backHandler = null;
  window.onBack = function (fn) { backHandler = fn; };

  // Messages from the simulator: theme picker → data-theme on this page; ◁ → onBack handler.
  window.addEventListener("message", function (e) {
    var m = e.data || {};
    if (m.type === "theme" && m.theme) document.documentElement.setAttribute("data-theme", m.theme);
    else if (m.type === "back") { if (backHandler) backHandler(); else send({ type: "back-unhandled" }); }
  });

  // Tell the simulator we are up; it answers with the current theme.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { send({ type: "ready" }); });
  else send({ type: "ready" });
})();
