document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.getElementById('search-icon');
    const searchBar = document.getElementById('search-bar');
    
    // Create search suggestions container
    const searchSuggestions = document.createElement('div');
    searchSuggestions.id = 'search-suggestions';
    searchSuggestions.style.display = 'none';
    searchBar.appendChild(searchSuggestions);

    // Search data
    const searchData = [
        { title: 'Home', url: 'index.html', type: 'page', icon: 'fas fa-home' },
        { title: 'Experience', url: 'experience.html', type: 'page', icon: 'fas fa-briefcase' },
        { title: 'Projects', url: 'projects.html', type: 'page', icon: 'fas fa-code' },
        { title: 'Education', url: 'education.html', type: 'page', icon: 'fas fa-graduation-cap' },
        { title: 'Natural Language Processing', url: null, type: 'skill', icon: 'fas fa-language' },
        { title: 'Computer Vision', url: null, type: 'skill', icon: 'fas fa-eye' },
        { title: 'Machine Learning', url: null, type: 'skill', icon: 'fas fa-brain' },
        { title: 'Python', url: null, type: 'skill', icon: 'fab fa-python' },
        { title: 'PyTorch', url: null, type: 'skill', icon: 'fas fa-fire' },
        { title: 'KAIST', url: null, type: 'company', icon: 'fas fa-university' },
        { title: 'Adobe', url: null, type: 'company', icon: 'fab fa-adobe' },
        { title: 'Goldman Sachs', url: null, type: 'company', icon: 'fas fa-building' },
        { title: 'USC', url: null, type: 'company', icon: 'fas fa-university' },
        { title: 'IIT Delhi', url: null, type: 'company', icon: 'fas fa-university' }
    ];

    // Search function
    function searchContent(query) {
        if (!query || query.length < 1) {
            searchSuggestions.style.display = 'none';
            return;
        }

        const results = searchData.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);

        displaySuggestions(results, query);
    }

    // Display suggestions
    function displaySuggestions(results, query) {
        searchSuggestions.innerHTML = '';
        
        if (results.length === 0) {
            searchSuggestions.innerHTML = `
                <div class="search-suggestion no-results">
                    <i class="fas fa-search"></i>
                    <span>No results found for "${query}"</span>
                </div>
            `;
        } else {
            results.forEach((result, index) => {
                const suggestion = document.createElement('div');
                suggestion.className = 'search-suggestion';
                suggestion.innerHTML = `
                    <div class="suggestion-icon">
                        <i class="${result.icon}"></i>
                    </div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${highlightText(result.title, query)}</div>
                        <div class="suggestion-type">${result.type.charAt(0).toUpperCase() + result.type.slice(1)}</div>
                    </div>
                    ${result.url ? '<div class="suggestion-action"><i class="fas fa-external-link-alt"></i></div>' : ''}
                `;
                
                suggestion.addEventListener('click', () => {
                    if (result.url) {
                        window.location.href = result.url;
                    }
                });
                
                searchSuggestions.appendChild(suggestion);
            });
        }
        
        searchSuggestions.style.display = 'block';
    }

    // Highlight text
    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Event listeners
    searchInput.addEventListener('input', (e) => {
        searchContent(e.target.value);
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value) {
            searchContent(searchInput.value);
        }
    });

    searchIcon.addEventListener('click', () => {
        searchBar.classList.toggle('active');
        searchInput.focus();
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchBar.contains(e.target)) {
            searchSuggestions.style.display = 'none';
        }
    });

    // Keyboard navigation
    let selectedIndex = -1;
    searchInput.addEventListener('keydown', (e) => {
        const suggestions = searchSuggestions.querySelectorAll('.search-suggestion:not(.no-results)');
        
        if (suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
                updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    suggestions[selectedIndex].click();
                }
                break;
            case 'Escape':
                searchSuggestions.style.display = 'none';
                searchInput.blur();
                break;
        }
    });

    function updateSelection() {
        const suggestions = searchSuggestions.querySelectorAll('.search-suggestion:not(.no-results)');
        suggestions.forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });
    }

    // Reset selection when typing
    searchInput.addEventListener('input', () => {
        selectedIndex = -1;
    });

    // Theme toggle functionality
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

    // Theme toggle functionality
    themeToggle.addEventListener('click', toggleTheme);

    // Update sidebar on page load (if sidebar exists)
    if (sidebar) {
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
        updateSidebar();
    }

    // Debug: Test search functionality
    console.log('Search system loaded');
    console.log('Search input:', searchInput);
    console.log('Search suggestions:', searchSuggestions);
    
    // Test function
    window.testSearch = function(query = 'home') {
        console.log('Testing search with:', query);
        searchInput.value = query;
        searchContent(query);
    };
});