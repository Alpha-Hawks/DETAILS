// Google Sign-In Authentication has been deleted.
// Backup: ../backup/scripts/asdeddd.backup.js

// Global variables to store student data
window.studentData = {
    headers: [],
    rows: [],
    meta: {}
};

// Helper: infer section from roll number suffix
function inferSection(roll) {
    if (!roll || roll.length < 2) return 'A';
    const suffix = roll.substring(roll.length - 2).toUpperCase();
    if (suffix <= '64') return 'A';
    if (suffix <= 'C8') return 'B';
    return 'C';
}

// Helper: format YYYY-MM-DD date to DD-MM-YYYY
function formatDOB(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.toString().trim().split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr.toString().trim();
}

// Load and convert MLRITM student record array into standardized { headers, rows }
function loadMlrRecords(records) {
    const headers = [
        'Sno.', 'Roll No', 'Student Name', 'Branch', 'Year', 'Section',
        'DOB', 'Gender', 'Student Mobile', 'Student Email', 'Father Name',
        'Father Mobile', 'Mother Name', 'Admission Category', 'Scholarship Type', 'Batch'
    ];

    const rows = records.map((s, idx) => {
        const roll = (s.roll_number || s.rollNumber || s.roll || '').toString().trim().toUpperCase();
        const name = (s.student_name || s.studentName || s.name || '').toString().trim();
        const branch = (s.branch || '').toString().trim();
        const year = (s.year || s.year_of_study || (s.batch ? `${s.batch} Batch` : '')).toString().trim();
        const section = (s.section || inferSection(roll)).toString().trim();
        const dob = formatDOB(s.date_of_birth || s.dob || '');
        const gender = (s.gender || '').toString().trim();
        const mobile = (s.student_mobile || s.phone || '').toString().trim();
        const email = (s.student_email || s.email || (roll ? `${roll}@mlritm.ac.in` : '')).toString().trim();
        const father = (s.father_name || s.father || '').toString().trim();
        const fatherMobile = (s.father_mobile || s.father_phone || '').toString().trim();
        const mother = (s.mother_name || s.mother || '').toString().trim();
        const cat = (s.admission_category || s.cat || '').toString().trim();
        const scholarship = (s.scholarship_type || s.scholarship || '').toString().trim();
        const batch = (s.batch || '').toString().trim();

        return [
            idx + 1,
            roll,
            name,
            branch,
            year,
            section,
            dob,
            gender,
            mobile,
            email,
            father,
            fatherMobile,
            mother,
            cat,
            scholarship,
            batch
        ];
    });

    window.studentData = {
        headers,
        rows,
        meta: { source: 'MLRITM Dataset', count: rows.length }
    };
}

// Load from window.MLRITM_STUDENTS if available in memory
function loadFromMlrDb() {
    if (window.MLRITM_STUDENTS && typeof window.MLRITM_STUDENTS === 'object') {
        const keys = Object.keys(window.MLRITM_STUDENTS);
        if (keys.length > 0) {
            const records = keys.map(roll => {
                const item = window.MLRITM_STUDENTS[roll];
                return {
                    roll_number: roll,
                    student_name: item.name,
                    branch: item.branch,
                    date_of_birth: item.dob,
                    gender: item.gender,
                    student_mobile: item.phone,
                    student_email: item.email,
                    father_name: item.father,
                    father_mobile: item.father_phone,
                    mother_name: item.mother,
                    admission_category: item.cat,
                    scholarship_type: item.scholarship,
                    batch: item.batch,
                    year: item.batch ? (
                        item.batch === '2026' ? '1st Year' :
                        item.batch === '2025' ? '2nd Year' :
                        item.batch === '2024' ? '3rd Year' : '4th Year'
                    ) : ''
                };
            });
            loadMlrRecords(records);
            return true;
        }
    }
    return false;
}

// Function to fetch student data: tries local JSON first, then in-memory DB, then Firebase fallback
async function fetchStudentData() {
    // 1. Try fetching full students_details csv.json
    const jsonPaths = [
        '../students_details csv.json',
        'students_details csv.json',
        '/students_details csv.json'
    ];

    for (const path of jsonPaths) {
        try {
            const response = await fetch(encodeURI(path));
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    loadMlrRecords(data);
                    console.log(`Loaded ${window.studentData.rows.length} MLRITM student records from ${path}`);
                    if (typeof populateSearchDropdown === 'function') {
                        populateSearchDropdown();
                    }
                    return;
                }
            }
        } catch (e) {
            // Continue to next path
        }
    }

    // 2. Fallback to in-memory window.MLRITM_STUDENTS
    if (loadFromMlrDb()) {
        console.log(`Loaded ${window.studentData.rows.length} records from in-memory MLRITM database`);
        if (typeof populateSearchDropdown === 'function') {
            populateSearchDropdown();
        }
        return;
    }

    // 3. Fallback to Firebase admissionsdata if offline / remote fallback needed
    try {
        const response = await fetch('https://imagescheck-1fc28-default-rtdb.firebaseio.com/admissionsdata.json');
        if (response.ok) {
            const data = await response.json();
            if (data && data.headers && data.rows) {
                window.studentData = {
                    headers: data.headers,
                    rows: data.rows,
                    meta: data.meta || {}
                };
                console.log(`Loaded ${window.studentData.rows.length} student records from Firebase fallback`);
                if (typeof populateSearchDropdown === 'function') {
                    populateSearchDropdown();
                }
            }
        }
    } catch (error) {
        console.error("Error loading student data:", error);
    }
}

// Auto-initialize view immediately without any login/auth wall
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
