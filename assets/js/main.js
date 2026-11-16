// =========================================
// MIRZA BAKERY — Main JavaScript (GSAP)
// =========================================

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ---- Utility ----
const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);

// =========================================
// 1. CUSTOM CURSOR
// =========================================
const cursorDot = qs('#cursorDot');
const cursorRing = qs('#cursorRing');

let mouseX = 0, mouseY = 0;
let dotX = 0, dotY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  dotX += (mouseX - dotX) * 0.9;
  dotY += (mouseY - dotY) * 0.9;
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;

  if (cursorDot) {
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';
  }
  if (cursorRing) {
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Scale ring on hover
document.querySelectorAll('a, button, .product-card, .gallery-item').forEach(el => {
  el.addEventListener('mouseenter', () => {
    gsap.to(cursorRing, { scale: 1.8, opacity: 0.5, duration: 0.3 });
    gsap.to(cursorDot, { scale: 0.5, duration: 0.3 });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(cursorRing, { scale: 1, opacity: 1, duration: 0.3 });
    gsap.to(cursorDot, { scale: 1, duration: 0.3 });
  });
});

// =========================================
// 2. CANVAS PARTICLES (Floating Sprinkles)
// =========================================
const canvas = qs('#particles-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let particles = [];

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const PARTICLE_COLORS = ['#d97c8f', '#e8a3b3', '#f6efe6', '#9dbf9b', '#b9d4b6', '#f2d9de'];

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height + canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = -(Math.random() * 0.8 + 0.3);
    this.size = Math.random() * 3 + 1;
    this.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    this.opacity = Math.random() * 0.4 + 0.1;
    this.rotation = Math.random() * 360;
    this.rotSpeed = (Math.random() - 0.5) * 2;
    this.shape = Math.random() > 0.5 ? 'circle' : 'rect';
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    if (this.y < -20) this.reset();
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-this.size, -this.size / 2, this.size * 2, this.size);
    }
    ctx.restore();
  }
}

// Init particles
for (let i = 0; i < 80; i++) {
  const p = new Particle();
  p.y = Math.random() * canvas.width; // distribute initially
  particles.push(p);
}

function animateParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// =========================================
// 3. FLOATING PARTICLES IN HERO
// =========================================
const fpContainer = qs('#floatingParticles');
if (fpContainer) {
  for (let i = 0; i < 20; i++) {
    const fp = document.createElement('div');
    fp.classList.add('fp');
    const size = Math.random() * 8 + 3;
    fp.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]};
      opacity: ${Math.random() * 0.3 + 0.1};
      animation-duration: ${Math.random() * 10 + 8}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    fpContainer.appendChild(fp);
  }
}

// =========================================
// 4. PRELOADER
// =========================================
window.addEventListener('load', () => {
  const preloader = qs('#preloader');

  setTimeout(() => {
    gsap.to(preloader, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        preloader.style.display = 'none';
        startHeroAnimations();
      }
    });
  }, 2000);
});

// =========================================
// 5. HERO ANIMATIONS
// =========================================
function startHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 }, 0)
    .to('.hero-title', { opacity: 1, duration: 0.8 }, 0.2)
    .to('.hero-desc', { opacity: 1, y: 0, duration: 0.8 }, 0.4)
    .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, 0.6)
    .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8 }, 0.8);

  // Hero title split animation
  gsap.from('.hero-title-line', {
    y: 100,
    opacity: 0,
    duration: 1.2,
    delay: 0.5,
    ease: 'power4.out'
  });
  gsap.from('.hero-title-sub', {
    y: 60,
    opacity: 0,
    duration: 1,
    delay: 0.8,
    ease: 'power3.out'
  });

  // Count up stats
  setTimeout(animateStats, 1500);
}

// =========================================
// 6. STAT COUNTER ANIMATION
// =========================================
function animateStats() {
  const statNums = qsa('.stat-num');
  statNums.forEach(num => {
    const target = parseInt(num.getAttribute('data-target'));
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => { num.textContent = Math.floor(obj.val); }
    });
  });
}

// =========================================
// 7. NAVBAR SCROLL
// =========================================
const navbar = qs('#navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// =========================================
// 8. SCROLL REVEAL ANIMATIONS
// =========================================
// About section
gsap.from('.about-img-frame', {
  scrollTrigger: { trigger: '.about', start: 'top 70%' },
  x: -80, opacity: 0, duration: 1.2, ease: 'power3.out'
});
gsap.from('.about-text > *:not(.about-features)', {
  scrollTrigger: { trigger: '.about', start: 'top 70%' },
  y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out'
});
gsap.from('.feature-item', {
  scrollTrigger: { trigger: '.about-features', start: 'top 80%', once: true },
  x: -40, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', immediateRender: false
});

// Products section
gsap.from('.products-header > *', {
  scrollTrigger: { trigger: '.products-header', start: 'top 80%' },
  y: 40, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out'
});

// Product cards with 3D entrance
gsap.utils.toArray('.product-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: 'top 85%' },
    y: 80,
    opacity: 0,
    rotateX: 15,
    scale: 0.9,
    duration: 0.9,
    delay: (i % 3) * 0.1,
    ease: 'power3.out'
  });
});

