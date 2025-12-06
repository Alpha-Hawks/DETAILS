// Global variables
window.activeFilters = [];
let activeCard = null;
const resultsContainer = document.getElementById('resultsContainer');

function removeFilter(filterId) {
    const filterRow = document.getElementById(filterId);
    if (filterRow) {
        filterRow.remove();
    }

    // Ensure at least one filter remains
    const filtersContainer = document.getElementById('filtersContainer');
    if (filtersContainer.children.length === 0) {
        addFilter('student name');
    }
}

// Function to add a new filter row
function addFilter(defaultHeader = '') {
    const filtersContainer = document.getElementById('filtersContainer');
    const filterId = 'filter-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    const filterRow = document.createElement('div');
    filterRow.className = 'filter-row';
    filterRow.id = filterId;

    // Create dropdown for headers
    const select = document.createElement('select');
    select.className = 'filter-select';

    // Container for the value input (text, select, or date)
    const inputContainer = document.createElement('div');
    inputContainer.className = 'filter-input-container';
    inputContainer.style.display = 'inline-block';

    // Initial input element (default text)
    let input = document.createElement('input');
    input.type = 'text';
    input.className = 'filter-input';
    input.placeholder = 'Type to search...';
    inputContainer.appendChild(input);

    // Function to update input type based on selected header
    const updateInputType = () => {
        const selectedIndex = parseInt(select.value);
        inputContainer.innerHTML = ''; // Clear current input

        let newInput;

        if (isNaN(selectedIndex) || !window.studentData || !window.studentData.headers) {
            newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.className = 'filter-input';
            newInput.placeholder = 'Type to search...';
            inputContainer.appendChild(newInput);
        } else {
            const headerName = window.studentData.headers[selectedIndex].toLowerCase();

            // Check for Date fields
            if (headerName.includes('dob') || headerName.includes('doj') || headerName.includes('date')) {
                newInput = document.createElement('input');
                newInput.type = 'date';
                newInput.className = 'filter-input';
                inputContainer.appendChild(newInput);
            } else {
                // Check for Low Cardinality fields (< 20 unique values)
                const uniqueValues = new Set();
                let isLowCardinality = true;

                for (const row of window.studentData.rows) {
                    const val = row[selectedIndex];
                    if (val) {
                        uniqueValues.add(val.toString().trim());
                    }
                    if (uniqueValues.size >= 20) {
                        isLowCardinality = false;
                        break;
                    }
                }

                if (isLowCardinality && uniqueValues.size > 0) {
                    newInput = document.createElement('select');
                    newInput.className = 'filter-input';

                    // Add default empty option
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = 'Select ' + window.studentData.headers[selectedIndex];
                    newInput.appendChild(defaultOption);

                    // Sort and add options
                    Array.from(uniqueValues).sort().forEach(val => {
                        const option = document.createElement('option');
                        option.value = val;
                        option.textContent = val;
                        newInput.appendChild(option);
                    });
                    inputContainer.appendChild(newInput);
                } else {
                    // Default text input
                    newInput = document.createElement('input');
                    newInput.type = 'text';
                    newInput.className = 'filter-input';
                    newInput.placeholder = 'Type to search...';
                    inputContainer.appendChild(newInput);
                }
            }
        }

        // Add Enter key listener to the new input
        if (newInput) {
            newInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent default form submission if any
                    const searchBtn = document.getElementById('che');
                    if (searchBtn) {
                        searchBtn.click();
                    }
                }
            });
        }
    };

    // Populate dropdown with headers
    if (window.studentData && window.studentData.headers) {
        window.studentData.headers.forEach((header, index) => {
            // Skip "Sno."
            if (header.toLowerCase().trim() === 'sno.' || header.toLowerCase().trim() === 'sno') {
                return;
            }
            const option = document.createElement('option');
            option.value = index;
            option.textContent = header;
            if (defaultHeader && header.toLowerCase().includes(defaultHeader.toLowerCase())) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    // Attach change listener to header select
    select.addEventListener('change', updateInputType);

    // Initial call to set correct input type if defaultHeader is provided
    if (defaultHeader) {
        // We need to wait for the select to be populated and value set
        setTimeout(updateInputType, 0);
    } else {
        // Trigger for the first option
        setTimeout(updateInputType, 0);
    }

    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-filter-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = () => removeFilter(filterId);

    filterRow.appendChild(select);
    filterRow.appendChild(inputContainer);
    filterRow.appendChild(removeBtn);

    filtersContainer.appendChild(filterRow);
}

// Function to initialize default filter
function initializeDefaultFilter() {
    const filtersContainer = document.getElementById('filtersContainer');
    if (filtersContainer && filtersContainer.children.length === 0) {
        addFilter('student name');
    }
}

// Function to populate search dropdown from headers (now initializes filters)
function populateSearchDropdown() {
    // Initialize the default filter when headers are loaded
    if (window.studentData && window.studentData.headers && window.studentData.headers.length > 0) {
        initializeDefaultFilter();
        console.log('Filters initialized with default Student Name filter');
    }

    // Setup Add Filter button
    const addFilterBtn = document.getElementById('addFilterBtn');
    if (addFilterBtn && !addFilterBtn.hasAttribute('data-initialized')) {
        addFilterBtn.addEventListener('click', () => addFilter());
        addFilterBtn.setAttribute('data-initialized', 'true');
    }
}

// Main search function
function findNames() {
    // Check if student data is loaded
    if (!window.studentData || !window.studentData.rows || window.studentData.rows.length === 0) {
        resultsContainer.innerHTML = `<p>Loading student data... Please try again in a moment.</p>`;
        return;
    }

    if (!window.studentData.headers || window.studentData.headers.length === 0) {
        resultsContainer.innerHTML = `<p>No search columns available.</p>`;
        return;
    }

    // Collect active filters
    window.activeFilters = [];
    const filterRows = document.querySelectorAll('.filter-row');

    // Helper to format date from YYYY-MM-DD to DD-MM-YYYY
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateString;
    };

    let validationError = null;
    let hasEmptyFilter = false;

    filterRows.forEach(row => {
        const select = row.querySelector('.filter-select');
        // Input is now inside a container, and could be input or select
        const inputElement = row.querySelector('.filter-input-container input, .filter-input-container select');

        if (select && inputElement) {
            let searchValue = inputElement.value.trim();

            // Mandatory Input Validation
            if (searchValue === '') {
                hasEmptyFilter = true;
                return; // Skip further processing for this row, will be caught by check below
            }

            const headerName = window.studentData.headers[parseInt(select.value)];
            const headerLower = headerName.toLowerCase();

            // Developer Redirect Check
            if (searchValue.toUpperCase() === 'DEVELOPER') {
                window.location.href = "../pages/loginPage.html";
                return;
            }

            // Character Length Validation (> 4 characters)
            // Applies to: Headers containing "name", "address", or exactly "roll no"
            if (headerLower.includes('name') || headerLower.includes('address') || headerLower === 'roll no') {
                if (searchValue.length <= 4) {
                    validationError = `The value for "${headerName}" must be more than 4 characters.`;
                }
            }

            // Phone Number Validation (strictly 10 digits)
            if (headerLower.includes('phone') || headerLower.includes('mobile') || headerLower.includes('contact')) {
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(searchValue)) {
                    validationError = `The value for "${headerName}" must be exactly 10 digits.`;
                }
            }

            // If it's a date field and input type is date, format it
            if (inputElement.type === 'date') {
                searchValue = formatDate(searchValue);
            }

            // Determine if strict match is required
            // Strict if: Input is a Select (Dropdown), Input is Date, or Header is Branch/Year/Section
            let isExactMatch = false;
            if (inputElement.tagName === 'SELECT' || inputElement.type === 'date') {
                isExactMatch = true;
            } else if (['branch', 'year', 'section'].includes(headerLower.trim())) {
                isExactMatch = true;
            }

            window.activeFilters.push({
                columnIndex: parseInt(select.value),
                headerName: headerName,
                searchValue: searchValue,
                isExactMatch: isExactMatch
            });
        }
    });

    if (hasEmptyFilter) {
        alert("All selected filters must have a value. Please fill in all fields.");
        return;
    }

    if (validationError) {
        alert(validationError);
        return;
    }

    if (window.activeFilters.length === 0) {
        resultsContainer.innerHTML = `<p>Please enter search criteria.</p>`;
        return;
    }

    // Filter Constraints Validation
    const restrictedFilters = ['gender', 'admission category'];
    const hasRestrictedFilter = window.activeFilters.some(f => restrictedFilters.includes(f.headerName.toLowerCase()));
    const hasOtherFilter = window.activeFilters.some(f => !restrictedFilters.includes(f.headerName.toLowerCase()));

    if (hasRestrictedFilter && !hasOtherFilter) {
        alert("Gender and Admission Category cannot be used alone. Please add another filter (e.g., Student Name, Branch, etc.).");
        return;
    }

    // Clear previous results and results count
    resultsContainer.innerHTML = '';
    const existingCount = document.querySelector('.results-count');
    if (existingCount) {
        existingCount.remove();
    }

    // Filter matching records - ALL filters must match (AND logic)
    const matchingRecords = window.studentData.rows.filter(row => {
        return window.activeFilters.every(filter => {
            const searchField = row[filter.columnIndex];
            if (searchField) {
                const cellValue = searchField.toString().toLowerCase();
                const filterValue = filter.searchValue.toLowerCase();

                if (filter.isExactMatch) {
                    return cellValue === filterValue;
                } else {
                    return cellValue.includes(filterValue);
                }
            }
            return false;
        });
    });

    // Deduplication Logic
    // Use a Set to track unique records. We'll use Roll No as the unique key if available.
    // If Roll No is not found, we'll fall back to JSON string of the row.
    const uniqueRecords = [];
    const seenKeys = new Set();

    const rollNumberIndex = window.studentData.headers.findIndex(h => h.toLowerCase().trim() === 'roll no');

    if (matchingRecords.length > 0) {
        matchingRecords.forEach(row => {
            let uniqueKey;
            if (rollNumberIndex !== -1 && row[rollNumberIndex]) {
                uniqueKey = row[rollNumberIndex];
            } else {
                uniqueKey = JSON.stringify(row);
            }

            if (!seenKeys.has(uniqueKey)) {
                seenKeys.add(uniqueKey);
                uniqueRecords.push(row);
            }
        });

        // Display results count
        const resultsCount = document.createElement('div');
        resultsCount.className = 'results-count';
        resultsCount.textContent = `Total present results: ${uniqueRecords.length}`;

        // Insert count before results container
        const parent = resultsContainer.parentElement;
        parent.insertBefore(resultsCount, resultsContainer);

        uniqueRecords.forEach(row => {
            createStudentCard(row, resultsContainer);

            // Preload images for faster retrieval
            const rollNumberIndex = window.studentData.headers.findIndex(h =>
                h.toLowerCase().trim() === 'roll no'
            );
            const rollNumber = rollNumberIndex !== -1 ? row[rollNumberIndex] : '';
            if (rollNumber) {
                // Preload in background without blocking UI
                setTimeout(() => preloadAdditionalImages(rollNumber), 100);
            }
        });
    } else {
        resultsContainer.innerHTML = `<p>No records found that match your filters.</p>`;
        console.log(`No matches found for filters:`, window.activeFilters);
    }
}

