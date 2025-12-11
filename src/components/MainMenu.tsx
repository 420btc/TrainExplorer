import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Train, MapPin, Globe } from 'lucide-react';
import SimpleTrainAnimation from './SimpleTrainAnimation';
import HomeSearchBar from './HomeSearchBar';
import { Coordinates, MapSize, setMapSize } from '@/lib/mapUtils';
import mapgoportadaImg from '@/assets/mapgoportada.png';

interface MainMenuProps {
  onStartGame: (coordinates?: Coordinates) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedMapSize, setSelectedMapSize] = useState<MapSize>(MapSize.LARGE);
  const [showCityMenu, setShowCityMenu] = useState(false);

  // Lista de ciudades famosas con sus coordenadas
  const famousCities = [
    { name: 'Madrid', country: 'España', coordinates: { lat: 40.4168, lng: -3.7038 }, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Barcelona', country: 'España', coordinates: { lat: 41.3851, lng: 2.1734 }, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Valencia', country: 'España', coordinates: { lat: 39.4699, lng: -0.3763 }, image: 'https://images.unsplash.com/photo-1599418839342-2b3efd3b8a0d?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Sevilla', country: 'España', coordinates: { lat: 37.3891, lng: -5.9845 }, image: 'https://images.unsplash.com/photo-1559636423-e43a13580400?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Málaga', country: 'España', coordinates: { lat: 36.7213, lng: -4.4213 }, image: 'https://images.unsplash.com/photo-1591704121554-c46e177acf3c?auto=format&fit=crop&q=80&w=1000' },
    { name: 'París', country: 'Francia', coordinates: { lat: 48.8566, lng: 2.3522 }, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Londres', country: 'Reino Unido', coordinates: { lat: 51.5074, lng: -0.1278 }, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Roma', country: 'Italia', coordinates: { lat: 41.9028, lng: 12.4964 }, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Berlín', country: 'Alemania', coordinates: { lat: 52.5200, lng: 13.4050 }, image: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Ámsterdam', country: 'Países Bajos', coordinates: { lat: 52.3676, lng: 4.9041 }, image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Nueva York', country: 'Estados Unidos', coordinates: { lat: 40.7128, lng: -74.0060 }, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Tokio', country: 'Japón', coordinates: { lat: 35.6762, lng: 139.6503 }, image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1000' },
  ];

  const handleCitySelect = (coordinates: Coordinates) => {
    setMapSize(selectedMapSize);
    onStartGame(coordinates);
  };

  // Efecto para actualizar el reloj cada segundo
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    
    updateClock(); // Actualizar inmediatamente
    const intervalId = setInterval(updateClock, 1000);
    
    return () => clearInterval(intervalId); // Limpieza
  }, []);
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Fondo con imagen mapgoportada.png */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${mapgoportadaImg})`,
        }}
      />
      
      {/* Overlay oscuro para mejorar la legibilidad del texto */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Elementos decorativos: montañas (mantenidos para compatibilidad) */}
      <div className="absolute top-[30%] left-0 right-0 overflow-hidden opacity-20">
        <div className="w-[300px] h-[150px] bg-[#5D9E31] rounded-[50%] absolute -left-[50px] -top-[75px]"></div>
        <div className="w-[400px] h-[200px] bg-[#4A8C2A] rounded-[50%] absolute left-[200px] -top-[100px]"></div>
        <div className="w-[350px] h-[175px] bg-[#5D9E31] rounded-[50%] absolute right-[100px] -top-[85px]"></div>
      </div>
      
      {/* Atribución superior */}
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        <a 
          href="https://www.carlosfr.es" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#FF5722]/80 hover:bg-[#FF5722]/90 text-white px-4 py-1 rounded-full shadow-lg drop-shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105"
        >
          <p className="text-sm font-medium drop-shadow-sm">Made By: www.carlosfr.es</p>
        </a>
      </div>
      
      {/* Reloj en tiempo real */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold py-2 px-6 rounded-full shadow-xl drop-shadow-lg 
        transition-colors duration-300 flex items-center justify-center text-lg">
          {currentTime || '--:--:--'}
        </div>
      </div>
      
      {/* Vías de tren en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-[#333333] flex items-center justify-center shadow-2xl">
        {/* Base de las vías */}
        <div className="w-full h-[20px] bg-[#222222] flex items-center shadow-inner">
          {/* Traviesas */}
          <div className="w-full h-[6px] flex">
            {Array(60).fill(0).map((_, i) => (
              <div key={i} className="h-full w-[20px] mx-[10px] bg-[#444444] shadow-sm"></div>
            ))}
          </div>
        </div>
        
        {/* Rieles */}
        <div className="absolute bottom-[20px] left-0 right-0 h-[4px] flex justify-center">
          <div className="w-[95%] flex justify-between">
            <div className="h-full w-[10px] bg-[#111111] shadow-md"></div>
            <div className="h-full w-[10px] bg-[#111111] shadow-md"></div>
          </div>
        </div>
      </div>
      
      {/* Tren animado */}
      <SimpleTrainAnimation />
      
      {/* Contenido superpuesto */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-20">
        {/* Submenú de ciudades en el lado derecho */}
        <div className="absolute top-20 right-4 z-50">
          <Button
            onClick={() => setShowCityMenu(!showCityMenu)}
            className="bg-[#FF5722] hover:bg-[#E64A19] text-white p-3 rounded-full shadow-xl drop-shadow-lg transition-all duration-300 hover:scale-105 mb-4"
            title="Explorar Ciudades"
          >
            <Globe className="h-6 w-6" />
          </Button>
          
          {showCityMenu && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-4 w-80 max-h-96 overflow-y-auto animate-fadeIn border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-[#FF5722]" />
                  Explorar Ciudades
                </h3>
                <Button
                  onClick={() => setShowCityMenu(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 h-auto bg-transparent hover:bg-gray-100 rounded-full"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {famousCities.map((city) => (
                  <div
                    key={`${city.name}-${city.country}`}
                    className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-20 border border-gray-200/50"
                    onClick={() => {
                      handleCitySelect(city.coordinates);
                      setShowCityMenu(false);
                    }}
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${city.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                    <div className="absolute inset-0 flex items-center p-3 text-white">
                      <div>
                        <h4 className="text-sm font-bold drop-shadow-sm">{city.name}</h4>
                        <p className="text-xs opacity-90 drop-shadow-sm">{city.country}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-[#FF5722]/0 group-hover:bg-[#FF5722]/10 transition-colors duration-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto leading-tight drop-shadow-lg bg-black/20 px-6 py-3 rounded-lg shadow-xl">
            Tu ciudad convertida en un juego de trenes!
          </p>
          
          {/* Selector de tamaño de mapa */}
          <div className="mb-8 drop-shadow-lg">
            <h3 className="text-white text-lg mb-4 font-semibold drop-shadow-md">Tamaño del Mapa</h3>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => setSelectedMapSize(MapSize.SMALL)}
                className={`px-4 py-3 rounded-lg font-medium transition-all shadow-lg ${
                  selectedMapSize === MapSize.SMALL
                    ? 'bg-white text-[#FF5722] border-2 border-white drop-shadow-lg'
                    : 'bg-black/30 text-white border-2 border-white/50 hover:bg-white/20 drop-shadow-md'
                }`}
              >
                Pequeño
              </Button>
              <Button
                onClick={() => setSelectedMapSize(MapSize.MEDIUM)}
                className={`px-4 py-3 rounded-lg font-medium transition-all shadow-lg ${
                  selectedMapSize === MapSize.MEDIUM
                    ? 'bg-white text-[#FF5722] border-2 border-white drop-shadow-lg'
                    : 'bg-black/30 text-white border-2 border-white/50 hover:bg-white/20 drop-shadow-md'
                }`}
              >
                Mediano
              </Button>
              <Button
                onClick={() => setSelectedMapSize(MapSize.LARGE)}
                className={`px-4 py-3 rounded-lg font-medium transition-all shadow-lg ${
                  selectedMapSize === MapSize.LARGE
                    ? 'bg-white text-[#FF5722] border-2 border-white drop-shadow-lg'
                    : 'bg-black/30 text-white border-2 border-white/50 hover:bg-white/20 drop-shadow-md'
                }`}
              >
                Grande
              </Button>
              <Button
                onClick={() => setSelectedMapSize(MapSize.EXTREME)}
                className={`px-4 py-3 rounded-lg font-medium transition-all shadow-lg ${
                  selectedMapSize === MapSize.EXTREME
                    ? 'bg-white text-[#FF5722] border-2 border-white drop-shadow-lg'
                    : 'bg-black/30 text-white border-2 border-white/50 hover:bg-white/20 drop-shadow-md'
                }`}
              >
                Extremo
              </Button>
              <Button
                onClick={() => setSelectedMapSize(MapSize.CRAZY)}
                className={`px-4 py-3 rounded-lg font-medium transition-all shadow-lg ${
                  selectedMapSize === MapSize.CRAZY
                    ? 'bg-white text-[#FF5722] border-2 border-white drop-shadow-lg'
                    : 'bg-black/30 text-white border-2 border-white/50 hover:bg-white/20 drop-shadow-md'
                }`}
              >
                Loco
              </Button>
            </div>
          </div>

          
          <Button 
            onClick={() => {
              setMapSize(selectedMapSize);
              setShowSearchBar(true);
            }}
            className="bg-[#FF5722] hover:bg-[#E64A19] text-white text-2xl py-8 px-16 rounded-full shadow-2xl drop-shadow-xl transform transition hover:scale-105 z-10 border-4 border-white"
            size="lg"
          >
            <Train className="h-8 w-8 mr-3 drop-shadow-md" />
            JUGAR
          </Button>
          
          {/* Banner de búsqueda */}
          {showSearchBar && (
            <div className="mt-8 w-full max-w-3xl animate-fadeIn drop-shadow-xl">
              <HomeSearchBar 
                onLocationSelect={(coordinates) => {
                  onStartGame(coordinates);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
