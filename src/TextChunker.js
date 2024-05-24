import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Import Axios for making HTTP requests
import { FaPlay, FaPause, FaArrowLeft, FaArrowRight, FaExpand, FaCompress } from 'react-icons/fa';

const TextChunker = () => {
  const [inputText, setInputText] = useState('');
  const [chunks, setChunks] = useState([]);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(200); // Default speed is 200 WPM
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textDisplayRef = useRef(null);

  const handleTextChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSave = async () => {
    try {
      const words = inputText.split(' ');
      const newChunks = [];
      for (let i = 0; i < words.length; i += 3) {
        newChunks.push(words.slice(i, i + 3).join(' '));
      }
      setChunks(newChunks);
      setCurrentChunk(0);
      setIsPlaying(false); // Initially stop when save

      // Send HTTP POST request to save the text to the database
      await axios.post('/api/textFiles/save', { content: inputText });
      alert('Text saved successfully!');
    } catch (error) {
      console.error('Error saving text:', error);
      alert('Error saving text. Please try again.');
    }
  };

  const handleStart = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    setIsPlaying(false); // Pause when manually navigating
    setCurrentChunk((prev) => (prev < chunks.length - 1 ? prev + 1 : prev));
  };

  const handlePrevious = () => {
    setIsPlaying(false); // Pause when manually navigating
    setCurrentChunk((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleSpeedChange = (e) => {
    setSpeed(parseInt(e.target.value, 10));
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      textDisplayRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  const handleTogglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };
  useEffect(() => {
    let interval = null;
    if (isPlaying && currentChunk < chunks.length) {
      interval = setInterval(() => {
        setCurrentChunk((prevChunk) => {
          if (prevChunk < chunks.length - 1) {
            return prevChunk + 1;
          } else {
            clearInterval(interval);
            setIsPlaying(false);
            return prevChunk;
          }
        });
      }, (60 / speed) * 1000 * 3); // Calculate interval based on the selected WPM speed
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentChunk, chunks.length, speed]);

  const darkModeStyles = {
    container: {
      padding: '20px',
      maxWidth: '600px',
      margin: 'auto',
      backgroundColor: '#000',
      color: '#fff',
      borderRadius: '8px',
    },
    textarea: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#111',
      color: '#fff',
      border: '1px solid #444',
      borderRadius: '4px',
      marginBottom: '10px',
    },
    button: {
      display: 'inline-block',
      margin: '10px 5px',
      padding: '10px 20px',
      backgroundColor: '#333',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    chunkDisplay: {
      whiteSpace: 'pre-wrap',
      textAlign: 'center',
      fontSize: '1.2em',
      padding: '10px',
      backgroundColor: '#000',
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    },
    select: {
      padding: '10px',
      backgroundColor: '#111',
      color: '#fff',
      border: '1px solid #444',
      borderRadius: '4px',
      marginBottom: '10px',
    },
    controls: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: '20px',
      width: '100%',
    }
  };
  

  return (
    <div style={darkModeStyles.container}>
      {/* Text input */}
      {!isFullscreen && (
        <>
          <textarea
            value={inputText}
            onChange={handleTextChange}
            rows="10"
            cols="50"
            placeholder="Paste your text here"
            style={darkModeStyles.textarea}
          />
          {/* Save button */}
          <div>
            <button onClick={handleSave} style={darkModeStyles.button}>Save</button>
            {/* Navigation buttons */}
            <button onClick={handlePrevious} style={darkModeStyles.button}><FaArrowLeft /></button>
            {isPlaying ? (
              <button onClick={handlePause} style={darkModeStyles.button}><FaPause /></button>
            ) : (
              <button onClick={handleStart} style={darkModeStyles.button}><FaPlay /></button>
            )}
            <button onClick={handleNext} style={darkModeStyles.button}><FaArrowRight /></button>
            {/* Fullscreen button */}
            <button onClick={toggleFullscreen} style={darkModeStyles.button}>
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          {/* Speed selector */}
          <div>
            <label htmlFor="speedControl" style={{ marginRight: '10px' }}>Speed (WPM):</label>
            <select id="speedControl" value={speed} onChange={handleSpeedChange} style={darkModeStyles.select}>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="500">500</option>
              <option value="600">600</option>
              <option value="700">700</option>
            </select>
          </div>
        </>
      )}
      {/* Text display */}
      <div ref={textDisplayRef} style={darkModeStyles.chunkDisplay}>
        <div>{chunks[currentChunk]}</div>
        {/* Controls in fullscreen mode */}
        {isFullscreen && (
          <div style={darkModeStyles.controls}>
            <button onClick={handlePrevious} style={darkModeStyles.button}><FaArrowLeft /></button>
            <div>
              {isPlaying ? (
                <button onClick={handlePause} style={darkModeStyles.button}><FaPause /></button>
              ) : (
                <button onClick={handleStart} style={darkModeStyles.button}><FaPlay /></button>
              )}
            </div>
            <button onClick={handleNext} style={darkModeStyles.button}><FaArrowRight /></button>
            <button onClick={toggleFullscreen} style={darkModeStyles.button}>
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
            <div>
              <select id="speedControl" value={speed} onChange={handleSpeedChange} style={darkModeStyles.select}>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextChunker;