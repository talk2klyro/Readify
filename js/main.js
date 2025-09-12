// js/main.js
// single script that drives products.html, product.html, and index featured view

// helpers
async function loadProductsData() {
  const r = await fetch('/products.json');
  if (!r.ok) throw new Error('Failed to load products.json');
  return r.json();
}

// ---------- Catalog rendering ----------
async function renderCatalog() {
  const container = document.getElementById('catalog') || document.querySelector('.catalog');
  if (!container) return;
  const products = await loadProductsData();
  container.innerHTML = '';

  products.forEach(p => {
    const el = document.createElement('div');
    el.className = 'book-card';
    el.innerHTML = `
      <img src="${p.cover}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="author">${p.author}</p>
      <p class="price">${p.currency} ${p.price.toLocaleString()}</p>
      <div class="button-row">
        <button class="btn btn-secondary" onclick="openSample('${p.id}')">Sample</button>
        <button class="btn btn-primary" onclick="location.href='product.html?id=${p.id}'">View</button>
        <button class="btn btn-primary" onclick="startCheckout('${p.id}')">Buy</button>
      </div>
    `;
    container.appendChild(el);
  });
}

// ---------- Single product rendering ----------
async function renderProductPage() {
  const container = document.querySelector('.product-container');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    container.innerHTML = '<p>Product not found (no id).</p>';
    return;
  }

  const products = await loadProductsData();
  const product = products.find(x => x.id === id);
  if (!product) {
    container.innerHTML = '<p>Product not found.</p>';
    return;
  }

  // left + right
  container.innerHTML = `
    <div class="product-image">
      <img src="${product.cover}" alt="${product.title}">
      <div style="margin-top:0.8rem">
        <button class="btn btn-secondary" onclick="openSample('${product.id}')">📖 Read Sample</button>
      </div>
    </div>
    <div class="product-info">
      <h2>${product.title}</h2>
      <p class="author">${product.author}</p>
      <p class="price">${product.currency} ${product.price.toLocaleString()}</p>
      <p><strong>Format:</strong> ${product.format}</p>
      <p><strong>Bonus:</strong> ${product.bonus}</p>
      <div style="margin-top:1rem;">
        <button class="btn btn-primary" onclick="startCheckout('${product.id}')">Buy Now</button>
      </div>
    </div>
  `;

  // description
  const desc = document.createElement('div');
  desc.className = 'product-description';
  desc.innerHTML = `
    <h3>About this eBook</h3>
    <p>${product.description}</p>
    <h3>Highlights</h3>
    <ul>
      ${product.highlights.map(h => `<li>${h}</li>`).join('')}
    </ul>
  `;
  // ensure not duplicating: remove old if exists
  const existingDesc = document.querySelector('.product-description');
  if (existingDesc) existingDesc.remove();
  container.insertAdjacentElement('afterend', desc);
}

// ---------- Sample modal ----------
function openSample(productId) {
  // load products, find sampleBlob, open iframe modal
  loadProductsData().then(products => {
    const p = products.find(x => x.id === productId);
    if (!p || !p.sampleBlob) {
      alert('Sample not available yet.');
      return;
    }
    const modal = document.getElementById('sampleModal');
    const frame = document.getElementById('sampleFrame');
    const title = document.getElementById('modalTitle');
    frame.src = p.sampleBlob;
    title.textContent = `${p.title} — Sample`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }).catch(err => {
    console.error(err);
    alert('Could not load sample.');
  });
}

function closeSample() {
  const modal = document.getElementById('sampleModal');
  if (!modal) return;
  const frame = document.getElementById('sampleFrame');
  frame.src = '';
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'closeModal') closeSample();
  if (e.target && e.target.classList && e.target.classList.contains('modal')) {
    // click outside content
    if (e.target.id === 'sampleModal') closeSample();
  }
});

// wire close button if present
window.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closeModal');
  if (closeBtn) closeBtn.onclick = closeSample;
});

// ---------- Checkout flow ----------
async function startCheckout(productId) {
  try {
    // find product in JSON
    const products = await loadProductsData();
    const product = products.find(p => p.id === productId);
    if (!product) { alert('Product not found'); return; }

    // Create payment on server -> returns checkoutUrl
    const payload = {
      productId,
      // optional: customer details can be sent for prefill
      redirect_url: `${location.origin}/payment-success.html`
    };

    const res = await fetch('/api/createPayment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data || !data.checkoutUrl) {
      alert(data?.message || 'Could not create payment. Try again.');
      return;
    }

    // redirect to Flutterwave hosted payment page
    window.location.href = data.checkoutUrl;
  } catch (err) {
    console.error(err);
    alert('Checkout failed. Try again later.');
  }
}

// ---------- Init (auto run on DOM load) ----------
document.addEventListener('DOMContentLoaded', () => {
  renderCatalog().catch(()=>{});
  renderProductPage().catch(()=>{});
  // setup ripple effect for buttons
  document.addEventListener('click', function (e) {
    if (e.target.tagName === 'BUTTON' && e.target.classList.contains('btn')) {
      const circle = document.createElement('span');
      circle.className = 'ripple';
      e.target.appendChild(circle);
      const rect = e.target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = `${size}px`;
      circle.style.left = `${e.clientX - rect.left - size/2}px`;
      circle.style.top = `${e.clientY - rect.top - size/2}px`;
      setTimeout(()=>circle.remove(), 600);
    }
  });
});
