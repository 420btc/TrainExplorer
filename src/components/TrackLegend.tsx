import React from 'react';
import { TrackSegment, Station } from '@/lib/mapUtils';
import { Train, MapPin, Home } from 'lucide-react';

interface TrackLegendProps {
  tracks: TrackSegment[];
  stations?: Station[];
}

const TrackLegend: React.FC<TrackLegendProps> = ({ tracks, stations = [] }) => {
  const mainTracks = tracks.filter(track => !track.id.includes('connection'));
  
  const stationsByTrack: Record<string, Station[]> = {};
  stations.forEach(station => {
    if (!stationsByTrack[station.trackId]) {
      stationsByTrack[station.trackId] = [];
    }
    stationsByTrack[station.trackId].push(station);
  });
  
  const tracksWithNames = mainTracks.map((track, index) => {
    const trackStations = stationsByTrack[track.id] || [];
    const firstStation = trackStations[0]?.name || 'Estación Inicial';
    const lastStation = trackStations[trackStations.length - 1]?.name || 'Estación Final';
    
    return {
      ...track,
      lineName: `Línea ${index + 1}`,
      destination: trackStations.length > 0 ? `${firstStation} → ${lastStation}` : 'Ruta en construcción'
    };
  });

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl shadow-black/30 w-[280px] border border-white/10 ring-1 ring-white/5">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
        <div className="bg-blue-500/20 rounded-lg p-1.5">
          <Train className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Red de Metro</h3>
          <p className="text-[10px] text-slate-400">{mainTracks.length} líneas activas</p>
        </div>
      </div>
      
      <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-1 space-y-1.5">
        {tracksWithNames.map((track) => (
          <div key={track.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-white/20 shadow-md"
              style={{ backgroundColor: track.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white truncate">{track.lineName}</span>
                <span className="text-[9px] text-slate-500 font-mono">{track.id.replace('track-', '#')}</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5 group-hover:text-slate-300 transition-colors">
                {track.destination}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {mainTracks.length === 0 && (
        <p className="text-xs text-slate-500 italic text-center py-3">No hay líneas disponibles</p>
      )}
      
      <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-3 h-3 rounded-full flex-shrink-0 bg-red-500 ring-1 ring-red-400/50 shadow-md shadow-red-500/30" />
          <span className="text-[11px] text-slate-300">Estación</span>
          <span className="text-[10px] text-slate-500 ml-auto">{stations.length}</span>
        </div>
        <div className="flex items-center gap-2 px-1">
          <div className="w-3 h-3 rounded-full flex-shrink-0 bg-amber-400 ring-1 ring-amber-300/50 shadow-md shadow-amber-400/30" />
          <span className="text-[11px] text-slate-300">Estación Personal</span>
          <Home className="h-3 w-3 text-amber-400 ml-auto" />
        </div>
      </div>
    </div>
  );
};

export default TrackLegend;
