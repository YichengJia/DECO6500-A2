import React from 'react';

/**
 * AccessibilityPanel Component
 *
 * Centralized control panel for all accessibility features to support
 * users with attention difficulties, dyslexia, ADHD, and other learning differences.
 * Aligns with SDG 4.5 by providing equitable access to educational content.
 *
 * Features:
 * - Font size adjustment
 * - Line height control
 * - Color contrast options
 * - Focus mode toggles
 * - Reading assistance tools
 * - Quick presets for common needs
 */

interface AccessibilityPanelProps {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  setFontSize: (size: 'small' | 'medium' | 'large' | 'xlarge') => void;
  lineHeight: 'normal' | 'relaxed' | 'loose';
  setLineHeight: (height: 'normal' | 'relaxed' | 'loose') => void;
  showReadingGuide: boolean;
  setShowReadingGuide: (show: boolean) => void;
  bionicReadingEnabled: boolean;
  setBionicReadingEnabled: (enabled: boolean) => void;
  onClose: () => void;
}

interface Preset {
  id: string;
  name: string;
  icon: string;
  description: string;
  settings: {
    fontSize: 'small' | 'medium' | 'large' | 'xlarge';
    lineHeight: 'normal' | 'relaxed' | 'loose';
    showReadingGuide: boolean;
    bionicReadingEnabled: boolean;
  };
}

const presets: Preset[] = [
  {
    id: 'default',
    name: 'Default',
    icon: '⚙️',
    description: 'Standard settings',
    settings: {
      fontSize: 'medium',
      lineHeight: 'normal',
      showReadingGuide: false,
      bionicReadingEnabled: false,
    }
  },
  {
    id: 'adhd',
    name: 'ADHD Focus',
    icon: '🎯',
    description: 'Optimized for attention difficulties',
    settings: {
      fontSize: 'large',
      lineHeight: 'relaxed',
      showReadingGuide: true,
      bionicReadingEnabled: true,
    }
  },
  {
    id: 'dyslexia',
    name: 'Dyslexia',
    icon: '📖',
    description: 'Enhanced reading support',
    settings: {
      fontSize: 'large',
      lineHeight: 'loose',
      showReadingGuide: true,
      bionicReadingEnabled: false,
    }
  },
  {
    id: 'low-vision',
    name: 'Low Vision',
    icon: '👁️',
    description: 'Maximum visibility',
    settings: {
      fontSize: 'xlarge',
      lineHeight: 'loose',
      showReadingGuide: false,
      bionicReadingEnabled: false,
    }
  }
];

