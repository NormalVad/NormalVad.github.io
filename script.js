document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('theme-toggle');
    const searchIcon = document.getElementById('search-icon');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const searchSuggestions = document.createElement('div');
    searchSuggestions.id = 'search-suggestions';
    searchBar.appendChild(searchSuggestions);

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

    async function searchContent() {
        const filter = searchInput.value.toLowerCase();
        if (filter.length < 2) {
            searchSuggestions.innerHTML = '';
            return;
        }

        const pages = ['index.html', 'experience.html', 'projects.html', 'education.html'];
        const results = [];

        for (const page of pages) {
            const response = await fetch(page);
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            
            const pageContent = doc.body.textContent || "";

            if (pageContent.toLowerCase().includes(filter)) {
                const title = doc.querySelector('title').textContent;
                const snippet = getSnippet(pageContent, filter);
                results.push({ title, url: page, snippet });
            }
        }

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
            searchSuggestions.innerHTML = '<p>No results found.</p>';
        } else {
            results.forEach(result => {
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

    function toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isDark = !document.body.classList.contains('light-theme');
        themeToggle.classList.toggle('fa-sun', !isDark);
        themeToggle.classList.toggle('fa-moon', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    function applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.classList.add('fa-sun');
            themeToggle.classList.remove('fa-moon');
        } else {
            document.body.classList.remove('light-theme');
            themeToggle.classList.remove('fa-sun');
            themeToggle.classList.add('fa-moon');
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
    searchIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        searchBar.style.display = searchBar.style.display === 'block' ? 'none' : 'block';
        if (searchBar.style.display === 'block') {
            searchInput.focus();
        }
    });

    // Close search suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== searchBar && e.target !== searchIcon && !searchBar.contains(e.target)) {
            searchBar.style.display = 'none';
        }
    });
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