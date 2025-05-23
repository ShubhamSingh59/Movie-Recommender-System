import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [input, setInput] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await axios.get("https://movie-recommender-system-1-bko4.onrender.com/movies");
        setMovies(response.data);
        setFilteredMovies(response.data);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      }
    }
    fetchMovies();
  }, []);

  useEffect(() => {
    if (input.trim() === "") {
      setFilteredMovies(movies);
    } else {
      setFilteredMovies(
        movies.filter(movie =>
          movie.toLowerCase().includes(input.toLowerCase())
        )
      );
    }
  }, [input, movies]);

  async function handleRecommend() {
    if (!input.trim()) {
      setError("Please enter or select a movie");
      return;
    }

    try {
      const response = await axios.get(
        `https://movie-recommender-system-1-bko4.onrender.com/recommend/${encodeURIComponent(input)}`
      );
      if (response.data.error) {
        setError(response.data.error);
        setRecommendations([]);
      } else {
        setError("");
        setRecommendations(response.data.recommended);
      }
    } catch (err) {
      setError("Error fetching recommendations");
      setRecommendations([]);
    }
  }

  const handleMovieSelect = (movie) => {
    setInput(movie);
    setShowDropdown(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Movie Recommender</h1>
      </header>

      <div className="search-container">
        <div className="combobox-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search or type a movie name"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && filteredMovies.length > 0 && (
            <ul className="dropdown-list">
              {filteredMovies.map((movie, i) => (
                <li
                  key={i}
                  className="dropdown-item"
                  onClick={() => handleMovieSelect(movie)}
                >
                  {movie}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="search-button" onClick={handleRecommend}>
          Recommend
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {recommendations.length > 0 && (
        <div className="recommendations-container">
          <h2 className="recommendations-title">Recommendations:</h2>
          <ul className="recommendations-list">
            {recommendations.map((rec, i) => (
              <li key={i} className="recommendation-item">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;