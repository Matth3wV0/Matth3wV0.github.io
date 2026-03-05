// ===============================================
// Language / i18n System
// ===============================================

const langData = { en: {}, vi: {} };
let currentLang = localStorage.getItem('lang') || 'en';
let langDataLoaded = false;

// Load language JSON files
async function loadLanguageData() {
    // Disable lang buttons while loading
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });

    try {
        const [enResponse, viResponse] = await Promise.all([
            fetch('en.json'),
            fetch('vi.json')
        ]);

        if (!enResponse.ok || !viResponse.ok) {
            throw new Error('Failed to load language files');
        }

        langData.en = await enResponse.json();
        langData.vi = await viResponse.json();
        langDataLoaded = true;

        // Apply saved language
        changeLanguage(currentLang);
    } catch (error) {
        console.error('Language load error:', error);
    } finally {
        // Re-enable lang buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '';
        });
    }
}

// Change language with smooth transition
function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    if (!langDataLoaded) return;

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update all translatable elements in the document
    updateContent(document);

    // Also update page title
    const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
    if (titleKey && langData[lang]?.[titleKey]) {
        document.title = langData[lang][titleKey];
    }

    // If modal is open, update its content too
    const modalContent = document.getElementById('modal-content');
    if (modalContent) {
        updateContent(modalContent);
    }

    // Update template content that might be in shadow DOM or hidden
    document.querySelectorAll('template').forEach(tmpl => {
        updateContent(tmpl.content);
    });
}

// Update content helper - applies translations to all data-i18n elements
function updateContent(context) {
    const translations = langData[currentLang];
    if (!translations) return;

    context.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.innerHTML = translations[key];
        }
    });
}

// Get translation by key (for dynamic content)
function t(key) {
    return langData[currentLang]?.[key] || langData['en']?.[key] || key;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadLanguageData();
});