// Gallery items
gsap.utils.toArray('.gallery-item').forEach((item, i) => {
  gsap.from(item, {
    scrollTrigger: { trigger: item, start: 'top 85%' },
    scale: 0.85,
    opacity: 0,
    duration: 0.8,
    delay: i * 0.08,
    ease: 'power3.out'
  });
});

// Contact section
gsap.from('.contact-info > *', {
  scrollTrigger: { trigger: '.contact', start: 'top 70%' },
  x: -60, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out'
});
gsap.from('.contact-form', {
  scrollTrigger: { trigger: '.contact', start: 'top 70%' },
  x: 60, opacity: 0, duration: 0.8, ease: 'power3.out'
});

// Experience strip
gsap.from('.exp-content > *', {
  scrollTrigger: { trigger: '.experience-strip', start: 'top 70%' },
  x: -60, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out'
});

// =========================================
// 9. HERO BACKGROUND IMAGE ROTATION
// =========================================
const heroCakeImages = [
  'assets/images/cake1.jpg',
  'assets/images/cake2.jpg',
  'assets/images/cake3.jpg',
  'assets/images/cake5.jpg',
  'assets/images/cake6.jpg'
];
let currentCakeIdx = 3; // matches initial hero background (cake5.jpg)
const heroBgSlides = qsa('.hero-bg-slide');

if (heroBgSlides.length >= 2) {
  let activeSlideIdx = 0;
  setInterval(() => {
    const currentSlide = heroBgSlides[activeSlideIdx];
    const nextSlide = heroBgSlides[1 - activeSlideIdx];
    const nextImg = new Image();
    nextImg.onload = () => {
      currentCakeIdx = (currentCakeIdx + 1) % heroCakeImages.length;
      nextSlide.style.backgroundImage = `url('${heroCakeImages[currentCakeIdx]}')`;
      nextSlide.classList.add('is-active');
      currentSlide.classList.remove('is-active');
      activeSlideIdx = 1 - activeSlideIdx;
    };
    nextImg.src = heroCakeImages[(currentCakeIdx + 1) % heroCakeImages.length];
  }, 5000);
}

// =========================================
// 10. 3D TILT on Product Cards
// =========================================
qsa('.product-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    gsap.to(card.querySelector('.product-card-inner'), {
      rotateX,
      rotateY,
      duration: 0.4,
      ease: 'power1.out',
      transformPerspective: 1200,
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card.querySelector('.product-card-inner'), {
      rotateX: 0, rotateY: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)'
    });
  });
});

// =========================================
// 11. CART SYSTEM
// =========================================
let cart = JSON.parse(localStorage.getItem('mirzaCart') || '[]');
const cartSidebar = qs('#cartSidebar');
const cartOverlay = qs('#cartOverlay');
const cartBtn = qs('#cartBtn');
const cartClose = qs('#cartClose');
const cartCount = qs('#cartCount');

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  if (cartCount) cartCount.textContent = total;
  const countEl = qs('#cartItemCount');
  if (countEl) countEl.textContent = total;
  localStorage.setItem('mirzaCart', JSON.stringify(cart));
}

