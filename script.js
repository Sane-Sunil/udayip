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
    const projectsEndpoint = 'projects';
    
    loadProjects();

    function loadProjects() {
        const url = `${baseUrl}/${projectsEndpoint}?t=${Date.now()}`;
        console.log('Fetching from:', url);
        
        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log('Response status:', response.status);
                console.log('Response OK:', response.ok);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return response.text().then(text => {
                    console.log('Response text:', text);
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        console.error('Failed to parse JSON:', e);
                        throw new Error('Invalid JSON response');
                    }
                });
            })
            .then(data => {
                console.log('Received data:', data);
                // Ensure projects is always an array
                const projects = Array.isArray(data) ? data : [];
                displayProjects(projects);
            })
            .catch(error => {
                console.error('Error loading projects:', error);
                displayProjects([]);
            });
    }

    function displayProjects(projects) {
        const container = document.getElementById('projects-container');
        container.innerHTML = '';
        
        // Ensure projects is an array
        if (!Array.isArray(projects)) {
            projects = [];
        }
        
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