// pico_common.js

// loader
document.addEventListener('DOMContentLoaded', function() {
  setDomEvents();
});
// dom events
function setDomEvents() {
  const bar_help = document.getElementById('app-title-bar-help');
  bar_help.addEventListener('click', function() {
    toggleSplash(true);
  });
}