function renderCartItems() {
  const cartItems = qs('#cartItems');
  const cartFooter = qs('#cartFooter');
  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛍️</div>
        <p>Your cart is empty</p>
        <a href="#products" class="btn-primary" onclick="closeCart()">Browse Cakes</a>
      </div>`;
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }

  if (cartFooter) cartFooter.style.display = 'block';

  let total = 0;
  cartItems.innerHTML = cart.map((item, idx) => {
    const sub = item.price * item.qty;
    total += sub;
    return `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${item.img}" alt="${item.name}"/></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty(${idx},-1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${idx},1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeItem(${idx})">✕</button>
      </div>`;
  }).join('');

  const totalEl = qs('#cartTotal');
  if (totalEl) totalEl.textContent = `Rs. ${total.toLocaleString()}`;
}

function addToCart(product) {
  // Check if user is logged in
  const user = localStorage.getItem('mirzaUser');
  if (!user) {
    // Save intended action
    localStorage.setItem('mirzaCartPending', JSON.stringify(product));
    // Show login prompt
    showLoginPrompt();
    return;
  }

  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCartCount();
  renderCartItems();
  showToast(`✦ ${product.name} added to cart!`);
  openCart();
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartCount();
  renderCartItems();
}
function removeItem(idx) {
  gsap.to('.cart-item', { opacity: 0, x: 20, duration: 0.3 });
  setTimeout(() => {
    cart.splice(idx, 1);
    updateCartCount();
    renderCartItems();
  }, 300);
}

function openCart() {
  cartSidebar?.classList.add('active');
  cartOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartSidebar?.classList.remove('active');
  cartOverlay?.classList.remove('active');
  document.body.style.overflow = '';
}

cartBtn?.addEventListener('click', openCart);
cartClose?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);

function proceedCheckout() {
  const user = localStorage.getItem('mirzaUser');
  if (!user) {
    closeCart();
    showLoginPrompt();
  } else {
    showToast('✦ Order placed successfully!');
    setTimeout(() => {
      cart = [];
      updateCartCount();
      renderCartItems();
      closeCart();
    }, 1500);
  }
}

// =========================================
// 12. LOGIN PROMPT (redirect to login)
// =========================================
function showLoginPrompt() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.85);
    z-index: 5000; display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(15px); opacity: 0;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: rgba(13,11,8,0.6); border: 1px solid rgba(217,124,143,0.25);
    border-radius: 24px; padding: 3rem 2.5rem; text-align: center; max-width: 420px;
    width: 90%; backdrop-filter: blur(30px);
    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
  `;
  box.innerHTML = `
    <div style="font-size:3rem;margin-bottom:1rem;">🛍️</div>
    <h3 style="font-family:'Cormorant Garamond',serif;font-size:2rem;color:#d97c8f;margin-bottom:0.5rem;font-weight:300;">Sign In Required</h3>
    <p style="color:#b8a98a;font-size:0.85rem;line-height:1.8;margin-bottom:2rem;">Please sign in to add items to your cart and place orders.</p>
    <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
      <a href="pages/login.html" style="
        background:linear-gradient(135deg,#d97c8f,#9dbf9b);color:#0d0b08;
        padding:0.9rem 2rem;border-radius:50px;text-decoration:none;
        font-size:0.75rem;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;
      ">Sign In</a>
      <a href="pages/signup.html" style="
        background:transparent;color:#d97c8f;
        padding:0.9rem 2rem;border-radius:50px;text-decoration:none;
        font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;
        border:1px solid rgba(217,124,143,0.25);
      ">Create Account</a>
    </div>
    <button onclick="this.closest('.mirza-login-prompt').remove()" style="
      background:none;border:none;color:#8b7f83;cursor:pointer;
      margin-top:1.5rem;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;
      display:block;width:100%;
    ">Maybe Later</button>
  `;
  overlay.classList.add('mirza-login-prompt');
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  gsap.to(overlay, { opacity: 1, duration: 0.3 });
  gsap.from(box, { y: 40, scale: 0.9, opacity: 0, duration: 0.5, ease: 'power3.out' });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => overlay.remove() });
    }
  });
}

// =========================================
// 13. QUICK VIEW MODAL
// =========================================
const modalOverlay = qs('#modalOverlay');
const modalClose = qs('#modalClose');
const modalInner = qs('#modalInner');

const productData = [
  { id:1, name:'Easter Bundt Cake', price:4500, img:'assets/images/cake1.jpg', category:'Festive Collection', rating:'★★★★★', desc:'Classic bundt cake with pastel sprinkles, easter eggs topping and luxurious white glaze drizzle. The perfect celebratory cake for any festive gathering.' },
  { id:2, name:'Marble Chocolate Bundt', price:5200, img:'assets/images/cake2.jpg', category:'Signature Series', rating:'★★★★★', desc:'Beautiful marbled vanilla and chocolate sponge with rich dark chocolate ganache coating. A timeless classic reinvented for the modern luxury palate.' },
  { id:3, name:'Red Velvet Supreme', price:5800, img:'assets/images/cake3.jpg', category:'Luxury Selection', rating:'★★★★★', desc:'Vibrant red velvet bundt with velvety cream cheese filling and snow-white glaze. A showstopper for any occasion.' },
  { id:4, name:'Classic Red Velvet Bundt', price:4800, img:'assets/images/cake4.png', category:'Classic Collection', rating:'★★★★☆', desc:'Our original red velvet recipe baked in the classic bundt form. Rich, moist and finished with a pure white glaze topping.' },
  { id:5, name:'Dark Chocolate Coconut', price:6200, img:'assets/images/cake5.jpg', category:'Exclusive Reserve', rating:'★★★★★', desc:'Decadent dark chocolate bundt with cascading chocolate ganache and artisan toasted coconut flakes. Our most indulgent creation.' },
  { id:6, name:'Chocolate Cream Filled', price:5500, img:'assets/images/cake6.jpg', category:'Signature Series', rating:'★★★★★', desc:'Moist chocolate sponge with luscious ricotta cream filling and silky caramel-chocolate drizzle. A heavenly combination of flavors.' }
];

