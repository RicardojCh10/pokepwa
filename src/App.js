import React, { useEffect, useState } from 'react';
import './index.css';

function App() {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=200')
      .then(response => response.json())
      .then(data => {
        setPokemon(data.results);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching Pokémon data:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="pokeball-icon">
            <div className="pokeball-button"></div>
          </div>
          <h1 className="title">Pokédex</h1>
        </div>
        <p className="subtitle">Descubre tu Pokémon favorito</p>
      </header>

      <main className="content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Cargando Pokémon...</p>
          </div>
        ) : (
          <div className="card-grid">
            {pokemon?.map((p, index) => (
              <div key={index} className="card">
                <div className="card-image-container">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`}
                    alt={p.name}
                    className="pokemon-img"
                  />
                </div>
                <div className="card-info">
                  <span className="pokemon-number">#{String(index + 1).padStart(3, '0')}</span>
                  <p className="pokemon-name">{p.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Datos proporcionados por PokéAPI</p>
      </footer>
    </div>
  );
}

export default App;