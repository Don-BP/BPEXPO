// BP LABO License Code Generator Utility
// This utility helps generate license codes for employees

import { EMPLOYEE_WHITELIST, LICENSE_CODE_PATTERNS } from './employees.js';

/**
 * Generate license codes for all employees in the whitelist
 * @returns {Object} Object with employee IDs as keys and license codes as values
 */
export function generateAllLicenseCodes() {
    const codes = {};
    EMPLOYEE_WHITELIST.forEach(employeeId => {
        codes[employeeId] = LICENSE_CODE_PATTERNS.generate(employeeId);
    });
    return codes;
}

/**
 * Generate license code for a specific employee
 * @param {string} employeeId - The employee ID
 * @returns {string} The license code for the employee
 */
export function generateLicenseCode(employeeId) {
    if (!EMPLOYEE_WHITELIST.includes(employeeId)) {
        throw new Error('Employee ID not found in whitelist');
    }
    return LICENSE_CODE_PATTERNS.generate(employeeId);
}

/**
 * Display all license codes in console (for administrative purposes)
 */
export function displayAllLicenseCodes() {
    console.log('BP LABO Employee License Codes:');
    console.log('================================');
    const codes = generateAllLicenseCodes();
    Object.entries(codes).forEach(([employeeId, licenseCode]) => {
        console.log(`${employeeId}: ${licenseCode}`);
    });
    console.log('================================');
    console.log('IMPORTANT: Share these codes securely with employees!');
    console.log('Each code can only be used once per employee.');
}

// Auto-display codes when this module is loaded (for development/testing)
if (typeof window !== 'undefined') {
    // Only run in browser environment
    console.log('License codes generated. Run displayAllLicenseCodes() to view them.');
}
