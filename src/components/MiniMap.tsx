import React, { useEffect, useRef, useMemo } from 'react';
import { TrackSegment, Coordinates, Station } from '@/lib/mapUtils';

interface MiniMapProps {
  tracks: TrackSegment[];
  trainPosition: Coordinates;
  stations: Station[];
  isOpen: boolean;
  onClose: () => void;
}

const MiniMap: React.FC<MiniMapProps> = ({ 
  tracks, 
  trainPosition, 
  stations, 
  isOpen, 
  onClose 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Función para normalizar coordenadas al tamaño del canvas
  const normalizeCoordinates = (
    coords: Coordinates[], 
    canvasWidth: number, 
    canvasHeight: number
  ): { normalizedCoords: Coordinates[], minLat: number, maxLat: number, minLng: number, maxLng: number } => {
    if (coords.length === 0) return { 
      normalizedCoords: [], 
      minLat: 0, 
      maxLat: 0, 
      minLng: 0, 
      maxLng: 0 
    };
    
    // Encontrar los límites
    let minLat = coords[0].lat;
    let maxLat = coords[0].lat;
    let minLng = coords[0].lng;
    let maxLng = coords[0].lng;
    
    coords.forEach(coord => {
      minLat = Math.min(minLat, coord.lat);
      maxLat = Math.max(maxLat, coord.lat);
      minLng = Math.min(minLng, coord.lng);
      maxLng = Math.max(maxLng, coord.lng);
    });
    
    // Añadir un pequeño margen
    const latMargin = (maxLat - minLat) * 0.1;
    const lngMargin = (maxLng - minLng) * 0.1;
    
    minLat -= latMargin;
    maxLat += latMargin;
    minLng -= lngMargin;
    maxLng += lngMargin;
    
    // Normalizar coordenadas
    const normalizedCoords = coords.map(coord => {
      const x = ((coord.lng - minLng) / (maxLng - minLng)) * canvasWidth;
      const y = ((maxLat - coord.lat) / (maxLat - minLat)) * canvasHeight;
      return { lat: y, lng: x };
    });
    
    return { normalizedCoords, minLat, maxLat, minLng, maxLng };
  };
  
  // Memoizar las coordenadas para evitar recálculos innecesarios
  const allCoordinates = useMemo(() => {
    const coords: Coordinates[] = [];
    const MAX_POINTS_PER_TRACK = 100; // Limitar puntos por vía para evitar stack overflow
    const MAX_TOTAL_POINTS = 1000; // Límite total de puntos
    
    // Verificar que tracks existe y tiene elementos válidos
    if (tracks && Array.isArray(tracks)) {
      for (const track of tracks) {
        if (track && track.path && Array.isArray(track.path)) {
          // Para vías muy largas, tomar solo una muestra de puntos
          const trackPath = track.path.length > MAX_POINTS_PER_TRACK 
            ? track.path.filter((_, index) => index % Math.ceil(track.path.length / MAX_POINTS_PER_TRACK) === 0)
            : track.path;
          
          coords.push(...trackPath);
          
          // Salir si alcanzamos el límite total
          if (coords.length >= MAX_TOTAL_POINTS) {
            break;
          }
        }
      }
    }
    
    // Verificar que stations existe y tiene elementos válidos
    if (stations && Array.isArray(stations)) {
      for (const station of stations) {
        if (station && station.position) {
          coords.push(station.position);
          
          // Salir si alcanzamos el límite total
          if (coords.length >= MAX_TOTAL_POINTS) {
            break;
          }
        }
      }
    }
    
    // Agregar posición del tren si existe
    if (trainPosition) {
      coords.push(trainPosition);
    }
    
    // Limitar el total de coordenadas para evitar problemas de rendimiento
    return coords.slice(0, MAX_TOTAL_POINTS);
  }, [tracks, stations, trainPosition]);

  // Renderizar el mapa en el canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current || allCoordinates.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Limpiar el canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Normalizar coordenadas
    const { normalizedCoords, minLat, maxLat, minLng, maxLng } = 
      normalizeCoordinates(allCoordinates, canvasWidth, canvasHeight);
    
    // Dibujar las vías
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    if (tracks && Array.isArray(tracks)) {
      const MAX_TRACKS_TO_RENDER = 50; // Limitar número de vías a renderizar
      const tracksToRender = tracks.slice(0, MAX_TRACKS_TO_RENDER);
      
      for (const track of tracksToRender) {
        if (!track || !track.path || !Array.isArray(track.path) || track.path.length < 2) continue;
        
        ctx.beginPath();
        
        // Normalizar las coordenadas de la vía con muestreo para vías muy largas
        const MAX_POINTS_TO_RENDER = 50;
        const pathToRender = track.path.length > MAX_POINTS_TO_RENDER
          ? track.path.filter((_, index) => index % Math.ceil(track.path.length / MAX_POINTS_TO_RENDER) === 0)
          : track.path;
        
        const trackCoords = pathToRender.map(coord => {
          const x = ((coord.lng - minLng) / (maxLng - minLng)) * canvasWidth;
          const y = ((maxLat - coord.lat) / (maxLat - minLat)) * canvasHeight;
          return { x, y };
        });
        
        // Dibujar la línea
        if (trackCoords.length > 0) {
          ctx.moveTo(trackCoords[0].x, trackCoords[0].y);
          for (let i = 1; i < trackCoords.length; i++) {
            ctx.lineTo(trackCoords[i].x, trackCoords[i].y);
          }
          ctx.stroke();
        }
      }
    }
    
    // Dibujar las estaciones
    ctx.fillStyle = '#4A8C2A';
    if (stations && Array.isArray(stations)) {
      const MAX_STATIONS_TO_RENDER = 100; // Limitar número de estaciones a renderizar
      const stationsToRender = stations.slice(0, MAX_STATIONS_TO_RENDER);
      
      for (const station of stationsToRender) {
        if (!station || !station.position) continue;
        
        const x = ((station.position.lng - minLng) / (maxLng - minLng)) * canvasWidth;
        const y = ((maxLat - station.position.lat) / (maxLat - minLat)) * canvasHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    
    // Dibujar el tren
    if (trainPosition) {
      const trainX = ((trainPosition.lng - minLng) / (maxLng - minLng)) * canvasWidth;
      const trainY = ((maxLat - trainPosition.lat) / (maxLat - minLat)) * canvasHeight;
      
      ctx.fillStyle = '#FF5722';
      ctx.beginPath();
      ctx.arc(trainX, trainY, 6, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [isOpen, allCoordinates]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-4 shadow-lg w-[80%] max-w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Mapa de Recorrido</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width={450} 
            height={300} 
            className="w-full"
          />
        </div>
        
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#FF5722] mr-1"></div>
            <span>Tren</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#4A8C2A] mr-1"></div>
            <span>Estaciones</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-1 bg-[#333] mr-1"></div>
            <span>Vías</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniMap;
