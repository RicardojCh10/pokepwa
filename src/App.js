import React, { useEffect, useState } from 'react';
import './index.css';

function App() {
  const [allPokemon, setAllPokemon] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
      .then(response => response.json())
      .then(data => {
        setAllPokemon(data.results);
        setFilteredPokemon(data.results);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching Pokémon data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = allPokemon.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPokemon(filtered);
    setCurrentPage(1);
  }, [searchTerm, allPokemon]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPokemon = filteredPokemon.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPokemonId = (index) => {
    const pokemonIndex = allPokemon.findIndex(p => p.name === currentPokemon[index].name);
    return pokemonIndex + 1;
  };

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
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar Pokémon..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
      </header>

      <main className="content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Cargando Pokémon...</p>
          </div>
        ) : (
          <>
            {currentPokemon.length > 0 ? (
              <>
                <div className="results-info">
                  Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPokemon.length)} de {filteredPokemon.length} Pokémon
                </div>
                
                <div className="card-grid">
                  {currentPokemon.map((p, index) => {
                    const pokemonId = getPokemonId(index);
                    return (
                      <div key={pokemonId} className="card">
                        <div className="card-image-container">
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                            alt={p.name}
                            className="pokemon-img"
                          />
                        </div>
                        <div className="card-info">
                          <span className="pokemon-number">#{String(pokemonId).padStart(3, '0')}</span>
                          <p className="pokemon-name">{p.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      ← Anterior
                    </button>
                    
                    <div className="pagination-numbers">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => goToPage(pageNumber)}
                              className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return <span key={pageNumber} className="pagination-dots">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-results">
                <p>No se encontraron Pokémon con "{searchTerm}"</p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>Datos proporcionados por PokéAPI</p>
      </footer>
    </div>
  );
}

export default App;