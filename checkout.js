let API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080'
  : 'https://decomind-texplod.onrender.com';
try {
  const qp = new URLSearchParams(location.search);
  const override = qp.get('api');
  if (override) API_BASE = override;
} catch {}

const summaryList = document.getElementById('summaryList');
const subtotalEl = document.getElementById('sumSubtotal');
const shippingEl = document.getElementById('sumShipping');
const taxEl = document.getElementById('sumTax');
const totalEl = document.getElementById('sumTotal');
const ckMsg = document.getElementById('ckMsg');

let cartIds = [];
let products = [];

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem('texplods_cart') || '[]');
    if (Array.isArray(raw)) cartIds = raw.map(Number).filter(Boolean);
  } catch {}
}

function normalizeImageUrl(src) {
  if (!src) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return `${API_BASE}${src}`;
  return src;
}

function renderSummary() {
  summaryList.innerHTML = '';
  if (cartIds.length === 0) {
    summaryList.innerHTML = '<div class="muted">Your cart is empty.</div>';
    subtotalEl.textContent = '$0';
    shippingEl.textContent = '$0';
    taxEl.textContent = '$0';
    totalEl.textContent = '$0';
    return;
  }
  const frag = document.createDocumentFragment();
  let subtotal = 0;
  cartIds.forEach(id => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    subtotal += Number(p.price) || 0;
    const row = document.createElement('div');
    row.className = 'sum-row';
    row.innerHTML = `
      <img src="${normalizeImageUrl(p.image)}" alt="${p.name}">
      <div class="sum-meta">
        <strong>${p.name}</strong>
        <span class="muted">${p.category} • $${p.price}</span>
      </div>
    `;
    frag.appendChild(row);
  });
  summaryList.appendChild(frag);
  const shipping = subtotal > 0 ? 10 : 0;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  subtotalEl.textContent = `$${subtotal}`;
  shippingEl.textContent = `$${shipping}`;
  taxEl.textContent = `$${tax}`;
  totalEl.textContent = `$${total}`;
}

function init() {
  loadCart();
  fetch(`${API_BASE}/api/products?t=${Date.now()}`, { cache: 'no-store' })
    .then(r => r.json())
    .then(data => {
      products = Array.isArray(data) ? data : [];
      renderSummary();
    })
    .catch(() => {
      ckMsg.textContent = 'Failed to load products. Try again later.';
      ckMsg.style.color = 'var(--danger)';
    });

  const form = document.getElementById('checkoutForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (cartIds.length === 0) {
      ckMsg.textContent = 'Your cart is empty.';
      ckMsg.style.color = 'var(--danger)';
      return;
    }
    ckMsg.textContent = 'Placing order...';
    ckMsg.style.color = 'var(--muted)';
    setTimeout(() => {
      try { localStorage.setItem('texplods_cart', '[]'); } catch {}
      ckMsg.textContent = 'Order placed! You will receive a confirmation email shortly.';
      ckMsg.style.color = 'var(--brand)';
    }, 800);
  });
}

document.addEventListener('DOMContentLoaded', init); 