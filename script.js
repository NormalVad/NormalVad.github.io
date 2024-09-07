document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.getElementById('search-icon');
    const searchBar = document.getElementById('search-bar');

    function updateSidebar() {
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

    function loadProject(projectId) {
        fetch(`${projectId}.html`)
            .then(response => response.text())
            .then(html => {
                content.innerHTML = html;
                updateSidebar();
            });
    }

    async function searchContent() {
        const filter = searchInput.value.toLowerCase();
        if (filter.length < 2) return; // Don't search for very short queries

        const pages = ['index.html', 'experience.html', 'projects.html', 'education.html'];
        const results = [];

        for (const page of pages) {
            const response = await fetch(page);
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            
            // Extract relevant content based on page structure
            let pageContent;
            if (page === 'index.html') {
                // For home page, focus on specific sections
                const sections = doc.querySelectorAll('.center-content, .description');
                pageContent = Array.from(sections).map(section => section.textContent).join(' ');
            } else {
                // For other pages, use the main content area
                const mainContent = doc.querySelector('#content');
                pageContent = mainContent ? mainContent.textContent : "";
            }

            if (pageContent.toLowerCase().includes(filter)) {
                const title = doc.querySelector('title').textContent;
                const snippet = getSnippet(pageContent, filter);
                results.push({ title, url: page, snippet });
            }
        }

        displaySearchResults(results);
    }

    function getSnippet(content, query) {
        const index = content.toLowerCase().indexOf(query);
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + query.length + 50);
        return content.slice(start, end).trim();
    }

    function displaySearchResults(results) {
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No results found.</p>';
        } else {
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.innerHTML = `
                    <h3><a href="${result.url}">${result.title}</a></h3>
                    <p>${result.snippet}</p>
                `;
                resultsContainer.appendChild(resultItem);
            });
        }

        content.innerHTML = '';
        content.appendChild(resultsContainer);
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

    // Update sidebar on page load
    updateSidebar();

    // Apply saved theme on page load
    applyTheme();

    // Theme toggle functionality
    themeToggle.addEventListener('click', toggleTheme);

    // Search functionality
    searchInput.addEventListener('input', debounce(searchContent, 300));

    // Toggle search bar visibility
    searchIcon.addEventListener('click', () => {
        searchBar.style.display = searchBar.style.display === 'flex' ? 'none' : 'flex';
        searchInput.focus();
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

    // Make loadProject function available globally
    window.loadProject = loadProject;
});