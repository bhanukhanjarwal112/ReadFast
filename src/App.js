import React from 'react';
import './App.css'; // Import the global CSS file
import TextChunker from './TextChunker';

function App() {
  const appStyles = {
    padding: '20px',
    maxWidth: '800px',
    margin: 'auto',
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
  };

  return (
    <div style={appStyles}>
      <h1 style={{ textAlign: 'center', color: '#e0e0e0' }}>Read Chunker</h1>
      <TextChunker />
      <p>developed by bhanu</p>
    </div>
  
  );
}

export default App;
