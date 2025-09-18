import React, { useState, useRef, useCallback, useEffect } from 'react';
import BionicReader from './BionicReader';

/**
 * DocumentReader Component (Enhanced)
 *
 * Enhanced reading component with:
 * - Document deletion support
 * - Voice selection for text-to-speech
 * - Multiple file upload support
 * - Reading progress tracking
 */

interface ExtractedDocument {
  title: string;
  content: string;
  type: 'pdf' | 'text' | 'clipboard';
  timestamp: number;
}

export default function DocumentReader() {
  const [documents, setDocuments] = useState<ExtractedDocument[]>([]);
  const [activeDocument, setActiveDocument] = useState<ExtractedDocument | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [bionicEnabled, setBionicEnabled] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Voice settings
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Set default voice
      if (availableVoices.length > 0 && !selectedVoice) {
        // Try to find a voice in user's language
        const userLang = navigator.language;
        const matchingVoice = availableVoices.find(v => v.lang.startsWith(userLang.substring(0, 2)));
        setSelectedVoice(matchingVoice?.name || availableVoices[0].name);
      }
    };

    loadVoices();

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedVoice]);

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Extract text from PDF
  const extractPDFText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          const decoder = new TextDecoder('utf-8');
          let text = decoder.decode(typedArray);

          // Extract text between stream markers (simplified)
          const textMatches = text.match(/stream\s*([\s\S]*?)\s*endstream/g) || [];
          let extractedText = '';

          textMatches.forEach(match => {
            const cleaned = match
              .replace(/stream|endstream/g, '')
              .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();

            if (cleaned.length > 20) {
              extractedText += cleaned + '\n\n';
            }
          });

          // If no text found in streams, try to find text patterns
          if (!extractedText) {
            const textPatterns = text.match(/\((.*?)\)/g) || [];
            textPatterns.forEach(pattern => {
              const cleaned = pattern.slice(1, -1).trim();
              if (cleaned.length > 10 && /[a-zA-Z]/.test(cleaned)) {
                extractedText += cleaned + ' ';
              }
            });
          }

          resolve(extractedText || 'Unable to extract text from this PDF. Please try a different file or use a PDF with selectable text.');
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle file upload
  const handleFile = async (file: File) => {
    setIsExtracting(true);

    try {
      let content = '';
      let type: 'pdf' | 'text' = 'text';

      if (file.type === 'application/pdf') {
        type = 'pdf';
        content = await extractPDFText(file);
      } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        content = await file.text();
      } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        content = 'Word document support coming soon. Please convert to PDF or TXT format.';
      } else {
        content = 'Unsupported file type. Please upload PDF or TXT files.';
      }

      const newDoc: ExtractedDocument = {
        title: file.name,
        content,
        type,
        timestamp: Date.now()
      };

      setDocuments(prev => [newDoc, ...prev]);
      setActiveDocument(newDoc);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try another file.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const newDoc: ExtractedDocument = {
          title: `Pasted Text ${new Date().toLocaleTimeString()}`,
          content: text,
          type: 'clipboard',
          timestamp: Date.now()
        };
        setDocuments(prev => [newDoc, ...prev]);
        setActiveDocument(newDoc);
      }
    } catch (error) {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        document.execCommand('paste');
      }
    }
  };

  // Handle manual text input
  const handleTextInput = () => {
    if (textAreaRef.current && textAreaRef.current.value) {
      const newDoc: ExtractedDocument = {
        title: `Manual Input ${new Date().toLocaleTimeString()}`,
        content: textAreaRef.current.value,
        type: 'clipboard',
        timestamp: Date.now()
      };
      setDocuments(prev => [newDoc, ...prev]);
      setActiveDocument(newDoc);
      textAreaRef.current.value = '';
    }
  };

  // Delete document
  const deleteDocument = (timestamp: number) => {
    setDocuments(prev => prev.filter(doc => doc.timestamp !== timestamp));
    if (activeDocument?.timestamp === timestamp) {
      setActiveDocument(null);
      stopSpeaking();
    }
  };

  // Start Text-to-Speech with voice selection
  const speakDocument = () => {
    if (!activeDocument) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(activeDocument.content);
    utteranceRef.current = utterance;

    // Set voice
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }

    // Set speech parameters
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = 1.0;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onboundary = (event) => {
      if (activeDocument) {
        const progress = (event.charIndex / activeDocument.content.length) * 100;
        setReadingProgress(progress);
      }
    };

    utterance.onend = () => {
      setReadingProgress(100);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Pause/Resume speaking
  const pauseResume = () => {
    if (!isSpeaking) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setReadingProgress(0);
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Calculate reading time
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  return (
    <>
      <style>{`
        .document-reader {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .upload-zone {
          position: relative;
          border: 3px dashed var(--surface-3);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          background: var(--surface-1);
          transition: all 0.3s;
          cursor: pointer;
        }
        
        .upload-zone.active {
          border-color: var(--brand-400);
          background: var(--surface-2);
          transform: scale(1.02);
        }
        
        .upload-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .upload-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-1);
          margin-bottom: 8px;
        }
        
        .upload-subtitle {
          font-size: 14px;
          color: var(--text-2);
          margin-bottom: 20px;
        }
        
        .upload-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .upload-btn {
          padding: 10px 20px;
          background: var(--brand-400);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .upload-btn:hover {
          background: var(--brand-500);
          transform: translateY(-2px);
        }
        
        .upload-btn.secondary {
          background: var(--surface-2);
          color: var(--text-1);
        }
        
        .text-input-zone {
          margin-top: 20px;
          padding: 20px;
          background: var(--surface-1);
          border: 1px solid var(--surface-2);
          border-radius: 12px;
        }
        
        .text-input {
          width: 100%;
          min-height: 150px;
          padding: 12px;
          background: var(--surface-2);
          border: 1px solid var(--surface-3);
          border-radius: 8px;
          color: var(--text-1);
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
        }
        
        .documents-list {
          margin-top: 20px;
          display: grid;
          gap: 12px;
        }
        
        .document-item {
          display: flex;
          align-items: center;
          padding: 12px;
          background: var(--surface-1);
          border: 1px solid var(--surface-2);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .document-item:hover {
          background: var(--surface-2);
          transform: translateX(4px);
        }
        
        .document-item.active {
          background: var(--brand-400);
          color: white;
          border-color: var(--brand-400);
        }
        
        .document-icon {
          font-size: 24px;
          margin-right: 12px;
        }
        
        .document-info {
          flex: 1;
        }
        
        .document-title {
          font-weight: 500;
          margin-bottom: 2px;
        }
        
        .document-meta {
          font-size: 12px;
          opacity: 0.7;
        }
        
        .document-delete {
          background: transparent;
          border: none;
          color: var(--bad-500);
          font-size: 20px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .document-delete:hover {
          background: var(--bad-500);
          color: white;
        }
        
        .reader-zone {
          margin-top: 20px;
          padding: 20px;
          background: var(--surface-1);
          border: 1px solid var(--surface-2);
          border-radius: 12px;
        }
        
        .reader-controls {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
        }
        
        .reader-btn {
          padding: 8px 16px;
          background: var(--surface-2);
          border: 1px solid var(--surface-3);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          color: var(--text-1);
        }
        
        .reader-btn:hover {
          background: var(--surface-3);
        }
        
        .reader-btn.active {
          background: var(--brand-400);
          color: white;
          border-color: var(--brand-400);
        }
        
        .reading-progress {
          flex: 1;
          height: 4px;
          background: var(--surface-2);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .reading-progress-bar {
          height: 100%;
          background: var(--brand-400);
          transition: width 0.3s;
        }
        
        .voice-settings {
          background: var(--surface-2);
          border: 1px solid var(--surface-3);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
        }
        
        .voice-control {
          margin-bottom: 12px;
        }
        
        .voice-label {
          display: block;
          font-size: 12px;
          color: var(--text-2);
          margin-bottom: 4px;
        }
        
        .voice-select {
          width: 100%;
          padding: 6px;
          background: var(--surface-1);
          border: 1px solid var(--surface-3);
          border-radius: 6px;
          color: var(--text-1);
          font-size: 14px;
        }
        
        .reader-content {
          max-height: 600px;
          overflow-y: auto;
          padding: 20px;
          background: var(--surface-2);
          border-radius: 8px;
          line-height: 1.8;
          font-size: 16px;
        }
        
        .reader-content.bionic {
          font-size: 18px;
          line-height: 2;
        }
        
        .stats {
          display: flex;
          gap: 20px;
          margin-top: 12px;
          padding: 12px;
          background: var(--surface-2);
          border-radius: 8px;
          font-size: 13px;
          color: var(--text-2);
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        @media (max-width: 640px) {
          .upload-buttons {
            flex-direction: column;
          }
          
          .reader-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .reading-progress {
            width: 100%;
            order: -1;
          }
        }
      `}</style>

      <div className="document-reader">
        {/* Upload Zone */}
        <div
          className={`upload-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">📄</div>
          <div className="upload-title">Drop your files here</div>
          <div className="upload-subtitle">
            Supports PDF, TXT files or paste text directly
          </div>

          <div className="upload-buttons">
            <button className="upload-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <span>📁</span> Choose File
            </button>
            <button className="upload-btn secondary" onClick={(e) => { e.stopPropagation(); handlePaste(); }}>
              <span>📋</span> Paste from Clipboard
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>

        {/* Manual Text Input */}
        <div className="text-input-zone">
          <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
            Or type/paste your text here:
          </div>
          <textarea
            ref={textAreaRef}
            className="text-input"
            placeholder="Paste or type your text here..."
            onPaste={(e) => {
              setTimeout(() => {
                if (textAreaRef.current?.value) {
                  handleTextInput();
                }
              }, 100);
            }}
          />
          <button
            className="upload-btn"
            style={{ marginTop: '12px' }}
            onClick={handleTextInput}
          >
            Add Text
          </button>
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="documents-list">
            <h3 style={{ marginBottom: '12px' }}>Your Documents</h3>
            {documents.map((doc) => (
              <div
                key={doc.timestamp}
                className={`document-item ${activeDocument?.timestamp === doc.timestamp ? 'active' : ''}`}
                onClick={() => setActiveDocument(doc)}
              >
                <div className="document-icon">
                  {doc.type === 'pdf' ? '📕' : doc.type === 'clipboard' ? '📋' : '📝'}
                </div>
                <div className="document-info">
                  <div className="document-title">{doc.title}</div>
                  <div className="document-meta">
                    {doc.content.split(/\s+/).length} words •
                    {calculateReadingTime(doc.content)} min read •
                    {new Date(doc.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <button
                  className="document-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${doc.title}"?`)) {
                      deleteDocument(doc.timestamp);
                    }
                  }}
                  title="Delete document"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Reader Zone */}
        {activeDocument && (
          <div className="reader-zone">
            <div className="reader-controls">
              {!isSpeaking ? (
                <button
                  className="reader-btn"
                  onClick={speakDocument}
                >
                  <span>🔊</span> Read Aloud
                </button>
              ) : (
                <>
                  <button
                    className="reader-btn"
                    onClick={pauseResume}
                  >
                    <span>{isPaused ? '▶️' : '⏸️'}</span>
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    className="reader-btn"
                    onClick={stopSpeaking}
                  >
                    <span>⏹️</span> Stop
                  </button>
                </>
              )}

              <button
                className={`reader-btn ${showVoiceSettings ? 'active' : ''}`}
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              >
                <span>🎙️</span> Voice Settings
              </button>

              <button
                className={`reader-btn ${bionicEnabled ? 'active' : ''}`}
                onClick={() => setBionicEnabled(!bionicEnabled)}
              >
                <span>👁️</span> Bionic Reading
              </button>

              <div className="reading-progress">
                <div
                  className="reading-progress-bar"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
            </div>

            {/* Voice Settings Panel */}
            {showVoiceSettings && (
              <div className="voice-settings">
                <div className="voice-control">
                  <label className="voice-label">Voice</label>
                  <select
                    className="voice-select"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="voice-control">
                  <label className="voice-label">Speed: {speechRate.toFixed(1)}x</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="voice-control">
                  <label className="voice-label">Pitch: {speechPitch.toFixed(1)}</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}

            <div className={`reader-content ${bionicEnabled ? 'bionic' : ''}`}>
              {bionicEnabled ? (
                <BionicReader text={activeDocument.content} />
              ) : (
                activeDocument.content
              )}
            </div>

            <div className="stats">
              <div className="stat">
                <span>📊</span>
                {activeDocument.content.split(/\s+/).length} words
              </div>
              <div className="stat">
                <span>⏱️</span>
                {calculateReadingTime(activeDocument.content)} min read
              </div>
              <div className="stat">
                <span>📏</span>
                {activeDocument.content.length} characters
              </div>
              <div className="stat">
                <span>📄</span>
                {Math.ceil(activeDocument.content.length / 3000)} pages
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isExtracting && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--surface-1)',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            zIndex: 10000
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div>Extracting text from document...</div>
          </div>
        )}
      </div>
    </>
  );
}