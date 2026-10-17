/* ============================================================
   PALAK BIRTHDAY — script.js  v4  (Mobile-First)
   ============================================================ */

/* ── Petal Canvas — lighter on mobile ── */
(function () {
  const canvas = document.getElementById('petal-canvas');
  const ctx    = canvas.getContext('2d');
  let particles = [];
  const isMobile = () => window.innerWidth < 800;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function spawn() {
    const r = Math.random();
    return {
      x:        Math.random() * canvas.width,
      y:        canvas.height + 10,
      size:     r < 0.6 ? Math.random() * 1.6 + 0.5 : Math.random() * 2.5 + 1,
      type:     r < 0.6 ? 'dot' : 'diamond',
      speedY:   Math.random() * 0.5 + 0.2,
      speedX:   (Math.random() - 0.5) * 0.3,
      opacity:  Math.random() * 0.4 + 0.12,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.5,
      hue:      Math.random() < 0.7 ? 270 + Math.random() * 30 : 330 + Math.random() * 15,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cap = isMobile() ? 40 : 80;
    if (particles.length < cap && Math.random() < 0.2) particles.push(spawn());

    particles = particles.filter(p => {
      p.y -= p.speedY; p.x += p.speedX; p.rotation += p.rotSpeed;
      if (p.y < -10) return false;
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = `hsl(${p.hue}, 68%, 74%)`;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      if (p.type === 'dot') {
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
      } else {
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s); ctx.lineTo(s * 0.6, 0);
        ctx.lineTo(0, s);  ctx.lineTo(-s * 0.6, 0);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      return true;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── Slider with touch swipe ── */
const slides  = document.querySelectorAll('.slide');
const thumbs  = document.querySelectorAll('.thumb');
const dots    = document.querySelectorAll('.s-dot');
const counter = document.getElementById('s-counter');
const sliderEl= document.getElementById('slider');
let current   = 0;
let autoTimer;

function goTo(n) {
  slides[current].classList.remove('active');
  thumbs[current].classList.remove('active-thumb');
  dots[current].classList.remove('active');

  current = (n + slides.length) % slides.length;

  slides[current].classList.add('active');
  thumbs[current].classList.add('active-thumb');
  dots[current].classList.add('active');
  counter.textContent = `${current + 1} / ${slides.length}`;

  // Re-trigger caption animation
  const cap = slides[current].querySelector('.slide-caption');
  cap.style.animation = 'none';
  void cap.offsetWidth;
  cap.style.animation = '';

  // Scroll active thumb into view
  thumbs[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function resetAuto() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => goTo(current + 1), 4200);
}

// Arrow buttons
document.getElementById('s-prev').addEventListener('click', () => { goTo(current - 1); resetAuto(); });
document.getElementById('s-next').addEventListener('click', () => { goTo(current + 1); resetAuto(); });

// Thumbnail clicks
thumbs.forEach(t => t.addEventListener('click', () => { goTo(+t.dataset.i); resetAuto(); }));

// Dot clicks
dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.i); resetAuto(); }));

// ── Touch swipe on slider ──
let touchStartX = 0;
let touchStartY = 0;
let isSwiping   = false;

sliderEl.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  isSwiping   = false;
}, { passive: true });

sliderEl.addEventListener('touchmove', e => {
  const dx = e.touches[0].clientX - touchStartX;
  const dy = e.touches[0].clientY - touchStartY;
  // Only treat as horizontal swipe if mostly horizontal
  if (!isSwiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
    isSwiping = true;
  }
}, { passive: true });

sliderEl.addEventListener('touchend', e => {
  if (!isSwiping) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) {
    dx < 0 ? goTo(current + 1) : goTo(current - 1);
    resetAuto();
  }
  isSwiping = false;
});

// Init
thumbs[0].classList.add('active-thumb');
dots[0].classList.add('active');
resetAuto();

/* ── Lightbox — tap on slide image or thumb double-tap ── */
const lb      = document.getElementById('lightbox');
const lbImg   = document.getElementById('lb-img');
const lbClose = document.getElementById('lb-close');

