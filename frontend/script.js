
let allJobs = [];

// Load jobs from the database
async function loadJobs() {

    const jobList = document.getElementById("jobList");

    try {

        const response = await fetch("http://localhost:3000/api/jobs");

        if (!response.ok) {
            throw new Error("Unable to fetch jobs");
        }

        allJobs = await response.json();

        displayJobs(allJobs);

    } catch (error) {

        console.error("Error loading jobs:", error);

        jobList.innerHTML = "<p>Unable to load jobs. Please try again.</p>";

    }
}

// Display job cards
function displayJobs(jobs) {

    const jobList = document.getElementById("jobList");

    if (jobs.length === 0) {
        jobList.innerHTML = "<p>No matching jobs found.</p>";
        return;
    }

    jobList.innerHTML = "";

    jobs.forEach((job) => {

        const card = document.createElement("div");
        card.className = "job-card";

        const title = document.createElement("h3");
        title.textContent = job.title;

        const company = document.createElement("p");
        company.className = "company";
        company.textContent = job.company;

        const location = document.createElement("p");
        location.textContent = job.location;

        const description = document.createElement("p");
        description.textContent = job.description;

        const salary = document.createElement("p");
        salary.className = "salary";
        salary.textContent = job.salary;

        
const applyButton = document.createElement("a");

applyButton.href = "apply.html?jobId=" + job.id +
    "&title=" + encodeURIComponent(job.title);

applyButton.className = "apply-btn";
applyButton.textContent = "Apply Now";

applyButton.addEventListener("click", function(event) {

    if (!localStorage.getItem("userId")) {
        event.preventDefault();

        alert("Please login before applying for a job.");

        window.location.href = "login.html";
    }

});


        card.appendChild(title);
        card.appendChild(company);
        card.appendChild(location);
        card.appendChild(description);
        card.appendChild(salary);
        card.appendChild(applyButton);

        jobList.appendChild(card);

    });
}

// Search jobs by keyword and location
function searchJobs() {

    const keyword = document.getElementById("jobSearch")
        .value.toLowerCase().trim();

    const location = document.getElementById("locationSearch")
        .value.toLowerCase().trim();

    const filteredJobs = allJobs.filter((job) => {

        const jobDetails = (
            job.title + " " +
            job.company + " " +
            job.description
        ).toLowerCase();

        const jobLocation = job.location.toLowerCase();

        return jobDetails.includes(keyword) &&
               jobLocation.includes(location);

    });

    displayJobs(filteredJobs);
    document.getElementById("jobs").scrollIntoView({
    behavior: "smooth",
    block: "start"
});
}

// Load jobs when the page opens
document.addEventListener("DOMContentLoaded", loadJobs);
