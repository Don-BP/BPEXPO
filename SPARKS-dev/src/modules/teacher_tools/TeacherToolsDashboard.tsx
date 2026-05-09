import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolCard from './ToolCard';
import LessonMenu from './tools/LessonMenu';
import DateWeather from './tools/DateWeather';
import NamePicker from './tools/NamePicker';
import ClassroomTimer from './tools/ClassroomTimer';
import Flashcards from './tools/Flashcards';
import FlashcardManager from './tools/FlashcardManager';
import Scoreboard from './tools/Scoreboard';
import WhatsMissing from './tools/WhatsMissing';
import BingoPicker from './tools/BingoPicker';
import MysteryWord from './tools/MysteryWord';
import ActivitySpinner from './tools/ActivitySpinner';
import CoinToss from './tools/CoinToss';
import DiceRoller from './tools/DiceRoller';
import NoiseMeter from './tools/NoiseMeter';
import Phonics from './tools/Phonics';
import SoundBoard from './tools/SoundBoard';
import Whiteboard from './tools/Whiteboard';
import TornadoGame from './tools/TornadoGame';
import JeopardyGame from './tools/JeopardyGame';
import SpinAndSpeakGame from './tools/SpinAndSpeakGame';
import HiddenPictureGame from './tools/HiddenPictureGame';
import MemoryMatchGame from './tools/MemoryMatchGame';
import LockOverlay from '../../components/monetization/LockOverlay';
import './TeacherToolsDashboard.css';

const BeatChantNavCard: React.FC = () => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const cardStyle = {
    '--card-border': '#F06292',
    '--card-shadow': '#880E4F',
    '--card-header': '#D81B60',
    cursor: 'pointer',
  } as React.CSSProperties;

  return (
    <div className="tool-card" style={cardStyle} onClick={() => navigate('/teacher-tools/beat-chant')}>
      <button
        className="favorite-btn"
        title="Add to Favorites"
        onClick={e => { e.stopPropagation(); setIsFavorite(p => !p); }}
      >
        {isFavorite ? '♥' : '♡'}
      </button>
      <h2>Beat Chant</h2>
      <div className="tool-card-content" style={{ alignItems: 'center', justifyContent: 'center', gap: '8px', paddingTop: '12px' }}>
        <div style={{ fontSize: '3em' }}>🎵</div>
        <div style={{ fontWeight: 700, color: '#D81B60', fontSize: '0.9em', textAlign: 'center' }}>Rhythm chanting game</div>
        <div style={{ fontSize: '0.75em', color: '#9E9E9E', textAlign: 'center' }}>Opens full screen</div>
      </div>
    </div>
  );
};

const TeacherToolsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [scoreboardReturn, setScoreboardReturn] = useState<{ label: string; openFn: () => void } | null>(null);

  const [lessonMenuFullscreen, setLessonMenuFullscreen] = useState(false);
  const [dateWeatherFullscreen, setDateWeatherFullscreen] = useState(false);
  const [namePickerFullscreen, setNamePickerFullscreen] = useState(false);
  const [classroomTimerFullscreen, setClassroomTimerFullscreen] = useState(false);
  const [flashcardsFullscreen, setFlashcardsFullscreen] = useState(false);
  const [flashcardManagerFullscreen, setFlashcardManagerFullscreen] = useState(false);
  const [scoreboardFullscreen, setScoreboardFullscreen] = useState(false);
  const [whatsMissingFullscreen, setWhatsMissingFullscreen] = useState(false);
  const [bingoPickerFullscreen, setBingoPickerFullscreen] = useState(false);
  const [mysteryWordFullscreen, setMysteryWordFullscreen] = useState(false);
  const [activitySpinnerFullscreen, setActivitySpinnerFullscreen] = useState(false);
  const [coinTossFullscreen, setCoinTossFullscreen] = useState(false);
  const [diceRollerFullscreen, setDiceRollerFullscreen] = useState(false);
  const [noiseMeterFullscreen, setNoiseMeterFullscreen] = useState(false);
  const [phonicsFullscreen, setPhonicsFullscreen] = useState(false);
  const [soundBoardFullscreen, setSoundBoardFullscreen] = useState(false);
  const [whiteboardFullscreen, setWhiteboardFullscreen] = useState(false);
  const [tornadoFullscreen, setTornadoFullscreen] = useState(false);
  const [jeopardyFullscreen, setJeopardyFullscreen] = useState(false);
  const [spinAndSpeakFullscreen, setSpinAndSpeakFullscreen] = useState(false);
  const [hiddenPictureFullscreen, setHiddenPictureFullscreen] = useState(false);
  const [memoryMatchFullscreen, setMemoryMatchFullscreen] = useState(false);

  function goToScoreboard(label: string, closeFn: () => void, openFn: () => void) {
    closeFn();
    setScoreboardReturn({ label, openFn });
    setScoreboardFullscreen(true);
  }

  function returnFromScoreboard() {
    setScoreboardFullscreen(false);
    scoreboardReturn?.openFn();
    setScoreboardReturn(null);
  }

  return (
    <div className="tt-dashboard">
      <header className="tt-header">
        <h1>Tools & Games</h1>
      </header>

      <div className="tt-icon-menu">
        <button title="Home" onClick={() => navigate('/')}>🏠</button>
        <button title="Toggle Sound">🔊</button>
        <button title="Show Favorites">♡</button>
      </div>

      <div className="tt-tool-container">

        <LockOverlay featureId="tt_lesson_menu" featureName="Lesson Menu">
          <ToolCard
            title="Lesson Menu"
            cardBorder="#EC407A"
            cardShadow="#880E4F"
            cardHeader="#D81B60"
            isFullscreen={lessonMenuFullscreen}
            onFullscreenToggle={() => setLessonMenuFullscreen(p => !p)}
          >
            <LessonMenu isFullscreen={lessonMenuFullscreen} />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_date_weather" featureName="Date & Weather">
          <ToolCard
            title="Date & Weather"
            cardBorder="#42A5F5"
            cardShadow="#1565C0"
            cardHeader="#1E88E5"
            isFullscreen={dateWeatherFullscreen}
            onFullscreenToggle={() => setDateWeatherFullscreen(p => !p)}
          >
            <DateWeather isFullscreen={dateWeatherFullscreen} />
          </ToolCard>
        </LockOverlay>

        {/* FREE TOOL — no lock */}
        <ToolCard
          title="Name Picker"
          cardBorder="#FF7043"
          cardShadow="#BF360C"
          cardHeader="#F4511E"
          isFullscreen={namePickerFullscreen}
          onFullscreenToggle={() => setNamePickerFullscreen(p => !p)}
        >
          <NamePicker isFullscreen={namePickerFullscreen} />
        </ToolCard>

        <LockOverlay featureId="tt_classroom_timer" featureName="Classroom Timer">
          <ToolCard
            title="Classroom Timer"
            cardBorder="#66BB6A"
            cardShadow="#1B5E20"
            cardHeader="#43A047"
            isFullscreen={classroomTimerFullscreen}
            onFullscreenToggle={() => setClassroomTimerFullscreen(p => !p)}
          >
            <ClassroomTimer isFullscreen={classroomTimerFullscreen} />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_flashcards" featureName="Flashcards">
          <ToolCard
            title="Flashcards"
            cardBorder="#AB47BC"
            cardShadow="#4A148C"
            cardHeader="#8E24AA"
            isFullscreen={flashcardsFullscreen}
            onFullscreenToggle={() => setFlashcardsFullscreen(p => !p)}
          >
            <Flashcards
              isFullscreen={flashcardsFullscreen}
              onGoToScoreboard={() => goToScoreboard('Flashcards', () => setFlashcardsFullscreen(false), () => setFlashcardsFullscreen(true))}
            />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_flashcard_manager" featureName="Flashcard Manager">
          <ToolCard
            title="Flashcard Manager"
            cardBorder="#26A69A"
            cardShadow="#00695C"
            cardHeader="#00897B"
            isFullscreen={flashcardManagerFullscreen}
            onFullscreenToggle={() => setFlashcardManagerFullscreen(p => !p)}
          >
            <FlashcardManager isFullscreen={flashcardManagerFullscreen} />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_scoreboard" featureName="Scoreboard">
          <ToolCard
            title="Scoreboard"
            cardBorder="#FFA726"
            cardShadow="#E65100"
            cardHeader="#FB8C00"
            isFullscreen={scoreboardFullscreen}
            onFullscreenToggle={() => setScoreboardFullscreen(p => !p)}
          >
            <Scoreboard
              isFullscreen={scoreboardFullscreen}
              returnFrom={scoreboardReturn?.label}
              onReturnFrom={returnFromScoreboard}
              onExitFullscreen={() => setScoreboardFullscreen(false)}
            />
          </ToolCard>
        </LockOverlay>

        {/* FREE TOOL — no lock */}
        <ToolCard
          title="What's Missing?"
          cardBorder="#7E57C2"
          cardShadow="#311B92"
          cardHeader="#6A1B9A"
          isFullscreen={whatsMissingFullscreen}
          onFullscreenToggle={() => setWhatsMissingFullscreen(p => !p)}
        >
          <WhatsMissing
            isFullscreen={whatsMissingFullscreen}
            onGoToScoreboard={() => goToScoreboard("What's Missing", () => setWhatsMissingFullscreen(false), () => setWhatsMissingFullscreen(true))}
          />
        </ToolCard>

        {/* FREE TOOL — no lock */}
        <ToolCard
          title="Bingo Picker"
          cardBorder="#EF5350"
          cardShadow="#B71C1C"
          cardHeader="#E53935"
          isFullscreen={bingoPickerFullscreen}
          onFullscreenToggle={() => setBingoPickerFullscreen(p => !p)}
        >
          <BingoPicker
            isFullscreen={bingoPickerFullscreen}
            onGoToScoreboard={() => goToScoreboard('Bingo Picker', () => setBingoPickerFullscreen(false), () => setBingoPickerFullscreen(true))}
          />
        </ToolCard>

        <LockOverlay featureId="tt_mystery_word" featureName="Mystery Word">
          <ToolCard
            title="Mystery Word"
            cardBorder="#26C6DA"
            cardShadow="#00838F"
            cardHeader="#00ACC1"
            isFullscreen={mysteryWordFullscreen}
            onFullscreenToggle={() => setMysteryWordFullscreen(p => !p)}
          >
            <MysteryWord
              isFullscreen={mysteryWordFullscreen}
              onGoToScoreboard={() => goToScoreboard('Mystery Word', () => setMysteryWordFullscreen(false), () => setMysteryWordFullscreen(true))}
            />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_activity_spinner" featureName="Activity Spinner">
          <ToolCard
            title="Activity Spinner"
            cardBorder="#00E676"
            cardShadow="#00600F"
            cardHeader="#00897B"
            isFullscreen={activitySpinnerFullscreen}
            onFullscreenToggle={() => setActivitySpinnerFullscreen(p => !p)}
          >
            <ActivitySpinner
              isFullscreen={activitySpinnerFullscreen}
              onGoToScoreboard={() => goToScoreboard('Activity Spinner', () => setActivitySpinnerFullscreen(false), () => setActivitySpinnerFullscreen(true))}
            />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_coin_toss" featureName="Coin Toss">
          <ToolCard
            title="Coin Toss"
            cardBorder="#FFA726"
            cardShadow="#E65100"
            cardHeader="#F57C00"
            isFullscreen={coinTossFullscreen}
            onFullscreenToggle={() => setCoinTossFullscreen(p => !p)}
          >
            <CoinToss
              isFullscreen={coinTossFullscreen}
              onGoToScoreboard={() => goToScoreboard('Coin Toss', () => setCoinTossFullscreen(false), () => setCoinTossFullscreen(true))}
            />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_dice_roller" featureName="Dice Roller">
          <ToolCard
            title="Dice Roller"
            cardBorder="#7E57C2"
            cardShadow="#1A237E"
            cardHeader="#512DA8"
            isFullscreen={diceRollerFullscreen}
            onFullscreenToggle={() => setDiceRollerFullscreen(p => !p)}
          >
            <DiceRoller
              isFullscreen={diceRollerFullscreen}
              onGoToScoreboard={() => goToScoreboard('Dice Roller', () => setDiceRollerFullscreen(false), () => setDiceRollerFullscreen(true))}
            />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_noise_meter" featureName="Noise Meter">
          <ToolCard
            title="Noise Meter"
            cardBorder="#66BB6A"
            cardShadow="#1B5E20"
            cardHeader="#388E3C"
            isFullscreen={noiseMeterFullscreen}
            onFullscreenToggle={() => setNoiseMeterFullscreen(p => !p)}
          >
            <NoiseMeter isFullscreen={noiseMeterFullscreen} />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_phonics" featureName="Phonics">
          <ToolCard
            title="Phonics"
            cardBorder="#EF5350"
            cardShadow="#B71C1C"
            cardHeader="#C62828"
            isFullscreen={phonicsFullscreen}
            onFullscreenToggle={() => setPhonicsFullscreen(p => !p)}
          >
            <Phonics isFullscreen={phonicsFullscreen} />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_sound_board" featureName="Sound Board">
          <ToolCard
            title="Sound Board"
            cardBorder="#26A69A"
            cardShadow="#00695C"
            cardHeader="#00897B"
            isFullscreen={soundBoardFullscreen}
            onFullscreenToggle={() => setSoundBoardFullscreen(p => !p)}
          >
            <SoundBoard isFullscreen={soundBoardFullscreen} />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_whiteboard" featureName="Whiteboard">
          <ToolCard
            title="Whiteboard"
            cardBorder="#78909C"
            cardShadow="#263238"
            cardHeader="#546E7A"
            isFullscreen={whiteboardFullscreen}
            onFullscreenToggle={() => setWhiteboardFullscreen(p => !p)}
          >
            <Whiteboard isFullscreen={whiteboardFullscreen} />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_tornado" featureName="Tornado">
          <ToolCard
            title="Tornado"
            cardBorder="#EF5350"
            cardShadow="#B71C1C"
            cardHeader="#E53935"
            isFullscreen={tornadoFullscreen}
            onFullscreenToggle={() => setTornadoFullscreen(p => !p)}
          >
            <TornadoGame isFullscreen={tornadoFullscreen} />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_jeopardy" featureName="Jeopardy">
          <ToolCard
            title="Jeopardy"
            cardBorder="#1976D2"
            cardShadow="#0D47A1"
            cardHeader="#1565C0"
            isFullscreen={jeopardyFullscreen}
            onFullscreenToggle={() => setJeopardyFullscreen(p => !p)}
          >
            <JeopardyGame isFullscreen={jeopardyFullscreen} />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_spin_speak" featureName="Spin & Speak">
          <ToolCard
            title="Spin & Speak"
            cardBorder="#AB47BC"
            cardShadow="#4A148C"
            cardHeader="#8E24AA"
            isFullscreen={spinAndSpeakFullscreen}
            onFullscreenToggle={() => setSpinAndSpeakFullscreen(p => !p)}
          >
            <SpinAndSpeakGame isFullscreen={spinAndSpeakFullscreen} onGoToScoreboard={() => goToScoreboard('Spin & Speak', () => setSpinAndSpeakFullscreen(false), () => setSpinAndSpeakFullscreen(true))} />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_hidden_picture" featureName="Hidden Picture">
          <ToolCard
            title="Hidden Picture"
            cardBorder="#26A69A"
            cardShadow="#00695C"
            cardHeader="#00897B"
            isFullscreen={hiddenPictureFullscreen}
            onFullscreenToggle={() => setHiddenPictureFullscreen(p => !p)}
          >
            <HiddenPictureGame isFullscreen={hiddenPictureFullscreen} onGoToScoreboard={() => goToScoreboard('Hidden Picture', () => setHiddenPictureFullscreen(false), () => setHiddenPictureFullscreen(true))} />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_memory_match" featureName="Memory Match">
          <ToolCard
            title="Memory Match"
            cardBorder="#7E57C2"
            cardShadow="#311B92"
            cardHeader="#5E35B1"
            isFullscreen={memoryMatchFullscreen}
            onFullscreenToggle={() => setMemoryMatchFullscreen(p => !p)}
          >
            <MemoryMatchGame isFullscreen={memoryMatchFullscreen} />
          </ToolCard>
        </LockOverlay>

        <LockOverlay featureId="tt_snakes_ladders" featureName="Snakes & Ladders">
          <div className="tool-card" style={{ '--card-border': '#66BB6A', '--card-shadow': '#1B5E20', '--card-header': '#43A047', cursor: 'pointer' } as React.CSSProperties}
            onClick={() => navigate('/teacher-tools/snakes-and-ladders')}>
            <h2>Snakes &amp; Ladders</h2>
            <div className="tool-card-content" style={{ alignItems: 'center', justifyContent: 'center', gap: '8px', paddingTop: '12px' }}>
              <div style={{ fontSize: '3em' }}>🐍</div>
              <div style={{ fontWeight: 700, color: '#43A047', fontSize: '0.9em', textAlign: 'center' }}>Board game with questions</div>
              <div style={{ fontSize: '0.75em', color: '#9E9E9E', textAlign: 'center' }}>Opens full screen</div>
            </div>
          </div>
        </LockOverlay>

        <LockOverlay featureId="tt_beat_chant" featureName="Beat Chant">
          <BeatChantNavCard />
        </LockOverlay>

      </div>
    </div>
  );
};

export default TeacherToolsDashboard;
