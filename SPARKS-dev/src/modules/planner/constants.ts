// src/constants.ts

import { ActivityIdea, ManualPlanState } from './types';

export const TEXTBOOKS = {
  Elementary: [
    "Let's Try! 1 (Grade 3)", "Let's Try! 2 (Grade 4)",
    "We Can! 1 (Grade 5)", "We Can! 2 (Grade 6)",
    "New Horizon Elementary 5", "New Horizon Elementary 6",
    "Here We Go! 5", "Here We Go! 6",
    "Crown Jr. 5", "Crown Jr. 6",
    "Blue Sky Elementary 5", "Blue Sky Elementary 6",
    "Junior Sunshine 5", "Junior Sunshine 6"
  ],
  JuniorHigh: [
    "New Horizon 1", "New Horizon 2", "New Horizon 3",
    "Sunshine 1", "Sunshine 2", "Sunshine 3",
    "Here We Go! 1", "Here We Go! 2", "Here We Go! 3",
    "One World 1", "One World 2", "One World 3",
    "New Crown 1", "New Crown 2", "New Crown 3",
    "Blue Sky 1", "Blue Sky 2", "Blue Sky 3"
  ]
};

export const PEDAGOGICAL_TIPS: Record<string, string[]> = {
  "Grade 3": [
    "Focus on oral communication and familiarization with English sounds.",
    "Avoidance of the copula (be-verb) where possible (e.g., 'Hint, please' instead of 'Please give me a hint').",
    "Focus on uppercase letters only in the first half of the year.",
    "Small Talk: Keep it to 1-2 minute exchanges with simple reactions."
  ],
  "Grade 4": [
    "Introduction of lowercase letters.",
    "Expressing preferences and daily routines simply.",
    "Focus on 'Do you have...?' and 'Do you like...?' without complex grammar explanations."
  ],
  "Grade 5": [
    "The 'Small Talk' focus: Encourage students to ask follow-up questions.",
    "Spiral Curriculum: Revisit topics like 'Can' and 'Like' with more variety (e.g., baking bread, school subjects).",
    "Focus on 'want to' for future goals and 'went/ate/saw' for past memories.",
    "Performance Assessment: Encourage 3+ turn exchanges in roleplays."
  ],
  "Grade 6": [
    "The 'Small Talk' focus: Encourage students to ask follow-up questions.",
    "Spiral Curriculum: Revisit topics like 'Can' and 'Like' with more variety (e.g., baking bread, school subjects).",
    "Focus on 'want to' for future goals and 'went/ate/saw' for past memories.",
    "Performance Assessment: Encourage 3+ turn exchanges in roleplays."
  ],
  "1st Year": [
    "Unit 0: Rapid review of ES vocabulary and phrases.",
    "Formalization of grammar: Explicitly teach be-verbs and third person singular 's'.",
    "Balanced approach: Maintain communicative flow while introducing accurate writing."
  ]
};

