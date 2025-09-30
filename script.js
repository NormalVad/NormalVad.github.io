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

    // Enhanced search data with more comprehensive content
    const searchData = [
        // Pages
        { title: 'Home', url: 'index.html', type: 'page', icon: 'fas fa-home', keywords: ['home', 'main', 'about', 'ayush goyal'] },
        { title: 'Experience', url: 'experience.html', type: 'page', icon: 'fas fa-briefcase', keywords: ['experience', 'work', 'career', 'jobs', 'internship'] },
        { title: 'Projects', url: 'projects.html', type: 'page', icon: 'fas fa-code', keywords: ['projects', 'portfolio', 'work', 'github'] },
        { title: 'Education', url: 'education.html', type: 'page', icon: 'fas fa-graduation-cap', keywords: ['education', 'university', 'degree', 'coursework'] },
        
        // Skills and Technologies
        { title: 'Natural Language Processing', url: null, type: 'skill', icon: 'fas fa-language', keywords: ['nlp', 'natural language', 'text', 'language processing'] },
        { title: 'Computer Vision', url: null, type: 'skill', icon: 'fas fa-eye', keywords: ['computer vision', 'cv', 'image', 'visual', 'opencv'] },
        { title: 'Machine Learning', url: null, type: 'skill', icon: 'fas fa-brain', keywords: ['machine learning', 'ml', 'ai', 'artificial intelligence'] },
        { title: 'Deep Learning', url: null, type: 'skill', icon: 'fas fa-brain', keywords: ['deep learning', 'neural networks', 'tensorflow', 'pytorch'] },
        { title: 'Python', url: null, type: 'skill', icon: 'fab fa-python', keywords: ['python', 'programming', 'coding'] },
        { title: 'PyTorch', url: null, type: 'skill', icon: 'fas fa-fire', keywords: ['pytorch', 'torch', 'framework'] },
        { title: 'XAI', url: null, type: 'skill', icon: 'fas fa-search', keywords: ['xai', 'explainable ai', 'interpretability', 'lime', 'shap'] },
        { title: 'Quantization', url: null, type: 'skill', icon: 'fas fa-compress', keywords: ['quantization', 'compression', 'optimization'] },
        
        // Companies and Organizations
        { title: 'KAIST', url: null, type: 'company', icon: 'fas fa-university', keywords: ['kaist', 'korea', 'research', 'sail'] },
        { title: 'Adobe', url: null, type: 'company', icon: 'fab fa-adobe', keywords: ['adobe', 'research', 'intern', 'stylegan'] },
        { title: 'Goldman Sachs', url: null, type: 'company', icon: 'fas fa-building', keywords: ['goldman sachs', 'quant', 'finance', 'trading'] },
        { title: 'USC', url: null, type: 'company', icon: 'fas fa-university', keywords: ['usc', 'university of southern california', 'masters'] },
        { title: 'IIT Delhi', url: null, type: 'company', icon: 'fas fa-university', keywords: ['iit delhi', 'iitd', 'bachelor', 'undergraduate'] },
        
        // Projects
        { title: 'Intent based CounterSpeech', url: 'projects.html#project1', type: 'project', icon: 'fas fa-shield-alt', keywords: ['counter speech', 'hate speech', 'nlp', 'ethics'] },
        { title: 'Claim Span Identification', url: 'projects.html#project2', type: 'project', icon: 'fas fa-search', keywords: ['claim span', 'fact checking', 'text analysis', 'csi'] },
        
        // Experience Items
        { title: 'Research Assistant at KAIST', url: 'experience.html#kaist', type: 'experience', icon: 'fas fa-flask', keywords: ['research', 'kaist', 'xai', 'explainability'] },
        { title: 'Adobe Research Intern', url: 'experience.html#adobe', type: 'experience', icon: 'fab fa-adobe', keywords: ['adobe', 'intern', 'quantization', 'gan', 'stylegan'] },
        
        // Education
        { title: 'MS Computer Science USC', url: 'education.html#degree1', type: 'education', icon: 'fas fa-graduation-cap', keywords: ['masters', 'usc', 'computer science', 'ms'] },
        { title: 'BTech IIT Delhi', url: 'education.html#degree2', type: 'education', icon: 'fas fa-university', keywords: ['bachelor', 'iit delhi', 'mathematics', 'computing'] }
    ];

    // Enhanced search function with keyword matching
    function searchContent(query) {
        if (!query || query.length < 1) {
            searchSuggestions.style.display = 'none';
            return;
        }

        const queryLower = query.toLowerCase().trim();
        const results = searchData.filter(item => {
            // Check title match
            const titleMatch = item.title.toLowerCase().includes(queryLower);
            
            // Check keyword matches
            const keywordMatch = item.keywords && item.keywords.some(keyword => 
                keyword.toLowerCase().includes(queryLower) || queryLower.includes(keyword.toLowerCase())
            );
            
            return titleMatch || keywordMatch;
        }).map(item => {
            // Calculate relevance score
            let score = 0;
            const titleLower = item.title.toLowerCase();
            
            // Exact title match gets highest score
            if (titleLower === queryLower) score += 100;
            // Title starts with query gets high score
            else if (titleLower.startsWith(queryLower)) score += 50;
            // Title contains query gets medium score
            else if (titleLower.includes(queryLower)) score += 25;
            
            // Keyword matches get additional points
            if (item.keywords) {
                item.keywords.forEach(keyword => {
                    if (keyword.toLowerCase().includes(queryLower)) score += 10;
                    if (queryLower.includes(keyword.toLowerCase())) score += 5;
                });
            }
            
            return { ...item, score };
        }).sort((a, b) => b.score - a.score).slice(0, 8);

        displaySuggestions(results, query);
    }

    // Enhanced display suggestions with better formatting
    function displaySuggestions(results, query) {
        searchSuggestions.innerHTML = '';
        
        if (results.length === 0) {
            searchSuggestions.innerHTML = `
                <div class="search-suggestion no-results">
                    <div class="suggestion-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">No results found for "${query}"</div>
                        <div class="suggestion-type">Try different keywords</div>
                    </div>
                </div>
            `;
        } else {
            results.forEach((result, index) => {
                const suggestion = document.createElement('div');
                suggestion.className = 'search-suggestion';
                suggestion.setAttribute('data-type', result.type);
                
                // Get type-specific description
                let description = '';
                switch(result.type) {
                    case 'page':
                        description = 'Navigate to page';
                        break;
                    case 'skill':
                        description = 'Technical skill';
                        break;
                    case 'company':
                        description = 'Organization';
                        break;
                    case 'project':
                        description = 'Project work';
                        break;
                    case 'experience':
                        description = 'Work experience';
                        break;
                    case 'education':
                        description = 'Academic background';
                        break;
                    default:
                        description = result.type.charAt(0).toUpperCase() + result.type.slice(1);
                }
                
                suggestion.innerHTML = `
                    <div class="suggestion-icon">
                        <i class="${result.icon}"></i>
                    </div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${highlightText(result.title, query)}</div>
                        <div class="suggestion-type">${description}</div>
                    </div>
                    ${result.url ? '<div class="suggestion-action"><i class="fas fa-external-link-alt"></i></div>' : ''}
                `;
                
                suggestion.addEventListener('click', () => {
                    // Add to search history
                    addToHistory(query);
                    
                    if (result.url) {
                        // Add smooth scrolling for anchor links
                        if (result.url.includes('#')) {
                            const [page, anchor] = result.url.split('#');
                            if (page === window.location.pathname.split('/').pop() || page === '') {
                                // Same page, scroll to anchor
                                const element = document.getElementById(anchor);
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                    searchSuggestions.style.display = 'none';
                                    searchInput.blur();
                                    return;
                                }
                            }
                        }
                        window.location.href = result.url;
                    } else if (result.type === 'history') {
                        // If it's a history item, search for it
                        searchInput.value = result.title;
                        searchContent(result.title);
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

    // Search history functionality
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    function addToHistory(query) {
        if (query && query.length > 1) {
            searchHistory = searchHistory.filter(item => item !== query);
            searchHistory.unshift(query);
            searchHistory = searchHistory.slice(0, 5); // Keep only last 5 searches
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        }
    }
    
    function showSearchHistory() {
        if (searchHistory.length === 0) return;
        
        const historyResults = searchHistory.map(query => ({
            title: query,
            url: null,
            type: 'history',
            icon: 'fas fa-history',
            keywords: []
        }));
        
        displaySuggestions(historyResults, '');
    }

    // Event listeners
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length > 0) {
            searchContent(query);
        } else {
            showSearchHistory();
        }
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value) {
            searchContent(searchInput.value);
        } else {
            showSearchHistory();
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
                } else if (searchInput.value.trim()) {
                    // If no suggestion selected but there's text, add to history and clear
                    addToHistory(searchInput.value.trim());
                    searchSuggestions.style.display = 'none';
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
    console.log('Enhanced search system loaded');
    console.log('Search input:', searchInput);
    console.log('Search suggestions:', searchSuggestions);
    console.log('Available search data:', searchData.length, 'items');
    
    // Test function for debugging
    window.testSearch = function(query = 'home') {
        console.log('Testing search with:', query);
        searchInput.value = query;
        searchContent(query);
    };
    
    // Add search analytics
    window.searchAnalytics = {
        getHistory: () => searchHistory,
        clearHistory: () => {
            searchHistory = [];
            localStorage.removeItem('searchHistory');
            console.log('Search history cleared');
        },
        getSearchData: () => searchData
    };
});