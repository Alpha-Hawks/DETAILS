/**
 * MLRITM Anvaya ERP Service Registry & In-App Viewer
 * Verified strictly from local anvaya.mlritm.ac.in source files
 * Tenant ID: 5004 | UserTypeId: 70 (Student)
 * 
 * NOTE: Never opens external https://anvaya.mlritm.ac.in/Login.
 * All service views are rendered in-app using verified local student data.
 */

(function () {
    const ERP_CONFIG = {
        tenantId: 5004,
        userTypeId: 70,
        domain: "MLRITM",
        baseUrl: "https://anvaya.mlritm.ac.in",
        vendor: "OrgMaker ERP (Hilip Technologies)",
        routes: [
            { id: "dashboard", name: "Student Dashboard / Portal", icon: "🏛️", path: "App", category: "Core", desc: "Main student portal landing session, academic summary, and notifications." },
            { id: "profile", name: "My Profile", icon: "👤", path: "Student/Student/MyProfile", category: "Student", desc: "Personal profile, guardian contact, residential record, and academic enrollment details." },
            { id: "hallTicket", name: "Hall Ticket", icon: "🎫", path: "Exam/HallTicket/Student/", category: "Examinations", desc: "Examination hall ticket, seat allocation, exam center, and scheduled session timetable." },
            { id: "examReg", name: "Exam Registration", icon: "📝", path: "Exam/ExamRegistration/Student/", category: "Examinations", desc: "Regular and supplementary examination registration and fee payment verification." },
            { id: "courseReg", name: "Course Registration", icon: "📚", path: "Student/CourseRegistration/Student/", category: "Academics", desc: "Curriculum course registration, elective selection, and registered credit units." },
            { id: "revaluation", name: "Recounting / Revaluation", icon: "🔄", path: "Student/RCRegistration/Student", category: "Academics", desc: "Application for answer script recounting, revaluation, and paper challenge." },
            { id: "academicCal", name: "Academic Calendar", icon: "📅", path: "Academic/AcademicCalendar/", category: "Academics", desc: "Institutional schedule of instructions, mid exams, laboratory tests, and semester ends." },
            { id: "feeReceipts", name: "Fee Receipts", icon: "🧾", path: "Account/FeeReceipt/", category: "Accounts", desc: "Tuition, examination, and admission fee receipt history and payment statements." },
            { id: "condonationFee", name: "Attendance Condonation Fee", icon: "💳", path: "Account/FeeReceipt/CondFee/", category: "Accounts", desc: "Attendance shortage condonation fine calculation, approval, and receipt ledger." },
            { id: "quizzes", name: "Test / Quiz (E-learning)", icon: "💻", path: "Elearning/ELRTestStudent/", category: "E-Learning", desc: "Continuous internal evaluation (CIE) quizzes, online assignments, and unit assessments." },
            { id: "services", name: "Service Requests", icon: "🛠️", path: "Student/StudentService/", category: "Services", desc: "Bonafide certificates, custodian requests, study certificates, and ID issuance." },
            { id: "feedback", name: "Student Feedback", icon: "💬", path: "Feedback/FeedbackRecord/", category: "Feedback", desc: "End-semester faculty survey, subject evaluation, and infrastructure feedback." },
            { id: "grievance", name: "Student Grievance", icon: "⚖️", path: "Grievance/Grievance/", category: "Services", desc: "Institutional grievance redressal, academic appeals, and administrative tickets." },
            { id: "changePass", name: "Change Password", icon: "🔑", path: "App/ChangePassword", category: "Security", desc: "Portal credential management and authentication security settings." },
            { id: "attendanceTracker", name: "BeesERP Attendance Tracker", icon: "📊", path: "https://mlritmexams.com/BeesERP/Login.aspx", category: "Academics", desc: "Daywise period attendance tracking (ctl00_cpStud_grdDaywise) and total percentage calculation." },
            { id: "tuitionFee", name: "Tuition Fee Payment (CCAvenue)", icon: "💸", path: "https://formbuilder.ccavenue.com/live/kotak-mahindra/marri-laxman-reddy-institute-of-technology-and-management/mlritm", category: "External", desc: "Kotak Mahindra Bank / CCAvenue online tuition collection gateway." }
        ]
    };

    window.MLRITM_ERP_CONFIG = ERP_CONFIG;

    let activeRollNumber = null;

    function injectErpModalStyles() {
        if (document.getElementById("erpModalStyles")) return;
        const style = document.createElement("style");
        style.id = "erpModalStyles";
        style.textContent = `
            .erp-modal-overlay {
                display: none;
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(5px);
                z-index: 999999;
                align-items: center;
                justify-content: center;
                padding: 16px;
                box-sizing: border-box;
            }
            .erp-modal-overlay.active {
                display: flex;
            }
            .erp-modal-card {
                background: #161b22;
                border: 1px solid #30363d;
                border-radius: 12px;
                max-width: 650px;
                width: 100%;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.9);
                color: #e6edf3;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                overflow: hidden;
                animation: erpFadeIn 0.2s ease-out;
            }
            @keyframes erpFadeIn {
                from { opacity: 0; transform: scale(0.96); }
                to { opacity: 1; transform: scale(1); }
            }
            .erp-modal-header {
                padding: 16px 20px;
                border-bottom: 1px solid #30363d;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #0d1117;
            }
            .erp-modal-header h3 {
                margin: 0;
                font-size: 18px;
                color: #58a6ff;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .erp-modal-close {
                background: none;
                border: none;
                color: #8b949e;
                font-size: 24px;
                line-height: 1;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 6px;
            }
            .erp-modal-close:hover {
                color: #fff;
                background: #21262d;
            }
            .erp-modal-body {
                padding: 20px;
                overflow-y: auto;
            }
            .erp-student-banner {
                background: #0d1117;
                border: 1px solid #238636;
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
            }
            .erp-student-info {
                font-size: 14px;
            }
            .erp-student-info strong {
                color: #7ee787;
                font-size: 15px;
            }
            .erp-tenant-badge {
                background: #21262d;
                border: 1px solid #30363d;
                color: #8b949e;
                font-size: 11px;
                padding: 3px 8px;
                border-radius: 20px;
            }
            .erp-routes-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 10px;
            }
            .erp-route-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 14px;
                background: #21262d;
                border: 1px solid #30363d;
                border-radius: 8px;
                color: #c9d1d9;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                text-align: left;
                transition: all 0.2s;
            }
            .erp-route-btn:hover {
                background: #1f6feb;
                border-color: #388bfd;
                color: #fff;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(31, 111, 235, 0.3);
            }
            .erp-route-btn .erp-route-icon {
                font-size: 18px;
                flex-shrink: 0;
            }
            .erp-modal-footer {
                padding: 12px 20px;
                border-top: 1px solid #30363d;
                background: #0d1117;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                color: #8b949e;
            }
            .erp-detail-panel {
                background: #0d1117;
                border: 1px solid #30363d;
                border-radius: 8px;
                padding: 16px;
                margin-top: 10px;
            }
        `;
        document.head.appendChild(style);
    }

    function ensureErpModalDom() {
        injectErpModalStyles();
        let overlay = document.getElementById("erpModalOverlay");
        if (overlay) return overlay;

        overlay = document.createElement("div");
        overlay.id = "erpModalOverlay";
        overlay.className = "erp-modal-overlay";
        overlay.innerHTML = `
            <div class="erp-modal-card">
                <div class="erp-modal-header">
                    <h3 id="erpModalTitle">🏛️ MLRITM Anvaya ERP Services</h3>
                    <button class="erp-modal-close" onclick="closeErpMenu()">&times;</button>
                </div>
                <div class="erp-modal-body">
                    <div id="erpStudentBanner" class="erp-student-banner" style="display:none;"></div>
                    <div id="erpMainView">
                        <div style="font-size: 12px; color: #8b949e; margin-bottom: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                            Verified In-App Services (Tenant 5004):
                        </div>
                        <div class="erp-routes-grid" id="erpRoutesContainer"></div>
                    </div>
                    <div id="erpDetailView" style="display:none;"></div>
                </div>
                <div class="erp-modal-footer">
                    <span>OrgMaker ERP • Local Verified Registry</span>
                    <button type="button" onclick="closeErpMenu()" style="background:#21262d; border:1px solid #30363d; color:#c9d1d9; padding:5px 12px; border-radius:5px; cursor:pointer; font-size:12px;">Close</button>
                </div>
            </div>
        `;

        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) {
                closeErpMenu();
            }
        });

        document.body.appendChild(overlay);
        return overlay;
    }

    window.openErpMenu = function (rollNumber) {
        const overlay = ensureErpModalDom();
        const banner = document.getElementById("erpStudentBanner");
        const container = document.getElementById("erpRoutesContainer");
        const mainView = document.getElementById("erpMainView");
        const detailView = document.getElementById("erpDetailView");

        mainView.style.display = "block";
        detailView.style.display = "none";
        document.getElementById("erpModalTitle").textContent = "🏛️ MLRITM Anvaya ERP Services";

        activeRollNumber = rollNumber ? rollNumber.toUpperCase().trim() : null;

        if (activeRollNumber) {
            const db = (typeof window !== 'undefined' && window.MLRITM_STUDENTS) ? window.MLRITM_STUDENTS[activeRollNumber] : null;
            const studentName = db && db.name ? db.name : "";

            banner.style.display = "flex";
            banner.innerHTML = `
                <div class="erp-student-info">
                    Student: <strong>${activeRollNumber}</strong> ${studentName ? `• <span style="color:#ffb74d;">${studentName}</span>` : ''}
                    <div style="color:#8b949e; font-size:12px; margin-top:2px;">${activeRollNumber}@mlritm.ac.in</div>
                </div>
                <div>
                    <span class="erp-tenant-badge">Tenant 5004</span>
                    <span class="erp-tenant-badge" style="margin-left:4px;">Role 70</span>
                </div>
            `;
        } else {
            banner.style.display = "none";
            banner.innerHTML = "";
        }

        container.innerHTML = ERP_CONFIG.routes.map(r => `
            <button type="button" class="erp-route-btn" onclick="showErpServiceDetail('${r.id}')" title="${r.name} (${r.path})">
                <span class="erp-route-icon">${r.icon}</span>
                <span>${r.name}</span>
            </button>
        `).join("");

        overlay.classList.add("active");
    };

    window.showErpServiceDetail = function (serviceId) {
        const route = ERP_CONFIG.routes.find(r => r.id === serviceId);
        if (!route) return;

        const mainView = document.getElementById("erpMainView");
        const detailView = document.getElementById("erpDetailView");
        const title = document.getElementById("erpModalTitle");

        mainView.style.display = "none";
        detailView.style.display = "block";
        title.innerHTML = `${route.icon} ${route.name}`;

        const roll = activeRollNumber || "NO ROLL SELECTED";
        const db = (typeof window !== 'undefined' && window.MLRITM_STUDENTS && activeRollNumber) ? window.MLRITM_STUDENTS[activeRollNumber] : null;
        const photoUrl = activeRollNumber ? `https://anvaya.mlritm.ac.in/Docs/MLRITM/User/${activeRollNumber}.jpg` : "";

        detailView.innerHTML = `
            <div class="erp-detail-panel">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #21262d; padding-bottom:8px;">
                    <div style="font-size:12px; color:#58a6ff; font-weight:600; text-transform:uppercase;">
                        ${route.category} Module • Verified Route
                    </div>
                    <span class="erp-tenant-badge">Path: ${route.path}</span>
                </div>

                <p style="font-size:13px; color:#c9d1d9; margin-bottom:14px; line-height:1.5;">
                    ${route.desc}
                </p>

                ${activeRollNumber ? `
                    <div style="background:#161b22; border:1px solid #30363d; border-radius:8px; padding:12px; margin-bottom:14px; display:flex; gap:14px; align-items:center;">
                        <img src="${photoUrl}" alt="${roll}" style="width:54px; height:54px; border-radius:8px; object-fit:cover; border:2px solid #58a6ff;" onerror="this.src='https://via.placeholder.com/54/161b22/58a6ff?text=User'">
                        <div style="font-size:13px;">
                            <div style="font-weight:700; color:#58a6ff;">${roll} ${db && db.name ? '• ' + db.name : ''}</div>
                            <div style="color:#8b949e; font-size:12px;">${db && db.branch ? db.branch : 'MLRITM Student'} • ${db && db.batch ? 'Batch ' + db.batch : 'B.Tech'}</div>
                            ${db && db.phone ? `<div style="color:#7ee787; font-size:12px;">📱 ${db.phone}</div>` : ''}
                        </div>
                    </div>
                ` : `
                    <div style="background:#21262d; border:1px solid #30363d; border-radius:6px; padding:10px; font-size:12px; color:#8b949e; margin-bottom:14px;">
                        ℹ️ Tip: Search or select a student roll number first to view specific student records for this service.
                    </div>
                `}

                <div style="background:#0a0c10; border-left:3px solid #f77737; padding:10px 12px; border-radius:4px; font-size:12px; color:#c9d1d9; line-height:1.5; margin-bottom:14px;">
                    <strong style="color:#f77737;">Offline Data Notice:</strong><br>
                    Live institutional transactions (e.g. real-time hall ticket slips, live attendance percentages, and fee payment balances) reside strictly on the college's private SQL server behind authentication. External requests without a college login cookie are blocked by their firewall and redirected to <code style="color:#ff7b72;">/Login</code>. This in-app viewer displays verified local database records without navigating away.
                </div>

                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button type="button" onclick="backToErpServices()" style="padding:7px 14px; background:#1f6feb; color:#fff; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">
                        ← Back to All Services
                    </button>
                    ${serviceId === 'attendanceTracker' ? `
                        <button type="button" onclick="closeErpMenu(); if(typeof switchTab==='function') switchTab('attendance');" style="padding:7px 14px; background:#238636; color:#fff; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">
                            Open In-App Attendance Tracker 📊
                        </button>
                    ` : ''}
                    ${activeRollNumber ? `
                        <button type="button" onclick="navigator.clipboard.writeText('${activeRollNumber}'); alert('Roll Number copied: ${activeRollNumber}');" style="padding:7px 14px; background:#21262d; border:1px solid #30363d; color:#c9d1d9; border-radius:6px; font-size:12px; cursor:pointer;">
                            Copy Roll Number
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    };

    window.backToErpServices = function () {
        const mainView = document.getElementById("erpMainView");
        const detailView = document.getElementById("erpDetailView");
        const title = document.getElementById("erpModalTitle");

        mainView.style.display = "block";
        detailView.style.display = "none";
        title.textContent = "🏛️ MLRITM Anvaya ERP Services";
    };

    window.closeErpMenu = function () {
        const overlay = document.getElementById("erpModalOverlay");
        if (overlay) {
            overlay.classList.remove("active");
        }
    };

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            window.closeErpMenu();
        }
    });
})();
