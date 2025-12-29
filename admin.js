 document.addEventListener('DOMContentLoaded', function() {

    // Authentication
    const loginOverlay = document.getElementById('login-overlay');
    const adminContent = document.getElementById('admin-content');
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showAdminContent();
    } else {
        showLoginForm();
    }

    // Detect environment
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? '' : '/.netlify/functions';
    const projectsEndpoint = isLocal ? 'projects' : 'projects-github';

    // Handle login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = passwordInput.value;
        fetch(`${baseUrl}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sessionStorage.setItem('adminLoggedIn', 'true');
                showAdminContent();
            } else {
                loginError.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
            }
        })
        .catch(error => {
            console.error('Auth error:', error);
            loginError.style.display = 'block';
        });
    });

    // Handle logout
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('adminLoggedIn');
        showLoginForm();
    });

    function showLoginForm() {
        loginOverlay.style.display = 'flex';
        adminContent.style.display = 'none';
        passwordInput.focus();
    }

    function showAdminContent() {
        loginOverlay.style.display = 'none';
        adminContent.style.display = 'block';
    }

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

    let projects = [];
    let currentEditIndex = -1;

    const form = document.getElementById('project-form');
    const nameInput = document.getElementById('name');
    const urlInput = document.getElementById('url');
    const descInput = document.getElementById('description');
    const submitBtn = form.querySelector('button[type="submit"]');

    fetch(`${baseUrl}/${projectsEndpoint}`)
        .then(response => response.json())
        .then(data => {
            projects = data;
            displayProjects();
        })
        .catch(error => console.error('Error loading projects:', error));

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const project = {
            id: currentEditIndex === -1 ? Date.now().toString() : projects[currentEditIndex].id,
            name: nameInput.value,
            url: urlInput.value,
            description: descInput.value
        };
        if (currentEditIndex === -1) {
            // Add new
            projects.push(project);
        } else {
            // Update
            projects[currentEditIndex] = project;
            currentEditIndex = -1;
            submitBtn.textContent = 'Add Project';
        }
        fetch(`${baseUrl}/${projectsEndpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projects)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                form.reset();
                displayProjects();
            } else {
                console.error('Failed to save projects');
            }
        })
        .catch(error => console.error('Error saving projects:', error));
    });





    function displayProjects() {
        const list = document.getElementById('projects-list');
        list.innerHTML = '';
        projects.forEach((project, index) => {
            const item = document.createElement('div');
            item.className = 'project-item';
            item.innerHTML = `
                <div>
                    <h3>${project.name}</h3>
                    <p>${project.description}</p>
                    <small>${project.url}</small>
                </div>
                <div class="actions">
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </div>
            `;
            list.appendChild(item);
        });

        // Add event listeners for edit and delete
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                editProject(index);
            });
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deleteProject(index);
            });
        });
    }

    function editProject(index) {
        const project = projects[index];
        nameInput.value = project.name;
        urlInput.value = project.url;
        descInput.value = project.description;
        currentEditIndex = index;
        submitBtn.textContent = 'Update Project';
    }

    function deleteProject(index) {
        if (confirm('Are you sure you want to delete this project?')) {
            projects.splice(index, 1);
            fetch(`${baseUrl}/${projectsEndpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projects)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayProjects();
                } else {
                    console.error('Failed to save projects');
                }
            })
            .catch(error => console.error('Error saving projects:', error));
        }
    }
});