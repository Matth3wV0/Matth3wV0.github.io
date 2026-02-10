// ===============================================
// Content Loader - Dynamic Content from content.json
// ===============================================

let contentData = null;

/**
 * Load content.json and render dynamic content
 */
async function loadContent() {
    try {
        const response = await fetch('content.json');
        if (!response.ok) throw new Error('Failed to load content.json');
        contentData = await response.json();

        renderProjectCards();
        renderWriteupCards();

        // Re-init Lucide icons after rendering
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        console.log(`✅ Loaded ${contentData.projects.length} projects, ${contentData.writeups.length} writeups`);
    } catch (error) {
        console.error('Content loading failed:', error);
    }
}

/**
 * Get current language
 */
function getCurrentLang() {
    return localStorage.getItem('lang') || 'en';
}

/**
 * Get localized text from object
 */
function getLocalized(obj, fallback = '') {
    if (!obj) return fallback;
    const lang = getCurrentLang();
    return obj[lang] || obj['en'] || fallback;
}

/**
 * Render project cards into #projects-grid
 */
function renderProjectCards() {
    const grid = document.getElementById('projects-grid');
    if (!grid || !contentData?.projects) return;

    const lang = getCurrentLang();

    grid.innerHTML = contentData.projects.map(project => {
        const colorClass = `card-glow-${project.color}`;
        const tagClass = `tag-${project.color}`;
        const spanStyle = project.span > 1 ? `style="grid-column: span ${project.span};"` : '';
        const modalAttr = project.hasModal ? `data-project="${project.id}"` : '';
        const cursorStyle = project.hasModal ? 'cursor: pointer;' : '';

        const statsHtml = project.stats.map(stat => `
            <div>
                <div class="project-stat-value">${stat.value}</div>
                <div class="project-stat-label">${getLocalized(stat.label)}</div>
            </div>
        `).join('');

        const tagsHtml = project.tags.map(tag =>
            `<span class="tag tag-gray">${tag}</span>`
        ).join('');

        const categoryLabel = project.category.charAt(0).toUpperCase() + project.category.slice(1);

        return `
            <div class="card project-card ${colorClass}" ${modalAttr} ${spanStyle} style="${cursorStyle}">
                <div class="project-header">
                    <div class="project-icon"><i data-lucide="${project.icon}"></i></div>
                    <span class="tag ${tagClass}">${categoryLabel}</span>
                </div>
                <h3 class="project-title">${getLocalized(project.title)}</h3>
                <p class="project-description">${getLocalized(project.description)}</p>
                <div class="project-tags">${tagsHtml}</div>
                ${statsHtml ? `<div class="project-stats">${statsHtml}</div>` : ''}
            </div>
        `;
    }).join('');

    // Re-attach click handlers for modal projects
    grid.querySelectorAll('[data-project]').forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.dataset.project;
            openProjectModalFromContent(projectId);
        });
    });
}

/**
 * Render writeup cards into #writeups-grid
 */
function renderWriteupCards() {
    const grid = document.getElementById('writeups-grid');
    if (!grid || !contentData?.writeups) return;

    const lang = getCurrentLang();

    grid.innerHTML = contentData.writeups.map(writeup => {
        const categoryColors = {
            'forensic': 'purple',
            'reverse': 'orange',
            'web': 'blue',
            'misc': 'gray'
        };
        const color = categoryColors[writeup.category] || 'gray';
        const categoryLabel = writeup.category.charAt(0).toUpperCase() + writeup.category.slice(1);

        return `
            <div class="card writeup-card" data-writeup="${writeup.id}" data-category="${writeup.category}">
                <div class="writeup-header">
                    <span class="tag tag-${color}">${categoryLabel}</span>
                </div>
                <h4 class="writeup-title">${getLocalized(writeup.title)}</h4>
                <p class="writeup-description">${getLocalized(writeup.description)}</p>
                <div class="writeup-footer">
                    <span class="writeup-cta">Read More <i data-lucide="arrow-right" style="width:16px;height:16px;"></i></span>
                    <span class="writeup-event">${writeup.event}</span>
                </div>
            </div>
        `;
    }).join('');

    // Re-attach click handlers
    grid.querySelectorAll('[data-writeup]').forEach(card => {
        card.addEventListener('click', () => {
            const writeupId = card.dataset.writeup;
            openWriteupModalFromContent(writeupId);
        });
    });
}

/**
 * Open project modal from content.json data
 */
