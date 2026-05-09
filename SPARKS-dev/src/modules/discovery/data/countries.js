// src/data/countries.js

// =========================================================================
// NEW: Global Navigation Buttons - Defined once for all countries
// =========================================================================
export const GLOBAL_NAV_BUTTONS = [
  {
    id: 'general',
    imgSrc: 'images/ui/navigation/nav-general-info.png',
    alt: 'General Info',
    targetPage: 'general'
  },
  {
    id: 'culture',
    imgSrc: 'images/ui/navigation/nav-culture.png',
    alt: 'Culture',
    targetPage: 'culture'
  },
  {
    id: 'school',
    imgSrc: 'images/ui/navigation/nav-school-life.png',
    alt: 'School Life',
    targetPage: 'school'
  },
  {
    id: 'alt',
    imgSrc: 'images/ui/navigation/nav-meet-alt.png',
    alt: 'Meet the ALT',
    targetPage: 'alt'
  },
  {
    id: 'quiz',
    imgSrc: 'images/ui/navigation/nav-quiz.png',
    alt: 'Quiz',
    targetPage: 'quiz'
  }
];

// =========================================================================
// NEW: Global Page Banners - The single source for sub-page headers
// =========================================================================
export const GLOBAL_PAGE_BANNERS = {
  general: 'images/ui/banners/general-info-banner.png',
  culture: 'images/ui/banners/culture-banner.png',
  school: 'images/ui/banners/school-life-banner.png',
  alt: 'images/ui/banners/meet-the-alt-banner.png',
  quiz: 'images/ui/banners/quiz-banner.png',
};

// =========================================================================
// THE FIX: Define a single source for all info card button images.
// This reduces repetition and makes updating images easier.
// =========================================================================
const BUTTON_IMAGES = {
// General Info Buttons
languages: "images/ui/buttons/general-languages-btn.png",
flight_time: "images/ui/buttons/general-travel-btn.png",
currency: "images/ui/buttons/general-currency-btn.png",
say_hello: "images/ui/buttons/general-hello-btn.png",
// Culture Buttons
famous_food: "images/ui/buttons/culture-famous-food-btn.png",
famous_people: "images/ui/buttons/culture-people-btn.png",
jp_famous_in: "images/ui/buttons/culture-jp-famous-btn.png",
holidays: "images/ui/buttons/culture-holidays-btn.png",
festivals: "images/ui/buttons/culture-festivals-btn.png",
national_sport: "images/ui/buttons/culture-sports-btn.png",
// School Life Buttons
school_routine: "images/ui/buttons/school-routine-btn.png",
school_holidays: "images/ui/buttons/school-holidays-btn.png",
subjects: "images/ui/buttons/school-subjects-btn.png",
common_games: "images/ui/buttons/school-games-btn.png",
school_lunch: "images/ui/buttons/school-lunch-btn.png",
after_school: "images/ui/buttons/school-after-school-btn.png",
// ALT Page Buttons
skills_hobbies: "images/ui/buttons/alt-hobbies-btn.png",
likes: "images/ui/buttons/alt-likes-btn.png",
dislikes: "images/ui/buttons/alt-dislikes-btn.png",
birth_month: "images/ui/buttons/alt-birthday-btn.png",
fav_jp_food: "images/ui/buttons/alt-jp-food-btn.png",
love_jp: "images/ui/buttons/alt-love-jp-btn.png",
};

