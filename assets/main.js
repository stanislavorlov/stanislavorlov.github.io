document.addEventListener('DOMContentLoaded', () => {
    // Set current year
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Fetch GitHub data
    fetch('https://api.github.com/users/stanislavorlov')
        .then(response => response.json())
        .then(data => {
            document.getElementById('repoCount').textContent = data.public_repos;
            document.getElementById('followers').textContent = data.followers;
            document.getElementById('following').textContent = data.following;
            document.getElementById('profileImage').src = data.avatar_url;
        })
        .catch(error => {
            console.error('Error fetching GitHub data:', error);
        });

    // Mobile menu toggle
    function toggleMenu() {
        const navLinks = document.getElementById('navLinks');
        const menuIcon = document.getElementById('menuIcon');
        navLinks.classList.toggle('active');

        if (navLinks.classList.contains('active')) {
            menuIcon.className = 'fas fa-times';
        } else {
            menuIcon.className = 'fas fa-bars';
        }
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.getElementById('navLinks');
            const menuIcon = document.getElementById('menuIcon');
            navLinks.classList.remove('active');
            menuIcon.className = 'fas fa-bars';
        });
    });
});
