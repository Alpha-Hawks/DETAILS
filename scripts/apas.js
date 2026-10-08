// Google Sign-In Authentication has been deleted.
// Backup: ../backup/scripts/apas.backup.js

function getInfo() {
    return true;
}

window.addEventListener('DOMContentLoaded', () => {
    const showSelectedBtn = document.getElementById("showSelectedBtn");
    if (showSelectedBtn) {
        showSelectedBtn.addEventListener('click', () => {
            const selectedImage = document.getElementById('menu1')?.value;
            const selectedYear = document.getElementById('menu2')?.value;
            const selectedBranch = document.getElementById('menu3')?.value;
            const selectedClass = document.getElementById('menu4')?.value;

            if (!selectedImage || !selectedYear || !selectedBranch || !selectedClass) {
                alert('Please select all values.');
                return;
            }

            if (typeof showSelectedValues === 'function') {
                showSelectedValues();
            } else {
                console.error("showSelectedValues function is not defined");
            }
        });
    }
});

function clicked(rollNumber) {
    console.log("Roll number clicked:", rollNumber);
}

window.clicked = clicked;
window.getInfo = getInfo;
