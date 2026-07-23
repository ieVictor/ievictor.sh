// Dynamic left-side table of contents for post pages.
// Builds itself from whatever h2/h3 headings actually exist in #content,
// so it always mirrors the rendered page instead of a hand-maintained list.
(function () {
  function slugify(text) {
    const slug = text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug || 'section';
  }

  // marked-custom-heading-id only sets an id when the markdown uses `{#id}`.
  // Most headings won't have one, so make sure every heading we want to link
  // to actually has an anchorable id, without clobbering ids already in use.
  function ensureIds(headings) {
    const used = new Set();
    document.querySelectorAll('[id]').forEach((el) => used.add(el.id));

    headings.forEach((heading) => {
      if (heading.id) {
        used.add(heading.id);
        return;
      }
      const base = slugify(heading.textContent);
      let id = base;
      let n = 2;
      while (used.has(id)) {
        id = `${base}-${n++}`;
      }
      heading.id = id;
      used.add(id);
    });
  }

  // h2 -> topic, h3 -> subtopic nested under the closest preceding topic.
  function buildTree(headings) {
    const root = document.createElement('ul');
    let currentSubList = null;

    headings.forEach((heading) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${heading.id}`;
      a.textContent = heading.textContent;
      a.dataset.targetId = heading.id;
      li.appendChild(a);

      if (heading.tagName === 'H2') {
        li.classList.add('toc-topic');
        root.appendChild(li);
        currentSubList = null;
        return;
      }

      // H3 with no preceding H2: treat as a top-level entry.
      const parentTopicLi = root.lastElementChild;
      if (!parentTopicLi) {
        li.classList.add('toc-topic');
        root.appendChild(li);
        return;
      }

      if (!currentSubList) {
        currentSubList = document.createElement('ul');
        currentSubList.className = 'toc-subtopics';
        parentTopicLi.appendChild(currentSubList);
      }
      li.classList.add('toc-subtopic');
      currentSubList.appendChild(li);
    });

    return root;
  }

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

  window.buildToc = function buildToc() {
    const headings = Array.from(document.querySelectorAll('#content h2, #content h3'));
    if (headings.length === 0) return;

    ensureIds(headings);

    // Idempotent: drop any previous instance before rebuilding.
    document.getElementById('toc')?.remove();
    document.getElementById('toc-fab')?.remove();
    document.getElementById('toc-overlay')?.remove();

    const nav = document.createElement('nav');
    nav.id = 'toc';
    nav.setAttribute('aria-label', 'Table of contents');
    nav.appendChild(buildTree(headings));

    const fab = document.createElement('button');
    fab.id = 'toc-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Toggle table of contents');
    fab.setAttribute('aria-expanded', 'false');
    fab.textContent = '☰';

    const overlay = document.createElement('div');
    overlay.id = 'toc-overlay';

    document.body.append(nav, fab, overlay);

    setupDrawer(nav, fab, overlay);
    setupScrollSpy(headings, nav);
  };
})();