// Real Database for Textbook Units
export const TEXTBOOK_UNITS: Record<string, { number: number; title: string; target: string; vocabulary?: string[] }[]> = {
  // --- ELEMENTARY SCHOOL ---
  "Let's Try! 1 (Grade 3)": [
    { number: 1, title: "Hello!", target: "Hello. I'm (Name). Nice to meet you.", vocabulary: ["Hello", "Hi", "Good morning", "Good afternoon", "Good evening", "Goodbye", "See you"] },
    { number: 2, title: "How are you?", target: "How are you? I'm (fine/happy/good/sleepy/hungry/tired/sad/great).", vocabulary: ["fine", "happy", "good", "sleepy", "hungry", "tired", "sad", "great"] },
    { number: 3, title: "How many?", target: "How many (apples)? One, two, three... (Numbers 1-20).", vocabulary: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "ruler", "eraser"] },
    { number: 4, title: "I like blue.", target: "Do you like (blue)? Yes, I do. / No, I don't. I like (red).", vocabulary: ["red", "blue", "green", "yellow", "pink", "orange", "purple", "black", "white", "rainbow"] },
    { number: 5, title: "What do you like?", target: "What do you like? I like (blue/soccer).", vocabulary: ["peach", "melon", "banana", "soccer", "baseball"] },
    { number: 6, title: "ALPHABET", target: "Letter Recognition (Uppercase A-Z). What's this?" },
    { number: 7, title: "This is for you.", target: "This is for you. Thank you. What's this? It's a (card).", vocabulary: ["circle", "triangle", "square", "star", "heart", "card"] },
    { number: 8, title: "Who are you?", target: "Who are you? I am a (lion). Are you a (rabbit)?", vocabulary: ["lion", "tiger", "rabbit", "snake", "cow", "horse", "wolf"] },
    { number: 9, title: "What's this?", target: "What's this? Hint, please. It's a (fruit). Review." },
  ],
  "Let's Try! 2 (Grade 4)": [
    { number: 1, title: "Hello, world!", target: "Hello. I am (Name). I like (origami). Greetings from around the world.", vocabulary: ["Japan", "USA", "Korea", "Brazil", "Australia"] },
    { number: 2, title: "Let's play cards.", target: "How's the weather? It's (sunny). Let's play (tag).", vocabulary: ["sunny", "rainy", "cloudy", "snowy", "tag", "cards", "hide-and-seek"] },
    { number: 3, title: "I like Mondays.", target: "What day is it? It's (Monday). I like (lunch time/math).", vocabulary: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "math", "PE"] },
    { number: 4, title: "What time is it?", target: "What time is it? It's (7) o'clock. It's (snack) time.", vocabulary: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "wake up", "lunch", "sleep"] },
    { number: 5, title: "Do you have a pen?", target: "Do you have a (pen)? Yes, I do / No, I don't.", vocabulary: ["pen", "eraser", "ruler", "pencil case"] },
    { number: 6, title: "Alphabet", target: "Small letters a-z. Do you have a 'j'?" },
    { number: 7, title: "What do you want?", target: "What do you want? I want a (peach), please. Here you are.", vocabulary: ["pizza", "parfait", "peach", "melon", "grape", "pineapple"] },
    { number: 8, title: "This is my favorite place.", target: "Go straight. Turn right/left. This is the (library).", vocabulary: ["library", "gym", "nurse's office", "school", "station", "straight", "right", "left"] },
    { number: 9, title: "This is my day.", target: "I (get up) at (6:00). I (go to school).", vocabulary: ["wash face", "brush teeth", "put on clothes", "get up", "go to school"] },
  ],
  "We Can! 1 (Grade 5)": [
    { number: 1, title: "Hello, everyone.", target: "Name, spellings, birthday, favorites. 'Call me ...'" },
    { number: 2, title: "When is your birthday?", target: "When is your birthday? It's (May 5th). Dates." },
    { number: 3, title: "What do you want to study?", target: "I want to study (math). Subjects." },
    { number: 4, title: "He can bake bread.", target: "He/She can (cook). Can you (swim)?" },
    { number: 5, title: "Where is the post office?", target: "Turn right. Go straight. It's by the (bank)." },
    { number: 6, title: "What would you like?", target: "What would you like? I'd like (pizza). Restaurant ordering." },
    { number: 7, title: "Welcome to Japan.", target: "Seasons and culture. We have (beautiful mountains)." },
    { number: 8, title: "Who is your hero?", target: "He/She is (good at soccer)." },
  ],
  "We Can! 2 (Grade 6)": [
    { number: 1, title: "This is me!", target: "Self-introduction. I like ... I can ... I want to be ..." },
    { number: 2, title: "Welcome to Japan.", target: "Why do you like (Japan)? We have (hot springs)." },
    { number: 3, title: "Let's go to Italy.", target: "Where do you want to go? I want to go to (Italy). To eat (pizza)." },
    { number: 4, title: "Summer Vacations", target: "Past tense. I (went) to (the beach). It was (fun)." },
    { number: 5, title: "My Best Memory", target: "My best memory is (the sports day)." },
    { number: 6, title: "What do you want to be?", target: "What do you want to be? I want to be a (vet)." },
    { number: 7, title: "Junior High School Life", target: "What club do you want to join? I want to join the (tennis) team." },
  ],
  "New Horizon Elementary 5": [
    { number: 1, title: "Hello, Everyone", target: "I like (baseball). I have (a dog).", vocabulary: ["baseball", "soccer", "dog", "cat"] },
    { number: 2, title: "When is your birthday?", target: "My birthday is (June 1st). When is your birthday?", vocabulary: ["June", "first", "second", "third", "birthday"] },
    { number: 3, title: "What do you want to study?", target: "I want to study (math). School subjects.", vocabulary: ["math", "science", "English", "social studies"] },
    { number: 4, title: "He can bake bread", target: "He/She can (swim). Can you (play the piano)?", vocabulary: ["run", "jump", "swim", "cook", "sing", "dance", "piano", "guitar", "bake", "bread"] },
    { number: 5, title: "Where is the post office?", target: "Go straight. Turn right. It's on your left.", vocabulary: ["station", "hospital", "supermarket", "park", "bookstore", "school", "post office"] },
    { number: 6, title: "What would you like?", target: "Ordering food. I'd like a (hot dog). How much is it?", vocabulary: ["pizza", "hamburger", "salad", "soup", "steak", "rice", "bread", "cake", "hot dog", "curry and rice"] },
    { number: 7, title: "Welcome to Japan", target: "You can (see Mt. Fuji). Situational can.", vocabulary: ["spring", "summer", "winter", "autumn", "sushi", "tempura", "Mt. Fuji"] },
    { number: 8, title: "Who is your hero?", target: "Describing people. He is (strong/kind). (3rd person pronouns focus)", vocabulary: ["strong", "brave", "kind", "cool", "active", "smart", "hero", "He", "She"] },
  ],
  "New Horizon Elementary 6": [
    { number: 1, title: "This is me", target: "Self-introduction details. My treasure is...", vocabulary: ["treasure", "birthday", "from"] },
    { number: 2, title: "Welcome to Japan", target: "Introducing Japan/Culture. Performance task: Guide.", vocabulary: ["shrine", "temple", "guide"] },
    { number: 3, title: "Let's go to Italy", target: "I want to go to (Italy). I want to see (the Colosseum).", vocabulary: ["Italy", "France", "China", "Colosseum", "want to"] },
    { number: 4, title: "Summer Vacations", target: "I went to (the beach). I enjoyed (fishing). Past tense.", vocabulary: ["went", "ate", "saw", "did", "enjoyed", "played", "summer vacation"] },
    { number: 5, title: "He is famous", target: "Biographies. He is a (musician). 3rd person practice.", vocabulary: ["famous", "musician", "scientist", "actor"] },
    { number: 6, title: "What do you want to join?", target: "Junior High life. I want to join (the tennis team).", vocabulary: ["club", "tennis", "team", "join"] },
    { number: 7, title: "My Best Memory", target: "My best memory is (the school trip). Past tense narrative.", vocabulary: ["memory", "school trip", "sports day", "graduation"] },
  ],
  "Here We Go! 5": [
    { number: 1, title: "Hello, friends.", target: "Name, spelling, birthday, 'Call me...'." },
    { number: 2, title: "When is your birthday?", target: "Dates, Months, Birthday wishes." },
    { number: 3, title: "What do you want to study?", target: "School Subjects, 'I want to study...'." },
    { number: 4, title: "What time do you get up?", target: "Daily Routine, Time. 'I get up at...'" },
    { number: 5, title: "Where is the gym?", target: "Directions, School rooms. 'Go straight.'" },
    { number: 6, title: "What would you like?", target: "Ordering lunch. 'I'd like...'" },
    { number: 7, title: "What does he do?", target: "Family, Occupations. 'He is a (firefighter).'" },
  ],
  "Here We Go! 6": [
    { number: 1, title: "This is me.", target: "Self-intro, Likes, Can, 'I want to act...'" },
    { number: 2, title: "Welcome to Japan.", target: "Introducing local area/Japan. 'We have...'" },
    { number: 3, title: "Where do you want to go?", target: "Countries, 'I want to go to...'" },
    { number: 4, title: "Summer Vacation", target: "Past tense, 'I went to...', 'I ate...'" },
    { number: 5, title: "My Best Memory", target: "School events memories. 'We went to...'" },
    { number: 6, title: "What do you want to be?", target: "Future dreams. 'I want to be...'" },
    { number: 7, title: "Junior High School", target: "Clubs, school life. 'I want to join...'" },
  ],
  "Crown Jr. 5": [
    { number: 1, title: "Hello!", target: "Greetings. I like (soccer)." },
    { number: 2, title: "When is your birthday?", target: "Dates. Do you want (a card)?" },
    { number: 3, title: "Can you swim?", target: "Can/Can't. Yes I can." },
    { number: 4, title: "What time is it?", target: "Time. I (get up) at (6:30)." },
    { number: 5, title: "Where is the library?", target: "Directions. Go straight." },
    { number: 6, title: "What would you like?", target: "Ordering lunch. I'd like (curry)." },
  ],
  "Crown Jr. 6": [
    { number: 1, title: "Welcome to Japan", target: "We have (summer festivals). You can (eat sushi)." },
    { number: 2, title: "My Town", target: "We have a (nice park). Directions." },
    { number: 3, title: "Summer Vacation", target: "Past tense. I (went camping)." },
    { number: 4, title: "Junior High School", target: "I want to be (a baker)." },
    { number: 5, title: "My Memory", target: "School events. My best memory is..." },
  ],

  // --- JUNIOR HIGH SCHOOL ---
  "New Horizon 1": [
    { number: 0, title: "Unit 0: Introduction", target: "Review of ES (can, like, want to, past tense). Rapid-fire review.", vocabulary: ["hello", "alphabet", "can", "like", "want"] },
    { number: 1, title: "New School, New Friends", target: "I am / You are / I like / Do you like? Formalizing be-verbs.", vocabulary: ["teacher", "student", "math", "science"] },
    { number: 2, title: "Our New Teacher", target: "He is / She is / Question words (Who/What).", vocabulary: ["Who", "What", "He", "She"] },
    { number: 3, title: "Club Activities", target: "I want to / How many / Plurals.", vocabulary: ["want to", "club", "member"] },
    { number: 4, title: "Friends in New Zealand", target: "Who is / What time / Where is.", vocabulary: ["where", "time"] },
    { number: 5, title: "A Day in Our Lives", target: "Third person singular (He plays/She likes). Strict morphological rules.", vocabulary: ["lives", "plays", "starts", "finishes"] },
    { number: 6, title: "Green Door", target: "Can / Can't / Interrogatives (Wh-questions).", vocabulary: ["can", "help"] },
    { number: 7, title: "Foreign Artists", target: "Past tense (was/were/did).", vocabulary: ["was", "were", "did"] },
    { number: 8, title: "Surprise Party", target: "Present Progressive (is ~ing).", vocabulary: ["playing", "cooking"] },
    { number: 9, title: "Think Globally", target: "Can (for permission), SDGs vocabulary intro.", vocabulary: ["environment", "plastic", "waste"] },
    { number: 10, title: "Winter Vacation", target: "Past tense (irregular verbs). Narrating experience.", vocabulary: ["went", "ate", "saw", "had"] },
    { number: 11, title: "Memories", target: "Be going to (future). Graduation focus.", vocabulary: ["going to", "memory"] },
  ],
  "New Horizon 2": [
    { number: 1, title: "A Trip to Singapore", target: "Future (will), Be going to" },
    { number: 2, title: "Food Travels", target: "There is/are, Connectors (that/if)" },
    { number: 3, title: "My Future Job", target: "Infinitive (to + verb) - noun/adj/adv usage" },
    { number: 4, title: "Homestay in the US", target: "Must / Have to / Should" },
    { number: 5, title: "Universal Design", target: "Conjunctions (because/when/if/that)" },
    { number: 6, title: "Research Your Topic", target: "Comparatives / Superlatives (more/most)" },
    { number: 7, title: "Movie Review", target: "Passive Voice (be + pp)" },
  ],
  "New Horizon 3": [
    { number: 1, title: "Sports for Everyone", target: "Present Perfect (have + pp)" },
    { number: 2, title: "Haiku in English", target: "Present Participle (noun + ing)" },
    { number: 3, title: "Animals on the Red List", target: "Indirect Questions (do you know who...)" },
    { number: 4, title: "Let's Read", target: "Relative Pronouns (who/which/that)" },
    { number: 5, title: "Legacy for Peace", target: "Participial Construction" },
    { number: 6, title: "Beyond Borders", target: "Subjunctive Mood (I wish I were...)" },
  ],
  "Sunshine 1": [
    { number: 1, title: "Hello!", target: "I am (Name). Are you (Name)?" },
    { number: 2, title: "My School", target: "This is (a pen). Is that (a desk)?" },
    { number: 3, title: "My Friends", target: "He is (my friend). Who is (she)?" },
    { number: 4, title: "Summer Vacation", target: "I like (music). Do you like (sports)?" },
    { number: 5, title: "Daily Life", target: "What time is it? How many?" },
    { number: 6, title: "My Town", target: "Where is (the station)? Prepositions." },
    { number: 7, title: "Sunday Morning", target: "Present Continuous (He is playing)." },
    { number: 8, title: "A Famous Person", target: "Can you (swim)? Yes, I can." },
    { number: 9, title: "Past Days", target: "Past tense (was/were)." },
    { number: 10, title: "Last Weekend", target: "Past tense (regular/irregular verbs)." },
  ],
  "Sunshine 2": [
    { number: 1, title: "Spring Vacation", target: "Be going to (Future)." },
    { number: 2, title: "A New School", target: "Will (Future)." },
    { number: 3, title: "Jobs", target: "Must / May / Should." },
    { number: 4, title: "Universal Design", target: "Infinitive (to + verb)." },
    { number: 5, title: "My Dream", target: "Conjunctions (that/if/because)." },
    { number: 6, title: "Comparing Cultures", target: "Comparatives and Superlatives." },
    { number: 7, title: "A Movie", target: "Passive Voice." },
  ],
  "Sunshine 3": [
    { number: 1, title: "Sign Language", target: "Present Perfect (have seen/been)." },
    { number: 2, title: "A Speech", target: "Present Perfect (have finished/lost)." },
    { number: 3, title: "Environment", target: "Present Participle (The girl reading...)" },
    { number: 4, title: "Japanese Culture", target: "Relative Pronouns (who/which)." },
    { number: 5, title: "Technology", target: "It is (important) for me to (read)." },
    { number: 6, title: "The Little Prince", target: "Indirect Questions." },
  ],
  "One World 1": [
    { number: 1, title: "Nice to meet you", target: "I am / Are you?" },
    { number: 2, title: "My School", target: "What is this? This is..." },
    { number: 3, title: "Club Day", target: "I like / Do you like?" },
    { number: 4, title: "My Teacher", target: "He is / She is / Who is?" },
    { number: 5, title: "School Lunch", target: "How many / Plurals." },
    { number: 6, title: "My Town", target: "Where is / Prepositions." },
    { number: 7, title: "Sports Day", target: "Present Continuous (ing)." },
    { number: 8, title: "Heroes", target: "Can / Can't." },
    { number: 9, title: "Memories", target: "Past tense." },
  ],
  "One World 2": [
    { number: 1, title: "A Trip", target: "Be going to (Future)." },
    { number: 2, title: "Cooking", target: "Will (Future)." },
    { number: 3, title: "Rules", target: "Must / Have to." },
    { number: 4, title: "Helping Out", target: "Infinitive (to + verb)." },
    { number: 5, title: "A Letter", target: "Gerunds (Verb + ing)." },
    { number: 6, title: "Comparison", target: "Comparatives / Superlatives." },
    { number: 7, title: "History", target: "Passive Voice." },
  ],
  "One World 3": [
    { number: 1, title: "Experiences", target: "Present Perfect (have ever)." },
    { number: 2, title: "News", target: "Present Perfect (have just)." },
    { number: 3, title: "Our Earth", target: "Present Participle." },
    { number: 4, title: "People", target: "Relative Pronouns." },
    { number: 5, title: "Wishes", target: "Subjunctive (I wish)." },
  ],
  "Here We Go! 1": [
    { number: 1, title: "Hello", target: "I am / You are." },
    { number: 2, title: "School Life", target: "Do you / I don't." },
    { number: 3, title: "Friends", target: "He/She is. Who is?" },
    { number: 4, title: "Club Activities", target: "I want to / I can." },
    { number: 5, title: "Summer Vacation", target: "Past tense (regular)." },
    { number: 6, title: "Daily Routine", target: "Time / Third person singular." },
    { number: 7, title: "Our Town", target: "Where is / It is..." },
    { number: 8, title: "Fashion", target: "Present Continuous." },
  ],
  "Here We Go! 2": [
    { number: 1, title: "Field Trip", target: "Past tense (irregular)." },
    { number: 2, title: "Future Plans", target: "Be going to." },
    { number: 3, title: "Homestay", target: "Will / If." },
    { number: 4, title: "Rules", target: "Must / Should." },
    { number: 5, title: "Work Experience", target: "Infinitive (to + verb)." },
    { number: 6, title: "Comparisons", target: "Comparatives." },
    { number: 7, title: "Inventions", target: "Passive Voice." },
  ],
  "Here We Go! 3": [
    { number: 1, title: "Memories", target: "Present Perfect." },
    { number: 2, title: "Culture", target: "It is ... to ..." },
    { number: 3, title: "News", target: "Relative Pronouns." },
    { number: 4, title: "Environment", target: "Participles." },
    { number: 5, title: "If I were...", target: "Subjunctive." },
  ],
  "New Crown 1": [
    { number: 1, title: "Hello", target: "I am / Are you?" },
    { number: 2, title: "My Favorites", target: "I like / Do you like?" },
    { number: 3, title: "My Friend", target: "He/She is. Who is?" },
    { number: 4, title: "School Life", target: "How many / What." },
    { number: 5, title: "Time", target: "What time / When." },
    { number: 6, title: "Abilities", target: "Can / Can't." },
    { number: 7, title: "Action", target: "Present Continuous." },
    { number: 8, title: "Yesterday", target: "Past tense." },
  ],
  "New Crown 2": [
    { number: 1, title: "Future", target: "Be going to." },
    { number: 2, title: "Predictions", target: "Will." },
    { number: 3, title: "Advice", target: "Must / Should." },
    { number: 4, title: "Connections", target: "Infinitive." },
    { number: 5, title: "Universal Design", target: "There is/are." },
    { number: 6, title: "Comparison", target: "Comparatives." },
    { number: 7, title: "History", target: "Passive Voice." },
  ],
  "New Crown 3": [
    { number: 1, title: "Experiences", target: "Present Perfect." },
    { number: 2, title: "Descriptions", target: "Participles." },
    { number: 3, title: "People", target: "Relative Pronouns." },
    { number: 4, title: "Understanding", target: "Indirect Questions." },
  ],
  "Blue Sky 1": [
    { number: 1, title: "Self Intro", target: "I am / You are." },
    { number: 2, title: "Likes", target: "I like / Do you like." },
    { number: 3, title: "People", target: "He/She is." },
    { number: 4, title: "School", target: "What is / Who is." },
    { number: 5, title: "Town", target: "Where is / Prepositions." },
    { number: 6, title: "Can", target: "Can you?" },
    { number: 7, title: "Doing", target: "Present Continuous." },
    { number: 8, title: "Past", target: "Past tense." },
  ],
  "Blue Sky 2": [
    { number: 1, title: "Plans", target: "Be going to." },
    { number: 2, title: "Weather", target: "Will." },
    { number: 3, title: "Obligation", target: "Must / Have to." },
    { number: 4, title: "To Do", target: "Infinitive." },
    { number: 5, title: "Comparing", target: "Comparatives." },
    { number: 6, title: "Made By", target: "Passive Voice." },
  ],
  "Blue Sky 3": [
    { number: 1, title: "Have done", target: "Present Perfect." },
    { number: 2, title: "Describing", target: "Participles." },
    { number: 3, title: "That/Which", target: "Relative Pronouns." },
  ],
};

