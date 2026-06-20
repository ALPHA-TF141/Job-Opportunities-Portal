/**
 * Job Portal Application
 * A modern, interactive job listing platform with advanced filtering, search, and user preferences
 * Features: Search, Filtering, Pagination, Dark Mode, Saved Jobs, Job Details Modal
 */

// ============================================
// DOM ELEMENTS
// ============================================
const jobsContainer = document.getElementById("jobsContainer");
const searchInput = document.getElementById("searchInput");
const locationFilter = document.getElementById("locationFilter");
const companyFilter = document.getElementById("companyFilter");
const darkModeBtn = document.getElementById("darkModeBtn");
const pagination = document.getElementById("pagination");
const pageNumber = document.getElementById("pageNumber");
const totalPages = document.getElementById("totalPages");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const jobModal = document.getElementById("jobModal");
const modalBody = document.getElementById("modalBody");
const toast = document.getElementById("toast");
const filterSummary = document.getElementById("filterSummary");
const resultText = document.getElementById("resultText");

// ============================================
// APPLICATION STATE
// ============================================
let jobs = [];
let filteredJobs = [];
let savedJobs = new Set();

let currentPage = 1;
const jobsPerPage = 6;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    loadSavedJobs();
    loadDarkModePreference();
    fetchJobs();
    setupEventListeners();
});

/**
 * Setup all event listeners for user interactions
 */
function setupEventListeners() {
    // Search input with debouncing
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            filterJobs();
        }, 300);
    });

    // Filter changes
    locationFilter.addEventListener("change", () => {
        currentPage = 1;
        filterJobs();
    });

    companyFilter.addEventListener("change", () => {
        currentPage = 1;
        filterJobs();
    });

    // Pagination
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderJobs();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });

    nextBtn.addEventListener("click", () => {
        const maxPages = Math.ceil(filteredJobs.length / jobsPerPage);
        if (currentPage < maxPages) {
            currentPage++;
            renderJobs();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });

    // Dark mode toggle
    darkModeBtn.addEventListener("click", toggleDarkMode);

    // Modal close button
    document.querySelector(".modal-close").addEventListener("click", () => {
        jobModal.classList.remove("active");
    });

    // Close modal when clicking outside
    jobModal.addEventListener("click", (e) => {
        if (e.target === jobModal) {
            jobModal.classList.remove("active");
        }
    });

    // Clear filters button
    document.getElementById("clearFiltersBtn")?.addEventListener("click", () => {
        searchInput.value = "";
        locationFilter.value = "";
        companyFilter.value = "";
        currentPage = 1;
        filterJobs();
    });
}

// ============================================
// DATA FETCHING & PROCESSING
// ============================================

/**
 * Fetch jobs from API with enhanced job data
 */
async function fetchJobs() {
    try {
        showLoading();

        const response = await fetch(
            "https://jsonplaceholder.typicode.com/users"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch jobs");
        }

        const data = await response.json();

        // Map API data to job objects with realistic job information
        jobs = data.map((user, index) => ({
            id: user.id,
            title: getRandomJobTitle(),
            company: user.company.name,
            location: user.address.city,
            description: user.company.catchPhrase,
            salary: `$${50000 + Math.floor(Math.random() * 100000)}`,
            type: getRandomJobType(),
            level: getRandomLevel(),
            posted: getRandomDate(),
            skills: getRandomSkills()
        }));

        filteredJobs = [...jobs];
        
        updateStats();
        populateFilters();
        renderJobs();
    } catch (error) {
        showError("Failed to load jobs. Please try again later.");
        console.error("Fetch error:", error);
    }
}

/**
 * Generate random job titles for variety
 */
