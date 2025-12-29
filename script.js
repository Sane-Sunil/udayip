document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });

    // Detect environment and load projects from API
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? '' : '/.netlify/functions';
    const projectsEndpoint = isLocal ? 'projects' : 'projects-github';
    
    loadProjects();

    function loadProjects() {
        fetch(`${baseUrl}/${projectsEndpoint}`)
            .then(response => response.json())
            .then(projects => {
                displayProjects(projects);
            })
            .catch(error => console.error('Error loading projects:', error));
    }

    function displayProjects(projects) {
        const container = document.getElementById('projects-container');
        container.innerHTML = '';
        const emojis = ['🚀', '💻', '🌐', '🎨', '⚡', '🔥'];
        projects.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = () => window.open(project.url, '_blank');
            const emoji = emojis[index % emojis.length];
            card.innerHTML = `
                <div class="emoji">${emoji}</div>
                <h3>${project.name}</h3>
                <p>${project.description}</p>
            `;
            container.appendChild(card);
        });
    }
});