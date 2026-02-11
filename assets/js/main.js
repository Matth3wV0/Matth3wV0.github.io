// ===============================================
// PORTFOLIO - Main JavaScript
// ===============================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initModal();
    initLightbox();
    initFilters();
    initCertificates();
    initTerminalTyping();
    initScrollAnimations();
});

// ===============================================
// Header Scroll Effect
// ===============================================
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('open');
        });
    }
}

// ===============================================
// Modal Logic
// ===============================================
let currentModal = null;

function initModal() {
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const writeupCards = document.querySelectorAll('.writeup-card');

    if (!modal) return;

    // Open modal from writeup cards
    writeupCards.forEach(card => {
        card.addEventListener('click', () => {
            const writeupId = card.dataset.writeup;
            openWriteupModal(writeupId);
        });
    });

    // Open modal from project cards
    const projectCards = document.querySelectorAll('.project-card[data-project]');
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.dataset.project;
            openProjectModal(projectId);
        });
    });

    // Close modal handlers
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeModal();
        }
    });
}

function openWriteupModal(writeupId) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    if (!modal || !writeupData || !writeupData[writeupId]) return;

    const data = writeupData[writeupId];
    modalTitle.textContent = data.title;

    // Load template content
    const template = document.getElementById(data.template);
    if (template) {
        modalContent.innerHTML = template.innerHTML;

        // Highlight code blocks if Prism is available
        if (typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(modalContent);
        }

        // Re-init Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Setup image lightbox for modal images
        setupModalImages();

        // Apply translations
        if (typeof changeLanguage === 'function') {
            changeLanguage(localStorage.getItem('lang') || 'en');
        }
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    currentModal = modal;

    // Reset scroll position to top
    const contentEl = document.getElementById('modal-content');
    if (contentEl) {
        contentEl.scrollTop = 0;
    }
    // Also reset the modal container scroll
    const modalContainer = modal.querySelector('.modal-container');
    if (modalContainer) {
        modalContainer.scrollTop = 0;
    }
}

function openProjectModal(projectId) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    if (!modal || !projectData || !projectData[projectId]) return;

    const data = projectData[projectId];
    modalTitle.textContent = data.title;

    // Load template content
    const template = document.getElementById(data.template);
    if (template) {
        modalContent.innerHTML = template.innerHTML;

        // Highlight code blocks if Prism is available
        if (typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(modalContent);
        }

        // Re-init Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Setup image lightbox for modal images
        setupModalImages();

        // Apply translations
        if (typeof changeLanguage === 'function') {
            changeLanguage(localStorage.getItem('lang') || 'en');
        }
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    currentModal = modal;

    // Reset scroll position to top
    const contentEl = document.getElementById('modal-content');
    if (contentEl) {
        contentEl.scrollTop = 0;
    }
    const modalContainer = modal.querySelector('.modal-container');
    if (modalContainer) {
        modalContainer.scrollTop = 0;
    }
}

function openModal(title, content) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    if (!modal) return;

    modalTitle.textContent = title;
    modalContent.innerHTML = content;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    currentModal = modal;
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (!modal) return;

    modal.classList.remove('open');
    document.body.style.overflow = '';
    currentModal = null;
}

// ===============================================
// Lightbox for Images
// ===============================================
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightbox-close');

    if (!lightbox) return;

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

function setupModalImages() {
    const modalContent = document.getElementById('modal-content');
    if (!modalContent) return;

    const images = modalContent.querySelectorAll('img');
    images.forEach(img => {
        img.classList.add('writeup-image');
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(img.src);
        });
    });
}

function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (!lightbox || !lightboxImg) return;

    lightboxImg.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.classList.remove('open');

    // Only restore scroll if modal is also closed
    if (!currentModal || !currentModal.classList.contains('open')) {
        document.body.style.overflow = '';
    }
}

// ===============================================
// CTF Filter Buttons
// ===============================================
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const writeupCards = document.querySelectorAll('.writeup-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            // Filter cards
            writeupCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = '';
                    card.style.opacity = '1';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ===============================================
// Certificate Modal with Lazy Loading & Caching
// ===============================================
const certificateCache = new Map();
let preloadContainer = null;
let certificatesPreloaded = false;

function initCertificates() {
    const certCards = document.querySelectorAll('.cert-card');

    certCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.cert-title')?.textContent || 'Certificate';
            const pdfUrl = card.dataset.pdf;

            if (pdfUrl) {
                openCertificateModal(title, pdfUrl);
            }
        });
    });

    // Start preloading certificates immediately when page loads
    if (document.readyState === 'complete') {
        startCertificatePreload();
    } else {
        window.addEventListener('load', startCertificatePreload);
    }
}