export const COMMON_ALT_GAMES: ActivityIdea[] = [
  {
    name: "Karuta",
    type: "Main Game",
    skill: "Listening",
    duration: "15 min",
    materials: "Flashcards",
    instructions: "Spread cards on desk. T1 says a word, Ss compete to touch the card first.",
    preparation: "Print/cut small cards",
    recommended_grades: ["Grade 3", "Grade 4", "Grade 5", "Grade 6", "1st Year"],
    tags: ["Active", "Competitive", "Vocab"]
  },
  {
    name: "Keyword Game / Eraser Game",
    type: "Main Game",
    skill: "Listening",
    duration: "10 min",
    materials: "1 Eraser per pair",
    instructions: "Pairs place an eraser between them. T1 says words. When 'Keyword' is spoken, Ss grab the eraser.",
    preparation: "None",
    recommended_grades: ["Grade 3", "Grade 4", "Grade 5", "Grade 6", "1st Year"],
    tags: ["No Prep", "Pair Work", "Fun"]
  },
  {
    name: "Missing Game",
    type: "Warm-up",
    skill: "Vocabulary",
    duration: "5 min",
    materials: "Flashcards, Magnets",
    instructions: "Place cards on board. Ss close eyes. T1 removes one card. Ss guess which one is missing.",
    preparation: "Flashcards",
    recommended_grades: ["Grade 3", "Grade 4", "Grade 5"],
    tags: ["Memory", "Simple"]
  },
  {
    name: "Fruit Basket",
    type: "Main Game",
    skill: "Listening/Speaking",
    duration: "20 min",
    materials: "Chairs arranged in circle",
    instructions: "One S in middle. Says 'I like (blue)'. Everyone who likes blue changes seats. Middle person tries to steal a seat.",
    preparation: "Clear space",
    recommended_grades: ["Grade 5", "Grade 6", "1st Year"],
    tags: ["Active", "Whole Class", "Speaking"]
  },
  {
    name: "Interview Game (Sign Game)",
    type: "Production",
    skill: "Speaking",
    duration: "15 min",
    materials: "Worksheet/Card",
    instructions: "Ss walk around, ask target question (e.g. 'Do you like...?') to friends. Sign each other's sheet if 'Yes'.",
    preparation: "Interview Sheet",
    recommended_grades: ["Grade 5", "Grade 6", "1st Year", "2nd Year"],
    tags: ["Communication", "Moving"]
  },
  {
    name: "Shiritori (Word Chain)",
    type: "Warm-up",
    skill: "Vocabulary",
    duration: "5 min",
    materials: "Blackboard",
    instructions: "Write a word. Next S writes a word starting with the last letter. (e.g. ApplE -> EgG).",
    preparation: "None",
    recommended_grades: ["Grade 5", "Grade 6", "1st Year", "2nd Year", "3rd Year"],
    tags: ["No Prep", "Spelling", "Team"]
  },
  {
    name: "Gesture Game",
    type: "Warm-up",
    skill: "Vocabulary",
    duration: "10 min",
    materials: "None",
    instructions: "S comes to front, does gesture for a word. Class guesses the word.",
    preparation: "List of words",
    recommended_grades: ["Grade 3", "Grade 4", "Grade 5", "Grade 6"],
    tags: ["No Prep", "Fun", "Action"]
  },
  {
    name: "Broken Telephone",
    type: "Main Game",
    skill: "Listening/Speaking",
    duration: "10 min",
    materials: "None",
    instructions: "Lines of students. Whisper a sentence from back to front. Front person says it aloud.",
    preparation: "Sentences",
    recommended_grades: ["Grade 5", "Grade 6", "1st Year"],
    tags: ["No Prep", "Team", "Quiet"]
  },
  {
    name: "Pictionary (Draw & Guess)",
    type: "Main Game",
    skill: "Vocabulary",
    duration: "15 min",
    materials: "Blackboard/Whiteboard",
    instructions: "S draws a picture on board. Team guesses what it is.",
    preparation: "None",
    recommended_grades: ["Grade 3", "Grade 4", "Grade 5", "Grade 6", "1st Year", "2nd Year"],
    tags: ["Drawing", "Visual", "Team"]
  },
  {
    name: "Typhoon Game",
    type: "Main Game",
    skill: "Review",
    duration: "20 min",
    materials: "Grid on board, Flashcards",
    instructions: "Teams answer questions to pick a grid square. Squares have points or 'Typhoon' (lose points).",
    preparation: "Draw grid on board",
    recommended_grades: ["Grade 5", "Grade 6", "1st Year", "2nd Year", "3rd Year"],
    tags: ["Competitive", "Review", "High Energy"]
  },
  {
    name: "Bomb Game",
    type: "Main Game",
    skill: "Speaking",
    duration: "15 min",
    materials: "Timer / Music",
    instructions: "Ss pass a ball/object while music plays. When music stops, holder must answer a question or do a forfeit.",
    preparation: "Music player, Ball",
    recommended_grades: ["Grade 3", "Grade 4", "Grade 5", "Grade 6"],
    tags: ["Active", "Music", "Simple"]
  },
  {
    name: "Criss Cross",
    type: "Warm-up",
    skill: "Speaking",
    duration: "10 min",
    materials: "None",
    instructions: "All Ss stand. T asks a question. S who answers correctly chooses 'Vertical' or 'Horizontal'. That row/column sits down.",
    preparation: "None",
    recommended_grades: ["Grade 5", "Grade 6", "1st Year", "2nd Year", "3rd Year"],
    tags: ["No Prep", "Review", "Routine"]
  },
  {
    name: "Line Game",
    type: "Warm-up",
    skill: "Listening",
    duration: "5 min",
    materials: "Tape or Line on floor",
    instructions: "Draw a line. Left is 'Yes', Right is 'No'. T asks True/False questions. Ss jump to correct side.",
    preparation: "Tape/Chalk",
    recommended_grades: ["Grade 3", "Grade 4", "Grade 5"],
    tags: ["Active", "Yes/No", "Simple"]
  },
  {
    name: "Bingo",
    type: "Main Game",
    skill: "Listening",
    duration: "20 min",
    materials: "Bingo Sheets",
    instructions: "Ss fill 3x3 or 5x5 grid with target words. T calls words. Line wins.",
    preparation: "Bingo sheets",
    recommended_grades: ["Grade 3", "Grade 4", "Grade 5", "Grade 6", "1st Year"],
    tags: ["Classic", "Quiet", "Listening"]
  },
  {
    name: "Hint Quiz (Three Hints)",
    type: "Main Game",
    skill: "Listening",
    duration: "15 min",
    materials: "None",
    instructions: "T gives 3 hints (e.g. 'It's a fruit', 'It's yellow', 'Monkeys like it'). Ss guess 'Banana'.",
    preparation: "List of hints",
    recommended_grades: ["Grade 5", "Grade 6", "1st Year"],
    tags: ["Thinking", "Listening", "No Prep"]
  },
  {
    name: "Simon Says",
    type: "Warm-up",
    skill: "Listening",
    duration: "5 min",
    materials: "None",
    instructions: "T says 'Simon says touch your head'. Ss do it. If T says 'Touch your head' (no Simon says), Ss shouldn't move.",
    preparation: "None",
    recommended_grades: ["Grade 3", "Grade 4"],
    tags: ["Active", "TPR", "Fun"]
  },
  {
    name: "Battleship",
    type: "Main Game",
    skill: "Grammar",
    duration: "20 min",
    materials: "Battleship Worksheet",
    instructions: "Pair work. Ss draw ships on grid. They guess opponent's ship locations using target grammar (e.g. 'Do you like...?').",
    preparation: "Battleship grid sheets",
    recommended_grades: ["1st Year", "2nd Year", "3rd Year"],
    tags: ["Pair Work", "Strategy", "Grammar"]
  },
  {
    name: "Running Dictation",
    type: "Main Game",
    skill: "Reading/Writing/Speaking",
    duration: "20 min",
    materials: "Sentences taped to walls",
    instructions: "Pairs (Runner/Writer). Runner runs to wall, memorizes sentence, runs back and dictates to Writer.",
    preparation: "Print sentences, Tape",
    recommended_grades: ["1st Year", "2nd Year", "3rd Year"],
    tags: ["Active", "Four Skills", "Team"]
  },
  {
    name: "Jeopardy",
    type: "Review Activity",
    skill: "Review",
    duration: "25 min",
    materials: "Blackboard Grid",
    instructions: "Categories on board with points (100-500). Teams choose category/points and answer question.",
    preparation: "Quiz questions",
    recommended_grades: ["1st Year", "2nd Year", "3rd Year"],
    tags: ["Competitive", "Review", "Team"]
  },
  {
    name: "Find Someone Who",
    type: "Main Game",
    skill: "Speaking",
    duration: "15 min",
    materials: "Worksheet",
    instructions: "Ss walk around asking 'Can you...?' or 'Do you...?'. If 'Yes', friend signs the box.",
    preparation: "Grid worksheets",
    recommended_grades: ["Grade 6", "1st Year", "2nd Year"],
    tags: ["Communicative", "Moving", "Ice Breaker"]
  },
  {
    name: "Telepathy Game",
    type: "Main Game",
    skill: "Writing/Listening",
    duration: "15 min",
    materials: "Paper/Whiteboards",
    instructions: "T asks a question with multiple answers (e.g. 'A red fruit'). Ss write one answer. If they match T (or partner), they get a point.",
    preparation: "None",
    recommended_grades: ["Grade 6", "1st Year", "2nd Year"],
    tags: ["Fun", "Writing", "Simple"]
  },
  {
    name: "Information Gap",
    type: "Main Game",
    skill: "Speaking",
    duration: "20 min",
    materials: "Pair Worksheets (A & B)",
    instructions: "Student A has info Student B needs, and vice-versa. They must ask questions to complete their sheet.",
    preparation: "A/B Worksheets",
    recommended_grades: ["1st Year", "2nd Year", "3rd Year"],
    tags: ["Communicative", "Pair Work", "Focus"]
  },
  {
    name: "Gokiburi (Cockroach) Game",
    type: "Main Game",
    skill: "Speaking",
    duration: "10 min",
    materials: "Flashcards",
    instructions: "Defined 'safe' words and 1 'cockroach' word. Ss repeat after T. If T says cockroach word, Ss scream/run.",
    preparation: "None",
    recommended_grades: ["Grade 3", "Grade 4"],
    tags: ["Fun", "Active", "Listening"]
  },
  {
    name: "Memory Chain",
    type: "Warm-up",
    skill: "Speaking",
    duration: "10 min",
    materials: "None",
    instructions: "S1: 'I went to the park.' S2: 'I went to the park and ate lunch.' S3 adds one more item.",
    preparation: "None",
    recommended_grades: ["2nd Year", "3rd Year"],
    tags: ["Memory", "Grammar", "No Prep"]
  },
  {
    name: "Go Fish",
    type: "Main Game",
    skill: "Speaking",
    duration: "15 min",
    materials: "Playing cards / Vocab cards",
    instructions: "Classic Go Fish rules using target language sentences like 'Do you have a...?'",
    preparation: "Card decks",
    recommended_grades: ["Grade 5", "Grade 6", "1st Year"],
    tags: ["Card Game", "Small Group", "Repeating"]
  },
  {
    name: "Snake and Ladders",
    type: "Main Game",
    skill: "Speaking",
    duration: "20 min",
    materials: "Board Game, Dice, Chips",
    instructions: "Ss roll dice. To stay on square, must answer question or say target sentence.",
    preparation: "Board game printouts",
    recommended_grades: ["Grade 5", "Grade 6", "1st Year"],
    tags: ["Board Game", "Small Group", "Fun"]
  },
  {
    name: "4 Corners",
    type: "Main Game",
    skill: "Listening",
    duration: "10 min",
    materials: "Corner signs",
    instructions: "Label corners A, B, C, D. Ask a question. Ss run to the corner they think is correct. Random elimination or factual.",
    preparation: "Signs",
    recommended_grades: ["Grade 3", "Grade 4", "Grade 5"],
    tags: ["Active", "Whole Class", "Simple"]
  },
  {
    name: "Alibi Game",
    type: "Main Game",
    skill: "Speaking/Grammar",
    duration: "25 min",
    materials: "None",
    instructions: "Two Ss are 'suspects' and leave room to create an alibi for a specific time. Class prepares questions. Suspects return and are questioned separately. If stories don't match, they are guilty.",
    preparation: "None",
    recommended_grades: ["2nd Year", "3rd Year"],
    tags: ["Past Tense", "Fun", "Advanced"]
  },
  {
    name: "Last Man Standing",
    type: "Warm-up",
    skill: "Vocabulary",
    duration: "5 min",
    materials: "Ball (optional)",
    instructions: "Everyone stands. Toss ball. Catcher must say a word in category (e.g. 'Animals'). If correct, sit down. Last one standing does a forfeit.",
    preparation: "None",
    recommended_grades: ["Grade 5", "Grade 6", "1st Year", "2nd Year"],
    tags: ["Vocab", "Review", "Fast"]
  }
];

