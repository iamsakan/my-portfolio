document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Active nav link on scroll
  const sectionIds = ['about', 'work', 'principles', 'contact'];
  const navAnchors = {};
  sectionIds.forEach(id => {
    const link = navLinks.querySelector(`a[href="#${id}"]`);
    if (link) navAnchors[id] = link;
  });
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const heroSection = document.getElementById('hero');

  const navIndicator = document.getElementById('navIndicator');
  function moveNavIndicator(link) {
    if (!navIndicator || !link) return;
    navIndicator.style.left = link.offsetLeft + 'px';
    navIndicator.style.width = link.offsetWidth + 'px';
  }
  function clearNavActive() {
    Object.values(navAnchors).forEach(a => a.classList.remove('active'));
    if (navIndicator) navIndicator.style.width = '0px';
  }

  if ('IntersectionObserver' in window && sections.length) {
    // Persistent state per target, since IntersectionObserver only reports
    // targets whose state *changed* in a given batch — reacting only to what's
    // in the current batch (rather than the full known state) is what let
    // "About" light up while the hero was still the one actually in view.
    let heroInView = true;
    const sectionInView = {};

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === heroSection) {
          heroInView = entry.isIntersecting;
        } else {
          sectionInView[entry.target.id] = entry.isIntersecting;
        }
      });

      if (heroInView) {
        clearNavActive();
        return;
      }
      const activeId = sectionIds.find(id => sectionInView[id]);
      if (activeId) {
        const link = navAnchors[activeId];
        Object.values(navAnchors).forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        moveNavIndicator(link);
      } else {
        clearNavActive();
      }
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(section => navObserver.observe(section));
    if (heroSection) navObserver.observe(heroSection);
  }

  window.addEventListener('resize', () => {
    const active = navLinks.querySelector('a.active');
    if (active) moveNavIndicator(active);
  });

  // Scroll reveal
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  // ---------- Terminal easter egg ----------
  (function () {
    const overlay = document.getElementById('eggOverlay');
    const output = document.getElementById('eggOutput');
    const input = document.getElementById('eggInput');
    const hintBtn = document.getElementById('eggHintBtn');
    let lastFocused = null;

    const commands = {
      whoami: 'anel — cs student in ljubljana. builds local-first tools that turn messy input into something usable.',
      principles: 'local-first · built for real people · don\u2019t trust free text · automate after, not instead of',
      help: 'commands: whoami, projects, principles, contact, clear',
      clear: null,
    };

    function print(text, cls) {
      const div = document.createElement('div');
      div.className = 'line' + (cls ? ' ' + cls : '');
      div.textContent = text;
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;
    }

    function printTyped(text, cls, onDone) {
      const div = document.createElement('div');
      div.className = 'line' + (cls ? ' ' + cls : '');
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;

      if (reduceMotion) {
        div.textContent = text;
        output.scrollTop = output.scrollHeight;
        if (onDone) onDone();
        return;
      }

      let i = 0;
      const step = () => {
        i++;
        div.textContent = text.slice(0, i);
        output.scrollTop = output.scrollHeight;
        if (i < text.length) {
          setTimeout(step, 14);
        } else if (onDone) {
          onDone();
        }
      };
      step();
    }

    // Links inside the terminal close the panel on click, so the page
    // underneath (which the overlay hides) is actually visible afterward.
    function makeEggLink(label, href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      a.className = 'egg-link';
      a.addEventListener('click', closeEgg);
      return a;
    }

    function printLink(label, href) {
      const div = document.createElement('div');
      div.className = 'line';
      div.appendChild(makeEggLink(label, href));
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;
    }

    function printTypedWithLink(text, linkLabel, href, cls) {
      const div = document.createElement('div');
      div.className = 'line' + (cls ? ' ' + cls : '');
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;

      function appendLink() {
        div.appendChild(document.createTextNode(' — see '));
        div.appendChild(makeEggLink(linkLabel, href));
        output.scrollTop = output.scrollHeight;
      }

      if (reduceMotion) {
        div.textContent = text;
        appendLink();
        return;
      }

      let i = 0;
      const step = () => {
        i++;
        div.textContent = text.slice(0, i);
        output.scrollTop = output.scrollHeight;
        if (i < text.length) {
          setTimeout(step, 14);
        } else {
          appendLink();
        }
      };
      step();
    }

    function runCommand(raw) {
      const cmd = raw.trim().toLowerCase().replace(/^\//, '');
      if (!cmd) return;
      print(cmd, 'cmd');
      if (cmd === 'clear') {
        output.innerHTML = '';
        return;
      }
      if (cmd === 'contact') {
        printTyped('reach me at', null, () => {
          printLink('anel.sakanovic77@gmail.com', 'mailto:anel.sakanovic77@gmail.com');
        });
        return;
      }
      if (cmd === 'projects') {
        printTypedWithLink(
          'local rag assistant · quizarena · order acknowledgement parser · flockbook',
          'work',
          '#work'
        );
        return;
      }
      if (Object.prototype.hasOwnProperty.call(commands, cmd)) {
        printTyped(commands[cmd]);
      } else {
        printTyped('command not found — try /help', 'err');
      }
    }

    function openEgg() {
      lastFocused = document.activeElement;
      overlay.classList.add('open');
      // Focus synchronously (no setTimeout) so mobile browsers treat this
      // as part of the user gesture and actually show the on-screen keyboard.
      input.focus();
      document.addEventListener('keydown', onEggKeydown);
    }

    function closeEgg() {
      overlay.classList.remove('open');
      input.blur();
      document.removeEventListener('keydown', onEggKeydown);
      // preventScroll matters here: a link inside the terminal (e.g. #work)
      // is about to navigate the page itself — returning focus shouldn't
      // fight that with a scroll of its own.
      if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
    }

    function onEggKeydown(e) {
      if (e.key === 'Escape') closeEgg();
    }

    document.addEventListener('keydown', (e) => {
      if (overlay.classList.contains('open')) return;
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '/') {
        e.preventDefault();
        openEgg();
      }
    });

    // Tap trigger for touch devices, which have no physical "/" key.
    hintBtn.addEventListener('click', openEgg);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        runCommand(input.value);
        input.value = '';
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeEgg();
    });
  })();