// Create hidden container for preloading iframes
function createPreloadContainer() {
    if (preloadContainer) return preloadContainer;

    preloadContainer = document.createElement('div');
    preloadContainer.id = 'cert-preload-container';
    preloadContainer.style.cssText = 'position:fixed; left:-9999px; top:-9999px; width:1px; height:1px; overflow:hidden; pointer-events:none;';
    document.body.appendChild(preloadContainer);
    return preloadContainer;
}

// Start preloading all certificates in background
function startCertificatePreload() {
    if (certificatesPreloaded) return;
    certificatesPreloaded = true;

    const certCards = document.querySelectorAll('.cert-card[data-pdf]');
    const urls = Array.from(certCards).map(c => c.dataset.pdf).filter(u => u && !certificateCache.has(u));

    if (urls.length === 0) return;

    createPreloadContainer();

    // Use requestIdleCallback for non-blocking preload, fallback to setTimeout
    const schedulePreload = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));

    urls.forEach((url, index) => {
        schedulePreload(() => {
            preloadCertificate(url);
        }, { timeout: 1000 + (index * 300) });
    });

    console.log(`📄 Started preloading ${urls.length} certificates...`);
}

// Preload a single certificate PDF using Google Docs Viewer
function preloadCertificate(pdfUrl) {
    if (certificateCache.has(pdfUrl)) return;

    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

    // Create hidden iframe to trigger browser caching
    const iframe = document.createElement('iframe');
    iframe.src = viewerUrl;
    iframe.style.cssText = 'width:1px; height:1px; border:none;';
    iframe.loading = 'lazy';

    iframe.onload = () => {
        certificateCache.set(pdfUrl, { viewerUrl, preloaded: true });
        console.log(`✅ Cached: ${pdfUrl.split('/').pop()}`);
    };

    iframe.onerror = () => {
        // Still cache the URL even on error so we don't retry
        certificateCache.set(pdfUrl, { viewerUrl, preloaded: false });
    };

    preloadContainer?.appendChild(iframe);
}

function openCertificateModal(title, pdfUrl) {
    const cached = certificateCache.get(pdfUrl);
    const viewerUrl = cached?.viewerUrl || `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    const isPreloaded = cached?.preloaded === true;

    const content = `
        <div style="width:100%; height:75vh; border-radius:12px; overflow:hidden; background:#111; position:relative;">
            ${!isPreloaded ? `
                <div id="cert-loading" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#111; z-index:10;">
                    <div style="width:32px; height:32px; border:2px solid #00ff88; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite;"></div>
                    <p style="color:#888; margin-top:12px; font-size:14px;">Loading certificate...</p>
                </div>
                <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
            ` : ''}
            <iframe 
                src="${viewerUrl}" 
                style="width:100%; height:100%; border:none;"
                onload="document.getElementById('cert-loading')?.remove()"
            ></iframe>
        </div>
        <div style="text-align:center; margin-top:16px;">
            <a href="${pdfUrl}" target="_blank" rel="noopener" class="text-accent font-mono" style="font-size:14px;">
                Download / Open in new tab
            </a>
        </div>
    `;

    // Cache this URL if not already cached
    if (!cached) {
        certificateCache.set(pdfUrl, { viewerUrl, preloaded: false });
    }

    openModal(title, content);
}

// ===============================================
// Terminal Typing Effect
// ===============================================
function initTerminalTyping() {
    const typingElements = document.querySelectorAll('[data-typing]');

    typingElements.forEach(el => {
        const text = el.dataset.typing;
        el.textContent = '';

        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                el.textContent += text[index];
                index++;
            } else {
                clearInterval(typeInterval);
            }
        }, 50);
    });
}

// ===============================================
// Scroll Animations (Intersection Observer)
// ===============================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections for scroll reveal
    document.querySelectorAll('.section').forEach(el => {
        observer.observe(el);
    });
}

// ===============================================
// Smooth Scroll for Anchor Links
// ===============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Close mobile menu if open
            document.querySelector('.nav')?.classList.remove('open');
        }
    });
});