function getRandomJobTitle() {
    const titles = [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "UI/UX Designer",
        "DevOps Engineer",
        "Data Scientist",
        "Product Manager",
        "Mobile Developer",
        "QA Engineer",
        "System Administrator"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
}

/**
 * Generate random job types
 */
function getRandomJobType() {
    const types = ["Full-time", "Part-time", "Contract", "Remote"];
    return types[Math.floor(Math.random() * types.length)];
}

/**
 * Generate random experience levels
 */
function getRandomLevel() {
    const levels = ["Entry Level", "Mid Level", "Senior", "Lead"];
    return levels[Math.floor(Math.random() * levels.length)];
}

/**
 * Generate random posting dates
 */
function getRandomDate() {
    const days = Math.floor(Math.random() * 30);
    return `${days}d ago`;
}

/**
 * Generate random skills
 */
function getRandomSkills() {
    const allSkills = [
        "JavaScript", "React", "Node.js", "Python", "SQL",
        "TypeScript", "Vue.js", "Angular", "MongoDB", "PostgreSQL",
        "AWS", "Docker", "Git", "REST API", "GraphQL"
    ];
    const numSkills = Math.floor(Math.random() * 3) + 2;
    return allSkills
        .sort(() => Math.random() - 0.5)
        .slice(0, numSkills);
}

// ============================================
// FILTERING & SEARCH
// ============================================

/**
 * Populate filter dropdowns with unique values
 */
function populateFilters() {
    const locations = [...new Set(jobs.map(job => job.location))].sort();
    const companies = [...new Set(jobs.map(job => job.company))].sort();

    // Clear existing options (except the first "All" option)
    locationFilter.innerHTML = '<option value="">📍 All Locations</option>';
    companyFilter.innerHTML = '<option value="">🏢 All Companies</option>';

    locations.forEach(location => {
        const option = document.createElement("option");
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });

    companies.forEach(company => {
        const option = document.createElement("option");
        option.value = company;
        option.textContent = company;
        companyFilter.appendChild(option);
    });
}

/**
 * Filter jobs based on search input and select filters
 */
function filterJobs() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedLocation = locationFilter.value;
    const selectedCompany = companyFilter.value;

    filteredJobs = jobs.filter(job => {
        const matchesSearch = 
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm) ||
            job.description.toLowerCase().includes(searchTerm) ||
            job.skills.some(skill => skill.toLowerCase().includes(searchTerm));

        const matchesLocation = !selectedLocation || job.location === selectedLocation;
        const matchesCompany = !selectedCompany || job.company === selectedCompany;

        return matchesSearch && matchesLocation && matchesCompany;
    });

    currentPage = 1;
    updateFilterSummary();
    renderJobs();
}

/**
 * Update filter summary display
 */
function updateFilterSummary() {
    const isFiltered = 
        searchInput.value ||
        locationFilter.value ||
        companyFilter.value;

    if (isFiltered) {
        filterSummary.style.display = "flex";
        resultText.textContent = `Found ${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} matching your criteria`;
    } else {
        filterSummary.style.display = "none";
    }
}

// ============================================
// RENDERING
// ============================================

/**
 * Show loading skeleton cards
 */
function showLoading() {
    jobsContainer.innerHTML = "";
    for (let i = 0; i < jobsPerPage; i++) {
        jobsContainer.innerHTML += '<div class="loading-card"></div>';
    }
}

/**
 * Render job cards with pagination
 */
function renderJobs() {
    if (filteredJobs.length === 0) {
        jobsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No Jobs Found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        pagination.style.display = "none";
        return;
    }

    const start = (currentPage - 1) * jobsPerPage;
    const end = start + jobsPerPage;
    const paginatedJobs = filteredJobs.slice(start, end);

    jobsContainer.innerHTML = paginatedJobs
        .map(job => createJobCard(job))
        .join("");

    updatePagination();
    pagination.style.display = "flex";

    // Add event listeners to newly created elements
    document.querySelectorAll(".job-card").forEach(card => {
        card.addEventListener("click", () => {
            const jobId = card.dataset.jobId;
            const job = jobs.find(j => j.id == jobId);
            showJobModal(job);
        });
    });

    document.querySelectorAll(".btn-secondary").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const jobId = btn.dataset.jobId;
            const job = jobs.find(j => j.id == jobId);
            toggleSavedJob(job);
            updateSaveButton(btn, jobId);
        });
    });

    document.querySelectorAll(".btn-primary").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            showToast("Application submitted! We'll be in touch soon.", "success");
        });
    });
}

