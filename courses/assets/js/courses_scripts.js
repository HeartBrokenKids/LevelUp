// Function to fetch JSON data
async function fetchJSON(file) {
    const response = await fetch(file);
    return await response.json();
}

// Function to display course recommendations
async function displayCourses() {
    const courses = await fetchJSON('courses.json');
    const input = await fetchJSON('input_courses.json');
    const keywords = input.keywords;
    const courseList = document.getElementById('course-list');

    // Filter courses based on keywords
    const filteredCourses = courses.filter(course => {
        return course.keywords.some(keyword => keywords.includes(keyword));
    });

    // Sort courses by ROI to highlight the most recommended one
    const sortedCourses = filteredCourses.sort((a, b) => b.roi - a.roi);
    const mostRecommendedCourse = sortedCourses[0];

    // Display courses
    sortedCourses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'col-md-4 course-card';
        if (course === mostRecommendedCourse) {
            courseCard.classList.add('most-recommended');
        }
        courseCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${course.name}</h5>
                    <p class="card-text">${course.description}</p>
                    <p class="card-text"><strong>Price:</strong> INR ${course.price}</p>
                    <p class="card-text"><strong>ROI:</strong> ${course.roi}</p>
                </div>
            </div>
        `;
        courseList.appendChild(courseCard);
    });

    // Prepare data for ROI chart
    const courseNames = sortedCourses.map(course => course.name);
    const roiValues = sortedCourses.map(course => course.roi);

    // Display ROI chart
    const ctx = document.getElementById('roiChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: courseNames,
            datasets: [{
                label: 'ROI',
                data: roiValues,
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

// Load courses on page load
window.onload = displayCourses;
