// ==============================
// Global Variables
// ==============================
let ebooks = [];
let filteredEbooks = [];
let itemsPerLoad = 12;
let currentIndex = 0;

// ==============================
// Load Ebooks JSON
// ==============================
async function loadEbooks() {
  const response = await fetch('/data/ebooks.json');
  ebooks = await response.json();
  filteredEbooks = [...ebooks];

  populateCategories();
  renderRecentlyAdded();
  renderPopularBooks();
  renderCategoryCarousels();
  renderFavorites();
  loadMoreBooks();
}

// ==============================
// Populate Category Filter
// ==============================
function populateCategories() {
  const filter = document.getElementById('categoryFilter');
  const categories = [...new Set(ebooks.map(b => b.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });
}

// ==============================
// Create Ebook Card
// ==============================
function createBookCard(book) {
  const card = document.createElement('div');
  card.className = 'ebook-card';
  card.innerHTML = `
    <img src="${book.cover}" alt="${book.title}" loading="lazy">
    <h3>${book.title}</h3>
    <p>${book.author}</p>
    <p>${book.description}</p>
    <a href="${book.url}">View Book</a>
    <button class="favorite-btn" data-id="${book.id}">${isFavorite(book.id) ? '❤️' : '🤍'}</button>
  `;
  return card;
}

// ==============================
// Recently Added Section
// ==============================
function renderRecentlyAdded() {
  const container = document.getElementById('recently-added');
  container.innerHTML = '';
  const recent = [...ebooks]
    .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
    .slice(0, 5);
  recent.forEach(book => container.appendChild(createBookCard(book)));
  attachFavoriteListeners();
}

// ==============================
// Popular Books Section
// ==============================
function renderPopularBooks() {
  const container = document.getElementById('popular-books');
  container.innerHTML = '';
  const popular = [...ebooks].sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 5);
  popular.forEach(book => container.appendChild(createBookCard(book)));
  attachFavoriteListeners();
}

// ==============================
// Category Carousels
// ==============================
function renderCategoryCarousels() {
  const container = document.getElementById('category-carousels');
  container.innerHTML = '';
  const categories = [...new Set(ebooks.map(b => b.category))];

  categories.forEach(cat => {
    const catBooks = ebooks.filter(b => b.category === cat).slice(0, 10);
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';
    carouselContainer.innerHTML = `
      <div class="carousel-title">${cat}</div>
      <div class="carousel">
        ${catBooks
          .map(b => `
            <div class="carousel-card">
              <a href="${b.url}">
                <img src="${b.cover}" alt="${b.title}" loading="lazy">
                <p>${b.title}</p>
                <p><em>${b.author}</em></p>
                <button class="favorite-btn" data-id="${b.id}">${isFavorite(b.id) ? '❤️' : '🤍'}</button>
              </a>
            </div>
          `)
          .join('')}
      </div>
    `;
    container.appendChild(carouselContainer);
  });

  attachFavoriteListeners();
}

// ==============================
// Infinite Scroll - Main Catalog
// ==============================
function loadMoreBooks() {
  const container = document.getElementById('ebook-list');
  const nextBooks = filteredEbooks.slice(currentIndex, currentIndex + itemsPerLoad);
  nextBooks.forEach(book => container.appendChild(createBookCard(book)));
  attachFavoriteListeners();
  currentIndex += itemsPerLoad;
}

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    if (currentIndex < filteredEbooks.length) {
      loadMoreBooks();
    }
  }
});

// ==============================
// Search / Filter / Sort
// ==============================
function applyFilters() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;

  filteredEbooks = ebooks.filter(book =>
    (book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)) &&
    (category === '' || book.category === category)
  );

  currentIndex = 0;
  document.getElementById('ebook-list').innerHTML = '';
  loadMoreBooks();
}

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('categoryFilter').addEventListener('change', applyFilters);
document.getElementById('sortSelect').addEventListener('change', () => {
  const sortValue = document.getElementById('sortSelect').value;
  if (sortValue) {
    filteredEbooks.sort((a, b) => a[sortValue].localeCompare(b[sortValue]));
  }
  currentIndex = 0;
  document.getElementById('ebook-list').innerHTML = '';
  loadMoreBooks();
});

// ==============================
// Dark Mode
// ==============================
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('readify-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
});

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('readify-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️ Light Mode';
  }
});

// ==============================
// Back-to-Top Button
// ==============================
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
});
backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ==============================
// Favorites / Wishlist
// ==============================
function getFavorites() {
  return JSON.parse(localStorage.getItem('readify-favorites') || '[]');
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id, btn) {
  let favs = getFavorites();
  if (favs.includes(id)) {
    favs = favs.filter(i => i !== id);
    btn.textContent = '🤍';
  } else {
    favs.push(id);
    btn.textContent = '❤️';
  }
  localStorage.setItem('readify-favorites', JSON.stringify(favs));
  renderFavorites();
}

function attachFavoriteListeners() {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleFavorite(btn.dataset.id, btn));
  });
}

function renderFavorites() {
  const container = document.getElementById('favorites-list');
  container.innerHTML = '';
  let favBooks = ebooks.filter(b => getFavorites().includes(b.id));

  // Favorites Search & Sort
  const query = document.getElementById('favorites-search').value.toLowerCase();
  if (query) {
    favBooks = favBooks.filter(b =>
      b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query)
    );
  }

  const sortVal = document.getElementById('favorites-sort').value;
  if (sortVal) {
    favBooks.sort((a, b) => a[sortVal].localeCompare(b[sortVal]));
  }

  favBooks.forEach(b => container.appendChild(createBookCard(b)));
  attachFavoriteListeners();
}

document.getElementById('favorites-search').addEventListener('input', renderFavorites);
document.getElementById('favorites-sort').addEventListener('change', renderFavorites);

// Share Favorites
document.getElementById('share-favorites').addEventListener('click', () => {
  const favBooks = ebooks.filter(b => getFavorites().includes(b.id));
  if (favBooks.length === 0) {
    alert('No favorites to share!');
    return;
  }
  const text = favBooks
    .map(b => `${b.title} by ${b.author} - ${window.location.origin + b.url}`)
    .join('\n');

  if (navigator.share) {
    navigator.share({ title: 'My Readify Favorites', text });
  } else {
    navigator.clipboard.writeText(text);
    alert('Favorites copied to clipboard!');
  }
});

// ==============================
// Initialize
// ==============================
loadEbooks();
