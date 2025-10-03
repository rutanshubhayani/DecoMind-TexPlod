// TEXplods Home Decor - Interactivity
let products = [];
let API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'https://decomind-texplod.onrender.com'
  : 'https://decomind-texplod.onrender.com'; // Replace this with your deployed backend URL
try {
  const qp = new URLSearchParams(location.search);
  const override = qp.get('api');
  if (override) API_BASE = override;
} catch {}

const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const priceRange = document.getElementById('priceRange');
const priceValue = document.getElementById('priceValue');
const sortSelect = document.getElementById('sortSelect');
const wishlistCount = document.getElementById('wishlistCount');
const cartCount = document.getElementById('cartCount');
const wishlistBtn = document.getElementById('wishlistBtn');
const cartBtn = document.getElementById('cartBtn');
const overlay = document.getElementById('overlay');
const wishlistDrawer = document.getElementById('wishlistDrawer');
const cartDrawer = document.getElementById('cartDrawer');
const wishlistList = document.getElementById('wishlistList');
const cartList = document.getElementById('cartList');
const clearWishlistBtn = document.getElementById('clearWishlist');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartTotalEl = document.getElementById('cartTotal');
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');
const yearSpan = document.getElementById('year');

let wishlist = new Set();
let cart = new Set();

function saveState() {
  try {
    localStorage.setItem('texplods_wishlist', JSON.stringify([...wishlist]));
    localStorage.setItem('texplods_cart', JSON.stringify([...cart]));
  } catch {}
}

function loadState() {
  try {
    const w = JSON.parse(localStorage.getItem('texplods_wishlist') || '[]');
    const c = JSON.parse(localStorage.getItem('texplods_cart') || '[]');
    if (Array.isArray(w)) wishlist = new Set(w.map(Number).filter(Boolean));
    if (Array.isArray(c)) cart = new Set(c.map(Number).filter(Boolean));
  } catch {}
}

function renderProducts(items) {
  productGrid.innerHTML = '';
  const fragment = document.createDocumentFragment();
  items.forEach((p) => {
    const li = document.createElement('article');
    li.className = 'card';
    li.setAttribute('role', 'listitem');
    li.innerHTML = `
      <div class="card-media">
        <img src="${p.image}" alt="${p.name}" loading="lazy"/>
        <span class="card-badge">${p.badge}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${p.name}</h3>
        <div class="card-meta">
          <span class="price">$${p.price}</span>
          <span>${formatCategory(p.category)}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-add" data-id="${p.id}">Add to Cart</button>
          <button class="btn-icon btn-wish" data-id="${p.id}" aria-label="Add to wishlist">❤</button>
          <button class="btn-icon btn-details" data-id="${p.id}" aria-label="View details">ℹ️</button>
        </div>
      </div>
    `;
    fragment.appendChild(li);
  });
  productGrid.appendChild(fragment);
}

function formatCategory(key) {
  return ({ 'wall-art': 'Wall Art' }[key]) || key[0].toUpperCase() + key.slice(1);
}

function getFilteredSortedProducts() {
  const query = (searchInput.value || '').toLowerCase().trim();
  const cat = categorySelect.value;
  const maxPrice = Number(priceRange.value);
  const sort = sortSelect.value;
  let list = products.filter((p) => (
    (cat === 'all' || p.category === cat) &&
    p.price <= maxPrice &&
    (p.name.toLowerCase().includes(query) || formatCategory(p.category).toLowerCase().includes(query))
  ));

  if (sort === 'price-asc') list.sort((a,b)=> a.price - b.price);
  else if (sort === 'price-desc') list.sort((a,b)=> b.price - a.price);
  else if (sort === 'name-asc') list.sort((a,b)=> a.name.localeCompare(b.name));

  return list;
}

function updateCounts() {
  wishlistCount.textContent = wishlist.size;
  cartCount.textContent = cart.size;
}

function attachGridHandlers() {
  productGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = Number(btn.getAttribute('data-id'));
    if (!id) return;
    if (btn.classList.contains('btn-wish')) {
      if (wishlist.has(id)) { wishlist.delete(id); } else { wishlist.add(id); }
      updateCounts();
      saveState();
      btn.classList.toggle('active');
      renderWishlist();
    } else if (btn.classList.contains('btn-add')) {
      if (cart.has(id)) { cart.delete(id); } else { cart.add(id); }
      updateCounts();
      saveState();
      btn.textContent = cart.has(id) ? 'Remove' : 'Add to Cart';
      renderCart();
    } else if (btn.classList.contains('btn-details')) {
      const item = products.find(p => p.id === id);
      if (item) alert(`${item.name}\n\nCategory: ${formatCategory(item.category)}\nPrice: $${item.price}`);
    }
  });
}

function attachFilterHandlers() {
  const trigger = () => renderProducts(getFilteredSortedProducts());
  searchInput.addEventListener('input', debounce(trigger, 120));
  categorySelect.addEventListener('change', trigger);
  priceRange.addEventListener('input', () => { priceValue.textContent = priceRange.value; trigger(); });
  sortSelect.addEventListener('change', trigger);
}

function debounce(fn, delay) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), delay);
  };
}

function attachNavHandlers() {
  navToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

function openDrawer(target) {
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('open'));
  target.classList.add('open');
  target.setAttribute('aria-hidden', 'false');
}

function closeDrawers() {
  overlay.classList.remove('open');
  setTimeout(() => { overlay.hidden = true; }, 200);
  [wishlistDrawer, cartDrawer].forEach(d => { d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); });
}

