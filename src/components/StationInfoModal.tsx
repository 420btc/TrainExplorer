import React from 'react';
import { Station } from '@/lib/mapUtils';
import { Passenger } from '@/contexts/GameContext';
import { X, User, MapPin, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface StationInfoModalProps {
  station: Station;
  passengers: Passenger[];
  onClose: () => void;
}

const StationInfoModal: React.FC<StationInfoModalProps> = ({ station, passengers, onClose }) => {
  // Filtrar pasajeros que están esperando en esta estación
  const waitingPassengers = passengers.filter(p => p.origin.id === station.id && !p.isPickedUp);

  // Calcular tiempo de espera para mostrar
  const getWaitingTime = (createdAt: number) => {
    const minutes = Math.floor((Date.now() - createdAt) / 60000);
    return minutes < 1 ? '< 1 min' : `${minutes} min`;
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] w-80 bg-background/95 backdrop-blur-sm border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-10">
      {/* Header con color de la línea */}
      <div 
        className="h-3 w-full" 
        style={{ backgroundColor: station.color || '#3b82f6' }}
      />
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{station.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Línea: {station.trackId}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary/50 p-2 rounded-lg text-center">
              <span className="text-xs text-muted-foreground block">Esperando</span>
              <span className="text-xl font-bold text-primary">{waitingPassengers.length}</span>
            </div>
            <div className="bg-secondary/50 p-2 rounded-lg text-center">
              <span className="text-xs text-muted-foreground block">Tráfico</span>
              <span className="text-xl font-bold text-primary">Normal</span>
            </div>
          </div>

          {/* Lista de pasajeros */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Pasajeros Esperando
            </h3>
            
            <div className="bg-secondary/20 rounded-lg border max-h-48 overflow-y-auto">
              {waitingPassengers.length > 0 ? (
                <ul className="divide-y divide-border">
                  {waitingPassengers.map(passenger => (
                    <li key={passenger.id} className="p-2 text-sm hover:bg-secondary/30 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium truncate max-w-[140px]">
                          Hacia: {passenger.destination.name}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-background px-1.5 py-0.5 rounded-full border">
                          <Clock className="h-3 w-3" />
                          {getWaitingTime(passenger.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground italic truncate">
                        "{passenger.motive}"
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No hay pasajeros esperando en este momento.
                </div>
              )}
            </div>
          </div>
          
          {/* Acciones (Futuras mejoras) */}
          {/* 
          <div className="pt-2 border-t">
            <Button className="w-full text-xs" size="sm" variant="outline">
              Mejorar Estación (50€)
            </Button>
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

export default StationInfoModal;