/**
 * Create HTML for a job card
 */
function createJobCard(job) {
    const isSaved = savedJobs.has(job.id);
    const saveButtonClass = isSaved ? "btn-saved" : "btn-secondary";
    const saveButtonText = isSaved ? "❤️ Saved" : "💙 Save";

    return `
        <div class="job-card" data-job-id="${job.id}">
            <div class="job-header">
                <div class="job-title">${escapeHtml(job.title)}</div>
                <div class="job-company">${escapeHtml(job.company)}</div>
            </div>
            <div class="job-body">
                <div class="job-meta">
                    <span class="meta-item">📍 ${escapeHtml(job.location)}</span>
                    <span class="meta-item">💼 ${escapeHtml(job.type)}</span>
                    <span class="meta-item">📊 ${escapeHtml(job.level)}</span>
                    <span class="meta-item">⏰ ${escapeHtml(job.posted)}</span>
                    <span class="meta-item">💰 ${escapeHtml(job.salary)}</span>
                </div>
                <div class="job-description">${escapeHtml(job.description)}</div>
            </div>
            <div class="job-footer">
                <button class="btn btn-primary">Apply Now →</button>
                <button class="btn ${saveButtonClass}" data-job-id="${job.id}">${saveButtonText}</button>
            </div>
        </div>
    `;
}

/**
 * Show job details in modal
 */
function showJobModal(job) {
    const skillsList = job.skills.map(skill => `<span style="display: inline-block; background: #f0f0f0; padding: 0.25rem 0.75rem; border-radius: 0.25rem; margin-right: 0.5rem; margin-bottom: 0.5rem; font-size: 0.85rem;">${escapeHtml(skill)}</span>`).join("");

    modalBody.innerHTML = `
        <h2>${escapeHtml(job.title)}</h2>
        <p style="font-size: 1.1rem; color: #007bff; font-weight: 600; margin-bottom: 0.5rem;">${escapeHtml(job.company)}</p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0;">
            <div>
                <strong>📍 Location:</strong> ${escapeHtml(job.location)}
            </div>
            <div>
                <strong>💼 Type:</strong> ${escapeHtml(job.type)}
            </div>
            <div>
                <strong>📊 Level:</strong> ${escapeHtml(job.level)}
            </div>
            <div>
                <strong>💰 Salary:</strong> ${escapeHtml(job.salary)}
            </div>
        </div>

        <div style="margin: 1.5rem 0;">
            <strong>About this role:</strong>
            <p style="margin-top: 0.5rem; color: #666;">${escapeHtml(job.description)}</p>
        </div>

        <div style="margin: 1.5rem 0;">
            <strong>Required Skills:</strong>
            <div style="margin-top: 0.5rem;">${skillsList}</div>
        </div>

        <div class="modal-actions">
            <button class="btn btn-primary" onclick="showToast('Application submitted! Check your email for confirmation.', 'success')">Apply Now</button>
            <button class="btn btn-secondary" onclick="toggleSavedJobFromModal(${job.id})">Save Job</button>
        </div>
    `;

    jobModal.classList.add("active");
}

/**
 * Update pagination controls
 */
function updatePagination() {
    const totalResults = Math.ceil(filteredJobs.length / jobsPerPage);
    pageNumber.textContent = currentPage;
    totalPages.textContent = totalResults;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalResults;
}

// ============================================
// SAVED JOBS MANAGEMENT
// ============================================

/**
 * Load saved jobs from localStorage
 */
function loadSavedJobs() {
    const saved = localStorage.getItem("savedJobs");
    if (saved) {
        savedJobs = new Set(JSON.parse(saved));
    }
    updateSavedJobsCount();
}

/**
 * Save jobs to localStorage
 */
