// Function to fetch JSON data
async function fetchJSON(file) {
    const response = await fetch(file);
    return await response.json();
}

// Function to display job recommendations
async function displayJobs() {
    const jobs = await fetchJSON('jobs.json');
    const input = await fetchJSON('input_skills.json');
    const skills = input.skills;
    const jobList = document.getElementById('job-list');
    
    // Filter jobs based on skills
    const filteredJobs = jobs.filter(job => {
        return job.skills.some(skill => skills.includes(skill));
    });

    // Sort jobs by salary ratio to highlight the most recommended one
    const sortedJobs = filteredJobs.sort((a, b) => (b.salary / b.industry_salary) - (a.salary / a.industry_salary));
    const mostRecommendedJob = sortedJobs[0];

    // Display jobs
    sortedJobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'col-md-4 job-card';
        if (job === mostRecommendedJob) {
            jobCard.classList.add('most-recommended');
        }
        jobCard.innerHTML = `
            <div class="card">
                <img src="${job.company_logo}" alt="${job.company_name}" class="company-logo">
                <div class="card-body">
                    <h5 class="card-title">${job.title}</h5>
                    <p class="card-text">${job.description}</p>
                    <p class="card-text"><strong>Company:</strong> ${job.company_name}</p>
                    <p class="card-text"><strong>Salary:</strong> INR ${job.salary}</p>
                    <p class="card-text"><strong>Industry Salary:</strong> INR ${job.industry_salary}</p>
                    <p class="card-text"><strong>Salary Ratio:</strong> ${(job.salary / job.industry_salary).toFixed(2)}</p>
                </div>
            </div>
        `;
        jobList.appendChild(jobCard);
    });

    // Prepare data for salary comparison chart
    const jobTitles = sortedJobs.map(job => job.title);
    const salaryRatios = sortedJobs.map(job => (job.salary / job.industry_salary).toFixed(2));

    // Display salary comparison chart
    const ctx = document.getElementById('salaryChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: jobTitles,
            datasets: [{
                label: 'Salary Ratio',
                data: salaryRatios,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Load jobs on page load
window.onload = displayJobs;
