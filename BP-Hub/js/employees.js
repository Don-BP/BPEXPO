// BP LABO Employee Whitelist and License Management
// This file contains the master list of authorized employee IDs

export const EMPLOYEE_WHITELIST = [
    'IK4080',
    'IK4344',
    'IK4483',
    'IK5539',
    'IK5777',
    'IK4636',
    'IK5598',
    'IK5847',
    'OT5576',
    'OT4698',
    'SA4327',
    'SA4332',
    'SA3712',
    'TA2666',
    'TA5634',
    'TA7669',
    'TA3695',
    'TA5121',
    'TA5845',
    'TA4638',
    'TA5017',
    'TA4325',
    'TA3686',
    'TA5014',
    'TA3688',
    'TA3697',
    'TA2874',
    'TA5264',
    'KN4484',
    'BPDON',
    'BPJOE'
];

// License code validation patterns
export const LICENSE_CODE_PATTERNS = {
    // Pattern: BP-XXXX-XXXX (where X is alphanumeric)
    format: /^BP-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
    // Generate a license code for an employee ID
    generate: function(employeeId) {
        // Simple hash-based generation for demo purposes
        // In production, you'd want more secure license generation
        let hash = 0;
        for (let i = 0; i < employeeId.length; i++) {
            hash = ((hash << 5) - hash) + employeeId.charCodeAt(i);
            hash = hash & hash;
        }

        // Convert hash to license code format
        const part1 = Math.abs(hash % 10000).toString().padStart(4, '0');
        const part2 = Math.abs((hash >> 4) % 10000).toString().padStart(4, '0');

        return `BP-${part1}-${part2}`;
    }
};

// Email validation
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Employee ID validation (supports both standard format and admin format)
export const EMPLOYEE_ID_PATTERN = /^[A-Z]{2}(\d{4}|[A-Z]{3})$/;
