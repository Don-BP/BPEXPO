import React, { useState, useMemo, useEffect, useRef } from 'react';
import vocabulary from '../data/pronunciation_vocab.js';

export const CATEGORIES = [
  { id: 'feelings', name: 'Feelings', image: '/assets/images/categories/category_feelings.png' },
  { id: 'family', name: 'Family', image: '/assets/images/categories/category_family.png' },
  { id: 'body', name: 'Body', image: '/assets/images/categories/category_body.png' },
  { id: 'jobs', name: 'Jobs', image: '/assets/images/categories/category_jobs.png' },
  { id: 'food', name: 'Food', image: '/assets/images/categories/category_food.png' },
  { id: 'fruit', name: 'Fruit', image: '/assets/images/categories/category_fruit.png' },
  { id: 'vegetables', name: 'Vegetables', image: '/assets/images/categories/category_vegetables.png' },
  { id: 'animals', name: 'Animals', image: '/assets/images/categories/category_animals.png' },
  { id: 'nature', name: 'Nature', image: '/assets/images/categories/category_nature.png' },
  { id: 'weather', name: 'Weather', image: '/assets/images/categories/category_weather.png' },
  { id: 'school_subjects', name: 'School Subjects', image: '/assets/images/categories/category_school_subjects.png' },
  { id: 'stationery', name: 'Stationery', image: '/assets/images/categories/category_stationery.png' },
  { id: 'school_places', name: 'School Places', image: '/assets/images/categories/category_school_places.png' },
  { id: 'school_events', name: 'School Events', image: '/assets/images/categories/category_school_events.png' },
  { id: 'club_activities', name: 'Club Activities', image: '/assets/images/categories/category_club_activities.png' },
  { id: 'daily_activities', name: 'Daily Activities', image: '/assets/images/categories/category_daily_activities.png' },
  { id: 'hobbies', name: 'Hobbies', image: '/assets/images/categories/category_hobbies.png' },
  { id: 'sports', name: 'Sports', image: '/assets/images/categories/category_sports.png' },
  { id: 'musical_instruments', name: 'Instruments', image: '/assets/images/categories/category_musical_instruments.png' },
  { id: 'items', name: 'Items', image: '/assets/images/categories/category_items.png' },
  { id: 'places', name: 'Places', image: '/assets/images/categories/category_places.png' },
  { id: 'countries', name: 'Countries', image: '/assets/images/categories/category_countries.png' },
  { id: 'transportation', name: 'Transportation', image: '/assets/images/categories/category_transportation.png' },
  { id: 'days', name: 'Days', image: '/assets/images/categories/category_days.png' },
  { id: 'months', name: 'Months', image: '/assets/images/categories/category_months.png' },
  { id: 'seasons', name: 'Seasons', image: '/assets/images/categories/category_seasons.png' },
  { id: 'time_expressions', name: 'Time Expressions', image: '/assets/images/categories/category_time_expressions.png' },
  { id: 'verbs', name: 'Verbs', image: '/assets/images/categories/category_verbs.png' },
  { id: 'adjectives', name: 'Adjectives', image: '/assets/images/categories/category_adjectives.png' },
  { id: 'colors', name: 'Colors', image: '/assets/images/categories/category_colors.png' },
  { id: 'numbers', name: 'Numbers', image: '/assets/images/categories/category_numbers.png' },
  { id: 'shapes', name: 'Shapes', image: '/assets/images/categories/category_shapes.png' },
  { id: 'concepts', name: 'Concepts', image: '/assets/images/categories/category_concepts.png' },
  { id: 'frequency_adverbs', name: 'How Often?', image: '/assets/images/categories/category_frequency_adverbs.png' },
  { id: 'japanese_events', name: 'Japanese Events', image: '/assets/images/categories/category_japanese_events.png' },
];

const GRADE_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const displayGrade = (grade) => {
  if (grade > 6) return `JHS ${grade - 6}`;
  return `G${grade}`;
};

function TangoSetupScreen({ onSelectionChange }) {
  const [selectedGrade, setSelectedGrade] = useState(3);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [cardSize, setCardSize] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSelectionChange({ grade: selectedGrade, categories: selectedCategories });
  }, [selectedGrade, selectedCategories, onSelectionChange]);

  const availableCategories = useMemo(() => {
    const categoriesForGrade = new Set(
      vocabulary.filter(w => w.grade <= selectedGrade).map(w => w.category)
    );
    return CATEGORIES.map(cat => ({ ...cat, isAvailable: categoriesForGrade.has(cat.id) }));
  }, [selectedGrade]);

  const numCols = useMemo(
    () => Math.ceil(Math.sqrt(availableCategories.length)),
    [availableCategories.length]
  );
  const numRows = useMemo(
    () => Math.ceil(availableCategories.length / numCols),
    [availableCategories.length, numCols]
  );

  // Measure the container and compute the largest square card that fits
  useEffect(() => {
    let mounted = true;
    const el = containerRef.current;
    if (!el) return;
    const gap = 10;

    const compute = (width: number, height: number) => {
      if (!mounted || width === 0 || height === 0) return;
      const maxW = Math.floor((width - (numCols - 1) * gap) / numCols);
      const maxH = Math.floor((height - (numRows - 1) * gap) / numRows);
      setCardSize(Math.max(0, Math.min(maxW, maxH)));
    };

    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      compute(width, height);
    });
    obs.observe(el);
    compute(el.clientWidth, el.clientHeight);
    return () => {
      mounted = false;
      obs.disconnect();
    };
  }, [numCols, numRows]);

  const handleGradeChange = (newGrade) => {
    setSelectedGrade(newGrade);
    const valid = new Set(
      vocabulary.filter(w => w.grade <= newGrade).map(w => w.category)
    );
    setSelectedCategories(prev => prev.filter(id => valid.has(id)));
  };

  const handleCategoryToggle = (categoryId, isAvailable) => {
    if (!isAvailable) return;
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const gridStyle = cardSize > 0
    ? { gridTemplateColumns: `repeat(${numCols}, ${cardSize}px)` }
    : { gridTemplateColumns: `repeat(${numCols}, 1fr)` };

  const buttonStyle = cardSize > 0
    ? { width: `${cardSize}px`, height: `${cardSize}px` }
    : undefined;

  return (
    <div className="tango-setup-screen">
      <div className="tango-setup-section">
        <h2 className="tango-setup-header">Choose Grade Level</h2>
        <div className="tango-grade-dropdown-container">
          <select
            className="tango-grade-dropdown"
            value={selectedGrade}
            onChange={(e) => handleGradeChange(Number(e.target.value))}
          >
            {GRADE_LEVELS.map(grade => (
              <option key={grade} value={grade}>
                {displayGrade(grade)} - {grade <= 6 ? 'Elementary' : 'Junior High'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tango-setup-section tango-category-picker">
        <h2 className="tango-setup-header">Choose Categories</h2>
        <div ref={containerRef} className="tango-category-container" style={gridStyle}>
          {availableCategories.map(category => {
            const isSelected = selectedCategories.includes(category.id);
            let buttonClass = 'tango-category-button';
            if (isSelected) buttonClass += ' selected';
            if (!category.isAvailable) buttonClass += ' disabled';

            return (
              <button
                key={category.id}
                className={buttonClass}
                style={buttonStyle}
                onClick={() => handleCategoryToggle(category.id, category.isAvailable)}
                disabled={!category.isAvailable}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="tango-category-image"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="tango-category-text">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TangoSetupScreen;
