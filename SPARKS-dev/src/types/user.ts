// ConnectedTeacher was previously in src/modules/planner/types.ts — now the global type
export interface ConnectedTeacher {
    id: string;
    username: string;
    email: string;
    employeeId: string;
    avatarUrl?: string;
    schoolName?: string;
    schools?: string[];
    displayName: string;
    role: string;
    sharedAt?: string;
    notificationEmail?: string;
}

// Single unified profile — shared by Teacher Tools, Tango, and Planner.
// Column names match the Supabase PostgreSQL schema (snake_case).
// display_name maps to the planner's altName field (use toPlannerProfile() helper in planner/api.ts).
export interface UserProfile {
    id: string;
    email: string | null;
    display_name: string | null;
    sparks: number;
    subscription_tier: 'FREE' | 'PRO' | 'TEACHER_PLUS';
    active_unlocks: Record<string, number>;
    created_at: string;
    last_login: string;
    // Planner profile fields (merged from modules/planner/types.ts UserProfile)
    nationality: string | null;
    experience: string | null;
    phone: string | null;
    specializations: string[];
    school_name: string | null;
    role: string | null;
    employee_id: string | null;
    connected_teachers: ConnectedTeacher[];
}
