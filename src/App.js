import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Colores para los tipos de Pokémon ---
const typeColors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

// --- Traducción de tipos al español ---
const typeTranslations = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  electric: 'Eléctrico',
  grass: 'Planta',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
};

// --- HOOK PERSONALIZADO PARA LA LÓGICA DE DATOS ---
const usePokemon = () => {
  const [allPokemon, setAllPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=300');
        if (!response.ok) throw new Error('La red no respondió correctamente');
        const data = await response.json();

        const detailedPokemonPromises = data.results.map(p => fetch(p.url).then(res => res.json()));
        const allPokemonDetails = await Promise.all(detailedPokemonPromises);

        setAllPokemon(allPokemonDetails);
      } catch (err) {
        console.error('Error al obtener los datos de Pokémon:', err);
        setError('No se pudieron cargar los Pokémon. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  return { allPokemon, loading, error };
};


// --- COMPONENTES DE UI REUTILIZABLES ---

const Loader = () => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-red-200 rounded-full"></div>
      <div className="w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin absolute top-0"></div>
    </div>
    <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">Cargando Pokémon...</p>
  </div>
);

const SearchBar = ({ searchTerm, onSearchChange }) => (
  <div className="relative w-full max-w-2xl group">
    <input
      type="text"
      placeholder="Buscar Pokémon por nombre..."
      value={searchTerm}
      onChange={onSearchChange}
      className="w-full px-6 py-4 pr-14 text-lg text-gray-800 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-300 focus:border-red-500 transition-all duration-300 shadow-lg dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:ring-red-500/50"
    />
    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    </div>
  </div>
);

const TypeFilter = React.memo(({ selectedType, onTypeChange }) => (
  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 mb-8">
    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 text-center">Filtrar por tipo</h3>
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        onClick={() => onTypeChange(null)}
        className={`px-6 py-3 text-sm font-bold transition-all duration-300 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 ${!selectedType
          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white scale-105 shadow-lg'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
      >
        Todos
      </button>
      {Object.entries(typeColors).map(([type, color]) => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          style={{
            backgroundColor: selectedType === type ? color : 'transparent',
            borderColor: color,
            color: selectedType === type ? 'white' : color
          }}
          className={`px-5 py-3 text-sm font-bold transition-all duration-300 rounded-xl shadow-md border-2 hover:shadow-xl hover:-translate-y-1 ${selectedType === type ? 'scale-105 shadow-lg' : 'hover:bg-opacity-10'
            }`}
        >
          {typeTranslations[type]}
        </button>
      ))}
    </div>
  </div>
));


const PokemonCard = React.memo(({ pokemon }) => {
  const primaryType = pokemon.types[0].type.name;
  const bgColor = typeColors[primaryType] || typeColors.normal;

  return (
    <div className="group relative flex flex-col items-center p-6 transition-all duration-500 transform bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 dark:bg-gray-800 overflow-hidden">
      {/* Fondo decorativo */}
      <div
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500"
        style={{ backgroundColor: bgColor }}
      ></div>

      {/* Círculo decorativo superior */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20"
        style={{ backgroundColor: bgColor }}
      ></div>

      <div className="relative z-10 w-full">
        {/* Número */}
        <span className="inline-block px-3 py-1 text-xs font-bold text-gray-400 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-500">
          #{String(pokemon.id).padStart(3, '0')}
        </span>

        {/* Imagen */}
        <div
          className="w-36 h-36 mx-auto my-4 p-3 rounded-full transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
          style={{ backgroundColor: `${bgColor}20` }}
        >
          <img
            src={pokemon.sprites.other['official-artwork'].front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
            alt={pokemon.name}
            className="w-full h-full object-contain drop-shadow-2xl"
            loading="lazy"
          />
        </div>

        {/* Nombre */}
        <div className="text-center mb-3">
          <p className="text-2xl font-extrabold capitalize text-gray-800 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-pink-500 transition-all duration-300">
            {pokemon.name}
          </p>
        </div>

        {/* Tipos */}
        <div className="flex flex-wrap justify-center gap-2">
          {pokemon.types.map(({ type }) => (
            <span
              key={type.name}
              className="px-4 py-2 text-xs font-bold text-white rounded-full shadow-md transition-transform hover:scale-110"
              style={{ backgroundColor: typeColors[type.name] || typeColors.normal }}
            >
              {typeTranslations[type.name]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

const PokemonGrid = ({ pokemonList }) => {
  if (pokemonList.length === 0) {
    return (
      <div className="col-span-full text-center p-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-inner">
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">No se encontraron Pokémon con esos criterios</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Intenta con otros filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {pokemonList.map(p => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center mt-12 space-x-4">
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-6 py-3 font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
      >
        ← Anterior
      </button>
      <span className="px-8 py-3 font-bold text-gray-700 bg-white rounded-xl shadow-lg dark:bg-gray-800 dark:text-gray-200">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-6 py-3 font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
      >
        Siguiente →
      </button>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN ---

function App() {
  const { allPokemon, loading, error } = usePokemon();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filtrado combinado por nombre y tipo
  const filteredPokemon = useMemo(() => {
    return allPokemon.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = selectedType ? p.types.some(t => t.type.name === selectedType) : true;
      return nameMatch && typeMatch;
    });
  }, [searchTerm, selectedType, allPokemon]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType]);

  const currentPokemon = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredPokemon.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, filteredPokemon, itemsPerPage]);

  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);

  const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);
  const handlePageChange = useCallback((pageNumber) => setCurrentPage(pageNumber), []);
  const handleTypeChange = useCallback((type) => setSelectedType(type), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-sans">
      {/* Header Pokémon */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-gradient-to-r from-yellow-200 via-red-300 to-pink-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-xl border-b-4 border-red-500">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-center gap-5">

            {/* Pokébola SVG animada */}
            <div className="relative w-14 h-14 flex items-center justify-center group cursor-pointer transition-transform duration-300 hover:scale-110">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                className="w-14 h-14 drop-shadow-md"
              >
                <circle cx="50" cy="50" r="45" fill="#fff" stroke="#1f2937" strokeWidth="5" />
                <path d="M5 50h90" stroke="#1f2937" strokeWidth="5" />
                <path d="M5 50a45 45 0 0 1 90 0" fill="#ef4444" />
                <circle
                  cx="50"
                  cy="50"
                  r="12"
                  fill="#fff"
                  stroke="#1f2937"
                  strokeWidth="5"
                  className="group-hover:animate-ping"
                />
                <circle cx="50" cy="50" r="6" fill="#1f2937" />
              </svg>

              {/* Glow animado */}
              <div className="absolute inset-0 rounded-full bg-red-400 blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
            </div>

            {/* Título */}
            <div className="text-center select-none">
              <h1
                className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg"
                style={{ textShadow: '0 0 25px rgba(239,68,68,0.4)' }}
              >
                Pokédex
              </h1>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium mt-1">
                Generación I · Kanto Region
              </p>
            </div>
          </div>
        </div>

        {/* Cinta decorativa inferior (estilo Pokémon) */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500"></div>
      </header>


      <main className="container px-4 mx-auto py-8 md:px-8 md:py-12">
        {/* Sección de búsqueda */}
        <div className="flex flex-col items-center mb-12 space-y-6">
          <div className="text-center max-w-2xl">
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">
              Descubre el mundo Pokémon
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Explora los 300 Pokémon originales de la región de Kanto
            </p>
          </div>
          <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        </div>

        {loading && <Loader />}
        {error && (
          <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl">
            <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <TypeFilter selectedType={selectedType} onTypeChange={handleTypeChange} />

            {/* Contador de resultados */}
            <div className="mb-6 text-center">
              <div className="inline-block px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-md">
                <span className="text-gray-600 dark:text-gray-400">
                  Mostrando <span className="font-bold text-red-500">{currentPokemon.length}</span> de <span className="font-bold">{filteredPokemon.length}</span> Pokémon
                </span>
              </div>
            </div>

            <PokemonGrid pokemonList={currentPokemon} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      {/* Footer Pokémon Premium */}
      <footer className="relative mt-20 bg-gradient-to-r from-yellow-200 via-red-300 to-pink-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t-4 border-red-500 text-center overflow-hidden">
        {/* Glow decorativo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3),transparent_70%)] pointer-events-none"></div>

        <div className="container mx-auto px-4 py-10 relative z-10">
          {/* Pokébola decorativa */}
          <div className="flex justify-center mb-4">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                className="w-10 h-10"
              >
                <circle cx="50" cy="50" r="45" fill="#fff" stroke="#1f2937" strokeWidth="5" />
                <path d="M5 50h90" stroke="#1f2937" strokeWidth="5" />
                <path d="M5 50a45 45 0 0 1 90 0" fill="#ef4444" />
                <circle cx="50" cy="50" r="12" fill="#fff" stroke="#1f2937" strokeWidth="5" />
                <circle cx="50" cy="50" r="6" fill="#1f2937" />
              </svg>
            </div>
          </div>

          {/* Texto principal */}
          <p className="text-gray-800 dark:text-gray-300 font-semibold text-lg">
            &copy; {new Date().getFullYear()} <span className="text-red-600 font-bold">Pokédex</span>
          </p>

          {/* Créditos */}
          <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">
            Creado por{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-200">Ricardo Chi</span> y{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-200">Diego Alemán</span>
          </p>

          <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
            Datos obtenidos de{' '}
            <a
              href="https://pokeapi.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 font-semibold hover:underline transition-colors"
            >
              PokéAPI
            </a>
          </p>

          {/* Línea decorativa inferior */}
          <div className="mt-6 h-1 w-40 mx-auto rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 animate-pulse"></div>
        </div>
      </footer>

    </div>
  );
}

export default App;