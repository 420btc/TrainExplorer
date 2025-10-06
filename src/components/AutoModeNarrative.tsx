import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { Station, TrackSegment } from '@/lib/mapUtils';
import { 
  MessageCircle, 
  User, 
  MapPin, 
  Clock, 
  Camera, 
  Heart,
  Star,
  Coffee,
  Building,
  TreePine,
  Waves,
  Mountain
} from 'lucide-react';

// Tipos para la narrativa
interface NarrativeEvent {
  id: string;
  type: 'passenger_comment' | 'location_description' | 'historical_fact' | 'weather_update' | 'conductor_thought';
  content: string;
  character?: {
    name: string;
    avatar: string;
    type: 'passenger' | 'conductor' | 'narrator';
  };
  location?: string;
  duration: number;
  priority: 'low' | 'medium' | 'high';
}

interface AutoModeNarrativeProps {
  isAutoModeActive: boolean;
  currentTrack: TrackSegment | null;
  currentStation: Station | null;
  trainSpeed: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weather: 'sunny' | 'cloudy' | 'rainy' | 'foggy';
  visitedStations: Set<string>;
}

const AutoModeNarrative: React.FC<AutoModeNarrativeProps> = ({
  isAutoModeActive,
  currentTrack,
  currentStation,
  trainSpeed,
  timeOfDay,
  weather,
  visitedStations
}) => {
  const { passengers, trainPassengers, placeName } = useGame();
  const [currentNarrative, setCurrentNarrative] = useState<NarrativeEvent | null>(null);
  const [narrativeQueue, setNarrativeQueue] = useState<NarrativeEvent[]>([]);
  const [lastNarrativeTime, setLastNarrativeTime] = useState(0);

  // Plantillas de comentarios de pasajeros
  const passengerComments = [
    {
      content: "¡Qué vista tan hermosa desde aquí! Me encanta viajar en tren.",
      character: { name: "María", avatar: "👩", type: 'passenger' as const }
    },
    {
      content: "Este tren es muy cómodo. Perfecto para relajarse.",
      character: { name: "Carlos", avatar: "👨", type: 'passenger' as const }
    },
    {
      content: "¿Sabías que esta línea de tren tiene más de 50 años de historia?",
      character: { name: "Elena", avatar: "👵", type: 'passenger' as const }
    },
    {
      content: "Me gusta la velocidad de este tren. ¡Llegamos rápido!",
      character: { name: "Javier", avatar: "👨‍💼", type: 'passenger' as const }
    },
    {
      content: "Desde aquí se puede ver toda la ciudad. ¡Increíble!",
      character: { name: "Ana", avatar: "👩‍🎓", type: 'passenger' as const }
    },
    {
      content: "Este conductor sabe lo que hace. Viaje muy suave.",
      character: { name: "Roberto", avatar: "👴", type: 'passenger' as const }
    }
  ];

  // Descripciones de ubicaciones
  const locationDescriptions = [
    "Pasas por el distrito histórico, donde los edificios coloniales se mezclan con la arquitectura moderna.",
    "El tren atraviesa una zona residencial tranquila, con jardines bien cuidados y casas familiares.",
    "Ahora cruzas el centro comercial de la ciudad, lleno de actividad y movimiento.",
    "La ruta te lleva por el parque central, donde los árboles proporcionan una sombra refrescante.",
    "Pasas junto al río, donde se pueden ver pequeños botes y pescadores en la orilla.",
    "El tren se acerca a la zona industrial, con sus altas chimeneas y edificios funcionales.",
    "Atraviesas el barrio artístico, conocido por sus murales coloridos y galerías de arte.",
    "La ruta pasa por la universidad, donde estudiantes caminan por los campus arbolados."
  ];

  // Datos históricos
  const historicalFacts = [
    "¿Sabías que el primer tren de esta ciudad comenzó a operar en 1892?",
    "Esta estación fue construida en estilo art déco durante los años 1930.",
    "Durante la Segunda Guerra Mundial, estos trenes transportaron suministros esenciales.",
    "El túnel por el que acabas de pasar tardó 5 años en construirse.",
    "Esta línea de tren conecta 12 barrios diferentes de la ciudad.",
    "El puente que cruzaste es considerado patrimonio arquitectónico local.",
    "En los años 60, más de 100,000 personas usaban diariamente este sistema de trenes.",
    "La estación central fue renovada completamente en el año 2010."
  ];

  // Pensamientos del conductor
  const conductorThoughts = [
    "Todo va según lo programado. Los pasajeros parecen contentos.",
    "Esta ruta siempre me trae buenos recuerdos. La conozco como la palma de mi mano.",
    "El tráfico está fluido hoy. Deberíamos llegar a tiempo a todas las estaciones.",
    "Me gusta ver cómo la ciudad cambia desde la cabina del tren.",
    "Los pasajeros de hoy son muy educados. Hace que el trabajo sea más agradable.",
    "Esta velocidad es perfecta para este tramo. Seguridad ante todo.",
    "El mantenimiento de las vías está excelente. Se nota el trabajo del equipo técnico.",
    "Después de tantos años conduciendo, cada viaje sigue siendo una aventura."
  ];

  // Actualizaciones del clima
  const weatherUpdates = {
    sunny: [
      "El sol brilla intensamente, creando hermosos reflejos en las ventanas del tren.",
      "Un día perfecto para viajar. El cielo está completamente despejado.",
      "La luz dorada del sol ilumina el paisaje de manera espectacular."
    ],
    cloudy: [
      "Las nubes crean interesantes patrones de sombra en el paisaje.",
      "Un día nublado pero agradable para el viaje en tren.",
      "Las nubes bajas dan un ambiente místico al recorrido."
    ],
    rainy: [
      "Las gotas de lluvia crean patrones hipnóticos en las ventanas.",
      "La lluvia hace que los colores del paisaje se vean más intensos.",
      "El sonido de la lluvia se mezcla armoniosamente con el traqueteo del tren."
    ],
    foggy: [
      "La niebla envuelve el tren, creando una atmósfera misteriosa.",
      "La visibilidad es limitada, pero el conductor conoce perfectamente la ruta.",
      "La niebla matutina le da un toque mágico al viaje."
    ]
  };

  // Generar narrativa contextual
  const generateNarrative = useCallback(() => {
    if (!isAutoModeActive || currentNarrative) return;

    const now = Date.now();
    if (now - lastNarrativeTime < 15000) return; // Mínimo 15 segundos entre narrativas

    const narratives: NarrativeEvent[] = [];

    // Comentarios de pasajeros (si hay pasajeros)
    if (trainPassengers.length > 0 && Math.random() > 0.6) {
      const comment = passengerComments[Math.floor(Math.random() * passengerComments.length)];
      narratives.push({
        id: `passenger_${Date.now()}`,
        type: 'passenger_comment',
        content: comment.content,
        character: comment.character,
        duration: 4000,
        priority: 'medium'
      });
    }

    // Descripción de ubicación
    if (Math.random() > 0.7) {
      narratives.push({
        id: `location_${Date.now()}`,
        type: 'location_description',
        content: locationDescriptions[Math.floor(Math.random() * locationDescriptions.length)],
        character: { name: "Narrador", avatar: "🎙️", type: 'narrator' },
        location: placeName,
        duration: 5000,
        priority: 'low'
      });
    }

    // Datos históricos
    if (Math.random() > 0.8) {
      narratives.push({
        id: `history_${Date.now()}`,
        type: 'historical_fact',
        content: historicalFacts[Math.floor(Math.random() * historicalFacts.length)],
        character: { name: "Guía", avatar: "📚", type: 'narrator' },
        duration: 6000,
        priority: 'low'
      });
    }

    // Pensamientos del conductor
    if (Math.random() > 0.75) {
      narratives.push({
        id: `conductor_${Date.now()}`,
        type: 'conductor_thought',
        content: conductorThoughts[Math.floor(Math.random() * conductorThoughts.length)],
        character: { name: "Conductor", avatar: "👨‍✈️", type: 'conductor' },
        duration: 4000,
        priority: 'medium'
      });
    }

    // Actualizaciones del clima
    if (Math.random() > 0.85) {
      const weatherComments = weatherUpdates[weather];
      narratives.push({
        id: `weather_${Date.now()}`,
        type: 'weather_update',
        content: weatherComments[Math.floor(Math.random() * weatherComments.length)],
        character: { name: "Observador", avatar: "🌤️", type: 'narrator' },
        duration: 4000,
        priority: 'low'
      });
    }

    // Seleccionar narrativa con mayor prioridad
    if (narratives.length > 0) {
      const sortedNarratives = narratives.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setCurrentNarrative(sortedNarratives[0]);
      setLastNarrativeTime(now);
    }
  }, [
    isAutoModeActive,
    currentNarrative,
    lastNarrativeTime,
    trainPassengers.length,
    placeName,
    weather
  ]);

  // Efecto para generar narrativas periódicamente
  useEffect(() => {
    if (!isAutoModeActive) return;

    const narrativeInterval = setInterval(() => {
      generateNarrative();
    }, 8000); // Cada 8 segundos

    return () => clearInterval(narrativeInterval);
  }, [isAutoModeActive, generateNarrative]);

  // Efecto para auto-cerrar narrativas
  useEffect(() => {
    if (!currentNarrative) return;

    const timer = setTimeout(() => {
      setCurrentNarrative(null);
    }, currentNarrative.duration);

    return () => clearTimeout(timer);
  }, [currentNarrative]);

  // Generar narrativa especial al llegar a una estación
  useEffect(() => {
    if (!currentStation || visitedStations.has(currentStation.id)) return;

    const stationNarrative: NarrativeEvent = {
      id: `station_${currentStation.id}`,
      type: 'location_description',
      content: `Llegando a la estación ${currentStation.name}. ${
        currentStation.type === 'commercial' ? 'Una zona comercial muy activa.' :
        currentStation.type === 'residential' ? 'Un barrio residencial tranquilo.' :
        currentStation.type === 'tourist' ? 'Una zona turística con muchos atractivos.' :
        'Una zona industrial importante para la ciudad.'
      }`,
      character: { name: "Sistema", avatar: "🚉", type: 'narrator' },
      location: currentStation.name,
      duration: 5000,
      priority: 'high'
    };

    setCurrentNarrative(stationNarrative);
  }, [currentStation, visitedStations]);

  if (!isAutoModeActive || !currentNarrative) return null;

  const getCharacterIcon = (character: { name: string; avatar: string; type: 'passenger' | 'conductor' | 'narrator' } | undefined) => {
    if (character?.type === 'passenger') return <User className="h-4 w-4" />;
    if (character?.type === 'conductor') return <User className="h-4 w-4" />;
    return <MessageCircle className="h-4 w-4" />;
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'passenger_comment': return 'from-blue-900 to-blue-800';
      case 'location_description': return 'from-green-900 to-green-800';
      case 'historical_fact': return 'from-purple-900 to-purple-800';
      case 'conductor_thought': return 'from-orange-900 to-orange-800';
      case 'weather_update': return 'from-cyan-900 to-cyan-800';
      default: return 'from-gray-900 to-gray-800';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 left-4 right-4 z-30 flex justify-center"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`bg-gradient-to-r ${getBackgroundColor(currentNarrative.type)} backdrop-blur-sm rounded-lg p-4 border border-white/20 max-w-md shadow-lg`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                {currentNarrative.character?.avatar || getCharacterIcon(currentNarrative.character)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white">
                  {currentNarrative.character?.name || 'Sistema'}
                </span>
                {currentNarrative.location && (
                  <div className="flex items-center gap-1 text-xs text-white/70">
                    <MapPin className="h-3 w-3" />
                    <span>{currentNarrative.location}</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-white/90 leading-relaxed">
                {currentNarrative.content}
              </p>
              
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: currentNarrative.duration / 1000, ease: 'linear' }}
                    className="h-full bg-white/60"
                  />
                </div>
                <Clock className="h-3 w-3 text-white/50" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AutoModeNarrative;