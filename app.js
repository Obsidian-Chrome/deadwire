(() => {
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');

  if (toggle && nav) {
    const setExpanded = (expanded) => {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      nav.classList.toggle('is-open', expanded);
    };

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!expanded);
    });

    nav.querySelectorAll('[data-nav-link]').forEach((a) => {
      a.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 760px)').matches) setExpanded(false);
      });
    });
  }

  // Active nav link
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav__link').forEach((a) => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === current) a.classList.add('is-active');
  });

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealEls.forEach((el) => io.observe(el));
  }

  // Lightbox
  const lightboxTriggers = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (lightboxTriggers.length) {
    const ensureLightbox = () => {
      let root = document.querySelector('[data-lightbox-root]');
      if (root) return root;

      root = document.createElement('div');
      root.className = 'lightbox';
      root.setAttribute('data-lightbox-root', '');
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-label', "Visionneuse d'image");

      root.innerHTML = `
        <div class="lightbox__dialog" data-lightbox-dialog>
          <button class="lightbox__close" type="button" data-lightbox-close aria-label="Fermer">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
          <img class="lightbox__img" data-lightbox-img alt="" />
        </div>
      `;

      document.body.appendChild(root);
      return root;
    };

    const root = ensureLightbox();
    const dialog = root.querySelector('[data-lightbox-dialog]');
    const img = root.querySelector('[data-lightbox-img]');
    const closeBtn = root.querySelector('[data-lightbox-close]');

    const open = ({ src, alt }) => {
      img.src = src;
      img.alt = alt || '';
      root.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    const close = () => {
      root.classList.remove('is-open');
      document.body.style.overflow = '';
      img.removeAttribute('src');
      img.alt = '';
    };

    closeBtn.addEventListener('click', close);
    root.addEventListener('click', (e) => {
      if (e.target === root) close();
    });
    dialog.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.closest && t.closest('[data-lightbox-close]')) close();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root.classList.contains('is-open')) close();
    });

    lightboxTriggers.forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const imageEl = a.querySelector('img');
        const src = a.getAttribute('data-lightbox-src') || (imageEl ? imageEl.getAttribute('src') : '');
        const alt = a.getAttribute('data-lightbox-alt') || (imageEl ? imageEl.getAttribute('alt') : '');
        if (!src) return;
        open({ src, alt });
      });
    });
  }

})();