function openLightbox(src) {
  lbImg.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lb.classList.remove('open');
  // Only restore body scroll if modal isn't open
  if (!document.getElementById('modal-overlay').classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

// Double-tap / dblclick on slide image
slides.forEach(s => {
  let lastTap = 0;
  s.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastTap < 300) openLightbox(s.querySelector('img').src);
    lastTap = now;
  });
});

// Double-tap / dblclick on thumbnails
thumbs.forEach(t => {
  let lastTap = 0;
  t.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastTap < 300) openLightbox(t.querySelector('img').src);
    lastTap = now;
  });
});

lbClose.addEventListener('click', closeLightbox);
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

// Swipe down on lightbox to close (mobile)
let lbTouchY = 0;
lb.addEventListener('touchstart', e => { lbTouchY = e.touches[0].clientY; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dy = e.changedTouches[0].clientY - lbTouchY;
  if (dy > 80) closeLightbox();
});

/* ── Modal ── */
const overlay = document.getElementById('modal-overlay');
const openBtn = document.getElementById('open-btn');
const closeBtn= document.getElementById('modal-close');

function openModal() {
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  lb.classList.remove('open');
}

openBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

/* ── Booklet ── */
const bookletOverlay  = document.getElementById('booklet-overlay');
const cardOpenBtn     = document.getElementById('card-open-btn');
const bookletCloseBtn = document.getElementById('booklet-close');
const bookMsgEl       = document.getElementById('book-msg');
let   bookTyped       = false;

const bookText =
`Happy 18th Birthday, Palak!

You are truly one of the most genuine souls I have ever met. Real, honest, and grounded — that kind of authenticity is rare, and it is something very special about you.

Turning 18 is a big step, and this is where your real journey begins. Always keep pushing forward, work hard, and stay completely focused on the things you want to achieve in life. Put in the effort, stay consistent, and chase your goals without hesitation. When you dedicate your focus and energy to what you truly want, there is nothing that can stop you.

Never settle for anything less than your potential. Go build your dreams, stay driven, and make every single day count.

As your genuine well-wisher, I truly wish you endless success, good health, and all the great achievements you deserve.

Happy 18th Birthday! Keep working hard and stay true to yourself.

— Your genuine well-wisher 🤝`;



function openBooklet() {
  bookletOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Reset scroll-hint visibility
  const hint = document.getElementById('scroll-hint');
  if (hint) hint.classList.remove('hidden');

  if (!bookTyped) {
    bookTyped = true;
    let bi = 0;
    setTimeout(function typeBook() {
      if (bi < bookText.length) {
        bookMsgEl.textContent += bookText[bi++];
        setTimeout(typeBook, 20);
      }
    }, 600);
  }
}
function closeBooklet() {
  bookletOverlay.classList.remove('open');
  if (!overlay.classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

cardOpenBtn.addEventListener('click', openBooklet);
bookletCloseBtn.addEventListener('click', closeBooklet);
bookletOverlay.addEventListener('click', e => { if (e.target === bookletOverlay) closeBooklet(); });

// Hide scroll-hint once user scrolls the right page
const bookRightPage = document.getElementById('book-right-page');
if (bookRightPage) {
  bookRightPage.addEventListener('scroll', () => {
    const hint = document.getElementById('scroll-hint');
    if (hint && bookRightPage.scrollTop > 10) hint.classList.add('hidden');
  }, { passive: true });
}

// Swipe down to close booklet on mobile (only when at top)
let bookTouchY = 0;
bookletOverlay.addEventListener('touchstart', e => {
  bookTouchY = e.touches[0].clientY;
}, { passive: true });
bookletOverlay.addEventListener('touchend', e => {
  const dy = e.changedTouches[0].clientY - bookTouchY;
  if (dy > 80 && e.target === bookletOverlay) closeBooklet();
});

// Global ESC key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeBooklet();
    closeModal();
  }
});


