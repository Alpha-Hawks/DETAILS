/**
 * Comprehensive Verification Suite for MLRITM ERP Route Intelligence
 */

const assert = require('assert');
const registry = require('./erp_routes.js');

console.log('--- MLRITM ERP ROUTE REGISTRY VERIFICATION ---');

// Test 1: Service Count
assert.strictEqual(registry.ERP_SERVICES.length, 9, 'Expected exactly 9 registered services');
console.log('✔ Test 1 Passed: Exactly 9 verified services registered');

// Test 2: Required Institutional Route Paths
const expectedRoutes = {
    'profile': 'Student/Student/MyProfile',
    'hall-ticket': 'Exam/HallTicket/Student/',
    'course-registration': 'Student/CourseRegistration/Student/',
    'rc-registration': 'Student/RCRegistration/Student',
    'exam-registration': 'Exam/ExamRegistration/Student/',
    'academic-calendar': 'Academic/AcademicCalendar/',
    'fee-receipts': 'Account/FeeReceipt/',
    'condonation-fee': 'Account/FeeReceipt/CondFee/'
};

for (const [id, path] of Object.entries(expectedRoutes)) {
    const service = registry.getService(id);
    assert(service, `Service ${id} must exist in registry`);
    assert.strictEqual(service.path, path, `Service ${id} path must match ${path}`);
    const resolved = registry.resolveServiceUrl(id);
    assert.strictEqual(resolved, 'https://anvaya.mlritm.ac.in/' + path, `Resolved URL for ${id} mismatch`);
}
console.log('✔ Test 2 Passed: All 8 Anvaya internal routes match institutional specification');

// Test 3: Official Payment Destination
const paymentService = registry.getService('official-fee-payment');
assert(paymentService, 'official-fee-payment service must exist');
assert.strictEqual(paymentService.isExternal, true, 'Payment service must be flagged as external');
assert.strictEqual(paymentService.requiresAuthentication, false, 'Payment service does not require ERP student session');
assert.strictEqual(
    registry.resolveServiceUrl('official-fee-payment'),
    'https://formbuilder.ccavenue.com/live/kotak-mahindra/marri-laxman-reddy-institute-of-technology-and-management/mlritm'
);
console.log('✔ Test 3 Passed: Official payment destination correctly mapped to CCAvenue/Kotak gateway');

// Test 4: Open Redirect & Security Rejection
assert.throws(() => {
    registry.normalizeUrl('http://insecure.mlritm.ac.in/', 'Student/Student/MyProfile');
}, /Insecure protocol rejected/, 'Insecure http protocol must throw error');

assert.throws(() => {
    registry.normalizeUrl('https://evil-attacker.com/', 'Student/Student/MyProfile');
}, /not in the approved institutional allowlist/, 'Unapproved origin must throw error');

console.log('✔ Test 4 Passed: Anti-open-redirect and strict HTTPS protocol enforcement operational');

// Test 5: Categories & Filtering
const categories = registry.getCategories();
assert(categories.includes('All'), 'Categories must include "All"');
assert(categories.includes('Student Services'), 'Categories must include "Student Services"');
assert(categories.includes('Examinations'), 'Categories must include "Examinations"');
assert(categories.includes('Academics'), 'Categories must include "Academics"');
assert(categories.includes('Finance'), 'Categories must include "Finance"');

const examServices = registry.listServices('Examinations');
assert.strictEqual(examServices.length, 3, 'Examinations category should return 3 services');

const financeServices = registry.listServices('Finance');
assert.strictEqual(financeServices.length, 3, 'Finance category should return 3 services');

const academicServices = registry.listServices('Academics');
assert.strictEqual(academicServices.length, 2, 'Academics category should return 2 services');

const studentServices = registry.listServices('Student Services');
assert.strictEqual(studentServices.length, 1, 'Student Services category should return 1 service');

console.log('✔ Test 5 Passed: Category counts verified (Examinations: 3, Finance: 3, Academics: 2, Student Services: 1)');

// Test 6: Text Search
const hallTicketSearch = registry.listServices('All', 'hall ticket');
assert.strictEqual(hallTicketSearch.length, 1);
assert.strictEqual(hallTicketSearch[0].id, 'hall-ticket');

const feeSearch = registry.listServices('All', 'fee');
assert.strictEqual(feeSearch.length, 4, 'Search for "fee" matches Fee Receipts, Condonation Fee, Official Tuition Fee, and Exam Registration (exam fee)');

const invalidSearch = registry.listServices('All', 'xyznonexistent123');
assert.strictEqual(invalidSearch.length, 0, 'Non-matching search must return empty array');

console.log('✔ Test 6 Passed: Keyword and tag search functioning accurately');

// Test 7: Institutional Reference Constants
assert.strictEqual(registry.ERP_TENANT_ID, '5004', 'Tenant ID must be 5004');
assert.strictEqual(registry.ERP_STUDENT_ROLE_ID, 70, 'Student UserTypeId must be 70');
console.log('✔ Test 7 Passed: Institutional tenant identifier and role ID confirmed');

console.log('\n🎉 ALL 7 TEST SUITES PASSED CLEANLY WITH ZERO REGRESSIONS!');
