(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const WHATSAPP_NUMBER = '917559411323';
  const RESORT_EMAIL = 'contact@seemaresort.in';
  // Public key from web3forms.com (delivers to RESORT_EMAIL). Safe to keep in front-end code.
  const WEB3FORMS_KEY = 'a557294a-9f1e-4645-b3a1-9b9c3a5671f0';

  /* ---------- Scroll reveal (crawler-safe progressive enhancement) ----------
     Content is never hidden by the static HTML/CSS. Only when <head> flagged this as a real,
     motion-friendly browser (html.motion) do we fade in blocks that start below the fold.
     Crawlers / headless tools / reduced-motion users skip this entirely and see everything
     at full opacity. A timed safety net also reveals everything if nobody interacts. */
  const REVEAL_FAILSAFE_MS = 5000;
  const revealTargets = $$('.room-card,.room-more,.slot-card,.amenity-card,.info-card,.g-tile,.section-head,.faq details,.stop,.rev-card');
  if (document.documentElement.classList.contains('motion') && 'IntersectionObserver' in window) {
    const pending = new Set();
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        pending.delete(entry.target);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    const showAll = () => {
      revealObserver.disconnect();
      pending.forEach((el) => el.classList.add('is-visible'));
      pending.clear();
    };
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    revealTargets.forEach((el) => {
      if (el.getBoundingClientRect().top < viewportH) return; // already on screen: never hide it
      const position = [...el.parentElement.children].indexOf(el);
      el.style.setProperty('--d', `${(position % 3) * 80}ms`);
      el.classList.add('reveal-wait');
      pending.add(el);
      revealObserver.observe(el);
    });
    // Safety net: no scroll / touch / key / click soon after load => reveal everything.
    const failsafe = setTimeout(showAll, REVEAL_FAILSAFE_MS);
    const userActive = () => clearTimeout(failsafe);
    ['scroll', 'wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((type) =>
      addEventListener(type, userActive, { once: true, passive: true }));
  }

  /* ---------- Footer year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header shadow once scrolled ---------- */
  const header = $('header.site');
  let scrollTicking = false;
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    scrollTicking = false;
  };
  addEventListener('scroll', () => {
    if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(updateHeader); }
  }, { passive: true });
  updateHeader();

  /* ---------- Mobile menu ---------- */
  const menuToggle = $('#menuToggle');
  const navLinks = $('#navLinks');
  const setMenu = (open) => {
    navLinks.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '\u2715' : '\u2630';
  };
  menuToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') && !e.target.closest('.nav')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) { setMenu(false); menuToggle.focus(); }
  });
  matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  if ($('#bookingForm')) {
  /* ---------- Booking form → WhatsApp / email ---------- */
  // Pre-select the room when arriving from a room card (contact-booking.html?room=Elite%20Room)
  const roomParam = new URLSearchParams(location.search).get('room');
  const roomSelect = $('#roomtype');
  if (roomParam && roomSelect && [...roomSelect.options].some((o) => o.value === roomParam)) roomSelect.value = roomParam;

  const form = $('#bookingForm');
  const checkin = $('#checkin');
  const checkout = $('#checkout');
  // Local-time YYYY-MM-DD (toISOString() is UTC and can be a day behind in India)
  const toDateValue = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  checkin.min = checkout.min = toDateValue(new Date());
  checkin.addEventListener('change', () => {
    if (!checkin.value) return;
    const nextDay = new Date(`${checkin.value}T00:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayValue = toDateValue(nextDay);
    checkout.min = nextDayValue;
    if (checkout.value && checkout.value <= checkin.value) checkout.value = nextDayValue;
    checkout.setCustomValidity('');
  });
  checkout.addEventListener('input', () => checkout.setCustomValidity(''));

  const statusEl = $('#formStatus');
  const emailBtn = $('#emailBtn');
  const phoneInput = $('#phone');
  phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.className = 'form-status';
    if (!/^\+?[0-9][0-9\s-]{8,14}$/.test(phoneInput.value.trim())) {
      phoneInput.setCustomValidity('Please enter a valid phone number.');
      phoneInput.reportValidity();
      return;
    }
    if (checkout.value <= checkin.value) {
      checkout.setCustomValidity('Check-out date must be after your check-in date.');
      checkout.reportValidity();
      return;
    }
    const value = (id, fallback = '') => $(`#${id}`).value.trim() || fallback;
    const name = value('name');
    const subject = `Booking Request - ${name}`;
    const body = [
      `Name: ${name}`,
      `Check-in: ${checkin.value}`,
      `Check-out: ${checkout.value}`,
      `Guests: ${value('guests')}`,
      `Phone: ${value('phone')}`,
      `Room preference: ${value('roomtype', 'Not specified')}`,
      `Notes: ${value('notes', '-')}`,
    ].join('\n');

    if (e.submitter && e.submitter.id === 'emailBtn') {
      if ($('#company').value) return; // honeypot filled: bot
      const label = emailBtn.textContent;
      emailBtn.disabled = true;
      emailBtn.textContent = 'Sending…';
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject,
            from_name: "Seema's Resort Website",
            replyto: RESORT_EMAIL,
            Name: name,
            'Check-in': checkin.value,
            'Check-out': checkout.value,
            Guests: value('guests'),
            Phone: value('phone'),
            'Room preference': value('roomtype', 'Not specified'),
            Notes: value('notes', '-'),
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Send failed');
        statusEl.textContent = "Thank you! We've received your request and will contact you shortly.";
        statusEl.classList.add('ok');
        form.reset();
      } catch (err) {
        statusEl.textContent = 'Sorry, we could not send that. Please use WhatsApp or call +91 75594 11323.';
        statusEl.classList.add('err');
      } finally {
        emailBtn.disabled = false;
        emailBtn.textContent = label;
      }
    } else {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`${subject}\n${body}`)}`, '_blank', 'noopener');
    }
  });

  }

  /* ---------- Room image carousels ---------- */
  $$('[data-carousel]').forEach((carousel) => {
    const track = $('.carousel-track', carousel);
    const slides = $$('img', track);
    const dotsWrap = $('.carousel-dots', carousel);

    if (slides.length < 2) { if (dotsWrap) dotsWrap.remove(); return; }

    let index = 0, direction = 1, timer = null, inView = false, paused = false;

    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show photo ${i + 1} of ${slides.length}`);
      dot.addEventListener('click', () => { goTo(i); restart(); });
      return dot;
    });
    dotsWrap.replaceChildren(...dots);

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, di) => {
        dot.classList.toggle('active', di === index);
        dot.setAttribute('aria-current', di === index ? 'true' : 'false');
      });
    }
    // Ping-pong: forward to the last photo, then back to the first
    function step() {
      if (index >= slides.length - 1) direction = -1;
      else if (index <= 0) direction = 1;
      goTo(index + direction);
    }
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { if (!timer && inView && !paused && !reduceMotion) timer = setInterval(step, 3000); };
    const restart = () => { stop(); start(); };

    // Pause while hovered / focused / being swiped
    const pause = () => { paused = true; stop(); };
    const resume = () => { paused = false; start(); };
    carousel.addEventListener('mouseenter', pause);
    carousel.addEventListener('mouseleave', resume);
    carousel.addEventListener('focusin', pause);
    carousel.addEventListener('focusout', resume);

    // Swipe on touch screens
    let touchX = null;
    carousel.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) { goTo(index + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });

    // Only animate while on screen; preload the other photos the first time it's seen
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) { slides.forEach((img) => { img.loading = 'eager'; }); start(); } else { stop(); }
    }, { threshold: 0.25 }).observe(carousel);

    goTo(0);
  });

  if ($('#revDialog')) {
  /* ---------- Guest reviews: long reviews open in a dialog ---------- */
  const dialog = $('#revDialog');
  const clampReview = (card) => {
    const quote = $('blockquote', card);
    let button = $('.rev-more', card);
    quote.classList.add('rev-clamp');
    const overflowing = quote.scrollHeight > quote.clientHeight + 1;

    if (overflowing && !button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'rev-more';
      button.textContent = 'See full review';
      button.addEventListener('click', () => {
        $('#revText').innerHTML = quote.innerHTML;
        $('#revName').textContent = $('figcaption strong', card).textContent;
        $('#revAv').textContent = $('.rev-av', card).textContent;
        dialog.showModal();
      });
      quote.insertAdjacentElement('afterend', button);
    } else if (!overflowing) {
      quote.classList.remove('rev-clamp');
      if (button) button.remove();
    }
  };
  const reviewCards = $$('.rev-card');
  const clampAll = () => reviewCards.forEach(clampReview);
  clampAll();
  addEventListener('load', clampAll);
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(clampAll, 150); });
  $('#revClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  }
})();
