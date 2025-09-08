// Load products and render homepage
async function loadProducts() {
  const res = await fetch('/products.json');
  const products = await res.json();
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.cover}" alt="${product.title}">
      <div class="info">
        <h3>${product.title}</h3>
        <p>₦${product.price}</p>
        <a href="product.html?id=${product.id}" class="button">View</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Load product detail page
async function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  const res = await fetch('/products.json');
  const products = await res.json();
  const product = products.find(p => p.id === id);
  const container = document.getElementById('product-detail');
  if (!product || !container) return;

  container.innerHTML = `
    <div class="product-card">
      <img src="${product.cover}" alt="${product.title}">
      <div class="info">
        <h2>${product.title}</h2>
        <p>${product.description}</p>
        <p>₦${product.price}</p>
        <a href="${product.sample}" target="_blank" class="button">Download Sample</a>
        <a href="#" onclick="buyNow('${product.id}')" class="button">Buy Now</a>
      </div>
    </div>
  `;
}

// Dummy buyNow function (replace with Flutterwave integration later)
function buyNow(id) {
  alert(`Flutterwave Checkout would open for product: ${id}`);
}

// Auto-run depending on page
if (document.getElementById('product-grid')) loadProducts();
if (document.getElementById('product-detail')) loadProductDetail();
