import React, { useMemo } from 'react';

/**
 * BionicReader Component
 *
 * Implements Bionic Reading technique to help users with attention difficulties
 * read more efficiently. The technique highlights the beginning of each word,
 * allowing the brain to process text faster while maintaining comprehension.
 *
 * Features:
 * - Automatically bolds first 30-50% of each word
 * - Preserves punctuation and spacing
 * - Adjustable boldness ratio
 * - Works with any text content
 */

interface BionicReaderProps {
  text: string;
  boldRatio?: number; // 0.3 to 0.6 recommended
  className?: string;
}

export default function BionicReader({ text, boldRatio = 0.4, className = '' }: BionicReaderProps) {
  const bionicText = useMemo(() => {
    // Split text into words while preserving spaces and punctuation
    const words = text.match(/\S+|\s+/g) || [];

    return words.map((word, index) => {
      // Skip if it's just whitespace
      if (/^\s+$/.test(word)) {
        return <span key={index}>{word}</span>;
      }

      // Extract word and any trailing punctuation
      const match = word.match(/^(\w+)(.*)$/);
      if (!match) {
        return <span key={index}>{word}</span>;
      }

      const [, cleanWord, punctuation] = match;

      // Calculate how many characters to bold
      let boldLength = Math.ceil(cleanWord.length * boldRatio);

      // Adjust based on word length
      if (cleanWord.length <= 3) {
        boldLength = 1; // For short words, just bold first letter
      } else if (cleanWord.length <= 5) {
        boldLength = Math.min(2, boldLength); // For medium words, bold 1-2 letters
      }

      const boldPart = cleanWord.slice(0, boldLength);
      const restPart = cleanWord.slice(boldLength);

      return (
        <span key={index} className="bionic-word">
          <span className="bionic-bold">{boldPart}</span>
          <span className="bionic-rest">{restPart}</span>
          {punctuation}
        </span>
      );
    });
  }, [text, boldRatio]);

  return (
    <div className={`bionic-reader ${className}`}>
      <style>{`
        .bionic-reader {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.8;
          font-size: inherit;
        }
        
        .bionic-word {
          display: inline;
        }
        
        .bionic-bold {
          font-weight: 700;
          color: var(--text-1, #000);
        }
        
        .bionic-rest {
          font-weight: 400;
          opacity: 0.85;
        }
        
        /* Accessibility: Reduce contrast in high contrast mode */
        @media (prefers-contrast: high) {
          .bionic-rest {
            opacity: 1;
          }
        }
        
        /* Animation for smooth reading */
        .bionic-word {
          transition: background-color 0.2s ease;
        }
        
        .bionic-word:hover {
          background-color: var(--surface-2, rgba(0,0,0,0.05));
          border-radius: 2px;
          padding: 0 2px;
        }
      `}</style>
      <div>{bionicText}</div>
    </div>
  );
}

/**
 * BionicReaderToggle Component
 *
 * A toggle switch to enable/disable bionic reading for any text content
 * on the page. When enabled, it applies bionic reading styling globally.
 */
export function BionicReaderToggle({ enabled, onToggle }: { enabled: boolean; onToggle: (enabled: boolean) => void }) {
  return (
    <div className="bionic-toggle-container">
      <style>{`
        .bionic-toggle-container {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--surface-2);
          border-radius: 20px;
        }
        
        .bionic-toggle {
          position: relative;
          width: 44px;
          height: 24px;
          background: var(--surface-3);
          border-radius: 12px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .bionic-toggle.enabled {
          background: var(--brand-400);
        }
        
        .bionic-toggle-slider {
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
        
        .bionic-toggle.enabled .bionic-toggle-slider {
          transform: translateX(20px);
        }
        
        .bionic-label {
          font-size: 14px;
          color: var(--text-1);
          font-weight: 500;
        }
        
        /* Global bionic reading styles when enabled */
        body.bionic-enabled p,
        body.bionic-enabled li,
        body.bionic-enabled td,
        body.bionic-enabled .task,
        body.bionic-enabled .card {
          word-spacing: 0.15em;
        }
        
        body.bionic-enabled strong,
        body.bionic-enabled b {
          font-weight: 800;
        }
      `}</style>

      <span className="bionic-label">Bionic Reading</span>
      <div
        className={`bionic-toggle ${enabled ? 'enabled' : ''}`}
        onClick={() => onToggle(!enabled)}
        role="switch"
        aria-checked={enabled}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(!enabled);
          }
        }}
      >
        <div className="bionic-toggle-slider" />
      </div>
    </div>
  );
}

/**
 * BionicTextProcessor
 *
 * Utility function to process any text with bionic reading formatting.
 * Can be used to apply bionic reading to dynamic content.
 */
export function processBionicText(text: string, boldRatio = 0.4): string {
  const words = text.split(/\s+/);

  return words.map(word => {
    // Remove punctuation for processing
    const cleanWord = word.replace(/[^\w]/g, '');
    const punctuation = word.replace(/[\w]/g, '');

    if (cleanWord.length === 0) return word;

    let boldLength = Math.ceil(cleanWord.length * boldRatio);

    if (cleanWord.length <= 3) {
      boldLength = 1;
    } else if (cleanWord.length <= 5) {
      boldLength = Math.min(2, boldLength);
    }

    const boldPart = cleanWord.slice(0, boldLength);
    const restPart = cleanWord.slice(boldLength);

    // Return HTML string with bold tags
    return `<strong>${boldPart}</strong>${restPart}${punctuation}`;
  }).join(' ');
}