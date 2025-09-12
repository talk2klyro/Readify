// Get query param
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Load products.json
fetch("products.json")
  .then(res => res.json())
  .then(products => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      document.getElementById("product-details").innerHTML = `<p>Product not found.</p>`;
      return;
    }

    // Render Amazon-style product page
    document.getElementById("product-details").innerHTML = `
      <div class="product-container">
        <!-- Left: Cover -->
        <div class="product-image">
          <img src="${product.cover}" alt="${product.title} cover">
          <a href="${product.sampleblob}" target="_blank" class="btn-outline">📂 Download Sample</a>
        </div>

        <!-- Right: Info -->
        <div class="product-info">
          <h2>${product.title}</h2>
          <p class="author">by ${product.author}</p>
          <p class="price">${product.currency}${product.price}</p>
          <p class="format">Format: ${product.format}</p>
          <p class="bonus"><strong>Bonus:</strong> ${product.bonus}</p>
          <a href="${product.blob}" target="_blank" class="btn-buy">🛒 Buy Now</a>
        </div>
      </div>

      <!-- Full Description -->
      <div class="product-description">
        <h3>About this eBook</h3>
        <p>${product.description}</p>

        <h3>Highlights</h3>
        <ul>
          ${product.highlights.map(h => `<li>${h}</li>`).join("")}
        </ul>
      </div>
    `;
  })
  .catch(err => console.error("Error loading product:", err));
