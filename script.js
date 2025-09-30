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

    // Advanced Search System
    class AdvancedSearch {
        constructor() {
            this.searchIndex = this.buildSearchIndex();
            this.searchHistory = this.loadSearchHistory();
            this.searchResults = [];
            this.selectedIndex = -1;
            this.minSearchLength = 1;
            this.maxSuggestions = 8;
            this.debounceDelay = 200;
        }

        buildSearchIndex() {
            return {
                pages: [
                    {
                        id: 'home',
                        title: 'Home',
                        url: 'index.html',
                        keywords: ['home', 'about', 'profile', 'ayush', 'goyal', 'computer science', 'usc', 'masters'],
                        content: 'Ayush Goyal Computer Science graduate student University of Southern California NLP Computer Vision XAI multimodal AI research assistant KAIST Adobe Research Goldman Sachs',
                        category: 'main',
                        priority: 10
                    },
                    {
                        id: 'experience',
                        title: 'Experience',
                        url: 'experience.html',
                        keywords: ['experience', 'work', 'internship', 'research', 'kaist', 'adobe', 'goldman sachs', 'quantitative', 'strategy'],
                        content: 'SAIL KAIST Research Assistant Adobe Research Intern Goldman Sachs Quant Strat FICC Mortgage Strats IRP SMM CMBS valuation models XAI metrics StyleGAN2 compression',
                        category: 'experience',
                        priority: 9
                    },
                    {
                        id: 'projects',
                        title: 'Projects',
                        url: 'projects.html',
                        keywords: ['projects', 'portfolio', 'github', 'counter-speech', 'nlp', 'fact-checking', 'ai', 'machine learning'],
                        content: 'Intent based CounterSpeech Claim Span Identification CSI AI-powered fact-checking argument analysis hate speech multimodal AI systems',
                        category: 'projects',
                        priority: 8
                    },
                    {
                        id: 'education',
                        title: 'Education',
                        url: 'education.html',
                        keywords: ['education', 'university', 'usc', 'iit delhi', 'courses', 'gpa', 'masters', 'bachelor', 'computer science'],
                        content: 'University of Southern California USC MS Computer Science IIT Delhi BTech Mathematics Computing CSCI courses algorithms NLP robotics deep learning computer vision',
                        category: 'education',
                        priority: 7
                    }
                ],
                skills: [
                    { term: 'Natural Language Processing', aliases: ['NLP', 'text processing', 'language models'] },
                    { term: 'Computer Vision', aliases: ['CV', 'image processing', 'visual recognition'] },
                    { term: 'Explainable AI', aliases: ['XAI', 'interpretable AI', 'model explanation'] },
                    { term: 'Machine Learning', aliases: ['ML', 'deep learning', 'neural networks'] },
                    { term: 'Python', aliases: ['py', 'python programming'] },
                    { term: 'PyTorch', aliases: ['pytorch', 'deep learning framework'] },
                    { term: 'Quantitative Analysis', aliases: ['quant', 'financial modeling', 'risk analysis'] },
                    { term: 'Research', aliases: ['academic research', 'scientific research'] }
                ],
                companies: [
                    { name: 'KAIST', aliases: ['Korea Advanced Institute', 'SAIL KAIST'] },
                    { name: 'Adobe', aliases: ['Adobe Research', 'Adobe Inc'] },
                    { name: 'Goldman Sachs', aliases: ['GS', 'Goldman', 'FICC', 'Mortgage Strats'] },
                    { name: 'USC', aliases: ['University of Southern California'] },
                    { name: 'IIT Delhi', aliases: ['IITD', 'Indian Institute of Technology'] }
                ]
            };
        }

        // Fuzzy search algorithm
        fuzzyMatch(query, text, threshold = 0.6) {
            if (!query || !text) return 0;
            
            const queryLower = query.toLowerCase();
            const textLower = text.toLowerCase();
            
            // Exact match gets highest score
            if (textLower.includes(queryLower)) {
                return 1.0;
            }
            
            // Levenshtein distance-based scoring
            const distance = this.levenshteinDistance(queryLower, textLower);
            const maxLength = Math.max(queryLower.length, textLower.length);
            const similarity = 1 - (distance / maxLength);
            
            return similarity >= threshold ? similarity : 0;
        }

        levenshteinDistance(str1, str2) {
            const matrix = [];
            for (let i = 0; i <= str2.length; i++) {
                matrix[i] = [i];
            }
            for (let j = 0; j <= str1.length; j++) {
                matrix[0][j] = j;
            }
            for (let i = 1; i <= str2.length; i++) {
                for (let j = 1; j <= str1.length; j++) {
                    if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1,
                            matrix[i][j - 1] + 1,
                            matrix[i - 1][j] + 1
                        );
                    }
                }
            }
            return matrix[str2.length][str1.length];
        }

        // Advanced search with ranking
        search(query) {
            if (!query || query.length < this.minSearchLength) {
                return [];
            }

            const queryLower = query.toLowerCase();
            const results = [];

            // Search pages
            this.searchIndex.pages.forEach(page => {
                let score = 0;
                
                // Title match (highest priority)
                const titleScore = this.fuzzyMatch(queryLower, page.title);
                if (titleScore > 0) score += titleScore * 3;
                
                // Keyword match
                const keywordMatch = page.keywords.some(keyword => 
                    keyword.toLowerCase().includes(queryLower)
                );
                if (keywordMatch) score += 2;
                
                // Content match
                const contentScore = this.fuzzyMatch(queryLower, page.content);
                if (contentScore > 0) score += contentScore;
                
                // Priority boost
                score += page.priority * 0.1;
                
                if (score > 0) {
                    results.push({
                        ...page,
                        score,
                        type: 'page',
                        matchType: titleScore > 0.8 ? 'title' : keywordMatch ? 'keyword' : 'content'
                    });
                }
            });

            // Search skills
            this.searchIndex.skills.forEach(skill => {
                const skillScore = this.fuzzyMatch(queryLower, skill.term);
                const aliasScore = Math.max(...skill.aliases.map(alias => 
                    this.fuzzyMatch(queryLower, alias)
                ));
                
                const maxScore = Math.max(skillScore, aliasScore);
                if (maxScore > 0.5) {
                    results.push({
                        title: skill.term,
                        url: null,
                        score: maxScore * 2,
                        type: 'skill',
                        matchType: 'skill',
                        aliases: skill.aliases
                    });
                }
            });

            // Search companies
            this.searchIndex.companies.forEach(company => {
                const companyScore = this.fuzzyMatch(queryLower, company.name);
                const aliasScore = Math.max(...company.aliases.map(alias => 
                    this.fuzzyMatch(queryLower, alias)
                ));
                
                const maxScore = Math.max(companyScore, aliasScore);
                if (maxScore > 0.5) {
                    results.push({
                        title: company.name,
                        url: null,
                        score: maxScore * 1.5,
                        type: 'company',
                        matchType: 'company',
                        aliases: company.aliases
                    });
                }
            });

            // Sort by score and return top results
            return results
                .sort((a, b) => b.score - a.score)
                .slice(0, this.maxSuggestions);
        }

        // Generate search suggestions
        generateSuggestions(query) {
            const results = this.search(query);
            const suggestions = [];

            // Add search history suggestions
            if (query.length >= 2) {
                const historyMatches = this.searchHistory
                    .filter(term => term.toLowerCase().includes(query.toLowerCase()))
                    .slice(0, 3);
                
                historyMatches.forEach(term => {
                    suggestions.push({
                        title: term,
                        type: 'history',
                        icon: 'fas fa-history'
                    });
                });
            }

            // Add main results
            results.forEach(result => {
                let icon = 'fas fa-file';
                if (result.type === 'skill') icon = 'fas fa-code';
                else if (result.type === 'company') icon = 'fas fa-building';
                else if (result.matchType === 'title') icon = 'fas fa-star';
                
                suggestions.push({
                    title: result.title,
                    url: result.url,
                    type: result.type,
                    icon: icon,
                    score: result.score,
                    matchType: result.matchType
                });
            });

            return suggestions.slice(0, this.maxSuggestions);
        }

        // Save search history
        saveSearchHistory(query) {
            if (!query || query.length < 2) return;
            
            this.searchHistory = this.searchHistory.filter(term => 
                term.toLowerCase() !== query.toLowerCase()
            );
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10); // Keep last 10 searches
            
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        }

        // Load search history
        loadSearchHistory() {
            try {
                return JSON.parse(localStorage.getItem('searchHistory')) || [];
            } catch {
                return [];
            }
        }
    }

    // Initialize advanced search
    const advancedSearch = new AdvancedSearch();

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

    // Simple fallback search function for testing
    function simpleSearch(query) {
        const simpleResults = [
            { title: 'Home', url: 'index.html', type: 'page', icon: 'fas fa-home' },
            { title: 'Experience', url: 'experience.html', type: 'page', icon: 'fas fa-briefcase' },
            { title: 'Projects', url: 'projects.html', type: 'page', icon: 'fas fa-code' },
            { title: 'Education', url: 'education.html', type: 'page', icon: 'fas fa-graduation-cap' },
            { title: 'Natural Language Processing', url: null, type: 'skill', icon: 'fas fa-language' },
            { title: 'Computer Vision', url: null, type: 'skill', icon: 'fas fa-eye' },
            { title: 'Machine Learning', url: null, type: 'skill', icon: 'fas fa-brain' },
            { title: 'Python', url: null, type: 'skill', icon: 'fab fa-python' },
            { title: 'KAIST', url: null, type: 'company', icon: 'fas fa-university' },
            { title: 'Adobe', url: null, type: 'company', icon: 'fab fa-adobe' },
            { title: 'Goldman Sachs', url: null, type: 'company', icon: 'fas fa-building' },
            { title: 'USC', url: null, type: 'company', icon: 'fas fa-university' }
        ];

        return simpleResults.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);
    }

    // Enhanced search function with fallback
    function performSearch() {
        const query = searchInput.value.trim();
        console.log('Search query:', query); // Debug log
        
        if (query.length < 1) {
            searchSuggestions.innerHTML = '';
            searchSuggestions.style.display = 'none';
            advancedSearch.searchResults = [];
            advancedSearch.selectedIndex = -1;
            return;
        }

        let suggestions = [];
        
        // Try advanced search first
        try {
            suggestions = advancedSearch.generateSuggestions(query);
            console.log('Advanced search results:', suggestions); // Debug log
        } catch (error) {
            console.error('Advanced search error:', error); // Debug log
        }
        
        // Fallback to simple search if no results
        if (suggestions.length === 0) {
            suggestions = simpleSearch(query);
            console.log('Simple search results:', suggestions); // Debug log
        }
        
        advancedSearch.searchResults = suggestions;
        displayAdvancedSuggestions(suggestions, query);
    }

    function displayAdvancedSuggestions(suggestions, query) {
        console.log('Displaying suggestions:', suggestions); // Debug log
        searchSuggestions.innerHTML = '';
        
        if (suggestions.length === 0) {
            searchSuggestions.innerHTML = `
                <div class="search-suggestion no-results">
                    <i class="fas fa-search"></i>
                    <span>No results found for "${query}"</span>
                </div>
            `;
            searchSuggestions.style.display = 'block';
            return;
        }

        suggestions.forEach((suggestion, index) => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'search-suggestion';
            suggestionItem.setAttribute('data-index', index);
            suggestionItem.setAttribute('data-type', suggestion.type);
            
            let content = '';
            if (suggestion.type === 'history') {
                content = `
                    <div class="suggestion-icon">
                        <i class="${suggestion.icon}"></i>
                    </div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${highlightMatch(suggestion.title, query)}</div>
                        <div class="suggestion-type">Recent search</div>
                    </div>
                `;
            } else if (suggestion.url) {
                content = `
                    <div class="suggestion-icon">
                        <i class="${suggestion.icon}"></i>
                    </div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${highlightMatch(suggestion.title, query)}</div>
                        <div class="suggestion-type">${suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}</div>
                    </div>
                    <div class="suggestion-action">
                        <i class="fas fa-external-link-alt"></i>
                    </div>
                `;
            } else {
                content = `
                    <div class="suggestion-icon">
                        <i class="${suggestion.icon}"></i>
                    </div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${highlightMatch(suggestion.title, query)}</div>
                        <div class="suggestion-type">${suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}</div>
                    </div>
                `;
            }
            
            suggestionItem.innerHTML = content;
            
            suggestionItem.addEventListener('click', () => {
                if (suggestion.url) {
                    advancedSearch.saveSearchHistory(query);
                    window.location.href = suggestion.url;
                } else {
                    // For skills/companies, search for related content
                    searchInput.value = suggestion.title;
                    performSearch();
                }
            });
            
            searchSuggestions.appendChild(suggestionItem);
        });
        
        searchSuggestions.style.display = 'block';
        console.log('Suggestions displayed, count:', suggestions.length); // Debug log
    }

    function highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Enhanced keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        const suggestions = searchSuggestions.children;
        if (suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                advancedSearch.selectedIndex = Math.min(
                    advancedSearch.selectedIndex + 1, 
                    suggestions.length - 1
                );
                updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                advancedSearch.selectedIndex = Math.max(advancedSearch.selectedIndex - 1, -1);
                updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (advancedSearch.selectedIndex >= 0 && 
                    advancedSearch.searchResults[advancedSearch.selectedIndex]) {
                    const selectedSuggestion = advancedSearch.searchResults[advancedSearch.selectedIndex];
                    if (selectedSuggestion.url) {
                        advancedSearch.saveSearchHistory(searchInput.value.trim());
                        window.location.href = selectedSuggestion.url;
                    }
                }
                break;
            case 'Escape':
                searchSuggestions.innerHTML = '';
                searchInput.blur();
                advancedSearch.selectedIndex = -1;
                break;
        }
    });

    function updateSelection() {
        Array.from(searchSuggestions.children).forEach((item, index) => {
            item.classList.toggle('selected', index === advancedSearch.selectedIndex);
        });
    }

    // Reset selection when typing
    searchInput.addEventListener('input', () => {
        advancedSearch.selectedIndex = -1;
    });

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

    // Advanced search functionality
    searchInput.addEventListener('input', (e) => {
        console.log('Input event triggered:', e.target.value); // Debug log
        // Use setTimeout instead of debounce for immediate testing
        setTimeout(() => {
            performSearch();
        }, 100);
    });

    // Toggle search bar visibility
    searchIcon.addEventListener('click', () => {
        searchBar.classList.toggle('active');
        searchInput.focus();
        console.log('Search icon clicked'); // Debug log
    });

    // Close search suggestions when clicking outside
    document.addEventListener('click', (event) => {
        if (!searchBar.contains(event.target)) {
            searchSuggestions.innerHTML = '';
            searchSuggestions.style.display = 'none';
            advancedSearch.selectedIndex = -1;
        }
    });

    // Search input focus events
    searchInput.addEventListener('focus', () => {
        console.log('Search input focused'); // Debug log
        if (searchInput.value.trim().length >= advancedSearch.minSearchLength) {
            performSearch();
        }
    });

    // Test search functionality
    console.log('Search system initialized'); // Debug log
    console.log('Search input element:', searchInput); // Debug log
    console.log('Search suggestions element:', searchSuggestions); // Debug log
    
    // Test function - can be called from browser console
    window.testSearch = function(query = 'home') {
        console.log('Testing search with query:', query);
        searchInput.value = query;
        performSearch();
    };
    
    // Auto-test on page load
    setTimeout(() => {
        console.log('Auto-testing search...');
        testSearch('home');
    }, 1000);

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