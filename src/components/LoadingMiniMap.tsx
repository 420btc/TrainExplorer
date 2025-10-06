import React, { useEffect, useRef, useState } from 'react';
import { TrackSegment, Coordinates } from '@/lib/mapUtils';
import { trackGenerationEmitter } from '@/lib/trackGenerationEmitter';

interface LoadingMiniMapProps {
  isVisible: boolean;
  center: Coordinates;
  isExpanded?: boolean;
}

const LoadingMiniMap: React.FC<LoadingMiniMapProps> = ({ isVisible, center, isExpanded = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generatedTracks, setGeneratedTracks] = useState<TrackSegment[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');

  // Escuchar eventos de generación de vías reales
  useEffect(() => {
    if (!isVisible) return;

    const unsubscribe = trackGenerationEmitter.addListener((data) => {
      setCurrentProgress(data.progress);
      setCurrentMessage(data.message);
      
      // Si se generó una vía real, añadirla a la visualización
      if (data.trackGenerated) {
        setGeneratedTracks(prev => {
          const newTracks = [...prev];
          const existingIndex = newTracks.findIndex(t => t.id === data.trackGenerated!.id);
          
          if (existingIndex >= 0) {
            // Actualizar vía existente
            newTracks[existingIndex] = {
              id: data.trackGenerated!.id,
              path: data.trackGenerated!.path,
              distance: 0,
              color: data.trackGenerated!.color,
              weight: 4
            };
          } else {
            // Añadir nueva vía
            newTracks.push({
              id: data.trackGenerated!.id,
              path: data.trackGenerated!.path,
              distance: 0,
              color: data.trackGenerated!.color,
              weight: 4
            });
          }
          
          return newTracks;
        });
      }
    });

    return unsubscribe;
  }, [isVisible]);

  // Ya no necesitamos simular vías, usamos las reales
  // useEffect(() => {
  //   if (!isVisible || currentProgress === 0) return;
  //   // Código de simulación eliminado - ahora usamos vías reales
  // }, [currentProgress, center, isVisible]);

  // Actualizar el canvas cuando cambie isExpanded
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;

    const canvasWidth = isExpanded ? 800 : 200;
    const canvasHeight = isExpanded ? 600 : 150;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }, [isExpanded, isVisible]);

  // Renderizar el mini-mapa con vías reales (optimizado para muchas vías)
  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Limpiar el canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (generatedTracks.length === 0) return;

    // Optimización: Limitar el número de vías dibujadas para mantener rendimiento
    const maxTracksToRender = 200; // Límite para evitar sobrecarga
    const tracksToRender = generatedTracks.length > maxTracksToRender 
      ? generatedTracks.slice(-maxTracksToRender) // Mostrar las más recientes
      : generatedTracks;

    // Calcular límites para normalización
    const allCoords: Coordinates[] = [];
    tracksToRender.forEach(track => {
      // Optimización: Reducir puntos por vía para mejorar rendimiento
      const simplifiedPath = track.path.filter((_, index) => index % 2 === 0 || index === track.path.length - 1);
      allCoords.push(...simplifiedPath);
    });

    if (allCoords.length === 0) return;

    let minLat = allCoords[0].lat;
    let maxLat = allCoords[0].lat;
    let minLng = allCoords[0].lng;
    let maxLng = allCoords[0].lng;

    allCoords.forEach(coord => {
      minLat = Math.min(minLat, coord.lat);
      maxLat = Math.max(maxLat, coord.lat);
      minLng = Math.min(minLng, coord.lng);
      maxLng = Math.max(maxLng, coord.lng);
    });

    // Añadir margen
    const latMargin = (maxLat - minLat) * 0.2 || 0.01;
    const lngMargin = (maxLng - minLng) * 0.2 || 0.01;

    minLat -= latMargin;
    maxLat += latMargin;
    minLng -= lngMargin;
    maxLng += lngMargin;

    // Optimización: Usar un solo path para todas las vías del mismo color
    const tracksByColor = new Map<string, TrackSegment[]>();
    tracksToRender.forEach(track => {
      const color = track.color;
      if (!tracksByColor.has(color)) {
        tracksByColor.set(color, []);
      }
      tracksByColor.get(color)!.push(track);
    });

    // Dibujar las vías agrupadas por color para mejor rendimiento
    tracksByColor.forEach((tracks, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5; // Líneas más finas
      ctx.globalAlpha = 0.9;
      ctx.beginPath();

      tracks.forEach(track => {
        if (track.path.length < 2) return;

        // Simplificar path para mejor rendimiento
        const simplifiedPath = track.path.filter((_, index) => index % 2 === 0 || index === track.path.length - 1);
        
        // Normalizar coordenadas y dibujar
        const trackCoords = simplifiedPath.map(coord => {
          const x = ((coord.lng - minLng) / (maxLng - minLng)) * canvasWidth;
          const y = ((maxLat - coord.lat) / (maxLat - minLat)) * canvasHeight;
          return { x, y };
        });

        // Dibujar la vía
        if (trackCoords.length > 0) {
          ctx.moveTo(trackCoords[0].x, trackCoords[0].y);
          for (let i = 1; i < trackCoords.length; i++) {
            ctx.lineTo(trackCoords[i].x, trackCoords[i].y);
          }
        }
      });
      
      ctx.stroke();
    });

    // Añadir efecto de "chispa" solo en las vías más recientes para mejor rendimiento
    const recentTracks = tracksToRender.slice(-5); // Solo las 5 más recientes
    recentTracks.forEach(track => {
      if (track.path.length < 2) return;

      const trackCoords = track.path.map(coord => {
        const x = ((coord.lng - minLng) / (maxLng - minLng)) * canvasWidth;
        const y = ((maxLat - coord.lat) / (maxLat - minLat)) * canvasHeight;
        return { x, y };
      });

      if (trackCoords.length > 0) {
        const lastPoint = trackCoords[trackCoords.length - 1];
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Restaurar alpha
    ctx.globalAlpha = 1;

    // Dibujar el centro como punto de referencia
    const centerX = ((center.lng - minLng) / (maxLng - minLng)) * canvasWidth;
    const centerY = ((maxLat - center.lat) / (maxLat - minLat)) * canvasHeight;
    
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Añadir borde blanco al centro
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

  }, [isVisible, generatedTracks, center, isExpanded]);

  if (!isVisible) return null;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden shadow-lg">
      <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
        <h4 className="text-sm font-medium text-white">Generación de Red</h4>
        <div className="flex items-center mt-1">
          <div className="flex-1 bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
          <span className="ml-2 text-xs text-gray-400">{currentProgress}%</span>
        </div>
        {currentMessage && (
          <p className="text-xs text-gray-300 mt-1 truncate">{currentMessage}</p>
        )}
      </div>
      
      <div className="p-2">
        <canvas 
          ref={canvasRef} 
          width={isExpanded ? 800 : 200} 
          height={isExpanded ? 600 : 150} 
          className="w-full border border-gray-600 rounded"
        />
      </div>
      
      <div className="bg-gray-800 px-3 py-2 border-t border-gray-700">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-[#FF5722] mr-1"></div>
            <span>Centro</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-blue-500 mr-1"></div>
            <span>Vías</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMiniMap;