document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');

    // Initial theme is applied by the inline script in <head>; sync the icon
    setTheme(document.documentElement.getAttribute('data-theme') || 'dark');

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('theme', theme); } catch (e) { }

        // Update icon
        if (theme === 'light') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }

    // Set current year
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Use the GitHub avatar as the profile photo
    fetch('https://api.github.com/users/stanislavorlov')
        .then(response => response.json())
        .then(data => {
            const profileImage = document.getElementById('profileImage');
            if (profileImage && data.avatar_url) profileImage.src = data.avatar_url;
        })
        .catch(error => {
            console.error('Error fetching GitHub data:', error);
        });

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Fetch and render projects tagged with the `portfolio` topic on GitHub
    const projectsGrid = document.getElementById('projectsGrid');
    if (projectsGrid) {
        const languageIcons = {
            'Python': 'fab fa-python',
            'JavaScript': 'fab fa-js',
            'TypeScript': 'fab fa-js',
            'Go': 'fab fa-golang',
            'Rust': 'fab fa-rust',
            'Java': 'fab fa-java',
            'C#': 'fab fa-microsoft',
            'HTML': 'fab fa-html5'
        };

        fetch('./projects.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load projects.json');
                return response.json();
            })
            .then(projects => {
                if (!Array.isArray(projects) || projects.length === 0) return;

                projectsGrid.innerHTML = projects.map(project => {
                    const icon = languageIcons[project.language] || 'fas fa-code';
                    const tags = (project.tags || [])
                        .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
                        .join('');

                    return `
                    <article class="card project-card">
                        <i class="${icon} card-icon"></i>
                        <h3>${escapeHtml(project.title)}</h3>
                        <p>${escapeHtml(project.description)}</p>
                        <div class="tags">${tags}</div>
                        <a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer"
                            class="text-link">View on GitHub <i class="fas fa-arrow-right"></i></a>
                    </article>`;
                }).join('');
            })
            .catch(error => {
                console.warn('Could not load projects.json, keeping fallback projects:', error);
            });
    }

    // Fetch and dynamically render latest blog posts
    const blogGrid = document.getElementById('blogGrid');
    if (blogGrid) {
        fetch('./latest-posts.json')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load latest-posts.json');
                return response.json();
            })
            .then(posts => {
                if (!Array.isArray(posts) || posts.length === 0) return;

                blogGrid.innerHTML = posts.map(item => {
                    const post = item.node || item;
                    const dateObj = post.publishedAt ? new Date(post.publishedAt) : null;
                    const formattedDate = dateObj && !isNaN(dateObj)
                        ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : (post.publishedAt || '');
                    const readTime = post.readTimeInMinutes
                        ? `${post.readTimeInMinutes} min read`
                        : '5 min read';
                    const brief = post.brief ? post.brief.trim() : '';
                    const excerpt = brief.length > 200 ? brief.slice(0, 200) + '...' : brief;

                    return `
                <article class="post">
                    <div class="post-meta">${escapeHtml(formattedDate)} &middot; ${escapeHtml(readTime)}</div>
                    <div class="post-body">
                        <h3><a href="${escapeHtml(post.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.title)}</a></h3>
                        <p>${escapeHtml(excerpt)}</p>
                    </div>
                </article>`;
                }).join('');
            })
            .catch(error => {
                console.warn('Could not load latest-posts.json, keeping fallback posts:', error);
            });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.getElementById('navLinks');
            const menuIcon = document.getElementById('menuIcon');
            if (navLinks && menuIcon) {
                navLinks.classList.remove('active');
                menuIcon.className = 'fas fa-bars';
            }
        });
    });
});

// Mobile menu toggle (Global scope for onclick)
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuIcon = document.getElementById('menuIcon');
    if (navLinks && menuIcon) {
        navLinks.classList.toggle('active');

        if (navLinks.classList.contains('active')) {
            menuIcon.className = 'fas fa-times';
        } else {
            menuIcon.className = 'fas fa-bars';
        }
    }
}
