async function loadCatalog() {
  const res = await fetch("products.json");
  const products = await res.json();
  const catalog = document.getElementById("catalog");

  products.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${book.cover}" alt="${book.title}" />
      <h3>${book.title}</h3>
      <p>by ${book.author}</p>
      <p><strong>$${book.price}</strong></p>
      <button onclick="openSample('${book.id}')">Read Sample</button>
      <button onclick="simulatePurchase('${book.id}')">Buy Now</button>
    `;
    catalog.appendChild(card);
  });
}

const bookSamples = {
  "digital-revolution": {
    title: "The Digital Revolution",
    author: "John Doe",
    content: `<p>Sample chapter coming soon...</p>`
  },
  "future-minds": {
    title: "Future Minds",
    author: "Dr. Michael Chen",
    content: `<p>Sample chapter coming soon...</p>`
  }
};

let currentSample = null;

function openSample(bookId) {
  const sample = bookSamples[bookId];
  if (!sample) return alert("Sample not available.");
  currentSample = bookId;
  document.getElementById("sampleTitle").textContent = sample.title;
  document.getElementById("sampleAuthor").textContent = `by ${sample.author}`;
  document.getElementById("sampleText").innerHTML = sample.content;
  document.getElementById("sampleModal").classList.add("active");
}

function closeSample() {
  document.getElementById("sampleModal").classList.remove("active");
  currentSample = null;
}

function purchaseFromSample() {
  if (currentSample) {
    closeSample();
    simulatePurchase(currentSample);
  }
}

function simulatePurchase(bookId) {
  alert(`🎉 Thank you for purchasing "${bookId}"! 
Payment processed via Flutterwave. 
Download link will be emailed or provided.`);
}

// Ripple animation
document.addEventListener("click", e => {
  if (e.target.tagName === "BUTTON") {
    const button = e.target;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.className = "ripple";
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
});

document.addEventListener("DOMContentLoaded", loadCatalog);
