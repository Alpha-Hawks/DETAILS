// Google Sign-In Authentication has been deleted.
// Backup: ../backup/scripts/asdeddd.backup.js

// Global variables to store student data
window.studentData = {
    headers: [],
    rows: [],
    meta: {}
};

// Function to fetch student data from Firebase REST API
async function fetchStudentData() {
    try {
        const response = await fetch('https://imagescheck-1fc28-default-rtdb.firebaseio.com/admissionsdata.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data) {
            // Store the headers, rows, and metadata
            window.studentData = {
                headers: data.headers || [],
                rows: data.rows || [],
                meta: data.meta || {}
            };

            console.log(`Loaded ${window.studentData.rows.length} student records with ${window.studentData.headers.length} columns`);

            // Populate the search dropdown after data is loaded
            if (typeof populateSearchDropdown === 'function') {
                populateSearchDropdown();
            }
        } else {
            console.log("No student data found in admissionsdata");
        }
    } catch (error) {
        console.error("Error fetching student data:", error);
    }
}

// Auto-initialize view immediately
function initApp() {
    const hide = document.getElementById("hide");
    if (hide) {
        hide.style.display = "block";
    }
    fetchStudentData();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

// Search button click handler: executes findNames() directly
const cheBtn = document.getElementById('che');
if (cheBtn) {
    cheBtn.addEventListener('click', () => {
        if (typeof findNames === 'function') {
            findNames();
        } else {
            console.error("findNames function is not defined");
        }
    });
}

function clicked(rollNumber) {
    console.log("Roll number clicked:", rollNumber);
}

window.clicked = clicked;