function createStudentCard(row, resultsContainer) {
    const resultCard = document.createElement('div');
    resultCard.className = 'result-card';

    // Find column indices
    const rollNumberIndex = window.studentData.headers.findIndex(h =>
        h.toLowerCase().trim() === 'roll no'
    );
    const nameIndex = window.studentData.headers.findIndex(h =>
        h.toLowerCase().includes('student') && h.toLowerCase().includes('name')
    );
    const branchIndex = window.studentData.headers.findIndex(h => h.toLowerCase().trim() === 'branch');
    const sectionIndex = window.studentData.headers.findIndex(h => h.toLowerCase().trim() === 'section');
    const yearIndex = window.studentData.headers.findIndex(h => h.toLowerCase().trim() === 'year');
    const dobIndex = window.studentData.headers.findIndex(h => h.toLowerCase().trim() === 'dob');

    const rollNumber = rollNumberIndex !== -1 ? row[rollNumberIndex] : '';
    const studentName = nameIndex !== -1 ? row[nameIndex] : '';

    const mainImage = document.createElement('img');
    mainImage.src = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${rollNumber}/${rollNumber}.jpg`;
    mainImage.alt = `${studentName}'s Photo`;
    mainImage.className = 'student-image';

    mainImage.onload = () => {
        resultCard.appendChild(mainImage);

        if (studentName) {
            const nameElement = document.createElement('p');
            nameElement.className = 'student-name';
            nameElement.textContent = studentName;
            resultCard.appendChild(nameElement);
        }

        // Create basic details container
        const basicDetailsContainer = document.createElement('div');
        basicDetailsContainer.className = 'details-container basic-details';

        let basicHTML = '';
        if (rollNumber) basicHTML += `<p><strong>Roll No:</strong> ${rollNumber}</p>`;
        if (studentName) basicHTML += `<p><strong>Student Name:</strong> ${studentName}</p>`;
        if (branchIndex !== -1 && row[branchIndex]) basicHTML += `<p><strong>Branch:</strong> ${row[branchIndex]}</p>`;
        if (sectionIndex !== -1 && row[sectionIndex]) basicHTML += `<p><strong>Section:</strong> ${row[sectionIndex]}</p>`;
        if (yearIndex !== -1 && row[yearIndex]) basicHTML += `<p><strong>Year:</strong> ${row[yearIndex]}</p>`;
        if (dobIndex !== -1 && row[dobIndex]) basicHTML += `<p><strong>DOB:</strong> ${row[dobIndex]}</p>`;
        basicDetailsContainer.innerHTML = basicHTML;

        // Create "More Info" button
        const moreInfoButton = document.createElement('button');
        moreInfoButton.className = 'get-info-button more-info-button';
        moreInfoButton.textContent = 'More Info';

        // Create complete details container
        const completeDetailsContainer = document.createElement('div');
        completeDetailsContainer.className = 'details-container complete-details';
        completeDetailsContainer.style.display = 'none';

        let completeHTML = '';
        window.studentData.headers.forEach((header, index) => {
            // Skip "Sno." and only show non-empty values
            if (header.toLowerCase().trim() === 'sno.' || header.toLowerCase().trim() === 'sno') {
                return;
            }
            if (row[index] !== null && row[index] !== undefined && row[index] !== '') {
                completeHTML += `<p><strong>${header}:</strong> ${row[index]}</p>`;
            }
        });
        completeDetailsContainer.innerHTML = completeHTML;

        // Create "Get Info" button
        const getInfoButton = document.createElement('button');
        getInfoButton.className = 'get-info-button';
        getInfoButton.textContent = 'Get Info';
        getInfoButton.style.display = 'none';

        const additionalImagesContainer = document.createElement('div');
        additionalImagesContainer.className = 'additional-images';

        // Card click - show basic details
        resultCard.onclick = () => {
            if (activeCard !== resultCard) {
                deactivateAllCards();
                basicDetailsContainer.style.display = 'block';
                moreInfoButton.style.display = 'block';
                activeCard = resultCard;
            }
        };

        // Auto-collapse on mouse leave
        resultCard.addEventListener('mouseleave', () => {
            // Reset card to initial state when mouse leaves
            basicDetailsContainer.style.display = 'none';
            moreInfoButton.style.display = 'none';
            completeDetailsContainer.style.display = 'none';
            getInfoButton.style.display = 'none';
            additionalImagesContainer.style.display = 'none';
            activeCard = null;
        });

        // "More Info" button click
        moreInfoButton.onclick = (e) => {
            e.stopPropagation();
            basicDetailsContainer.style.display = 'none';
            moreInfoButton.style.display = 'none';
            completeDetailsContainer.style.display = 'block';
            getInfoButton.style.display = 'block';
        };

        // "Get Info" button click - Fixed with addEventListener
        getInfoButton.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();

            console.log('Get Info clicked for:', rollNumber);

            if (typeof clicked === "function" && rollNumber) {
                clicked(rollNumber);
            }

            if (rollNumber) {
                // Show loading state
                additionalImagesContainer.innerHTML = '<p style="text-align: center; padding: 1rem; color: #b4b4b4;">Loading documents...</p>';
                additionalImagesContainer.style.display = 'block';

                preloadAdditionalImages(rollNumber).then(images => {
                    additionalImagesContainer.innerHTML = '';
                    if (images && images.length > 0) {
                        images.forEach(img => {
                            additionalImagesContainer.appendChild(img);
                        });
                    } else {
                        additionalImagesContainer.innerHTML = '<p style="text-align: center; padding: 1rem; color: #b4b4b4;">No documents available</p>';
                    }
                }).catch(error => {
                    console.error('Error loading images:', error);
                    additionalImagesContainer.innerHTML = '<p style="text-align: center; padding: 1rem; color: #737373;">Error loading documents</p>';
                });
            } else {
                additionalImagesContainer.style.display = 'block';
            }
        });

        resultCard.appendChild(basicDetailsContainer);
        resultCard.appendChild(moreInfoButton);
        resultCard.appendChild(completeDetailsContainer);
        resultCard.appendChild(getInfoButton);
        resultCard.appendChild(additionalImagesContainer);

        resultsContainer.appendChild(resultCard);
    };

    mainImage.onerror = () => {
        console.log(`Image for roll number ${rollNumber} not found.`);

        if (studentName) {
            const nameElement = document.createElement('p');
            nameElement.className = 'student-name';
            nameElement.textContent = studentName;
            nameElement.style.fontSize = '18px';
            nameElement.style.fontWeight = 'bold';
            nameElement.style.marginTop = '10px';
            resultCard.appendChild(nameElement);
        }

        // Create basic details container
        const basicDetailsContainer = document.createElement('div');
        basicDetailsContainer.className = 'details-container basic-details';
        basicDetailsContainer.style.display = 'block';

        let basicHTML = '';
        if (rollNumber) basicHTML += `<p><strong>Roll No:</strong> ${rollNumber}</p>`;
        if (studentName) basicHTML += `<p><strong>Student Name:</strong> ${studentName}</p>`;
        if (branchIndex !== -1 && row[branchIndex]) basicHTML += `<p><strong>Branch:</strong> ${row[branchIndex]}</p>`;
        if (sectionIndex !== -1 && row[sectionIndex]) basicHTML += `<p><strong>Section:</strong> ${row[sectionIndex]}</p>`;
        if (yearIndex !== -1 && row[yearIndex]) basicHTML += `<p><strong>Year:</strong> ${row[yearIndex]}</p>`;
        if (dobIndex !== -1 && row[dobIndex]) basicHTML += `<p><strong>DOB:</strong> ${row[dobIndex]}</p>`;
        basicDetailsContainer.innerHTML = basicHTML;

        // Create "More Info" button
        const moreInfoButton = document.createElement('button');
        moreInfoButton.className = 'get-info-button more-info-button';
        moreInfoButton.textContent = 'More Info';
        moreInfoButton.style.display = 'block';

        // Create complete details container
        const completeDetailsContainer = document.createElement('div');
        completeDetailsContainer.className = 'details-container complete-details';
        completeDetailsContainer.style.display = 'none';

        let completeHTML = '';
        window.studentData.headers.forEach((header, index) => {
            // Skip "Sno." and only show non-empty values
            if (header.toLowerCase().trim() === 'sno.' || header.toLowerCase().trim() === 'sno') {
                return;
            }
            if (row[index] !== null && row[index] !== undefined && row[index] !== '') {
                completeHTML += `<p><strong>${header}:</strong> ${row[index]}</p>`;
            }
        });
        completeDetailsContainer.innerHTML = completeHTML;

        // Create "Get Info" button
        const getInfoButton = document.createElement('button');
        getInfoButton.className = 'get-info-button';
        getInfoButton.textContent = 'Get Info';
        getInfoButton.style.display = 'none';

        const additionalImagesContainer = document.createElement('div');
        additionalImagesContainer.className = 'additional-images';

        // Card click
        resultCard.onclick = () => {
            if (activeCard !== resultCard) {
                deactivateAllCards();
                basicDetailsContainer.style.display = 'block';
                moreInfoButton.style.display = 'block';
                activeCard = resultCard;
            }
        };

        // Auto-collapse on mouse leave
        resultCard.addEventListener('mouseleave', () => {
            // Reset card to initial state when mouse leaves
            basicDetailsContainer.style.display = 'none';
            moreInfoButton.style.display = 'none';
            completeDetailsContainer.style.display = 'none';
            getInfoButton.style.display = 'none';
            additionalImagesContainer.style.display = 'none';
            activeCard = null;
        });

        // "More Info" button click
        moreInfoButton.onclick = (e) => {
            e.stopPropagation();
            basicDetailsContainer.style.display = 'none';
            moreInfoButton.style.display = 'none';
            completeDetailsContainer.style.display = 'block';
            getInfoButton.style.display = 'block';
        };

        // "Get Info" button click - Fixed with addEventListener
        getInfoButton.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();

            console.log('Get Info clicked for:', rollNumber);

            if (typeof clicked === "function" && rollNumber) {
                clicked(rollNumber);
            }

            if (rollNumber) {
                // Show loading state
                additionalImagesContainer.innerHTML = '<p style="text-align: center; padding: 1rem; color: #b4b4b4;">Loading documents...</p>';
                additionalImagesContainer.style.display = 'block';

                preloadAdditionalImages(rollNumber).then(images => {
                    additionalImagesContainer.innerHTML = '';
                    if (images && images.length > 0) {
                        images.forEach(img => {
                            additionalImagesContainer.appendChild(img);
                        });
                    } else {
                        additionalImagesContainer.innerHTML = '<p style="text-align: center; padding: 1rem; color: #b4b4b4;">No documents available</p>';
                    }
                }).catch(error => {
                    console.error('Error loading images:', error);
                    additionalImagesContainer.innerHTML = '<p style="text-align: center; padding: 1rem; color: #737373;">Error loading documents</p>';
                });
            } else {
                additionalImagesContainer.style.display = 'block';
            }
        });

        resultCard.appendChild(basicDetailsContainer);
        resultCard.appendChild(moreInfoButton);
        resultCard.appendChild(completeDetailsContainer);
        resultCard.appendChild(getInfoButton);
        resultCard.appendChild(additionalImagesContainer);
        resultsContainer.appendChild(resultCard);
    };
}

