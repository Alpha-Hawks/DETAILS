function updateSelectedValue() {
    const selectedValue = document.getElementById('menu1').value;
    document.getElementById('selectedMenuValue').textContent = `${selectedValue || 'None'}`;
}

function decodeStudentDetails(rollNumber) {
    const upperRoll = rollNumber.toUpperCase();
    const isMLRITM = upperRoll.includes("7Y");
    const isIARE = upperRoll.includes("95");

    const yearPrefix = upperRoll.substring(0, 2);
    const joinYear = 2000 + (parseInt(yearPrefix, 10) || 23);
    const passYear = joinYear + 4;

    const courseCode = upperRoll.substring(4, 6);
    const course = courseCode === '1A' ? 'B.Tech (Regular)' : (courseCode === '5A' ? 'B.Tech (Lateral Entry)' : 'Undergraduate');

    const branchCode = upperRoll.substring(6, 8);
    const branchMap = {
        '01': 'Civil Engineering (CE)',
        '02': 'Electrical & Electronics Engineering (EEE)',
        '03': 'Mechanical Engineering (ME)',
        '04': 'Electronics & Communication Engineering (ECE)',
        '05': 'Computer Science & Engineering (CSE)',
        '12': 'Information Technology (IT)',
        '62': 'CSE - Cyber Security (CSC)',
        '66': 'CSE - Artificial Intelligence & Machine Learning (CSM)',
        '67': 'CSE - Data Science (CSD)',
        '69': 'Computer Science & Business Systems (CSBS)',
        '72': 'AI & Data Science (AIDS)',
        '73': 'AI & Machine Learning (AIML)'
    };

    const dbData = (typeof window !== 'undefined' && window.MLRITM_STUDENTS) ? window.MLRITM_STUDENTS[upperRoll] : null;

    const branchName = (dbData && dbData.branch) ? dbData.branch : (branchMap[branchCode] || `Branch Code ${branchCode}`);
    const email = (dbData && dbData.email) ? dbData.email : (isMLRITM ? `${upperRoll}@mlritm.ac.in` : `${upperRoll}@iare.ac.in`);
    const college = isMLRITM 
        ? 'MLRITM - Marri Laxman Reddy Institute of Technology and Management' 
        : 'IARE - Institute of Aeronautical Engineering';

    const studentName = (dbData && dbData.name) ? dbData.name : (upperRoll === '237Y1A1270' ? 'GUNDA DINESH' : null);

    return {
        rollNumber: upperRoll,
        studentName,
        phone: dbData ? dbData.phone : null,
        father_phone: dbData ? dbData.father_phone : null,
        father: dbData ? dbData.father : null,
        mother: dbData ? dbData.mother : null,
        dob: dbData ? dbData.dob : null,
        gender: dbData ? dbData.gender : null,
        college,
        branch: branchName,
        course,
        batch: (dbData && dbData.batch) ? `${dbData.batch} - ${parseInt(dbData.batch, 10) + 4}` : `${joinYear} - ${passYear}`,
        email,
        isMLRITM,
        address: (typeof window.getStudentAddress === 'function') ? window.getStudentAddress(upperRoll) : null
    };
}

