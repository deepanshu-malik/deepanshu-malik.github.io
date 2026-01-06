/**
 * Resume JavaScript
 * Dynamically loads resume data from JSON and handles PDF generation
 *
 * Features:
 * - Loads data from /data/resume-data.json
 * - Populates HTML from templates
 * - Theme toggle (dark/light)
 * - PDF generation with proper light mode styling
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    DATA_URL: 'data/resume-data.json',
    PDF_FILENAME: 'Deepanshu_Malik_CV.pdf'
};

// ============================================
// DATA LOADER
// ============================================

const DataLoader = {
    data: null,

    async load() {
        try {
            const response = await fetch(CONFIG.DATA_URL);
            if (!response.ok) {
                throw new Error(`Failed to load resume data: ${response.status}`);
            }
            this.data = await response.json();
            return this.data;
        } catch (error) {
            console.error('Error loading resume data:', error);
            throw error;
        }
    },

    get(path) {
        if (!this.data) return null;
        return path.split('.').reduce((obj, key) => obj?.[key], this.data);
    }
};

// ============================================
// TEMPLATE RENDERER
// ============================================

const TemplateRenderer = {
    render(data) {
        const resumeContainer = document.getElementById('resume');
        const template = document.getElementById('resume-template');

        if (!template || !resumeContainer) {
            console.error('Resume template or container not found');
            return;
        }

        // Clone the template content
        const content = template.content.cloneNode(true);

        // Populate all data bindings
        this.populateTextBindings(content, data);
        this.populateHtmlBindings(content, data);
        this.populateHrefBindings(content, data);
        this.populateLists(content, data);

        // Clear and append
        resumeContainer.innerHTML = '';
        resumeContainer.appendChild(content);
    },

    populateTextBindings(container, data) {
        container.querySelectorAll('[data-text]').forEach(el => {
            const path = el.getAttribute('data-text');
            const value = this.getValue(data, path);
            if (value !== null && value !== undefined) {
                el.textContent = value;
            }
        });

        container.querySelectorAll('[data-field]').forEach(el => {
            const path = el.getAttribute('data-field');
            const value = this.getValue(data, path);
            if (value !== null && value !== undefined) {
                el.textContent = value;
            }
        });
    },

    populateHtmlBindings(container, data) {
        container.querySelectorAll('[data-html]').forEach(el => {
            const path = el.getAttribute('data-html');
            const value = this.getValue(data, path);
            if (value !== null && value !== undefined) {
                el.innerHTML = value;
            }
        });
    },

    populateHrefBindings(container, data) {
        container.querySelectorAll('[data-href]').forEach(el => {
            const path = el.getAttribute('data-href');

            // Handle mailto: prefix
            if (path.startsWith('mailto:')) {
                const emailPath = path.replace('mailto:', '');
                const email = this.getValue(data, emailPath) || this.getValue(data, 'personal.email');
                el.href = `mailto:${email}`;
            } else {
                const value = this.getValue(data, path);
                if (value) {
                    el.href = value;
                }
            }
        });
    },

    populateLists(container, data) {
        container.querySelectorAll('[data-list]').forEach(listContainer => {
            const listName = listContainer.getAttribute('data-list');
            const limit = parseInt(listContainer.getAttribute('data-limit')) || Infinity;
            const offset = parseInt(listContainer.getAttribute('data-offset')) || 0;

            let items = this.getValue(data, listName);
            if (!items || !Array.isArray(items)) return;

            // Apply offset and limit
            items = items.slice(offset, offset + limit);

            const templateId = `${listName.replace(/s$/, '')}-template`;
            const template = document.getElementById(templateId);

            if (!template) {
                // Special case for achievements (nested list)
                if (listName === 'achievements') {
                    this.renderAchievements(listContainer, items);
                }
                return;
            }

            // Clear existing content
            listContainer.innerHTML = '';

            items.forEach(item => {
                const itemContent = template.content.cloneNode(true);

                // Process the item data
                const processedItem = this.processItem(listName, item);

                // Populate the item template
                this.populateTextBindings(itemContent, processedItem);
                this.populateHtmlBindings(itemContent, processedItem);
                this.populateHrefBindings(itemContent, processedItem);

                // Handle nested lists (like achievements in experience)
                itemContent.querySelectorAll('[data-list]').forEach(nestedList => {
                    const nestedListName = nestedList.getAttribute('data-list');
                    const nestedItems = processedItem[nestedListName];
                    if (nestedItems && Array.isArray(nestedItems)) {
                        this.renderAchievements(nestedList, nestedItems);
                    }
                });

                listContainer.appendChild(itemContent);
            });
        });
    },

    renderAchievements(container, achievements) {
        const template = document.getElementById('achievement-template');
        if (!template) {
            // Fallback: create li elements directly
            container.innerHTML = achievements.map(a => `<li>${a}</li>`).join('');
            return;
        }

        container.innerHTML = '';
        achievements.forEach(achievement => {
            const li = template.content.cloneNode(true);
            const liElement = li.querySelector('li') || li.querySelector('[data-html]');
            if (liElement) {
                liElement.innerHTML = achievement;
            }
            container.appendChild(li);
        });
    },

    processItem(listName, item) {
        // Add computed properties based on list type
        switch (listName) {
            case 'experience':
                return {
                    ...item,
                    duration: `${item.startDate} – ${item.endDate}`,
                    locationDisplay: `${item.location} • ${item.type}`
                };
            case 'education':
                return {
                    ...item,
                    duration: `${item.startYear} – ${item.endYear}`
                };
            case 'certifications':
                return {
                    ...item,
                    issuerDisplay: `${item.issuer} • Issued ${item.issueDate}`
                };
            case 'skills':
                return {
                    ...item,
                    category: `${item.category}:`
                };
            default:
                return item;
        }
    },

    getValue(data, path) {
        if (!path) return null;
        return path.split('.').reduce((obj, key) => obj?.[key], data);
    }
};

// ============================================
// THEME MANAGEMENT
// ============================================

const ThemeManager = {
    STORAGE_KEY: 'resume_theme',

    init() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'dark';
        this.setTheme(savedTheme);

        const toggleBtn = document.getElementById('toggle-theme');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.STORAGE_KEY, theme);
        this.updateIcons(theme);
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        this.setTheme(current === 'light' ? 'dark' : 'light');
    },

    updateIcons(theme) {
        const darkIcon = document.getElementById('theme-icon-dark');
        const lightIcon = document.getElementById('theme-icon-light');
        if (darkIcon && lightIcon) {
            darkIcon.classList.toggle('hidden', theme === 'light');
            lightIcon.classList.toggle('hidden', theme !== 'light');
        }
    }
};

// ============================================
// PDF GENERATOR
// ============================================

const PDFGenerator = {
    isGenerating: false,

    colors: {
        bgPrimary: '#ffffff',
        bgSecondary: '#f8fafc',
        textPrimary: '#1e293b',
        textSecondary: '#475569',
        textMuted: '#64748b',
        accentPrimary: '#4f46e5',
        accentSecondary: '#7c3aed',
        accentTertiary: '#0891b2',
        borderColor: '#e2e8f0'
    },

    init() {
        const downloadBtn = document.getElementById('download-pdf');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.generate());
        }
    },

    async generate() {
        if (this.isGenerating) return;

        const downloadBtn = document.getElementById('download-pdf');
        const resume = document.getElementById('resume');

        if (!resume) {
            console.error('Resume element not found');
            return;
        }

        try {
            this.isGenerating = true;
            this.updateButtonState(downloadBtn, true);

            // Create a clean clone for PDF
            const pdfContent = this.createPDFContent(resume);
            document.body.appendChild(pdfContent);

            // Wait for rendering
            await this.waitForRender();

            // Generate PDF
            const options = {
                margin: [8, 8, 8, 8],
                filename: CONFIG.PDF_FILENAME,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 794,
                    windowHeight: 1123
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true
                },
                pagebreak: {
                    mode: ['css', 'legacy'],
                    after: '.pdf-page-break',
                    avoid: ['.experience-item', '.project-item', '.education-item', '.certification-item']
                }
            };

            await html2pdf().set(options).from(pdfContent).save();
            document.body.removeChild(pdfContent);

            console.log('CV downloaded:', new Date().toISOString());

        } catch (error) {
            console.error('PDF generation failed:', error);
            this.showFallback();
        } finally {
            this.isGenerating = false;
            this.updateButtonState(downloadBtn, false);
        }
    },

    createPDFContent(original) {
        const container = document.createElement('div');
        container.id = 'pdf-export-container';
        container.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 794px;
            background: #ffffff;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #1e293b;
            line-height: 1.5;
        `;

        const clone = original.cloneNode(true);
        clone.style.cssText = `
            width: 100%;
            max-width: 794px;
            margin: 0;
            padding: 0;
            background: #ffffff;
        `;

        this.applyLightStyles(clone);
        container.appendChild(clone);
        return container;
    },

    applyLightStyles(el) {
        const c = this.colors;

        // Pages
        el.querySelectorAll('.page').forEach((page, i) => {
            page.style.cssText = `
                background: ${c.bgPrimary};
                padding: 24px 32px;
                margin: 0;
                box-shadow: none;
                border: none;
                border-radius: 0;
                ${i > 0 ? 'page-break-before: always;' : ''}
            `;
            page.classList.add('pdf-page-break');
        });

        // Header
        const header = el.querySelector('.header');
        if (header) header.style.cssText = `margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid ${c.borderColor};`;

        // Name & Title
        const name = el.querySelector('.name');
        if (name) name.style.cssText = `font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700; color: ${c.textPrimary}; margin: 0 0 4px 0;`;

        const title = el.querySelector('.title');
        if (title) title.style.cssText = `font-size: 16px; font-weight: 500; color: ${c.accentPrimary}; margin: 0;`;

        // Contact
        el.querySelectorAll('.contact-item').forEach(item => {
            item.style.cssText = `display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: ${c.textSecondary}; text-decoration: none;`;
        });
        el.querySelectorAll('.contact-row').forEach(row => {
            row.style.cssText = `display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 6px;`;
        });
        el.querySelectorAll('.contact-item svg').forEach(svg => {
            svg.style.cssText = `width: 12px; height: 12px; color: ${c.textMuted};`;
        });
        const contactInfo = el.querySelector('.contact-info');
        if (contactInfo) contactInfo.style.cssText = `display: flex; flex-direction: column; align-items: center; gap: 4px; margin-top: 8px;`;
        const headerMain = el.querySelector('.header-main');
        if (headerMain) headerMain.style.cssText = `text-align: center;`;

        // Sections
        el.querySelectorAll('.section-title').forEach(t => {
            t.style.cssText = `font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${c.accentPrimary}; margin: 0 0 10px 0; padding-bottom: 4px; border-bottom: 1px solid ${c.borderColor};`;
        });
        el.querySelectorAll('.section').forEach(s => {
            s.style.cssText = `margin-bottom: 14px; opacity: 1; transform: none;`;
        });

        // Summary
        const summary = el.querySelector('.summary');
        if (summary) summary.style.cssText = `font-size: 12px; color: ${c.textSecondary}; line-height: 1.6; margin: 0;`;
        el.querySelectorAll('.summary strong').forEach(s => {
            s.style.cssText = `font-weight: 600; color: ${c.textPrimary};`;
        });

        // Skills
        const skillsGrid = el.querySelector('.skills-grid');
        if (skillsGrid) skillsGrid.style.cssText = `display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 20px;`;
        el.querySelectorAll('.skill-category').forEach(cat => {
            cat.style.cssText = `font-size: 11px; line-height: 1.5;`;
        });
        el.querySelectorAll('.skill-label').forEach(l => {
            l.style.cssText = `font-weight: 600; color: ${c.textPrimary};`;
        });
        el.querySelectorAll('.skill-items').forEach(i => {
            i.style.cssText = `color: ${c.textSecondary};`;
        });

        // Experience
        el.querySelectorAll('.experience-item').forEach(item => {
            item.style.cssText = `margin-bottom: 14px; page-break-inside: avoid;`;
        });
        el.querySelectorAll('.experience-header').forEach(h => {
            h.style.cssText = `display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;`;
        });
        el.querySelectorAll('.job-title').forEach(t => {
            t.style.cssText = `font-size: 13px; font-weight: 600; color: ${c.textPrimary}; margin: 0;`;
        });
        el.querySelectorAll('.company').forEach(co => {
            co.style.cssText = `font-size: 12px; color: ${c.accentTertiary}; font-weight: 500;`;
        });
        el.querySelectorAll('.experience-meta').forEach(m => {
            m.style.cssText = `text-align: right;`;
        });
        el.querySelectorAll('.duration').forEach(d => {
            d.style.cssText = `font-size: 11px; font-weight: 500; color: ${c.textSecondary}; display: block;`;
        });
        el.querySelectorAll('.location').forEach(l => {
            l.style.cssText = `font-size: 10px; color: ${c.textMuted}; display: block;`;
        });

        // Achievements
        el.querySelectorAll('.achievements').forEach(list => {
            list.style.cssText = `list-style: none; padding: 0; margin: 0;`;
        });
        el.querySelectorAll('.achievements li').forEach(li => {
            li.style.cssText = `position: relative; padding-left: 12px; font-size: 11px; color: ${c.textSecondary}; margin-bottom: 4px; line-height: 1.5;`;
            // Add bullet
            if (!li.querySelector('.bullet')) {
                const bullet = document.createElement('span');
                bullet.className = 'bullet';
                bullet.style.cssText = `position: absolute; left: 0; top: 6px; width: 4px; height: 4px; background: ${c.accentPrimary}; border-radius: 50%;`;
                li.insertBefore(bullet, li.firstChild);
            }
        });
        el.querySelectorAll('.achievements strong').forEach(s => {
            s.style.cssText = `font-weight: 600; color: ${c.textPrimary};`;
        });

        // Projects
        el.querySelectorAll('.project-item').forEach(p => {
            p.style.cssText = `margin-bottom: 12px; padding: 10px 12px; background: ${c.bgSecondary}; border-radius: 6px; border: 1px solid ${c.borderColor}; page-break-inside: avoid;`;
        });
        el.querySelectorAll('.project-header').forEach(h => {
            h.style.cssText = `display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;`;
        });
        el.querySelectorAll('.project-title').forEach(t => {
            t.style.cssText = `font-size: 12px; font-weight: 600; color: ${c.textPrimary}; margin: 0;`;
        });
        el.querySelectorAll('.project-link').forEach(l => {
            l.style.cssText = `font-size: 10px; color: ${c.textMuted}; text-decoration: none;`;
        });
        el.querySelectorAll('.project-description').forEach(d => {
            d.style.cssText = `font-size: 11px; color: ${c.textSecondary}; line-height: 1.5; margin: 0 0 6px 0;`;
        });
        el.querySelectorAll('.project-tech').forEach(t => {
            t.style.cssText = `font-size: 10px; color: ${c.textMuted}; font-style: italic;`;
        });

        // Education
        el.querySelectorAll('.education-item').forEach(e => {
            e.style.cssText = `margin-bottom: 8px; page-break-inside: avoid;`;
        });
        el.querySelectorAll('.education-header').forEach(h => {
            h.style.cssText = `display: flex; justify-content: space-between; align-items: flex-start;`;
        });
        el.querySelectorAll('.degree').forEach(d => {
            d.style.cssText = `font-size: 12px; font-weight: 600; color: ${c.textPrimary}; margin: 0;`;
        });
        el.querySelectorAll('.institution').forEach(i => {
            i.style.cssText = `font-size: 11px; color: ${c.textSecondary};`;
        });

        // Certifications
        el.querySelectorAll('.certification-item').forEach(cert => {
            cert.style.cssText = `display: flex; align-items: center; gap: 12px; page-break-inside: avoid;`;
        });
        el.querySelectorAll('.cert-badge').forEach(b => {
            b.style.cssText = `display: flex; align-items: center; justify-content: center; min-width: 44px; height: 44px; background: linear-gradient(135deg, ${c.accentPrimary}, ${c.accentSecondary}); border-radius: 6px; font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: white;`;
        });
        el.querySelectorAll('.cert-title').forEach(t => {
            t.style.cssText = `font-size: 12px; font-weight: 600; color: ${c.textPrimary}; margin: 0;`;
        });
        el.querySelectorAll('.cert-issuer').forEach(i => {
            i.style.cssText = `font-size: 11px; color: ${c.textSecondary};`;
        });

        // Additional
        const additionalGrid = el.querySelector('.additional-grid');
        if (additionalGrid) additionalGrid.style.cssText = `display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;`;
        el.querySelectorAll('.additional-item').forEach(a => {
            a.style.cssText = `font-size: 11px; color: ${c.textSecondary};`;
        });
        el.querySelectorAll('.additional-label').forEach(l => {
            l.style.cssText = `font-weight: 600; color: ${c.textPrimary};`;
        });

        // Continued label
        el.querySelectorAll('.continued').forEach(cont => {
            cont.style.cssText = `font-weight: 400; text-transform: none; letter-spacing: normal; color: ${c.textMuted}; font-size: 10px;`;
        });
    },

    waitForRender() {
        return new Promise(resolve => {
            if (document.fonts?.ready) {
                document.fonts.ready.then(() => setTimeout(resolve, 100));
            } else {
                setTimeout(resolve, 200);
            }
        });
    },

    updateButtonState(btn, loading) {
        if (!btn) return;
        btn.disabled = loading;
        btn.innerHTML = loading
            ? `<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Generating...`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download PDF`;
    },

    showFallback() {
        if (confirm('PDF generation failed.\n\nUse browser Print instead?\n(Select "Save as PDF")')) {
            window.print();
        }
    }
};

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

const KeyboardShortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                PDFGenerator.generate();
            }
            if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey &&
                !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                ThemeManager.toggle();
            }
        });
    }
};

// ============================================
// LOADING STATE
// ============================================

const LoadingState = {
    show() {
        const el = document.getElementById('loading-state');
        if (el) el.style.display = 'flex';
    },
    hide() {
        const el = document.getElementById('loading-state');
        if (el) el.style.display = 'none';
    }
};

// ============================================
// INITIALISATION
// ============================================

async function init() {
    try {
        LoadingState.show();

        // Load data
        const data = await DataLoader.load();

        // Render resume
        TemplateRenderer.render(data);

        // Initialize components
        ThemeManager.init();
        PDFGenerator.init();
        KeyboardShortcuts.init();

        LoadingState.hide();

        console.log('%cResume loaded successfully!', 'color: #6366f1; font-weight: bold;');
        console.log('Keyboard shortcuts: T (theme), Ctrl+D (download), Ctrl+P (print)');

    } catch (error) {
        console.error('Failed to initialize resume:', error);
        LoadingState.hide();
        document.getElementById('resume').innerHTML = `
            <div class="page" style="text-align: center; padding: 40px;">
                <h2 style="color: #ef4444;">Failed to load resume</h2>
                <p style="color: #64748b;">Please refresh the page or try again later.</p>
                <p style="color: #64748b; font-size: 12px;">Error: ${error.message}</p>
            </div>
        `;
    }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Add loading spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-primary, #0a0a0f);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        gap: 16px;
    }
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--border-color, rgba(255,255,255,0.1));
        border-top-color: var(--accent-primary, #6366f1);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    .loading-overlay p {
        color: var(--text-secondary, #94a3b8);
        font-size: 14px;
    }
`;
document.head.appendChild(style);
