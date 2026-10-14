/**
 * MLRITM Student ERP Route Intelligence & Academic Services Registry
 * 
 * Centralized, immutable route configuration and secure navigation layer
 * for Marri Laxman Reddy Institute of Technology and Management (MLRITM).
 * 
 * Security Controls:
 * - Anti-Open-Redirect & Protocol validation (Strict HTTPS)
 * - Destination hostname allowlisting (anvaya.mlritm.ac.in, official CCAvenue)
 * - Safe URL normalization (prevents double slashes, path traversal, injection)
 * - Zero client-side credential storage (adheres to institutional session boundary)
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ErpRouteRegistry = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Core Institutional Constants
    const ERP_BASE_URL = 'https://anvaya.mlritm.ac.in/';
    const OFFICIAL_PAYMENT_URL = 'https://formbuilder.ccavenue.com/live/kotak-mahindra/marri-laxman-reddy-institute-of-technology-and-management/mlritm';
    const ERP_TENANT_ID = '5004';
    const ERP_STUDENT_ROLE_ID = 70;

    // Strict outbound destination allowlist
    const ALLOWED_ORIGINS = Object.freeze([
        'https://anvaya.mlritm.ac.in',
        'https://formbuilder.ccavenue.com'
    ]);

    /**
     * Normalizes and securely joins ERP base URL with route relative path
     * @param {string} base - Absolute base URL
     * @param {string} path - Relative service route
     * @returns {string} Sanitized, normalized absolute URL
     */
    function normalizeUrl(base, path) {
        if (!base) throw new Error('Base URL is required for normalization');
        
        const cleanBase = base.endsWith('/') ? base : base + '/';
        const cleanPath = (path || '').replace(/^\/+/, '');
        
        try {
            const resolved = new URL(cleanPath, cleanBase);
            
            // Security verification: protocol must be https
            if (resolved.protocol !== 'https:') {
                throw new Error(`Insecure protocol rejected: ${resolved.protocol}`);
            }
            
            // Security verification: origin must be in allowlist
            const isOriginAllowed = ALLOWED_ORIGINS.some(origin => resolved.origin === origin);
            if (!isOriginAllowed) {
                throw new Error(`Origin ${resolved.origin} is not in the approved institutional allowlist.`);
            }

            return resolved.toString();
        } catch (err) {
            console.error('[ErpRouteRegistry] URL normalization error:', err);
            throw err;
        }
    }

    /**
     * Verified Academic & Administrative Service Definitions
     */
    const ERP_SERVICES = Object.freeze([
        {
            id: 'profile',
            title: 'My Profile',
            path: 'Student/Student/MyProfile',
            category: 'Student Services',
            description: 'View verified student bio-data, academic enrollment details, admission branch, and official contact records.',
            requiresAuthentication: true,
            isExternal: false,
            icon: 'user',
            badge: 'Essential',
            actionLabel: 'Open Student Profile',
            tags: ['profile', 'bio', 'admission', 'roll', 'identity', 'personal']
        },
        {
            id: 'hall-ticket',
            title: 'Hall Ticket',
            path: 'Exam/HallTicket/Student/',
            category: 'Examinations',
            description: 'Download and print mid-term and semester end examination (SEE) hall tickets with seating timetable.',
            requiresAuthentication: true,
            isExternal: false,
            icon: 'ticket',
            badge: 'Exam',
            actionLabel: 'View Hall Ticket',
            tags: ['hall ticket', 'admit card', 'exam', 'timetable', 'see', 'center']
        },
        {
            id: 'course-registration',
            title: 'Course Registration',
            path: 'Student/CourseRegistration/Student/',
            category: 'Academics',
            description: 'Enroll in regular semester subjects, professional electives, open electives, and mandatory audit courses.',
            requiresAuthentication: true,
            isExternal: false,
            icon: 'book',
            badge: 'Academic',
            actionLabel: 'Register Courses',
            tags: ['course', 'subjects', 'electives', 'registration', 'curriculum', 'credits']
        },
        {
            id: 'rc-registration',
            title: 'Revaluation / Recounting',
            path: 'Student/RCRegistration/Student',
            category: 'Examinations',
            description: 'Apply for answer script recounting, challenge valuation, and scrutiny of semester exam marks.',
            requiresAuthentication: true,
            isExternal: false,
            icon: 'clipboard-check',
            badge: 'Scrutiny',
            actionLabel: 'Apply for RC / RV',
            tags: ['revaluation', 'recounting', 'rc', 'grades', 'marks', 'challenge']
        },
        {
            id: 'exam-registration',
            title: 'Exam Registration',
            path: 'Exam/ExamRegistration/Student/',
            category: 'Examinations',
            description: 'Register for regular and supplementary semester end examinations, verify eligibility, and pay exam fees.',
            requiresAuthentication: true,
            isExternal: false,
            icon: 'calendar-check',
            badge: 'Deadlines',
            actionLabel: 'Register for Exams',
            tags: ['exam fee', 'regular', 'supple', 'supplementary', 'registration']
        },
        {
            id: 'academic-calendar',
            title: 'Academic Calendar',
            path: 'Academic/AcademicCalendar/',
            category: 'Academics',
            description: 'Official academic schedule showing semester commencement, internal assessment slots, vacations, and lab schedules.',
            requiresAuthentication: true,
            isExternal: false,
            icon: 'calendar',
            badge: 'Schedule',
            actionLabel: 'View Calendar',
            tags: ['calendar', 'dates', 'holidays', 'mid terms', 'schedule', 'working days']
        },
        {
            id: 'fee-receipts',
            title: 'Fee Receipts',
            path: 'Account/FeeReceipt/',
            category: 'Finance',
            description: 'Inspect past tuition and college payments, download signed official fee receipts, and review ledger balances.',
            requiresAuthentication: true,
            isExternal: false,
            icon: 'receipt',
            badge: 'Accounts',
            actionLabel: 'View Fee Receipts',
            tags: ['fee', 'receipt', 'tuition', 'challan', 'statement', 'accounts']
        },
        {
            id: 'condonation-fee',
            title: 'Condonation Fee',
            path: 'Account/FeeReceipt/CondFee/',
            category: 'Finance',
            description: 'Check attendance shortage condonation notices, penalty clearance eligibility, and official condonation receipts.',
            requiresAuthentication: true,
            isExternal: false,
            icon: 'shield-alert',
            badge: 'Attendance',
            actionLabel: 'Condonation Clearance',
            tags: ['condonation', 'attendance', 'penalty', 'clearance', 'shortage']
        },
        {
            id: 'official-fee-payment',
            title: 'Official Tuition Fee Payment',
            path: null,
            externalUrl: OFFICIAL_PAYMENT_URL,
            category: 'Finance',
            description: 'Direct institutional payment gateway powered by Kotak Mahindra Bank & CCAvenue for secure online fee remittance.',
            requiresAuthentication: false,
            isExternal: true,
            icon: 'credit-card',
            badge: 'Official Gateway',
            actionLabel: 'Proceed to Official Gateway',
            tags: ['payment', 'online fee', 'ccavenue', 'kotak', 'bank', 'tuition payment', 'transport']
        }
    ]);

    /**
     * Resolves the secure absolute URL for a given service ID
     * @param {string} serviceId - Unique service identifier
     * @returns {string} Fully qualified and validated URL
     */
    function resolveServiceUrl(serviceId) {
        const service = ERP_SERVICES.find(s => s.id === serviceId);
        if (!service) {
            throw new Error(`Service "${serviceId}" is not registered in the ERP Route Registry.`);
        }

        if (service.isExternal && service.externalUrl) {
            const urlObj = new URL(service.externalUrl);
            if (!ALLOWED_ORIGINS.includes(urlObj.origin)) {
                throw new Error(`Untrusted external origin: ${urlObj.origin}`);
            }
            return service.externalUrl;
        }

        return normalizeUrl(ERP_BASE_URL, service.path);
    }

    /**
     * Retrieves a service configuration by ID
     * @param {string} serviceId
     * @returns {object|null}
     */
    function getService(serviceId) {
        return ERP_SERVICES.find(s => s.id === serviceId) || null;
    }

    /**
     * Returns list of unique categories
     * @returns {string[]}
     */
    function getCategories() {
        const categories = new Set(ERP_SERVICES.map(s => s.category));
        return ['All', ...Array.from(categories)];
    }

    /**
     * Filters services by category and text search query
     * @param {string} [category='All']
     * @param {string} [searchQuery='']
     * @returns {object[]}
     */
    function listServices(category = 'All', searchQuery = '') {
        let results = ERP_SERVICES;

        if (category && category !== 'All') {
            results = results.filter(s => s.category.toLowerCase() === category.toLowerCase());
        }

        if (searchQuery && searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase().trim();
            results = results.filter(s => {
                return s.title.toLowerCase().includes(q) ||
                       s.description.toLowerCase().includes(q) ||
                       s.category.toLowerCase().includes(q) ||
                       (s.tags && s.tags.some(t => t.toLowerCase().includes(q)));
            });
        }

        return results;
    }

    /**
     * Navigates to a service safely
     * @param {string} serviceId
     * @param {object} [callbacks] - Optional hooks for confirmation modal
     */
    function openService(serviceId, callbacks = {}) {
        const service = getService(serviceId);
        if (!service) {
            alert(`Service "${serviceId}" not found.`);
            return;
        }

        try {
            const url = resolveServiceUrl(serviceId);

            if (service.isExternal) {
                // If an onExternalPrompt handler is supplied, delegate to it
                if (typeof callbacks.onExternalPrompt === 'function') {
                    callbacks.onExternalPrompt(service, url);
                    return;
                }
                const confirmed = confirm(
                    `You are about to be redirected to the Official MLRITM Fee Payment Gateway:\n\n` +
                    `Destination: ${url}\n\n` +
                    `Click OK to proceed to the secure Kotak Mahindra / CCAvenue gateway.`
                );
                if (confirmed) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
            } else {
                // Authenticated ERP route
                // If an onAuthNotice handler is supplied, delegate or advise user
                if (typeof callbacks.onAuthNotice === 'function') {
                    callbacks.onAuthNotice(service, url);
                    return;
                }
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        } catch (err) {
            console.error('[ErpRouteRegistry] Navigation failed:', err);
            alert(`Unable to open service: ${err.message}`);
        }
    }

    return {
        ERP_BASE_URL,
        OFFICIAL_PAYMENT_URL,
        ERP_TENANT_ID,
        ERP_STUDENT_ROLE_ID,
        ALLOWED_ORIGINS,
        ERP_SERVICES,
        normalizeUrl,
        resolveServiceUrl,
        getService,
        getCategories,
        listServices,
        openService
    };
}));
