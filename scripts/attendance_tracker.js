/**
 * MLRITM Student Attendance Tracker & BeesERP Parser
 * Engineered from MLRITM-Hyderabad-Attendance-Tracking-Application (BeesERP: mlritmexams.com)
 * 
 * Features:
 * - Daywise attendance parser (Date + Periods 1-7)
 * - Daily absent detector (Checks today's date for 'A')
 * - Attendance & Condonation percentage calculator (< 75% condonation alert)
 * - Safe bunk & catch-up targets calculator
 * - LocalStorage persistence per student roll number
 */

(function () {
    const MLRITM_ATTENDANCE = {
        portalUrl: "https://mlritmexams.com/BeesERP/Login.aspx",
        dashboardUrl: "https://mlritmexams.com/BeesERP/StudentLogin/StudLoginDashboard.aspx",
        gridId: "ctl00_cpStud_grdDaywise",
        percentageId: "ctl00_cpStud_lblTotalPercentage",
        nameId: "ctl00_cpHeader_ucStud_lblStudentName",

        /**
         * Parses text or HTML from BeesERP Daywise Attendance Table
         */
        parseBeesAttendance: function (rawInput) {
            if (!rawInput || typeof rawInput !== 'string') return null;

            let extractedName = null;
            let extractedPercentage = null;

            // Check if HTML was pasted
            if (rawInput.includes('<') && rawInput.includes('>')) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = rawInput;

                const nameEl = tempDiv.querySelector('#ctl00_cpHeader_ucStud_lblStudentName');
                if (nameEl) extractedName = nameEl.textContent.trim();

                const pctEl = tempDiv.querySelector('#ctl00_cpStud_lblTotalPercentage');
                if (pctEl) {
                    const match = pctEl.textContent.match(/([0-9]+(?:\.[0-9]+)?)/);
                    if (match) extractedPercentage = parseFloat(match[1]);
                }

                const grid = tempDiv.querySelector('#ctl00_cpStud_grdDaywise') || tempDiv.querySelector('table');
                if (grid) {
                    rawInput = grid.textContent || grid.innerText;
                } else {
                    rawInput = tempDiv.textContent || tempDiv.innerText;
                }
            }

            // Fallback regex for percentage if not found in HTML
            if (extractedPercentage === null) {
                const pctMatch = rawInput.match(/(?:Total\s*Percentage|Attendance|Total)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)\s*%/i);
                if (pctMatch) extractedPercentage = parseFloat(pctMatch[1]);
            }

            // Split into tokens (same logic as Java String[] attendance = studUserDetails.text().split(" "))
            const tokens = rawInput.split(/\s+/).filter(t => t.trim().length > 0);
            const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}(?:\(\w+\))?$/;

            const days = [];
            let currentDay = null;
            let totalPeriods = 0;
            let totalPresents = 0;
            let totalAbsents = 0;

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i].trim();

                if (dateRegex.test(token)) {
                    if (currentDay) {
                        days.push(currentDay);
                    }
                    currentDay = {
                        date: token,
                        periods: []
                    };
                } else if (currentDay && (token === 'P' || token === 'A' || token === '-' || token === 'OD' || token === 'L')) {
                    currentDay.periods.push(token);
                    totalPeriods++;
                    if (token === 'P' || token === 'OD') totalPresents++;
                    if (token === 'A') totalAbsents++;
                }
            }
            if (currentDay) {
                days.push(currentDay);
            }

            // Calculate overall percentage if not explicitly given
            const calculatedPercentage = totalPeriods > 0 
                ? parseFloat(((totalPresents / totalPeriods) * 100).toFixed(2)) 
                : (extractedPercentage !== null ? extractedPercentage : 0);

            // Today's Date format in BeesERP: d/M/yyyy or M/d/yyyy
            const today = new Date();
            const todayStr1 = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
            const todayStr2 = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

            let isAbsentToday = false;
            let todayRecord = null;

            for (const d of days) {
                if (d.date.includes(todayStr1) || d.date.includes(todayStr2)) {
                    todayRecord = d;
                    if (d.periods.includes('A')) {
                        isAbsentToday = true;
                    }
                }
            }

            return {
                studentName: extractedName,
                totalPercentage: extractedPercentage !== null ? extractedPercentage : calculatedPercentage,
                totalPeriods,
                totalPresents,
                totalAbsents,
                days,
                isAbsentToday,
                todayRecord
            };
        },

        /**
         * Computes safe classes to bunk or classes required to reach 75%
         */
        calculateAnalytics: function (totalPresents, totalPeriods, target = 75) {
            totalPresents = parseInt(totalPresents, 10) || 0;
            totalPeriods = parseInt(totalPeriods, 10) || 0;

            if (totalPeriods === 0) {
                return {
                    currentPercentage: 0,
                    status: "No Data",
                    statusColor: "#8b949e",
                    canBunk: 0,
                    mustAttend: 0,
                    needsCondonation: false,
                    isDetained: false
                };
            }

            const current = (totalPresents / totalPeriods) * 100;
            const currentPct = parseFloat(current.toFixed(2));

            let canBunk = 0;
            let mustAttend = 0;

            if (current >= target) {
                // Formula: (presents / (total + x)) >= (target / 100) => x = floor((100*p - target*t) / target)
                canBunk = Math.floor((100 * totalPresents - target * totalPeriods) / target);
            } else {
                // Formula: ((presents + y) / (total + y)) >= (target / 100) => y = ceil((target*t - 100*p) / (100 - target))
                mustAttend = Math.ceil((target * totalPeriods - 100 * totalPresents) / (100 - target));
            }

            let status = "🟢 Satisfactory (Safe)";
            let statusColor = "#2ea043";
            let needsCondonation = false;
            let isDetained = false;

            if (currentPct < 65) {
                status = "🔴 Critical: Shortage / Detained (<65%)";
                statusColor = "#f85149";
                isDetained = true;
            } else if (currentPct < target) {
                status = "🟡 Condonation Required (65% - 74.9%)";
                statusColor = "#e3b341";
                needsCondonation = true;
            }

            return {
                currentPercentage: currentPct,
                status,
                statusColor,
                canBunk: Math.max(0, canBunk),
                mustAttend: Math.max(0, mustAttend),
                needsCondonation,
                isDetained
            };
        },

        saveAttendance: function (rollNumber, data) {
            if (!rollNumber) return;
            const key = `mlritm_att_${rollNumber.toUpperCase().trim()}`;
            localStorage.setItem(key, JSON.stringify({
                data,
                updatedAt: new Date().toISOString()
            }));
        },

        getSavedAttendance: function (rollNumber) {
            if (!rollNumber) return null;
            const key = `mlritm_att_${rollNumber.toUpperCase().trim()}`;
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                return null;
            }
        }
    };

    window.MLRITM_ATTENDANCE = MLRITM_ATTENDANCE;
})();
