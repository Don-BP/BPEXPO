import React, { useState, useEffect, useCallback } from 'react';
import './DateWeather.css';

// --- Constants ---

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const WEATHER_OPTIONS = [
  { value: 'sunny',   label: 'Sunny' },
  { value: 'cloudy',  label: 'Cloudy' },
  { value: 'rainy',   label: 'Rainy' },
  { value: 'snowy',   label: 'Snowy' },
  { value: 'stormy',  label: 'Stormy' },
  { value: 'windy',   label: 'Windy' },
];

function getOrdinalSuffix(day: number): string {
  if (day === 1 || day === 21 || day === 31) return 'st';
  if (day === 2 || day === 22) return 'nd';
  if (day === 3 || day === 23) return 'rd';
  return 'th';
}

function formatTime(date: Date): string {
  return [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0'),
  ].join(':');
}

// --- Types ---

interface DateWeatherProps {
  isFullscreen: boolean;
}

// --- Component ---

const DateWeather: React.FC<DateWeatherProps> = ({ isFullscreen }) => {
  const today = new Date();

  const [displayDate, setDisplayDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [time, setTime] = useState(formatTime(new Date()));
  const [weather, setWeather] = useState('sunny');

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime(new Date())), 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Calendar helpers ---

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  function selectDay(day: number) {
    setSelectedDate(new Date(year, month, day));
  }

  const isToday = (day: number) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

  const isSelected = (day: number) =>
    year === selectedDate.getFullYear() &&
    month === selectedDate.getMonth() &&
    day === selectedDate.getDate();

  // --- Render ---

  const dayOfMonth = selectedDate.getDate();
  const suffix = getOrdinalSuffix(dayOfMonth);

  const toolClass = `date-weather-tool${isFullscreen ? ' fullscreen-mode' : ''}`;

  const calendar = (
    <div className="dw-left-panel">
      <div className="dw-calendar-nav">
        <button className="dw-nav-btn tool-btn" onClick={prevMonth}>⇦</button>
        <h3 className="dw-calendar-header">{MONTH_NAMES[month]} {year}</h3>
        <button className="dw-nav-btn tool-btn" onClick={nextMonth}>⇨</button>
      </div>
      <div className="dw-calendar-grid">
        {DAY_ABBR.map(d => (
          <div key={d} className="dw-day-name">{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} className="dw-date-cell empty" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const cls = [
            'dw-date-cell',
            isToday(day) ? 'current-day' : '',
            isSelected(day) ? 'selected-day' : '',
          ].filter(Boolean).join(' ');
          return (
            <div key={day} className={cls} onClick={() => selectDay(day)}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );

  const timeWeatherBox = (
    <div className="dw-time-weather-box">
      <div className="dw-time-weather-row">
        <div className="dw-time-display">{time}</div>
        <div className="dw-weather-display">
          <div className="dw-weather-controls">
            <select value={weather} onChange={e => setWeather(e.target.value)}>
              {WEATHER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="dw-weather-text">{WEATHER_OPTIONS.find(o => o.value === weather)?.label}</div>
          <img
            className="dw-weather-img"
            src={`/teacher_tools/assets/weather/${weather}.png`}
            alt={weather}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={toolClass}>
      <div className="dw-main-content">
        {calendar}
        <div className="dw-right-panel">
          {isFullscreen ? (
            <>
              <div className="dw-month-display">{MONTH_NAMES[selectedDate.getMonth()]}</div>
              <div className="dw-day-date-row">
                <div className="dw-day-display">{DAY_NAMES[selectedDate.getDay()]}</div>
                <div className="dw-date-display">{dayOfMonth}<sup>{suffix}</sup></div>
              </div>
            </>
          ) : (
            timeWeatherBox
          )}
        </div>
      </div>
      {isFullscreen && timeWeatherBox}
    </div>
  );
};

export default DateWeather;
