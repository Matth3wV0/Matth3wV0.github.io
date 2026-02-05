// Language data storage - will be populated from JSON files
const langData = {
    en: {},
    vi: {}
};

// Current language state
let currentLang = localStorage.getItem('lang') || 'en';

// Track if language data is loaded
let langDataLoaded = false;

// Function to load language data from JSON files
async function loadLanguageData() {
    try {
        // Load both language files in parallel
        const [enResponse, viResponse] = await Promise.all([
            fetch('en.json'),
            fetch('vi.json')
        ]);

        if (!enResponse.ok || !viResponse.ok) {
            throw new Error('Failed to load language files');
        }

        const enData = await enResponse.json();
        const viData = await viResponse.json();

        // Populate langData
        langData.en = enData;
        langData.vi = viData;

        langDataLoaded = true;
        console.log('✅ Language data loaded successfully');

        // Apply the current language after loading
        changeLanguage(currentLang);

    } catch (error) {
        console.error('❌ Error loading language data:', error);
        // Fallback: keep empty langData and show original content
    }
}

// Function to change language
function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Only update content if data is loaded
    if (langDataLoaded) {
        // Update all elements with data-i18n attribute in the main document
        updateContent(document);

        // Update HTML lang attribute
        document.documentElement.lang = lang;
    }

    // Update toggle button states (this works even before data is loaded)
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });

    // If modal is open, ensure we update its content too (dynamic content)
    const modalContent = document.getElementById('modal-content');
    if (modalContent && langDataLoaded) {
        updateContent(modalContent);
    }
}

// Update content helper
function updateContent(context) {
    context.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (langData[currentLang] && langData[currentLang][key]) {
            el.textContent = langData[currentLang][key];
        }
    });
}

// Get translation helper (for dynamic content)
function t(key) {
    if (langData[currentLang] && langData[currentLang][key]) {
        return langData[currentLang][key];
    }
    // Fallback to English
    if (langData['en'] && langData['en'][key]) {
        return langData['en'][key];
    }
    // Return key itself if not found
    return key;
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Load language data first
    await loadLanguageData();
});
