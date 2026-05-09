export interface PineconeTextbookRecord {
  id: string;
  text: string;
  content_type: 'textbook_unit';
  textbook: string;
  unit_number: number;
  unit_title: string;
  level: 'Elementary' | 'JuniorHigh';
  grade: string;
  grade_numeric: number; // Grade3=3, Grade4=4, Grade5=5, Grade6=6, JH1=7, JH2=8, JH3=9
  complexity: number;    // 1-5, matches UI studentLevel slider
  grammar_focus: string;
  skills: string[];
  interaction: string;
  topic_tags: string[];
}

export const TEXTBOOK_UNITS_KNOWLEDGE: PineconeTextbookRecord[] = [

  // ═══════════════════════════════════════════════════════════════
  // LET'S TRY! 1 — Grade 3 (MEXT Official)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "lets-try-1-unit-1",
    text: `Unit 1: Hello! — Let's Try! 1 (Grade 3 Elementary, MEXT official)

TARGET LANGUAGE: Simple greetings and self-introduction. "Hello! Hi! I'm [Name]. Nice to meet you!"

LESSON CONTEXT: This is the first English lesson for most Grade 3 students. The goal is positive first contact with English, not accuracy. Excitement and fun come first.

KEY EXPRESSIONS:
- Hello! / Hi! (informal)
- Good morning! / Good afternoon! / Good evening!
- I'm [Name]. (teach as a chunk — avoid explaining grammar)
- Nice to meet you! → Nice to meet you, too!
- Goodbye! / See you!

SAMPLE CLASSROOM INTERACTION:
ALT: Hello everyone! I'm [ALT name]. Nice to meet you!
Students: Nice to meet you!
ALT: (pointing to student) What's your name?
Student: I'm Riku.
ALT: Nice to meet you, Riku! (wave/bow)
(Repeat 4-5 times, then pair practice)

TEACHING TIPS: Use exaggerated gestures and facial expressions. Model the greeting with a big smile, a wave, and eye contact — students copy the energy. Do a "greeting tour" where students walk around greeting 5 friends, then return to seats. Name cards help hesitant students. Never break "Nice to meet you" into grammar parts — it's a fixed social phrase.

COMMON ERRORS: Students say "My name is..." from prior exposure — gently redirect to "I'm..." which sounds more natural. Students may freeze on "Nice to meet you" — let them just say "Nice to meet you" and build from there.

GRADE CONSTRAINTS (Grade 3): TPR and gestures only. Max 2-3 active vocabulary words. No writing. Choral repetition is fine. Individual production should feel like a game, not a test.

ACTIVITY IDEAS: Greeting tour with name cards, janken (rock-paper-scissors) greeting chain, ALT passport stamp game (greet the ALT properly to earn a stamp sticker).`,
    content_type: 'textbook_unit',
    textbook: "Let's Try! 1 (Grade 3)",
    unit_number: 1,
    unit_title: "Hello!",
    level: 'Elementary',
    grade: 'Grade 3',
    grade_numeric: 3,
    complexity: 1,
    grammar_focus: 'greetings_self_intro',
    skills: ['Speaking', 'Listening'],
    interaction: 'whole-class',
    topic_tags: ['greetings', 'self-introduction', 'names']
  },

  {
    id: "lets-try-1-unit-2",
    text: `Unit 2: How are you? — Let's Try! 1 (Grade 3 Elementary, MEXT official)

TARGET LANGUAGE: Asking and answering about feelings. "How are you? I'm (fine/happy/good/sleepy/hungry/tired/sad/great)."

KEY EXPRESSIONS:
- How are you?
- I'm fine. / I'm happy. / I'm good. / I'm sleepy. / I'm hungry. / I'm tired. / I'm sad. / I'm great.

VOCABULARY: fine, happy, good, sleepy, hungry, tired, sad, great

SAMPLE CLASSROOM INTERACTION:
ALT: (yawning exaggeratedly) How are you, Hana?
Student: I'm sleepy!
ALT: Me too! How about you, Kenji?
Student: I'm happy!
ALT: Wonderful! Why? (no answer expected — just praise the feeling)

TEACHING TIPS: Teach each feeling word with a corresponding gesture or facial expression. Make it physical — students stand up, choose a feeling, and do the gesture. The "feelings weather chart" works well: post 8 pictures on board, students point to how they feel at the start of class. Avoid explaining the verb "am" — just model "I'm ___" as a chunk. The question "How are you?" should become a daily routine question by the ALT.

COMMON ERRORS: Students may say just the adjective without "I'm" — model the full phrase every time. Students confuse "hungry" (おなかがすいた) and "angry" (おこっている) — use clear gestures and pictures.

ACTIVITY IDEAS: Feelings janken (loser does the winner's feeling gesture), feelings bingo (3x3 grid with feeling faces), walk-and-greet with feelings ("Hello! How are you? I'm happy!").`,
    content_type: 'textbook_unit',
    textbook: "Let's Try! 1 (Grade 3)",
    unit_number: 2,
    unit_title: "How are you?",
    level: 'Elementary',
    grade: 'Grade 3',
    grade_numeric: 3,
    complexity: 1,
    grammar_focus: 'feelings_states',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['feelings', 'emotions', 'daily-routine']
  },

  {
    id: "lets-try-1-unit-3",
    text: `Unit 3: How many? — Let's Try! 1 (Grade 3 Elementary, MEXT official)

TARGET LANGUAGE: Numbers 1-20. "How many (apples)? One, two, three... (count up to 20)."

KEY EXPRESSIONS:
- How many [item]?
- One, two, three... twenty.
- Numbers 1-20 in sequence and random order.

VOCABULARY: one through twenty, plus: ruler, eraser (objects to count)

SAMPLE CLASSROOM INTERACTION:
ALT: (holds up fingers) How many?
Students: Five!
ALT: (holds up flashcard with 13 apples) How many apples?
Students: Thirteen!
ALT: Let's count together. One, two, three...

TEACHING TIPS: Teach numbers through physical counting — fingers, objects, body parts. Chant numbers with rhythm and clapping. Use "Number Bingo" (students write any 9 numbers from 1-20 in a 3x3 grid) for the practice phase. The ALT holding up random fingers and asking "How many?" is excellent for spontaneous listening practice. Numbers 11-20 are harder — spend extra time on thirteen/fourteen/fifteen which are often confused.

COMMON ERRORS: "Fourteen" and "forty" sound similar — not an issue yet but good to teach clean pronunciation from the start. Students may count in Japanese under their breath — that's fine, just redirect to English output.

ACTIVITY IDEAS: Number bingo (3x3), finger counting quiz, "Stand if you have [number] siblings" (personalised listening), number Karuta.`,
    content_type: 'textbook_unit',
    textbook: "Let's Try! 1 (Grade 3)",
    unit_number: 3,
    unit_title: "How many?",
    level: 'Elementary',
    grade: 'Grade 3',
    grade_numeric: 3,
    complexity: 1,
    grammar_focus: 'numbers_1_to_20',
    skills: ['Speaking', 'Listening'],
    interaction: 'whole-class',
    topic_tags: ['numbers', 'counting', 'math']
  },

  {
    id: "lets-try-1-unit-4",
    text: `Unit 4: I like blue. — Let's Try! 1 (Grade 3 Elementary, MEXT official)

TARGET LANGUAGE: Expressing colour preferences. "Do you like (blue)? Yes, I do. / No, I don't. I like (red)."

KEY EXPRESSIONS:
- I like [colour].
- Do you like [colour]?
- Yes, I do. / No, I don't.

VOCABULARY: red, blue, green, yellow, pink, orange, purple, black, white, rainbow

SAMPLE CLASSROOM INTERACTION:
ALT: I like blue! (points to something blue) Do you like blue, Yui?
Student: Yes, I do!
ALT: Great! Do you like pink?
Student: No, I don't. I like yellow.
ALT: Oh, yellow! Nice!

TEACHING TIPS: Bring colour swatches or coloured flashcards. Students can hold up their pencil cases or bags to show their favourite colour. The "colour poll" works great — ALT asks, students raise hands, count together. Avoid spending time on grammar explanation — just model and drill "Yes, I do / No, I don't" as fixed responses.

COMMON ERRORS: Students say "I like it blue" — model "I like blue" without "it". Students may use Japanese colour words — praise the attempt and model the English.

ACTIVITY IDEAS: Colour bingo, "Raise your hand if you like..." whole-class poll, colour Karuta, colour janken (choose a colour, play janken, winner declares their colour).`,
    content_type: 'textbook_unit',
    textbook: "Let's Try! 1 (Grade 3)",
    unit_number: 4,
    unit_title: "I like blue.",
    level: 'Elementary',
    grade: 'Grade 3',
    grade_numeric: 3,
    complexity: 1,
    grammar_focus: 'preferences_colours',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['colours', 'preferences', 'likes']
  },

  {
    id: "lets-try-1-unit-5",
    text: `Unit 5: What do you like? — Let's Try! 1 (Grade 3 Elementary, MEXT official)

TARGET LANGUAGE: Asking and answering about general preferences. "What do you like? I like (blue/soccer)."

KEY EXPRESSIONS:
- What do you like?
- I like [item/sport/food/colour].

VOCABULARY EXPANSION: peach, melon, banana (fruits), soccer, baseball (sports) — plus review of colours from Unit 4.

SAMPLE CLASSROOM INTERACTION:
ALT: What do you like, Sota?
Student: I like soccer!
ALT: Wow, me too! What do you like, Mia?
Student: I like peach.
ALT: Peach! Delicious! (rubs stomach) What do you like?
(Students pair up and ask each other)

TEACHING TIPS: This unit extends Unit 4's "I like" to open topics. Students now generate their own answers rather than responding to yes/no. Bring realia or picture cards for fruits and sports. A "Find Someone Who" style mingling activity works perfectly here — students ask friends "What do you like?" and report back. Keep the question "What do you like?" as a natural daily conversation opener.

ACTIVITY IDEAS: Find Someone Who (walk around, ask "What do you like?", find someone who likes the same thing), class survey graph (make a tally chart on the board), "What does [student] like?" guessing game.`,
    content_type: 'textbook_unit',
    textbook: "Let's Try! 1 (Grade 3)",
    unit_number: 5,
    unit_title: "What do you like?",
    level: 'Elementary',
    grade: 'Grade 3',
    grade_numeric: 3,
    complexity: 1,
    grammar_focus: 'preferences_open',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['preferences', 'food', 'sports', 'likes']
  },

  // ═══════════════════════════════════════════════════════════════
  // WE CAN! 1 — Grade 5 (MEXT Official)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "we-can-1-unit-1",
    text: `Unit 1: Hello, everyone. — We Can! 1 (Grade 5 Elementary, MEXT official)

TARGET LANGUAGE: Extended self-introduction. Name, nickname, birthday, likes, dislikes. "Call me [nickname]. My birthday is [month + date]. I like [X]. I don't like [Y]."

KEY EXPRESSIONS:
- Call me [nickname].
- My birthday is [month] [date].
- I like [item]. / I don't like [item].
- Spell your name: A-Y-A.

VOCABULARY: months (January through December), ordinal numbers (1st through 31st), alphabet for spelling

SAMPLE CLASSROOM INTERACTION:
ALT: Hello! I'm [ALT name]. Call me [nickname]! My birthday is March 15th. I like sushi. I don't like natto. What about you?
Student: I'm Ayaka. Call me Aya! My birthday is June 3rd.
ALT: Great! What do you like?
Student: I like animals.
(Students introduce themselves to 3 friends using a self-intro card)

TEACHING TIPS: Students make a personal profile card to use as a prompt. Teach months as a chant with gestures. For dates, teach the -th ending as a chunk (not by explaining ordinal numbers). The "three things in common" challenge (find a friend with the same birthday month, or same like) drives natural communication. Grade 5 students can handle 3+ turn exchanges — push for follow-up questions.

COMMON ERRORS: Students say "My name is [nickname]" instead of "Call me [nickname]" — important cultural distinction. Students mix up month names (June/July, January/June). "I don't like" is often shortened to "I no like" — model the full contraction.

ACTIVITY IDEAS: Self-introduction tour (meet 5 friends, sign each other's profile cards), birthday month line-up (students arrange themselves by birth month without showing cards — speaking only), "Two truths and a lie" with likes/dislikes.`,
    content_type: 'textbook_unit',
    textbook: "We Can! 1 (Grade 5)",
    unit_number: 1,
    unit_title: "Hello, everyone.",
    level: 'Elementary',
    grade: 'Grade 5',
    grade_numeric: 5,
    complexity: 2,
    grammar_focus: 'self_introduction_extended',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['self-introduction', 'birthday', 'likes', 'dislikes', 'names']
  },

  {
    id: "we-can-1-unit-4",
    text: `Unit 4: He can bake bread. — We Can! 1 (Grade 5 Elementary, MEXT official)

TARGET LANGUAGE: Describing abilities in third person. "He/She can (cook/swim/play the piano). Can you (swim)? Yes, I can. / No, I can't."

KEY EXPRESSIONS:
- He/She can [verb].
- He/She can't [verb].
- Can you [verb]?
- Yes, I can. / No, I can't.

VOCABULARY: swim, run, jump, cook, bake (bread), sing, dance, play the piano, play the guitar, draw, speak English, ride a bike

GRAMMAR NOTE: "Can" does NOT change for he/she — this is a key grammar point. "He can swim" NOT "He cans swim." No -s needed. This is often surprising to students who have learned third-person -s.

SAMPLE CLASSROOM INTERACTION:
ALT: My friend Sarah can bake bread. She can't swim. Can you bake bread?
Student: No, I can't. But I can cook!
ALT: Wow! Can [student's name] cook? (to class)
Class: Yes, she can!
(Practice: "Can [classmate] [verb]?" quiz game)

TEACHING TIPS: Start with a personal survey — ALT and JTE reveal their own abilities and inabilities. Students are naturally curious about what their teachers can/can't do. For the production task, students interview friends and report to the class ("Kenji can play the guitar. He can't swim."). Emphasise that third-person "can" has NO -s — contrast explicitly with Unit 5's third-person -s.

COMMON ERRORS: "He cans swim" (adding -s to can), "He can swims" (adding -s to the main verb). Students often skip the third-person altogether and just say "Can swim." Push for the full subject + can + verb structure.

ACTIVITY IDEAS: Ability bingo (3x3 grid: "Can you swim?"), "Find someone who can..." mingling (sign the grid), class ability profile (make a poster of what the class can/can't do collectively).`,
    content_type: 'textbook_unit',
    textbook: "We Can! 1 (Grade 5)",
    unit_number: 4,
    unit_title: "He can bake bread.",
    level: 'Elementary',
    grade: 'Grade 5',
    grade_numeric: 5,
    complexity: 2,
    grammar_focus: 'can_abilities_third_person',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['abilities', 'can', 'third-person', 'sports', 'hobbies']
  },

  // ═══════════════════════════════════════════════════════════════
  // NEW HORIZON 1 — JH 1st Year (most widely used JH textbook)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "new-horizon-1-unit-1",
    text: `Unit 1: New School, New Friends — New Horizon 1 (JH 1st Year)

TARGET LANGUAGE: Be-verbs (am/are/is) and basic preferences. "I am [Name]. I am from [place]. I like [X]. Do you like [X]? Yes, I do. / No, I don't."

GRAMMAR: Formalizing the be-verb. Students know "I'm" from elementary — this unit introduces the full form and teaches am/are/is as separate forms with different subjects.
- I am → I'm (same meaning, formal vs. contracted)
- You are → Are you? (yes/no question inversion)
- He/She is

KEY EXPRESSIONS:
- I am [Name]. I'm from [place].
- I like [X]. Do you like [X]?
- Yes, I do. / No, I don't.

SAMPLE CLASSROOM INTERACTION:
ALT: I am [Name]. I am from [country]. I like [hobby]. Do you like [hobby]?
Student: Yes, I do! / No, I don't. I like [other hobby].
(Students introduce themselves to 3 new classmates using target sentences)

TEACHING TIPS: The transition to junior high means students see English grammar explicitly for the first time. Keep the grammar introduction light — focus on the communicative use. Emphasise the difference between speaking style (I'm, don't) and writing style (I am, do not). The "New Friends" context is natural — students genuinely ARE meeting new classmates from different elementary schools.

COMMON ERRORS: Students write "I'm" in formal writing tasks — teach the context difference. Students overuse "I am" in speaking instead of the natural contraction.

ACTIVITY IDEAS: New friends interview (ask 3 new classmates about their likes/hobbies), likes/dislikes poll on the board, "Two truths and a lie" introductions.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon 1",
    unit_number: 1,
    unit_title: "New School, New Friends",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'be_verbs_basics',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['self-introduction', 'likes', 'school', 'be-verbs']
  },

  {
    id: "new-horizon-1-unit-5",
    text: `Unit 5: A Day in Our Lives — New Horizon 1 (JH 1st Year)

