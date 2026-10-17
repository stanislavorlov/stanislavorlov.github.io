document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');

    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');
    setTheme(initialTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

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

    // Fetch GitHub data
    fetch('https://api.github.com/users/stanislavorlov')
        .then(response => response.json())
        .then(data => {
            const elements = {
                repoCount: document.getElementById('repoCount'),
                followers: document.getElementById('followers'),
                following: document.getElementById('following'),
                profileImage: document.getElementById('profileImage')
            };

            if (elements.repoCount) elements.repoCount.textContent = data.public_repos;
            if (elements.followers) elements.followers.textContent = data.followers;
            if (elements.following) elements.following.textContent = data.following;
            if (elements.profileImage) elements.profileImage.src = data.avatar_url;
        })
        .catch(error => {
            console.error('Error fetching GitHub data:', error);
        });

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

                function escapeHtml(str) {
                    if (!str) return '';
                    return String(str)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                }

                blogGrid.innerHTML = posts.map(item => {
                    const post = item.node || item;
                    const dateObj = post.publishedAt ? new Date(post.publishedAt) : null;
                    const formattedDate = dateObj && !isNaN(dateObj)
                        ? dateObj.toISOString().split('T')[0]
                        : (post.publishedAt || '');
                    const readTime = post.readTimeInMinutes
                        ? `${post.readTimeInMinutes} min read`
                        : '5 min read';
                    const brief = post.brief ? post.brief.trim() : '';
                    const excerpt = brief.length > 160 ? brief.slice(0, 160) + '...' : brief;

                    return `
                <article class="blog-card">
                    <div class="blog-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <div class="blog-meta">
                        <span>${escapeHtml(formattedDate)}</span>
                        <span>•</span>
                        <span>${escapeHtml(readTime)}</span>
                    </div>
                    <h3 class="blog-title">${escapeHtml(post.title)}</h3>
                    <p class="blog-excerpt">${escapeHtml(excerpt)}</p>
                    <a href="${escapeHtml(post.url)}" target="_blank" rel="noopener noreferrer" class="blog-link">Read more →</a>
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
    // Typewriter effect for Hero Title
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        const textToType = "Hi, there!";
        typewriterElement.textContent = "";
        let count = 0;

        function typeWriter() {
            if (count < textToType.length) {
                typewriterElement.textContent += textToType.charAt(count);
                count++;
                setTimeout(typeWriter, Math.random() * 80 + 50);
            }
        }

        setTimeout(typeWriter, 800);
    }
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