export const GRADES = {
  Elementary: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"],
  JuniorHigh: ["1st Year", "2nd Year", "3rd Year"]
};

export const ACTIVITY_SKILLS = ["Speaking", "Listening", "Reading", "Writing", "Vocabulary", "Grammar"];
export const ACTIVITY_TYPES = ["Warm-up", "Main Game", "Filler (5 min)", "Review Activity", "Cool-down"];

export const PRE_CLASS_CHECKLIST = [
  "Lesson objectives clearly defined and measurable",
  "Activities aligned with textbook unit and curriculum standards",
  "Timing allocated appropriately for each phase",
  "Materials prepared and available",
  "ALT and JTE roles clearly defined",
  "Cultural sensitivity considerations addressed",
  "Assessment methods incorporated",
  "Student engagement strategies included",
  "Differentiation for various skill levels",
  "Backup activities prepared",
  "Technology/resources tested and working",
  "Classroom management plan established",
  "Flexibility (Jūnansei) built into lesson"
];

export const COMMON_MATERIALS = [
  "Textbook", "Worksheets", "Flashcards", "Digital Materials (PC/Tablet)",
  "Audio Player / CD", "Projector / TV", "Magnet / Blackboard",
  "Student Notebooks", "Realia (Real Objects)", "Timer / Stopwatch"
];