export default function AccessibilityPanel({
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  showReadingGuide,
  setShowReadingGuide,
  bionicReadingEnabled,
  setBionicReadingEnabled,
  onClose,
}: AccessibilityPanelProps) {

  const applyPreset = (preset: Preset) => {
    setFontSize(preset.settings.fontSize);
    setLineHeight(preset.settings.lineHeight);
    setShowReadingGuide(preset.settings.showReadingGuide);
    setBionicReadingEnabled(preset.settings.bionicReadingEnabled);

    // Save to localStorage
    localStorage.setItem('accessibilityPreset', preset.id);
  };

  return (
    <>
      <style>{`
        .accessibility-panel {
          position: fixed;
          top: 60px;
          right: 20px;
          width: 380px;
          max-width: 90vw;
          max-height: 80vh;
          overflow-y: auto;
          background: var(--surface-1);
          border: 2px solid var(--surface-2);
          border-radius: 16px;
          padding: 20px;
          z-index: 10000;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          backdrop-filter: blur(20px);
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--surface-2);
        }
        
        .panel-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-1);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-2);
          font-size: 24px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background 0.2s;
        }
        
        .close-btn:hover {
          background: var(--surface-2);
        }
        
        .section {
          margin-bottom: 20px;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-1);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }
        
        .preset-button {
          padding: 12px;
          background: var(--surface-2);
          border: 2px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        
        .preset-button:hover {
          background: var(--surface-3);
          transform: translateY(-2px);
        }
        
        .preset-button.active {
          border-color: var(--brand-400);
          background: var(--brand-400);
          background: linear-gradient(135deg, var(--brand-400) 0%, var(--brand-500) 100%);
          color: white;
        }
        
        .preset-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }
        
        .preset-name {
          font-size: 12px;
          font-weight: 600;
        }
        
        .control-group {
          margin-bottom: 16px;
        }
        
        .control-label {
          display: block;
          font-size: 13px;
          color: var(--text-2);
          margin-bottom: 8px;
        }
        
        .button-group {
          display: flex;
          gap: 4px;
        }
        
        .button-option {
          flex: 1;
          padding: 8px;
          background: var(--surface-2);
          border: 1px solid var(--surface-3);
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
          text-align: center;
        }
        
        .button-option:hover {
          background: var(--surface-3);
        }
        
        .button-option.selected {
          background: var(--brand-400);
          color: white;
          border-color: var(--brand-400);
        }
        
        .toggle-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--surface-2);
          border-radius: 8px;
          margin-bottom: 8px;
        }
        
        .toggle-info {
          flex: 1;
        }
        
        .toggle-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-1);
          margin-bottom: 2px;
        }
        
        .toggle-description {
          font-size: 11px;
          color: var(--text-2);
        }
        
        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background: var(--surface-3);
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .toggle-switch.active {
          background: var(--brand-400);
        }
        
        .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .toggle-switch.active .toggle-slider {
          transform: translateX(20px);
        }
        
        .help-text {
          padding: 12px;
          background: var(--surface-2);
          border-radius: 8px;
          margin-top: 16px;
        }
        
        .help-text p {
          margin: 0;
          font-size: 12px;
          color: var(--text-2);
          line-height: 1.6;
        }
        
        @media (max-width: 480px) {
          .accessibility-panel {
            width: calc(100vw - 40px);
            right: 10px;
          }
          
          .preset-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="accessibility-panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>♿</span>
            Accessibility Settings
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Quick Presets */}
        <div className="section">
          <div className="section-title">
            <span>⚡</span>
            Quick Presets
          </div>
          <div className="preset-grid">
            {presets.map((preset) => (
              <button
                key={preset.id}
                className={`preset-button ${
                  fontSize === preset.settings.fontSize &&
                  lineHeight === preset.settings.lineHeight &&
                  showReadingGuide === preset.settings.showReadingGuide &&
                  bionicReadingEnabled === preset.settings.bionicReadingEnabled
                    ? 'active'
                    : ''
                }`}
                onClick={() => applyPreset(preset)}
                title={preset.description}
              >
                <div className="preset-icon">{preset.icon}</div>
                <div className="preset-name">{preset.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Settings */}
        <div className="section">
          <div className="section-title">
            <span>📝</span>
            Text Settings
          </div>

          <div className="control-group">
            <label className="control-label">Font Size</label>
            <div className="button-group">
              {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  className={`button-option ${fontSize === size ? 'selected' : ''}`}
                  onClick={() => setFontSize(size)}
                >
                  {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'XL'}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">Line Spacing</label>
            <div className="button-group">
              {(['normal', 'relaxed', 'loose'] as const).map((height) => (
                <button
                  key={height}
                  className={`button-option ${lineHeight === height ? 'selected' : ''}`}
                  onClick={() => setLineHeight(height)}
                >
                  {height === 'normal' ? 'Normal' : height === 'relaxed' ? 'Relaxed' : 'Loose'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reading Tools */}
        <div className="section">
          <div className="section-title">
            <span>👁️</span>
            Reading Assistance
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-title">Reading Guide</div>
              <div className="toggle-description">Highlight line follows your cursor</div>
            </div>
            <div
              className={`toggle-switch ${showReadingGuide ? 'active' : ''}`}
              onClick={() => setShowReadingGuide(!showReadingGuide)}
              role="switch"
              aria-checked={showReadingGuide}
              tabIndex={0}
            >
              <div className="toggle-slider" />
            </div>
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-title">Bionic Reading</div>
              <div className="toggle-description">Bold first part of words for faster reading</div>
            </div>
            <div
              className={`toggle-switch ${bionicReadingEnabled ? 'active' : ''}`}
              onClick={() => setBionicReadingEnabled(!bionicReadingEnabled)}
              role="switch"
              aria-checked={bionicReadingEnabled}
              tabIndex={0}
            >
              <div className="toggle-slider" />
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="help-text">
          <p>
            <strong>Supporting SDG 4.5:</strong> These features ensure equitable access to content for users with attention difficulties, dyslexia, ADHD, and other learning differences.
            Customize settings to match your needs or use quick presets for common conditions.
          </p>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="help-text" style={{ marginTop: '8px' }}>
          <p>
            <strong>Keyboard Shortcuts:</strong><br />
            • Alt+S: Text to Speech<br />
            • Alt+P: Pause/Resume Speech<br />
            • Arrow Keys: Move reading guide<br />
            • Space: Start/Stop timer
          </p>
        </div>
      </div>
    </>
  );
}