function attachDrawerHandlers() {
  wishlistBtn.addEventListener('click', () => { renderWishlist(); openDrawer(wishlistDrawer); });
  cartBtn.addEventListener('click', () => { renderCart(); openDrawer(cartDrawer); });
  overlay.addEventListener('click', closeDrawers);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawers(); });
  document.querySelectorAll('[data-drawer-close]').forEach(btn => btn.addEventListener('click', closeDrawers));

  clearWishlistBtn.addEventListener('click', () => { wishlist.clear(); updateCounts(); renderWishlist(); syncWishlistButtons(); saveState(); });
  clearCartBtn.addEventListener('click', () => { cart.clear(); updateCounts(); renderCart(); syncCartButtons(); saveState(); });
  checkoutBtn.addEventListener('click', () => { location.href = 'checkout.html' + (location.search || ''); });
}

function renderWishlist() {
  wishlistList.innerHTML = '';
  if (wishlist.size === 0) {
    wishlistList.innerHTML = '<li class="muted">No items saved yet.</li>';
    return;
  }
  const fragment = document.createDocumentFragment();
  [...wishlist].map(id => products.find(p => p.id === id)).forEach(p => {
    if (!p) return;
    const li = document.createElement('li');
    li.className = 'drawer-item';
    li.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${formatCategory(p.category)} • $${p.price}</div>
      </div>
      <div class="actions">
        <button class="btn-icon" data-remove-wish="${p.id}">✕</button>
        <button class="btn" data-move-to-cart="${p.id}">Add to Cart</button>
      </div>
    `;
    fragment.appendChild(li);
  });
  wishlistList.appendChild(fragment);

  wishlistList.addEventListener('click', onWishlistListClick);
}

function onWishlistListClick(e) {
  const removeId = e.target.getAttribute('data-remove-wish');
  const moveId = e.target.getAttribute('data-move-to-cart');
  if (removeId) {
    wishlist.delete(Number(removeId));
    updateCounts();
    renderWishlist();
    syncWishlistButtons();
    saveState();
  } else if (moveId) {
    const id = Number(moveId);
    wishlist.delete(id);
    cart.add(id);
    updateCounts();
    renderWishlist();
    renderCart();
    syncWishlistButtons();
    syncCartButtons();
    saveState();
  }
}

function renderCart() {
  cartList.innerHTML = '';
  if (cart.size === 0) {
    cartList.innerHTML = '<li class="muted">Your cart is empty.</li>';
    cartTotalEl.textContent = '$0';
    return;
  }
  const fragment = document.createDocumentFragment();
  let total = 0;
  [...cart].map(id => products.find(p => p.id === id)).forEach(p => {
    if (!p) return;
    total += p.price;
    const li = document.createElement('li');
    li.className = 'drawer-item';
    li.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${formatCategory(p.category)} • $${p.price}</div>
      </div>
      <div class="actions">
        <button class="btn-icon" data-remove-cart="${p.id}">✕</button>
      </div>
    `;
    fragment.appendChild(li);
  });
  cartList.appendChild(fragment);
  cartTotalEl.textContent = `$${total}`;

  cartList.addEventListener('click', onCartListClick);
}

function onCartListClick(e) {
  const removeId = e.target.getAttribute('data-remove-cart');
  if (removeId) {
    cart.delete(Number(removeId));
    updateCounts();
    renderCart();
    syncCartButtons();
    saveState();
  }
}

function syncWishlistButtons() {
  document.querySelectorAll('.btn-wish').forEach(btn => {
    const id = Number(btn.getAttribute('data-id'));
    if (!id) return;
    btn.classList.toggle('active', wishlist.has(id));
  });
}

function syncCartButtons() {
  document.querySelectorAll('.btn-add').forEach(btn => {
    const id = Number(btn.getAttribute('data-id'));
    if (!id) return;
    btn.textContent = cart.has(id) ? 'Remove' : 'Add to Cart';
  });
}

function attachNewsletterHandler() {
  const form = document.getElementById('newsletterForm');
  const email = document.getElementById('emailInput');
  const msg = document.getElementById('newsletterMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      msg.textContent = 'Please enter a valid email.';
      msg.style.color = 'var(--danger)';
      email.focus();
      return;
    }
    fetch(`${API_BASE}/api/newsletter`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.value }) })
      .then(r => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
      .then(() => {
        msg.textContent = 'Thanks! Check your inbox for a confirmation.';
        msg.style.color = 'var(--brand)';
        email.value = '';
      })
      .catch(() => {
        msg.textContent = 'Subscription failed. Try again later.';
        msg.style.color = 'var(--danger)';
      });
  });
}

function normalizeImageUrl(src) {
  if (!src) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return `${API_BASE}${src}`;
  return src;
}

function init() {
  yearSpan.textContent = new Date().getFullYear();
  priceValue.textContent = priceRange.value;
  loadState();
  attachGridHandlers();
  attachFilterHandlers();
  attachNavHandlers();
  attachDrawerHandlers();
  attachNewsletterHandler();
  fetch(`${API_BASE}/api/products?t=${Date.now()}`, { cache: 'no-store' })
    .then(r => r.json()).then((data) => {
    products = Array.isArray(data) ? data.map((p) => ({ ...p, price: Number(p.price), image: normalizeImageUrl(p.image) })) : [];
    const maxSeen = products.reduce((m, p) => Math.max(m, Number(p.price) || 0), 0) || 300;
    priceRange.max = String(Math.max(10, Math.ceil(maxSeen / 10) * 10));
    // Show all items by default: set slider to max
    priceRange.value = priceRange.max;
    priceValue.textContent = priceRange.value;
    renderProducts(getFilteredSortedProducts());
    syncWishlistButtons();
    syncCartButtons();
  }).catch(() => {
    renderProducts([]);
  });
}

document.addEventListener('DOMContentLoaded', init);


