import React, { useState, useEffect } from 'react';
import ConsoleBanner from './ConsoleBanner';
import { Train } from 'lucide-react';
import SimpleTrainAnimation from './SimpleTrainAnimation';
import LoadingMiniMap from './LoadingMiniMap';
import { trackGenerationEmitter } from '@/lib/trackGenerationEmitter';
import loadingImg from '@/assets/loading.png';

interface StyledLoadingScreenProps {
  isVisible: boolean;
  center?: { lat: number; lng: number };
  onLoadingComplete?: () => void;
}

const StyledLoadingScreen: React.FC<StyledLoadingScreenProps> = ({ isVisible, center, onLoadingComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExpandedMap, setShowExpandedMap] = useState(false);

  // Escuchar cuando se complete la generación
  useEffect(() => {
    if (!isVisible) return;

    const unsubscribe = trackGenerationEmitter.addListener((data) => {
      if (data.progress >= 100 && !isCompleted) {
        setIsCompleted(true);
        // Mostrar el mapa expandido
        setTimeout(() => {
          setShowExpandedMap(true);
        }, 500);
        
        // Después de 4 segundos, llamar onLoadingComplete
        setTimeout(() => {
          if (onLoadingComplete) {
            onLoadingComplete();
          }
        }, 4500);
      }
    });

    return unsubscribe;
  }, [isVisible, isCompleted, onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50">
      {/* Fondo con imagen loading.png */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${loadingImg})` }}
      >
        {/* Overlay oscuro para mejorar la legibilidad */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Atribución superior */}
        <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
          <a 
            href="https://www.carlosfr.es" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#FF5722]/80 hover:bg-[#FF5722]/90 text-white px-4 py-1 rounded-full shadow-lg drop-shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            <p className="text-sm font-medium drop-shadow-sm">Made By: www.carlosfr.es</p>
          </a>
        </div>
        
        {/* Vías de tren en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-[#333333] flex items-center justify-center">
          {/* Base de las vías */}
          <div className="w-full h-[20px] bg-[#222222] flex items-center">
            {/* Traviesas */}
            <div className="w-full h-[6px] flex justify-center">
              <div className="w-[95%] flex justify-between">
                {Array(50).fill(0).map((_, i) => (
                  <div key={i} className="h-full w-[10px] bg-[#444444]"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Rieles */}
          <div className="absolute bottom-[20px] left-0 right-0 h-[4px] flex justify-center">
            <div className="w-[95%] flex justify-between">
              <div className="h-full w-[10px] bg-[#111111]"></div>
              <div className="h-full w-[10px] bg-[#111111]"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vamos a usar directamente el mismo componente de animación del tren que en el menú principal */}
      <div className="absolute bottom-[40px] left-0 w-full overflow-hidden" style={{ height: '40px', zIndex: 30 }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          <div className="simple-train" style={{ animationDuration: '10s', position: 'absolute', bottom: '0px', display: 'flex', flexDirection: 'row' }}>
            <div className="train-container" style={{ display: 'flex', flexDirection: 'row' }}>
              {/* Locomotora */}
              <div>
                <div className="train-body">
                  <div className="train-cabin"></div>
                  <div className="train-window"></div>
                </div>
                <div className="train-base"></div>
                <div className="train-wheels">
                  <div className="wheel"></div>
                  <div className="wheel"></div>
                  <div className="wheel"></div>
                </div>
              </div>
              
              {/* Vagón 1 */}
              <div>
                <div className="wagon">
                  <div className="wagon-window wagon-window-1"></div>
                  <div className="wagon-window wagon-window-2"></div>
                </div>
                <div className="train-base"></div>
                <div className="train-wheels">
                  <div className="wheel"></div>
                  <div className="wheel"></div>
                </div>
              </div>
              
              {/* Vagón 2 */}
              <div>
                <div className="wagon" style={{ backgroundColor: '#E91E63' }}>
                  <div className="wagon-window wagon-window-1"></div>
                  <div className="wagon-window wagon-window-2"></div>
                </div>
                <div className="train-base"></div>
                <div className="train-wheels">
                  <div className="wheel"></div>
                  <div className="wheel"></div>
                </div>
              </div>
              
              {/* Vagón 3 */}
              <div>
                <div className="wagon" style={{ backgroundColor: '#009688' }}>
                  <div className="wagon-window wagon-window-1"></div>
                  <div className="wagon-window wagon-window-2"></div>
                </div>
                <div className="train-base"></div>
                <div className="train-wheels">
                  <div className="wheel"></div>
                  <div className="wheel"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenido central en dos columnas */}
      <div className="absolute inset-0 flex items-center justify-center pt-20 pb-20">
        <div className={`w-full h-full flex gap-6 transition-all duration-1000 ${
          showExpandedMap ? 'max-w-none' : 'max-w-6xl'
        }`}>
          {/* Columna izquierda - Mini mapa cuadrado */}
          <div className={`flex items-center justify-center transition-all duration-1000 ${
            showExpandedMap ? 'flex-1 w-full' : 'flex-1'
          }`}>
            <div className={`transition-all duration-1000 ${
              showExpandedMap 
                ? 'w-full h-full max-w-none aspect-auto' 
                : 'w-full aspect-square max-w-md'
            }`}>
              <LoadingMiniMap 
                isVisible={true} 
                center={center || { lat: 40.4168, lng: -3.7038 }} 
                isExpanded={showExpandedMap}
              />
            </div>
          </div>
          
          {/* Columna derecha - Console Banner cuadrado */}
          {!showExpandedMap && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full aspect-square max-w-md">
                <ConsoleBanner isVisible={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyledLoadingScreen;
