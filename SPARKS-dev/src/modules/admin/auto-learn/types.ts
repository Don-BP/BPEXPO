export interface AutoLearnPattern {
    pattern: string;
    evidence: string;
    lift: string;
}

export interface AutoLearnHypothesis {
    hypothesis: string;
    rationale: string;
}

export interface GeneratedPost {
    platform: string;
    content: string;
    scheduled_at: string;
}

export interface AutoLearnRun {
    id: string;
    ran_at: string;
    posts_analyzed: number;
    posts_generated: number;
    patterns: AutoLearnPattern[];
    hypotheses: AutoLearnHypothesis[];
    new_posts: GeneratedPost[];
    summary: string;
    triggered_by: 'cron' | 'manual';
}

export interface ActiveStrategy {
    module: string;
    strategy: string;
    is_manual_override: boolean;
    updated_at: string;
}
