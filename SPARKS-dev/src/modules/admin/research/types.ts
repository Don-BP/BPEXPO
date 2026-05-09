export interface ResearchResult {
    id: string;
    category: 'opportunities' | 'competitors' | 'market_signals';
    query: string;
    title: string;
    url: string;
    summary: string;
    source: 'exa' | 'firecrawl' | 'gemini';
    searched_at: string;
}
