document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.querySelector('.theme-toggle');
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

    function searchContent() {
        const filter = searchInput.value.toLowerCase();
        const items = content.querySelectorAll('h1, h2, h3, p, li');
        items.forEach(item => {
            if (item.textContent.toLowerCase().includes(filter)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Update sidebar on page load
    updateSidebar();

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });

    // Search functionality
    searchInput.addEventListener('input', searchContent);

    // Toggle search bar visibility
    searchIcon.addEventListener('click', () => {
        if (searchBar.style.display === 'flex') {
            searchBar.style.display = 'none';
        } else {
            searchBar.style.display = 'flex';
            searchInput.focus(); // Focus on input when shown
        }
    });

    // Make loadProject function available globally
    window.loadProject = loadProject;
});