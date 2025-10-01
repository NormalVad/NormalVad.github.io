document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('theme-toggle');
    const navPreview = document.querySelector('.nav-preview');
    const navLinks = document.querySelectorAll('.primary-nav a[data-preview]');
    
    class SearchController {
        constructor(component) {
            this.component = component;
            this.input = component.querySelector('[data-search-input]');
            this.button = component.querySelector('[data-search-button]');
            this.dropdown = document.createElement('div');
            this.dropdown.className = 'search-suggestions-dropdown';
            this.component.appendChild(this.dropdown);
            this.results = [];
            this.activeIndex = -1;
            
            this.bindEvents();
        }

        bindEvents() {
            this.input.addEventListener('input', () => this.performSearch(this.input.value));
            this.input.addEventListener('focus', () => {
                if (this.input.value.trim()) {
                    this.performSearch(this.input.value);
                }
            });

            this.input.addEventListener('keydown', (event) => this.handleKeydown(event));
            this.button.addEventListener('click', () => this.navigateToResult(0));

            document.addEventListener('click', (event) => {
                if (!this.component.contains(event.target)) {
                    this.hideDropdown();
                }
            });
        }

        handleKeydown(event) {
            const { key } = event;
            if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(key)) return;

            if (key === 'Escape') {
                this.hideDropdown();
                this.input.blur();
            return;
            }

            if (this.results.length === 0) return;

            event.preventDefault();

            if (key === 'ArrowDown') {
                this.activeIndex = (this.activeIndex + 1) % this.results.length;
                this.updateActiveSuggestion();
            } else if (key === 'ArrowUp') {
                this.activeIndex = (this.activeIndex - 1 + this.results.length) % this.results.length;
                this.updateActiveSuggestion();
            } else if (key === 'Enter') {
                this.navigateToResult(this.activeIndex >= 0 ? this.activeIndex : 0);
            }
        }

        updateActiveSuggestion() {
            const items = Array.from(this.dropdown.querySelectorAll('.search-suggestion'));
            items.forEach((item, index) => {
                if (index === this.activeIndex) {
                    item.classList.add('active');
                    item.scrollIntoView({ block: 'nearest' });
                } else {
                    item.classList.remove('active');
                }
            });
        }

        async loadIndex() {
            if (window.__searchIndex) return window.__searchIndex;

            try {
                const response = await fetch('search-index.json', { cache: 'no-store' });
                if (!response.ok) throw new Error('Failed to fetch search index');
                const data = await response.json();
                window.__searchIndex = data;
                return data;
            } catch (error) {
                console.error('❌ Unable to load search index', error);
                return [];
            }
        }

        async performSearch(query) {
            const trimmed = query.trim();

            if (!trimmed) {
                this.hideDropdown();
                return;
            }

            const index = await this.loadIndex();
            const lowerQuery = trimmed.toLowerCase();
            
            const matches = index.flatMap((entry) => {
                const segments = [entry.title, entry.content];
                const foundInContent = entry.content.toLowerCase().includes(lowerQuery);
                const foundInTitle = entry.title.toLowerCase().includes(lowerQuery);

                if (foundInTitle || foundInContent) {
                    const snippet = this.createSnippet(entry.content, lowerQuery);
                    return [{
                        title: entry.title,
                        url: entry.url,
                        snippet,
                        rank: foundInTitle ? 0 : 1
                    }];
                }

                return [];
            }).sort((a, b) => a.rank - b.rank);

            this.results = matches.slice(0, 8);
            this.activeIndex = -1;
            this.renderSuggestions(trimmed);
        }

        createSnippet(text, query) {
            const lowerText = text.toLowerCase();
            const index = lowerText.indexOf(query);

            if (index === -1) {
                return text.length > 140 ? `${text.slice(0, 140)}…` : text;
            }

            const start = Math.max(0, index - 60);
            const end = Math.min(text.length, index + query.length + 80);
            const snippet = text.slice(start, end);

            return start > 0 ? `…${snippet}` : snippet;
        }

        renderSuggestions(query) {
            if (this.results.length === 0) {
                this.dropdown.innerHTML = `
                <div class="search-suggestion no-results">
                        <i class="fas fa-exclamation-circle"></i>
                    <span>No results found for "${query}"</span>
                </div>
            `;
                this.dropdown.style.display = 'block';
                return;
            }

            this.dropdown.innerHTML = this.results.map((result, index) => `
                <div class="search-suggestion" data-url="${result.url}" data-index="${index}">
                    <div class="suggestion-icon-wrapper"><i class="fas fa-search"></i></div>
                    <div class="suggestion-info">
                        <div class="suggestion-title">${result.title}</div>
                        <div class="suggestion-snippet">${result.snippet}</div>
                    </div>
                    </div>
            `).join('');

            this.dropdown.querySelectorAll('.search-suggestion').forEach(item => {
                item.addEventListener('click', () => {
                    const url = item.getAttribute('data-url');
                    window.location.href = url;
                });
            });

            this.dropdown.style.display = 'block';
        }

        navigateToResult(index) {
            if (!this.results[index]) return;
            window.location.href = this.results[index].url;
        }

        hideDropdown() {
            this.dropdown.style.display = 'none';
            this.activeIndex = -1;
        }
    }

    function initializeSearch() {
        const components = document.querySelectorAll('[data-search-component]');
        if (!components.length) {
            console.warn('No search components found');
            return;
        }

        components.forEach(component => {
            if (!component.__searchController) {
                component.__searchController = new SearchController(component);
            }
        });
    }

    initializeSearch();

    // ===== NAV PREVIEW =====
    function setupNavPreview() {
        if (!navPreview || !navLinks.length) return;
        const allowPreview = window.matchMedia('(pointer: fine)').matches;
        if (!allowPreview) {
            navPreview.remove();
            return;
        }

        let hideTimeout;

        const showPreview = (link) => {
            const previewImg = navPreview.querySelector('img');
            const previewText = navPreview.querySelector('p');
            if (previewImg) {
                previewImg.src = link.dataset.preview;
                previewImg.alt = link.dataset.previewAlt || '';
            }
            if (previewText) {
                previewText.textContent = link.dataset.previewText || link.textContent.trim();
            }

            navPreview.style.display = 'flex';

            window.requestAnimationFrame(() => {
                const rect = link.getBoundingClientRect();
                const previewRect = navPreview.getBoundingClientRect();
                const viewportTop = window.scrollY + 16;
                const viewportBottom = window.scrollY + window.innerHeight - previewRect.height - 16;
                let top = window.scrollY + rect.top + rect.height / 2 - previewRect.height / 2;
                top = Math.max(viewportTop, Math.min(top, viewportBottom));

                const viewportLeft = window.scrollX + 16;
                const viewportRight = window.scrollX + window.innerWidth - previewRect.width - 16;
                let left = window.scrollX + rect.right + 20;

                if (left > viewportRight) {
                    left = window.scrollX + rect.left - previewRect.width - 20;
                }

                left = Math.max(viewportLeft, Math.min(left, viewportRight));

                navPreview.style.top = `${top}px`;
                navPreview.style.left = `${left}px`;
            });
        };

        const scheduleHide = () => {
            hideTimeout = window.setTimeout(() => {
                navPreview.style.display = 'none';
            }, 120);
        };

        const cancelHide = () => {
            if (hideTimeout) {
                window.clearTimeout(hideTimeout);
                hideTimeout = undefined;
            }
        };

        navLinks.forEach((link) => {
            link.addEventListener('mouseenter', () => {
                cancelHide();
                showPreview(link);
            });
            link.addEventListener('mouseleave', scheduleHide);
            link.addEventListener('focus', () => {
                cancelHide();
                showPreview(link);
            });
            link.addEventListener('blur', scheduleHide);
        });

        navPreview.addEventListener('mouseenter', cancelHide);
        navPreview.addEventListener('mouseleave', scheduleHide);
    }

    setupNavPreview();

    // ===== WORD REVEAL =====
    function animateWords() {
        const headings = document.querySelectorAll('[data-animate-words]');
        headings.forEach((heading) => {
            if (heading.dataset.processed === 'true') return;
            const text = heading.textContent.trim();
            if (!text) return;
            const words = text.split(/\s+/);
            heading.innerHTML = words
                .map((word, index) => `<span style="--word-index:${index}">${word}</span>`)
                .join(' ');
            heading.dataset.processed = 'true';
        });
    }

    animateWords();
    
    // ===== ACTIVE PAGE HIGHLIGHTING =====
    function highlightActivePage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage || 
                (currentPage === '' && linkPage === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    highlightActivePage();
    
    // ===== THEME TOGGLE =====
    if (themeToggle) {
    function toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isDark = !document.body.classList.contains('light-theme');
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
            }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    function applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
                const icon = themeToggle.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-sun';
                }
            }
        }
        
        applyTheme();
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // ===== SIDEBAR =====
    if (sidebar && content) {
        function updateSidebar() {
            if (sidebar.children.length > 0) {
                return;
            }
            const headings = content.querySelectorAll('h2');
            if (headings.length > 0) {
            let sidebarContent = '<h3>On this page</h3><ul>';
            headings.forEach(heading => {
                const id = heading.id || heading.textContent.toLowerCase().replace(/\s+/g, '-');
                heading.id = id;
                sidebarContent += `<li><a href="#${id}">${heading.textContent}</a></li>`;
            });
            sidebarContent += '</ul>';
            sidebar.innerHTML = sidebarContent;
            }
        }
        updateSidebar();
    }

    // ===== CONTACT FORM HANDLER =====
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const statusEl = contactForm.querySelector('.form-status');

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(contactForm);
            const entries = Object.fromEntries(formData.entries());
            formData.append('_subject', 'Portfolio contact form message');
            formData.append('_captcha', 'false');

            if (statusEl) {
                statusEl.textContent = 'Sending your message…';
                statusEl.classList.remove('success', 'error');
            }

            try {
                const response = await fetch('https://formsubmit.co/ajax/ayushgoyal5720@gmail.com', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json'
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                if (statusEl) {
                    statusEl.textContent = 'Thanks for reaching out! I will get back to you shortly.';
                    statusEl.classList.add('success');
                }

                contactForm.reset();
            } catch (error) {
                console.error('Unable to submit contact form', error);

                if (statusEl) {
                    statusEl.textContent = 'We could not reach the server. Opening your email client instead…';
                    statusEl.classList.add('error');
                }

                const subject = 'Portfolio contact form message';
                const bodyLines = [
                    `Name: ${(entries.first_name || '').trim()} ${(entries.last_name || '').trim()}`.trim(),
                    `Email: ${entries.email || ''}`,
                    '',
                    entries.message || ''
                ];

                window.location.href = `mailto:ayushgoyal5720@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
            }
        });
    }

    console.log('✅ All initialization complete');
});
