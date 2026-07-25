// Behavior for the pre-rendered table of contents on post pages.
// The #toc / #toc-fab / #toc-overlay markup and every heading id are baked into
// the HTML at build time (build.mjs), so this script only wires up interaction:
// the mobile drawer toggle and scroll-spy active-section highlighting.
(function () {
  function setupDrawer(nav, fab, overlay) {
    fab.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      overlay.classList.toggle('open', isOpen);
      fab.setAttribute('aria-expanded', String(isOpen));
    });

    // Tapping a topic scrolls but leaves the drawer open; only an outside
    // click (the overlay) closes it.
    overlay.addEventListener('click', () => {
      nav.classList.remove('open');
      overlay.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
    });
  }

  function setupScrollSpy(headings, nav) {
    const linkByTargetId = new Map();
    nav.querySelectorAll('a[data-target-id]').forEach((a) => {
      linkByTargetId.set(a.dataset.targetId, a);
    });

    function setActive(id) {
      const link = linkByTargetId.get(id);
      if (!link) return;

      nav.querySelectorAll('a.active').forEach((a) => a.classList.remove('active'));
      nav.querySelectorAll('li.active-parent').forEach((li) => li.classList.remove('active-parent'));

      link.classList.add('active');

      const subList = link.closest('ul.toc-subtopics');
      if (subList && subList.parentElement) {
        subList.parentElement.classList.add('active-parent');
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((heading) => observer.observe(heading));
  }

  function init() {
    const nav = document.getElementById('toc');
    const fab = document.getElementById('toc-fab');
    const overlay = document.getElementById('toc-overlay');
    if (!nav || !fab || !overlay) return;

    const headings = Array.from(document.querySelectorAll('#content h2[id], #content h3[id]'));
    if (headings.length === 0) return;

    setupDrawer(nav, fab, overlay);
    setupScrollSpy(headings, nav);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
