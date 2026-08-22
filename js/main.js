(function () {
  'use strict';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pageLang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
  var isItalian = pageLang.indexOf('it') === 0;

  // Opt in to scroll-reveal only once the script is running, so a
  // JS failure leaves the content visible rather than blank.
  if (!reducedMotion) document.documentElement.classList.add('js-anim');

  // ─── Fade-in observer (with staggered children) ───
  // Reveal when intersecting OR when the element is already above the
  // viewport. The observer's first delivery is asynchronous, so a visitor
  // who scrolls immediately (or reloads at a restored scroll position, or
  // lands on a #hash) can pass a section before it ever activates — it then
  // never sees a threshold crossing and the section stays blank for good.
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in, .slide-in-left').forEach(function (el) {
    observer.observe(el);
  });

  // ─── Stagger index on grid children ───
  // Every multi-item grid on the site, so a row of cards arrives in sequence
  // rather than as one block. .services-grid, .testimonials-grid and
  // .case-studies-grid were in this list until their pages were removed; the
  // Builds, Services and trust-band grids that replaced them were never added,
  // so the newest pages were the only ones landing flat.
  var grids = document.querySelectorAll(
    '.value-props, .credentials-grid, .module-grid, .pain-grid, ' +
    '.offer-grid, .build-grid, .trust-band-grid, .recognition-grid, .step-flow'
  );
  grids.forEach(function (grid) {
    var children = grid.children;
    for (var i = 0; i < children.length; i++) {
      children[i].classList.add('stagger-child');
      children[i].style.setProperty('--i', i);
    }
  });

  // ─── Animated stat counters ───
  var statsAnimated = false;
  var statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        animateCounters();
      }
    });
  }, { threshold: 0.1 });

  var statsSection = document.querySelector('.stats');
  if (statsSection) statsObserver.observe(statsSection);

  function animateCounters() {
    document.querySelectorAll('.stat-number[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';

      if (reducedMotion) {
        el.textContent = prefix + target + suffix;
        return;
      }

      var duration = 1600;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = prefix + current + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target + suffix;
        }
      }
      requestAnimationFrame(step);
    });
  }

  // ─── Build-card screenshot rotation ───
  // Cards with more than one capture cross-fade through them. The research on
  // auto-rotating content is blunt about what makes it tolerable, and all of it
  // is enforced here:
  //   - nothing rotates on load under prefers-reduced-motion (WAI-ARIA APG);
  //   - a card stops while it is hovered, and stops for good once it has held
  //     keyboard focus — a reader who tabbed to it is reading, not watching;
  //   - one control stops every card (WCAG 2.2.2 Pause, Stop, Hide). It lives
  //     before the grid in the tab sequence, and it is the only mechanism the
  //     criterion needs — thirteen pause buttons would outweigh what they pause.
  // A card also only rotates while it is genuinely on screen, and its later
  // frames are fetched at that moment rather than on page load: a visitor who
  // never scrolls this far downloads one image per card, not four.
  // No aria-live region here, deliberately: with no next/previous controls
  // there is no user-driven slide change to announce, and a live region that
  // never fires is noise in the accessibility tree.
  var galleries = document.querySelectorAll('[data-gallery]');
  var rotationBtn = document.getElementById('buildRotation');
  if (galleries.length && 'IntersectionObserver' in window) {
    var FRAME_MS = 4200;
    var rotating = !reducedMotion;
    var cards = [];

    galleries.forEach(function (media, index) {
      var frames = media.querySelectorAll('.build-card-frame');
      var dots = media.querySelectorAll('.build-card-dot');
      var card = media.closest ? media.closest('.build-card') : media.parentNode;
      var current = 0;
      var timer = null;
      var kickoff = null;
      var onScreen = false;
      var hovered = false;
      var focusHeld = false;

      function load(n) {
        var frame = frames[n];
        if (frame && !frame.getAttribute('src')) {
          frame.setAttribute('src', frame.getAttribute('data-src'));
        }
      }

      function show(n) {
        frames[current].classList.remove('is-active');
        frames[current].setAttribute('aria-hidden', 'true');
        if (dots[current]) dots[current].classList.remove('is-active');
        current = n;
        frames[current].classList.add('is-active');
        frames[current].removeAttribute('aria-hidden');
        if (dots[current]) dots[current].classList.add('is-active');
        load((current + 1) % frames.length);
      }

      function advance() { show((current + 1) % frames.length); }

      function start() {
        if (timer || kickoff || !rotating || !onScreen || hovered || focusHeld) return;
        load((current + 1) % frames.length);
        // Stagger the first advance per card. Cards flipping in lockstep read
        // as a glitch rather than an effect, and two tiles changing at the same
        // instant is exactly the movement that draws the eye away from the copy.
        kickoff = setTimeout(function () {
          kickoff = null;
          advance();
          timer = setInterval(advance, FRAME_MS);
        }, 1200 + index * 1300);
      }

      function stop() {
        if (kickoff) { clearTimeout(kickoff); kickoff = null; }
        if (timer) { clearInterval(timer); timer = null; }
      }

      var entry = { start: start, stop: stop, unlock: function () { focusHeld = false; } };
      cards.push(entry);

      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) start();
        else stop();
      }, { threshold: 0.6 }).observe(media);

      if (card) {
        card.addEventListener('mouseenter', function () { hovered = true; stop(); });
        card.addEventListener('mouseleave', function () { hovered = false; start(); });
        card.addEventListener('focusin', function () { focusHeld = true; stop(); });
      }
    });

    function setRotating(on) {
      rotating = on;
      cards.forEach(function (card) {
        if (on) { card.unlock(); card.start(); } else { card.stop(); }
      });
      if (rotationBtn) {
        var label = rotationBtn.getAttribute(on ? 'data-label-stop' : 'data-label-start');
        rotationBtn.querySelector('.build-rotation-text').textContent = label;
        rotationBtn.classList.toggle('is-paused', !on);
      }
    }

    if (rotationBtn) {
      rotationBtn.hidden = false;
      setRotating(rotating);
      rotationBtn.addEventListener('click', function () { setRotating(!rotating); });
    }

    // A background tab should not be running timers or decoding frames.
    document.addEventListener('visibilitychange', function () {
      cards.forEach(function (card) {
        if (document.hidden) card.stop();
        else card.start();
      });
    });
  }

  // ─── Nav scroll behaviour ───
  var nav = document.querySelector('nav');
  var navToggle = document.querySelector('.nav-toggle');
  var navLinksEl = document.querySelector('.nav-links');

  window.addEventListener('scroll', function () {
    nav.classList.toggle('nav-scrolled', window.scrollY > 50);
    if (navLinksEl && navLinksEl.classList.contains('open')) {
      navLinksEl.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }, { passive: true });

  // ─── Active nav link by pathname ───
  var currentPath = window.location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';
  if (currentPath === '' || currentPath === '/') currentPath = 'index.html';

  document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var linkPage = href.replace(/^\.\//, '').split('#')[0] || 'index.html';
    if (linkPage === currentPath) {
      link.classList.add('nav-active');
    }
  });

  // ─── Hamburger toggle ───
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      navLinksEl.classList.toggle('open');
      navToggle.classList.toggle('active');
      var expanded = navToggle.classList.contains('active');
      navToggle.setAttribute('aria-expanded', expanded);
    });

    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinksEl.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ─── Smooth scroll for same-page anchors ───
  var scrollBehavior = reducedMotion ? 'auto' : 'smooth';
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      }
    });
  });

  // ─── Case study accordion ───
  function setCaseToggleState(button, expanded) {
    if (!button) return;
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (button.dataset.labelExpand && button.dataset.labelCollapse) {
      button.setAttribute('aria-label', expanded ? button.dataset.labelCollapse : button.dataset.labelExpand);
      return;
    }
    var currentLabel = button.getAttribute('aria-label') || '';
    if (isItalian) {
      button.setAttribute('aria-label', expanded ? currentLabel.replace('Espandi', 'Comprimi') : currentLabel.replace('Comprimi', 'Espandi'));
    } else {
      button.setAttribute('aria-label', expanded ? currentLabel.replace('Expand', 'Collapse') : currentLabel.replace('Collapse', 'Expand'));
    }
  }

  document.querySelectorAll('.case-card-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var card = this.closest('.case-card');
      var wasOpen = card.classList.contains('open');

      document.querySelectorAll('.case-card.open').forEach(function (c) {
        c.classList.remove('open');
        var button = c.querySelector('.case-card-toggle');
        setCaseToggleState(button, false);
      });

      if (!wasOpen) {
        card.classList.add('open');
        setCaseToggleState(this, true);
      }
    });
  });

  // ─── Contact form validation ───
  var contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    var errorSummary = document.getElementById('formErrorSummary');
    var searchParams = typeof URLSearchParams === 'function' ? new URLSearchParams(window.location.search) : null;
    var fieldLabels = isItalian
      ? { name: 'Nome', email: 'Email', service: 'Servizio', message: 'Messaggio' }
      : { name: 'Name', email: 'Email', service: 'Service', message: 'Message' };
    contactForm.addEventListener('submit', function (e) {
      var valid = true;
      var errorMessages = [];
      var requiredFields = contactForm.querySelectorAll('[required]');

      requiredFields.forEach(function (field) {
        field.style.borderColor = '';
        field.removeAttribute('aria-invalid');
        if (!field.value.trim()) {
          field.style.borderColor = '#c0392b';
          field.setAttribute('aria-invalid', 'true');
          errorMessages.push((fieldLabels[field.name] || field.name || (isItalian ? 'Campo' : 'Field')) + (isItalian ? ' è obbligatorio.' : ' is required.'));
          valid = false;
        }
        if (field.type === 'email' && field.value.trim()) {
          var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRe.test(field.value.trim())) {
            field.style.borderColor = '#c0392b';
            field.setAttribute('aria-invalid', 'true');
            errorMessages.push(isItalian ? 'Inserisci un indirizzo email valido.' : 'Please enter a valid email address.');
            valid = false;
          }
        }
      });

      if (!valid) {
        e.preventDefault();
        if (errorSummary) {
          errorSummary.style.display = 'block';
          errorSummary.textContent = (isItalian ? 'Correggi i seguenti campi: ' : 'Please fix the following: ') + errorMessages.join(' ');
        }
      } else if (errorSummary) {
        errorSummary.style.display = 'none';
        errorSummary.textContent = '';
      }
    });
  }

  // ─── Lead magnet success state + redirect to interactive checklist ───
  // Handles legacy landings on index.html?lead=iso19650. The current flow
  // redirects directly to /bep-checklist.html via the form's _next URL, but
  // this preserves a graceful path for any old bookmarks or cached links.
  var leadMagnetForm = document.querySelector('.lead-magnet-form');
  if (leadMagnetForm && window.location.search.indexOf('lead=iso19650') !== -1) {
    var leadSuccess = document.getElementById('leadMagnetSuccess');
    var leadDownloadLink = document.getElementById('leadMagnetDownloadLink');
    if (leadSuccess) leadSuccess.style.display = 'flex';
    var checklistUrl = leadDownloadLink ? leadDownloadLink.getAttribute('href') : (isItalian ? 'bep-checklist.html' : 'bep-checklist.html');
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setTimeout(function () {
      window.location.href = checklistUrl;
    }, 800);
  }

  // ─── Contact page tab switching ───
  var tabLinks = document.querySelectorAll('.contact-option-link[data-tab]');
  var tabTriggers = document.querySelectorAll('[data-tab]');
  if (tabTriggers.length) {
    var hasPrefilledContact = false;

    function switchTab(tabId) {
      document.querySelectorAll('.contact-tab').forEach(function (tab) {
        tab.classList.remove('contact-tab--active');
      });
      document.querySelectorAll('.contact-option-link').forEach(function (link) {
        link.classList.remove('active');
        link.setAttribute('aria-selected', 'false');
        link.setAttribute('tabindex', '-1');
      });
      var targetTab = document.getElementById(tabId);
      if (targetTab) targetTab.classList.add('contact-tab--active');
      document.querySelectorAll('[data-tab="' + tabId + '"]').forEach(function (link) {
        link.classList.add('active');
        link.setAttribute('aria-selected', 'true');
        link.setAttribute('tabindex', '0');
      });
      if (tabId === 'booking' && typeof window.initContactCalendlyEmbed === 'function') {
        window.initContactCalendlyEmbed();
      }
    }

    function prefillContactFromQuery() {
      if (!contactForm || !searchParams) return;

      var prefillService = searchParams.get('service');
      var prefillMessage = searchParams.get('prefill');
      var serviceField = contactForm.querySelector('[name="service"]');
      var messageField = contactForm.querySelector('[name="message"]');

      if (!prefillService && !prefillMessage) return;

      if (serviceField && prefillService) {
        var hasMatchingOption = Array.prototype.some.call(serviceField.options, function (option) {
          return option.value === prefillService;
        });
        if (hasMatchingOption) {
          serviceField.value = prefillService;
        }
      }

      if (messageField && prefillMessage && !messageField.value.trim()) {
        messageField.value = prefillMessage;
      }

      hasPrefilledContact = true;
      switchTab('message-panel');
    }

    tabTriggers.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var tabId = this.getAttribute('data-tab');
        switchTab(tabId);
        var target = document.getElementById(tabId);
        if (target) {
          target.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
        }
      });
    });

    tabLinks.forEach(function (link) {
      link.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var tabs = Array.prototype.slice.call(document.querySelectorAll('.contact-option-link'));
        var idx = tabs.indexOf(this);
        var nextIdx = e.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
        tabs[nextIdx].focus();
        tabs[nextIdx].click();
      });
    });

    prefillContactFromQuery();

    // Handle hash on page load
    if (!hasPrefilledContact && window.location.hash) {
      var hashId = window.location.hash.substring(1);
      if (hashId === 'message') hashId = 'message-panel';
      if (document.getElementById(hashId) && document.querySelector('[data-tab="' + hashId + '"]')) {
        switchTab(hashId);
      }
    }

    // ─── Contact form success state ───
    if (window.location.search.indexOf('sent=1') !== -1) {
      var successEl = document.getElementById('formSuccess');
      if (successEl) {
        successEl.style.display = 'flex';
        switchTab('message-panel');
      }
    }
  }

  // ─── Interactive dot-grid canvas (hero only, desktop only) ───
  // ─── Services jump-nav active state ───
  var serviceJumpLinks = document.querySelectorAll('.service-jump-link');
  if (serviceJumpLinks.length) {
    var updateActiveJumpLink = function () {
      var active = null;
      serviceJumpLinks.forEach(function (link) {
        var section = document.querySelector(link.getAttribute('href'));
        if (section && section.getBoundingClientRect().top <= 140) {
          active = link;
        }
      });
      serviceJumpLinks.forEach(function (link) { link.classList.remove('active'); });
      if (active) active.classList.add('active');
    };
    updateActiveJumpLink();
    window.addEventListener('scroll', updateActiveJumpLink, { passive: true });
  }


  // ─── FAQ accordion ───
  document.querySelectorAll('.faq-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var isOpen = item.classList.contains('faq-open');

      document.querySelectorAll('.faq-item.faq-open').forEach(function (openItem) {
        openItem.classList.remove('faq-open');
        openItem.querySelector('.faq-header').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('faq-open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ─── GA4 conversion event helpers ───
  function trackEvent(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }

  // Track primary CTA clicks
  document.querySelectorAll('.btn-primary').forEach(function (btn) {
    btn.addEventListener('click', function () {
      trackEvent('cta_click', { cta_text: btn.textContent.trim() });
    });
  });

  // Track Calendly widget load (contact page)
  var calendlyWidget = document.querySelector('.calendly-embed[data-calendly-url], .calendly-inline-widget');
  if (calendlyWidget) {
    window.addEventListener('message', function (e) {
      if (e.data && e.data.event && e.data.event.indexOf('calendly') === 0) {
        trackEvent('calendly_' + e.data.event.replace('calendly.', ''), {});
      }
    });
  }

  // Track form submissions (contact page)
  var contactFormEl = document.querySelector('.contact-form form');
  if (contactFormEl) {
    contactFormEl.addEventListener('submit', function () {
      trackEvent('form_submit', { form_name: 'contact' });
    });
  }
  var leadMagnetFormEl = document.querySelector('.lead-magnet-form');
  if (leadMagnetFormEl) {
    leadMagnetFormEl.addEventListener('submit', function () {
      trackEvent('form_submit', { form_name: 'lead_magnet_iso19650' });
      var leadDirectLink = document.getElementById('leadMagnetDownloadLink');
      if (leadDirectLink) leadDirectLink.click();
    });
  }

  // ─── Exit-intent overlay ───
  var exitOverlay = document.getElementById('exitOverlay');
  if (exitOverlay && !sessionStorage.getItem('exit_shown') && !reducedMotion && window.innerWidth > 1024) {
    var exitShown = false;
    var exitIntentReady = false;
    setTimeout(function () { exitIntentReady = true; }, 12000);

    function showExitOverlay() {
      if (exitShown) return;
      exitShown = true;
      sessionStorage.setItem('exit_shown', '1');
      exitOverlay.classList.add('exit-overlay--visible');
      trackEvent('exit_intent_shown', {});
    }

    function hideExitOverlay() {
      exitOverlay.classList.remove('exit-overlay--visible');
    }

    document.addEventListener('mouseleave', function (e) {
      var scrollRatio = (window.scrollY + window.innerHeight) / Math.max(document.body.scrollHeight, 1);
      if (exitIntentReady && e.clientY < 10 && scrollRatio > 0.35) showExitOverlay();
    });

    var closeBtn = document.getElementById('exitOverlayClose');
    var dismissBtn = document.getElementById('exitOverlayDismiss');
    if (closeBtn) closeBtn.addEventListener('click', hideExitOverlay);
    if (dismissBtn) dismissBtn.addEventListener('click', hideExitOverlay);

    exitOverlay.addEventListener('click', function (e) {
      if (e.target === exitOverlay) hideExitOverlay();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideExitOverlay();
    });
  }

  // ─── Sticky mobile CTA ───
  var stickyCta = document.getElementById('stickyCta');
  if (stickyCta && !sessionStorage.getItem('sticky_cta_dismissed')) {
    var hero = document.querySelector('.hero');
    if (hero) {
      var stickyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            stickyCta.classList.add('sticky-cta--visible');
          } else {
            stickyCta.classList.remove('sticky-cta--visible');
          }
        });
      }, { threshold: 0 });
      stickyObserver.observe(hero);
    }

    var stickyClose = document.getElementById('stickyCtaClose');
    if (stickyClose) {
      stickyClose.addEventListener('click', function () {
        stickyCta.classList.remove('sticky-cta--visible');
        stickyCta.style.display = 'none';
        sessionStorage.setItem('sticky_cta_dismissed', '1');
      });
    }
  }

})();
