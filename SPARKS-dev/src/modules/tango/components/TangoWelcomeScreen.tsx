// ========= START: bp-tango-dev/src/components/TangoWelcomeScreen.js (ADDED HUB LINK) =========
import React from 'react';

function TangoWelcomeScreen({ onStart }) {
  const welcomeScreenStyle = {
    backgroundImage: `url(/assets/backgrounds/welcome-bg.jpg)`
  };

  return (
    <div className="tango-welcome-screen" style={welcomeScreenStyle}>
      {/* NEW: Return to Hub Button */}
      <a href="/" className="labo-hub-return-btn">
        ↩️ LABO Hub
      </a>

      <img
        src="/assets/backgrounds/action_lines.png"
        alt=""
        className="action-lines-overlay"
      />
      <div className="tango-welcome-content">
        <img
          src="/assets/logo/bp-tango-logo.png"
          alt="BP Tango Logo"
          className="tango-welcome-logo"
        />
        <button className="welcome-start-button" onClick={onStart}>
          <img
            src="/assets/logo/start_tango.png"
            alt="Start Button"
          />
        </button>
      </div>
    </div>
  );
}

export default TangoWelcomeScreen;
// ========= END: bp-tango-dev/src/components/TangoWelcomeScreen.js (ADDED HUB LINK) =========