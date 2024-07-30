function populateCollegeDropdown() {
    const colleges = [
        "Harvard University",
        "Stanford University",
        "MIT",
        "University of California, Berkeley",
        "California Institute of Technology",
        // Add more college names here
    ];

    const collegeDropdown = document.getElementById('collegeDropdown');

    if (collegeDropdown) {
        colleges.forEach(college => {
            const option = document.createElement('option');
            option.value = college;
            option.text = college;
            collegeDropdown.add(option);
        });
    }
}

function updatePlaceholder() {
    var fileInput = document.getElementById('fileInput');
    var fileInputLabel = document.getElementById('fileInputLabel');
    var fileName = fileInput.files.length ? fileInput.files[0].name : 'Upload CV';
    fileInputLabel.textContent = fileName;
}