function openProjectModalFromContent(projectId) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    if (!modal || !contentData) return;

    const project = contentData.projects.find(p => p.id === projectId);
    if (!project) return;

    const lang = getCurrentLang();
    modalTitle.textContent = getLocalized(project.title);

    // Get raw content
    let rawContent = project.content?.[lang] || project.content?.['en'] || '';

    // Extract and wrap Executive Summary section
    rawContent = rawContent.replace(
        /<h2>📋[^<]*<\/h2><\/p><p>([^]*?)(?=<\/p><p><h2>|$)/i,
        '</p><div class="writeup-summary"><h4>📋 Executive Summary</h4><p>$1</p></div><p>'
    );

    // Extract and wrap Detection/Mitigation section
    rawContent = rawContent.replace(
        /<h2>🛡️[^<]*<\/h2><\/p><p>([^]*?)(?=<\/p><p><h2>|$)/i,
        '</p><div class="writeup-detection"><h4>🛡️ Detection & Mitigation</h4><p>$1</p></div><p>'
    );

    // Extract and wrap Technology Stack section
    rawContent = rawContent.replace(
        /<h2>🛠️[^<]*<\/h2><\/p><p>([^]*?)(?=<\/p><p><h2>|$)/i,
        '</p><div class="writeup-detection"><h4>🛠️ Technology Stack</h4><p>$1</p></div><p>'
    );

    // Build modal content with links
    let headerHtml = '';
    if (project.github || project.video) {
        headerHtml = '<div class="modal-links" style="margin-bottom: 1rem; display: flex; gap: 0.5rem;">';
        if (project.github) {
            headerHtml += `<a href="${project.github}" target="_blank" rel="noopener" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="github"></i> View on GitHub
            </a>`;
        }
        if (project.video) {
            headerHtml += `<a href="${project.video}" target="_blank" rel="noopener" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="play"></i> Watch Demo
            </a>`;
        }
        headerHtml += '</div>';
    }

    // Wrap everything in writeup-content class for consistent styling
    modalContent.innerHTML = `<div class="writeup-content">${headerHtml}${rawContent}</div>`;

    // Highlight code blocks
    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(modalContent);
    }

    // Re-init Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Setup image lightbox
    if (typeof setupModalImages === 'function') {
        setupModalImages();
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Reset scroll position
    modalContent.scrollTop = 0;
    const modalContainer = modal.querySelector('.modal-container');
    if (modalContainer) modalContainer.scrollTop = 0;
}

/**
 * Open writeup modal from content.json data
 */
function openWriteupModalFromContent(writeupId) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    if (!modal || !contentData) return;

    const writeup = contentData.writeups.find(w => w.id === writeupId);
    if (!writeup) return;

    const lang = getCurrentLang();
    modalTitle.textContent = getLocalized(writeup.title);

    // Get raw content and structure it properly
    let rawContent = writeup.content?.[lang] || writeup.content?.['en'] || '';

    // Extract and wrap Executive Summary section
    rawContent = rawContent.replace(
        /<h2>📋 Executive Summary<\/h2><\/p><p>([^]*?)(?=<\/p><p><h2>|$)/i,
        '</p><div class="writeup-summary"><h4>📋 Executive Summary</h4><p>$1</p></div><p>'
    );

    // Extract and wrap Detection Strategy section
    rawContent = rawContent.replace(
        /<h2>🛡️ Detection Strategy[^<]*<\/h2><\/p><p>([^]*?)(?=<\/p><p><h2>|<blockquote>|$)/i,
        '</p><div class="writeup-detection"><h4>🛡️ Detection Strategy (Blue Team)</h4><p>$1</p></div><p>'
    );

    // Build MITRE table if present (with proper styling)
    let mitreHtml = '';
    if (writeup.mitre?.length > 0) {
        mitreHtml = `
            <div class="writeup-mitre">
                <h4>🎯 MITRE ATT&CK Mapping</h4>
                <table class="mitre-table">
                    <tr><th>Technique ID</th><th>Name</th><th>Description</th></tr>
                    ${writeup.mitre.map(m => `
                        <tr>
                            <td><code>${m.id}</code></td>
                            <td>${m.name}</td>
                            <td>${m.desc}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;
    }

    // Build flag section with blockquote styling
    const flagHtml = writeup.flag ? `
        <blockquote><strong>Flag:</strong> ${writeup.flag}</blockquote>
    ` : '';

    // Wrap everything in writeup-content class
    modalContent.innerHTML = `<div class="writeup-content">${rawContent}${mitreHtml}${flagHtml}</div>`;

    // Highlight code blocks
    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(modalContent);
    }

    // Re-init Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Setup image lightbox
    if (typeof setupModalImages === 'function') {
        setupModalImages();
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Reset scroll position
    modalContent.scrollTop = 0;
    const modalContainer = modal.querySelector('.modal-container');
    if (modalContainer) modalContainer.scrollTop = 0;
}

/**
 * Re-render content when language changes
 */
function refreshContentForLanguage() {
    if (contentData) {
        renderProjectCards();
        renderWriteupCards();

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Auto-load content on DOM ready
document.addEventListener('DOMContentLoaded', loadContent);
