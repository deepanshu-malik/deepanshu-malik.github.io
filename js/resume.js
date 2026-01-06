/**
 * Resume JavaScript
 * Handles theme toggle and PDF generation
 */

// ============================================
// THEME MANAGEMENT
// ============================================

const ThemeManager = {
    STORAGE_KEY: 'resume_theme',

    init() {
        // Check for saved preference or default to dark
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        const theme = savedTheme || 'dark';
        this.setTheme(theme);

        // Set up toggle button
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
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },

    updateIcons(theme) {
        const darkIcon = document.getElementById('theme-icon-dark');
        const lightIcon = document.getElementById('theme-icon-light');

        if (darkIcon && lightIcon) {
            if (theme === 'light') {
                darkIcon.classList.add('hidden');
                lightIcon.classList.remove('hidden');
            } else {
                darkIcon.classList.remove('hidden');
                lightIcon.classList.add('hidden');
            }
        }
    }
};

// ============================================
// PDF GENERATION
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

        if (!resume) {
            console.error('Resume element not found');
            return;
        }

        try {
            this.isGenerating = true;

            // Update button state
            if (downloadBtn) {
                downloadBtn.disabled = true;
                downloadBtn.innerHTML = `
                    <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    Generating...
                `;
            }

            // Add generating class for PDF-specific styles
            document.body.classList.add('generating-pdf');

            // Configure html2pdf options
            const options = {
                margin: [10, 10, 10, 10], // mm
                filename: 'Deepanshu_Malik_CV.pdf',
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                },
                pagebreak: {
                    mode: ['avoid-all', 'css', 'legacy'],
                    before: '.page-break-before',
                    after: '.page:not(:last-child)',
                    avoid: ['.experience-item', '.project-item', '.education-item', '.section']
                }
            };

            // Generate PDF
            await html2pdf().set(options).from(resume).save();

            // Track download (optional analytics)
            this.trackDownload();

        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try using the browser\'s Print function (Ctrl+P / Cmd+P) instead.');
        } finally {
            this.isGenerating = false;
            document.body.classList.remove('generating-pdf');

            // Reset button state
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download PDF
                `;
            }
        }
    },

    trackDownload() {
        // Optional: Add analytics tracking here
        // Example: gtag('event', 'download', { 'event_category': 'resume', 'event_label': 'pdf' });
        console.log('CV downloaded:', new Date().toISOString());
    }
};

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

const KeyboardShortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + P for print
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                // Let browser handle print
                return;
            }

            // Ctrl/Cmd + D for download PDF
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                PDFGenerator.generate();
            }

            // T for theme toggle
            if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                // Only if not typing in an input
                if (document.activeElement.tagName !== 'INPUT' &&
                    document.activeElement.tagName !== 'TEXTAREA') {
                    ThemeManager.toggle();
                }
            }
        });
    }
};

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

const SmoothScroll = {
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
};

// ============================================
// ANIMATION ON SCROLL (Web view only)
// ============================================

const ScrollAnimations = {
    init() {
        // Skip animations if prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Animate sections on scroll
        document.querySelectorAll('.section').forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            observer.observe(section);
        });
    }
};

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    PDFGenerator.init();
    KeyboardShortcuts.init();
    SmoothScroll.init();
    ScrollAnimations.init();

    // Log helpful keyboard shortcuts to console
    console.log('%cResume Keyboard Shortcuts:', 'font-weight: bold; color: #6366f1;');
    console.log('  T - Toggle theme (dark/light)');
    console.log('  Ctrl/Cmd + D - Download PDF');
    console.log('  Ctrl/Cmd + P - Print');
});

// ============================================
// UTILITY: Add spinning animation for loading state
// ============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .animate-spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