export const INITIAL_MANUAL_STATE: ManualPlanState = {
  altName: "",
  altNationality: "",
  altExperience: "Beginner",
  altEmail: "",
  altPhone: "",

  teacher2Name: "",
  teacher2Email: "",
  teacher2Proficiency: 3,
  teacher2Experience: "1-5 years",
  communicationMethod: "In-person",
  uchiawaseFreq: "As needed",
  altRoleType: "T2",
  teacher2RoleType: "T1",


  date: new Date().toISOString().split('T')[0],
  startTime: "08:50",
  school: "",
  level: "Elementary",
  grade: "Grade 5",
  classNumber: "",
  studentLevel: 3,
  textbook: TEXTBOOKS.Elementary[2], // We Can 1
  unit: "",
  classSize: 35,
  targetLanguage: "",
  lessonVocabulary: "",
  grammarPoints: "",

  smartS: "",
  smartM: "",
  smartA: "",
  smartR: "",
  smartT: "",

  materialsList: [],

  warmup: { time: 5, title: "", activity: "", instructions: "", assessment: "", altRole: "", teacher2Role: "", materials: "" },
  present: { time: 10, title: "", activity: "", instructions: "", assessment: "", altRole: "", teacher2Role: "", materials: "" },
  practice: { time: 15, title: "", activity: "", instructions: "", assessment: "", altRole: "", teacher2Role: "", materials: "" },
  produce: { time: 15, title: "", activity: "", instructions: "", assessment: "", altRole: "", teacher2Role: "", materials: "" },
  wrapup: { time: 5, title: "", activity: "", instructions: "", assessment: "", altRole: "", teacher2Role: "", materials: "" },

  assessmentPoints: "",
  culturalNote: "",
  diffSupport: "",
  diffChallenge: "",
  flexibility: "",
  checklist: new Set(),

  reviewStatus: 'Self-reviewed',
  approvedBy: "",

  uchiawaseScheduled: false,
  uchiawaseDate: "",
  uchiawaseTime: "",
  uchiawaseNotes: ""
};