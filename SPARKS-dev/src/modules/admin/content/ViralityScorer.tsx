import React, { useState } from 'react';
import { callAi } from '../../../lib/ai';

interface ScoreResult {
    overall_score: number;
    modifier_strength: number;
    specificity: number;
    curiosity_gap: number;
    clarity: number;
    formula_type: string;
    improvements: string[];
    rewritten: string;
}

const scoreColor = (n: number) => n >= 8 ? '#16a34a' : n >= 5 ? '#d97706' : '#dc2626';

const buildPrompt = (text: string) =>
    `You are a viral content analyst applying the Viral Vector Formula (unexpected modifier + specific subject = curiosity + click).

Score this content: "${text}"

Return ONLY a JSON object:
{
  "overall_score": 7,
  "modifier_strength": 6,
  "specificity": 8,
  "curiosity_gap": 7,
  "clarity": 8,
  "formula_type": "unexpected_modifier",
  "improvements": [
    "Add a specific number to increase credibility",
    "Shorten to 8 words or fewer to punch harder",
    "Add a curiosity gap — leave something unresolved"
  ],
  "rewritten": "One rewritten version applying the viral vector formula"
}

formula_type options: unexpected_modifier | curiosity_gap | number | contrast | question | none`;

const ViralityScorer: React.FC = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<ScoreResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const score = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const text = await callAi(buildPrompt(input), 'gemini-2.0-flash');
            if (!text) throw new Error('Empty response');
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            setResult(JSON.parse(cleaned) as ScoreResult);
        } catch {
            setError('Scoring failed — please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="virality-scorer">
            <h2 className="content-section-title">Virality Scorer</h2>
            <p className="content-section-hint">
                Paste any headline, hook, or post to score it against the Viral Vector Formula.
            </p>
            <textarea
                className="ads-textarea"
                rows={3}
                placeholder="Paste a headline, hook, or post…"
                value={input}
                onChange={e => setInput(e.target.value)}
            />
            <button
                className="ads-btn ads-btn--primary"
                onClick={score}
                disabled={loading || !input.trim()}
            >
                {loading ? '⟳ Scoring…' : 'Score'}
            </button>

            {error && <p className="ads-error">{error}</p>}

            {result && (
                <div className="vs-result">
                    <div className="vs-result__score" style={{ color: scoreColor(result.overall_score) }}>
                        {result.overall_score}/10
                    </div>
                    <div className="vs-result__formula-tag">{result.formula_type.replace(/_/g, ' ')}</div>

                    <div className="vs-result__axes">
                        {[
                            { label: 'Modifier Strength', value: result.modifier_strength },
                            { label: 'Specificity', value: result.specificity },
                            { label: 'Curiosity Gap', value: result.curiosity_gap },
                            { label: 'Clarity', value: result.clarity },
                        ].map(({ label, value }) => (
                            <div key={label} className="vs-axis">
                                <span className="vs-axis__label">{label}</span>
                                <div className="vs-axis__bar">
                                    <div className="vs-axis__fill"
                                        style={{ width: `${value * 10}%`, backgroundColor: scoreColor(value) }} />
                                </div>
                                <span className="vs-axis__value" style={{ color: scoreColor(value) }}>{value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="vs-result__improvements">
                        <h4>Improvements</h4>
                        <ul>
                            {result.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                        </ul>
                    </div>

                    <div className="vs-result__rewritten">
                        <h4>Try this instead</h4>
                        <p className="vs-result__rewritten-text">{result.rewritten}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViralityScorer;
