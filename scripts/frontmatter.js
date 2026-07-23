// Renders a post's frontmatter into the page header.
// Fixed fields (title, subtitle, author) get dedicated slots; everything
// else — a nested `metadata:` block or stray top-level keys — is rendered
// as an info line, in the order it appears in the frontmatter.
(function () {
  // marked-hook-frontmatter writes this onto the data object itself (its
  // own opt-in namespacing control) on every parse — it isn't part of the
  // post's authored frontmatter, so it must never be rendered as metadata.
  const RESERVED_KEYS = new Set(['title', 'subtitle', 'matterDataPrefix']);

  function authorName(author) {
    if (typeof author === 'string') return author;
    return author?.name;
  }

  function addInfoLine(container, label, value) {
    if (value === null || value === undefined) return;

    const line = document.createElement('p');
    const b = document.createElement('b');
    b.textContent = `${label}:`;
    line.append(b, ` ${value}`);
    container.appendChild(line);
  }

  window.renderFrontmatter = function renderFrontmatter(data) {
    if (!data) return;

    if (data.title) {
      document.title = data.title;
      document.getElementById('title').textContent = data.title;
    }
    if (data.subtitle) {
      document.getElementById('subtitle').textContent = data.subtitle;
    }

    const information = document.getElementById('information');
    information.replaceChildren();

    for (const [key, value] of Object.entries(data)) {
      if (RESERVED_KEYS.has(key)) continue;

      if (key === 'author') {
        addInfoLine(information, 'by', authorName(value));
      } else if (key === 'metadata' && value && typeof value === 'object') {
        for (const [metaKey, metaValue] of Object.entries(value)) {
          addInfoLine(information, metaKey, metaValue);
        }
      } else {
        addInfoLine(information, key, value);
      }
    }
  };
})();
