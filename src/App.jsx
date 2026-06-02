import './App.css';
import WebcamCanvas from './components/webcam.jsx';

function App() {
  return (
    <div className="App">
      <div className="Container">
        <h1 className="header" style={{ textAlign: 'center', color: 'black' }}>
          Morse Code to Text Converter
        </h1>
        <WebcamCanvas />
      </div>
    </div>
  );
}

export default App;