function saveSavedJobs() {
    localStorage.setItem("savedJobs", JSON.stringify([...savedJobs]));
    updateSavedJobsCount();
}

/**
 * Toggle job saved status
 */
function toggleSavedJob(job) {
    if (savedJobs.has(job.id)) {
        savedJobs.delete(job.id);
        showToast("Job removed from saved jobs", "warning");
    } else {
        savedJobs.add(job.id);
        showToast("Job saved successfully!", "success");
    }
    saveSavedJobs();
}

/**
 * Toggle saved job from modal
 */
function toggleSavedJobFromModal(jobId) {
    const job = jobs.find(j => j.id === jobId);
    toggleSavedJob(job);
}

/**
 * Update save button appearance
 */
function updateSaveButton(btn, jobId) {
    if (savedJobs.has(jobId)) {
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-saved");
        btn.textContent = "❤️ Saved";
    } else {
        btn.classList.remove("btn-saved");
        btn.classList.add("btn-secondary");
        btn.textContent = "💙 Save";
    }
}

// ============================================
// STATISTICS
// ============================================

/**
 * Update stats display
 */
function updateStats() {
    const totalJobs = jobs.length;
    const totalCompanies = new Set(jobs.map(job => job.company)).size;
    const totalLocations = new Set(jobs.map(job => job.location)).size;

    document.getElementById("totalJobsCount").textContent = totalJobs;
    document.getElementById("totalCompaniesCount").textContent = totalCompanies;
    document.getElementById("totalLocationsCount").textContent = totalLocations;
}

/**
 * Update saved jobs count
 */
function updateSavedJobsCount() {
    document.getElementById("savedJobsCount").textContent = savedJobs.size;
}

// ============================================
// DARK MODE
// ============================================

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
    );
    updateDarkModeButton();
}

/**
 * Load dark mode preference
 */
function loadDarkModePreference() {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
        document.body.classList.add("dark");
    }
    updateDarkModeButton();
}

/**
 * Update dark mode button text
 */
function updateDarkModeButton() {
    const isDark = document.body.classList.contains("dark");
    darkModeBtn.textContent = isDark ? "☀️ Light" : "🌙 Dark";
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Show toast notification
 */
function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/**
 * Show error message
 */
function showError(message) {
    jobsContainer.innerHTML = `
        <div class="error">
            ⚠️ ${escapeHtml(message)}
        </div>
    `;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

    jobsContainer.innerHTML = "";

    paginatedJobs.forEach(job => {

        jobsContainer.innerHTML += `
        
        <div class="job-card">

            <h3>${job.title}</h3>

            <p>
                <strong>Company:</strong>
                ${job.company}
            </p>

            <p>
                <strong>Location:</strong>
                ${job.location}
            </p>

            <p>
                ${job.description}
            </p>

        </div>

        `;

    });

    document.getElementById("pageNumber")
        .textContent = currentPage;
}

function filterJobs() {

    const search =
        searchInput.value.toLowerCase();

    const location =
        locationFilter.value;

    const company =
        companyFilter.value;

    filteredJobs = jobs.filter(job => {

        return (
            job.title.toLowerCase()
                .includes(search)

            &&

            (location === "" ||
                job.location === location)

            &&

            (company === "" ||
                job.company === company)
        );

    });

    currentPage = 1;

    renderJobs();
}

searchInput.addEventListener(
    "input",
    filterJobs
);

locationFilter.addEventListener(
    "change",
    filterJobs
);

companyFilter.addEventListener(
    "change",
    filterJobs
);

document.getElementById("nextBtn")
    .addEventListener("click", () => {

        const totalPages =
            Math.ceil(
                filteredJobs.length /
                jobsPerPage
            );

        if (currentPage < totalPages) {

            currentPage++;

            renderJobs();
        }

    });

document.getElementById("prevBtn")
    .addEventListener("click", () => {

        if (currentPage > 1) {

            currentPage--;

            renderJobs();
        }

    });

const darkModeBtn =
    document.getElementById("darkModeBtn");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

darkModeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );

});

fetchJobs();