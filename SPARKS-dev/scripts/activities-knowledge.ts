export interface PineconeActivityRecord {
  id: string;
  text: string;
  content_type: 'activity';
  name: string;
  activity_type: 'Warm-up' | 'Main Game' | 'Production' | 'Review' | 'Filler';
  skill: string;
  duration_minutes: number;
  min_grade_numeric: number;
  max_grade_numeric: number;
  complexity_max: number;
  interaction: string;
  materials: string[];
  topic_tags: string[];
}

export const ACTIVITIES_KNOWLEDGE: PineconeActivityRecord[] = [

  // ══════════════════════════════════════════
  // WARM-UP / ENGAGEMENT ACTIVITIES
  // ══════════════════════════════════════════

  {
    id: "activity-missing-game",
    text: `Missing Game (What's Missing?). Warm-up vocabulary review activity. Place 6-10 flashcards on the board with magnets. Students look carefully and memorise them. Students close their eyes (or look away). Teacher removes one card. Students open eyes and say which card is missing. Works with any vocabulary set. Builds attention, memory, and vocabulary recall. Excellent for lessons with new vocabulary to reinforce. Fast, zero-prep once flashcards are ready. Can extend by removing 2-3 cards at once for higher grades.`,
    content_type: 'activity',
    name: "Missing Game",
    activity_type: 'Warm-up',
    skill: 'Vocabulary',
    duration_minutes: 5,
    min_grade_numeric: 3,
    max_grade_numeric: 8,
    complexity_max: 2,
    interaction: 'whole-class',
    materials: ['flashcards', 'magnets', 'blackboard'],
    topic_tags: ['vocabulary', 'memory', 'review', 'no-prep']
  },

  {
    id: "activity-simon-says",
    text: `Simon Says. Classic TPR warm-up. Teacher says "Simon says [action]" — students do the action. If teacher says just the action (no "Simon says"), students must NOT move. Anyone who moves incorrectly sits down (or does a fun forfeit instead of elimination). Perfect for Grade 3-4 with action verbs (stand up, sit down, touch your nose, clap your hands, jump). Can be adapted for any vocabulary: "Simon says point to something red." Works for commands, body parts, classroom objects, adjectives. High energy, zero materials, universally beloved.`,
    content_type: 'activity',
    name: "Simon Says",
    activity_type: 'Warm-up',
    skill: 'Listening',
    duration_minutes: 7,
    min_grade_numeric: 3,
    max_grade_numeric: 6,
    complexity_max: 2,
    interaction: 'whole-class',
    materials: [],
    topic_tags: ['TPR', 'listening', 'commands', 'body-parts', 'active']
  },

  {
    id: "activity-keyword-game",
    text: `Keyword Game (Eraser Game). Pair work listening activity. Students sit in pairs facing each other with one eraser placed between them. Teacher reads a list of vocabulary words. Before reading, teacher announces one word as the "keyword." When teacher says the keyword, both students race to grab the eraser. The student who grabs it first gets a point. Students should NOT grab on other words — if they do, the opponent gets the point. Fast-paced, addictive, works with any vocabulary list. No preparation beyond having an eraser per pair. Excellent for the practice phase — students are highly focused on every word.`,
    content_type: 'activity',
    name: "Keyword Game",
    activity_type: 'Main Game',
    skill: 'Listening',
    duration_minutes: 10,
    min_grade_numeric: 3,
    max_grade_numeric: 7,
    complexity_max: 3,
    interaction: 'pair',
    materials: ['eraser (1 per pair)'],
    topic_tags: ['listening', 'vocabulary', 'competitive', 'no-prep', 'pair-work']
  },

  {
    id: "activity-criss-cross",
    text: `Criss Cross. Whole-class quick-fire warm-up or review. All students stand. Teacher asks a question. Students raise hands. Teacher calls on one student. If the student answers correctly, they choose "Criss" (row) or "Cross" (column). Everyone in that row or column sits down. Last student standing wins. Works for any question-answer format: vocabulary, grammar, reading comprehension. Excellent for mixing review with movement — everyone is engaged because they want to sit down. Can play multiple rounds. Variant: students who are already seated can still participate by whispering to their row members.`,
    content_type: 'activity',
    name: "Criss Cross",
    activity_type: 'Warm-up',
    skill: 'Speaking',
    duration_minutes: 8,
    min_grade_numeric: 5,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'whole-class',
    materials: [],
    topic_tags: ['review', 'whole-class', 'no-prep', 'standing', 'Q&A']
  },

  {
    id: "activity-bomb-game",
    text: `Bomb Game (Hot Potato). Active whole-class game. One student holds a soft ball or object (the "bomb"). Music plays. Students pass the ball quickly around the class. When music stops, the student holding the bomb must answer a question or perform a task (say a target sentence, define a vocabulary word, etc.). If they answer correctly, they're safe. Wrong answer = "boom" (funny sound effect or just a point for the team). Keep the energy light — the forfeit should be funny, not embarrassing. Works for speaking practice, vocabulary review, or grammar drilling. Excellent filler activity.`,
    content_type: 'activity',
    name: "Bomb Game",
    activity_type: 'Main Game',
    skill: 'Speaking',
    duration_minutes: 12,
    min_grade_numeric: 3,
    max_grade_numeric: 6,
    complexity_max: 2,
    interaction: 'whole-class',
    materials: ['soft ball or object', 'music player'],
    topic_tags: ['active', 'speaking', 'fun', 'whole-class', 'music']
  },

  {
    id: "activity-gesture-game",
    text: `Gesture Game (Mime and Guess). One student comes to the front and mimes a vocabulary word or action. Class guesses in English: "Is it a [word]?" or just calls out the word. First correct guesser comes to the front next. Works for action verbs (swimming, cooking, sleeping), sports, jobs, animals, feelings. Completely no-prep, highly visual, inclusive for lower-level students since you can guess without complex language. Great for kinesthetic learners. Can be done in teams for competitive version — team that guesses correctly first gets a point.`,
    content_type: 'activity',
    name: "Gesture Game",
    activity_type: 'Warm-up',
    skill: 'Vocabulary',
    duration_minutes: 8,
    min_grade_numeric: 3,
    max_grade_numeric: 7,
    complexity_max: 2,
    interaction: 'whole-class',
    materials: [],
    topic_tags: ['mime', 'vocabulary', 'kinesthetic', 'no-prep', 'fun']
  },

  // ══════════════════════════════════════════
  // MAIN GAMES — VOCABULARY & LISTENING
  // ══════════════════════════════════════════

  {
    id: "activity-karuta",
    text: `Karuta. Japanese card-slapping vocabulary game adapted for English class. Spread vocabulary cards (picture or word side up, depending on task) face-up on the desk in a group of 4-6 students. Teacher reads a word, shows a picture, or says a sentence clue. Students race to slap the correct card first. Student who slaps correctly keeps the card. Most cards at the end wins. Can be played whole-class (cards on board, students at front) or small groups (cards on desks). Works with any vocabulary set: colours, animals, food, numbers, adjectives. Excellent for listening and rapid vocabulary recall. High engagement, very Japanese-familiar game context.`,
    content_type: 'activity',
    name: "Karuta",
    activity_type: 'Main Game',
    skill: 'Listening',
    duration_minutes: 15,
    min_grade_numeric: 3,
    max_grade_numeric: 8,
    complexity_max: 3,
    interaction: 'small-group',
    materials: ['flashcards (small, one set per group of 4-6)'],
    topic_tags: ['vocabulary', 'listening', 'competitive', 'Japanese-familiar', 'small-group']
  },

  {
    id: "activity-bingo",
    text: `Bingo. Classic listening and vocabulary game. Students draw or write vocabulary words in a 3x3 or 4x4 grid (they choose which words to place where). Teacher calls words one at a time. Students cross off words they hear. Line = "Bingo!" — student stands and reads their line back. Full card = "Blackout!" Highly flexible: can use pictures (for lower grades), words, numbers, or sentences. Run multiple rounds by clearing one line at a time. For speaking practice variant, students call words to a partner who marks their grid. Works for any unit with 9+ vocabulary items.`,
    content_type: 'activity',
    name: "Bingo",
    activity_type: 'Main Game',
    skill: 'Listening',
    duration_minutes: 20,
    min_grade_numeric: 3,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'individual',
    materials: ['blank bingo grid (printed or drawn)', 'vocabulary list'],
    topic_tags: ['vocabulary', 'listening', 'classic', 'flexible', 'quiet']
  },

  {
    id: "activity-4-corners",
    text: `Four Corners. Active whole-class game. Label the four corners of the classroom A, B, C, D (tape signs up). Teacher asks a multiple-choice question. Students run to the corner that matches their answer. Teacher reveals the correct answer — students in wrong corners sit out (or just compare and discuss, non-elimination). Works for: opinion questions (What's your favourite season? A=Spring B=Summer...), grammar choices (which sentence is correct?), vocabulary definition matching. High energy, gets students moving. Can be used as a quick check-for-understanding tool at the end of a lesson.`,
    content_type: 'activity',
    name: "Four Corners",
    activity_type: 'Main Game',
    skill: 'Listening',
    duration_minutes: 10,
    min_grade_numeric: 3,
    max_grade_numeric: 7,
    complexity_max: 3,
    interaction: 'whole-class',
    materials: ['4 corner signs (A, B, C, D)'],
    topic_tags: ['active', 'movement', 'multiple-choice', 'whole-class', 'fun']
  },

  // ══════════════════════════════════════════
  // SPEAKING / COMMUNICATION ACTIVITIES
  // ══════════════════════════════════════════

  {
    id: "activity-interview-game",
    text: `Interview Game (Sign Game / Walking Interview). Communication activity. Each student has a worksheet with a grid of questions or prompts. Students walk around the class asking one question per person (using the target language). If the friend answers "Yes" or gives the target answer, they sign (write their name) in that box. Goal: fill all boxes. Works for any yes/no question format: "Do you like...?", "Can you...?", "Have you ever...?", "Did you...?" Encourages students to interact with many classmates, not just their best friend. Teacher circulates and encourages. Run for 10-12 minutes then debrief as a class ("Who likes spicy food?").`,
    content_type: 'activity',
    name: "Interview Game",
    activity_type: 'Production',
    skill: 'Speaking',
    duration_minutes: 15,
    min_grade_numeric: 5,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'moving',
    materials: ['interview worksheet (one per student)'],
    topic_tags: ['speaking', 'communication', 'walking', 'pair-work', 'questions']
  },

  {
    id: "activity-find-someone-who",
    text: `Find Someone Who. Mingling speaking activity. Students have a grid with phrases like "Find someone who can play the guitar" / "Find someone who went abroad last year." Students walk around asking questions ("Can you play the guitar?" / "Did you go abroad last year?"). If the answer is yes, that person signs the box. First student to get all boxes signed wins, OR just run for 10 minutes. Works for Can, Do you like, Did you, Have you ever, Do you have, Are you. Forces natural repeated production of the target question structure. Debrief: "Who found someone who can play the guitar? What's their name?"`,
    content_type: 'activity',
    name: "Find Someone Who",
    activity_type: 'Production',
    skill: 'Speaking',
    duration_minutes: 15,
    min_grade_numeric: 6,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'moving',
    materials: ['grid worksheet'],
    topic_tags: ['speaking', 'mingling', 'questions', 'communication', 'moving']
  },

  {
    id: "activity-information-gap",
    text: `Information Gap. Pair communication activity. Student A has information that Student B is missing, and vice versa. They must ask each other questions using the target language to complete their worksheets. Classic example: A has a weekly schedule with some days blank, B has a different set of blanks — they ask "What does Kenji do on Monday?" to fill in the gaps. Works for any topic: schedules, maps, family descriptions, menus. Forces genuine communication because students cannot just show each other their papers. Excellent for practicing question forms and listening for specific information. Higher level activity — works best from JH 1st year upward.`,
    content_type: 'activity',
    name: "Information Gap",
    activity_type: 'Production',
    skill: 'Speaking',
    duration_minutes: 20,
    min_grade_numeric: 7,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'pair',
    materials: ['A/B worksheets (different versions)'],
    topic_tags: ['speaking', 'listening', 'pair-work', 'authentic', 'questions']
  },

  {
    id: "activity-fruit-basket",
    text: `Fruit Basket. High-energy whole-class speaking and listening game. Chairs arranged in a circle, one fewer than students. One student stands in the middle. That student makes a true statement about themselves using the target language (e.g., "I like summer!" or "I have a dog!"). Everyone for whom the statement is ALSO true must stand up and find a new chair. The person left standing goes to the middle. If the student in the middle says "Fruit Basket!" everyone must move. Works for preferences, abilities, experiences, physical descriptions. Wildly popular, very active. Works best with Grade 5 and up due to the communication requirement.`,
    content_type: 'activity',
    name: "Fruit Basket",
    activity_type: 'Main Game',
    skill: 'Speaking',
    duration_minutes: 20,
    min_grade_numeric: 5,
    max_grade_numeric: 8,
    complexity_max: 3,
    interaction: 'whole-class',
    materials: ['chairs in circle (need a clear space)'],
    topic_tags: ['active', 'speaking', 'listening', 'whole-class', 'high-energy']
  },

  {
    id: "activity-alibi-game",
    text: `Alibi Game. Advanced past-tense speaking activity. Two students are designated as "suspects" — they allegedly committed a crime (e.g., stole the teacher's coffee) at a specific time (e.g., between 6pm and 8pm last night). The suspects leave the room together and create a detailed shared alibi (where they were, what they ate, who they met, etc.). Meanwhile, the class prepares investigation questions using past tense: "Where did you go?", "What did you eat?", "Who were you with?", "What time did you arrive?" The suspects return separately and are questioned by the class. If their stories don't match, they're "guilty!" Highly engaging, hilarious, excellent for past tense production in JH 2nd-3rd year.`,
    content_type: 'activity',
    name: "Alibi Game",
    activity_type: 'Production',
    skill: 'Speaking',
    duration_minutes: 30,
    min_grade_numeric: 8,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'whole-class',
    materials: [],
    topic_tags: ['past-tense', 'speaking', 'role-play', 'advanced', 'fun']
  },

  // ══════════════════════════════════════════
  // PAIR / GROUP GAMES
  // ══════════════════════════════════════════

  {
    id: "activity-battleship",
    text: `Battleship (Grammar Battleship). Strategic pair speaking game adapted from the classic board game. Each student has an A/B grid. Students secretly mark their "ships" (usually 3-5 cells). They take turns "firing" at the opponent's grid by saying a complete target sentence corresponding to the coordinates (e.g., if Column = "I / He / She" and Row = "play soccer / study math / eat pizza", the student must say "She studies math" to target that cell). If the grammar is correct AND they hit a ship, it's a hit. Excellent for drilling grammar forms (third-person -s, question forms, passive voice) in a fun competitive context.`,
    content_type: 'activity',
    name: "Battleship",
    activity_type: 'Main Game',
    skill: 'Speaking',
    duration_minutes: 20,
    min_grade_numeric: 7,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'pair',
    materials: ['battleship grid worksheets (A and B versions)'],
    topic_tags: ['grammar', 'pair-work', 'strategic', 'sentences', 'competitive']
  },

  {
    id: "activity-snakes-and-ladders",
    text: `Snakes and Ladders (English Edition). Board game for small groups of 3-4 students. Students roll a die and move their piece. When landing on a square, they must say a target sentence, answer a question, or use a vocabulary word in context (question cards or board squares with prompts). If correct, they stay. Wrong answer, go back 2 spaces. Snakes and ladders apply normally. Works for any grammar or vocabulary point. Very popular with Grade 5-JH 1st year. Prep: print the board and write target sentences on question cards, or number squares that correspond to a question list. Students self-manage in groups.`,
    content_type: 'activity',
    name: "Snakes and Ladders",
    activity_type: 'Main Game',
    skill: 'Speaking',
    duration_minutes: 20,
    min_grade_numeric: 5,
    max_grade_numeric: 7,
    complexity_max: 3,
    interaction: 'small-group',
    materials: ['board game printout', 'dice', 'small tokens/erasers as pieces', 'question cards'],
    topic_tags: ['board-game', 'small-group', 'speaking', 'fun', 'self-managed']
  },

  {
    id: "activity-telepathy-game",
    text: `Telepathy Game. Fun pair or whole-class writing/speaking activity. Teacher asks a question with multiple valid answers (e.g., "Name a red food", "Name a sport you can play alone", "Name something in this classroom"). Students write their answer privately. Then reveal simultaneously. If a student's answer matches the teacher's chosen answer (or their partner's), they get a point! Funny, low-pressure, good for vocabulary brainstorming. Works well as a filler or warm-up. Variant: Teacher writes an answer, students try to "read the teacher's mind." Great for building vocabulary range — students are motivated to think of unique words.`,
    content_type: 'activity',
    name: "Telepathy Game",
    activity_type: 'Main Game',
    skill: 'Vocabulary',
    duration_minutes: 10,
    min_grade_numeric: 6,
    max_grade_numeric: 9,
    complexity_max: 3,
    interaction: 'pair',
    materials: ['small whiteboards or paper'],
    topic_tags: ['vocabulary', 'writing', 'fun', 'brainstorm', 'low-pressure']
  },

  // ══════════════════════════════════════════
  // WHOLE CLASS / TEAM REVIEW GAMES
  // ══════════════════════════════════════════

  {
    id: "activity-typhoon-game",
    text: `Typhoon Game. Team review game using a grid on the board. Draw a 4x5 or 5x6 grid on the blackboard. Assign point values to squares (100, 200, 300, 400, 500). Some squares hide "Typhoon" (opponent loses points) or "Sunshine" (bonus points). Teams alternate choosing a square. Teacher asks a question — the team answers to earn the square's points. The typhoon mechanic keeps losing teams engaged because they can still come back. Works for vocabulary, grammar, reading comprehension, or general knowledge about English-speaking countries. Extremely popular in Japanese schools.`,
    content_type: 'activity',
    name: "Typhoon Game",
    activity_type: 'Review',
    skill: 'Speaking',
    duration_minutes: 25,
    min_grade_numeric: 5,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'team',
    materials: ['grid drawn on blackboard', 'prepared questions', 'team score tracker'],
    topic_tags: ['review', 'team', 'competitive', 'high-energy', 'points']
  },

  {
    id: "activity-running-dictation",
    text: `Running Dictation. Active four-skills activity. Print target sentences or a short paragraph on paper. Tape copies to the wall outside the classroom or around the room. Students work in pairs: one "Runner" and one "Writer." The Runner goes to the wall, reads and memorises as much as possible, returns to their partner, and dictates what they read. The Writer writes it down. Then they swap roles. First pair to complete the full text wins. Excellent for reading, speaking, listening, and writing in one activity. Works best for JH students with target sentences from the unit dialogue.`,
    content_type: 'activity',
    name: "Running Dictation",
    activity_type: 'Production',
    skill: 'Speaking',
    duration_minutes: 20,
    min_grade_numeric: 7,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'pair',
    materials: ['sentences printed and taped to walls', 'answer paper'],
    topic_tags: ['four-skills', 'active', 'pair-work', 'reading', 'writing']
  },

  {
    id: "activity-broken-telephone",
    text: `Broken Telephone (Chinese Whispers). Classic quiet communication game. Students sit in rows or stand in a line. Teacher whispers a sentence to the last person in each row. That student whispers it to the next person, passing it forward. The first person says the final version aloud — class compares with the original. Funny because the sentence usually mutates by the end. Works for pronunciation focus, sentence structure, or just vocabulary. The communication failure is the fun part. Best for Grade 5+ who have enough phonics awareness to whisper meaningfully. Keep sentences short (5-8 words).`,
    content_type: 'activity',
    name: "Broken Telephone",
    activity_type: 'Main Game',
    skill: 'Listening',
    duration_minutes: 10,
    min_grade_numeric: 5,
    max_grade_numeric: 8,
    complexity_max: 3,
    interaction: 'team',
    materials: [],
    topic_tags: ['listening', 'pronunciation', 'fun', 'no-prep', 'team']
  },

  {
    id: "activity-jeopardy",
    text: `Jeopardy. Team review game. Draw a 5-column, 5-row grid on the board. Column headers are categories (Vocabulary, Grammar, Listening, Culture, Wildcard). Row values increase (100, 200, 300, 400, 500 points). Teams alternate selecting a category and value. Teacher asks the corresponding question. Team confers (30 seconds) and answers. Correct = earn points, Wrong = pass to another team. Daily Double: one hidden square doubles the bet. Works for end-of-unit review or exam prep. Requires preparation (20-25 questions), but the template is reusable. Teams of 4-5 students work well.`,
    content_type: 'activity',
    name: "Jeopardy",
    activity_type: 'Review',
    skill: 'Speaking',
    duration_minutes: 30,
    min_grade_numeric: 7,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'team',
    materials: ['grid on board', '25 prepared questions with answers', 'team score tracker'],
    topic_tags: ['review', 'team', 'quiz', 'prep-required', 'competitive']
  },

  {
    id: "activity-last-man-standing",
    text: `Last Man Standing. Fast vocabulary or review warm-up. All students stand. Teacher establishes a category (e.g., "Animals", "Things in a kitchen", "Past tense verbs"). Teacher points to a student — they must say a word in that category within 3 seconds. If correct, they stay standing and the next student goes. If wrong or too slow, they sit. Continue until one student is left standing. Keep it fun — sitting down is not shameful, just part of the game. Works for any vocabulary category and any level. Good for checking breadth of vocabulary knowledge.`,
    content_type: 'activity',
    name: "Last Man Standing",
    activity_type: 'Warm-up',
    skill: 'Vocabulary',
    duration_minutes: 7,
    min_grade_numeric: 5,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'whole-class',
    materials: [],
    topic_tags: ['vocabulary', 'review', 'fast-paced', 'no-prep', 'standing']
  },

  {
    id: "activity-line-game",
    text: `Line Game (True/False Jump). Simple physical true/false activity. Put tape on the floor or use an existing line. Left side = "True" / "Yes." Right side = "False" / "No." Teacher makes statements — students jump to the correct side. Works for vocabulary true/false ("A cat is a vegetable — True or False?"), grammar choices ("Is this sentence correct?"), or opinion ("Do you like summer? Jump!"). Very fast, zero prep, kinesthetic. Works best for Grade 3-5. Can be used as a quick check during the lesson without stopping momentum.`,
    content_type: 'activity',
    name: "Line Game",
    activity_type: 'Warm-up',
    skill: 'Listening',
    duration_minutes: 5,
    min_grade_numeric: 3,
    max_grade_numeric: 6,
    complexity_max: 2,
    interaction: 'whole-class',
    materials: ['tape or existing floor line'],
    topic_tags: ['true-false', 'active', 'listening', 'no-prep', 'kinesthetic']
  },

  {
    id: "activity-shiritori",
    text: `Shiritori (Word Chain). Japanese word chain game in English. First student says any English word (e.g., "Apple"). Next student must say a word starting with the last letter of the previous word (e.g., "Elephant"). Continue around the class. Students who can't think of a word within 5 seconds are out (or just pass). The last letter rule can be adjusted (last 2 letters, or just last letter). Works as a vocabulary warm-up or filler. Students love the familiar Japanese game format in an English context. Works best from Grade 5 up where vocabulary is wide enough.`,
    content_type: 'activity',
    name: "Shiritori",
    activity_type: 'Warm-up',
    skill: 'Vocabulary',
    duration_minutes: 7,
    min_grade_numeric: 5,
    max_grade_numeric: 9,
    complexity_max: 3,
    interaction: 'whole-class',
    materials: [],
    topic_tags: ['vocabulary', 'spelling', 'Japanese-familiar', 'no-prep', 'warm-up']
  },

  {
    id: "activity-pictionary",
    text: `Pictionary (Draw and Guess). Visual vocabulary game. One student comes to the board and draws a picture of a vocabulary word (no letters or numbers allowed). Classmates guess in English. First correct guess earns a point for their team. Student at the board can be from the guessing team or a neutral drawer. Works for nouns (animals, food, objects), verbs (actions when drawn as stick figures in motion), adjectives (emotions drawn as faces). Quick rounds (60 seconds each) keep energy high. Universally popular, works from Grade 3 through JH. No preparation needed beyond a word list.`,
    content_type: 'activity',
    name: "Pictionary",
    activity_type: 'Main Game',
    skill: 'Vocabulary',
    duration_minutes: 15,
    min_grade_numeric: 3,
    max_grade_numeric: 8,
    complexity_max: 3,
    interaction: 'team',
    materials: ['blackboard', 'chalk or marker', 'word list'],
    topic_tags: ['vocabulary', 'drawing', 'visual', 'team', 'fun']
  },

  {
    id: "activity-three-hints-quiz",
    text: `Three Hints Quiz. Listening comprehension and vocabulary deduction game. Teacher gives 3 clues about a mystery word or concept, one at a time, pausing after each: "Hint 1: It's a fruit. Hint 2: It's yellow. Hint 3: Monkeys love it. What is it?" Students write their guess (or raise hands) after each hint. Earlier correct answers earn more points. Works for vocabulary, countries, animals, foods, famous people. Great for listening focus — students are hanging on every word. Can be student-led: students prepare their own three-hint riddles about vocabulary words for a partner.`,
    content_type: 'activity',
    name: "Three Hints Quiz",
    activity_type: 'Main Game',
    skill: 'Listening',
    duration_minutes: 15,
    min_grade_numeric: 5,
    max_grade_numeric: 9,
    complexity_max: 3,
    interaction: 'whole-class',
    materials: ['prepared hint lists (or improvised)'],
    topic_tags: ['listening', 'deduction', 'vocabulary', 'thinking', 'quiz']
  },

  {
    id: "activity-memory-chain",
    text: `Memory Chain. Cumulative speaking memory game. Student 1 says a sentence: "I went to the market." Student 2 repeats and adds: "I went to the market and bought an apple." Student 3 adds more. Continue around the class — each student must repeat everything before and add one item. Works for past tense ("I went... and I ate... and I saw..."), present perfect ("I have visited... and I have eaten..."), shopping/list contexts. Students must listen carefully and remember. Gets very funny as the chain grows. Good for Grade 6 and JH — requires enough vocabulary and memory to keep it going.`,
    content_type: 'activity',
    name: "Memory Chain",
    activity_type: 'Warm-up',
    skill: 'Speaking',
    duration_minutes: 10,
    min_grade_numeric: 6,
    max_grade_numeric: 9,
    complexity_max: 3,
    interaction: 'whole-class',
    materials: [],
    topic_tags: ['memory', 'speaking', 'cumulative', 'no-prep', 'listening']
  },

  {
    id: "activity-cockroach-game",
    text: `Cockroach Game (Gokiburi Game). High-energy elementary vocabulary game. Teacher designates one word in a vocabulary set as the "cockroach word." Teacher reads vocabulary words one by one in a rhythm. Students repeat each word after the teacher (choral). When the cockroach word is said, students scream and "run" (in place or actually move, depending on space). Hilarious reaction game that keeps students alert and focused on every word. Works for any vocabulary set — colours, animals, food, numbers. The surprise element is the key. Very popular with Grade 3-4. Usually played 2-3 times with different cockroach words.`,
    content_type: 'activity',
    name: "Cockroach Game",
    activity_type: 'Warm-up',
    skill: 'Listening',
    duration_minutes: 7,
    min_grade_numeric: 3,
    max_grade_numeric: 5,
    complexity_max: 1,
    interaction: 'whole-class',
    materials: [],
    topic_tags: ['listening', 'vocabulary', 'fun', 'active', 'elementary', 'no-prep']
  },

  {
    id: "activity-go-fish",
    text: `Go Fish. Classic card game adapted for English vocabulary or grammar. Students play in groups of 3-4 with a deck of vocabulary or grammar cards (pairs). Players deal 5 cards each, rest go in a pile. On your turn, ask a player: "Do you have a [word]?" If yes, they hand it over and you get a point. If no, they say "Go Fish!" and you draw from the pile. Pairs of matching cards are placed face-up and scored. Most pairs wins. Works for: vocabulary pairs (word + picture), grammar pairs (question + answer), or irregular verb pairs (base + past). Good for Grade 5 through JH 1st year.`,
    content_type: 'activity',
    name: "Go Fish",
    activity_type: 'Main Game',
    skill: 'Speaking',
    duration_minutes: 15,
    min_grade_numeric: 5,
    max_grade_numeric: 7,
    complexity_max: 3,
    interaction: 'small-group',
    materials: ['card decks (one set per group of 3-4)'],
    topic_tags: ['card-game', 'small-group', 'speaking', 'vocabulary', 'classic']
  },

  // ══════════════════════════════════════════
  // ADDITIONAL ACTIVITIES — RESEARCHED SET
  // ══════════════════════════════════════════

  {
    id: "activity-hot-seat",
    text: `Hot Seat. Speaking and vocabulary activity. One student sits in the "hot seat" facing the class, with their back to the board. Teacher or another student writes a vocabulary word on the board behind the seated student. The class gives clues in English ("It's a fruit. It's yellow. Monkeys love it."). The student in the hot seat guesses ("Is it a banana?"). Correct guess scores a point for their team, and another student takes the hot seat. Variant: student in the hot seat is a "character" (historical figure, fictional character) and the class asks yes/no questions. Excellent for JH students practising question formation and description. Works for any vocabulary set — especially effective with people, jobs, animals, and adjectives. High-engagement, develops descriptive language rapidly. Keep rounds to 60 seconds to maintain pace.`,
    content_type: 'activity',
    name: "Hot Seat",
    activity_type: 'Main Game',
    skill: 'Speaking',
    duration_minutes: 15,
    min_grade_numeric: 6,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'whole-class',
    materials: ['blackboard', 'vocabulary word list'],
    topic_tags: ['vocabulary', 'description', 'guessing', 'team', 'speaking']
  },

  {
    id: "activity-20-questions",
    text: `20 Questions. Classic guessing game for vocabulary and question formation. One student thinks of a person, animal, place, or thing (or draws a card). The class asks yes/no questions to figure out what it is — maximum 20 questions. Students must use question forms: "Is it an animal?", "Can it fly?", "Is it bigger than a cat?", "Do people eat it?", "Is it famous?" The student answers only "Yes" or "No." First student to guess correctly takes the next turn. Excellent for practicing question formation with a natural communicative purpose. Works from Grade 5 up. For lower levels, restrict the category (animals only, food only). For JH students, allow any category and encourage more complex yes/no questions ("Is it made of metal?", "Did it exist 100 years ago?"). Develops deductive reasoning in English.`,
    content_type: 'activity',
    name: "20 Questions",
    activity_type: 'Main Game',
    skill: 'Speaking',
    duration_minutes: 15,
    min_grade_numeric: 5,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'whole-class',
    materials: ['category cards (optional)'],
    topic_tags: ['questioning', 'deduction', 'vocabulary', 'speaking', 'no-prep']
  },

  {
    id: "activity-word-sort",
    text: `Word Sort. Vocabulary categorisation activity. Prepare a set of vocabulary cards or words on the board. Students work in pairs or small groups to sort the words into categories (teacher-given or student-created). Example: sort food into "breakfast foods / dinner foods / snacks" or sort adjectives into "positive / negative." After sorting, groups share and compare — different groups may categorise words differently, leading to genuine discussion in English. For higher levels, ask students to create their own categories. Works as a vocabulary review after a unit, or as a pre-teaching activity before new vocabulary. Very flexible — the words can come from any unit, the categories can be factual or opinion-based. No need for a worksheet — just cards on a desk.`,
    content_type: 'activity',
    name: "Word Sort",
    activity_type: 'Review',
    skill: 'Vocabulary',
    duration_minutes: 12,
    min_grade_numeric: 5,
    max_grade_numeric: 9,
    complexity_max: 3,
    interaction: 'small-group',
    materials: ['vocabulary cards or word strips', 'flat desk space'],
    topic_tags: ['vocabulary', 'categorisation', 'review', 'thinking', 'pair-work']
  },

  {
    id: "activity-sentence-auction",
    text: `Sentence Auction. Grammar review game that sparks genuine analysis. Prepare 10-15 sentences — some correct, some with deliberate grammar errors. Each group starts with a budget of "money" (e.g., 1000 points). Display sentences one at a time. Groups decide privately: is this sentence correct or wrong? They bid their points on sentences they think are correct. After all sentences are auctioned, reveal the correct vs. incorrect ones. Groups who bid on correct sentences keep their money — bidding on wrong ones loses money. The group with the most money wins. Produces excellent grammar discussion as students argue about whether a sentence is right before bidding. Works for any grammar point: third-person -s, passive voice, irregular past tense, articles. JH 2nd and 3rd year students engage most deeply.`,
    content_type: 'activity',
    name: "Sentence Auction",
    activity_type: 'Review',
    skill: 'Speaking',
    duration_minutes: 25,
    min_grade_numeric: 8,
    max_grade_numeric: 9,
    complexity_max: 5,
    interaction: 'team',
    materials: ['sentence cards (correct + incorrect)', 'fake money or point tokens', 'team score sheets'],
    topic_tags: ['grammar', 'review', 'critical-thinking', 'team', 'high-level']
  },

  {
    id: "activity-vocabulary-relay",
    text: `Vocabulary Relay. High-energy team writing race. Teams of 4-6 students line up at the board or at their desks. Teacher calls a category (e.g., "Sports!", "Animals!", "Things in a kitchen!"). Team members take turns running to the board and writing one word from that category. Each student writes one word, passes the marker (or sits down), and the next person goes. First team to write 10 correct words wins the round. Variation: students must also write the article ("a lion", "an apple") for bonus points. Eliminates repeated words — students cross out their team's previous words to avoid repetition. Encourages everyone to participate (not just the strongest student). Works for vocabulary review at any level. Grade 3-6 loves the physical running element; JH students can compete on more challenging categories (irregular past tense forms, synonyms for "good").`,
    content_type: 'activity',
    name: "Vocabulary Relay",
    activity_type: 'Review',
    skill: 'Vocabulary',
    duration_minutes: 12,
    min_grade_numeric: 4,
    max_grade_numeric: 9,
    complexity_max: 3,
    interaction: 'team',
    materials: ['blackboard', 'chalk/markers (one per team)'],
    topic_tags: ['vocabulary', 'team', 'active', 'writing', 'review', 'race']
  },

  {
    id: "activity-around-the-world",
    text: `Around the World. Classic competitive whole-class game. One student stands next to a seated student — they compete head-to-head. Teacher shows a flashcard or asks a question. First student to say the correct answer correctly moves on to challenge the next seated student. The moving student "travels around the world" by beating every student in the class in a row. If the seated student wins, they stand up and the standing student sits. Goal: make it all the way around the class without losing. Works perfectly for rapid-fire vocabulary recall, number recognition, multiplication tables in English (Grade 3-4), or irregular verb pairs (JH). The competitive element sharpens listening and response speed. Keep the pace fast — 3-second rule for each challenge. Students who are eliminated watch and root for their friends.`,
    content_type: 'activity',
    name: "Around the World",
    activity_type: 'Main Game',
    skill: 'Listening',
    duration_minutes: 10,
    min_grade_numeric: 3,
    max_grade_numeric: 7,
    complexity_max: 3,
    interaction: 'whole-class',
    materials: ['flashcards or prepared questions'],
    topic_tags: ['vocabulary', 'listening', 'competitive', 'fast-paced', 'whole-class']
  },

  {
    id: "activity-role-play-cards",
    text: `Role Play Cards. Structured speaking activity using scenario cards. Students receive a role card describing a character (who they are, their situation, their goal) and interact with a partner who has a different card. Example scenarios: hotel check-in, asking for directions, shopping, visiting a doctor, ordering food at a restaurant. Students must communicate in English to complete the transaction. For JH students: add information gaps — Student A knows something Student B needs (a price, a room number, a time). This makes communication genuine. Works best when students have had language input for the scenario (e.g., after teaching direction vocabulary → directions role play). Debrief: groups share how the conversation went, what was difficult, what they would say differently.`,
    content_type: 'activity',
    name: "Role Play Cards",
    activity_type: 'Production',
    skill: 'Speaking',
    duration_minutes: 20,
    min_grade_numeric: 7,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'pair',
    materials: ['role card sets (A and B versions)', 'optional: props or realia'],
    topic_tags: ['role-play', 'speaking', 'real-world', 'production', 'scenario']
  },

  {
    id: "activity-chain-story",
    text: `Chain Story. Creative collaborative speaking activity. Teacher starts a story with one or two sentences: "One day, a student named Taro found a mysterious box in the park." The next student adds one sentence to continue the story ("He opened the box and found..."). The next student continues. The story passes around the class or group, each student adding one sentence. The final student must bring the story to a conclusion. Works as a speaking warm-up or filler. For lower grades: use sentence starters as prompts ("Then...", "Suddenly...", "But...", "Finally..."). For higher grades: require the use of target grammar (e.g., each sentence must include a past tense verb, or a relative clause). Laughter and unexpected story directions are the fun. Keep the pace moving — students only have 10-15 seconds to add their contribution.`,
    content_type: 'activity',
    name: "Chain Story",
    activity_type: 'Warm-up',
    skill: 'Speaking',
    duration_minutes: 10,
    min_grade_numeric: 6,
    max_grade_numeric: 9,
    complexity_max: 3,
    interaction: 'whole-class',
    materials: ['optional: sentence starter prompts'],
    topic_tags: ['story', 'speaking', 'creative', 'collaborative', 'warm-up']
  },

  {
    id: "activity-noughts-and-crosses",
    text: `Noughts and Crosses (Tic-Tac-Toe English). Grammar and vocabulary team game using a 3x3 grid. Draw a tic-tac-toe grid on the board. Fill each of the 9 squares with a vocabulary word, grammar prompt, or sentence starter. Two teams (O team vs. X team) alternate choosing a square. To claim the square, the team must correctly use the word in a sentence, answer the grammar question, or complete the prompt. Correct answer = mark the square with O or X. Get three in a row to win. Simple to set up, familiar game format that students love. Works for any target language: vocabulary in a sentence, conjugating verbs, making questions, defining words. Run 2-3 rounds with different content. Fast, flexible, reusable format.`,
    content_type: 'activity',
    name: "Noughts and Crosses (Tic-Tac-Toe)",
    activity_type: 'Review',
    skill: 'Speaking',
    duration_minutes: 12,
    min_grade_numeric: 5,
    max_grade_numeric: 9,
    complexity_max: 3,
    interaction: 'team',
    materials: ['3x3 grid on blackboard', 'vocabulary or grammar prompts'],
    topic_tags: ['vocabulary', 'grammar', 'team', 'game', 'review']
  },

  {
    id: "activity-back-to-back-drawing",
    text: `Back to Back Drawing. Communication activity for descriptions and spatial language. Students sit back-to-back in pairs. Student A has a picture (simple image of shapes, a scene, or a map). Student B has a blank paper and a pencil. Student A describes the picture in English; Student B draws what they hear. They may not look at each other's papers. After 3-5 minutes, they compare. The closer the drawing matches the original, the better the communication. Works for: prepositions of place (there is a circle next to the square), scene descriptions (there is a dog under the table), maps (the park is north of the station). Produces genuine communicative need — Student A must describe clearly. Works well from JH 1st year up. Debrief: What was hard to describe? What words did you need?`,
    content_type: 'activity',
    name: "Back to Back Drawing",
    activity_type: 'Production',
    skill: 'Speaking',
    duration_minutes: 15,
    min_grade_numeric: 7,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'pair',
    materials: ['picture cards for Student A', 'blank paper for Student B', 'pencils'],
    topic_tags: ['descriptions', 'prepositions', 'pair-work', 'listening', 'communication']
  },

  {
    id: "activity-speed-dating",
    text: `Speed Dating / Speed Conversation. High-volume speaking practice. Students sit in two rows facing each other (or in two concentric circles). Teacher sets a timer for 60-90 seconds. Students have a conversation with the person across from them using target questions and answers. When time is up, one row shifts one seat. New conversation begins. Students speak to 8-12 different partners in 15 minutes. Works for any interview-style topic: preferences, daily routine, weekend activities, future plans, opinions. The movement and variety maintain energy. Students get many opportunities to practice the same language in slightly different conversations, building fluency. The quick switch prevents boredom with the same partner. Very effective for conversation fluency practice in JH 1st and 2nd year.`,
    content_type: 'activity',
    name: "Speed Dating (Speed Conversation)",
    activity_type: 'Production',
    skill: 'Speaking',
    duration_minutes: 20,
    min_grade_numeric: 7,
    max_grade_numeric: 9,
    complexity_max: 3,
    interaction: 'pair',
    materials: ['chairs in two rows or circles', 'optional: question prompt card'],
    topic_tags: ['speaking', 'fluency', 'interview', 'moving', 'conversation']
  },

  {
    id: "activity-quiz-quiz-trade",
    text: `Quiz-Quiz-Trade (Q&A Card Swap). Structured pair communication activity. Each student receives a card with a question on one side and the answer on the other. Students walk around and pair up. Student A asks Student B their question. Student B tries to answer. Student A checks with their answer. Then B asks A. After both Q&A turns, they swap cards and find a new partner. Repeat. Students continually practice asking and answering, and each round they have a new question to ask. Works for vocabulary definitions, grammar questions, country facts, irregular verbs. Zero-management once students understand the format — they self-direct. Very high speaking volume — every student is speaking every minute. Works best for Grade 6 through JH.`,
    content_type: 'activity',
    name: "Quiz-Quiz-Trade",
    activity_type: 'Main Game',
    skill: 'Speaking',
    duration_minutes: 15,
    min_grade_numeric: 6,
    max_grade_numeric: 9,
    complexity_max: 3,
    interaction: 'moving',
    materials: ['Q&A cards (one per student, different questions)'],
    topic_tags: ['speaking', 'vocabulary', 'moving', 'self-directed', 'Q&A']
  },

  {
    id: "activity-snowball-fight",
    text: `Snowball Fight. Active writing and speaking activity. Students write a sentence on a piece of paper about the target language (e.g., "My favorite food is ramen because it is delicious."). They crumple it into a "snowball." On the teacher's signal, students throw their snowballs around the room for 20-30 seconds. Teacher signals stop — everyone picks up the nearest snowball and uncrumples it. Students read the sentence silently, then find the person who wrote it by asking "Did you write this?" / "Is this yours?" When they find the author, they ask 1-2 follow-up questions. Combines writing, reading, movement, and speaking. Great for reviewing past tense or any topic where students write personal sentences. Very popular in Japan — uniquely fun format.`,
    content_type: 'activity',
    name: "Snowball Fight",
    activity_type: 'Production',
    skill: 'Speaking',
    duration_minutes: 20,
    min_grade_numeric: 6,
    max_grade_numeric: 9,
    complexity_max: 3,
    interaction: 'moving',
    materials: ['paper (one sheet per student)', 'pens'],
    topic_tags: ['writing', 'speaking', 'active', 'reading', 'movement']
  },

  {
    id: "activity-guess-who",
    text: `Guess Who (Mystery Person). Deduction and description game. Teacher prepares cards with names and descriptions of people (real classmates, famous people, or fictional characters). One student picks a card and gives clues without naming the person: "This person is tall. This person likes reading. This person can play the guitar. This person is in the English club." Class guesses. Alternatively: student secretly picks a classmate in the room, class asks yes/no questions ("Is it a boy? Does the person sit near the window? Does the person have short hair?"). Excellent for physical description vocabulary and question forms. Sensitive note: ensure physical descriptions stay positive or neutral — never embarrassing. Works for all ages from Grade 4 up. Can be played in teams.`,
    content_type: 'activity',
    name: "Guess Who",
    activity_type: 'Main Game',
    skill: 'Speaking',
    duration_minutes: 12,
    min_grade_numeric: 4,
    max_grade_numeric: 8,
    complexity_max: 3,
    interaction: 'whole-class',
    materials: ['mystery person cards (optional)'],
    topic_tags: ['descriptions', 'questioning', 'deduction', 'speaking', 'vocabulary']
  },

  {
    id: "activity-class-survey-graph",
    text: `Class Survey and Graph. Four-skills integrated data collection activity. Students are given a survey question to research (e.g., "What sport do you play?", "How do you come to school?", "What did you eat for breakfast?"). They walk around the class asking classmates using the target question form. They tally responses on their worksheet. After data collection (8-10 minutes), they return to seats and create a bar graph or chart. Then they write or say 3 sentences about the results: "Ten students play soccer. Only two students play tennis. Most students come to school by bicycle." This activity develops all four skills AND number/data vocabulary. Excellent for Grade 5 through JH. The data is always different because it's about the real class — results are always authentic and interesting to report.`,
    content_type: 'activity',
    name: "Class Survey and Graph",
    activity_type: 'Production',
    skill: 'Speaking',
    duration_minutes: 25,
    min_grade_numeric: 5,
    max_grade_numeric: 9,
    complexity_max: 3,
    interaction: 'moving',
    materials: ['survey worksheet', 'graph template or blank paper'],
    topic_tags: ['survey', 'data', 'speaking', 'writing', 'four-skills', 'authentic']
  },

  {
    id: "activity-mystery-bag",
    text: `Mystery Bag (Feel and Describe). Sensory description activity. Place 5-8 small objects inside a cloth bag or box with a hole just big enough for a hand. Students take turns reaching in (without looking), feeling an object, and describing it in English: "It's hard. It's smooth. It's small and round. I think it's a coin!" Classmates guess based on the description. Works for: adjectives (hard/soft/rough/smooth/heavy/light/round/flat), "It could be a..." (possibility language), comparatives ("It feels bigger than a pencil"). Very tactile and memorable. Grade 3-6 students love the sensory surprise element. For JH, extend to longer descriptions and more specific adjective vocabulary. Completely reusable with different objects each time.`,
    content_type: 'activity',
    name: "Mystery Bag",
    activity_type: 'Warm-up',
    skill: 'Speaking',
    duration_minutes: 10,
    min_grade_numeric: 3,
    max_grade_numeric: 7,
    complexity_max: 2,
    interaction: 'whole-class',
    materials: ['cloth bag or box with hole', '5-8 small objects (eraser, coin, pencil, toy, etc.)'],
    topic_tags: ['adjectives', 'descriptions', 'sensory', 'vocabulary', 'guessing']
  },

  {
    id: "activity-opinion-line",
    text: `Opinion Line (Value Line / Agree-Disagree Spectrum). Physical opinion expression activity. Designate one wall as "Strongly Agree" and the opposite wall as "Strongly Disagree." Teacher reads a statement (e.g., "School uniforms are a good idea." / "Summer is better than winter." / "English is important."). Students move to the position on the line that represents their opinion — not just two choices but a full spectrum. Teacher asks students at different points: "Why did you stand there?" Students explain their position using "I think... because..." Forces commitment to a position AND explanation. Excellent for opinion language (JH 2nd-3rd year). Can follow up with a partner discussion ("Find someone who stands far away from you and discuss your different opinions").`,
    content_type: 'activity',
    name: "Opinion Line",
    activity_type: 'Production',
    skill: 'Speaking',
    duration_minutes: 15,
    min_grade_numeric: 8,
    max_grade_numeric: 9,
    complexity_max: 4,
    interaction: 'whole-class',
    materials: ['two wall signs (Strongly Agree / Strongly Disagree)', 'prepared opinion statements'],
    topic_tags: ['opinions', 'debate', 'movement', 'critical-thinking', 'speaking']
  },
];
