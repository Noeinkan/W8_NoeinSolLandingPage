(function () {
  'use strict';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pageLang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
  var isItalian = pageLang.indexOf('it') === 0;

  // ─── Fade-in observer (with staggered children) ───
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in, .slide-in-left').forEach(function (el) {
    observer.observe(el);
  });

  // ─── Stagger index on grid children ───
  var grids = document.querySelectorAll('.value-props, .services-grid, .testimonials-grid, .credentials-grid, .module-grid, .pain-grid, .case-studies-grid');
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

    // Handle hash on page load
    if (window.location.hash) {
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

  var heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas && window.innerWidth > 768 && !reducedMotion) {
    var ctx = heroCanvas.getContext('2d');
    var dots = [];
    var GRID = 25;
    var RADIUS = 300;
    var K = 0.045;
    var DAMPING = 0.5;
    var mouseX = -9999;
    var mouseY = -9999;

    function initDots() {
      dots = [];
      var w = heroCanvas.width = heroCanvas.offsetWidth;
      var h = heroCanvas.height = heroCanvas.offsetHeight;
      for (var x = GRID; x < w; x += GRID) {
        for (var y = GRID; y < h; y += GRID) {
          dots.push({ ox: x, oy: y, x: x, y: y, vx: 0, vy: 0 });
        }
      }
    }

    initDots();
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initDots, 200);
    });

    var heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', function (e) {
        var rect = heroCanvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      });
      heroSection.addEventListener('mouseleave', function () {
        mouseX = -9999;
        mouseY = -9999;
      });
    }

    function animateDots() {
      if (reducedMotion) return;
      ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        var dx = mouseX - d.ox;
        var dy = mouseY - d.oy;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < RADIUS && dist > 0) {
          var force = (RADIUS - dist) / RADIUS;
          d.vx -= (dx / dist) * force * 2;
          d.vy -= (dy / dist) * force * 2;
        }

        var sx = d.ox - d.x;
        var sy = d.oy - d.y;
        d.vx += sx * K;
        d.vy += sy * K;
        d.vx *= DAMPING;
        d.vy *= DAMPING;
        d.x += d.vx;
        d.y += d.vy;

        var displacement = Math.sqrt(sx * sx + sy * sy);
        var alpha = 0.10 + Math.min(displacement / 40, 0.12);
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,165,90,' + alpha.toFixed(2) + ')';
        ctx.fill();
      }
      requestAnimationFrame(animateDots);
    }
    requestAnimationFrame(animateDots);
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
  var calendlyWidget = document.querySelector('.calendly-inline-widget');
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
