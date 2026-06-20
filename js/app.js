// ============================================
// DOM ELEMENTS
// ============================================
const jobsContainer = document.getElementById("jobsContainer");
const searchInput = document.getElementById("searchInput");
const locationFilter = document.getElementById("locationFilter");
const companyFilter = document.getElementById("companyFilter");
const darkModeBtn = document.getElementById("darkModeBtn");

const pageNumber = document.getElementById("pageNumber");
const totalPages = document.getElementById("totalPages");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// ============================================
// STATE
// ============================================
let jobs = [];
let filteredJobs = [];

let currentPage = 1;
const jobsPerPage = 6;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    loadDarkModePreference();
    setupEventListeners();
    fetchJobs();
});

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {

    searchInput.addEventListener("input", () => {
        currentPage = 1;
        filterJobs();
    });

    locationFilter.addEventListener("change", () => {
        currentPage = 1;
        filterJobs();
    });

    companyFilter.addEventListener("change", () => {
        currentPage = 1;
        filterJobs();
    });

    prevBtn.addEventListener("click", () => {

        if (currentPage > 1) {
            currentPage--;
            renderJobs();
        }

    });

    nextBtn.addEventListener("click", () => {

        const maxPages =
            Math.ceil(filteredJobs.length / jobsPerPage);

        if (currentPage < maxPages) {
            currentPage++;
            renderJobs();
        }

    });

    darkModeBtn.addEventListener("click", toggleDarkMode);
}

// ============================================
// FETCH DATA
// ============================================
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

        jobs = data.map(user => ({
            id: user.id,
            title: getRandomJobTitle(),
            company: user.company.name,
            location: user.address.city,
            description: user.company.catchPhrase,
            salary: `$${50000 + Math.floor(Math.random() * 100000)}`,
            type: getRandomJobType(),
            level: getRandomLevel(),
            posted: getRandomDate()
        }));

        filteredJobs = [...jobs];

        populateFilters();
        updateStats();
        renderJobs();

    }
    catch (error) {

        jobsContainer.innerHTML = `
            <div class="error">
                Failed to load jobs
            </div>
        `;

        console.error(error);
    }
}

// ============================================
// RANDOM DATA HELPERS
// ============================================
function getRandomJobTitle() {

    const titles = [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "React Developer",
        "Node.js Developer",
        "UI UX Designer",
        "DevOps Engineer",
        "QA Engineer",
        "Mobile Developer",
        "Data Analyst"
    ];

    return titles[
        Math.floor(Math.random() * titles.length)
    ];
}

function getRandomJobType() {

    const types = [
        "Full Time",
        "Part Time",
        "Remote",
        "Contract"
    ];

    return types[
        Math.floor(Math.random() * types.length)
    ];
}

function getRandomLevel() {

    const levels = [
        "Junior",
        "Mid Level",
        "Senior",
        "Lead"
    ];

    return levels[
        Math.floor(Math.random() * levels.length)
    ];
}

function getRandomDate() {

    const days =
        Math.floor(Math.random() * 30) + 1;

    return `${days} days ago`;
}

// ============================================
// LOADING
// ============================================
function showLoading() {

    jobsContainer.innerHTML = "";

    for (let i = 0; i < 6; i++) {

        jobsContainer.innerHTML += `
            <div class="loading-card"></div>
        `;
    }
}

// ============================================
// FILTERS
// ============================================
function populateFilters() {

    const locations =
        [...new Set(jobs.map(job => job.location))];

    const companies =
        [...new Set(jobs.map(job => job.company))];

    locationFilter.innerHTML =
        '<option value="">All Locations</option>';

    companyFilter.innerHTML =
        '<option value="">All Companies</option>';

    locations.forEach(location => {

        locationFilter.innerHTML += `
            <option value="${location}">
                ${location}
            </option>
        `;
    });

    companies.forEach(company => {

        companyFilter.innerHTML += `
            <option value="${company}">
                ${company}
            </option>
        `;
    });
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

            (location === ""
                || job.location === location)

            &&

            (company === ""
                || job.company === company)

        );

    });

    currentPage = 1;

    renderJobs();
}

// ============================================
// RENDER JOBS
// ============================================
function renderJobs() {

    if (filteredJobs.length === 0) {

        jobsContainer.innerHTML = `
            <div class="error">
                No jobs found
            </div>
        `;

        return;
    }

    const start =
        (currentPage - 1) * jobsPerPage;

    const end =
        start + jobsPerPage;

    const jobsToShow =
        filteredJobs.slice(start, end);

    jobsContainer.innerHTML = "";

    jobsToShow.forEach(job => {

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
                <strong>Type:</strong>
                ${job.type}
            </p>

            <p>
                <strong>Level:</strong>
                ${job.level}
            </p>

            <p>
                <strong>Salary:</strong>
                ${job.salary}
            </p>

            <p>
                ${job.description}
            </p>

        </div>

        `;
    });

    updatePagination();
}

// ============================================
// PAGINATION
// ============================================
function updatePagination() {

    const total =
        Math.ceil(
            filteredJobs.length /
            jobsPerPage
        );

    pageNumber.textContent = currentPage;

    if (totalPages) {
        totalPages.textContent = total;
    }

    prevBtn.disabled =
        currentPage === 1;

    nextBtn.disabled =
        currentPage === total;
}

// ============================================
// STATS
// ============================================
function updateStats() {

    const totalJobs =
        document.getElementById("totalJobsCount");

    const totalCompanies =
        document.getElementById("totalCompaniesCount");

    const totalLocations =
        document.getElementById("totalLocationsCount");

    const savedJobs =
        document.getElementById("savedJobsCount");

    if (totalJobs)
        totalJobs.textContent = jobs.length;

    if (totalCompanies)
        totalCompanies.textContent =
            new Set(
                jobs.map(job => job.company)
            ).size;

    if (totalLocations)
        totalLocations.textContent =
            new Set(
                jobs.map(job => job.location)
            ).size;

    if (savedJobs)
        savedJobs.textContent = "0";
}

// ============================================
// DARK MODE
// ============================================
function toggleDarkMode() {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
    );

    updateDarkModeButton();
}

function loadDarkModePreference() {

    const isDark =
        localStorage.getItem("darkMode") === "true";

    if (isDark) {
        document.body.classList.add("dark");
    }

    updateDarkModeButton();
}

function updateDarkModeButton() {

    const isDark =
        document.body.classList.contains("dark");

    darkModeBtn.textContent =
        isDark
            ? "☀️ Light"
            : "🌙 Dark";
}