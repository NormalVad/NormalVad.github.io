document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.getElementById('search-icon');
    const searchBar = document.getElementById('search-bar');
    const root = document.documentElement;

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
        const response = await fetch('/search-index.json');
        const searchIndex = await response.json();
        
        const results = searchIndex.filter(item => 
            item.content.toLowerCase().includes(filter) ||
            item.title.toLowerCase().includes(filter)
        );

        displaySearchResults(results);
    }

    function displaySearchResults(results) {
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.innerHTML = `
                <h3><a href="${result.url}">${result.title}</a></h3>
                <p>${result.content.substring(0, 150)}...</p>
            `;
            resultsContainer.appendChild(resultItem);
        });

        content.innerHTML = '';
        content.appendChild(resultsContainer);
    }

    function toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isDark = document.body.classList.contains('light-theme');
        themeToggle.classList.toggle('fa-sun', isDark);
        themeToggle.classList.toggle('fa-moon', !isDark);
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }

    // Update sidebar on page load
    updateSidebar();

    // Theme toggle functionality
    themeToggle.addEventListener('click', toggleTheme);

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        toggleTheme();
    }

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