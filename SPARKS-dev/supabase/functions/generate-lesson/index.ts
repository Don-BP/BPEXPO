import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Pinecone helpers ─────────────────────────────────────────────

async function embedText(apiKey: string, queryText: string): Promise<number[]> {
  const res = await fetch('https://api.pinecone.io/embed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
      'X-Pinecone-API-Version': '2024-10',
    },
    body: JSON.stringify({
      model: 'llama-text-embed-v2',
      inputs: [{ text: queryText }],
      parameters: { input_type: 'query', truncate: 'END' },
    }),
  });
  if (!res.ok) {
    console.error('Pinecone embed failed:', await res.text());
    return [];
  }
  const data = await res.json();
  return data.data?.[0]?.values ?? [];
}

async function queryPinecone(
  namespace: string,
  queryText: string,
  topK: number,
  filter?: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  const host = Deno.env.get('PINECONE_INDEX_HOST')!;
  const apiKey = Deno.env.get('PINECONE_API_KEY')!;

  const vector = await embedText(apiKey, queryText);
  if (vector.length === 0) return [];

  const res = await fetch(`${host}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
    },
    body: JSON.stringify({
      namespace,
      vector,
      topK,
      includeMetadata: true,
      ...(filter ? { filter } : {}),
    }),
  });

  if (!res.ok) {
    console.error('Pinecone query failed:', await res.text());
    return [];
  }

  const data = await res.json();
  return data.matches ?? [];
}

// ── Grade numeric helper ─────────────────────────────────────────

function gradeToNumeric(grade: string): number {
  const map: Record<string, number> = {
    'Grade 3': 3, 'Grade 4': 4, 'Grade 5': 5, 'Grade 6': 6,
    '1st Year': 7, '2nd Year': 8, '3rd Year': 9,
  };
  return map[grade] ?? 5;
}

// ── Build enriched lesson prompt ─────────────────────────────────

async function buildLessonPrompt(params: {
  textbook: string;
  unit: string;
  grade: string;
  level: string;
  studentLevel: number;
  classSize: number;
  duration: number;
  teacher1Name: string;
  teacher2Name: string;
  customTarget?: string;
  customVocab?: string;
}): Promise<string> {
  const gradeNum = gradeToNumeric(params.grade);
  const isCustom = Boolean(params.customTarget);

  // Query 1: textbook unit knowledge
  let unitContext = '';
  if (isCustom) {
    const queryText = `${params.customTarget ?? ''} ${params.customVocab ?? ''}`;
    const hits = await queryPinecone('textbook-units', queryText, 3, {
      grade_numeric: { $eq: gradeNum },
    });
    if (hits.length > 0) {
      unitContext = hits
        .map(h => String((h.metadata as Record<string, unknown>)?.text ?? ''))
        .join('\n\n---\n\n');
    }
  } else {
    const hits = await queryPinecone('textbook-units', params.unit, 1, {
      textbook: { $eq: params.textbook },
    });
    if (hits.length > 0) {
      unitContext = String((hits[0].metadata as Record<string, unknown>)?.text ?? '');
    }
  }

  // Query 2: grade-appropriate activities
  const activityQuery = `${params.customTarget ?? params.unit} ${params.grade} speaking listening`;
  const activityHits = await queryPinecone('activities', activityQuery, 5, {
    min_grade_numeric: { $lte: gradeNum },
    max_grade_numeric: { $gte: gradeNum },
  });
  const activitiesContext = activityHits
    .map(h => String((h.metadata as Record<string, unknown>)?.text ?? ''))
    .join('\n\n---\n\n');

  const targetLanguage = params.customTarget ?? 'See unit knowledge above';

  const gradeConstraints = gradeNum <= 4
    ? 'Grade 3-4: TPR, gestures, choral only. Max 1 short sentence. NO writing. NO reading.'
    : gradeNum <= 6
    ? 'Grade 5-6: Simple pair exchanges. Max 2-turn dialogue. Basic reading optional.'
    : gradeNum === 7
    ? 'JH 1st Year: Short pair conversations. Simple grammar explanation acceptable.'
    : 'JH 2nd-3rd Year: Extended communication, written tasks, grammar accuracy expected.';

  return `You are a master ALT lesson designer for Japanese public schools (MEXT curriculum). You write lessons that are detailed enough for a brand-new ALT to walk in and teach confidently with zero prior briefing.

${unitContext ? `UNIT KNOWLEDGE:\n${unitContext}\n` : ''}
${activitiesContext ? `ACTIVITY BANK (draw from these, adapt for 3P structure, do NOT copy blindly):\n${activitiesContext}\n` : ''}

LESSON PARAMETERS:
- Level: ${params.level} | Grade: ${params.grade} | Student proficiency: ${params.studentLevel}/5
- Class size: ${params.classSize} students | Duration: ${params.duration} minutes
- Textbook: "${params.textbook}" | Unit: "${params.unit}"
- Target language: "${targetLanguage}"
${params.customVocab ? `- Key vocabulary: "${params.customVocab}"` : ''}
- ALT name: ${params.teacher1Name || 'ALT'} | JTE name: ${params.teacher2Name || 'JTE'}

LESSON STRUCTURE (times must total exactly ${params.duration} minutes):
  Warm-up   5 min — high energy, review prior knowledge, set context
  Present  10 min — model target language clearly; ALT demonstrates, students observe then echo
  Practice 15 min — controlled repetition through structured activity or game
  Produce  10 min — students use target language independently (pair/group/survey)
  Wrap-up   5 min — review key phrases, praise effort, preview next class

GRADE CONSTRAINTS (hard rules — never break these): ${gradeConstraints}

━━━ CONTENT QUALITY STANDARDS (every section must meet ALL of these) ━━━

ACTIVITY FIELD — write a rich, step-by-step lesson narrative (minimum 150 words per section):
  • Give the activity a clear name in the first line (e.g. "Flashcard Echo Drill")
  • Write numbered steps (1 through 6-8) describing exactly what happens, in sequence
  • Each step must specify: who acts, what they say or do, how students respond
  • Include the EXACT English phrases the ALT says at key moments (use quotes)
  • Specify any gestures, facial expressions, or TPR movements
  • Include at least one full model → echo → pair repetition cycle for the target language
  • Vary the energy: start controlled, build excitement, end with clear closure
  • Every activity must directly and explicitly practice the target language — no tangents

ALT ROLE FIELD — a bullet list (4-6 bullets), each bullet being one of:
  • A scripted line: Say: "[exact phrase]" (students respond: "[expected response]")
  • A physical instruction: gesture to use, where to stand, what to hold up
  • A monitoring note: what to listen for, how to give quick corrective feedback
  • A pacing note: signal for transition or energy shift

JTE ROLE FIELD — NEVER leave vague or empty. Always write 3-5 specific bullets:
  • When and what to translate into Japanese (e.g. "Translate the game rules before Step 3")
  • Which students or rows to circulate to and what support to give
  • Classroom management tasks during the activity (distributing materials, moving desks)
  • How to signal the ALT if students are confused or need a pause

TIPS FIELD — 2-3 short, practical tips for this specific phase:
  • A common mistake this age group makes and how to pre-empt it
  • What to do if students finish early or fall behind
  • An energy or engagement trick specific to this grade

MODEL LANGUAGE FIELD — the single most important phrase students must produce in this phase
  (even if Warm-up — write the phrase being reviewed or previewed)

━━━ GAME QUALITY STANDARDS ━━━

Include 1-2 games in the games array (drawn from Practice or Produce):
  • howToPlay: write 7-10 numbered steps — setup, objective explanation, play sequence, win condition, reset
  • Each step specifies exact student language and teacher actions
  • languageTarget: the exact phrase students repeat during the game
  • tips: 2 practical tips (class size adjustment, what to do if it gets chaotic)
  • preparation: specific materials and any pre-class setup needed

━━━ OUTPUT FORMAT ━━━

Output ONLY valid JSON. No markdown, no commentary outside the JSON. Match this schema exactly:
{
  "title": "string",
  "target": "string",
  "lesson_vocabulary": ["string"],
  "grammar_points": "string",
  "smart_goal": "string",
  "cultural_note": "string",
  "uchiawase_points": ["string (specific coordination point, not generic)"],
  "assessment_criteria": ["string"],
  "materials": ["string"],
  "roles": { "management": "string", "discipline": "string", "assessment": "string" },
  "differentiation": { "support": "string (specific scaffold)", "challenge": "string (specific extension)" },
  "sections": [
    {
      "phase": "Warm-up",
      "time": "5",
      "activity": "string (activity name on first line, then numbered steps 1-7, 150+ words)",
      "altRole": "string (4-6 bullet points with scripted lines and cues)",
      "teacher2Role": "string (3-5 bullet points with specific JTE tasks)",
      "tips": ["string", "string"],
      "modelLanguage": "string (the key phrase for this phase)"
    },
    {
      "phase": "Present",
      "time": "10",
      "activity": "string (activity name on first line, then numbered steps 1-7, 150+ words)",
      "altRole": "string (4-6 bullet points with scripted lines and cues)",
      "teacher2Role": "string (3-5 bullet points with specific JTE tasks)",
      "tips": ["string", "string"],
      "modelLanguage": "string"
    },
    {
      "phase": "Practice",
      "time": "15",
      "activity": "string (activity name on first line, then numbered steps 1-8, 200+ words)",
      "altRole": "string (4-6 bullet points with scripted lines and cues)",
      "teacher2Role": "string (3-5 bullet points with specific JTE tasks)",
      "tips": ["string", "string"],
      "modelLanguage": "string"
    },
    {
      "phase": "Produce",
      "time": "10",
      "activity": "string (activity name on first line, then numbered steps 1-7, 150+ words)",
      "altRole": "string (4-6 bullet points with scripted lines and cues)",
      "teacher2Role": "string (3-5 bullet points with specific JTE tasks)",
      "tips": ["string", "string"],
      "modelLanguage": "string"
    },
    {
      "phase": "Wrap-up",
      "time": "5",
      "activity": "string (activity name on first line, then numbered steps 1-5, 100+ words)",
      "altRole": "string (3-4 bullet points)",
      "teacher2Role": "string (2-3 bullet points)",
      "tips": ["string"],
      "modelLanguage": "string"
    }
  ],
  "games": [
    {
      "name": "string",
      "duration": "string (e.g. '12 minutes')",
      "howToPlay": "string (7-10 numbered steps, each with exact student language and teacher action)",
      "preparation": "string (specific materials and pre-class setup)",
      "languageTarget": "string (exact phrase students repeat during the game)",
      "tips": ["string", "string"]
    }
  ]
}`;
}

// ── Main handler ─────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const body = await req.json()

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const { data: userData, error: userError } = await adminClient
      .from('users')
      .select('sparks')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.sparks < 1) {
      return new Response(JSON.stringify({ error: 'Insufficient Sparks' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY')
    if (!googleApiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Build the prompt — enriched (generatePlan flow) or raw (legacy flow)
    let prompt: string;
    if (body.generatePlan) {
      prompt = await buildLessonPrompt({
        textbook: body.textbook ?? '',
        unit: body.unit ?? '',
        grade: body.grade ?? 'Grade 5',
        level: body.level ?? 'Elementary',
        studentLevel: body.studentLevel ?? 3,
        classSize: body.classSize ?? 35,
        duration: body.duration ?? 45,
        teacher1Name: body.teacher1Name ?? 'ALT',
        teacher2Name: body.teacher2Name ?? 'JTE',
        customTarget: body.customTarget,
        customVocab: body.customVocab,
      });
    } else {
      prompt = body.prompt;
    }

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const model = body.model ?? 'gemini-2.0-flash-lite'
    let text: string
    try {
      const genAI = new GoogleGenerativeAI(googleApiKey)
      const aiModel = genAI.getGenerativeModel({ model })
      const result = await aiModel.generateContent(prompt)
      text = result.response.text()
    } catch (aiErr) {
      console.error('AI generation failed:', aiErr)
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: deducted, error: deductError } = await adminClient.rpc('deduct_sparks', {
      p_user_id: user.id,
      p_amount: 5
    })
    if (deductError || deducted !== true) {
      console.error('Post-generation deduction failed:', deductError)
    }

    return new Response(JSON.stringify({ content: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
