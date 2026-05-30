import React from 'react';
import { Station } from '@/lib/mapUtils';
import { Passenger } from '@/contexts/GameContext';
import { X, User, MapPin, Clock, Train } from 'lucide-react';

interface StationInfoModalProps {
  station: Station;
  passengers: Passenger[];
  onClose: () => void;
}

const StationInfoModal: React.FC<StationInfoModalProps> = ({ station, passengers, onClose }) => {
  const waitingPassengers = passengers.filter(p => p.origin.id === station.id && !p.isPickedUp);

  const getWaitingTime = (createdAt: number) => {
    const minutes = Math.floor((Date.now() - createdAt) / 60000);
    if (minutes < 1) return '< 1 min';
    if (minutes === 1) return '1 min';
    return `${minutes} min`;
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] w-80 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-right-10 ring-1 ring-white/5">
      <div 
        className="h-2 w-full" 
        style={{ backgroundColor: station.color || '#3b82f6' }}
      />
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 rounded-lg p-1.5">
              <Train className="h-4 w-4" style={{ color: station.color || '#3b82f6' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{station.name}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {station.trackId}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium block">Esperando</span>
              <span className="text-2xl font-bold text-blue-400 tabular-nums">{waitingPassengers.length}</span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium block">Línea</span>
              <span className="text-2xl font-bold text-emerald-400 tabular-nums" style={{ color: station.color || '#3b82f6' }}>
                {station.trackId.replace('track-', '')}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-slate-500" />
              Pasajeros Esperando
            </h3>
            
            <div className="bg-white/5 rounded-xl border border-white/5 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {waitingPassengers.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {waitingPassengers.map(passenger => (
                    <div key={passenger.id} className="p-2.5 hover:bg-white/5 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-white truncate max-w-[160px]">
                          {passenger.destination.name}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded-full border border-white/5">
                          <Clock className="h-3 w-3" />
                          {getWaitingTime(passenger.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic truncate leading-tight">
                        &quot;{passenger.motive}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs">
                  Sin pasajeros esperando
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationInfoModal;