TARGET LANGUAGE: Third person singular present tense. "He/She [verb]s. He plays baseball. She likes music. What does [Name] do after school?"

GRAMMAR: Add -s/-es to verbs in the third-person singular (he/she/it). This is a major grammar point — students know "I like / I play" from elementary but now must switch to "he likes / she plays."

INFLECTION RULES:
- Most verbs: add -s → plays, likes, runs, reads
- Verbs ending in -ch/-sh/-x/-o: add -es → watches, goes, does
- Verbs ending in consonant+y: change y→i, add -es → studies, tries
- Irregular: has (not haves)

QUESTION FORM: "Does he/she [base verb]?" → "Yes, he/she does. / No, he/she doesn't."
— CRITICAL: Use DOES in questions, NOT "Is he plays?" Students from elementary confuse this.

SAMPLE CLASSROOM INTERACTION:
JTE: What does Kenji do after school?
ALT: He plays basketball. He goes to the gym.
JTE: Does he like basketball?
ALT: Yes, he does! He practices every day.
(Students survey each other → report to class: "Yuki studies math after school. She doesn't watch TV.")

TEACHING TIPS: Use a real class schedule or student survey as the content source — students report on real classmates. Make a class chart on the board: "What does [student] do after school?" and fill it in together. The contrast between "I play" (no -s) and "he plays" (-s) must be drilled explicitly. Spot-the-error games work well for the production phase.

COMMON ERRORS: "He play soccer" (missing -s), "Does he plays?" (adding -s to base verb after does), "He do" instead of "he does", "She studys" instead of "she studies".

ACTIVITY IDEAS: Class schedule survey → report back, "Guess who?" (describe a classmate's routine, class guesses who it is), sentence error correction race, information gap (A has Kenji's morning schedule, B has Yuki's — ask and fill in each other's).`,
    content_type: 'textbook_unit',
    textbook: "New Horizon 1",
    unit_number: 5,
    unit_title: "A Day in Our Lives",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'third_person_singular',
    skills: ['Speaking', 'Writing'],
    interaction: 'pair',
    topic_tags: ['daily-routine', 'sports', 'hobbies', 'third-person']
  },

  {
    id: "new-horizon-1-unit-7",
    text: `Unit 7: Foreign Artists — New Horizon 1 (JH 1st Year)

TARGET LANGUAGE: Past tense (regular and irregular verbs). "I went to Tokyo. I ate sushi. I saw a concert. Did you [verb]? Yes, I did. / No, I didn't."