async function preloadAdditionalImages(rollNumber) {
    const certificates = ["SSC", "INTER", "Aadhar", "Caste", "Income", "Photo"];
    const imagePromises = certificates.map(cert => {
        const img = new Image();
        img.src = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${rollNumber}/DOCS/${rollNumber}_${cert}.jpg`;
        img.alt = `${cert} Certificate`;
        return new Promise(resolve => {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
        });
    });

    const images = await Promise.all(imagePromises);
    return images.filter(img => img !== null);
}

function deactivateAllCards() {
    document.querySelectorAll('.result-card').forEach(card => {
        const basicDetails = card.querySelector('.basic-details');
        const completeDetails = card.querySelector('.complete-details');
        const moreInfoButton = card.querySelector('.more-info-button');
        const getInfoButton = card.querySelectorAll('.get-info-button')[1]; // Get the second button (not more-info-button)
        const additionalImages = card.querySelector('.additional-images');

        if (basicDetails) basicDetails.style.display = 'none';
        if (completeDetails) completeDetails.style.display = 'none';
        if (moreInfoButton) moreInfoButton.style.display = 'none';
        if (getInfoButton) getInfoButton.style.display = 'none';
        if (additionalImages) additionalImages.style.display = 'none';
    });
    activeCard = null;
}

let holdTimer;
const holdDuration = 5000; // 5 seconds in milliseconds

function handleHoldTrigger() {
    // Redirect after hold - try loginPage.html first, fallback to current page
    const loginPath = "loginPage.html";
    window.location.href = loginPath;
}

function startHoldTimer() {
    holdTimer = setTimeout(handleHoldTrigger, holdDuration);
}

function cancelHoldTimer() {
    clearTimeout(holdTimer);
}

// Function to attach long-press listener to construction message
function attachLongPressListener() {
    const constructionMessage = document.getElementById("constructionMessage");

    if (constructionMessage) {
        // For mouse support
        constructionMessage.addEventListener("mousedown", startHoldTimer);
        constructionMessage.addEventListener("mouseup", cancelHoldTimer);
        constructionMessage.addEventListener("mouseleave", cancelHoldTimer);

        // For touch support
        constructionMessage.addEventListener("touchstart", startHoldTimer);
        constructionMessage.addEventListener("touchend", cancelHoldTimer);
        constructionMessage.addEventListener("touchcancel", cancelHoldTimer);

        console.log("Long-press listener attached to construction message");
    } else {
        // If element not found, try again after a short delay
        setTimeout(attachLongPressListener, 500);
    }
}

// Start attempting to attach the listener when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachLongPressListener);
} else {
    attachLongPressListener();
}

// Click outside to collapse all cards
document.addEventListener('click', (event) => {
    // Check if click is outside all result cards
    const isClickInsideCard = event.target.closest('.result-card');
    if (!isClickInsideCard && activeCard) {
        deactivateAllCards();
    }
});
