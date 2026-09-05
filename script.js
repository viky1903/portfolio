/* ============================================================
   ANKIT'S PORTFOLIO — Script
   Handles: Typing effect, document rendering, search/filter,
            scroll reveal, navbar, mobile menu
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initTypingEffect();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  loadDocuments();
});

/* ---------- Typing Effect ---------- */
function initTypingEffect() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const phrases = [
    'Student • Learner • Builder',
    'Digital Marketing Enthusiast',
    'Always curious, always learning.',
    'Turning ideas into action.'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let pauseTimer = null;

  function tick() {
    const current = phrases[phraseIndex];

    if (!isDeleting) {
      // Typing
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        // Pause at end of phrase
        pauseTimer = setTimeout(() => {
          isDeleting = true;
          tick();
        }, 2000);
        return;
      }
      setTimeout(tick, 60 + Math.random() * 40);
    } else {
      // Deleting
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 30);
    }
  }

  tick();
}

/* ---------- Navbar Scroll Effect ---------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  function onScroll() {
    // Add scrolled class
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link tracking
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 200;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Mobile Menu ---------- */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  // Close on link click
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });
}

/* ---------- Scroll Reveal ---------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ---------- Documents Hub ---------- */
let allDocuments = [];
let currentCategory = 'all';
let searchQuery = '';

async function loadDocuments() {
  try {
    const response = await fetch('documents.json');
    allDocuments = await response.json();
    renderDocuments();
    initDocumentFilters();
  } catch (err) {
    console.error('Failed to load documents:', err);
    document.getElementById('docsGrid').innerHTML = `
      <div class="docs-empty">
        <div class="empty-icon">⚠️</div>
        <h3>Could not load documents</h3>
        <p>Make sure documents.json exists in the portfolio folder.</p>
      </div>
    `;
  }
}

function initDocumentFilters() {
  // Category buttons
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderDocuments();
    });
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderDocuments();
    }, 200);
  });
}

function getFilteredDocuments() {
  return allDocuments.filter(doc => {
    const matchesCategory = currentCategory === 'all' || doc.category === currentCategory;
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery) ||
      doc.description.toLowerCase().includes(searchQuery) ||
      doc.category.toLowerCase().includes(searchQuery) ||
      doc.type.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });
}

function getFileIcon(type) {
  const icons = {
    pdf: '📄',
    pptx: '📊',
    ppt: '📊',
    doc: '📝',
    docx: '📝',
    xls: '📈',
    xlsx: '📈',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    zip: '📦'
  };
  return icons[type] || '📁';
}

function getTypeLabel(type) {
  const labels = {
    pdf: 'PDF',
    pptx: 'PPTX',
    ppt: 'PPT',
    doc: 'DOC',
    docx: 'DOCX',
    xls: 'XLS',
    xlsx: 'XLSX'
  };
  return labels[type] || type.toUpperCase();
}

function getCategoryPath(category) {
  const paths = {
    college: 'documents/college/',
    presentations: 'documents/presentations/',
    projects: 'documents/projects/',
    personal: 'documents/personal/'
  };
  return paths[category] || 'documents/';
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function renderDocuments() {
  const grid = document.getElementById('docsGrid');
  const empty = document.getElementById('docsEmpty');
  const stats = document.getElementById('docsStats');
  const filtered = getFilteredDocuments();

  // Update stats
  stats.innerHTML = `Showing <span>${filtered.length}</span> of <span>${allDocuments.length}</span> files`;

  if (filtered.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  empty.style.display = 'none';

  grid.innerHTML = filtered.map(doc => {
    const filePath = getCategoryPath(doc.category) + doc.filename;
    const iconClass = ['pdf', 'pptx', 'ppt'].includes(doc.type) ? doc.type : 
                      ['doc', 'docx'].includes(doc.type) ? 'doc' : 
                      ['jpg', 'jpeg', 'png', 'gif'].includes(doc.type) ? 'img' : 'doc';

    return `
      <div class="doc-card reveal visible" style="--card-accent: var(--${doc.type === 'pdf' ? 'pdf-color' : doc.type === 'pptx' ? 'pptx-color' : 'info'})">
        <div class="doc-card-header">
          <div class="doc-icon ${iconClass}">
            ${getFileIcon(doc.type)}
          </div>
          <div class="doc-info">
            <div class="doc-name" title="${doc.name}">${doc.name}</div>
            <div class="doc-description">${doc.description}</div>
          </div>
        </div>
        <div class="doc-meta">
          <span class="doc-tag category">${doc.category}</span>
          <span class="doc-tag type">${getTypeLabel(doc.type)}</span>
          <span class="doc-size">${doc.size}</span>
          <span class="doc-date">${formatDate(doc.date)}</span>
        </div>
        <div class="doc-actions">
          <a href="${filePath}" target="_blank" class="doc-btn doc-btn-view">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            View
          </a>
          <a href="${filePath}" download class="doc-btn doc-btn-download">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download
          </a>
        </div>
      </div>
    `;
  }).join('');
}