async function generateImages(startRoll, endRoll) {
    document.getElementById("loa").style.display = "flex";
    document.getElementById("imageGallery").innerHTML = "";
    document.getElementById("imageGallery").style.display = "none";
    document.getElementById("imageCount").textContent = "Total Images: 0";

    if (!startRoll || !endRoll) {
        alert("Please enter both startRoll and endRoll.");
        return;
    }

    startRoll = startRoll.trim().toUpperCase();
    endRoll = endRoll.trim().toUpperCase();

    if (startRoll.length !== endRoll.length) {
        alert("Start roll and end roll must have the same length.");
        return;
    }

    let prefix = startRoll.slice(0, 8);
    let startAlphanumeric = startRoll.slice(8);
    let endAlphanumeric = endRoll.slice(8);

    let startNum = parseInt(startAlphanumeric, 36);
    let endNum = parseInt(endAlphanumeric, 36);

    if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
        alert("Invalid alphanumeric part of the roll numbers.");
        return;
    }

    let imagePromises = [];
    let imageCount = 0;
    const menuValue = document.getElementById('menu1').value;

    for (let i = startNum; i <= endNum; i++) {
        let rollSuffix = i.toString(36).toUpperCase().padStart(startAlphanumeric.length, '0');
        let rollNumber = prefix + rollSuffix;
        const isMLRITM = rollNumber.includes("7Y");

        let img = new Image();
        switch(menuValue) {
            case "SSC Certificate":
                img.src = "https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/"+rollNumber+"/DOCS/"+rollNumber+"_SSC.jpg";
                break;
            case "Inter Certificate":
                img.src = "https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/"+rollNumber+"/DOCS/"+rollNumber+"_INTER.jpg";
                break;
            case "Aadhar":
                img.src = "https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/"+rollNumber+"/DOCS/"+rollNumber+"_Aadhar.jpg";
                break;
            case "Caste Certificate":
                img.src = "https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/"+rollNumber+"/DOCS/"+rollNumber+"_Caste.jpg";
                break;
            case "Income Certificate":
                img.src = "https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/"+rollNumber+"/DOCS/"+rollNumber+"_Income.jpg";
                break;
            case "Photo":
            default:
                if (isMLRITM) {
                    img.src = `https://anvaya.mlritm.ac.in/Docs/MLRITM/User/${rollNumber}.jpg`;
                } else {
                    img.src = "https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/" + rollNumber + "/" + rollNumber + ".jpg";
                }
                break;
        }
        img.alt = rollNumber;

        let promise = new Promise((resolve) => {
            img.onload = function() {
                resolve({rollNumber, img, isMLRITM});
            };

            img.onerror = function() {
                resolve(null);
            };
        });

        imagePromises.push(promise);
    }

    let appendInfo = typeof window.getInfo === 'function' ? window.getInfo() : true;
    for (let promise of imagePromises) {
        let result = await promise;
        if (result) {
            let {rollNumber, img, isMLRITM} = result;
            let imageItem = document.createElement("div");
            imageItem.classList.add("imageItem");

            let rollNumberElement = document.createElement("p");
            rollNumberElement.classList.add("rollNumber");
            rollNumberElement.textContent = rollNumber;

            let infoButton = document.createElement("button");
            infoButton.textContent = "Get Info";
            infoButton.classList.add("infoButton");

            img.onclick = function() {
                deactivateAllContainers();
                imageItem.classList.add("active");
                infoButton.style.display = "block";
            };

            infoButton.onclick = function() {
                appendAdditionalLinks(imageItem, rollNumber);
                if (typeof clicked === "function") {
                    clicked(rollNumber);
                }
            };

            imageItem.appendChild(img);
            imageItem.appendChild(rollNumberElement);
            if (appendInfo) {
                imageItem.appendChild(infoButton);
            }
            document.getElementById("imageGallery").appendChild(imageItem);

            imageCount++;
            document.getElementById("imageCount").textContent = `Total Images: ${imageCount}`;
        }
    }
    document.getElementById("imageGallery").style.display = "flex";
    document.getElementById("loa").style.display = "none";
}

function deactivateAllContainers() {
    document.querySelectorAll('.imageItem').forEach(container => {
        container.classList.remove('active');
        const button = container.querySelector('.infoButton');
        if (button) button.style.display = 'none';
        const additionalLinksContainer = container.querySelector('.additionalLinks');
        if (additionalLinksContainer) {
            additionalLinksContainer.style.display = 'none';
            additionalLinksContainer.innerHTML = ''; 
        }
    });
}

function handleGenerateImages() {
    let startRoll = document.getElementById("startRoll").value.trim();
    let endRoll = document.getElementById("endRoll").value.trim();
    generateImages(startRoll, endRoll);
}

