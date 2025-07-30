
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [subject, setSubject] = useState('');
  const [numCards, setNumCards] = useState(5);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    // Use system preference or local storage value as initial state
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const generateFlashcards = async () => {
    if (!subject) {
      setError('Please enter a subject');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Call our Python backend instead of OpenAI directly
      const response = await fetch('http://localhost:5000/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          numCards
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(`API Error: ${data.error}`);
      } else {
        const cards = data.flashcards || [];

        if (cards.length > 0) {
          setFlashcards(cards);
          setCurrentCardIndex(0);
          setIsFlipped(false);
        } else {
          setError('No flashcards were generated. Try a different subject.');
        }
      }

    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prevIndex) => 
      prevIndex > 0 ? prevIndex - 1 : flashcards.length - 1
    );
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prevIndex) => 
      prevIndex < flashcards.length - 1 ? prevIndex + 1 : 0
    );
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : 'light'}`}>
      {/* Theme toggle button */}
      <button
        onClick={toggleDarkMode}
        className="theme-toggle"
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? (
          // Sun icon for dark mode
          <svg xmlns="http://www.w3.org/2000/svg" className="theme-toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          // Moon icon for light mode
          <svg xmlns="http://www.w3.org/2000/svg" className="theme-toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="container">
        <div className="card-container">
          {/* Header */}
          <div className="header">
            <h1 className="header-title">Flashcard Generator</h1>
          </div>
          
          {/* Form */}
          <div className="form-container">
            <div className="form-group">
              <div className="form-field">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g., Ancient Rome, Quantum Physics, JavaScript"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">Number of Cards</label>
                <div className="range-container">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    className="range-input"
                    value={numCards}
                    onChange={(e) => setNumCards(parseInt(e.target.value))}
                  />
                  <span className="range-value">{numCards}</span>
                </div>
              </div>
              
              <button
                className={`primary-button ${isLoading ? 'loading' : ''}`}
                onClick={generateFlashcards}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="spinner-container">
                    <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </div>
                ) : 'Generate Flashcards'}
              </button>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>

            {/* Flashcard Display */}
            {flashcards.length > 0 && (
              <div className="flashcard-section">
                <div className="card-counter">
                  Card {currentCardIndex + 1} of {flashcards.length}
                </div>
                
                <div 
                  className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                  onClick={toggleFlip}
                >
                  <div className="flashcard-content">
                    <p className="flashcard-text">
                      {isFlipped ? flashcards[currentCardIndex].answer : flashcards[currentCardIndex].question}
                    </p>
                  </div>
                  <div className="card-type">
                    {isFlipped ? 'Answer' : 'Question'} (click to flip)
                  </div>
                </div>
                
                <div className="nav-buttons">
                  <button
                    className="nav-button"
                    onClick={handlePrevCard}
                  >
                    ← Previous
                  </button>
                  
                  <button
                    className="nav-button"
                    onClick={handleNextCard}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="footer">
          <p className="footer-text">
            Powered by OpenAI • Built with React and Flask
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;