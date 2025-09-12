// js/main.js

// Load products.json once
async function loadProducts() {
  const response = await fetch("products.json");
  return await response.json();
}

// Detect page
const currentPage = window.location.pathname.split("/").pop();

// Render catalog (products.html)
async function renderCatalog() {
  const products = await loadProducts();
  const catalog = document.querySelector(".catalog");

  if (!catalog) return;

  products.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("book-card");

    card.innerHTML = `
      <img src="${product.cover}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p class="author">by ${product.author}</p>
      <p class="price">${product.currency}${product.price}</p>
      <button onclick="window.location.href='product.html?id=${product.id}'">
        View Details
      </button>
    `;

    catalog.appendChild(card);
  });
}

// Render single product (product.html)
async function renderProductPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) return;

  const products = await loadProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    document.querySelector(".product-container").innerHTML =
      "<p>Product not found.</p>";
    return;
  }

  // Fill product details
  document.querySelector(".product-image").innerHTML = `
    <img src="${product.cover}" alt="${product.title}">
  `;

  document.querySelector(".product-info").innerHTML = `
    <h2>${product.title}</h2>
    <p class="author">by ${product.author}</p>
    <p class="price">${product.currency}${product.price}</p>
    <a class="btn-buy" href="/api/generateLink?id=${product.id}">Buy Now</a>
    <a class="btn-outline" href="${product.sampleBlob}" target="_blank">Read Sample</a>
  `;

  document.querySelector(".product-description").innerHTML = `
    <h3>Description</h3>
    <p>${product.description}</p>
    <h3>Highlights</h3>
    <ul>
      ${product.highlights.map(h => `<li>${h}</li>`).join("")}
    </ul>
  `;
}

// Init ripple effect on buttons
function initRippleEffect() {
  document.addEventListener("click", function (e) {
    if (e.target.tagName === "BUTTON") {
      const circle = document.createElement("span");
      circle.classList.add("ripple");
      e.target.appendChild(circle);

      const rect = e.target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = `${size}px`;
      circle.style.left = `${e.clientX - rect.left - size / 2}px`;
      circle.style.top = `${e.clientY - rect.top - size / 2}px`;

      setTimeout(() => circle.remove(), 600);
    }
  });
}

// Run page-specific functions
if (currentPage === "products.html") {
  renderCatalog();
} else if (currentPage === "product.html") {
  renderProductPage();
}

initRippleEffect();