function appendAdditionalLinks(container, rollNumber) {
    let additionalLinksContainer = container.querySelector('.additionalLinks');
    if (additionalLinksContainer) {
        additionalLinksContainer.style.display = 'block';  
        additionalLinksContainer.innerHTML = '';  
    } else {
        additionalLinksContainer = document.createElement("div");
        additionalLinksContainer.classList.add("additionalLinks");
        container.appendChild(additionalLinksContainer);
    }

    if (rollNumber.toUpperCase().includes("7Y")) {
        // MLRITM Student Details Card
        const details = decodeStudentDetails(rollNumber);
        additionalLinksContainer.innerHTML = `
            <div style="background:#222; border:1px solid #00d9ff; border-radius:8px; padding:12px; margin-top:8px; text-align:left; font-size:13px; color:#eee; width:100%; box-sizing:border-box;">
                <div style="font-weight:bold; color:#00d9ff; font-size:14px; margin-bottom:8px; border-bottom:1px solid #333; padding-bottom:4px;">
                    🎓 MLRITM Student Details
                </div>
                ${details.studentName ? `<div style="margin-bottom:4px;"><strong>Name:</strong> <span style="color:#ffb74d;">${details.studentName}</span></div>` : ''}
                <div style="margin-bottom:4px;"><strong>Roll Number:</strong> ${details.rollNumber}</div>
                <div style="margin-bottom:4px;"><strong>Email:</strong> <a href="mailto:${details.email}" style="color:#64b5f6; text-decoration:none;">${details.email}</a></div>
                ${details.phone ? `<div style="margin-bottom:4px;"><strong>Phone:</strong> ${details.phone}</div>` : ''}
                ${details.father ? `<div style="margin-bottom:4px;"><strong>Father Name:</strong> ${details.father}</div>` : ''}
                ${details.dob ? `<div style="margin-bottom:4px;"><strong>DOB:</strong> ${details.dob}</div>` : ''}
                <div style="margin-bottom:4px;"><strong>Branch:</strong> ${details.branch}</div>
                <div style="margin-bottom:4px;"><strong>Batch:</strong> ${details.batch}</div>
                <div style="margin-bottom:4px;"><strong>Course:</strong> ${details.course}</div>
                <div style="margin-bottom:6px;"><strong>College:</strong> MLRITM</div>
                
                <!-- Address Details -->
                <div style="background:#181818; border:1px solid #333; border-radius:6px; padding:8px; margin-top:8px;">
                    <div style="font-weight:600; color:#00d9ff; font-size:12px; margin-bottom:4px;">📍 Address & Location</div>
                    <div style="font-size:12px; margin-bottom:2px;"><strong>Home:</strong> ${details.address ? (details.address.line1 + ', ' + details.address.city + ', ' + details.address.district + ', ' + details.address.state + ' - ' + details.address.pincode) : 'Residence'}</div>
                    <div style="font-size:12px; margin-bottom:2px;"><strong>Campus:</strong> MLRITM, Dundigal, Hyderabad - 500043</div>
                    ${details.father_phone ? `<div style="font-size:12px; margin-bottom:2px;"><strong>Father Contact:</strong> <a href="tel:${details.father_phone}" style="color:#64b5f6;">${details.father_phone}</a></div>` : ''}
                    <div style="margin-top:4px;">
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((details.address ? details.address.line1 + ', ' + details.address.city : 'Dundigal') + ', Hyderabad Telangana')}" target="_blank" style="color:#00d9ff; font-size:11px; text-decoration:none;">🗺️ View Location on Map</a>
                    </div>
                </div>

                <div style="margin-top:8px; display:flex; gap:8px;">
                    <a href="https://anvaya.mlritm.ac.in/Docs/MLRITM/User/${details.rollNumber}.jpg" target="_blank" style="padding:4px 10px; background:#007bff; color:#fff; border-radius:4px; text-decoration:none; font-size:12px;">Full Photo</a>
                    <button type="button" onclick="navigator.clipboard.writeText('${details.email}'); alert('Email copied!');" style="padding:4px 10px; background:#333; color:#eee; border:1px solid #666; border-radius:4px; cursor:pointer; font-size:12px;">Copy Email</button>
                </div>
            </div>
        `;
        return;
    }

    // IARE Documents
    let promises = [];
    for (let i = 1; i <= 6; i++) {
        let img = new Image();
        img.src = `https://iare-data.s3.ap-south-1.amazonaws.com/uploads/STUDENTS/${rollNumber}/DOCS/${rollNumber}_${getSuffix(i)}.jpg`;
        img.alt = `${rollNumber}_${getSuffix(i)}`;

        promises.push(new Promise((resolve) => {
            img.onload = function() {
                resolve(img);
            };
            img.onerror = function() {
                resolve(null);
            };
        }));
    }

    Promise.all(promises).then((results) => {
        results.forEach(img => {
            if (img) {
                additionalLinksContainer.appendChild(img);
            }
        });
    });
}

function getSuffix(index) {
    switch(index) {
        case 1: return "SSC";
        case 2: return "INTER";
        case 3: return "Aadhar";
        case 4: return "Caste";
        case 5: return "Income";
        case 6: return "Photo";
    }
}