qsa('.btn-quick-view').forEach((btn, i) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(i + 1);
  });
});

function openModal(id) {
  const p = productData.find(d => d.id === id);
  if (!p || !modalInner) return;
  modalInner.innerHTML = `
    <div class="modal-img">
      <img src="${p.img}" alt="${p.name}" style="filter:brightness(0.95) saturate(1.15) contrast(1.05);" />
    </div>
    <div class="modal-details">
      <div class="product-category">${p.category}</div>
      <h3 class="product-name">${p.name}</h3>
      <div class="product-rating">${p.rating}</div>
      <p class="product-desc">${p.desc}</p>
      <span class="product-price">Rs. ${p.price.toLocaleString()}</span>
      <button class="btn-primary btn-full" onclick="addToCart({id:${p.id},name:'${p.name}',price:${p.price},img:'${p.img}'});closeModal()">
        Add to Cart ✦
      </button>
    </div>`;
  modalOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalOverlay?.classList.remove('active');
  document.body.style.overflow = '';
}
modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// =========================================
// 14. TOAST
// =========================================
function showToast(msg) {
  const toast = qs('#toast');
  const toastMsg = qs('#toastMsg');
  if (!toast) return;
  if (toastMsg) toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// =========================================
// 15. CONTACT FORM
// =========================================
const contactForm = qs('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-primary');
    btn.textContent = 'Sending...';
    setTimeout(() => {
      btn.textContent = '✦ Message Sent!';
      showToast('✦ Message sent successfully!');
      contactForm.reset();
      setTimeout(() => { btn.textContent = 'Send Message ✦'; }, 3000);
    }, 1500);
  });
}

// =========================================
// 16. NAVBAR MOBILE
// =========================================
const hamburger = qs('#hamburger');
const navLinks = qs('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks?.classList.toggle('mobile-open');
    hamburger.classList.toggle('open');
  });
}

// =========================================
// 17. PARALLAX on Hero
// =========================================
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const heroContent = qs('.hero-content');
  if (heroContent) {
    gsap.set(heroContent, { y: scrolled * 0.3 });
  }
  const rings = qsa('.ring');
  rings.forEach((ring, i) => {
    gsap.set(ring, { y: scrolled * (0.1 + i * 0.05) });
  });
});

// =========================================
// 18. SECTION LABEL ANIMATION
// =========================================
gsap.utils.toArray('.section-label').forEach(label => {
  gsap.from(label, {
    scrollTrigger: { trigger: label, start: 'top 85%' },
    opacity: 0, x: -30, duration: 0.6, ease: 'power2.out'
  });
});
gsap.utils.toArray('.section-title').forEach(title => {
  gsap.from(title, {
    scrollTrigger: { trigger: title, start: 'top 85%' },
    opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', delay: 0.1
  });
});

// =========================================
// 19. MARQUEE HOVER PAUSE
// =========================================
const marqueeTrack = qs('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

// =========================================
// 20. NAVBAR USER STATE
// =========================================
function updateNavUser() {
  const user = JSON.parse(localStorage.getItem('mirzaUser') || 'null');
  const loginBtn = qs('.btn-nav-login');
  if (!loginBtn) return;

  if (user) {
    loginBtn.textContent = `✦ ${user.name.split(' ')[0]}`;
    loginBtn.href = '#';
    loginBtn.style.background = 'rgba(217,124,143,0.1)';

    // Add logout on click
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Sign out of Mirza Bakery?')) {
        localStorage.removeItem('mirzaUser');
        cart = [];
        updateCartCount();
        renderCartItems();
        loginBtn.textContent = 'Sign In';
        loginBtn.href = 'pages/login.html';
        loginBtn.style.background = '';
        showToast('✦ Signed out successfully');
      }
    });
  }
}

// =========================================
// 21. INIT ON LOAD
// =========================================
updateCartCount();
renderCartItems();
updateNavUser();

// Check pending cart item (after login redirect)
const pending = localStorage.getItem('mirzaCartPending');
if (pending && localStorage.getItem('mirzaUser')) {
  const item = JSON.parse(pending);
  localStorage.removeItem('mirzaCartPending');
  addToCart(item);
}

console.log('%c✦ Mirza Bakery', 'color:#d97c8f;font-size:2rem;font-family:serif;');
console.log('%cLuxury Artisan Cakes — Crafted with Passion', 'color:#b8a98a;font-size:0.9rem;');

