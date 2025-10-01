document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Script loaded');
    
    const content = document.getElementById('content');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.getElementById('search-icon');
    const searchBar = document.getElementById('search-bar');
    
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
    
    // ===== SEARCH FUNCTIONALITY =====
    if (searchInput && searchBar) {
        console.log('✓ Search elements found');
        
        // Create and append search suggestions container
        let searchSuggestions = document.getElementById('search-suggestions');
        if (!searchSuggestions) {
            searchSuggestions = document.createElement('div');
            searchSuggestions.id = 'search-suggestions';
            searchSuggestions.className = 'search-suggestions-dropdown';
            searchBar.appendChild(searchSuggestions);
            console.log('✓ Search suggestions container created');
        }
        
        // Comprehensive search data
        const searchData = [
            // Pages
            { title: 'Home', url: 'index.html', type: 'page', icon: 'fas fa-home' },
            { title: 'Experience', url: 'experience.html', type: 'page', icon: 'fas fa-briefcase' },
            { title: 'Projects', url: 'projects.html', type: 'page', icon: 'fas fa-code' },
            { title: 'Education', url: 'education.html', type: 'page', icon: 'fas fa-graduation-cap' },
            
            // Companies
            { title: 'KAIST', url: 'experience.html#kaist', type: 'company', icon: 'fas fa-university' },
            { title: 'Adobe', url: 'experience.html#adobe', type: 'company', icon: 'fab fa-adobe' },
            { title: 'Goldman Sachs', url: 'index.html', type: 'company', icon: 'fas fa-building' },
            { title: 'USC', url: 'education.html#degree1', type: 'education', icon: 'fas fa-graduation-cap' },
            { title: 'IIT Delhi', url: 'education.html#degree2', type: 'education', icon: 'fas fa-university' },
            
            // Projects
            { title: 'Intent based CounterSpeech', url: 'projects.html#project1', type: 'project', icon: 'fas fa-shield-alt' },
            { title: 'Claim Span Identification', url: 'projects.html#project2', type: 'project', icon: 'fas fa-search' },
            
            // Skills
            { title: 'NLP', url: 'projects.html', type: 'skill', icon: 'fas fa-language' },
            { title: 'Machine Learning', url: 'projects.html', type: 'skill', icon: 'fas fa-brain' },
            { title: 'Computer Vision', url: 'projects.html', type: 'skill', icon: 'fas fa-eye' },
            { title: 'Python', url: 'projects.html', type: 'skill', icon: 'fab fa-python' },
            { title: 'PyTorch', url: 'projects.html', type: 'skill', icon: 'fas fa-fire' },
            { title: 'XAI', url: 'experience.html#kaist', type: 'skill', icon: 'fas fa-lightbulb' },
        ];
        
        // Search function
        function performSearch(query) {
            console.log('🔍 Searching for:', query);
            
            if (!query || query.trim().length === 0) {
                searchSuggestions.innerHTML = '';
                searchSuggestions.style.display = 'none';
                return;
            }
            
            const lowerQuery = query.toLowerCase().trim();
            const results = searchData.filter(item => 
                item.title.toLowerCase().includes(lowerQuery)
            ).slice(0, 6);
            
            console.log('✓ Found results:', results.length);
            
            if (results.length === 0) {
                searchSuggestions.innerHTML = `
                    <div class="search-suggestion no-results">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>No results found for "${query}"</span>
                    </div>
                `;
            } else {
                searchSuggestions.innerHTML = results.map(result => `
                    <div class="search-suggestion" data-url="${result.url}">
                        <i class="${result.icon}"></i>
                        <div class="suggestion-info">
                            <div class="suggestion-title">${result.title}</div>
                            <div class="suggestion-type">${result.type}</div>
                        </div>
                    </div>
                `).join('');
                
                // Add click handlers
                searchSuggestions.querySelectorAll('.search-suggestion').forEach(item => {
                    item.addEventListener('click', () => {
                        const url = item.getAttribute('data-url');
                        console.log('→ Navigating to:', url);
                        window.location.href = url;
                    });
                });
            }
            
            searchSuggestions.style.display = 'block';
        }
        
        // Event listeners for search
        searchInput.addEventListener('input', (e) => {
            console.log('Input event:', e.target.value);
            performSearch(e.target.value);
        });
        
        searchInput.addEventListener('focus', () => {
            console.log('Search focused');
            if (searchInput.value.trim()) {
                performSearch(searchInput.value);
            }
        });
        
        // Close search on outside click
        document.addEventListener('click', (e) => {
            if (!searchBar.contains(e.target)) {
                searchSuggestions.style.display = 'none';
            }
        });
        
        // Keyboard support
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchSuggestions.style.display = 'none';
                searchInput.blur();
            } else if (e.key === 'Enter') {
                const firstResult = searchSuggestions.querySelector('.search-suggestion');
                if (firstResult && !firstResult.classList.contains('no-results')) {
                    firstResult.click();
                }
            }
        });
        
        console.log('✓ Search functionality initialized');
    } else {
        console.error('❌ Search elements not found!');
    }
    
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
    
    console.log('✅ All initialization complete');
});