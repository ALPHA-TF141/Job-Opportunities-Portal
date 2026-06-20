const jobsContainer = document.getElementById("jobsContainer");
const searchInput = document.getElementById("searchInput");
const locationFilter = document.getElementById("locationFilter");
const companyFilter = document.getElementById("companyFilter");

let jobs = [];
let filteredJobs = [];

let currentPage = 1;
const jobsPerPage = 4;

function showLoading() {

    jobsContainer.innerHTML = "";

    for (let i = 0; i < 6; i++) {

        jobsContainer.innerHTML += `
            <div class="loading-card"></div>
        `;
    }
}

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
            title: "Frontend Developer",
            company: user.company.name,
            location: user.address.city,
            description: user.company.catchPhrase
        }));

        filteredJobs = jobs;

        populateFilters();

        renderJobs();

    }
    catch (error) {

        jobsContainer.innerHTML = `
            <div class="error">
                Failed to load jobs.
            </div>
        `;

        console.error(error);
    }

}

function populateFilters() {

    const locations = [...new Set(jobs.map(job => job.location))];
    const companies = [...new Set(jobs.map(job => job.company))];

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

function renderJobs() {

    const start = (currentPage - 1) * jobsPerPage;
    const end = start + jobsPerPage;

    const paginatedJobs =
        filteredJobs.slice(start, end);

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