// game/levels/level-10.js
// Level 10 — removed by user request (Triple Trials stuck bug)
// This stub immediately advances to Level 11.

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 10,
  view: 'v-L10',
  title: 'Triple Trials',
  type: 'trap',
  hint: '',

  build(el) {
    el.innerHTML = '';
    // Mark as complete and advance immediately
    if (window.STATE && window.STATE.completed) {
      window.STATE.completed.add('10');
    }
    setTimeout(() => {
      if (window.launchLevel) window.launchLevel(11);
    }, 100);
  }
});