GRAMMAR: Simple past tense — the biggest grammar leap in JH 1st year.
- Regular: add -ed → visited, watched, listened, played, talked
- Irregular (must memorise): go→went, eat→ate, see→saw, have→had, get→got, buy→bought, make→made, take→took
- Negative: did not (didn't) + base verb → "I didn't go"
- Question: Did + subject + base verb? → "Did you go?" NOT "Did you went?"

SAMPLE CLASSROOM INTERACTION:
ALT: Last weekend, I went to Osaka. I ate takoyaki. I saw a street performer. It was amazing!
JTE: Did you enjoy it?
ALT: Yes, I did! (to student) Did you go anywhere last weekend?
Student: I went to my grandmother's house.
ALT: Oh! Did you eat anything special?
Student: Yes, I ate soba!

TEACHING TIPS: Weekend diary is the classic production activity — students write 3 sentences about their real weekend, then share. Irregular verbs need to be memorised as pairs (go/went, eat/ate, see/saw) — teach as a chant with rhythm. Flashcard drilling of irregular pairs before communicative activities. The ALT's own genuine weekend story makes a great Present phase — students genuinely want to know what the ALT did.

COMMON ERRORS: "Did you went?" (using past after did), "I didn't went" (using past after didn't), "I goed" or "I eated" (regularising irregular verbs).

ACTIVITY IDEAS: Weekend diary share, "Alibi game" (two students leave the room, create an alibi for a fictional crime, class questions them separately — great for Did you...? practice), irregular verb memory matching cards.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon 1",
    unit_number: 7,
    unit_title: "Foreign Artists",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 3,
    grammar_focus: 'past_tense',
    skills: ['Speaking', 'Writing'],
    interaction: 'pair',
    topic_tags: ['past-tense', 'weekend', 'travel', 'experiences']
  },

  {
    id: "new-horizon-2-unit-3",
    text: `Unit 3: My Future Job — New Horizon 2 (JH 2nd Year)

TARGET LANGUAGE: Infinitives (to + verb) used as noun, adjective, and adverb. "I want to be a nurse. It is important to study hard. I have a dream to travel the world."

GRAMMAR: The infinitive (to + base verb) has three uses:
1. Noun use: "I want to cook." / "I decided to study abroad." (subject or object)
2. Adjective use: "I have a dream to be a pilot." (modifies noun)
3. Adverb use: "I study hard to pass the exam." (modifies verb — purpose)

KEY EXPRESSIONS:
- I want to be a [job].
- I want to [verb].
- It is [adjective] to [verb].
- I have a dream to [verb].

SAMPLE DIALOGUE:
JTE: What do you want to be?
Student: I want to be a veterinarian.
ALT: Why?
Student: I love animals. I want to help them.
ALT: That's a great dream! What do you need to do?
Student: I need to study biology hard.

TEACHING TIPS: "My Future Job" is highly motivating for 2nd year students who are beginning to think about their futures. Start by having ALT and JTE share their own paths — why they chose their jobs. Students research one job in English and present: "I want to be a [job]. [Job] helps people by [verb-ing]. I need to [infinitive] to become a [job]." Avoid heavy grammar analysis — let the communicative goal drive the lesson.

COMMON ERRORS: "I want be a doctor" (missing to), "I want to being" (gerund after want), using the Japanese word for the job directly (just model the English equivalent).

ACTIVITY IDEAS: Future job presentation (1 minute each), "Life path" interview (ask partner about their dream job and why), career fair roleplay (students "apply" for a dream job explaining their skills).`,
    content_type: 'textbook_unit',
    textbook: "New Horizon 2",
    unit_number: 3,
    unit_title: "My Future Job",
    level: 'JuniorHigh',
    grade: '2nd Year',
    grade_numeric: 8,
    complexity: 3,
    grammar_focus: 'infinitives',
    skills: ['Speaking', 'Writing'],
    interaction: 'pair',
    topic_tags: ['future', 'jobs', 'careers', 'dreams', 'infinitive']
  },

  {
    id: "new-horizon-3-unit-1",
    text: `Unit 1: Sports for Everyone — New Horizon 3 (JH 3rd Year)

TARGET LANGUAGE: Present perfect tense. "Have you ever [past participle]? Yes, I have. / No, I haven't. I have [pp] [number] times. I have never [pp]."

GRAMMAR: Present perfect = have/has + past participle. Expresses:
1. Experience (ever/never): "Have you ever eaten natto?"
2. Completion (just/already/yet): "I have just finished my homework."
3. Continuity (for/since): "I have lived in Japan for 15 years."

This unit focuses on EXPERIENCE (ever/never).

KEY IRREGULAR PAST PARTICIPLES: eaten, seen, gone (vs. been), done, had, made, met, read, spoken, tried, won, written

SAMPLE DIALOGUE:
ALT: Have you ever tried yoga?
Student: No, I haven't. Have you?
ALT: Yes, I have! I tried it twice. Have you ever played a sport abroad?
Student: No, I never have. But I have watched the Olympics on TV.

TEACHING TIPS: 3rd year students are preparing for high school entrance exams where present perfect is tested. Balance communicative fluency with accuracy. A "bucket list" activity works perfectly: students write 5 things they have done and 5 things they have never done. "Find someone who has..." bingo is great for speaking practice. The distinction between "gone" (away and not returned) and "been" (visited) often surprises students.

COMMON ERRORS: "Have you ever ate?" (using past tense instead of past participle), "I have went" (same error), "Did you ever eat?" (using past simple for experience), using simple past when present perfect is needed for life experience questions.

ACTIVITY IDEAS: Experience bingo ("Find someone who has eaten durian"), "Before I graduate" bucket list share, class survey "How many people have...?", interview pairs and report.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon 3",
    unit_number: 1,
    unit_title: "Sports for Everyone",
    level: 'JuniorHigh',
    grade: '3rd Year',
    grade_numeric: 9,
    complexity: 4,
    grammar_focus: 'present_perfect_experience',
    skills: ['Speaking', 'Reading', 'Writing'],
    interaction: 'pair',
    topic_tags: ['present-perfect', 'experience', 'sports', 'travel', 'ever-never']
  },

  // ═══════════════════════════════════════════════════════════════
  // WE CAN! 2 — Grade 6 (MEXT Official)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "we-can-2-unit-4",
    text: `Unit 4: Summer Vacations — We Can! 2 (Grade 6 Elementary, MEXT official)

TARGET LANGUAGE: Simple past tense for narrating personal experiences. "I went to [place]. I ate [food]. I saw [thing]. It was (fun/exciting/delicious/beautiful)."

GRAMMAR: Simple past — introduced naturally without explicit grammar teaching at this level. Students learn "went/ate/saw/did" as chunks. Avoid grammar explanation; focus on pattern recognition.

KEY VOCABULARY: went (go), ate (eat), saw (see), did (do), enjoyed (enjoy), played (play), stayed (stay), visited (visit)
Adjectives: fun, exciting, delicious, beautiful, amazing, cool, great

SAMPLE CLASSROOM INTERACTION:
ALT: This summer, I went to Kyoto. I ate ramen. It was delicious! I saw Fushimi Inari. It was beautiful! What about you?
Student: I went to the sea.
ALT: Wow! What did you eat?
Student: I ate watermelon!
ALT: It was delicious?
Student: Yes! It was great!

TEACHING TIPS: Summer vacation is universally relatable. Use a personal photo or illustration of the ALT's summer. Students write 3-5 sentences on a "Summer Vacation Card" to use as a prompt in the speaking task. The card prevents "I don't know" shutdowns. Praise genuine sharing — the goal is brave communication, not perfect grammar.

COMMON ERRORS: "I go to" instead of "I went to" (reverting to present), "I buyed" instead of "I bought", "It were" instead of "It was." At Grade 6, just model the correct form — don't explain the rule yet.

ACTIVITY IDEAS: Summer vacation photo share (real photos on phone or drawn), "Best summer memory" class vote, vacation card mingling (students share with 3 friends and compare), "True or false?" — teacher says 3 things they did, one is a lie.`,
    content_type: 'textbook_unit',
    textbook: "We Can! 2 (Grade 6)",
    unit_number: 4,
    unit_title: "Summer Vacations",
    level: 'Elementary',
    grade: 'Grade 6',
    grade_numeric: 6,
    complexity: 2,
    grammar_focus: 'past_tense_narration',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['past-tense', 'vacation', 'travel', 'food', 'experiences']
  },

  // ═══════════════════════════════════════════════════════════════
  // STUB RECORDS — to be enriched by EXA/Firecrawl in Task 3
  // These contain accurate base data from constants.ts
  // ═══════════════════════════════════════════════════════════════

  {
    id: "lets-try-2-unit-1",
    text: `Unit 1: Hello, world! — Let's Try! 2 (Grade 4 Elementary, MEXT official)

TARGET LANGUAGE: Extended greetings from around the world. "Hello. I am [Name]. I like [origami/soccer]." Learning that different countries have different greetings.

KEY EXPRESSIONS: Hello, I am, I like. Greetings from: Japan (konnichiwa), USA, Korea (annyeong), Brazil (oi), Australia (g'day).

VOCABULARY: Japan, USA, Korea, Brazil, Australia, origami, soccer, hello

TEACHING TIPS: Introduce the concept that English is spoken differently around the world. Use a world map. Students can show a greeting from a country they like. Keep sentences short — Grade 4 students are still building confidence. "I am [Name]. I like [X]." is the core pattern.

ACTIVITY IDEAS: World greeting tour (practice different country greetings), "Where are you from?" roleplay with country cards, map pointing while chanting country names.`,
    content_type: 'textbook_unit',
    textbook: "Let's Try! 2 (Grade 4)",
    unit_number: 1,
    unit_title: "Hello, world!",
    level: 'Elementary',
    grade: 'Grade 4',
    grade_numeric: 4,
    complexity: 1,
    grammar_focus: 'greetings_self_intro_extended',
    skills: ['Speaking', 'Listening'],
    interaction: 'whole-class',
    topic_tags: ['greetings', 'world', 'countries', 'self-introduction']
  },

  {
    id: "lets-try-2-unit-5",
    text: `Unit 5: Do you have a pen? — Let's Try! 2 (Grade 4 Elementary, MEXT official)

TARGET LANGUAGE: Asking about possessions. "Do you have a (pen)? Yes, I do. / No, I don't."

KEY EXPRESSIONS: Do you have a [item]? Yes, I do. / No, I don't.

VOCABULARY: pen, eraser, ruler, pencil case, glue, scissors, notebook — school stationery items

TEACHING TIPS: Grade 4 students already know "Do you like...?" from Grade 3. This unit applies the same yes/no question pattern to a new context (having vs. liking). Use real stationery items from students' pencil cases. A "shopping" roleplay where students ask "Do you have a [item]?" to complete a collection works well.

ACTIVITY IDEAS: Stationery bingo, shopping roleplay (ask friends for stationery to complete a set), "What's in my bag?" guessing game.`,
    content_type: 'textbook_unit',
    textbook: "Let's Try! 2 (Grade 4)",
    unit_number: 5,
    unit_title: "Do you have a pen?",
    level: 'Elementary',
    grade: 'Grade 4',
    grade_numeric: 4,
    complexity: 1,
    grammar_focus: 'yes_no_questions_possessions',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['stationery', 'school', 'possessions', 'questions']
  },

  {
    id: "new-horizon-1-unit-0",
    text: `Unit 0: Introduction — New Horizon 1 (JH 1st Year — first unit, review of elementary)

TARGET LANGUAGE: Rapid review of all elementary English. Can, like, want to, simple past, greetings. "Hello! I'm [Name]. I like [X]. I can [verb]. I went to [place] last summer."

PURPOSE: This unit bridges elementary and junior high English. Students may feel confident (they know this) or nervous (junior high feels different). Goal: positive momentum and reassurance that their elementary English is valuable.

TEACHING TIPS: Do NOT re-teach elementary content as if students don't know it. Frame it as "You already know this!" Make it fast, fun, and affirming. Rapid-fire Q&A, quick games from elementary (Karuta, bingo) with the familiar content. Spot the gaps — students who struggle here need extra support in Unit 1. ALT should share something personal about themselves using all five structures.

ACTIVITY IDEAS: Speed round Q&A (can you...? do you like...?), elementary bingo review, "Everything about me" self-intro card using all structures.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon 1",
    unit_number: 0,
    unit_title: "Unit 0: Introduction",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 1,
    grammar_focus: 'elementary_review',
    skills: ['Speaking', 'Listening'],
    interaction: 'whole-class',
    topic_tags: ['review', 'can', 'like', 'past-tense', 'bridge']
  },

  {
    id: "new-horizon-2-unit-7",
    text: `Unit 7: Movie Review — New Horizon 2 (JH 2nd Year)

TARGET LANGUAGE: Passive voice. "This movie was made in 2020. English is spoken in many countries. The book was written by [author]."

GRAMMAR: Passive voice = be + past participle. The subject RECEIVES the action rather than doing it.
- Active: "People speak English in Australia."
- Passive: "English is spoken in Australia."
- Past passive: "The castle was built in 1600."
- How to form: Subject + am/is/are/was/were + past participle + (by + agent, optional)

KEY EXPRESSIONS:
- [Film/book] was made/written/directed by [person].
- [Language] is spoken in [country].
- [Building/thing] was built in [year].

TEACHING TIPS: Movie reviews are a highly engaging context for passive voice. Show a real movie poster and model: "This movie was made in [year]. It was directed by [director]. The main character is played by [actor]." Students pick a real or fictional movie and write a mini review using passive constructions. This unit works well with a grammar chart comparing active/passive pairs.

COMMON ERRORS: "Was build" instead of "was built" (using base form instead of past participle), "Is spoke" instead of "is spoken", forgetting the be-verb entirely ("English spoken in...").

ACTIVITY IDEAS: Movie poster presentation (describe a movie using passive), "What was it made of?" quiz game, active→passive transformation race (teams compete to rewrite sentences).`,
    content_type: 'textbook_unit',
    textbook: "New Horizon 2",
    unit_number: 7,
    unit_title: "Movie Review",
    level: 'JuniorHigh',
    grade: '2nd Year',
    grade_numeric: 8,
    complexity: 3,
    grammar_focus: 'passive_voice',
    skills: ['Reading', 'Writing', 'Speaking'],
    interaction: 'pair',
    topic_tags: ['passive', 'movies', 'media', 'culture']
  },

  {
    id: "sunshine-1-unit-7",
    text: `Unit 7: Sunday Morning — Sunshine 1 (JH 1st Year)

TARGET LANGUAGE: Present progressive (continuous). "He is playing soccer. She is cooking lunch. What are you doing? I am studying."

GRAMMAR: Present progressive = am/is/are + verb-ing. Describes actions happening RIGHT NOW.
- I am reading. / You are listening. / He is watching TV.
- Negative: I am not (I'm not) sleeping.
- Question: Are you listening? → Yes, I am. / No, I'm not.
- Spelling: run→running (double consonant), make→making (drop e), study→studying

SAMPLE DIALOGUE:
ALT: (pretends to cook) What am I doing?
Students: You are cooking!
ALT: Right! (to student) What are you doing right now?
Student: I am listening to English class!
ALT: (laughs) Good! (calls student's phone — pretend) Ring ring! What are you doing?
Student: I am studying!

TEACHING TIPS: Make it physical — ALT mimes actions, students guess "You are dancing!" Bring in pictures of people doing different activities. The "phone call" roleplay is classic and natural: "Hi! What are you doing? Oh, I'm watching TV. What about you?" Students practice in pairs with the phone mime.

COMMON ERRORS: "He is play soccer" (missing -ing), "I playing" (missing am), "He running" (missing is). The spelling changes (run→running, make→making) cause consistent errors in writing tasks.

ACTIVITY IDEAS: Action mime game (guess what classmate is doing), phone call roleplay pairs, "What is [classmate] doing?" photo description.`,
    content_type: 'textbook_unit',
    textbook: "Sunshine 1",
    unit_number: 7,
    unit_title: "Sunday Morning",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'present_progressive',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['present-continuous', 'actions', 'daily-life', 'phone']
  },

  // ═══════════════════════════════════════════════════════════════
  // NEW HORIZON 1 — Additional Units (JH 1st Year)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "new-horizon-1-unit-2",
    text: `Unit 2: Our New Teacher — New Horizon 1 (JH 1st Year)

TARGET LANGUAGE: Describing people using be-verbs with adjectives. "She is kind. He is tall. They are funny. Is she a teacher? Yes, she is. / No, she isn't."

GRAMMAR: Be-verb with adjectives and nouns. Distinguishing between "He is a teacher" (noun complement) and "He is kind" (adjective complement). Yes/No questions with be-verb: inversion of subject and verb.

KEY EXPRESSIONS:
- She is [adjective]. / He is a [noun].
- Is she [adjective]? Yes, she is. / No, she isn't.
- Are they [adjective]? Yes, they are. / No, they aren't.
- He is from [place].

SAMPLE CLASSROOM INTERACTION:
ALT: (pointing to picture) This is Ms. Yamada. She is our new teacher. She is kind and funny. Is she from Tokyo?
Students: (look at card) Yes, she is!
ALT: Is she young?
Student: I think she is young.
JTE: Is the ALT tall?
Students: Yes, he/she is! Very tall!

TEACHING TIPS: Use the real ALT and JTE as the subject — students love making sentences about their actual teachers. Have students describe classmates using adjectives (be careful about sensitive ones — stick to positive or neutral adjectives only: tall, short, funny, kind, cool, smart). The grammar contrast "She IS a teacher" vs. "She IS tall" should be noted but not over-analyzed at this stage.

COMMON ERRORS: "She is a kind" (adding "a" before adjective — very common), "Is she kind?" → "Yes, she kind" (dropping the be-verb from the answer), "He are tall" (wrong agreement).

ACTIVITY IDEAS: "Who am I?" guessing game (describe a famous person using be+adjective, students guess), class survey on adjectives for teachers, describe your ideal friend using be-verbs.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon 1",
    unit_number: 2,
    unit_title: "Our New Teacher",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'be_verbs_adjectives',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['descriptions', 'be-verbs', 'adjectives', 'people', 'school']
  },

  {
    id: "new-horizon-1-unit-3",
    text: `Unit 3: Club Activities — New Horizon 1 (JH 1st Year)

TARGET LANGUAGE: Expressing likes, dislikes, and abilities. "I like basketball. I play basketball. Do you play soccer? Yes, I do. / No, I don't. Can you swim? Yes, I can. / No, I can't."

GRAMMAR: Review and contrast of Do/Does questions (do you play?) and Can questions (can you swim?). Students may confuse the two — this unit clarifies the different meaning: do = habit/fact, can = ability.

KEY EXPRESSIONS:
- I play [sport/instrument] in the [club] club.
- Do you play [X]? Yes, I do. / No, I don't.
- Can you [verb]? Yes, I can. / No, I can't.
- I like [X] but I can't [Y].

SAMPLE CLASSROOM INTERACTION:
ALT: I'm in the basketball club! I play basketball every day. Do you play sports?
Student: Yes, I play volleyball!
ALT: Great! Can you serve well?
Student: Yes, I can! Well, a little…
JTE: I play the piano. But I can't play the guitar. Can you play an instrument?

TEACHING TIPS: Japanese students are in club activities (bukatsu) and identify strongly with their clubs. This is a high-engagement topic. Use club activity vocabulary and let students talk about their real club. Clarify the do/can distinction with examples: "Do you play tennis? = Is tennis your habit?" vs. "Can you play tennis? = Do you have the ability?" Practice both question forms rapidly.

COMMON ERRORS: "Can you play basketball?" vs. "Do you play basketball?" — students mix these up. "I can baseball" (missing the verb "play"). "I join the soccer club" sounds unnatural — "I'm in the soccer club" or "I play soccer" is better.

ACTIVITY IDEAS: Club activities survey worksheet (Do you/Can you grid), club fair roleplay (students present their club to recruit new members), sports ability bingo.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon 1",
    unit_number: 3,
    unit_title: "Club Activities",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'do_can_contrast',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['clubs', 'sports', 'abilities', 'school-life', 'can', 'do']
  },

  {
    id: "new-horizon-1-unit-4",
    text: `Unit 4: Let's Cook! — New Horizon 1 (JH 1st Year)

TARGET LANGUAGE: Imperative sentences and instructions. "Cut the vegetables. Add some salt. Don't forget to stir." Also: quantities and measurements. "How much sugar do you need? Two cups."

GRAMMAR: Imperative mood — use the base verb without a subject. Positive ("Add the eggs") and negative ("Don't burn it!"). Also introduces some question words: How much? How many? (countable vs. uncountable nouns).

KEY EXPRESSIONS:
- [Verb] the [ingredient]. / Don't [verb] the [ingredient].
- How much [uncountable] do you need?
- How many [countable] do you need?
- First / Next / Then / Finally (sequencing words)

SAMPLE CLASSROOM INTERACTION:
ALT: Let's make a fruit salad! First, cut the apple. (mimes cutting) Next, add the banana.
Students: How many bananas?
ALT: Two bananas! Then, mix everything. Don't add salt — it's a fruit salad!
(Students write a simple recipe using imperatives)

TEACHING TIPS: Recipes and cooking instructions are a natural and motivating context for imperatives. Bring in realia (ingredients, bowls) or use food flashcards. The sequencing words (First, Next, Then, Finally) add sophistication to students' language without being grammatically difficult. How much/How many is a key countable/uncountable distinction — use lots of visual examples.

COMMON ERRORS: "Please cut the apple" (polite imperative is fine but not required), "Cuts the apple" (adding -s to imperative), mixing up how much/how many.

ACTIVITY IDEAS: Recipe writing task (write instructions for a simple dish), "What am I making?" cooking guessing game, order the recipe steps worksheet.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon 1",
    unit_number: 4,
    unit_title: "Let's Cook!",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'imperatives_instructions',
    skills: ['Speaking', 'Writing'],
    interaction: 'pair',
    topic_tags: ['cooking', 'food', 'imperatives', 'instructions', 'sequencing']
  },

  {
    id: "new-horizon-1-unit-6",
    text: `Unit 6: Enjoy the Summer! — New Horizon 1 (JH 1st Year)

TARGET LANGUAGE: Future plans using "will" and "be going to." "I will go to Kyoto. I'm going to visit my grandparents. Will you go anywhere? Yes, I will. / No, I won't."

GRAMMAR: Two forms of future tense in English.
1. "will" + base verb — spontaneous decisions or predictions: "I think it will rain."
2. "be going to" + base verb — planned future: "I'm going to go to the beach next week."
At JH 1st year, the distinction is introduced lightly — focus on being able to use both forms.

KEY EXPRESSIONS:
- I will [verb]. / I won't [verb].
- I'm going to [verb].
- Will you [verb]? Yes, I will. / No, I won't.
- What are you going to do this summer?

SAMPLE CLASSROOM INTERACTION:
ALT: This summer, I'm going to go back to my home country! I will visit my family. What about you?
Student: I'm going to go to my grandma's house.
ALT: Will you eat anything special?
Student: Yes! I will eat BBQ!
ALT: That sounds amazing!

TEACHING TIPS: Summer vacation plans are universally exciting — students genuinely want to share their plans. Avoid a deep dive into will vs. going to contrast at this level; just present both and let students use whichever feels natural. Focus on producing meaningful sentences about their real plans. A "Summer Plan Card" gives students a writing scaffold before the speaking task.

COMMON ERRORS: "I will going to" (mixing both forms), "I will go to swimming" (using "to" before the verb when will already makes it infinitive), "Will you going?" (incorrect question form).

ACTIVITY IDEAS: Summer plan card writing and sharing, "Guess my summer" quiz (classmates guess where you're going), future plan survey walk (What are you going to do?).`,
    content_type: 'textbook_unit',
    textbook: "New Horizon 1",
    unit_number: 6,
    unit_title: "Enjoy the Summer!",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'future_will_going_to',
    skills: ['Speaking', 'Writing'],
    interaction: 'pair',
    topic_tags: ['future', 'plans', 'summer', 'will', 'going-to']
  },

  {
    id: "new-horizon-1-unit-8",
    text: `Unit 8: Staging the School Festival — New Horizon 1 (JH 1st Year)

TARGET LANGUAGE: Asking for and giving directions. "Excuse me, where is the gym? Go straight. Turn left. It's on your right. It's next to the library."

GRAMMAR: Prepositions of place: next to, in front of, behind, between, across from. Directional imperatives: go straight, turn left/right, take the first/second left.

KEY EXPRESSIONS:
- Excuse me, where is [place]?
- Go straight. / Turn left. / Turn right.
- It's on your left/right.
- It's next to / in front of / behind / between [place].

SAMPLE CLASSROOM INTERACTION:
ALT: Excuse me! I'm looking for the science room. Do you know where it is?
Student: Sure! Go straight down this hall, then turn left. It's on your right, next to the art room.
ALT: Thank you so much!
(Students practice giving directions using a school map)

TEACHING TIPS: Use an actual school map or a simple drawn map of the school. Students love the real-world task of giving directions to a new teacher. The school festival context makes it relevant — guides at the festival booth need to direct visitors. Teach direction imperatives first as a sequence (not individual vocabulary items) so students can produce a multi-step direction.

COMMON ERRORS: Confusing left and right (it's universal — have students hold up their hand to check), "Go to straight" (extra "to"), "It is at next to the library" (extra preposition).

ACTIVITY IDEAS: School map directions roleplay, treasure hunt (follow directions to find a hidden card around school), maze puzzle worksheet.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon 1",
    unit_number: 8,
    unit_title: "Staging the School Festival",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'directions_prepositions',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['directions', 'school', 'prepositions', 'real-world', 'festival']
  },

  // ═══════════════════════════════════════════════════════════════
  // NEW HORIZON ELEMENTARY 5 — Grade 5 (Tokyo Shoseki)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "new-horizon-elementary-5-unit-1",
    text: `Unit 1: Hello, Everyone! — New Horizon Elementary 5 (Grade 5, Tokyo Shoseki)

TARGET LANGUAGE: Extended self-introduction including name, likes, dislikes, and what you are good at. "My name is [Name]. I like [X]. I don't like [Y]. I'm good at [Z]."

KEY EXPRESSIONS:
- My name is [Name]. / I'm [Name].
- I like [X]. / I don't like [Y].
- I'm good at [sport/subject/activity].
- Nice to meet you!

SAMPLE CLASSROOM INTERACTION:
ALT: Hello! My name is [ALT]. I'm from [country]. I like music. I don't like natto! I'm good at singing. How about you?
Student: My name is Haruto. I like soccer. I'm good at drawing.
ALT: Wow! That's great! Are you good at English?
Student: A little! (laughs)

TEACHING TIPS: Grade 5 students have had two years of English — acknowledge their knowledge from the start. The "good at" phrase often surprises students since it differs from "I can." Emphasise that "good at" expresses skill level. Make a personal profile card as a writing/drawing scaffold. Peer introductions ("This is my friend Haruto. He is good at drawing.") extend the lesson naturally.

COMMON ERRORS: "I'm good in soccer" (wrong preposition), "I good at" (missing be-verb), "I'm well at" (confusing well and good).

ACTIVITY IDEAS: Profile card making and sharing, peer introduction chain, "Find 3 things in common" mingling activity.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon Elementary 5",
    unit_number: 1,
    unit_title: "Hello, Everyone!",
    level: 'Elementary',
    grade: 'Grade 5',
    grade_numeric: 5,
    complexity: 2,
    grammar_focus: 'self_introduction_good_at',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['self-introduction', 'likes', 'dislikes', 'good-at', 'profile']
  },

  {
    id: "new-horizon-elementary-5-unit-2",
    text: `Unit 2: What Do You Do in Your Spare Time? — New Horizon Elementary 5 (Grade 5, Tokyo Shoseki)

TARGET LANGUAGE: Talking about hobbies and free-time activities. "I like [verb-ing]. I enjoy [verb-ing]. I often [verb] on weekends. What do you do in your spare time?"

KEY EXPRESSIONS:
- I like [cooking/reading/playing games].
- I enjoy [verb-ing].
- I often [play tennis] on weekends.
- What do you do in your spare time?

GRAMMAR NOTE: This unit introduces gerunds (verb + -ing) as the object of "like" and "enjoy." Students do NOT need to understand the grammar term — just model "I like swimming" as a pattern. The phrase "spare time" is new vocabulary — explain with visuals or translation.

SAMPLE CLASSROOM INTERACTION:
ALT: What do you do in your spare time? I like cooking and reading.
Student: I like playing video games.
ALT: Do you enjoy sports?
Student: Yes! I enjoy swimming in summer.

TEACHING TIPS: This topic bridges elementary English into real teen interests. Many students have strong hobbies (gaming, manga, sports, cooking). Honour their real interests as vocabulary — if a student says "I like anime," that's excellent English production. Hobby vocabulary: reading, cooking, drawing, playing games, watching movies, listening to music, swimming, gardening.

COMMON ERRORS: "I like cook" (missing -ing after like), "I enjoy to swim" (infinitive after enjoy — must use gerund), "I like play games" (same omission).

ACTIVITY IDEAS: Hobby survey chart, spare time collage (draw or cut out pictures of your hobbies), "What do you do?" circle interview.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon Elementary 5",
    unit_number: 2,
    unit_title: "What Do You Do in Your Spare Time?",
    level: 'Elementary',
    grade: 'Grade 5',
    grade_numeric: 5,
    complexity: 2,
    grammar_focus: 'gerunds_hobbies',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['hobbies', 'free-time', 'gerunds', 'interests', 'weekends']
  },

  {
    id: "new-horizon-elementary-5-unit-3",
    text: `Unit 3: What's for Dinner? — New Horizon Elementary 5 (Grade 5, Tokyo Shoseki)

TARGET LANGUAGE: Food vocabulary and expressing preferences at meal time. "I usually eat [food] for dinner. Do you like [food]? Yes, I love it! / Not really." Country and culture link: what people eat for dinner around the world.

KEY EXPRESSIONS:
- I usually eat [food] for [breakfast/lunch/dinner].
- Do you like [food]?
- Yes, I love it! / I like it a little. / Not really. / I don't like it.
- In [country], people often eat [food].

TEACHING TIPS: Food is one of the most universally engaging topics for Grade 5 students. The cross-cultural element (what people eat in different countries) connects to social studies. ALT should bring in or show images of food from their home country that Japanese students might not know. Use a preference scale (love it / like it / don't like it) to practice expressing degrees of preference. Avoid forcing students to say they dislike Japanese food — keep the atmosphere positive.

COMMON ERRORS: "I eat usually" (wrong word order with frequency adverb), "I like very much ramen" (adverb placement error), "In America people is eat hamburger" (extra "is," wrong verb form).

ACTIVITY IDEAS: Food preference poll and bar graph, "World Food Tour" presentation by ALT, food category sorting (which foods do you eat for breakfast/lunch/dinner?).`,
    content_type: 'textbook_unit',
    textbook: "New Horizon Elementary 5",
    unit_number: 3,
    unit_title: "What's for Dinner?",
    level: 'Elementary',
    grade: 'Grade 5',
    grade_numeric: 5,
    complexity: 2,
    grammar_focus: 'food_preferences_frequency',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['food', 'preferences', 'culture', 'meals', 'countries']
  },

  {
    id: "new-horizon-elementary-5-unit-4",
    text: `Unit 4: Let's Go to Italy! — New Horizon Elementary 5 (Grade 5, Tokyo Shoseki)

TARGET LANGUAGE: Talking about countries and travel. "I want to go to [country]. I want to eat [food] there. I want to see [landmark]." Country vocabulary and world geography.

KEY EXPRESSIONS:
- I want to go to [country].
- I want to [verb] there.
- You can eat [food] in [country].
- It's famous for [X].

VOCABULARY: Countries (Italy, France, Kenya, Brazil, Australia, India, Canada, Egypt), landmarks (Eiffel Tower, Colosseum, Pyramids, Great Barrier Reef), foods (pasta, baguette, curry, sushi, etc.)

SAMPLE CLASSROOM INTERACTION:
ALT: I want to go to Italy! I want to eat real pasta there. Italy is famous for art and pasta. Where do you want to go?
Student: I want to go to France.
ALT: Why?
Student: I want to eat a croissant!
ALT: Delicious! What else can you do in France?
Student: You can see the Eiffel Tower!

TEACHING TIPS: Use a world map prominently. Students colour or mark countries they want to visit. The cultural knowledge dimension (It's famous for...) makes this interdisciplinary. ALT should share their own travel experiences and home country with vivid descriptions. "I want to go to" is a high-frequency expression that comes from this unit — worth drilling well.

COMMON ERRORS: "I want go to" (missing "to" before infinitive), "I want to go Italy" (missing preposition "to"), confusing "famous for" with "famous of."

ACTIVITY IDEAS: "My dream destination" poster, world map destination marking, travel brochure creation, "Where do you want to go?" class vote.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon Elementary 5",
    unit_number: 4,
    unit_title: "Let's Go to Italy!",
    level: 'Elementary',
    grade: 'Grade 5',
    grade_numeric: 5,
    complexity: 2,
    grammar_focus: 'want_to_travel_countries',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['countries', 'travel', 'want-to', 'culture', 'world-geography']
  },

  {
    id: "new-horizon-elementary-5-unit-5",
    text: `Unit 5: A Hero's Life — New Horizon Elementary 5 (Grade 5, Tokyo Shoseki)

TARGET LANGUAGE: Describing someone's life using simple past and present sentences. "He was born in [year]. He grew up in [place]. He became a [job]. He is a hero because [reason]."

KEY EXPRESSIONS:
- He/She was born in [place/year].
- He/She grew up in [place].
- He/She became a [job/person].
- He/She is my hero because [reason].

VOCABULARY: born, grew up, became, helped, discovered, created, saved, struggled

TEACHING TIPS: This unit introduces a biographical narrative structure. Students choose a real hero — a family member, historical figure, or local person they admire. Presenting about someone else in third person builds the foundation for JH grammar. The personal connection to "my hero" makes the content authentic and emotionally engaging. ALT should share their own personal hero story as the Present phase.

COMMON ERRORS: "He borned in" (incorrect past — "was born" is a fixed phrase), "She growed up" (irregular verb — grew), "He became a hero because he brave" (missing be-verb).

ACTIVITY IDEAS: "My Hero" presentation (short speech about someone they admire), hero timeline poster, "Guess my hero" quiz with hints.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon Elementary 5",
    unit_number: 5,
    unit_title: "A Hero's Life",
    level: 'Elementary',
    grade: 'Grade 5',
    grade_numeric: 5,
    complexity: 2,
    grammar_focus: 'biography_past_narrative',
    skills: ['Speaking', 'Reading'],
    interaction: 'individual',
    topic_tags: ['heroes', 'biography', 'past-tense', 'famous-people', 'presentation']
  },

  // ═══════════════════════════════════════════════════════════════
  // NEW HORIZON ELEMENTARY 6 — Grade 6 (Tokyo Shoseki)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "new-horizon-elementary-6-unit-1",
    text: `Unit 1: Let's Start! — New Horizon Elementary 6 (Grade 6, Tokyo Shoseki)

TARGET LANGUAGE: Review of Grade 5 expressions + extended self-introduction with future dreams. "I want to be a [job]. I want to [verb] in the future. My dream is to [verb]."

KEY EXPRESSIONS:
- I want to be a [nurse/pilot/artist/programmer].
- I want to [travel abroad / help people / make music] in the future.
- My dream is to [verb].
- What do you want to be in the future?

SAMPLE CLASSROOM INTERACTION:
ALT: In the future, I want to continue teaching. I want to help students love English. What about you? What do you want to be?
Student: I want to be a doctor.
ALT: Why?
Student: I want to help sick people.
ALT: That's a wonderful dream! What do you need to do?
Student: I need to study hard.

TEACHING TIPS: Starting Grade 6 with future dreams sets an aspirational tone for the year. Students are now in their final elementary year — a natural moment to reflect on the future. Encourage authentic expression. The "why" follow-up question (Why do you want to be a...?) builds richer communication. Job vocabulary should reflect modern careers — include tech, environment, arts alongside traditional jobs.

COMMON ERRORS: "I want to be doctor" (missing article "a"), "I want be" (missing "to"), "My dream is be" (need "to be").

ACTIVITY IDEAS: Future dreams poster, dream job class survey graph, "Dream school festival" where students present their dream at a booth.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon Elementary 6",
    unit_number: 1,
    unit_title: "Let's Start!",
    level: 'Elementary',
    grade: 'Grade 6',
    grade_numeric: 6,
    complexity: 2,
    grammar_focus: 'want_to_future_dreams',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['future', 'jobs', 'dreams', 'want-to', 'career']
  },

  {
    id: "new-horizon-elementary-6-unit-2",
    text: `Unit 2: The Town I Love — New Horizon Elementary 6 (Grade 6, Tokyo Shoseki)

TARGET LANGUAGE: Describing your town and recommended spots. "You can enjoy [X] here. We have a great [place]. I recommend [place]. Please come and visit [town name]!"

KEY EXPRESSIONS:
- You can [eat/see/enjoy] [X] here.
- We have a [beautiful park / delicious sushi restaurant / famous festival].
- I recommend [place].
- Please come and visit [town]!

TEACHING TIPS: This unit has strong civic and local pride dimensions — connecting English to the students' own community. Students research their town's attractions and present to an imaginary tourist (or the ALT). The task is highly authentic: ALTs genuinely may not know local attractions, making the communication real. Vocabulary areas: tourist spots, local food specialties (meisanhin), seasonal events, nature.

COMMON ERRORS: "You can to enjoy" (extra "to" after can), "We have beautiful parks" vs. "We have a beautiful park" (article confusion), "Please come visit" (missing "to" — "come and visit" or "come to visit" are natural).

ACTIVITY IDEAS: Town guide brochure making, town presentation to ALT as tourist, "Best of our town" class voting, map-making activity with recommended spots.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon Elementary 6",
    unit_number: 2,
    unit_title: "The Town I Love",
    level: 'Elementary',
    grade: 'Grade 6',
    grade_numeric: 6,
    complexity: 2,
    grammar_focus: 'recommendations_can_you',
    skills: ['Speaking', 'Writing'],
    interaction: 'individual',
    topic_tags: ['local-area', 'recommendations', 'tourism', 'community', 'can']
  },

  {
    id: "new-horizon-elementary-6-unit-3",
    text: `Unit 3: This Is My School — New Horizon Elementary 6 (Grade 6, Tokyo Shoseki)

TARGET LANGUAGE: Giving a school tour and describing school features. "This is our school. We have [36 classrooms / a big gym / a pool]. Our school is famous for [X]. I like our school because [Y]."

KEY EXPRESSIONS:
- This is our [library/gym/music room].
- We have [number] [classrooms].
- Our school is famous for [X].
- I like our school because it is [adjective].

TEACHING TIPS: This unit prepares students for the transition to junior high. Giving a school tour in English develops confidence in extended speaking and builds school pride. Students can compare their school with international schools using photos or ALT's stories. Vocabulary: facilities (gymnasium, library, cafeteria, swimming pool, music room, science lab), descriptions (modern, old, large, friendly, busy).

COMMON ERRORS: "Our school has 35 classroom" (missing plural -s), "It famous for sports" (missing be-verb "is"), "We have the big gym" (unnecessary "the" — use "a big gym").

ACTIVITY IDEAS: School tour roleplay (student guides ALT through the school or a floor map), school comparison with ALT's home school, school pride speech contest.`,
    content_type: 'textbook_unit',
    textbook: "New Horizon Elementary 6",
    unit_number: 3,
    unit_title: "This Is My School",
    level: 'Elementary',
    grade: 'Grade 6',
    grade_numeric: 6,
    complexity: 2,
    grammar_focus: 'descriptions_school_facilities',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['school', 'descriptions', 'facilities', 'community', 'presentations']
  },

  {
    id: "new-horizon-elementary-6-unit-4",
    text: `Unit 4: My Future, My Life — New Horizon Elementary 6 (Grade 6, Tokyo Shoseki)

TARGET LANGUAGE: Discussing future plans and aspirations in more detail. "I want to be a [job]. I'll work to [help/protect/create]. I studied [subject] because I like [X]."

KEY EXPRESSIONS:
- I want to be a [job] in the future.
- I'll [help / protect / create / design] [people/the environment/things].
- I'm studying [subject] because [reason].
- My goal is to [infinitive].

TEACHING TIPS: This is the culminating speaking unit of elementary English. Students have built up to this for two years. The goal is to deliver a short, coherent, heartfelt speech about their future. Preparation time is important — students should draft, practice with partners, and rehearse before presenting to the class. The ALT's genuine curiosity about each student's dream makes the audience real.

COMMON ERRORS: "I want to be a soccer player" → the job title is fine but follow-up is often missing — coach students to always add "because" or "I want to [verb]." "My future is doctor" (missing article and want-to structure).

ACTIVITY IDEAS: "My Future" 3-sentence speech (prepared and practiced), career interview pairs, future class newspaper ("What do your classmates want to be?").`,
    content_type: 'textbook_unit',
    textbook: "New Horizon Elementary 6",
    unit_number: 4,
    unit_title: "My Future, My Life",
    level: 'Elementary',
    grade: 'Grade 6',
    grade_numeric: 6,
    complexity: 2,
    grammar_focus: 'future_plans_aspirations',
    skills: ['Speaking', 'Writing'],
    interaction: 'individual',
    topic_tags: ['future', 'dreams', 'career', 'aspirations', 'speech']
  },

  // ═══════════════════════════════════════════════════════════════
  // HERE WE GO! 5 — Grade 5 (Keirinkan)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "here-we-go-5-unit-1",
    text: `Unit 1: I Like My Town. — Here We Go! 5 (Grade 5 Elementary, Keirinkan)

TARGET LANGUAGE: Describing your local area using "There is/are" and "We have." "There is a big park near my house. There are many shops. We have a famous festival in summer."

KEY EXPRESSIONS:
- There is a [place/building] in my town.
- There are [many/some/no] [places] here.
- We have a [festival/specialty food/famous spot].
- I like my town because [reason].

GRAMMAR NOTE: There is (singular) vs. There are (plural). Students often say "There is many shops" — the plural rule needs explicit attention. This is the introductory use of existential "there is/are."

TEACHING TIPS: Here We Go! (Keirinkan) has a slightly different sequencing than New Horizon. This unit connects directly to MEXT's "local community" theme for Grade 5. Use a real map of the town or a simple drawn map. Students take turns saying something that exists in their town. Positive framing is important — even if students feel their town is "boring," help them find something worth mentioning.

COMMON ERRORS: "There is many shops" (plural error), "There have a park" (wrong verb — must be "is/are"), "My town have a river" (should be "has" or use "there is").

ACTIVITY IDEAS: Town map making with labels, "What does your town have?" survey, virtual town tour presentation, tourist pamphlet design.`,
    content_type: 'textbook_unit',
    textbook: "Here We Go! 5",
    unit_number: 1,
    unit_title: "I Like My Town.",
    level: 'Elementary',
    grade: 'Grade 5',
    grade_numeric: 5,
    complexity: 2,
    grammar_focus: 'there_is_are_community',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['community', 'town', 'there-is-are', 'local-area', 'descriptions']
  },

  {
    id: "here-we-go-5-unit-2",
    text: `Unit 2: What Do You Have in Your School? — Here We Go! 5 (Grade 5 Elementary, Keirinkan)

TARGET LANGUAGE: School facilities and what students do there. "We have a library. I go to the library to read books. We don't have a swimming pool."

KEY EXPRESSIONS:
- We have a [gym/library/music room/art room].
- We don't have a [cafeteria].
- I go to the [library] to [read books / study].
- What does your school have?

TEACHING TIPS: Following Unit 1's town vocabulary, this unit narrows to the school campus. Students describe their own school in English. The "to + verb" purpose structure ("I go to the library to study") introduces infinitive of purpose without explicit grammar teaching. Focus on the communicative meaning. Cross-cultural comparison is productive: ALTs can describe their elementary or high school abroad — often very different from Japanese schools.

COMMON ERRORS: "We have library" (missing article "a"), "I go library" (missing preposition "to"), "to reading books" (using gerund instead of base verb after "to").

ACTIVITY IDEAS: School facility survey (Do you have...?), school map labelling, "My school vs. ALT's school" comparison chart.`,
    content_type: 'textbook_unit',
    textbook: "Here We Go! 5",
    unit_number: 2,
    unit_title: "What Do You Have in Your School?",
    level: 'Elementary',
    grade: 'Grade 5',
    grade_numeric: 5,
    complexity: 2,
    grammar_focus: 'school_facilities_there_is',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['school', 'facilities', 'community', 'comparison', 'there-is-are']
  },

  {
    id: "here-we-go-5-unit-3",
    text: `Unit 3: I want to eat sushi! — Here We Go! 5 (Grade 5 Elementary, Keirinkan)

TARGET LANGUAGE: Expressing wants and wishes with "I want to." Travel and food desires. "I want to go to [country]. I want to eat [food]. I want to see [landmark]."

KEY EXPRESSIONS:
- I want to [go to / eat / see / try / buy] [X].
- I want to visit [country/place].
- What do you want to eat?
- Why?

TEACHING TIPS: "Want to" is one of the most useful and frequently used expressions in daily English communication. Here We Go! introduces it through a travel/food context that Grade 5 students find exciting. The "Why?" follow-up builds conversational depth. Students who only produce one sentence should be encouraged to add a reason or a second want. Vocabulary support for countries, foods, and landmarks helps students say something specific and memorable.

COMMON ERRORS: "I want eat sushi" (missing "to"), "I want to going" (using gerund instead of base verb after want to), "I want to see Mt. Fuji" said as I want to see "Fuji-san" — model the English pronunciation.

ACTIVITY IDEAS: Dream trip planning worksheet, "Three things I want to do this year" sharing, want-to sentence tournament (students vote on the most interesting wish).`,
    content_type: 'textbook_unit',
    textbook: "Here We Go! 5",
    unit_number: 3,
    unit_title: "I want to eat sushi!",
    level: 'Elementary',
    grade: 'Grade 5',
    grade_numeric: 5,
    complexity: 2,
    grammar_focus: 'want_to_wishes',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['wants', 'travel', 'food', 'want-to', 'wishes']
  },

  // ═══════════════════════════════════════════════════════════════
  // HERE WE GO! 6 — Grade 6 (Keirinkan)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "here-we-go-6-unit-1",
    text: `Unit 1: We Are All Friends. — Here We Go! 6 (Grade 6 Elementary, Keirinkan)

TARGET LANGUAGE: Extended self-introduction and describing others. "This is my friend [Name]. He/She is [adjective]. He/She is good at [X]. He/She likes [Y]."

KEY EXPRESSIONS:
- This is my friend [Name].
- He/She is [kind/funny/smart/sporty].
- He/She is good at [sport/subject/activity].
- He/She likes [X].
- We are good friends because [reason].

TEACHING TIPS: Opening Grade 6 with friendship and community aligns with MEXT's emphasis on international understanding and relationship building. Introducing a friend in English requires third-person forms — a natural bridge to JH grammar. Use a partner interview → introduce-your-partner format. Students listen to each other, write notes, and then present their partner to the class. This is excellent for active listening.

COMMON ERRORS: "She good at soccer" (missing "is"), "He like playing games" (missing -s for third person), "My friend she is kind" (double subject).

ACTIVITY IDEAS: Partner interview and introduction, "Best friend" profile card, class friendship web (draw connections between friends).`,
    content_type: 'textbook_unit',
    textbook: "Here We Go! 6",
    unit_number: 1,
    unit_title: "We Are All Friends.",
    level: 'Elementary',
    grade: 'Grade 6',
    grade_numeric: 6,
    complexity: 2,
    grammar_focus: 'third_person_descriptions',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['friendship', 'descriptions', 'third-person', 'community', 'self-introduction']
  },

  {
    id: "here-we-go-6-unit-2",
    text: `Unit 2: Your Work, Our Lives — Here We Go! 6 (Grade 6 Elementary, Keirinkan)

TARGET LANGUAGE: Talking about jobs and what workers do. "A doctor helps sick people. A farmer grows vegetables. What do you do? I'm a [job]. I [verb] every day."

KEY EXPRESSIONS:
- A [job] [verb]s [object] every day.
- What do you do? I'm a [job].
- [Name] works at [hospital/school/farm].
- It's important because [reason].

TEACHING TIPS: This unit explores occupations and their social importance — connecting to career education (キャリア教育) which is a formal part of the Grade 6 curriculum. Expand vocabulary beyond common jobs to include modern careers (app developer, YouTuber, environmental scientist). The "why is this job important?" question develops higher-order thinking in English.

COMMON ERRORS: "A teacher learn students" (wrong verb — "teaches"), "He work at school" (missing -s), "I'm teacher" (missing article "a").

ACTIVITY IDEAS: Career day presentation (students act as a job professional), "What's my job?" 20 questions game, jobs importance ranking discussion.`,
    content_type: 'textbook_unit',
    textbook: "Here We Go! 6",
    unit_number: 2,
    unit_title: "Your Work, Our Lives",
    level: 'Elementary',
    grade: 'Grade 6',
    grade_numeric: 6,
    complexity: 2,
    grammar_focus: 'jobs_third_person_present',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['jobs', 'careers', 'community', 'third-person', 'social-studies']
  },

  {
    id: "here-we-go-6-unit-3",
    text: `Unit 3: My Future Dream — Here We Go! 6 (Grade 6 Elementary, Keirinkan)

TARGET LANGUAGE: Expressing future aspirations with "want to be" and giving reasons. "I want to be a [job] because I like [X]. I want to [help/create/protect] [people/things]."

KEY EXPRESSIONS:
- I want to be a [job].
- Because I like [X] / because I want to [help people].
- I will [study/practice/learn] to achieve my dream.
- My dream is [important/big/special] to me.

TEACHING TIPS: This is the capstone speaking unit for elementary English at many Grade 6 programs. Students should prepare and rehearse a short speech (4-6 sentences). Peer feedback — saying one thing they liked about their classmate's dream — builds a supportive classroom culture. Teach students to ask follow-up questions after presentations ("Why do you want to be a...?"). The ALT's genuine interest in each student's dream is the most motivating force.

COMMON ERRORS: "I want be" (missing "to"), presenting a dream in present tense: "I am a singer" (should be "I want to be"), using only the job name with no explanation (encourage elaboration).

ACTIVITY IDEAS: Dream speech preparation and delivery, dream job voting wall, "In 10 years" letter writing to future self.`,
    content_type: 'textbook_unit',
    textbook: "Here We Go! 6",
    unit_number: 3,
    unit_title: "My Future Dream",
    level: 'Elementary',
    grade: 'Grade 6',
    grade_numeric: 6,
    complexity: 2,
    grammar_focus: 'future_dreams_want_to_be',
    skills: ['Speaking', 'Writing'],
    interaction: 'individual',
    topic_tags: ['future', 'dreams', 'career', 'aspirations', 'speech']
  },

  // ═══════════════════════════════════════════════════════════════
  // HERE WE GO! 1 — JH 1st Year (Keirinkan)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "here-we-go-jh1-unit-1",
    text: `Unit 1: Nice to Meet You. — Here We Go! 1 (JH 1st Year, Keirinkan)

TARGET LANGUAGE: Formal self-introductions with be-verbs. "I am [Name]. I am from [place]. I am a student at [school]. Are you from [place]? Yes, I am. / No, I'm not."

GRAMMAR: Full conjugation of be-verb (am/are/is) introduced formally. Contractions vs. full forms. Yes/No question inversion with be-verb.

KEY EXPRESSIONS:
- I am [Name]. I'm from [city/country].
- I am a student at [school name].
- Are you from [place]? Yes, I am. / No, I'm not.
- Where are you from?
- Nice to meet you!

TEACHING TIPS: Here We Go! (Keirinkan) is known for its clear grammar progression and international contexts. Unit 1 features diverse characters from different countries — use this to build intercultural awareness from day one. Students genuinely meet new classmates in JH 1st year; the "real" use case makes the language authentic. Explicitly contrast the formal "I am" with the contracted "I'm" and explain that both are correct, but contractions are natural in speech.

COMMON ERRORS: "I am coming from Tokyo" (continuous form — not needed; just "I'm from Tokyo"), "Are you from Tokyo? Yes, I'm." (incomplete answer — must be "Yes, I am"), "Where are you from?" → "I'm from Tokyo city" (city not needed; just city name).

ACTIVITY IDEAS: Hometown map pins (students pin their hometown), "Where are you from?" class survey, international student roleplay with country cards.`,
    content_type: 'textbook_unit',
    textbook: "Here We Go! 1",
    unit_number: 1,
    unit_title: "Nice to Meet You.",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'be_verb_intro',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['self-introduction', 'be-verbs', 'greetings', 'school-life', 'countries']
  },

  {
    id: "here-we-go-jh1-unit-2",
    text: `Unit 2: My Family — Here We Go! 1 (JH 1st Year, Keirinkan)

TARGET LANGUAGE: Describing family members. "I have [one brother / two sisters]. My father is a [job]. My mother likes [X]. He/She is [adjective]."

GRAMMAR: Third-person be-verb (is) and third-person present simple (likes, works, plays). Students must use -s/-es consistently when talking about family. Possessives: my, his, her, your, our.

KEY EXPRESSIONS:
- I have [number] [brother(s)/sister(s)].
- My [father/mother/brother/sister] is [job/adjective].
- He/She likes [X]. / He/She plays [sport].
- We have [four] people in my family.

TEACHING TIPS: Family is a deeply personal topic — be sensitive to non-traditional family structures. Never force students to describe their family composition publicly if they are uncomfortable. The grammar teaching point (third-person -s) naturally arises when describing others, so this unit is excellent for contextualizing that rule. Use a family tree visual. Students draw their family tree and present.

COMMON ERRORS: "My father like soccer" (missing -s), "My mother she works" (double subject), "I have two brother" (missing plural -s).

ACTIVITY IDEAS: Family tree drawing and presentation, "Guess my family" quiz, family adjective description ("My grandma is funny and kind").`,
    content_type: 'textbook_unit',
    textbook: "Here We Go! 1",
    unit_number: 2,
    unit_title: "My Family",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'family_third_person',
    skills: ['Speaking', 'Writing'],
    interaction: 'pair',
    topic_tags: ['family', 'third-person', 'descriptions', 'possessives', 'relationships']
  },

  {
    id: "here-we-go-jh1-unit-3",
    text: `Unit 3: Around the World — Here We Go! 1 (JH 1st Year, Keirinkan)

TARGET LANGUAGE: Talking about countries, cultures, and what people do. "In France, people eat baguettes. In Brazil, people love soccer. People in Japan often celebrate [festival]."

KEY EXPRESSIONS:
- In [country], people [verb].
- People in [country] often [verb].
- [Country] is famous for [X].
- I think [country] is [adjective] because [reason].

GRAMMAR: Present simple with plural subject "people" (no -s needed). Introduction of hedging language: "I think," "I believe." Preposition of place: "in [country]."

TEACHING TIPS: Here We Go! places strong emphasis on international understanding. Unit 3 builds world knowledge alongside grammar. ALTs bring firsthand cultural knowledge that no textbook can replicate — students are genuinely curious. Teach students to distinguish fact ("In Brazil, the official language is Portuguese") from opinion ("I think Brazil is amazing because..."). Connecting English to social studies builds cross-curricular value.

COMMON ERRORS: "In France peoples eat" (plural "people" never needs -s), "Japan is famous of Mt. Fuji" (famous FOR, not "of"), "I think that Japan is" (adding unnecessary "that" — acceptable but often taught as removable).

ACTIVITY IDEAS: Country fact quiz, cultural show-and-tell by ALT, "World Cup of Cultures" team trivia, country comparison chart.`,
    content_type: 'textbook_unit',
    textbook: "Here We Go! 1",
    unit_number: 3,
    unit_title: "Around the World",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'present_simple_cultures',
    skills: ['Speaking', 'Reading'],
    interaction: 'pair',
    topic_tags: ['countries', 'culture', 'world', 'international', 'facts']
  },

  // ═══════════════════════════════════════════════════════════════
  // SUNSHINE 2 — JH 2nd Year (Kairyudo)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "sunshine-2-unit-1",
    text: `Unit 1: A New Year — Sunshine 2 (JH 2nd Year, Kairyudo)

TARGET LANGUAGE: Expressing plans and resolutions using "will" and "be going to." "I'm going to study harder this year. I will try my best. What are your goals for this year?"

KEY EXPRESSIONS:
- I'm going to [study harder / join a new club / travel abroad].
- I will [try / do my best / practice every day].
- My goal is to [verb].
- What are you going to do this year?

GRAMMAR: Review of will vs. be going to from JH 1st year, now applied to longer-term planning (year-long resolutions). The distinction between planned intentions (going to) and will (predictions/promises) can be treated more explicitly in 2nd year.

TEACHING TIPS: The start of a new school year is perfect for goal-setting. Have students write 3 concrete resolutions and practice saying them to a partner. Students often have vague goals ("I will study more") — encourage specificity ("I'm going to study English for 30 minutes every day"). The ALT sharing genuine personal goals for the year models authentic communication.

COMMON ERRORS: "I will going to" (mixing both), "My goal studies harder" (wrong structure — "My goal is to study harder"), "I'm going to studying" (gerund after going to — must use base verb).

ACTIVITY IDEAS: New Year's resolution card exchange, goal-setting interview (ask 3 classmates their goals), class goal wall (sticky notes with everyone's goals).`,
    content_type: 'textbook_unit',
    textbook: "Sunshine 2",
    unit_number: 1,
    unit_title: "A New Year",
    level: 'JuniorHigh',
    grade: '2nd Year',
    grade_numeric: 8,
    complexity: 3,
    grammar_focus: 'will_going_to_goals',
    skills: ['Speaking', 'Writing'],
    interaction: 'pair',
    topic_tags: ['future', 'goals', 'new-year', 'resolutions', 'will']
  },

  {
    id: "sunshine-2-unit-3",
    text: `Unit 3: My Favorite Musician — Sunshine 2 (JH 2nd Year, Kairyudo)

TARGET LANGUAGE: Describing someone using relative clauses. "I know a singer who plays the piano. She is a musician that many people love. This is the song that changed my life."

GRAMMAR: Relative clauses with "who" (for people) and "that/which" (for things). This is the key grammar point of Unit 3.
- Who: refers to a person → "a teacher who is kind"
- That/Which: refers to a thing → "a book that I love"
The relative clause modifies a noun, giving more information about it without a new sentence.

SAMPLE DIALOGUE:
Student: My favorite musician is [Name]. He is a singer who plays the guitar.
ALT: What kind of music does he play?
Student: He plays music that is relaxing and beautiful.
ALT: Why do you like him?
Student: He is a person who works very hard. He writes all his own songs.

TEACHING TIPS: Many JH 2nd year students struggle with relative clauses because the structure differs fundamentally from Japanese (where modifiers precede the noun). Explicitly demonstrate the two-sentence merge: "I know a girl. She plays tennis." → "I know a girl who plays tennis." Start with who/that examples about classmates or famous people the students know. Keep sentences short at first.

COMMON ERRORS: "He is singer who plays" (missing article "a"), "a girl who she plays tennis" (double subject — remove "she"), "a book which I love it" (same error with object pronoun).

ACTIVITY IDEAS: "My Favorite ___" presentation (music, sport, book) using relative clauses, class "greatest of all time" debate, describe-a-person riddle game.`,
    content_type: 'textbook_unit',
    textbook: "Sunshine 2",
    unit_number: 3,
    unit_title: "My Favorite Musician",
    level: 'JuniorHigh',
    grade: '2nd Year',
    grade_numeric: 8,
    complexity: 3,
    grammar_focus: 'relative_clauses_who_that',
    skills: ['Speaking', 'Writing'],
    interaction: 'pair',
    topic_tags: ['music', 'relative-clauses', 'descriptions', 'favorites', 'grammar']
  },

  {
    id: "sunshine-2-unit-5",
    text: `Unit 5: Is It True? — Sunshine 2 (JH 2nd Year, Kairyudo)

TARGET LANGUAGE: Expressing opinions and backing them up with reasons. "I think [statement]. I believe [X] because [reason]. In my opinion, [X] is [adjective]."

KEY EXPRESSIONS:
- I think [statement].
- I believe [X] because [reason].
- In my opinion, [X] is [adjective].
- That's a good point. / I agree/disagree.
- What do you think?

GRAMMAR: Embedded "that" clause after think/believe: "I think (that) it is true." The "that" is optional in spoken English. Introduces hedging language for polite disagreement.

TEACHING TIPS: Sunshine 2's Unit 5 builds critical thinking skills in English. Students practice expressing opinions on topics like technology, environment, and school rules. The productive target is a short opinion speech (3-4 sentences). "What do you think?" should become a habitual question in pair discussions. Teach the formula: Opinion + Reason 1 + Reason 2 + Conclusion.

COMMON ERRORS: "I think that because" (incomplete logic — the reason must follow "because"), "In my opinion I think" (redundant doubling), "I no agree" (should be "I disagree" or "I don't agree").

ACTIVITY IDEAS: Opinion survey and report, four-corners opinion (strongly agree/agree/disagree/strongly disagree), mini debate (2 vs. 2 on a simple topic).`,
    content_type: 'textbook_unit',
    textbook: "Sunshine 2",
    unit_number: 5,
    unit_title: "Is It True?",
    level: 'JuniorHigh',
    grade: '2nd Year',
    grade_numeric: 8,
    complexity: 3,
    grammar_focus: 'opinion_expressions_that_clause',
    skills: ['Speaking', 'Writing'],
    interaction: 'pair',
    topic_tags: ['opinions', 'reasoning', 'debate', 'critical-thinking', 'expression']
  },

  // ═══════════════════════════════════════════════════════════════
  // NEW CROWN 1 — JH 1st Year (Sanseido)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "new-crown-1-unit-1",
    text: `Unit 1: My New School Life — New Crown 1 (JH 1st Year, Sanseido)

TARGET LANGUAGE: Introducing yourself and your new school life. "I'm [Name]. I'm from [place]. I like [X]. I'm a member of the [club] club."

KEY EXPRESSIONS:
- I'm [Name]. I'm from [city].
- I like [sport/subject/hobby].
- I'm a member of the [club] club.
- My favorite [subject] is [X].
- Nice to meet you!

GRAMMAR: Be-verb basics (am/are/is), simple present "I like/play." New Crown 1 introduces grammar through functional use before explicit explanation. Sanseido textbooks are known for their communicative-first approach.

TEACHING TIPS: New Crown is known for its appealing character design and story-based units. Unit 1 features students starting junior high — a universally relatable situation. Leverage the emotional energy of "real" new beginnings. The "club" context is authentically Japanese and motivating. Students should produce at least 3 sentences about themselves using the target structures.

COMMON ERRORS: "I am member of" (missing "a"), "My favorite subject are math" (subject-verb disagreement), "I in the soccer club" (missing be-verb "am").

ACTIVITY IDEAS: New school bingo (find someone who plays same sport/likes same subject), club recruitment poster, first day of school roleplay.`,
    content_type: 'textbook_unit',
    textbook: "New Crown 1",
    unit_number: 1,
    unit_title: "My New School Life",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'be_verb_present_simple_intro',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['self-introduction', 'school-life', 'clubs', 'be-verbs', 'new-start']
  },

  {
    id: "new-crown-1-unit-3",
    text: `Unit 3: My Favorite Things — New Crown 1 (JH 1st Year, Sanseido)

TARGET LANGUAGE: Using "This/That/These/Those" with nouns, and expressing strong preferences. "This is my favorite book. That is a famous painting. These are my treasures."

KEY EXPRESSIONS:
- This is [my favorite book / a photo of my family].
- That is [a famous painting / my goal].
- These are [my soccer shoes / special to me].
- My favorite [item] is [X] because [reason].

GRAMMAR: Demonstrative pronouns and determiners (this/that/these/those). Singular vs. plural. Near vs. far distinction. New Crown Unit 3 also introduces "because" for giving reasons.

TEACHING TIPS: "Show and tell" is a powerful format for this unit — students bring (or draw) something important to them and describe it using this/that/these/those. The personal connection makes the language meaningful. Because-reasons add depth: encourage every student to include one "because" sentence. New Crown's character storylines provide good contextual examples.

COMMON ERRORS: "These is" (plural demonstrative + singular verb), "This are" (same), "That is my favorites" (unnecessary plural on "favorites"), treating this/that interchangeably without considering physical proximity.

ACTIVITY IDEAS: Show-and-tell with favorite item, "What's this?" mystery box game (feel inside and guess), photo description (student brings a photo and explains with this/that).`,
    content_type: 'textbook_unit',
    textbook: "New Crown 1",
    unit_number: 3,
    unit_title: "My Favorite Things",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'demonstratives_this_that',
    skills: ['Speaking', 'Writing'],
    interaction: 'individual',
    topic_tags: ['favorites', 'demonstratives', 'descriptions', 'personal', 'show-and-tell']
  },

  {
    id: "new-crown-1-unit-5",
    text: `Unit 5: Let's Talk About Food — New Crown 1 (JH 1st Year, Sanseido)

TARGET LANGUAGE: Talking about food preferences, meals, and quantities. "I like spicy food. I don't like natto very much. How about you? Would you like some more rice?"

KEY EXPRESSIONS:
- I like [spicy / sweet / sour / salty] food.
- I don't like [X] very much.
- Would you like [some/more] [food]?
- Yes, please! / No, thank you.
- It looks [delicious/good/strange].

GRAMMAR: Would you like... (polite offer) introduced as a fixed social phrase. "Very much" as an intensifier. Adjectives for taste: spicy, sweet, sour, salty, bitter, delicious.

TEACHING TIPS: New Crown Unit 5 integrates food culture with language learning. ALT input is extremely valuable here — sharing unusual foods from their country surprises and delights students. The "Would you like?" offer formula is high practical value and should be practised in a roleplay (restaurant or dinner table scenario). Taste vocabulary (spicy/sweet/bitter/sour) transfers well across topics.

COMMON ERRORS: "I like very much pizza" (wrong word order — "I like pizza very much"), "Would you like some rices?" (uncountable noun), "It's looks good" (extra "is").

ACTIVITY IDEAS: Restaurant roleplay (waiter/customer ordering), "What's this taste?" blindfold game, food culture quiz (from ALT's home country), recipe sharing.`,
    content_type: 'textbook_unit',
    textbook: "New Crown 1",
    unit_number: 5,
    unit_title: "Let's Talk About Food",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'food_preferences_would_you_like',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['food', 'preferences', 'taste', 'culture', 'polite-offers']
  },

  // ═══════════════════════════════════════════════════════════════
  // ONE WORLD 1 — JH 1st Year (Kyoiku Shuppan)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "one-world-1-unit-1",
    text: `Unit 1: Hello! Let's Connect. — One World 1 (JH 1st Year, Kyoiku Shuppan)

TARGET LANGUAGE: Introducing yourself to international friends. "Hello! I'm [Name]. I'm from Japan. I like [anime/soccer/music]. What about you?"

KEY EXPRESSIONS:
- Hello! I'm [Name].
- I'm from [place].
- I like [X].
- What about you? / How about you?
- Nice to meet you!

GRAMMAR: Basic present simple with I/you. One World by Kyoiku Shuppan emphasises global citizenship — Unit 1 features students connecting online with international pen pals. This framing immediately establishes English as a tool for real international communication, not just classroom exercise.

TEACHING TIPS: One World has a strong global education focus. Use the pen-pal framing — students write (or practice saying) their introduction AS IF writing to an overseas friend. This gives the language a genuine audience. Discuss why English is useful for international communication. The ALT as a real "international friend" in the classroom is a powerful teachable moment.

COMMON ERRORS: "I'm come from Japan" (wrong form — just "I'm from Japan"), "What about you?" used as the first sentence (it's a follow-up — model the sequence), "I like anime very" (incomplete intensifier — "very much").

ACTIVITY IDEAS: Pen-pal letter writing, international introduction video (record themselves), "World friends" name wall with flags and names.`,
    content_type: 'textbook_unit',
    textbook: "One World 1",
    unit_number: 1,
    unit_title: "Hello! Let's Connect.",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'greetings_present_simple_intro',
    skills: ['Speaking', 'Writing'],
    interaction: 'pair',
    topic_tags: ['self-introduction', 'international', 'greetings', 'pen-pals', 'global']
  },

  {
    id: "one-world-1-unit-2",
    text: `Unit 2: My Place, My World — One World 1 (JH 1st Year, Kyoiku Shuppan)

TARGET LANGUAGE: Describing your town and Japan to international friends. "Japan has beautiful mountains. My town is [near the sea / in the mountains / in a big city]. There are many [temples/parks/farms] here."

KEY EXPRESSIONS:
- My town is [near/in/by] [place].
- There are [many/some] [temples/parks/rice fields].
- Japan is famous for [Mt. Fuji / sushi / manga].
- You can enjoy [nature/culture/food] here.
- I want to show you [X].

GRAMMAR: There is/are (existential), can (possibility). Prepositions: near, in, by, between. One World's unique feature is connecting local description to a global audience — students learn to be ambassadors for their community.

TEACHING TIPS: One World encourages students to see their local area through international eyes. Prompt them: "What would a foreign friend find amazing about your town?" Often students underestimate how interesting their everyday surroundings are to outsiders. Use Google Street View or local photos to make the description visual and concrete.

COMMON ERRORS: "There are many rice field" (missing plural -s), "Japan is famous of sushi" (famous FOR), "My town is at mountains" (wrong preposition — "in the mountains").

ACTIVITY IDEAS: "My town for foreigners" guide writing, local area photo description, video message to imaginary overseas friend about hometown.`,
    content_type: 'textbook_unit',
    textbook: "One World 1",
    unit_number: 2,
    unit_title: "My Place, My World",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'there_is_are_descriptions',
    skills: ['Speaking', 'Writing'],
    interaction: 'pair',
    topic_tags: ['community', 'Japan', 'descriptions', 'culture', 'international-perspective']
  },

  {
    id: "one-world-1-unit-4",
    text: `Unit 4: My Favorite Season — One World 1 (JH 1st Year, Kyoiku Shuppan)

TARGET LANGUAGE: Describing seasons, weather, and seasonal activities. "I like summer because it is exciting. In winter, we can ski. What season do you like?"

KEY EXPRESSIONS:
- My favorite season is [spring/summer/fall/winter].
- I like [season] because [reason].
- In [season], I [play/eat/watch/enjoy] [X].
- The weather in [season] is [hot/cold/cool/warm/rainy/snowy].
- What season do you like? Why?

GRAMMAR: "Because" for giving reasons. Frequency adverbs: usually, often, sometimes, always, never. One World Unit 4 practices longer answers (reason sentences) after simpler "yes/no" answers.

TEACHING TIPS: Season preferences are highly personal and culturally interesting — Japan's four seasons are a point of national pride. The cultural comparison with ALT's home country (which may have very different seasons, or fewer distinct ones) is always engaging. Push students to give TWO reasons for their preference, not just one. This develops more sophisticated speaking.

COMMON ERRORS: "I like summer because is hot" (missing subject "it"), "In winter we can skiing" (wrong form after can — base verb), "My favorite season is it summer" (extra "it").

ACTIVITY IDEAS: Season survey and class graph, "My ideal season" poster, season vs. season debate (Team Summer vs. Team Winter), seasonal food/event matching quiz.`,
    content_type: 'textbook_unit',
    textbook: "One World 1",
    unit_number: 4,
    unit_title: "My Favorite Season",
    level: 'JuniorHigh',
    grade: '1st Year',
    grade_numeric: 7,
    complexity: 2,
    grammar_focus: 'seasons_reasons_because',
    skills: ['Speaking', 'Listening'],
    interaction: 'pair',
    topic_tags: ['seasons', 'weather', 'preferences', 'reasons', 'culture']
  },

  // NOTE: Remaining textbook units (Crown Jr., Blue Sky, Junior Sunshine,
  // Sunshine 3, Here We Go! 2-3, One World 2-3, etc.) to be added in future enrichment.
];
