import { useState, useRef, useEffect } from "react";

export default function VoiceSearch({ onTranscript, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore cleanup error
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (disabled) return;
    setErrorMsg(null);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg("Voice search is not supported in this browser.");
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        onTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setErrorMsg(
            event.error === "not-allowed"
              ? "Microphone permission denied."
              : `Voice search error: ${event.error}`
          );
          setTimeout(() => setErrorMsg(null), 3500);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
      setErrorMsg("Could not access microphone.");
      setTimeout(() => setErrorMsg(null), 3500);
    }
  };

  return (
    <div className="voice-search-wrapper" style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        type="button"
        className={`voice-search-btn ${isListening ? "listening" : ""}`}
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? "Listening... Click to stop" : "Search using your voice"}
        aria-label="Voice Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="mic-icon"
          width="20"
          height="20"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
        {isListening && <span className="listening-pulse"></span>}
      </button>

      {isListening && (
        <span className="listening-badge">
          Listening...
        </span>
      )}

      {errorMsg && (
        <div className="voice-error-tooltip">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
