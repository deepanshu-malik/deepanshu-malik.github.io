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
        const container = document.getElementById('resume');
        if (!container) return;

        container.innerHTML = '';
        
        // Single page container - html2pdf handles pagination automatically
        const page = document.createElement('div');
        page.className = 'page';
        
        page.appendChild(this.buildHeader(data));
        page.appendChild(this.buildSection('Professional Summary', `<p class="summary">${data.summary}</p>`));
        page.appendChild(this.buildSection('Technical Skills', this.buildSkills(data.skills)));
        page.appendChild(this.buildSection('Professional Experience', this.buildExperience(data.experience)));
        page.appendChild(this.buildSection('Notable Projects', this.buildProjects(data.projects)));
        page.appendChild(this.buildSection('Education', this.buildEducation(data.education)));
        page.appendChild(this.buildSection('Certifications', this.buildCertifications(data.certifications)));
        page.appendChild(this.buildSection('Additional Information', this.buildAdditional(data.additional), 'section-additional'));
        
        container.appendChild(page);
    },

    buildSection(title, content, extraClass = '') {
        const section = document.createElement('section');
        section.className = `section ${extraClass}`.trim();
        section.innerHTML = `<h2 class="section-title">${title}</h2>`;
        if (typeof content === 'string') {
            section.insertAdjacentHTML('beforeend', content);
        } else {
            section.appendChild(content);
        }
        return section;
    },

    buildHeader(data) {
        const p = data.personal;
        const header = document.createElement('header');
        header.className = 'header';
        header.innerHTML = `
            <div class="header-main">
                <h1 class="name">${p.name}</h1>
                <p class="title">${p.title}</p>
            </div>
            <div class="contact-info">
                <div class="contact-row">
                    <a href="mailto:${p.email}" class="contact-item">${this.icon('email')}<span>${p.email}</span></a>
                    <span class="contact-item">${this.icon('phone')}<span>${p.phone}</span></span>
                    <span class="contact-item">${this.icon('location')}<span>${p.location} &bull; ${p.relocation}</span></span>
                </div>
                <div class="contact-row">
                    <a href="${p.linkedin.url}" target="_blank" class="contact-item">${this.icon('linkedin')}<span>${p.linkedin.display}</span></a>
                    <a href="${p.github.url}" target="_blank" class="contact-item">${this.icon('github')}<span>${p.github.display}</span></a>
                    <a href="${p.website.url}" target="_blank" class="contact-item">${this.icon('website')}<span>${p.website.display}</span></a>
                </div>
            </div>`;
        return header;
    },

    buildSkills(skills) {
        return `<div class="skills-grid">${skills.map(s => 
            `<div class="skill-category"><span class="skill-label">${s.category}:</span> <span class="skill-items">${s.items}</span></div>`
        ).join('')}</div>`;
    },

    buildExperience(items) {
        const div = document.createElement('div');
        div.innerHTML = items.map(e => `
            <div class="experience-item">
                <div class="experience-header">
                    <div class="experience-title-group">
                        <h3 class="job-title">${e.title}</h3>
                        <span class="company">${e.company}</span>
                    </div>
                    <div class="experience-meta">
                        <span class="duration">${e.startDate} – ${e.endDate}</span>
                        <span class="location">${e.location} • ${e.type}</span>
                    </div>
                </div>
                <ul class="achievements">${e.achievements.map(a => `<li>${a}</li>`).join('')}</ul>
            </div>`).join('');
        return div;
    },

    buildProjects(projects) {
        const div = document.createElement('div');
        div.innerHTML = projects.map(p => `
            <div class="project-item">
                <div class="project-header">
                    <h3 class="project-title">${p.title}</h3>
                    <a href="${p.url}" target="_blank" class="project-link">${p.displayUrl}</a>
                </div>
                <p class="project-description">${p.description}</p>
                <span class="project-tech">${p.technologies}</span>
            </div>`).join('');
        return div;
    },

    buildEducation(items) {
        const div = document.createElement('div');
        div.innerHTML = items.map(e => `
            <div class="education-item">
                <div class="education-header">
                    <div><h3 class="degree">${e.degree}</h3><span class="institution">${e.institution}</span></div>
                    <span class="duration">${e.startYear} – ${e.endYear}</span>
                </div>
            </div>`).join('');
        return div;
    },

    buildCertifications(certs) {
        const div = document.createElement('div');
        div.innerHTML = certs.map(c => `
            <div class="certification-item">
                <div class="cert-badge">${c.shortName}</div>
                <div class="cert-details">
                    <h3 class="cert-title">${c.name}</h3>
                    <span class="cert-issuer">${c.issuer} • Issued ${c.issueDate}</span>
                </div>
            </div>`).join('');
        return div;
    },

    buildAdditional(add) {
        return `<div class="additional-grid">
            <div class="additional-item"><span class="additional-label">Languages:</span> ${add.languages}</div>
            <div class="additional-item"><span class="additional-label">Availability:</span> ${add.availability}</div>
            <div class="additional-item"><span class="additional-label">Visa:</span> ${add.visa}</div>
            <div class="additional-item"><span class="additional-label">Interests:</span> ${add.interests}</div>
        </div>`;
    },

    icon(type) {
        const icons = {
            email: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
            phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
            location: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
            linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>',
            github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>',
            website: '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>'
        };
        return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[type]}</svg>`;
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
        if (!resume) return;

        try {
            this.isGenerating = true;
            this.updateButtonState(downloadBtn, true);

            // Show loader
            const loader = document.getElementById('loading-state');
            if (loader) {
                loader.style.display = 'flex';
                loader.querySelector('p').textContent = 'Generating PDF...';
            }

            // Store originals
            const originalHTML = resume.innerHTML;
            const wrapper = resume.parentElement;
            const controlBar = document.querySelector('.control-bar');
            const originalWrapperStyle = wrapper.style.cssText;
            const originalControlBarStyle = controlBar ? controlBar.style.cssText : '';
            
            // Hide control bar and reset wrapper for clean PDF
            if (controlBar) controlBar.style.display = 'none';
            wrapper.style.cssText = 'padding:0;margin:0;visibility:hidden;position:absolute;top:0;left:0;';
            
            // Apply PDF styles
            this.applyPDFStyles(resume);
            
            await new Promise(r => setTimeout(r, 200));

            await html2pdf().set({
                margin: [10, 10, 10, 10],
                filename: CONFIG.PDF_FILENAME,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { avoid: ['li', '.experience-item', '.project-item', '.education-item', '.certification-item', '.skill-category'] }
            }).from(resume).save();

            // Restore
            if (controlBar) controlBar.style.cssText = originalControlBarStyle;
            wrapper.style.cssText = originalWrapperStyle;
            resume.innerHTML = originalHTML;
            if (loader) loader.style.display = 'none';

        } catch (error) {
            console.error('PDF generation failed:', error);
            location.reload(); // Restore UI on error
            this.showFallback();
        } finally {
            this.isGenerating = false;
            this.updateButtonState(downloadBtn, false);
        }
    },

    applyPDFStyles(el) {
        const css = (sel, styles) => el.querySelectorAll(sel).forEach(e => Object.assign(e.style, styles));
        
        // Reset wrapper/container margins
        el.style.cssText = 'margin:0;padding:0;';
        
        // Pages
        css('.page', { background: '#fff', padding: '20px 28px', margin: '0', boxShadow: 'none', border: 'none', borderRadius: '0' });

        // Header
        css('.header', { marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #e2e8f0' });
        css('.header-main', { textAlign: 'center' });
        css('.name', { fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px' });
        css('.title', { fontSize: '16px', fontWeight: '500', color: '#4f46e5', margin: '0' });
        
        // Contact
        css('.contact-info', { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '8px' });
        css('.contact-row', { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px' });
        css('.contact-item', { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#475569', textDecoration: 'none' });
        css('.contact-item svg', { width: '12px', height: '12px', color: '#64748b' });

        // Sections
        css('.section', { marginBottom: '16px' });
        css('.section-title', { fontFamily: "'Space Grotesk',sans-serif", fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4f46e5', margin: '0 0 10px', paddingBottom: '5px', borderBottom: '1px solid #e2e8f0' });
        css('.continued', { fontWeight: '400', textTransform: 'none', letterSpacing: 'normal', color: '#64748b', fontSize: '11px' });

        // Summary
        css('.summary', { fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0' });
        css('.summary strong', { fontWeight: '400', color: '#475569' });

        // Skills
        css('.skills-grid', { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '6px 20px' });
        css('.skill-category', { fontSize: '12px', lineHeight: '1.5' });
        css('.skill-label', { fontWeight: '600', color: '#1e293b' });
        css('.skill-items', { color: '#475569' });

        // Experience
        css('.experience-item', { marginBottom: '14px' });
        css('.experience-header', { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' });
        css('.job-title', { fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0' });
        css('.company', { fontSize: '13px', color: '#0891b2', fontWeight: '500' });
        css('.experience-meta', { textAlign: 'right' });
        css('.duration', { fontSize: '12px', fontWeight: '500', color: '#475569', display: 'block' });
        css('.location', { fontSize: '11px', color: '#64748b', display: 'block' });

        // Achievements - use disc bullets, disable CSS ::before
        el.querySelectorAll('.achievements').forEach(ul => {
            ul.style.cssText = 'list-style-type:disc !important;padding-left:20px;margin:0;';
        });
        el.querySelectorAll('.achievements li').forEach(li => {
            li.style.cssText = 'font-size:12px;color:#475569;margin-bottom:4px;line-height:1.6;padding-left:4px;position:static;';
            // Remove any ::before content by clearing the element's class temporarily
            li.className = 'pdf-li';
            li.innerHTML = li.innerHTML.replace(/<\/?strong>/g, '');
        });

        // Projects
        css('.project-item', { marginBottom: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' });
        css('.project-header', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' });
        css('.project-title', { fontSize: '13px', fontWeight: '600', color: '#1e293b', margin: '0' });
        css('.project-link', { fontSize: '11px', color: '#64748b', textDecoration: 'none' });
        css('.project-description', { fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: '0 0 6px' });
        css('.project-tech', { fontSize: '11px', color: '#64748b', fontStyle: 'italic' });

        // Education
        css('.education-item', { marginBottom: '12px' });
        css('.education-header', { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' });
        css('.degree', { fontSize: '13px', fontWeight: '600', color: '#1e293b', margin: '0' });
        css('.institution', { fontSize: '12px', color: '#475569' });

        // Certifications
        css('.certification-item', { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' });
        css('.cert-badge', { display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', height: '44px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: '6px', fontSize: '12px', fontWeight: '700', color: '#fff' });
        css('.cert-title', { fontSize: '13px', fontWeight: '600', color: '#1e293b', margin: '0' });
        css('.cert-issuer', { fontSize: '12px', color: '#475569' });

        // Additional - 4 columns to match web
        css('.additional-grid', { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' });
        css('.additional-item', { fontSize: '12px', color: '#475569' });
        css('.additional-label', { fontWeight: '600', color: '#1e293b' });
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
