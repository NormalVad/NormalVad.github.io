document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.getElementById('search-icon');
    const searchBar = document.getElementById('search-bar');
    const searchSuggestions = document.createElement('div');
    searchSuggestions.id = 'search-suggestions';
    searchBar.appendChild(searchSuggestions);

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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

    // Add loading animation for page transitions
    const addLoadingAnimation = () => {
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = '<div class="loader-spinner"></div>';
        document.body.appendChild(loader);
        
        setTimeout(() => {
            loader.remove();
        }, 300);
    };

    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply fade-in animation to cards
    document.querySelectorAll('.education-item, .experience-item, .project-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    function updateSidebar() {
        if (sidebar) {
            const headings = content.querySelectorAll('h2');
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

    // Enhanced search functionality with keyboard navigation
    let searchResults = [];
    let selectedIndex = -1;

    async function searchContent() {
        const filter = searchInput.value.toLowerCase().trim();
        if (filter.length < 2) {
            searchSuggestions.innerHTML = '';
            searchResults = [];
            selectedIndex = -1;
            return;
        }

        const pages = ['index.html', 'experience.html', 'projects.html', 'education.html'];
        const results = [];

        for (const page of pages) {
            try {
                const response = await fetch(page);
                const html = await response.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');
                
                const pageContent = doc.body.textContent || "";
                const title = doc.querySelector('title').textContent;

                if (pageContent.toLowerCase().includes(filter)) {
                    const snippet = getSnippet(pageContent, filter);
                    results.push({ title, url: page, snippet });
                }
            } catch (error) {
                console.error(`Error fetching ${page}:`, error);
            }
        }

        searchResults = results;
        displaySearchSuggestions(results);
    }

    function getSnippet(content, query) {
        const index = content.toLowerCase().indexOf(query);
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + query.length + 50);
        return content.slice(start, end).trim();
    }

    function displaySearchSuggestions(results) {
        searchSuggestions.innerHTML = '';
        
        if (results.length === 0) {
            searchSuggestions.innerHTML = '<div class="search-suggestion"><p>No results found.</p></div>';
        } else {
            results.forEach((result, index) => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-suggestion';
                resultItem.innerHTML = `
                    <h3><a href="${result.url}">${result.title}</a></h3>
                    <p>${result.snippet}</p>
                `;
                
                resultItem.addEventListener('click', () => {
                    window.location.href = result.url;
                });
                
                searchSuggestions.appendChild(resultItem);
            });
        }
    }

    // Keyboard navigation for search
    searchInput.addEventListener('keydown', (e) => {
        if (searchSuggestions.children.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, searchSuggestions.children.length - 1);
                updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && searchResults[selectedIndex]) {
                    window.location.href = searchResults[selectedIndex].url;
                }
                break;
            case 'Escape':
                searchSuggestions.innerHTML = '';
                searchInput.blur();
                break;
        }
    });

    function updateSelection() {
        Array.from(searchSuggestions.children).forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });
    }

    function toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isDark = !document.body.classList.contains('light-theme');
        themeToggle.querySelector('i').classList.toggle('fa-sun', !isDark);
        themeToggle.querySelector('i').classList.toggle('fa-moon', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    function applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.querySelector('i').classList.add('fa-sun');
            themeToggle.querySelector('i').classList.remove('fa-moon');
        } else {
            document.body.classList.remove('light-theme');
            themeToggle.querySelector('i').classList.remove('fa-sun');
            themeToggle.querySelector('i').classList.add('fa-moon');
        }
    }

    // Apply saved theme on page load
    applyTheme();

    // Update sidebar on page load (if sidebar exists)
    if (sidebar) {
        updateSidebar();
    }

    // Theme toggle functionality
    themeToggle.addEventListener('click', toggleTheme);

    // Search functionality
    searchInput.addEventListener('input', debounce(searchContent, 300));

    // Toggle search bar visibility
    searchIcon.addEventListener('click', () => {
        searchBar.classList.toggle('active');
        searchInput.focus();
    });

    // Close search suggestions when clicking outside
    document.addEventListener('click', (event) => {
        if (!searchBar.contains(event.target)) {
            searchSuggestions.innerHTML = '';
        }
    });

    // Debounce function to limit how often a function is called
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});