export const countries = [
    // =========================================================================
    // CANADA
    // =========================================================================
    {
      id: 'canada',
      name: 'Canada',
      capital: 'Ottawa',
      coordinates: { lat: 45.4215, lon: -75.6972 },
      timezones: [ // Canada has multiple timezones
        'America/Vancouver', // Pacific
        'America/Edmonton',  // Mountain
        'America/Winnipeg',  // Central
        'America/Toronto',   // Eastern
        'America/Halifax',   // Atlantic
        'America/St_Johns'   // Newfoundland
      ],
      flag_img: 'https://flagcdn.com/w320/ca.png',
      name_header_img: 'images/countries/headers/canada-header.png',
      background_img: 'images/countries/canada/background.jpg',
      background_music: 'audio/music/canada.mp3',
      national_anthem: 'audio/anthems/canada.mp3',
      accent_color: '#EF3340',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
      languages: { 
          title: "Official Languages", 
          content: "Canada has two official languages: English and French.\nMost people speak English, but French is the main language in the province of Quebec.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/general-languages-img.png"
      },
      flight_time: { 
          title: "Flight Time from Japan", 
          content: "A direct flight from Tokyo to Vancouver takes about 9 hours.\nA flight to Toronto on the east coast can take around 12 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/general-info/content-images/general-travel-img.png"
      },
      currency: { 
          title: "Currency", 
          content: "The currency is the Canadian Dollar (CAD).\nIt has colorful bills and coins with famous Canadian symbols, like the loon ('Loonie') and the polar bear ('Toonie').", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/general-currency-img.png"
      },
      say_hello: { 
          title: "Say Hello!", 
          content: "In English, you can say 'Hello' or 'How's it going, eh?'.\nIn French, you say 'Bonjour!'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/general-info/content-images/general-hello-img.png"
      },
    },
    culture: {
      famous_food: { 
          title: "Famous Food", 
          content: "Poutine (fries with cheese curds and gravy) is a must-try!\nCanada is also the world's largest producer of maple syrup.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/culture-famous-food-img.png"
      },
      famous_people: { 
          title: "Famous People", 
          content: "Famous Canadians include actors Ryan Reynolds and Keanu Reeves, singers Justin Bieber and Céline Dion, and author L.M. Montgomery.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/culture-people-img.png"
      },
      jp_famous_in: { 
          title: "Famous Japanese People", 
          content: "Figure skater Yuzuru Hanyu is very famous for training in Toronto with coach Brian Orser. Many people admire his connection to the country.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/culture-jp-famous-img.png"
      },
      holidays: { 
          title: "Holidays", 
          content: "Major holidays include Canada Day (July 1), Thanksgiving (October), and Victoria Day (May). Boxing Day (Dec 26) is a big shopping day.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/culture-holidays-img.jpg"
      },
      festivals: { 
          title: "Festivals", 
          content: "In winter, many cities have winter festivals, like the Quebec Winter Carnival with its ice sculptures. Summer brings music and cultural festivals to cities nationwide.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/culture-festivals-img.jpg"
      },
      national_sport: { 
          title: "National Sports", 
          content: "Ice Hockey and curling are the official winter sports and hockey is a national passion. Lacrosse is the official summer sport.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/culture-sports-img.png"
      },
    },
    school_life: {
      school_routine: { 
          title: "School Routine", 
          content: "School typically runs from 8:30 AM to 3:00 PM.\nClasses are usually 50-75 minutes long, with a longer break for lunch.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/school-routine-img.png"
      },
      school_holidays: { 
          title: "School Holidays", 
          content: "Students get a long summer vacation (July & August), a two-week winter break for Christmas, and a 'March break' for one week in spring.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/school-holidays-img.jpg"
      },
      subjects: { 
          title: "Subjects", 
          content: "Core subjects are Math, English, Science, and Social Studies (History/Geography). In many parts of Canada, French is a required subject.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/school-subjects-img.png"
      },
      common_games: { 
          title: "Games at School", 
          content: "During recess, kids often play tag, soccer, or four-square. In winter, they might build snowmen or have snowball fights.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/school-games-img.jpg"
      },
      school_lunch: { 
          title: "School Lunch", 
          content: "Most students bring a packed lunch from home. Some schools have a cafeteria where you can buy food like pizza or sandwiches.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/school-lunch-img.jpg"
      },
      after_school: { 
          title: "After School Activities", 
          content: "Students participate in sports like soccer and hockey, or join clubs for drama, music, or chess. Part-time jobs are common for high school students.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/canada-popup-bg.png",
          content_img: "images/countries/canada/content-images/school-after-school-img.jpg"
      },
    },
    /*
    alt_info: {
      name: "John Smith",
      details: {
        skills_hobbies: { 
            title: "Skills & Hobbies", 
            content: "I love playing guitar, snowboarding in the winter, and hiking in the summer.", 
            button_img: BUTTON_IMAGES.skills_hobbies, 
            popup_img: "images/countries/popups/canada-popup-bg.png",
            content_img: "alt_pages/john_smith/content-images/alt-hobbies-img.png"
        },
        likes: { 
            title: "Likes", 
            content: "I like poutine and watching hockey.", 
            button_img: BUTTON_IMAGES.likes, 
            popup_img: "images/countries/popups/canada-popup-bg.png",
            content_img: "alt_pages/john_smith/content-images/alt-likes-img.png"
        },
        dislikes: { 
            title:  "Dislikes", 
            content: "I dislike very hot and humid weather.", 
            button_img: BUTTON_IMAGES.dislikes, 
            popup_img: "images/countries/popups/canada-popup-bg.png",
            content_img: "alt_pages/john_smith/content-images/alt-dislikes-img.png"
        },
        birth_month: { 
            title: "Birthday", 
            content: "I was born in October.", 
            button_img: BUTTON_IMAGES.birth_month, 
            popup_img: "images/countries/popups/canada-popup-bg.png",
            content_img: "alt_pages/john_smith/content-images/alt-birthday-img.png"
        },
        fav_jp_food: { 
            title: "Favorite Japanese Food", 
            content: "My favorite is definitely Tonkotsu Ramen!", 
            button_img: BUTTON_IMAGES.fav_jp_food, 
            popup_img: "images/countries/popups/canada-popup-bg.png",
            content_img: "alt_pages/john_smith/content-images/alt-jp-food-img.png"
        },
        love_jp: { 
            title: "What I Love About Japan", 
            content: "I love the convenience of the trains and how safe it feels everywhere.", 
            button_img: BUTTON_IMAGES.love_jp, 
            popup_img: "images/countries/popups/canada-popup-bg.png",
            content_img: "alt_pages/john_smith/content-images/alt-love-jp-img.png"
        },
      }
    },
    */
    quiz: {
      questions: [
        { type: 'true-false', question: 'The Canadian one-dollar coin is nicknamed the "Toonie".', answer: 'False' },
        { type: 'multiple-choice', question: 'What is a famous Canadian food made with fries, cheese curds, and gravy?', options: ['French Fries', 'Poutine', 'Loaded Fries'], answer: 'Poutine' },
        { type: 'true-false', question: 'Canada has two official languages: English and Spanish.', answer: 'False' },
        { type: 'multiple-choice', question: "What is Canada's official winter sport?", options: ['Skiing', 'Curling', 'Ice Hockey'], answer: 'Ice Hockey' },
        { type: 'true-false', question: "A typical school day in Canada ends around 3:00 PM.", answer: 'True' },
        { type: 'multiple-choice', question: "What sweet liquid is Canada famous for producing?", options: ['Honey', 'Maple Syrup', 'Agave Nectar'], answer: 'Maple Syrup' },
        { type: 'true-false', question: "A 'Loonie' is a famous Canadian singer.", answer: 'False' },
        { type: 'multiple-choice', question: "What language, besides English, is official in Canada?", options: ['German', 'Spanish', 'French'], answer: 'French' },
        { type: 'true-false', question: 'Most students in Canada buy a hot lunch from the school every day.', answer: 'False' },
        { type: 'multiple-choice', question: "Which of these is an official summer sport of Canada?", options: ['Baseball', 'Soccer', 'Lacrosse'], answer: 'Lacrosse' },
        { type: 'true-false', question: 'Canada Day is celebrated on July 4th.', answer: 'False' },
        { type: 'multiple-choice', question: "What is the approximate flight time from Tokyo to Vancouver?", options: ['5 hours', '9 hours', '15 hours'], answer: '9 hours' },
        { type: 'true-false', question: 'The Quebec Winter Carnival is a famous festival with ice sculptures.', answer: 'True' },
        { type: 'multiple-choice', question: 'Which of these is NOT a core subject in Canadian schools?', options: ['Math', 'English', 'Calligraphy'], answer: 'Calligraphy' },
        { type: 'true-false', question: "Yuzuru Hanyu is a famous figure skater who trained in Canada.", answer: 'True' },
      ]
    },
  },
    // =========================================================================
    // USA
    // =========================================================================
    {
      id: 'usa',
      name: 'USA',
      capital: 'Washington D.C.',
      coordinates: { lat: 38.8951, lon: -77.0364 },
      timezones: [ // USA has multiple timezones
          'America/Los_Angeles', // Pacific
          'America/Denver',      // Mountain
          'America/Chicago',     // Central
          'America/New_York',    // Eastern
      ],
      flag_img: 'https://flagcdn.com/w320/us.png',
      name_header_img: 'images/countries/headers/usa-header.png',
      background_img: 'images/countries/usa/background.jpg',
      background_music: 'audio/music/usa.mp3',
      national_anthem: 'audio/anthems/usa.mp3',
      accent_color: '#B31942',
      accent_color_secondary: '#FFFFFF',

      general_info: {
        languages: { 
          title: "Main Language", 
          content: "English is the most common language. While it doesn't have an 'official' language at the federal level, many states list English as official.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A flight from Tokyo to Los Angeles on the west coast takes about 10 hours. Flying to New York on the east coast takes about 13 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/general-info/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the United States Dollar (USD or $). It is one of the most widely used currencies in the world.", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "You can say 'Hello', 'Hi', or more casually, 'What's up?' or 'How's it going?'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/general-info/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Classic American foods include hamburgers, hot dogs, macaroni and cheese, and apple pie. Barbecue is also extremely popular, with different styles all over the country.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "The USA is home to many world-famous people, like singers Taylor Swift, actor Tom Cruise, and basketball legend Michael Jordan.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Famous Japanese People", 
          content: "Baseball player Shohei Ohtani is incredibly famous in the USA for his amazing skill as both a pitcher and a hitter in Major League Baseball (MLB).", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Independence Day on July 4th is celebrated with parades and fireworks. Thanksgiving, on the fourth Thursday of November, is a major family holiday with a large feast.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/culture-holidays-img.jpg" 
        },
        festivals: { 
          title: "Festivals", 
          content: "The USA hosts huge music festivals like Coachella and Lollapalooza, as well as thousands of local state fairs and food festivals.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/culture-festivals-img.jpg" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "The most popular sports are American Football, Baseball (often called 'America's pastime'), and Basketball.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/culture-sports-img.jpg" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "The school day is usually from around 8:00 AM to 3:00 PM. In high school, classes ('periods') are typically 45 to 55 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "Students get a long summer vacation (usually June to August), a winter break for Christmas, and a spring break.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/school-holidays-img.jpg" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study English, Math, Science, and Social Studies. In high school, they can choose extra classes ('electives') like art, music, or computer science.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "During recess, students play on playgrounds with swings and slides. Popular games are kickball, basketball, and tag.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/school-games-img.jpg" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Most students eat in a large cafeteria. They can buy a hot lunch from the school or bring their own packed lunch from home.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/school-lunch-img.jpg" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Many students join sports teams like football or basketball. Other activities include band, theater club, and student government.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/usa-popup-bg.png", 
          content_img: "images/countries/usa/content-images/school-after-school-img.jpg" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'The capital of the USA is New York City.', answer: 'False' },
          { type: 'multiple-choice', question: 'How many states are in the USA?', options: ['48', '50', '52'], answer: '50' },
          { type: 'true-false', question: 'The American flag has 13 stripes for the 13 original colonies.', answer: 'True' },
          { type: 'multiple-choice', question: 'What is the national bird of the USA?', options: ['Bald Eagle', 'Turkey', 'Pigeon'], answer: 'Bald Eagle' },
          { type: 'true-false', question: "Baseball is known as 'America's pastime'.", answer: 'True' },
          { type: 'multiple-choice', question: "What holiday is celebrated on July 4th?", options: ['Halloween', 'Thanksgiving', 'Independence Day'], answer: 'Independence Day' },
          { type: 'true-false', question: 'Hollywood is famous for making movies.', answer: 'True' },
          { type: 'multiple-choice', question: "What is the name of the president's house?", options: ['The Capitol Building', 'The White House', 'The Pentagon'], answer: 'The White House' },
          { type: 'true-false', question: "The school day in the USA is usually until 6 PM.", answer: 'False' },
          { type: 'multiple-choice', question: "A school's extra, optional classes are called...?", options: ['Electives', 'Mandatories', 'Cores'], answer: 'Electives' },
          { type: 'true-false', question: 'The currency of the USA is the Euro.', answer: 'False' },
          { type: 'multiple-choice', question: "Shohei Ohtani is famous in the USA for playing what sport?", options: ['Soccer', 'Basketball', 'Baseball'], answer: 'Baseball' },
          { type: 'true-false', question: 'Thanksgiving is a holiday celebrated with a large feast.', answer: 'True' },
          { type: 'multiple-choice', question: "Which of these is NOT a popular sport in the USA?", options: ['American Football', 'Cricket', 'Basketball'], answer: 'Cricket' },
          { type: 'true-false', question: 'Flying from Tokyo to New York takes about 13 hours.', answer: 'True' },
        ]
      },
    },
    // =========================================================================
    // SPAIN
    // =========================================================================
    {
      id: 'spain',
      name: 'Spain',
      capital: 'Madrid',
      coordinates: { lat: 40.4168, lon: -3.7038 },
      timezones: [
        'Europe/Madrid',    // Mainland
        'Atlantic/Canary'   // Canary Islands
      ],
      flag_img: 'https://flagcdn.com/w320/es.png',
      name_header_img: 'images/countries/headers/spain-header.png',
      background_img: 'images/countries/spain/background.jpg',
      background_music: 'audio/music/spain.mp3',
      national_anthem: 'audio/anthems/spain.mp3',
      accent_color: '#C60B1E',
      accent_color_secondary: '#FFC400',

      general_info: {
        languages: { 
          title: "Official Language", 
          content: "Spanish is the official language. Other regional languages like Catalan, Galician, and Basque are also spoken in their respective regions.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "There are no direct flights. A flight with one stop usually takes about 14 to 16 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Euro (€), like many other countries in the European Union.", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Hola' is the universal word for 'Hello'. '¿Qué tal?' means 'How are you?'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Paella (a rice dish from Valencia), tapas (small appetizer plates), and jamón (cured ham) are world-famous. Gazpacho is a popular cold soup in summer.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous Spaniards include artist Pablo Picasso, architect Antoni Gaudí, and tennis player Rafael Nadal.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Famous Japanese People", 
          content: "The manga and anime 'Captain Tsubasa' is incredibly popular in Spain. Many professional Spanish soccer players were inspired by it as kids.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Major holidays include Three Kings' Day (Jan 6), Easter Week ('Semana Santa'), and the National Day of Spain (Oct 12).", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "La Tomatina is a festival where people throw tomatoes. The Running of the Bulls in Pamplona is another famous, but dangerous, festival.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Football (Soccer) is the most popular sport, with famous teams like Real Madrid and FC Barcelona. Basketball is also popular.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "The school day is often from 9:00 AM to 5:00 PM, but with a very long lunch break (around two hours) in the middle for the traditional 'siesta' time. Lessons are typically 45 to 55 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "Students have a long summer holiday, a break for Christmas, and a holiday for Easter ('Semana Santa').", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students learn Spanish Language, Maths, Science, Social Studies, and a foreign language, usually English.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Football is very popular to play during breaks. Other games include 'pilla-pilla' (tag) and playing with marbles.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Because of the long lunch break, many students go home to eat with their families. Some schools have a cafeteria called a 'comedor'.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Many children participate in sports clubs outside of school, especially for football. Music and dance lessons are also common.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/spain-popup-bg.png", 
          content_img: "images/countries/spain/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'Flamenco is a famous dance from Spain.', answer: 'True' },
          { type: 'multiple-choice', question: "What is the name for small appetizer dishes in Spain?", options: ['Sushi', 'Tapas', 'Pasta'], answer: 'Tapas' },
          { type: 'true-false', question: 'Spain and Portugal are on the Iberian Peninsula.', answer: 'True' },
          { type: 'multiple-choice', question: "What is the capital of Spain?", options: ['Barcelona', 'Seville', 'Madrid'], answer: 'Madrid' },
          { type: 'true-false', question: "A 'siesta' is a short nap taken in the early afternoon.", answer: 'True' },
          { type: 'multiple-choice', question: "What is the famous Spanish rice dish from Valencia called?", options: ['Risotto', 'Paella', 'Biryani'], answer: 'Paella' },
          { type: 'true-false', question: 'The main currency in Spain is the Peseta.', answer: 'False' },
          { type: 'multiple-choice', question: "During La Tomatina festival, what do people throw?", options: ['Water Balloons', 'Tomatoes', 'Flowers'], answer: 'Tomatoes' },
          { type: 'true-false', question: 'Most students in Spain eat a packed lunch at school.', answer: 'False' },
          { type: 'multiple-choice', question: 'Antoni Gaudí was a famous Spanish...?', options: ['Chef', 'Painter', 'Architect'], answer: 'Architect' },
          { type: 'true-false', question: 'The most popular sport in Spain is bullfighting.', answer: 'False' },
          { type: 'multiple-choice', question: 'What does "Hola" mean in Spanish?', options: ['Goodbye', 'Thank you', 'Hello'], answer: 'Hello' },
          { type: 'true-false', question: 'Spanish schools have a very short lunch break.', answer: 'False' },
          { type: 'multiple-choice', question: "Which anime is very popular with Spanish soccer players?", options: ['Sailor Moon', 'Pokémon', 'Captain Tsubasa'], answer: 'Captain Tsubasa' },
          { type: 'true-false', question: "Rafael Nadal is a famous Spanish tennis player.", answer: 'True' },
        ]
      },
    },
    // =========================================================================
    // AUSTRALIA
    // =========================================================================
    {
      id: 'australia',
      name: 'Australia',
      capital: 'Canberra',
      coordinates: { lat: -35.2809, lon: 149.1300 },
      timezones: [
        'Australia/Perth',    // Western
        'Australia/Darwin',   // Central (No DST)
        'Australia/Adelaide', // Central
        'Australia/Brisbane', // Eastern (No DST)
        'Australia/Sydney',   // Eastern
      ],
      flag_img: 'https://flagcdn.com/w320/au.png',
      name_header_img: 'images/countries/headers/australia-header.png',
      background_img: 'images/countries/australia/background.jpg',
      background_music: 'audio/music/australia.mp3',
      national_anthem: 'audio/anthems/australia.mp3',
      accent_color: '#00008B',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is English, but it is spoken with a unique accent and slang words like 'G'day' and 'mate'.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A direct flight from Tokyo to Sydney or Brisbane takes about 9 to 10 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Australian Dollar (AUD). The banknotes are colorful and made of a waterproof polymer plastic.", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'G'day, mate!' is a famous, very casual greeting. 'How are you going?' is also a common way to ask 'How are you?'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Barbecues ('barbies') are a huge part of the culture. Other famous foods include Vegemite (a savory spread), meat pies, and a chocolate and coconut cake called a Lamington.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous Australians include actors Hugh Jackman, Chris Hemsworth, and Margot Robbie, and swimmer Ian Thorpe.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Famous Japanese Things", 
          content: "Japanese cuisine, especially sushi and ramen, is incredibly popular in Australia. Also, many Australians love visiting Japan for skiing in the winter.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Australia Day on January 26th is the national holiday. Anzac Day on April 25th is a solemn day of remembrance for soldiers.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "Australia hosts many large music festivals, multicultural food fairs, and the spectacular Vivid Sydney light festival.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Cricket is the national sport, but Australian Rules Football (AFL) and Rugby League are also incredibly popular, especially in different states.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "School runs from about 9:00 AM to 3:30 PM. Lessons are usually about 40 to 60 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "There are four school terms in a year, with short holidays in between and a long summer holiday over Christmas (December and January).", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study English, Mathematics, Science, and HASS (Humanities and Social Sciences). Outdoor education and sports are also very important.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Cricket and 'footy' (AFL or rugby) are played during 'lunch' (lunch break). There is a 'no hat, no play' rule at most schools to protect from the strong sun.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Students almost always bring a packed lunch from home. They can also buy food from the school 'tuck shop' or canteen.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Many students participate in 'Nippers', a junior surf lifesaving program at the beach. Team sports like cricket, netball, and rugby are also very common.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/australia-popup-bg.png", 
          content_img: "images/countries/australia/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'A dingo is a type of wild cat in Australia.', answer: 'False' },
          { type: 'multiple-choice', question: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra'], answer: 'Canberra' },
          { type: 'true-false', question: 'Kangaroos and koalas are native to Australia.', answer: 'True' },
          { type: 'multiple-choice', question: "What is a famous Australian savory food spread?", options: ['Nutella', 'Vegemite', 'Peanut Butter'], answer: 'Vegemite' },
          { type: 'true-false', question: "A 'barbie' is a type of Australian doll.", answer: 'False' },
          { type: 'multiple-choice', question: "What is the most popular summer sport in Australia?", options: ['Ice Hockey', 'Cricket', 'Skiing'], answer: 'Cricket' },
          { type: 'true-false', question: 'The Australian summer holiday is during July and August.', answer: 'False' },
          { type: 'multiple-choice', question: "The school rule 'no hat, no play' is to protect students from what?", options: ['The rain', 'The cold', 'The sun'], answer: 'The sun' },
          { type: 'true-false', question: 'Hugh Jackman is a famous actor from New Zealand.', answer: 'False' },
          { type: 'multiple-choice', question: "What is a 'Lamington'?", options: ['A type of bird', 'A type of cake', 'A type of car'], answer: 'A type of cake' },
          { type: 'true-false', question: "A school 'tuck shop' is another name for the library.", answer: 'False' },
          { type: 'multiple-choice', question: 'What is a "mate" in Australian slang?', options: ['A type of tea', 'A friend', 'An enemy'], answer: 'A friend' },
          { type: 'true-false', question: 'Anzac Day is a day for celebrating with fireworks.', answer: 'False' },
          { type: 'multiple-choice', question: 'Australian banknotes are made of...?', options: ['Paper', 'Polymer Plastic', 'Cotton'], answer: 'Polymer Plastic' },
          { type: 'true-false', question: "Rugby is more popular than AFL in all states of Australia.", answer: 'False' },
        ]
      },
    },
    // =========================================================================
    // UGANDA
    // =========================================================================
    {
      id: 'uganda',
      name: 'Uganda',
      capital: 'Kampala',
      coordinates: { lat: 0.3476, lon: 32.5825 },
      timezones: ['Africa/Kampala'],
      flag_img: 'https://flagcdn.com/w320/ug.png',
      name_header_img: 'images/countries/headers/uganda-header.png',
      background_img: 'images/countries/uganda/background.jpg',
      background_music: 'audio/music/uganda.mp3',
      national_anthem: 'audio/anthems/uganda.mp3',
      accent_color: '#FCDC04',
      accent_color_secondary: '#000000',
      
      general_info: {
        languages: { 
          title: "Official Languages", 
          content: "The official languages are English and Swahili. Luganda is also widely spoken, especially around the capital, Kampala.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A trip from Japan to Uganda is very long, taking 16 hours or more with at least one connection.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Ugandan Shilling (UGX).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Hello' is understood. In Luganda, you can say 'Oli otya?' which means 'How are you?'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Matoke (a dish of steamed green bananas) is a staple. A popular street food is the 'Rolex' - a rolled chapati filled with eggs and vegetables.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous Ugandans include Olympic marathon champion Stephen Kiprotich and climate activist Vanessa Nakate.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Famous Japanese Things", 
          content: "Used cars and motorcycles from Japan are very common and highly valued in Uganda for their reliability and quality.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Independence Day is celebrated on October 9th. Other public holidays include Christmas, Easter, and Eid al-Fitr.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "The Nyege Nyege Festival is a large international music festival that attracts people from all over Africa and the world.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Football (Soccer) is the most followed sport. Uganda is also very strong in Athletics, especially long-distance running.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "The school day is long, often from 8:00 AM to 5:00 PM. Lessons are usually 40 minutes long, and many students may walk long distances to get to school.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The academic year is divided into three terms with holidays in between. The longest holiday is at the end of the year, from December to January.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Education is highly valued. Students study English, Maths, Science, and Social Studies. Classes can be very large.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Children love to play football. They also make their own toys, such as cars from wire or balls from plastic bags.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "In many public schools, students are served a simple meal of 'posho' (a thick porridge made from maize flour) and beans.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "After school, many students have chores to do at home. Some participate in school clubs for debate, music, or sports.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/uganda-popup-bg.png", 
          content_img: "images/countries/uganda/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'The bird on the Ugandan flag is a Grey Crowned Crane.', answer: 'True' },
          { type: 'multiple-choice', question: "In Uganda, what is a 'Rolex'?", options: ['A luxury watch', 'A type of food', 'A famous car'], answer: 'A type of food' },
          { type: 'true-false', question: "Uganda is called the 'Pearl of Africa'.", answer: 'True' },
          { type: 'multiple-choice', question: "What is 'Matoke' made from?", options: ['Potatoes', 'Rice', 'Bananas'], answer: 'Bananas' },
          { type: 'true-false', question: "Lake Victoria, one of the largest lakes in the world, is partly in Uganda.", answer: 'True' },
          { type: 'multiple-choice', question: "What is the capital of Uganda?", options: ['Nairobi', 'Kampala', 'Entebbe'], answer: 'Kampala' },
          { type: 'true-false', question: 'The official languages are English and French.', answer: 'False' },
          { type: 'multiple-choice', question: "What is 'posho'?", options: ['A type of car', 'A school subject', 'A type of porridge'], answer: 'A type of porridge' },
          { type: 'true-false', question: 'The school day in Uganda is very short.', answer: 'False' },
          { type: 'multiple-choice', question: 'Stephen Kiprotich is a famous Ugandan...?', options: ['Musician', 'Marathon runner', 'Scientist'], answer: 'Marathon runner' },
          { type: 'true-false', question: "A popular toy is a car made from wire.", answer: 'True' },
          { type: 'multiple-choice', question: "The greeting 'Oli otya?' means...?", options: ['Goodbye', 'How are you?', 'Thank you'], answer: 'How are you?' },
          { type: 'true-false', question: 'Independence Day is on October 9th.', answer: 'True' },
          { type: 'multiple-choice', question: 'What Japanese product is very common in Uganda?', options: ['Anime', 'Used cars', 'Ramen'], answer: 'Used cars' },
          { type: 'true-false', question: 'The Nyege Nyege Festival is a traditional religious holiday.', answer: 'False' },
        ]
      },
    },
    // =========================================================================
    // JAMAICA
    // =========================================================================
    {
      id: 'jamaica',
      name: 'Jamaica',
      capital: 'Kingston',
      coordinates: { lat: 17.9836, lon: -76.8099 },
      timezones: ['America/Jamaica'],
      flag_img: 'https://flagcdn.com/w320/jm.png',
      name_header_img: 'images/countries/headers/jamaica-header.png',
      background_img: 'images/countries/jamaica/background.jpg',
      background_music: 'audio/music/jamaica.mp3',
      national_anthem: 'audio/anthems/jamaica.mp3',
      accent_color: '#009B3A',
      accent_color_secondary: '#FED100',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is English. However, most Jamaicans speak Jamaican Patois, a colorful and expressive creole language.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "There are no direct flights. Traveling from Japan to Jamaica takes a long time, usually over 17 hours with connections.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Jamaican Dollar (JMD).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "In English, you say 'Hello'. In Patois, a common greeting is 'Wah gwaan?' which means 'What's going on?'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "The national dish is Ackee and Saltfish. Jerk chicken, which is spicy grilled chicken, is famous all over the world. Rice and peas (rice with beans) is a common side dish.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Jamaica is the birthplace of Reggae music legend Bob Marley. The world's fastest man, Usain Bolt, is also from Jamaica.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Famous Japanese Things", 
          content: "Japanese car brands are extremely popular and trusted in Jamaica. Also, the sound system culture in Jamaica has influenced Japanese reggae and dancehall scenes.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Independence Day is celebrated on August 6th and Emancipation Day on August 1st, both with parades and parties.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "Reggae Sumfest is a huge annual music festival attracting artists and fans from around the world.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "The most popular sport is Cricket. However, Jamaica is world-famous for its incredible athletes in Track and Field.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "School typically runs from around 7:30 AM to 2:30 PM. Classes are usually 40-45 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The main holidays are a long summer break, a Christmas break, and an Easter break.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study standard subjects like English, Mathematics, and Science, as well as Social Studies and Spanish.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Cricket is a popular game to play during break time. Students also play football (soccer) and various running games.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Schools have canteens or 'tuck shops' where students can buy lunch, often including patties (meat-filled pastries) and juice.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Many students are involved in sports, especially track and field and cricket. Music and dance are also popular activities.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/jamaica-popup-bg.png", 
          content_img: "images/countries/jamaica/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'Bob Marley was a famous musician from Jamaica.', answer: 'True' },
          { type: 'multiple-choice', question: "What is Jamaica's national dish?", options: ['Jerk Chicken', 'Curry Goat', 'Ackee and Saltfish'], answer: 'Ackee and Saltfish' },
          { type: 'true-false', question: 'Jamaica is an island in the Pacific Ocean.', answer: 'False' },
          { type: 'multiple-choice', question: "Usain Bolt is a famous Jamaican...?", options: ['Singer', 'Swimmer', 'Sprinter'], answer: 'Sprinter' },
          { type: 'true-false', question: "The official language of Jamaica is Spanish.", answer: 'False' },
          { type: 'multiple-choice', question: "What style of music is famously from Jamaica?", options: ['Jazz', 'Reggae', 'Hip Hop'], answer: 'Reggae' },
          { type: 'true-false', question: 'The most popular sport in Jamaica is Ice Hockey.', answer: 'False' },
          { type: 'multiple-choice', question: 'The greeting "Wah gwaan?" means...?', options: ["What's your name?", "What's going on?", "Where are you from?"], answer: "What's going on?" },
          { type: 'true-false', question: 'A Jamaican "patty" is a type of hat.', answer: 'False' },
          { type: 'multiple-choice', question: "What is the most popular sport to watch and play in Jamaica?", options: ['Cricket', 'Baseball', 'Volleyball'], answer: 'Cricket' },
          { type: 'true-false', question: 'Reggae Sumfest is a food festival.', answer: 'False' },
          { type: 'multiple-choice', question: 'A school canteen in Jamaica is called a...?', options: ['Comedor', 'Tuck shop', 'Stolovaya'], answer: 'Tuck shop' },
          { type: 'true-false', question: 'Flying to Jamaica from Japan takes less than 10 hours.', answer: 'False' },
          { type: 'multiple-choice', question: "Which of these is NOT a main color of the Jamaican flag?", options: ['Green', 'Gold', 'Red'], answer: 'Red' },
          { type: 'true-false', question: "Rice and peas is a common side dish in Jamaica.", answer: 'True' },
        ]
      },
    },
    // =========================================================================
    // ESTONIA
    // =========================================================================
    {
      id: 'estonia',
      name: 'Estonia',
      capital: 'Tallinn',
      coordinates: { lat: 59.4370, lon: 24.7536 },
      timezones: ['Europe/Tallinn'],
      flag_img: 'https://flagcdn.com/w320/ee.png',
      name_header_img: 'images/countries/headers/estonia-header.png',
      background_img: 'images/countries/estonia/background.jpg',
      background_music: 'audio/music/estonia.mp3',
      national_anthem: 'audio/anthems/estonia.mp3',
      accent_color: '#4891D9',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is Estonian, which is related to Finnish and Hungarian, not to Russian or German.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "There are no direct flights. A journey with one stop usually takes about 12 to 14 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "Estonia uses the Euro (€). Before 2011, they used the Estonian Kroon.", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "A simple 'Tere' means 'Hello'. 'Kuidas läheb?' means 'How is it going?'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Dark rye bread ('leib') is a staple food eaten with almost every meal. Other traditional foods include Verivorst (blood sausage) and Kama (a mix of roasted grains).", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Estonia is known for composer Arvo Pärt, supermodel Carmen Kass, and many of the original developers of Skype.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Famous Japanese People", 
          content: "Sumo wrestler Baruto Kaito (Kaido Höövelson) is an Estonian who became very famous in Japan. He is now a politician in Estonia.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Major holidays are Independence Day (Feb 24), Victory Day (June 23), and Christmas.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "The Estonian Song Festival is a massive event held every five years where thousands of singers perform together. Jaanipäev (Midsummer's Day) is a huge celebration with bonfires.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Basketball and cross-country skiing are popular. Estonia also invented the sport of Kiiking, which involves swinging 360 degrees on a giant swing.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "The school day usually starts at 8:00 or 8:15 AM and ends around 3:00 PM. Lessons are 45 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The school year starts on September 1st. There are holidays in autumn, winter (Christmas), spring, and a long summer holiday.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students have high-level education in Maths, Science, and IT. They also study Estonian, a foreign language (often English), History, and Arts.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Standard playground games are common. Due to the long winters, indoor activities and sports like basketball are popular.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "By law, every student in basic and secondary education receives a free, hot school lunch every day.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Many schools offer 'huviringid' (hobby clubs) for free, such as folk dance, choir, robotics, and art.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/estonia-popup-bg.png", 
          content_img: "images/countries/estonia/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'Estonia is famous for its high-tech digital society.', answer: 'True' },
          { type: 'multiple-choice', question: "What is the capital of Estonia?", options: ['Riga', 'Vilnius', 'Tallinn'], answer: 'Tallinn' },
          { type: 'true-false', question: 'Skype was originally created by developers from Estonia.', answer: 'True' },
          { type: 'multiple-choice', question: "What currency does Estonia use?", options: ['Kroon', 'Euro', 'Ruble'], answer: 'Euro' },
          { type: 'true-false', question: "Estonia has more people than Japan.", answer: 'False' },
          { type: 'multiple-choice', question: 'What is the Estonian word for "Hello"?', options: ['Hola', 'Bonjour', 'Tere'], answer: 'Tere' },
          { type: 'true-false', question: 'All students in Estonia have to pay for their school lunch.', answer: 'False' },
          { type: 'multiple-choice', question: "What is 'leib'?", options: ['A type of soup', 'A type of bread', 'A type of cheese'], answer: 'A type of bread' },
          { type: 'true-false', question: 'The Estonian Song Festival is held every year.', answer: 'False' },
          { type: 'multiple-choice', question: 'Kiiking is a unique sport from Estonia involving a large...?', options: ['Ball', 'Swing', 'Boat'], answer: 'Swing' },
          { type: 'true-false', question: 'The Estonian language is closely related to Russian.', answer: 'False' },
          { type: 'multiple-choice', question: "Which of these companies has Estonian roots?", options: ['Google', 'Skype', 'Facebook'], answer: 'Skype' },
          { type: 'true-false', question: 'Baruto Kaito is a famous Estonian politician who was a sumo wrestler in Japan.', answer: 'True' },
          { type: 'multiple-choice', question: 'Jaanipäev is a festival that celebrates...?', options: ['The New Year', 'Winter', 'Midsummer'], answer: 'Midsummer' },
          { type: 'true-false', question: 'Uniforms are very common in Estonian schools.', answer: 'False' },
        ]
      },
    },
    // =========================================================================
    // NIGERIA
    // =========================================================================
    {
      id: 'nigeria',
      name: 'Nigeria',
      capital: 'Abuja',
      coordinates: { lat: 9.0765, lon: 7.3986 },
      timezones: ['Africa/Lagos'],
      flag_img: 'https://flagcdn.com/w320/ng.png',
      name_header_img: 'images/countries/headers/nigeria-header.png',
      background_img: 'images/countries/nigeria/background.jpg',
      background_music: 'audio/music/nigeria.mp3',
      national_anthem: 'audio/anthems/nigeria.mp3',
      accent_color: '#008751',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is English. However, there are over 500 other languages spoken, including major ones like Hausa, Igbo, and Yoruba.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "There are no direct flights. A trip to Nigeria from Japan takes a long time, usually 17 hours or more with connections.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Nigerian Naira (NGN).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Hello' is common. In Yoruba, you can say 'Bawo ni?' and in Hausa, 'Sannu'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Jollof Rice is a famous and beloved rice dish. Other popular foods include Pounded Yam (eaten with soups) and Suya (spicy grilled meat skewers).", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Nigeria is home to Nobel Prize-winning author Wole Soyinka, famous writer Chimamanda Ngozi Adichie, and global music stars like Burna Boy and Wizkid.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Famous Japanese Things", 
          content: "Japanese technology, especially cars from brands like Toyota and Honda, are extremely popular in Nigeria due to their durability and reliability.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Independence Day is on October 1st. Other major public holidays include Christmas, Easter, and Muslim celebrations like Eid al-Fitr and Eid al-Adha.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "The Durbar festival in northern Nigeria features a spectacular parade of horsemen. The New Yam Festival celebrates the yam harvest in many communities.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "National Sport", 
          content: "Football (Soccer) is extremely popular and is a source of great national pride. The national team is called the 'Super Eagles'.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "School days typically run from 8:00 AM to 2:00 PM. Students are expected to be very respectful to their teachers. Lessons are typically 35-40 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "There are three main holidays: a short break at Easter, a long summer holiday, and a break for Christmas.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Core subjects include English, Mathematics, Social Studies, and Basic Science. There is a strong focus on academic achievement.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Football is played everywhere. Other games include 'Suwe' (a type of hopscotch) and clapping games.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "There isn't a national school lunch program, so students often buy snacks from school vendors or bring food from home.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "After school, students often have chores or attend extra lessons. School clubs for debate, drama, and sports are also common.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/nigeria-popup-bg.png", 
          content_img: "images/countries/nigeria/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'Nigeria is the most populous country in Africa.', answer: 'True' },
          { type: 'multiple-choice', question: "The Nigerian film industry is known as...?", options: ['Hollywood', 'Bollywood', 'Nollywood'], answer: 'Nollywood' },
          { type: 'true-false', question: 'The capital of Nigeria is Lagos.', answer: 'False' },
          { type: 'multiple-choice', question: "What is a famous Nigerian rice dish?", options: ['Paella', 'Biryani', 'Jollof Rice'], answer: 'Jollof Rice' },
          { type: 'true-false', question: "The national football team is called the 'Super Lions'.", answer: 'False' },
          { type: 'multiple-choice', question: "How many languages are spoken in Nigeria?", options: ['About 10', 'About 50', 'Over 500'], answer: 'Over 500' },
          { type: 'true-false', question: 'The official language of Nigeria is French.', answer: 'False' },
          { type: 'multiple-choice', question: "What is 'Suya'?", options: ['A type of soup', 'Spicy grilled meat', 'A type of bread'], answer: 'Spicy grilled meat' },
          { type: 'true-false', question: 'The Durbar festival features a parade of boats.', answer: 'False' },
          { type: 'multiple-choice', question: "The currency of Nigeria is the...?", options: ['Naira', 'Cedi', 'Shilling'], answer: 'Naira' },
          { type: 'true-false', question: 'Burna Boy is a famous Nigerian author.', answer: 'False' },
          { type: 'multiple-choice', question: "Which of these is a major language in Nigeria?", options: ['Swahili', 'Yoruba', 'Arabic'], answer: 'Yoruba' },
          { type: 'true-false', question: 'Independence Day in Nigeria is on October 1st.', answer: 'True' },
          { type: 'multiple-choice', question: 'What is Pounded Yam eaten with?', options: ['Ice cream', 'Soups', 'Salad'], answer: 'Soups' },
          { type: 'true-false', question: 'Students in Nigeria are not required to wear uniforms.', answer: 'False' },
        ]
      },
    },
    // =========================================================================
    // ENGLAND
    // =========================================================================
    {
      id: 'england',
      name: 'England',
      capital: 'London',
      coordinates: { lat: 51.5072, lon: -0.1276 },
      timezones: ['Europe/London'],
      flag_img: 'https://flagcdn.com/w320/gb.png',
      name_header_img: 'images/countries/headers/england-header.png',
      background_img: 'images/countries/england/background.jpg',
      background_music: 'audio/music/england.mp3',
      national_anthem: 'audio/anthems/england.mp3',
      accent_color: '#CE1124',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "English. England is part of the United Kingdom (UK), which also includes Scotland, Wales, and Northern Ireland.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/general-info/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A direct flight from Tokyo to London takes about 12 to 14 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/general-info/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Pound Sterling (£ or GBP). The notes feature a portrait of the current monarch.", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Hello' is standard. 'Alright?' or 'Cheers' are also very common, friendly greetings.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/general-info/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Classic English dishes include Fish and Chips, a Sunday Roast (roasted meat with potatoes and vegetables), and Shepherd's Pie. Afternoon tea with scones is a famous tradition.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "England is home to William Shakespeare, The Beatles, scientist Isaac Newton, and author J.K. Rowling (Harry Potter).", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Famous Japanese People", 
          content: "Author Kazuo Ishiguro was born in Japan but moved to England as a child. He writes in English and won the Nobel Prize in Literature.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Major holidays are Christmas, Easter, and several 'Bank Holidays' throughout the year which create long weekends.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/culture-holidays-img.jpg" 
        },
        festivals: { 
          title: "Festivals", 
          content: "Guy Fawkes Night (Bonfire Night) on November 5th is celebrated with bonfires and fireworks. Major music festivals like Glastonbury are famous worldwide.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/culture-festivals-img.jpg" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "The national sport is Cricket, but Football (Soccer) is the most popular sport by far. The Premier League is famous globally.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/culture-sports-img.jpg" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "School days are typically from 9:00 AM to 3:30 PM. After a morning assembly, students have several lessons. Lessons are usually 45-60 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "There is a long summer holiday (about 6 weeks), and shorter holidays for Christmas and Easter, plus half-term breaks.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study English, Maths, and Science, along with humanities (like History and Geography) and creative arts.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "In the playground, children play football, tag (called 'it'), and skipping games. Conkers is a traditional autumn game.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Students eat in a dining hall and can have a hot 'school dinner' or bring a packed lunch from home.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Students can join many clubs, such as chess, choir, drama, and various sports teams like football, rugby, and netball.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/england-popup-bg.png", 
          content_img: "images/countries/england/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'The capital of England is Manchester.', answer: 'False' },
          { type: 'multiple-choice', question: 'What is a famous meal in England?', options: ['Pizza', 'Tacos', 'Fish and Chips'], answer: 'Fish and Chips' },
          { type: 'true-false', question: 'Big Ben is the name of the famous clock tower in London.', answer: 'True' },
          { type: 'multiple-choice', question: "What is the currency of England?", options: ['Euro', 'Dollar', 'Pound'], answer: 'Pound' },
          { type: 'true-false', question: "The Beatles were a famous band from England.", answer: 'True' },
          { type: 'multiple-choice', question: "What is England's national sport?", options: ['Football', 'Cricket', 'Rugby'], answer: 'Cricket' },
          { type: 'true-false', question: 'A Sunday Roast is a type of breakfast.', answer: 'False' },
          { type: 'multiple-choice', question: 'J.K. Rowling, author of Harry Potter, is from...?', options: ['The USA', 'Canada', 'England'], answer: 'England' },
          { type: 'true-false', question: 'Afternoon tea with scones is a famous English tradition.', answer: 'True' },
          { type: 'multiple-choice', question: "What is celebrated on November 5th with bonfires?", options: ['Halloween', 'Guy Fawkes Night', 'Christmas'], answer: 'Guy Fawkes Night' },
          { type: 'true-false', question: 'Most schools in England do not require uniforms.', answer: 'False' },
          { type: 'multiple-choice', question: 'What is the most popular sport in England?', options: ['Cricket', 'Football', 'Rugby'], answer: 'Football' },
          { type: 'true-false', question: "Kazuo Ishiguro is a famous Japanese-born author who writes in English.", answer: 'True' },
          { type: 'multiple-choice', question: "What is the game of 'it' in England?", options: ['A card game', 'Tag', 'Hide-and-seek'], answer: 'Tag' },
          { type: 'true-false', question: 'Glastonbury is a famous food festival.', answer: 'False' },
        ]
      },
    },
    // =========================================================================
    // PHILIPPINES
    // =========================================================================
    {
      id: 'philippines',
      name: 'Philippines',
      capital: 'Manila',
      coordinates: { lat: 14.5995, lon: 120.9842 },
      timezones: ['Asia/Manila'],
      flag_img: 'https://flagcdn.com/w320/ph.png',
      name_header_img: 'images/countries/headers/philippines-header.png',
      background_img: 'images/countries/philippines/background.jpg',
      background_music: 'audio/music/philippines.mp3',
      national_anthem: 'audio/anthems/philippines.mp3',
      accent_color: '#0038A8',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Languages", 
          content: "The official languages are Filipino (which is based on Tagalog) and English. English is widely used in business and education.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A direct flight from Tokyo to Manila is quite short, taking about 4 to 5 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Philippine Peso (PHP).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Hello' is common. In Filipino, you can say 'Kumusta'. A respectful way to speak to elders is to add 'po'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Adobo (meat stewed in soy sauce and vinegar) is considered the national dish. Other popular dishes are Sinigang (a sour soup) and Lechon (roasted pig).", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "World-famous Filipinos include boxer Manny Pacquiao, singer Lea Salonga (the voice of Disney's Jasmine and Mulan), and national hero Jose Rizal.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Famous Japanese Things", 
          content: "Karaoke is incredibly popular in the Philippines, a pastime that originated in Japan. Anime and J-pop also have a large and dedicated fanbase.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Christmas is a very big deal, with celebrations starting as early as September! Other key holidays are Easter and Independence Day (June 12).", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "There are many colorful 'fiestas' throughout the year to honor local saints, often featuring parades, dancing, and music.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "The official national sport is Arnis, a martial art. However, the most popular sport by far is Basketball.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "Schools are often crowded, so classes may run in morning (e.g., 7 AM-12 PM) or afternoon (1 PM-6 PM) shifts. Classes are usually around 40-50 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The school year starts in June. There is a long Christmas break and a long summer vacation in April and May.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Classes are taught in both English and Filipino. Students study core subjects like Science, Math, and English, as well as Filipino history and culture.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Popular games include 'Tumbang Preso' (hitting a can with a slipper) and 'Patintero' (a type of team tag). Basketball is also played everywhere.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Students bring a packed lunch, called 'baon', from home. Rice is a staple of almost every meal.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Students participate in basketball, volleyball, or join clubs for dance, singing, or academics.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/philippines-popup-bg.png", 
          content_img: "images/countries/philippines/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'The Philippines is made up of over 7,000 islands.', answer: 'True' },
          { type: 'multiple-choice', question: 'What is the most popular sport in the Philippines?', options: ['Soccer', 'Basketball', 'Baseball'], answer: 'Basketball' },
          { type: 'true-false', question: 'The capital of the Philippines is Cebu.', answer: 'False' },
          { type: 'multiple-choice', question: "What is a famous Filipino meat stew?", options: ['Adobo', 'Ramen', 'Curry'], answer: 'Adobo' },
          { type: 'true-false', question: "Christmas celebrations in the Philippines are very short.", answer: 'False' },
          { type: 'multiple-choice', question: "What is a packed lunch called in the Philippines?", options: ['Bento', 'Tiffin', 'Baon'], answer: 'Baon' },
          { type: 'true-false', question: 'Lea Salonga was the singing voice of Disney princess Mulan.', answer: 'True' },
          { type: 'multiple-choice', question: 'What is the official national sport of the Philippines?', options: ['Arnis', 'Basketball', 'Boxing'], answer: 'Arnis' },
          { type: 'true-false', question: 'Adding "po" when speaking makes a sentence less polite.', answer: 'False' },
          { type: 'multiple-choice', question: "What Japanese activity is very popular in the Philippines?", options: ['Sumo', 'Karaoke', 'Tea Ceremony'], answer: 'Karaoke' },
          { type: 'true-false', question: 'The flight from Tokyo to Manila is over 10 hours.', answer: 'False' },
          { type: 'multiple-choice', question: 'What is Sinigang?', options: ['A sweet dessert', 'A sour soup', 'A type of bread'], answer: 'A sour soup' },
          { type: 'true-false', question: 'English is one of the official languages.', answer: 'True' },
          { type: 'multiple-choice', question: "What does 'Kumusta' mean?", options: ['Goodbye', 'Thank you', 'Hello'], answer: 'Hello' },
          { type: 'true-false', question: 'Lechon is a roasted vegetable dish.', answer: 'False' },
        ]
      },
    },
    // =========================================================================
    // MEXICO
    // =========================================================================
    {
      id: 'mexico',
      name: 'Mexico',
      capital: 'Mexico City',
      coordinates: { lat: 19.4326, lon: -99.1332 },
      timezones: [
        'America/Tijuana',     // Northwest
        'America/Mazatlan',    // Pacific
        'America/Mexico_City', // Central
        'America/Cancun'       // Southeast
      ],
      flag_img: 'https://flagcdn.com/w320/mx.png',
      name_header_img: 'images/countries/headers/mexico-header.png',
      background_img: 'images/countries/mexico/background.jpg',
      background_music: 'audio/music/mexico.mp3',
      national_anthem: 'audio/anthems/mexico.mp3',
      accent_color: '#006847',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "Spanish is the official language. Mexico is the most populous Spanish-speaking country in the world.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A direct flight from Tokyo to Mexico City takes about 12 to 13 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Mexican Peso (MXN). The symbol is also '$', so it's important not to confuse it with the US dollar.", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "The most common greeting is 'Hola' (Hello). You can also say 'Buenos días' (Good morning).", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Mexican food is famous worldwide! Popular dishes include tacos, enchiladas, tamales, and guacamole. Many dishes use corn, beans, and chili peppers.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous Mexicans include artist Frida Kahlo, director Guillermo del Toro, and actress Salma Hayek.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Famous Japanese Things", 
          content: "Lucha Libre wrestlers like Último Dragón became famous in Japan, and Japanese wrestlers like Jushin 'Thunder' Liger are legends in Mexico.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Independence Day is September 16th. Families also celebrate Christmas and Easter with unique traditions.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "Día de los Muertos (Day of the Dead) in November is a famous holiday where families honor their ancestors with altars and celebrations.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Football (Soccer) is the most popular sport. Boxing and Lucha Libre (professional wrestling with colorful masks) are also very popular.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "To handle many students, schools often run in two shifts: a morning shift (matutino) from about 8 AM to 1 PM, and an afternoon shift (vespertino). Lessons are typically 50 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The main school holidays are a long summer break, a Christmas break, and a break for Easter week.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study Spanish, Mathematics, Natural Sciences, History, and Civic Education. English is also taught as a foreign language.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "During recess ('recreo'), students play games like hide-and-seek ('escondidas'), tag ('la traes'), and soccer.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "It is not common to have a school cafeteria. Students usually have a short break to eat a snack from home or buy from small shops at the school.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Many students help their families after school. Others might play soccer in their neighborhood or take music lessons.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/mexico-popup-bg.png", 
          content_img: "images/countries/mexico/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'Chocolate was first discovered in Mexico.', answer: 'True' },
          { type: 'multiple-choice', question: 'What is the most popular sport in Mexico?', options: ['Baseball', 'Soccer', 'Basketball'], answer: 'Soccer' },
          { type: 'true-false', question: 'Mexico is located in South America.', answer: 'False' },
          { type: 'multiple-choice', question: "What is the famous masked wrestling in Mexico called?", options: ['Sumo', 'Lucha Libre', 'Judo'], answer: 'Lucha Libre' },
          { type: 'true-false', question: 'The main language in Mexico is Portuguese.', answer: 'False' },
          { type: 'multiple-choice', question: "What is a famous Mexican holiday honoring the dead?", options: ['Halloween', 'Day of the Dead', 'Christmas'], answer: 'Day of the Dead' },
          { type: 'true-false', question: 'Frida Kahlo was a famous Mexican scientist.', answer: 'False' },
          { type: 'multiple-choice', question: "What is the capital of Mexico?", options: ['Cancun', 'Tijuana', 'Mexico City'], answer: 'Mexico City' },
          { type: 'true-false', question: 'Guacamole is a dish made from avocados.', answer: 'True' },
          { type: 'multiple-choice', question: 'A school running in two shifts is common. The morning shift is called...?', options: ['Matutino', 'Vespertino', 'Recreo'], answer: 'Matutino' },
          { type: 'true-false', question: 'The currency of Mexico is the US Dollar.', answer: 'False' },
          { type: 'multiple-choice', question: "What is 'recreo'?", options: ['A subject', 'Recess / break time', 'A type of food'], answer: 'Recess / break time' },
          { type: 'true-false', question: "Mexican Independence Day is on May 5th.", answer: 'False' },
          { type: 'multiple-choice', question: 'Which Japanese wrestler is a legend in Mexico?', options: ['Antonio Inoki', 'Giant Baba', 'Jushin "Thunder" Liger'], answer: 'Jushin "Thunder" Liger' },
          { type: 'true-false', question: 'Tamales are a popular Mexican food.', answer: 'True' },
        ]
      },
    },
    // =========================================================================
    // GUAM
    // =========================================================================
    {
      id: 'guam',
      name: 'Guam',
      capital: 'Hagåtña',
      coordinates: { lat: 13.4729, lon: 144.7466 },
      timezones: ['Pacific/Guam'],
      flag_img: 'https://flagcdn.com/w320/gu.png',
      name_header_img: 'images/countries/headers/guam-header.png',
      background_img: 'images/countries/guam/background.jpg',
      background_music: 'audio/music/guam.mp3',
      national_anthem: 'audio/anthems/guam.mp3',
      accent_color: '#C22739',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Languages", 
          content: "The official languages are English and Chamorro, the indigenous language of the people of Guam.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/general-info/content-images//general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "Guam is a popular tourist destination for Japanese people because it is very close. A direct flight takes only about 3 to 4 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/general-info/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "Guam is a territory of the United States, so the currency is the U.S. Dollar (USD).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Hello' is common. The traditional Chamorro greeting is 'Håfa Adai' (pronounced like 'half-a-day').", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/general-info/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Local food has Spanish, Filipino, and American influences. Popular dishes include Red Rice, Kelaguen (a dish like ceviche), and delicious barbecue.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Singer Pia Mia is from Guam.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Japanese Influence", 
          content: "Because so many Japanese tourists visit, many shops and hotels in Guam have Japanese-speaking staff and signs in Japanese.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "As a U.S. territory, Guam celebrates American holidays like Thanksgiving and Christmas.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/culture-holidays-img.jpg" 
        },
        festivals: { 
          title: "Festivals", 
          content: "Liberation Day on July 21st is the biggest holiday, celebrating the end of the World War II occupation with a large parade and carnival.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/culture-festivals-img.jpg" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Sports are heavily influenced by the United States. Baseball, Basketball, and American Football are all very popular.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/culture-sports-img.jpg" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "The school system is based on the American model. The school day typically runs from 8 AM to 3 PM. Classes are usually 45-55 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The school calendar is similar to the U.S., with a long summer break, and breaks for Christmas and spring.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/school-holidays-img.jpg" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study the same core subjects as in the U.S. There are also efforts to teach the Chamorro language and culture in schools.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Baseball and basketball are popular games to play during recess and after school.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/school-games-img.jpg" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "The school lunch program is similar to the U.S., with students eating in a cafeteria.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/school-lunch-img.jpg" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Students can join sports teams, academic clubs, and cultural groups that practice traditional Chamorro dance and music.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/guam-popup-bg.png", 
          content_img: "images/countries/guam/content-images/school-after-school-img.jpg" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'Guam is an independent country.', answer: 'False' },
          { type: 'multiple-choice', question: "What currency is used in Guam?", options: ['Guam Dollar', 'Japanese Yen', 'U.S. Dollar'], answer: 'U.S. Dollar' },
          { type: 'true-false', question: "The traditional greeting in Guam is 'Aloha'.", answer: 'False' },
          { type: 'multiple-choice', question: "What is the biggest holiday in Guam?", options: ['Christmas', 'Liberation Day', 'New Year\'s Day'], answer: 'Liberation Day' },
          { type: 'true-false', question: "Guam is very far from Japan.", answer: 'False' },
          { type: 'multiple-choice', question: "What does 'Håfa Adai' mean?", options: ['Goodbye', 'Hello', 'Thank you'], answer: 'Hello' },
          { type: 'true-false', question: 'Kelaguen is a type of sweet dessert.', answer: 'False' },
          { type: 'multiple-choice', question: 'The school system in Guam is based on the system of which country?', options: ['Japan', 'Spain', 'United States'], answer: 'United States' },
          { type: 'true-false', question: 'The flight from Japan to Guam takes about 8 hours.', answer: 'False' },
          { type: 'multiple-choice', question: 'What is a popular sport in Guam?', options: ['Cricket', 'Ice Hockey', 'Baseball'], answer: 'Baseball' },
          { type: 'true-false', question: 'Red Rice is a popular food in Guam.', answer: 'True' },
          { type: 'multiple-choice', question: 'What is the other official language of Guam besides English?', options: ['Spanish', 'Chamorro', 'Tagalog'], answer: 'Chamorro' },
          { type: 'true-false', question: 'Liberation Day celebrates independence from Spain.', answer: 'False' },
          { type: 'multiple-choice', question: 'Pia Mia is a famous...?', options: ['Scientist', 'Singer', 'Politician'], answer: 'Singer' },
          { type: 'true-false', question: 'You will find many signs in Japanese in Guam.', answer: 'True' },
        ]
      },
    },
    // =========================================================================
    // CAMEROON
    // =========================================================================
    {
      id: 'cameroon',
      name: 'Cameroon',
      capital: 'Yaoundé',
      coordinates: { lat: 3.8480, lon: 11.5021 },
      timezones: ['Africa/Douala'],
      flag_img: 'https://flagcdn.com/w320/cm.png',
      name_header_img: 'images/countries/headers/cameroon-header.png',
      background_img: 'images/countries/cameroon/background.jpg',
      background_music: 'audio/music/cameroon.mp3',
      national_anthem: 'audio/anthems/cameroon.mp3',
      accent_color: '#FCD116',
      accent_color_secondary: '#007A5E',
      
      general_info: {
        languages: { 
          title: "Official Languages", 
          content: "Cameroon is bilingual, with French and English as its official languages. There are also over 250 local languages spoken.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "Getting to Cameroon from Japan requires multiple flights and takes 18 hours or more.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Central African CFA franc (XAF).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "You can say 'Bonjour' in the French-speaking parts and 'Hello' in the English-speaking parts.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Ndolé, a stew made with nuts, fish, and bitter leaves, is the national dish. Other popular foods are Fufu (a dough-like food) and grilled meat skewers called Brochettes.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Footballer Samuel Eto'o is a national hero. Musician Manu Dibango was world-famous, and Francis Ngannou is a champion MMA fighter.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Japanese Influence", 
          content: "The Japan International Cooperation Agency (JICA) is active in Cameroon, helping with projects in fishing, education, and infrastructure.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "National Day on May 20th is a major public holiday. Youth Day is celebrated on February 11th.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "The Ngondo festival is a large traditional festival held by the Sawa people on the coast to celebrate their culture and connection to water.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "National Sport", 
          content: "Football (Soccer) is a national obsession. The national team is called the 'Indomitable Lions' and is one of Africa's most successful teams.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "The school day usually runs from 7:30 AM to 3:30 PM. The education system is split between French and English models. Lessons are typically 50-55 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "There are breaks for Christmas and Easter, and a long summer holiday from June to September.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students follow either a French-based or English-based curriculum, studying language, maths, science, and history.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Football is the most common game played during breaks. Kids also play clapping games and hide-and-seek.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Most students go home for lunch or buy food like beignets (a type of donut) from vendors near the school.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "After school, many students help with family businesses or chores. Some participate in football practice or private lessons.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/cameroon-popup-bg.png", 
          content_img: "images/countries/cameroon/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'Cameroon is known as "Africa in Miniature" because of its diverse landscape.', answer: 'True' },
          { type: 'multiple-choice', question: "What is the most popular sport in Cameroon?", options: ['Basketball', 'Wrestling', 'Football'], answer: 'Football' },
          { type: 'true-false', question: "Cameroon has only one official language.", answer: 'False' },
          { type: 'multiple-choice', question: "The national football team is called the...?", options: ['Indomitable Lions', 'Super Eagles', 'Brave Warriors'], answer: 'Indomitable Lions' },
          { type: 'true-false', question: "The capital of Cameroon is Douala.", answer: 'False' },
          { type: 'multiple-choice', question: "What is Ndolé?", options: ['A type of dance', 'A traditional stew', 'A musical instrument'], answer: 'A traditional stew' },
          { type: 'true-false', question: 'The currency used is the Cameroon Dollar.', answer: 'False' },
          { type: 'multiple-choice', question: 'Samuel Eto\'o is a famous Cameroonian...?', options: ['Musician', 'Footballer', 'Politician'], answer: 'Footballer' },
          { type: 'true-false', question: 'The school system in Cameroon is only in French.', answer: 'False' },
          { type: 'multiple-choice', question: "What are Brochettes?", options: ['A type of bread', 'A school subject', 'Grilled meat skewers'], answer: 'Grilled meat skewers' },
          { type: 'true-false', question: 'The Ngondo festival is a national music competition.', answer: 'False' },
          { type: 'multiple-choice', question: 'What is a "beignet"?', options: ['A type of donut', 'A school uniform', 'A common game'], answer: 'A type of donut' },
          { type: 'true-false', question: 'Francis Ngannou is a famous musician.', answer: 'False' },
          { type: 'multiple-choice', question: "Besides French, what is the other official language?", options: ['Spanish', 'German', 'English'], answer: 'English' },
          { type: 'true-false', question: 'The national day of Cameroon is on May 20th.', answer: 'True' },
        ]
      },
    },
    // =========================================================================
    // INDIA
    // =========================================================================
    {
      id: 'india',
      name: 'India',
      capital: 'New Delhi',
      coordinates: { lat: 28.6139, lon: 77.2090 },
      timezones: ['Asia/Kolkata'],
      flag_img: 'https://flagcdn.com/w320/in.png',
      name_header_img: 'images/countries/headers/india-header.png',
      background_img: 'images/countries/india/background.jpg',
      background_music: 'audio/music/india.mp3',
      national_anthem: 'audio/anthems/india.mp3',
      accent_color: '#FF9933',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Languages", 
          content: "The official languages of the central government are Hindi and English. There are also 21 other languages recognized as official in different states.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A direct flight from Tokyo to Delhi takes about 8 to 9 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Indian Rupee (INR).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Namaste', with palms pressed together, is a respectful greeting used across the country.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Indian cuisine is diverse and varies by region. It is famous for its use of spices. Popular dishes include various types of Curry, Biryani (a mixed rice dish), and Samosas (a fried pastry).", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous Indians include independence leader Mahatma Gandhi, actors Shah Rukh Khan and Priyanka Chopra, and Google CEO Sundar Pichai.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Japanese Influence", 
          content: "Japanese companies like Suzuki have a huge presence in the Indian car market. The Delhi Metro was built with Japanese assistance, and Japanese food and culture are growing in popularity.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Major national holidays are Republic Day (Jan 26), Independence Day (Aug 15), and Gandhi Jayanti (Oct 2).", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "Diwali, the festival of lights, and Holi, the festival of colors where people playfully throw colored powder and water on each other, are two of the biggest festivals.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "While Field Hockey is technically the national sport, Cricket is by far the most popular and is followed with incredible passion.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "A typical school day starts early, around 7:30 AM, and finishes by 1:30 or 2:00 PM. Lessons are around 35 to 45 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The school year usually begins in April. The main holidays are a long summer vacation (May-June) and a shorter winter break.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "There is a strong emphasis on academics, especially in Science and Mathematics. Students also study English, Hindi, and a regional language.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Cricket is the most popular game to play during break time. Other traditional games include 'Kabaddi' (a team tag game) and 'Kho-Kho'.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Most students bring a packed lunchbox from home, often called a 'tiffin'. These are sometimes delivered to schools by a special delivery service.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Many students attend private tutoring ('tuition') after school to help with their studies. Others participate in cricket practice or music lessons.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/india-popup-bg.png", 
          content_img: "images/countries/india/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'The Taj Mahal is located in India.', answer: 'True' },
          { type: 'multiple-choice', question: "The Indian film industry is often called...?", options: ['Hollywood', 'Bollywood', 'Nollywood'], answer: 'Bollywood' },
          { type: 'true-false', question: 'The most popular sport in India is Soccer.', answer: 'False' },
          { type: 'multiple-choice', question: "What is a major festival of lights in India?", options: ['Holi', 'Diwali', 'Christmas'], answer: 'Diwali' },
          { type: 'true-false', question: "A 'tiffin' is a type of school uniform.", answer: 'False' },
          { type: 'multiple-choice', question: "What is the greeting 'Namaste' often accompanied by?", options: ['A handshake', 'A bow', 'Pressing palms together'], answer: 'Pressing palms together' },
          { type: 'true-false', question: 'Holi is a festival where people throw colored powder.', answer: 'True' },
          { type: 'multiple-choice', question: "The currency of India is the...?", options: ['Rupee', 'Yen', 'Baht'], answer: 'Rupee' },
          { type: 'true-false', question: 'Shah Rukh Khan is a famous Indian cricket player.', answer: 'False' },
          { type: 'multiple-choice', question: 'What is Kabaddi?', options: ['A type of food', 'A team tag game', 'A musical instrument'], answer: 'A team tag game' },
          { type: 'true-false', question: 'The school year in India often begins in September.', answer: 'False' },
          { type: 'multiple-choice', question: "Which of these is a popular Indian food?", options: ['Samosas', 'Sushi', 'Hamburgers'], answer: 'Samosas' },
          { type: 'true-false', question: 'Mahatma Gandhi was a famous Indian actor.', answer: 'False' },
          { type: 'multiple-choice', question: 'Hindi and ... are the two official languages of the central government.', options: ['Bengali', 'English', 'Tamil'], answer: 'English' },
          { type: 'true-false', question: 'The Delhi Metro was built with Japanese assistance.', answer: 'True' },
        ]
      },
    },
    // =========================================================================
    // GERMANY
    // =========================================================================
    {
      id: 'germany',
      name: 'Germany',
      capital: 'Berlin',
      coordinates: { lat: 52.5200, lon: 13.4050 },
      timezones: ['Europe/Berlin'],
      flag_img: 'https://flagcdn.com/w320/de.png',
      name_header_img: 'images/countries/headers/germany-header.png',
      background_img: 'images/countries/germany/background.jpg',
      background_music: 'audio/music/germany.mp3',
      national_anthem: 'audio/anthems/germany.mp3',
      accent_color: '#FFCE00',
      accent_color_secondary: '#000000',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is German. There are many different dialects spoken throughout the country.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A direct flight from Tokyo to Frankfurt or Munich takes about 11 to 12 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "Germany uses the Euro (€).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Hallo' is a common greeting. 'Guten Tag' is a more formal way to say 'Good day'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Germany is famous for its sausages ('Wurst'), pretzels ('Brezel'), and Schnitzel. Black Forest cake is a famous dessert.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous Germans include scientist Albert Einstein, composer Ludwig van Beethoven, and the Brothers Grimm who wrote many famous fairy tales.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Famous Japanese Things", 
          content: "The city of Düsseldorf has one of the largest Japanese communities in Europe. There is a 'Japan Day' festival there every year with food, culture, and fireworks.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Major holidays include Christmas, Easter, and German Unity Day on October 3rd.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "Oktoberfest in Munich is the world's largest beer festival. Christmas Markets ('Weihnachtsmarkt') are a beautiful tradition in winter.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Football (Soccer, or 'Fußball') is the most popular sport by far. The national team has won the World Cup four times.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "The school day is often short, starting around 8:00 AM and finishing by 1:00 or 2:00 PM. Lessons are usually 45 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "Holiday schedules vary by state, but all have a long summer break, plus holidays for autumn, Christmas, and Easter.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study German, Maths, Science, History, and at least one foreign language. After elementary school, students go to different types of schools based on their academic level.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "During the break ('Pause'), students play catching games ('Fangen') and football in the schoolyard ('Schulhof').", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Because school finishes early, it is common for students to go home and eat lunch with their family.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Students often join local sports clubs ('Verein') for football, tennis, or gymnastics. Music schools are also very popular.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/germany-popup-bg.png", 
          content_img: "images/countries/germany/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'Germany is famous for its Autobahn highways with no speed limit in some areas.', answer: 'True' },
          { type: 'multiple-choice', question: "What is the capital of Germany?", options: ['Munich', 'Hamburg', 'Berlin'], answer: 'Berlin' },
          { type: 'true-false', question: 'Oktoberfest is a famous festival held in Germany.', answer: 'True' },
          { type: 'multiple-choice', question: "What is a famous German bread product?", options: ['Baguette', 'Pretzel', 'Naan'], answer: 'Pretzel' },
          { type: 'true-false', question: "The Brothers Grimm, famous for fairy tales, were from Germany.", answer: 'True' },
          { type: 'multiple-choice', question: "What is a 'Schnitzel'?", options: ['A type of car', 'A thin slice of fried meat', 'A type of hat'], answer: 'A thin slice of fried meat' },
          { type: 'true-false', question: 'The currency in Germany is the German Mark.', answer: 'False' },
          { type: 'multiple-choice', question: "What does 'Guten Tag' mean?", options: ['Good morning', 'Good day', 'Good night'], answer: 'Good day' },
          { type: 'true-false', question: 'German schools usually finish late in the evening.', answer: 'False' },
          { type: 'multiple-choice', question: 'Albert Einstein was a famous German...?', options: ['Musician', 'Artist', 'Scientist'], answer: 'Scientist' },
          { type: 'true-false', question: "A 'Weihnachtsmarkt' is a Christmas Market.", answer: 'True' },
          { type: 'multiple-choice', question: "What is 'Fußball'?", options: ['Handball', 'Football (Soccer)', 'Volleyball'], answer: 'Football (Soccer)' },
          { type: 'true-false', question: 'Most German schools require a uniform.', answer: 'False' },
          { type: 'multiple-choice', question: 'Which German city has a large Japanese community and a "Japan Day" festival?', options: ['Berlin', 'Düsseldorf', 'Munich'], answer: 'Düsseldorf' },
          { type: 'true-false', question: 'Ludwig van Beethoven was a famous German composer.', answer: 'True' },
        ]
      },
    },
    // =========================================================================
    // CHINA
    // =========================================================================
    {
      id: 'china',
      name: 'China',
      capital: 'Beijing',
      coordinates: { lat: 39.9042, lon: 116.4074 },
      timezones: [
        'Asia/Shanghai', // Official Time for all of China
        'Asia/Urumqi'    // Unofficial, used in Xinjiang region
      ],
      flag_img: 'https://flagcdn.com/w320/cn.png',
      name_header_img: 'images/countries/headers/china-header.png',
      background_img: 'images/countries/china/background.jpg',
      background_music: 'audio/music/china.mp3',
      national_anthem: 'audio/anthems/china.mp3',
      accent_color: '#DE2910',
      accent_color_secondary: '#FFFF00',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is Standard Chinese, which is based on the Mandarin dialect. There are many other dialects spoken across the country.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A flight from Tokyo to Beijing or Shanghai is relatively short, taking about 3 to 4 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is called the Renminbi (RMB). The basic unit is the Yuan (CNY).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Nǐ hǎo' (你好) is the standard way to say 'Hello'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Chinese cuisine is incredibly varied. Famous dishes include Peking Duck, dumplings (Jiaozi), and Dim Sum (small, bite-sized dishes).", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous Chinese figures include ancient philosopher Confucius, action star Jackie Chan, and basketball player Yao Ming.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Famous Japanese Things", 
          content: "Japanese anime and manga, especially classics like 'Doraemon' and 'Slam Dunk', are extremely popular and well-loved by generations of Chinese people.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "National Day is on October 1st. Other major public holidays are for Chinese New Year, Qingming Festival, and Dragon Boat Festival.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "Chinese New Year (Spring Festival) is the most important holiday, celebrated with family gatherings, red envelopes, and fireworks. The Lantern Festival and Mid-Autumn Festival are also major celebrations.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Table Tennis and Badminton are sports where China excels globally. Basketball has also become extremely popular.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "The school day is long, often from 7:30 AM to 5:00 PM. There is usually a long lunch break of about two hours, during which many students take a nap ('wǔshuì'). Classes are usually 45 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The main holidays are a long summer break and a one-month winter break that includes Chinese New Year.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "There is a very strong focus on core academic subjects: Chinese, Mathematics, and English. Students work very hard for major exams.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "During breaks, students might do morning exercises together. They also play basketball, ping pong, or shuttlecock kicking ('jianzi').", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Students either eat at the school cafeteria, which serves several dishes with rice, or go home for lunch if they live nearby.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Many students attend after-school tutoring classes to prepare for exams. Others might practice musical instruments like the piano or violin.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/china-popup-bg.png", 
          content_img: "images/countries/china/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'The Great Wall of China is visible from the moon.', answer: 'False' },
          { type: 'multiple-choice', question: "What animal is a symbol of China?", options: ['Tiger', 'Giant Panda', 'Dragon'], answer: 'Giant Panda' },
          { type: 'true-false', question: 'The most important holiday in China is Christmas.', answer: 'False' },
          { type: 'multiple-choice', question: "What is the capital of China?", options: ['Shanghai', 'Hong Kong', 'Beijing'], answer: 'Beijing' },
          { type: 'true-false', question: "Table tennis is a very popular sport in China.", answer: 'True' },
          { type: 'multiple-choice', question: 'The currency of China is the...?', options: ['Yen', 'Won', 'Yuan'], answer: 'Yuan' },
          { type: 'true-false', question: "Dim Sum is a large main course.", answer: 'False' },
          { type: 'multiple-choice', question: 'What is "Nǐ hǎo" (你好)?', options: ['A type of food', 'Hello', 'Goodbye'], answer: 'Hello' },
          { type: 'true-false', question: 'Yao Ming is a famous Chinese table tennis player.', answer: 'False' },
          { type: 'multiple-choice', question: 'What is the most important holiday in China?', options: ['Mid-Autumn Festival', 'Lantern Festival', 'Chinese New Year'], answer: 'Chinese New Year' },
          { type: 'true-false', question: 'Students in China often take a nap during their lunch break.', answer: 'True' },
          { type: 'multiple-choice', question: 'What is "jianzi"?', options: ['A type of exam', 'Kicking a shuttlecock', 'Morning exercises'], answer: 'Kicking a shuttlecock' },
          { type: 'true-false', question: 'Jackie Chan is a famous Chinese philosopher.', answer: 'False' },
          { type: 'multiple-choice', question: "Which Japanese anime is very famous in China?", options: ['Attack on Titan', 'Jujutsu Kaisen', 'Doraemon'], answer: 'Doraemon' },
          { type: 'true-false', question: "Peking Duck is a famous dish from Beijing.", answer: 'True' },
        ]
      },
    },
    // =========================================================================
    // SOUTH KOREA
    // =========================================================================
    {
      id: 'korea',
      name: 'South Korea',
      capital: 'Seoul',
      coordinates: { lat: 37.5665, lon: 126.9780 },
      timezones: ['Asia/Seoul'],
      flag_img: 'https://flagcdn.com/w320/kr.png',
      name_header_img: 'images/countries/headers/korea-header.png',
      background_img: 'images/countries/korea/background.jpg',
      background_music: 'audio/music/korea.mp3',
      national_anthem: 'audio/anthems/korea.mp3',
      accent_color: '#CD2E3A',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is Korean. The Korean alphabet, Hangul, is known for being very scientific and easy to learn.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "South Korea is very close to Japan. A flight from Tokyo to Seoul takes only about 2 to 3 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the South Korean Won (KRW).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Annyeonghaseyo' (안녕하세요) is the standard, polite way to say 'Hello'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Kimchi, a spicy fermented cabbage, is eaten with almost every meal. Other famous dishes include Bulgogi (marinated grilled beef) and Bibimbap (mixed rice with vegetables).", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "South Korea is famous for K-pop groups like BTS and BLACKPINK, footballer Son Heung-min, and Oscar-winning director Bong Joon-ho ('Parasite').", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Japanese Influence", 
          content: "Many aspects of modern Japanese pop culture, like specific anime, video games, and food like tonkatsu and ramen, are very popular among young people in South Korea.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "The two most important traditional holidays where families gather are Seollal (Lunar New Year) and Chuseok (Korean Thanksgiving).", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "The Boryeong Mud Festival is a famous summer festival where people play in mud. There are also many music festivals and lantern festivals throughout the year.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "National Sport", 
          content: "The national martial art is Taekwondo. The most popular spectator sports are Baseball and Soccer.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "The school day is from about 8:00 AM to 4:00 PM. High school classes are 50 minutes long, and elementary classes are 40 minutes.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "There is a summer and winter vacation. However, many high school students continue to study at private academies ('hagwon') during this time.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Education is extremely competitive. Students study Korean, English, Math, Science, and Social Studies very seriously.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "During breaks, students might play soccer or 'gonggi' (a game with small plastic stones). Many students prefer to chat with friends or study.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "A well-balanced, nutritious lunch is provided by the school on a tray with several compartments, similar to Japan.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Attending private academies called 'hagwon' for extra study is extremely common, especially for older students who study late into the night.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/korea-popup-bg.png", 
          content_img: "images/countries/korea/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'K-Pop is a famous style of music from South Korea.', answer: 'True' },
          { type: 'multiple-choice', question: "What is a famous fermented side dish from Korea?", options: ['Miso', 'Sauerkraut', 'Kimchi'], answer: 'Kimchi' },
          { type: 'true-false', question: "The Korean alphabet is called Kanji.", answer: 'False' },
          { type: 'multiple-choice', question: "What is the capital of South Korea?", options: ['Busan', 'Seoul', 'Incheon'], answer: 'Seoul' },
          { type: 'true-false', question: "Taekwondo is a martial art from South Korea.", answer: 'True' },
          { type: 'multiple-choice', question: "What is a private after-school academy in Korea called?", options: ['Juku', 'Hagwon', 'Tuition'], answer: 'Hagwon' },
          { type: 'true-false', question: 'Bulgogi is a type of spicy soup.', answer: 'False' },
          { type: 'multiple-choice', question: 'What does "Annyeonghaseyo" (안녕하세요) mean?', options: ['Thank you', 'Goodbye', 'Hello'], answer: 'Hello' },
          { type: 'true-false', question: 'The most popular sport in South Korea is cricket.', answer: 'False' },
          { type: 'multiple-choice', question: "Chuseok is the Korean...?", options: ['New Year', 'Thanksgiving', 'Children\'s Day'], answer: 'Thanksgiving' },
          { type: 'true-false', question: 'School uniforms in Korea are called "gyobok".', answer: 'True' },
          { type: 'multiple-choice', question: "Which of these is a famous K-Pop group?", options: ['One Direction', 'The Beatles', 'BTS'], answer: 'BTS' },
          { type: 'true-false', question: 'Bibimbap is a dish made of mixed rice.', answer: 'True' },
          { type: 'multiple-choice', question: "What is the Korean alphabet called?", options: ['Hiragana', 'Cyrillic', 'Hangul'], answer: 'Hangul' },
          { type: 'true-false', question: 'The flight from Tokyo to Seoul is very long.', answer: 'False' },
        ]
      },
    },
    // =========================================================================
    // THAILAND
    // =========================================================================
    {
      id: 'thailand',
      name: 'Thailand',
      capital: 'Bangkok',
      coordinates: { lat: 13.7563, lon: 100.5018 },
      timezones: ['Asia/Bangkok'],
      flag_img: 'https://flagcdn.com/w320/th.png',
      name_header_img: 'images/countries/headers/thailand-header.png',
      background_img: 'images/countries/thailand/background.jpg',
      background_music: 'audio/music/thailand.mp3',
      national_anthem: 'audio/anthems/thailand.mp3',
      accent_color: '#2D2A4A',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is Thai.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A direct flight from Tokyo to Bangkok takes about 6 to 7 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Thai Baht (THB).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Sawasdee' (สวัสดี) is used for 'Hello'. Men add 'khrap' at the end, and women add 'kha' to be polite.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Thai food is known for balancing sweet, sour, spicy, and salty flavors. Famous dishes include Pad Thai (stir-fried noodles), Tom Yum Goong (spicy shrimp soup), and Green Curry.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous Thais include action movie star Tony Jaa and Lisa from the K-pop group BLACKPINK.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Japanese Influence", 
          content: "Japanese pop culture, including characters like Doraemon and Hello Kitty, is extremely well-known. Department stores and restaurants from Japan, like Isetan and Yoshinoya, are also popular.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Public holidays commemorate the King and Queen's birthdays, as well as important dates in Buddhism.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "Songkran, the Thai New Year in April, is a huge festival famous for its massive water fights. Loi Krathong is a beautiful festival where people float baskets of flowers and candles on water.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "National Sport", 
          content: "The national sport is Muay Thai (Thai Boxing), a famous and powerful martial art.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "The school day begins with an assembly where students sing the national anthem, and runs from about 8:00 AM to 4:00 PM. Lessons are typically 50 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The school year has two semesters. The main holidays are a break in October and a long summer break from March to May.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study Thai, Maths, Science, Social Studies, and Health. English is a mandatory foreign language.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Football is very popular. Another common sport is 'Takraw', where players use their feet, knees, and head to hit a woven ball over a net.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Students eat at a school canteen that has many different food stalls, so they can choose what they want to eat each day.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Many students attend extra tutoring classes. Others participate in sports like Muay Thai or traditional Thai dance.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/thailand-popup-bg.png", 
          content_img: "images/countries/thailand/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', "question": "Thailand is the only Southeast Asian country never to have been colonized by a European power.", answer: 'True' },
          { type: 'multiple-choice', question: 'What is the most popular martial art in Thailand?', options: ['Karate', 'Judo', 'Muay Thai'], answer: 'Muay Thai' },
          { type: 'true-false', question: 'The capital of Thailand is Chiang Mai.', answer: 'False' },
          { type: 'multiple-choice', question: "What is the famous Thai New Year water festival called?", options: ['Songkran', 'Loi Krathong', 'Diwali'], answer: 'Songkran' },
          { type: 'true-false', question: "The word for 'Hello' in Thai is 'Konnichiwa'.", answer: 'False' },
          { type: 'multiple-choice', question: 'What is "Tom Yum Goong"?', options: ['A sweet dessert', 'A spicy shrimp soup', 'A type of noodle'], answer: 'A spicy shrimp soup' },
          { type: 'true-false', question: 'Lisa, from the group BLACKPINK, is from Thailand.', answer: 'True' },
          { type: 'multiple-choice', question: "What is the currency of Thailand?", options: ['Dong', 'Rupiah', 'Baht'], answer: 'Baht' },
          { type: 'true-false', question: 'To be polite, women add "khrap" at the end of "Sawasdee".', answer: 'False' },
          { type: 'multiple-choice', question: 'What sport is played with a woven ball using your feet and head?', options: ['Football', 'Volleyball', 'Takraw'], answer: 'Takraw' },
          { type: 'true-false', question: 'Pad Thai is a type of curry.', answer: 'False' },
          { type: 'multiple-choice', question: 'At the Loi Krathong festival, what do people float on the water?', options: ['Paper lanterns', 'Baskets of flowers', 'Toy boats'], answer: 'Baskets of flowers' },
          { type: 'true-false', question: 'Tony Jaa is a famous Thai chef.', answer: 'False' },
          { type: 'multiple-choice', question: 'Which Japanese character is very famous in Thailand?', options: ['Pikachu', 'Doraemon', 'Sailor Moon'], answer: 'Doraemon' },
          { type: 'true-false', question: 'Students in Thailand do not have to wear uniforms.', answer: 'False' },
        ]
      },
    },
    // =========================================================================
    // RUSSIA
    // =========================================================================
    {
      id: 'russia',
      name: 'Russia',
      capital: 'Moscow',
      coordinates: { lat: 55.7558, lon: 37.6173 },
      timezones: [
        'Europe/Moscow', // UTC+3
        'Asia/Yekaterinburg', // UTC+5
        'Asia/Irkutsk',       // UTC+8
        'Asia/Vladivostok',   // UTC+10
        'Asia/Magadan',       // UTC+11
        'Asia/Kamchatka'      // UTC+12
      ],
      flag_img: 'https://flagcdn.com/w320/ru.png',
      name_header_img: 'images/countries/headers/russia-header.png',
      background_img: 'images/countries/russia/background.jpg',
      background_music: 'audio/music/russia.mp3',
      national_anthem: 'audio/anthems/russia.mp3',
      accent_color: '#D52B1E',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is Russian.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A flight from Tokyo to Moscow, the capital, takes about 9 to 10 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Russian Ruble (RUB).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Privet' (Привет) is the informal way to say 'Hello'. 'Zdravstvuyte' (Здравствуйте) is the formal version.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Borscht (a soup made from beets) is very famous. Other traditional dishes include Pelmeni (dumplings) and Blini (thin pancakes).", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous Russians include authors Leo Tolstoy and Fyodor Dostoevsky, composer Pyotr Tchaikovsky, and the first person in space, Yuri Gagarin.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Japanese Influence", 
          content: "The anime 'Cheburashka', while created in Russia, was animated in partnership with a Japanese studio for its new series, making it a point of cultural connection.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "New Year's is the biggest holiday, more important than Christmas. Other major holidays are Defender of the Fatherland Day (Feb 23) and Victory Day (May 9).", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "Maslenitsa is a week-long festival before Lent, where people eat lots of blini to say goodbye to winter.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Ice Hockey and Football (Soccer) are the most popular sports. Figure skating is also a sport where Russia is very strong.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "School runs from about 8:30 AM to 2:00 or 3:00 PM. Lessons are 40-45 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The school year starts on September 1st, known as 'Knowledge Day'. There are autumn, winter, and spring holidays, plus a long summer break.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study Russian Language and Literature, Mathematics, History, and Biology. There is a strong emphasis on science and math.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Chess is a very popular and respected game. In winter, snowball fights and building snow forts are common activities.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "A simple hot meal, often including soup, a main course, and a drink called 'kompot' (fruit drink), is provided in the school cafeteria ('stolovaya').", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Students may attend music school, art school, or sports schools, which are often state-supported and very serious.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/russia-popup-bg.png", 
          content_img: "images/countries/russia/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'Russia is the largest country in the world by area.', answer: 'True' },
          { type: 'multiple-choice', question: "What are the famous colorful, onion-shaped domes in Russia called?", options: ['Minarets', 'Spires', 'Cupolas'], answer: 'Cupolas' },
          { type: 'true-false', question: 'The first person in space was from Russia.', answer: 'True' },
          { type: 'multiple-choice', question: "What is a famous Russian soup?", options: ['Miso', 'Borscht', 'Ramen'], answer: 'Borscht' },
          { type: 'true-false', question: "Matryoshka dolls are nesting dolls from Russia.", answer: 'True' },
          { type: 'multiple-choice', question: "What is the biggest holiday in Russia?", options: ["Christmas", "Easter", "New Year's"], answer: "New Year's" },
          { type: 'true-false', question: 'The currency of Russia is the Euro.', answer: 'False' },
          { type: 'multiple-choice', question: 'What are "Pelmeni"?', options: ['Pancakes', 'Dumplings', 'Sausages'], answer: 'Dumplings' },
          { type: 'true-false', question: 'The school year in Russia starts on "Knowledge Day".', answer: 'True' },
          { type: 'multiple-choice', question: "Which sport is extremely popular in Russia?", options: ['Baseball', 'Ice Hockey', 'Cricket'], answer: 'Ice Hockey' },
          { type: 'true-false', question: 'Yuri Gagarin was a famous Russian author.', answer: 'False' },
          { type: 'multiple-choice', question: 'The school cafeteria in Russia is called a...?', options: ['Comedor', 'Stolovaya', 'Tuck shop'], answer: 'Stolovaya' },
          { type: 'true-false', question: "Maslenitsa is a festival where people eat a lot of blini.", answer: 'True' },
          { type: 'multiple-choice', question: "Which famous composer is from Russia?", options: ['Mozart', 'Beethoven', 'Tchaikovsky'], answer: 'Tchaikovsky' },
          { type: 'true-false', question: 'Chess is not a popular game in Russia.', answer: 'False' },
        ]
      },
    },
    // =========================================================================
    // FRANCE
    // =========================================================================
    {
      id: 'france',
      name: 'France',
      capital: 'Paris',
      coordinates: { lat: 48.8566, lon: 2.3522 },
      timezones: ['Europe/Paris'],
      flag_img: 'https://flagcdn.com/w320/fr.png',
      name_header_img: 'images/countries/headers/france-header.png',
      background_img: 'images/countries/france/background.jpg',
      background_music: 'audio/music/france.mp3',
      national_anthem: 'audio/anthems/france.mp3',
      accent_color: '#0055A4',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is French.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A direct flight from Tokyo to Paris takes about 12 to 13 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "France uses the Euro (€).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Bonjour' is the standard greeting for 'Hello' or 'Good day'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "French cuisine is world-famous. Staples include baguettes (long bread), croissants, macarons, and hundreds of types of cheese.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous French figures include artist Claude Monet, designer Coco Chanel, scientist Marie Curie, and footballer Kylian Mbappé.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Japanese Influence", 
          content: "Paris is known as a hub for Japanese culture in Europe, with many authentic ramen shops and pastry chefs who train in Japan. The Japan Expo in Paris is one of the largest Japanese culture conventions in the world.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Bastille Day on July 14th is the national holiday, celebrated with a large military parade and fireworks. Other holidays include Christmas, Easter, and Labour Day on May 1st.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "The Tour de France is a famous annual cycling race. The Cannes Film Festival is a glamorous, world-renowned cinema event.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Football (Soccer) and Rugby are the two most popular team sports. The French national football team has won the World Cup twice.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "A typical school day is from 8:30 AM to 4:30 PM, with a long two-hour lunch break. Lessons are typically 55 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "French students have a long summer holiday, as well as two-week breaks for All Saints' Day, Christmas, winter, and spring.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study French, Maths, History-Geography, Sciences, and foreign languages. Philosophy is a required subject in the last year of high school.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "During 'récréation' (recess), students play football, 'chat' (tag), or with marbles ('billes').", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "The school lunch ('la cantine') is very important. Students are served a full, balanced, multi-course meal, including an appetizer, main course, cheese, and dessert.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Wednesday afternoons are often free of school, so many students participate in sports or music lessons then.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/france-popup-bg.png", 
          content_img: "images/countries/france/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'The Eiffel Tower is in the capital city, Paris.', answer: 'True' },
          { type: 'multiple-choice', question: 'What is a famous type of French bread?', options: ['Sourdough', 'Baguette', 'Rye'], answer: 'Baguette' },
          { type: 'true-false', question: 'The Tour de France is a famous car race.', answer: 'False' },
          { type: 'multiple-choice', question: "What is a famous French pastry eaten for breakfast?", options: ['Muffin', 'Croissant', 'Donut'], answer: 'Croissant' },
          { type: 'true-false', question: "The Louvre Museum is located in Paris.", answer: 'True' },
          { type: 'multiple-choice', question: 'What is the national holiday of France?', options: ['Independence Day', 'Bastille Day', 'Republic Day'], answer: 'Bastille Day' },
          { type: 'true-false', question: 'The school lunch in France is usually a small sandwich.', answer: 'False' },
          { type: 'multiple-choice', question: 'Marie Curie was a famous French...?', options: ['Artist', 'Singer', 'Scientist'], answer: 'Scientist' },
          { type: 'true-false', question: 'Most French schools require a uniform.', answer: 'False' },
          { type: 'multiple-choice', question: 'What subject is required in the last year of high school?', options: ['Cooking', 'Philosophy', 'Driving'], answer: 'Philosophy' },
          { type: 'true-false', question: 'The currency of France is the Franc.', answer: 'False' },
          { type: 'multiple-choice', question: "What is 'chat' in a French playground?", options: ['A cat', 'A card game', 'Tag'], answer: 'Tag' },
          { type: 'true-false', question: 'French students have a very short lunch break.', answer: 'False' },
          { type: 'multiple-choice', question: 'Which city hosts the huge Japan Expo?', options: ['Lyon', 'Marseille', 'Paris'], answer: 'Paris' },
          { type: 'true-false', question: 'Kylian Mbappé is a famous French rugby player.', answer: 'False' },
        ]
      },
    },
    // =========================================================================
    // ITALY
    // =========================================================================
    {
      id: 'italy',
      name: 'Italy',
      capital: 'Rome',
      coordinates: { lat: 41.9028, lon: 12.4964 },
      timezones: ['Europe/Rome'],
      flag_img: 'https://flagcdn.com/w320/it.png',
      name_header_img: 'images/countries/headers/italy-header.png',
      background_img: 'images/countries/italy/background.jpg',
      background_music: 'audio/music/italy.mp3',
      national_anthem: 'audio/anthems/italy.mp3',
      accent_color: '#009246',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is Italian.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/general-info/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A direct flight from Tokyo to Rome takes about 12 to 13 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/general-info/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "Italy uses the Euro (€).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Ciao' is a famous and informal way to say both 'Hello' and 'Goodbye'. 'Buongiorno' means 'Good morning'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/general-info/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Italian food is loved everywhere! Pasta, pizza, risotto, and gelato (ice cream) are all famous Italian inventions.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Italy was home to Renaissance artists like Leonardo da Vinci and Michelangelo, scientist Galileo Galilei, and fashion designer Giorgio Armani.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/culture-people-img.jpg" 
        },
        jp_famous_in: { 
          title: "Japanese Influence", 
          content: "The anime 'Heidi, Girl of the Alps' by Isao Takahata and Hayao Miyazaki is incredibly famous and loved in Italy, where many people think it's an Italian cartoon.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Major holidays include Christmas, Easter, and Republic Day on June 2nd. Ferragosto on August 15th is a major summer holiday.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "The Carnival of Venice is famous for its beautiful and elaborate masks. Many towns have festivals for their local patron saint.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Football (Soccer, or 'Calcio') is the most popular sport. The national team, the 'Azzurri', has won the World Cup four times.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/culture-sports-img.jpg" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "The school day is often short, from about 8:30 AM to 1:30 PM, but students may attend school six days a week, including Saturday mornings. Lessons are usually 50-60 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "There's a long summer holiday from June to September, plus breaks for Christmas and Easter.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/school-holidays-img.jpg" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study Italian, History, Maths, and Science. In high school ('Liceo'), they specialize in areas like classics, sciences, or arts.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "During the 'intervallo' (break), students play football(soccer) or volleyball. Card games are also popular.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Students can eat a cafeteria lunch. But, because of the short school day, students often go home to have a family lunch.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "After school and homework, Italian children often play outside in the local 'piazza' (square). Many also take part in sports or music.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/italy-popup-bg.png", 
          content_img: "images/countries/italy/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'The Colosseum is a famous landmark in Rome.', answer: 'True' },
          { type: 'multiple-choice', question: "What shape is Italy famous for looking like?", options: ['A star', 'A boot', 'A circle'], answer: 'A boot' },
          { type: 'true-false', question: 'Pizza was invented in Italy.', answer: 'True' },
          { type: 'multiple-choice', question: "What is the Italian word for ice cream?", options: ['Sorbet', 'Gelato', 'Frozen Yogurt'], answer: 'Gelato' },
          { type: 'true-false', question: "The city of Venice is famous for its canals and gondolas.", answer: 'True' },
          { type: 'multiple-choice', question: "What is 'Calcio'?", options: ['A type of cheese', 'Football (Soccer)', 'A famous festival'], answer: 'Football (Soccer)' },
          { type: 'true-false', question: 'The Italian national football team is called the "Azzurri".', answer: 'True' },
          { type: 'multiple-choice', question: "What does 'Ciao' mean?", options: ['Hello or Goodbye', 'Only Hello', 'Only Goodbye'], answer: 'Hello or Goodbye' },
          { type: 'true-false', question: 'Students in Italy attend school five days a week.', answer: 'False' },
          { type: 'multiple-choice', question: 'Leonardo da Vinci was a famous Italian...?', options: ['Chef', 'Athlete', 'Artist'], answer: 'Artist' },
          { type: 'true-false', question: 'The Carnival of Venice is famous for its food.', answer: 'False' },
          { type: 'multiple-choice', question: 'What is a "grembiule"?', options: ['A school smock', 'A type of pasta', 'A school subject'], answer: 'A school smock' },
          { type: 'true-false', question: 'Most Italian students eat lunch in the school cafeteria.', answer: 'False' },
          { type: 'multiple-choice', question: 'Which anime is extremely famous in Italy?', options: ['Dragon Ball Z', 'Heidi, Girl of the Alps', 'One Piece'], answer: 'Heidi, Girl of the Alps' },
          { type: 'true-false', question: 'Risotto is a dish made from potatoes.', answer: 'False' },
        ]
      },
    },
        // =========================================================================
    // EGYPT
    // =========================================================================
    {
      id: 'egypt',
      name: 'Egypt',
      capital: 'Cairo',
      coordinates: { lat: 30.0444, lon: 31.2357 },
      timezones: ['Africa/Cairo'],
      flag_img: 'https://flagcdn.com/w320/eg.png',
      name_header_img: 'images/countries/headers/egypt-header.png',
      background_img: 'images/countries/egypt/background.jpg',
      background_music: 'audio/music/egypt.mp3',
      national_anthem: 'audio/anthems/egypt.mp3',
      accent_color: '#ce1126',
      accent_color_secondary: '#000000',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is Arabic. Egyptian Arabic is the most widely spoken dialect.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/general-languages-img.png"
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A direct flight from Tokyo to Cairo takes about 12 to 14 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/general-info/content-images/general-travel-img.png"
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Egyptian Pound (EGP).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/general-currency-img.png"
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "You can say 'As-salamu alaykum' for a formal greeting, or 'Ahlan' for a more casual 'Hi'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/general-info/content-images/general-hello-img.png"
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Koshari, a mix of rice, lentils, chickpeas, and pasta with a tomato sauce, is a popular national dish. Ful Medames (fava bean stew) is a common breakfast.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/culture-famous-food-img.png"
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous Egyptians include Pharaoh Tutankhamun, Nobel Prize-winning author Naguib Mahfouz, and footballer Mohamed Salah.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/culture-people-img.png"
        },
        jp_famous_in: { 
          title: "Famous Japanese Things", 
          content: "The anime 'Captain Tsubasa' is extremely popular in Egypt, where it's known as 'Captain Majid'. Japanese cars and electronics are also highly regarded.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/culture-jp-famous-img.png"
        },
        holidays: { 
          title: "Holidays", 
          content: "Major holidays are connected to Islam, such as Eid al-Fitr and Eid al-Adha. Revolution Day on July 23rd is also a national holiday.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/culture-holidays-img.png"
        },
        festivals: { 
          title: "Festivals", 
          content: "Sham El-Nessim is an ancient festival celebrating the beginning of spring, where families go on picnics.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/culture-festivals-img.png"
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Football (Soccer) is the most popular sport. The national team is known as 'The Pharaohs'.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/culture-sports-img.png"
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "Schools often run in two shifts (morning and afternoon) to accommodate many students. The school week is from Sunday to Thursday.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/school-routine-img.png"
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The school year starts in September. There is a mid-year break and a long summer holiday from June to September.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/school-holidays-img.png"
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study Arabic, Religion, Social Studies, Math, and Science. English is taught as a foreign language from a young age.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/school-subjects-img.png"
        },
        common_games: { 
          title: "Games at School", 
          content: "Football is the most common game played during break time.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/school-games-img.png"
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Most students bring a sandwich or snacks from home for lunch.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/school-lunch-img.png"
        },
        after_school: { 
          title: "After School Activities", 
          content: "Many students attend private lessons ('dars') to help with their studies. Others join local football clubs.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/egypt-popup-bg.png",
          content_img: "images/countries/egypt/content-images/school-after-school-img.png"
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'The official language of Egypt is English.', answer: 'False' },
          { type: 'multiple-choice', question: "What is a famous Egyptian national dish made with rice, lentils, and pasta?", options: ['Ful Medames', 'Koshari', 'Tabbouleh'], answer: 'Koshari' },
          { type: 'true-false', question: 'Mohamed Salah is a famous Egyptian author.', answer: 'False' },
          { type: 'multiple-choice', question: "What is the capital of Egypt?", options: ['Alexandria', 'Giza', 'Cairo'], answer: 'Cairo' },
          { type: 'true-false', question: "The school week in Egypt is typically from Sunday to Thursday.", answer: 'True' },
          { type: 'multiple-choice', question: 'What is the most popular sport in Egypt?', options: ['Basketball', 'Football', 'Handball'], answer: 'Football' },
          { type: 'true-false', question: 'Most students in Egypt receive a hot lunch from the school.', answer: 'False' },
          { type: 'multiple-choice', question: "The anime 'Captain Tsubasa' is known in Egypt by what name?", options: ['Captain Majid', 'Captain Harlock', 'Captain Falcon'], answer: 'Captain Majid' },
          { type: 'true-false', question: "A direct flight from Tokyo to Cairo takes about 8 hours.", answer: 'False' },
          { type: 'multiple-choice', question: "What are private after-school lessons in Egypt called?", options: ['Hagwon', 'Juku', 'Dars'], answer: 'Dars' },
          { type: 'true-false', question: "The national football team is known as 'The Pharaohs'.", answer: 'True' },
          { type: 'multiple-choice', question: "The currency of Egypt is the...?", options: ['Egyptian Dinar', 'Egyptian Pound', 'Egyptian Dollar'], answer: 'Egyptian Pound' },
          { type: 'true-false', question: 'The greeting "Ahlan" is a very formal way to say "Hello".', answer: 'False' },
          { type: 'multiple-choice', question: "The ancient festival of Sham El-Nessim celebrates the beginning of...?", options: ['Winter', 'Spring', 'The New Year'], answer: 'Spring' },
          { type: 'true-false', question: 'Naguib Mahfouz was a famous Nobel Prize-winning author.', answer: 'True' },
        ]
      },
    },
    // =========================================================================
    // NEW ZEALAND
    // =========================================================================
    {
      id: 'newzealand',
      name: 'New Zealand',
      capital: 'Wellington',
      coordinates: { lat: -41.2865, lon: 174.7762 },
      timezones: ['Pacific/Auckland'],
      flag_img: 'https://flagcdn.com/w320/nz.png',
      name_header_img: 'images/countries/headers/newzealand-header.png',
      background_img: 'images/countries/newzealand/background.jpg',
      background_music: 'audio/music/newzealand.mp3',
      national_anthem: 'audio/anthems/newzealand.mp3',
      accent_color: '#00247D',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Languages", 
          content: "The official languages are English, Māori, and New Zealand Sign Language. English is spoken by everyone.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/general-languages-img.png"
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "A direct flight from Tokyo to Auckland takes about 11 hours.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/general-info/content-images/general-travel-img.png"
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the New Zealand Dollar (NZD), sometimes called the 'Kiwi dollar'.", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/general-currency-img.png"
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Hello' is common. A friendly local greeting is 'Kia ora', which is from the Māori language.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/general-info/content-images/general-hello-img.png"
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "A traditional Māori Hāngī (food cooked in an earth oven) is a special meal. Other favorites include meat pies, fish and chips, and a dessert called Pavlova.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/culture-famous-food-img.png"
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous 'Kiwis' include director Peter Jackson (Lord of the Rings), actor Russell Crowe, and the first person to climb Mt. Everest, Sir Edmund Hillary.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/culture-people-img.png"
        },
        jp_famous_in: { 
          title: "Japanese Influence", 
          content: "Rugby is a huge connection. Many New Zealand players and coaches are famous in Japan's Top League. Japanese food like sushi has become a very common lunch option.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/culture-jp-famous-img.png"
        },
        holidays: { 
          title: "Holidays", 
          content: "Waitangi Day (Feb 6) is the national day. Anzac Day (April 25) is a memorial day. Matariki (Māori New Year) is now an official public holiday.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/culture-holidays-img.png"
        },
        festivals: { 
          title: "Festivals", 
          content: "Local food and wine festivals are popular. Pasifika Festival in Auckland is the largest Polynesian festival in the world, celebrating Pacific Island cultures.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/culture-festivals-img.png"
        },
        national_sport: { 
          title: "National Sport", 
          content: "Rugby Union is the national sport and a major part of the culture. The national team, the 'All Blacks', are world-famous for their success and the Haka.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/culture-sports-img.png"
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "School is from 9:00 AM to 3:00 PM. Students often have a morning tea break ('morning interval') and a longer lunch break.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/school-routine-img.png"
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The school year is split into four terms. There are two-week breaks between terms and a long summer holiday over Christmas (December-January).", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/school-holidays-img.png"
        },
        subjects: { 
          title: "Subjects", 
          content: "Core subjects include English, Maths, and Science. Outdoor education is a big part of the curriculum, with many schools having camps and trips.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/school-subjects-img.png"
        },
        common_games: { 
          title: "Games at School", 
          content: "Rugby, cricket, and netball are very common games to play during lunch break. Many students play on the large school fields.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/school-games-img.png"
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Almost all students bring a packed lunch from home. Many schools also have a 'tuck shop' where students can buy food like pies or sandwiches.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/school-lunch-img.png"
        },
        after_school: { 
          title: "After School Activities", 
          content: "Many students play sports for their school or local club. Popular sports are rugby, netball (for girls), and soccer.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/newzealand-popup-bg.png",
          content_img: "images/countries/newzealand/content-images/school-after-school-img.png"
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: "The national sport of New Zealand is Rugby.", answer: 'True' },
          { type: 'multiple-choice', question: "What is the Māori greeting for 'Hello'?", options: ['Aloha', 'G\'day', 'Kia ora'], answer: 'Kia ora' },
          { type: 'true-false', question: 'A Hāngī is a traditional dessert made of fruit.', answer: 'False' },
          { type: 'multiple-choice', question: "The national rugby team is famously known as the...?", options: ['All Blacks', 'Kiwis', 'All Whites'], answer: 'All Blacks' },
          { type: 'true-false', question: 'The school summer holiday in New Zealand is in July and August.', answer: 'False' },
          { type: 'multiple-choice', question: "What is a 'Pavlova'?", options: ['A type of bird', 'A dessert', 'A school game'], answer: 'A dessert' },
          { type: 'true-false', question: "The currency is often called the 'Kiwi dollar'.", answer: 'True' },
          { type: 'multiple-choice', question: "Peter Jackson, the director of Lord of the Rings, is from...?", options: ['Australia', 'England', 'New Zealand'], answer: 'New Zealand' },
          { type: 'true-false', question: 'The school year in New Zealand is divided into two long semesters.', answer: 'False' },
          { type: 'multiple-choice', question: 'What is the Haka?', options: ['A type of food', 'A traditional Māori war dance', 'A national holiday'], answer: 'A traditional Māori war dance' },
          { type: 'true-false', question: 'Most students buy a hot lunch from the school tuck shop every day.', answer: 'False' },
          { type: 'multiple-choice', question: "Matariki is the Māori...?", options: ['National Day', 'God of the Forest', 'New Year'], answer: 'New Year' },
          { type: 'true-false', question: 'Besides English and Sign Language, Japanese is an official language.', answer: 'False' },
          { type: 'multiple-choice', question: 'Waitangi Day, the national day, is in which month?', options: ['February', 'July', 'October'], answer: 'February' },
          { type: 'true-false', question: 'Netball is a popular sport for girls after school.', answer: 'True' },
        ]
      },
    },
    // =========================================================================
    // JAPAN
    // =========================================================================
    {
      id: 'japan',
      name: 'Japan',
      capital: 'Tokyo',
      coordinates: { lat: 35.6895, lon: 139.6917 },
      timezones: ['Asia/Tokyo'],
      flag_img: 'https://flagcdn.com/w320/jp.png',
      name_header_img: 'images/countries/headers/japan-header.png',
      background_img: 'images/countries/japan/background.jpg',
      background_music: 'audio/music/japan.mp3',
      national_anthem: 'audio/anthems/japan.mp3',
      accent_color: '#bc002d',
      accent_color_secondary: '#FFFFFF',
      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is Japanese.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/general-languages-img.png"
        },
        flight_time: { 
          title: "Geography", 
          content: "Japan is an island nation in East Asia. It has four main islands: Hokkaido, Honshu, Shikoku, and Kyushu.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/general-info/content-images/general-travel-img.png"
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Japanese Yen (JPY).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/general-currency-img.png"
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Konnichiwa' is the standard word for 'Hello'. 'Ohayō gozaimasu' means 'Good morning' and 'Konbanwa' means 'Good evening'.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/general-info/content-images/general-hello-img.png"
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Japanese cuisine is famous for its fresh ingredients and beautiful presentation. Sushi, ramen, and tempura are known worldwide.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/culture-famous-food-img.png"
        },
        famous_people: { 
          title: "Famous People", 
          content: "Famous Japanese people include film director Akira Kurosawa, artist Hayao Miyazaki, and author Haruki Murakami.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/culture-people-img.png"
        },
        jp_famous_in: { 
          title: "Japanese Culture Abroad", 
          content: "Anime, manga, and video games from Japan are incredibly popular all over the world. Many people study Japanese because of their interest in this pop culture.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/culture-jp-famous-img.png"
        },
        holidays: { 
          title: "Holidays", 
          content: "Major holidays include New Year's (Shōgatsu), Golden Week in spring, and Obon in summer to honor ancestors.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/culture-holidays-img.png"
        },
        festivals: { 
          title: "Festivals", 
          content: "There are thousands of local festivals ('matsuri') in Japan, often featuring parades with portable shrines ('mikoshi'). Cherry blossom viewing ('hanami') is a beautiful spring tradition.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/culture-festivals-img.png"
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "The traditional national sport is Sumo wrestling. The most popular spectator sports are Baseball and Soccer.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/culture-sports-img.png"
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "The school day usually starts around 8:30 AM and ends around 3:30 PM. After regular classes, students do 'souji' (cleaning) of their classrooms.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/school-routine-img.png"
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The school year begins in April. The main holidays are a summer vacation, a winter break, and a spring break.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/school-holidays-img.png"
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study Japanese, Calligraphy, Mathematics, Social Studies, Science, and English. Moral Education and special activities are also important.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/school-subjects-img.png"
        },
        common_games: { 
          title: "Games at School", 
          content: "During break time ('yasumi jikan'), students play tag ('onigokko'), dodgeball, or jump rope ('nawatobi').", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/school-games-img.png"
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "In elementary and junior high school, students eat a nutritious hot lunch ('kyushoku') provided by the school. They serve the food to each other in their classroom.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/school-lunch-img.png"
        },
        after_school: { 
          title: "After School Activities", 
          content: "Most junior high school students join a school club ('bukatsu') for sports or cultural activities. Many students also attend cram school ('juku').", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/japan-popup-bg.png",
          content_img: "images/countries/japan/content-images/school-after-school-img.png"
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'The most popular spectator sport in Japan is Sumo.', answer: 'False' },
          { type: 'multiple-choice', question: "What is the school lunch provided by the school called?", options: ['Bento', 'Kyushoku', 'Onigiri'], answer: 'Kyushoku' },
          { type: 'true-false', question: 'After classes, students clean their own classrooms.', answer: 'True' },
          { type: 'multiple-choice', question: "What is the tradition of viewing cherry blossoms called?", options: ['Matsuri', 'Hanami', 'Obon'], answer: 'Hanami' },
          { type: 'true-false', question: "The Japanese school year begins in September.", answer: 'False' },
          { type: 'multiple-choice', question: "After-school clubs in junior high school are called...?", options: ['Juku', 'Bukatsu', 'Souji'], answer: 'Bukatsu' },
          { type: 'true-false', question: 'Hayao Miyazaki is a famous Japanese author.', answer: 'False' },
          { type: 'multiple-choice', question: "What is a cram school in Japan called?", options: ['Bukatsu', 'Juku', 'Kyushoku'], answer: 'Juku' },
          { type: 'true-false', question: 'The currency of Japan is the Yuan.', answer: 'False' },
          { type: 'multiple-choice', question: "What is 'onigokko'?", options: ['A type of food', 'The game of tag', 'A school subject'], answer: 'The game of tag' },
          { type: 'true-false', question: 'A portable shrine carried during festivals is called a "matsuri".', answer: 'False' },
          { type: 'multiple-choice', question: "What is the traditional national sport of Japan?", options: ['Judo', 'Baseball', 'Sumo'], answer: 'Sumo' },
          { type: 'true-false', question: 'Students in elementary school serve lunch to each other in their classroom.', answer: 'True' },
          { type: 'multiple-choice', question: "What does 'Ohayō gozaimasu' mean?", options: ['Good evening', 'Good afternoon', 'Good morning'], answer: 'Good morning' },
          { type: 'true-false', question: 'Golden Week is a major holiday period in the autumn.', answer: 'False' },
        ]
      },
    },
    // =========================================================================
    // BRASIL (BRAZIL)
    // =========================================================================
    {
      id: 'brasil',
      name: 'Brazil',
      capital: 'Brasília',
      coordinates: { lat: -15.8267, lon: -47.9218 },
      timezones: [
        'America/Noronha',     // Fernando de Noronha
        'America/Sao_Paulo',   // Brasília / East
        'America/Manaus',      // Amazonas
        'America/Rio_Branco'   // Acre
      ],
      flag_img: 'https://flagcdn.com/w320/br.png',
      name_header_img: 'images/countries/headers/brasil-header.png',
      background_img: 'images/countries/brasil/background.jpg',
      background_music: 'audio/music/brasil.mp3',
      national_anthem: 'audio/anthems/brasil.mp3',
      accent_color: '#009B3A',
      accent_color_secondary: '#FED100',

      
      general_info: {
        languages: { 
          title: "Official Language", 
          content: "The official language is Portuguese. Brazil is the only country in South America that speaks Portuguese.", 
          button_img: BUTTON_IMAGES.languages, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/general-languages-img.png" 
        },
        flight_time: { 
          title: "Flight Time from Japan", 
          content: "Brazil is on the opposite side of the world from Japan. A trip takes a very long time, usually 24 hours or more, with connections.", 
          button_img: BUTTON_IMAGES.flight_time, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/general-travel-img.png" 
        },
        currency: { 
          title: "Currency", 
          content: "The currency is the Brazilian Real (BRL).", 
          button_img: BUTTON_IMAGES.currency, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/general-currency-img.png" 
        },
        say_hello: { 
          title: "Say Hello!", 
          content: "'Olá' or the more casual 'Oi' are used for 'Hello'. 'Tudo bem?' ('Is everything good?') is a very common greeting.", 
          button_img: BUTTON_IMAGES.say_hello, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/general-hello-img.png" 
        },
      },
      culture: {
        famous_food: { 
          title: "Famous Food", 
          content: "Feijoada, a rich stew of black beans and pork, is the national dish. Churrasco (barbecue) is very popular, and Pão de Queijo (cheese bread) is a common snack.", 
          button_img: BUTTON_IMAGES.famous_food, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/culture-famous-food-img.png" 
        },
        famous_people: { 
          title: "Famous People", 
          content: "Football legends Pelé and Neymar are from Brazil. Supermodel Gisele Bündchen and musician Sérgio Mendes are also famous.", 
          button_img: BUTTON_IMAGES.famous_people, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/culture-people-img.png" 
        },
        jp_famous_in: { 
          title: "Japanese Influence", 
          content: "Brazil has the largest Japanese population outside of Japan. The neighborhood of Liberdade in São Paulo is a huge Japantown, and Japanese food and culture are very integrated.", 
          button_img: BUTTON_IMAGES.jp_famous_in, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/culture-jp-famous-img.png" 
        },
        holidays: { 
          title: "Holidays", 
          content: "Independence Day is on September 7th. Christmas and Easter are also major holidays.", 
          button_img: BUTTON_IMAGES.holidays, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/culture-holidays-img.png" 
        },
        festivals: { 
          title: "Festivals", 
          content: "Carnival is a massive, world-famous festival held before Lent, with huge parades, music, and dancing, especially in Rio de Janeiro and Salvador.", 
          button_img: BUTTON_IMAGES.festivals, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/culture-festivals-img.png" 
        },
        national_sport: { 
          title: "Popular Sports", 
          content: "Football (Soccer, or 'Futebol') is a national passion and part of the country's identity. The national team has won the World Cup five times, more than any other country.", 
          button_img: BUTTON_IMAGES.national_sport, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/culture-sports-img.png" 
        },
      },
      school_life: {
        school_routine: { 
          title: "School Routine", 
          content: "Schools often operate in morning (7 AM-12 PM) or afternoon (1 PM-6 PM) shifts. Lessons are typically 50 minutes long.", 
          button_img: BUTTON_IMAGES.school_routine, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/school-routine-img.png" 
        },
        school_holidays: { 
          title: "School Holidays", 
          content: "The school year runs from February to December, with a break in July and a long summer vacation in December and January.", 
          button_img: BUTTON_IMAGES.school_holidays, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/school-holidays-img.png" 
        },
        subjects: { 
          title: "Subjects", 
          content: "Students study Portuguese, Maths, Science, History, and Geography. Art and Physical Education are also part of the curriculum.", 
          button_img: BUTTON_IMAGES.subjects, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/school-subjects-img.png" 
        },
        common_games: { 
          title: "Games at School", 
          content: "Football is played everywhere, at any time, often with improvised balls and goals. Volleyball is also popular.", 
          button_img: BUTTON_IMAGES.common_games, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/school-games-img.png" 
        },
        school_lunch: { 
          title: "School Lunch", 
          content: "Public schools provide a free meal or snack called a 'merenda' to students.", 
          button_img: BUTTON_IMAGES.school_lunch, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/school-lunch-img.png" 
        },
        after_school: { 
          title: "After School Activities", 
          content: "Many children play football or capoeira (a Brazilian martial art that combines dance and music). Others might have extra lessons or help at home.", 
          button_img: BUTTON_IMAGES.after_school, 
          popup_img: "images/countries/popups/brasil-popup-bg.png", 
          content_img: "images/countries/brasil/content-images/school-after-school-img.png" 
        },
      },
      quiz: {
        questions: [
          { type: 'true-false', question: 'The main language in Brazil is Spanish.', answer: 'False' },
          { type: 'multiple-choice', question: "Brazil is famous for what festival?", options: ['Oktoberfest', 'Carnival', 'Holi'], answer: 'Carnival' },
          { type: 'true-false', question: 'The Amazon rainforest is primarily located in Brazil.', answer: 'True' },
          { type: 'multiple-choice', question: "What is the most popular sport in Brazil?", options: ['Volleyball', 'Basketball', 'Football'], answer: 'Football' },
          { type: 'true-false', question: "The capital of Brazil is Rio de Janeiro.", answer: 'False' },
          { type: 'multiple-choice', question: "What is 'Feijoada'?", options: ['A cheese bread', 'A bean and pork stew', 'A type of dance'], answer: 'A bean and pork stew' },
          { type: 'true-false', question: 'The Brazilian national team has won the World Cup more times than any other country.', answer: 'True' },
          { type: 'multiple-choice', question: 'What is "Pão de Queijo"?', options: ['Cheese bread', 'Barbecue', 'A musical instrument'], answer: 'Cheese bread' },
          { type: 'true-false', question: 'The school year in Brazil starts in September.', answer: 'False' },
          { type: 'multiple-choice', question: 'Pelé is a famous Brazilian...?', options: ['Musician', 'Footballer', 'Scientist'], answer: 'Footballer' },
          { type: 'true-false', question: 'Capoeira is a type of food.', answer: 'False' },
          { type: 'multiple-choice', question: 'What is the casual way to say "Hello" in Portuguese?', options: ['Olá', 'Oi', 'Ciao'], answer: 'Oi' },
          { type: 'true-false', question: 'Brazil has a very small Japanese population.', answer: 'False' },
          { type: 'multiple-choice', question: 'The currency of Brazil is the...?', options: ['Peso', 'Real', 'Dollar'], answer: 'Real' },
          { type: 'true-false', question: 'Churrasco is a type of Brazilian barbecue.', answer: 'True' },
        ]
      },
    },
];