import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Star, Target, Clock, Gift, Zap, AlertTriangle, Trophy, Coins } from 'lucide-react';
import { Button } from './ui/button';
import { useGame } from '@/contexts/GameContext';
import { Station, TrackSegment } from '@/lib/mapUtils';

// Tipos para las misiones dinámicas
export interface AutoModeMission {
  id: string;
  title: string;
  description: string;
  type: 'delivery' | 'exploration' | 'speed' | 'efficiency' | 'collection';
  target: number;
  current: number;
  reward: {
    money: number;
    points: number;
    experience: number;
  };
  timeLimit?: number;
  timeRemaining?: number;
  isCompleted: boolean;
  isActive: boolean;
}

// Tipos para eventos aleatorios
export interface AutoModeEvent {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral' | 'choice';
  choices?: {
    id: string;
    text: string;
    effect: {
      money?: number;
      points?: number;
      happiness?: number;
      speed?: number;
    };
  }[];
  duration?: number;
  autoResolve?: boolean;
}

// Tipos para logros del modo automático
export interface AutoModeAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  current: number;
  isUnlocked: boolean;
  reward: {
    money: number;
    points: number;
  };
}

interface AutoModeEnhancementsProps {
  isAutoModeActive: boolean;
  currentTrack: TrackSegment | null;
  visitedTracks: Set<string>;
  trainSpeed: number;
  onSpeedBoost: () => void;
  onMissionComplete: (mission: AutoModeMission) => void;
}

const AutoModeEnhancements: React.FC<AutoModeEnhancementsProps> = ({
  isAutoModeActive,
  currentTrack,
  visitedTracks,
  trainSpeed,
  onSpeedBoost,
  onMissionComplete
}) => {
  const { 
    money, 
    points, 
    happiness, 
    passengers, 
    trainPassengers,
    setMoney, 
    setPoints, 
    setHappiness,
    addMessage 
  } = useGame();

  // Estados para las funcionalidades del modo automático
  const [activeMissions, setActiveMissions] = useState<AutoModeMission[]>([]);
  const [currentEvent, setCurrentEvent] = useState<AutoModeEvent | null>(null);
  const [achievements, setAchievements] = useState<AutoModeAchievement[]>([]);
  const [autoModeStats, setAutoModeStats] = useState({
    totalDistance: 0,
    passengersDelivered: 0,
    tracksExplored: 0,
    timeInAutoMode: 0,
    moneyEarned: 0,
    speedBoostsUsed: 0
  });

  // Misiones predefinidas
  const missionTemplates = useMemo(() => [
    {
      title: "Explorador Urbano",
      description: "Visita 5 vías diferentes en modo automático",
      type: "exploration" as const,
      target: 5,
      reward: { money: 500, points: 100, experience: 50 }
    },
    {
      title: "Conductor Eficiente",
      description: "Entrega 3 pasajeros sin cambiar de dirección",
      type: "delivery" as const,
      target: 3,
      reward: { money: 300, points: 150, experience: 75 }
    },
    {
      title: "Velocista",
      description: "Mantén velocidad x4 o superior durante 2 minutos",
      type: "speed" as const,
      target: 120, // segundos
      reward: { money: 200, points: 80, experience: 40 }
    },
    {
      title: "Recolector",
      description: "Recoge 10 pasajeros en modo automático",
      type: "collection" as const,
      target: 10,
      reward: { money: 800, points: 200, experience: 100 }
    },
    {
      title: "Maratón Ferroviario",
      description: "Permanece en modo automático durante 5 minutos",
      type: "efficiency" as const,
      target: 300, // segundos
      reward: { money: 1000, points: 250, experience: 125 }
    }
  ], []);

  // Eventos aleatorios predefinidos
  const eventTemplates = useMemo(() => [
    {
      title: "¡Pasajero VIP a bordo!",
      description: "Un pasajero importante ha subido al tren. Recibes una bonificación.",
      type: "positive" as const,
      autoResolve: true
    },
    {
      title: "Retraso en la vía",
      description: "Trabajos de mantenimiento causan un pequeño retraso.",
      type: "negative" as const,
      duration: 10000, // 10 segundos
      autoResolve: true
    },
    {
      title: "Evento especial en la ciudad",
      description: "¿Quieres hacer una parada especial para recoger más pasajeros?",
      type: "choice" as const,
      choices: [
        {
          id: "accept",
          text: "Sí, hacer parada especial",
          effect: { money: 200, points: 50, happiness: 10, speed: 0 }
        },
        {
          id: "decline",
          text: "No, continuar ruta normal",
          effect: { money: 50, points: 20, happiness: 0, speed: 0 }
        }
      ]
    },
    {
      title: "Descubrimiento arqueológico",
      description: "Has descubierto un sitio histórico. Los turistas están emocionados.",
      type: "positive" as const,
      autoResolve: true
    },
    {
      title: "Clima perfecto",
      description: "El buen clima atrae más pasajeros. ¡Bonificación de velocidad temporal!",
      type: "positive" as const,
      autoResolve: true
    }
  ], []);

  // Generar nueva misión aleatoria
  const generateRandomMission = useCallback(() => {
    if (activeMissions.length >= 3) return; // Máximo 3 misiones activas

    const template = missionTemplates[Math.floor(Math.random() * missionTemplates.length)];
    const newMission: AutoModeMission = {
      ...template,
      id: `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      current: 0,
      isCompleted: false,
      isActive: true,
      timeLimit: Math.random() > 0.7 ? 300000 : undefined, // 30% de probabilidad de límite de tiempo
      timeRemaining: Math.random() > 0.7 ? 300000 : undefined
    };

    setActiveMissions(prev => [...prev, newMission]);
    toast.success(`Nueva misión: ${newMission.title}`);
    
    addMessage({
      id: `mission_msg_${Date.now()}`,
      text: `🎯 Nueva misión disponible: ${newMission.title}`,
      color: '#10B981'
    });
  }, [activeMissions.length, addMessage, missionTemplates]);

  // Manejar resolución de eventos
  const handleEventResolution = useCallback((event: AutoModeEvent, choiceId?: string) => {
    let effect = { money: 0, points: 0, happiness: 0, speed: 0 };

    if (event.type === 'choice' && choiceId && event.choices) {
      const choice = event.choices.find(c => c.id === choiceId);
      if (choice) {
        effect = { ...effect, ...choice.effect };
        toast.success(`Has elegido: ${choice.text}`);
      }
    } else if (event.type === 'positive') {
      effect = { money: 100 + Math.random() * 200, points: 50 + Math.random() * 100, happiness: 5, speed: 0 };
      toast.success(event.title);
    } else if (event.type === 'negative') {
      effect = { money: -50, points: -25, happiness: -2, speed: 0 };
      toast.warning(event.title);
    }

    // Aplicar efectos
    if (effect.money !== 0) setMoney(money + effect.money);
    if (effect.points !== 0) setPoints(points + effect.points);
    if (effect.happiness !== 0) setHappiness(Math.max(0, Math.min(100, happiness + effect.happiness)));
    if (effect.speed > 0) onSpeedBoost();

    setCurrentEvent(null);
  }, [money, points, happiness, setMoney, setPoints, setHappiness, onSpeedBoost]);

  // Generar evento aleatorio
  const generateRandomEvent = useCallback(() => {
    if (currentEvent || Math.random() > 0.15) return; // 15% de probabilidad cada vez que se llama

    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    const newEvent: AutoModeEvent = {
      ...template,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setCurrentEvent(newEvent);
    
    // Auto-resolver eventos positivos y negativos
    if (newEvent.autoResolve) {
      setTimeout(() => {
        handleEventResolution(newEvent);
      }, 3000);
    }
  }, [currentEvent, eventTemplates, handleEventResolution]);

  // Actualizar progreso de misiones
  const updateMissionProgress = useCallback(() => {
    setActiveMissions(prev => prev.map(mission => {
      let newCurrent = mission.current;

      switch (mission.type) {
        case 'exploration':
          newCurrent = visitedTracks.size;
          break;
        case 'collection':
          newCurrent = autoModeStats.passengersDelivered;
          break;
        case 'delivery':
          newCurrent = trainPassengers.length;
          break;
        case 'speed':
          if (trainSpeed >= 4) {
            newCurrent = mission.current + 1;
          }
          break;
        case 'efficiency':
          newCurrent = autoModeStats.timeInAutoMode;
          break;
      }

      const isCompleted = newCurrent >= mission.target && !mission.isCompleted;
      
      if (isCompleted) {
        // Otorgar recompensas
        setMoney(money + mission.reward.money);
        setPoints(points + mission.reward.points);
        
        toast.success(`¡Misión completada! ${mission.title}`);
        addMessage({
          id: `mission_complete_${Date.now()}`,
          text: `🏆 Misión completada: ${mission.title} (+${mission.reward.money}💰 +${mission.reward.points}⭐)`,
          color: '#F59E0B'
        });

        onMissionComplete(mission);
      }

      return {
        ...mission,
        current: newCurrent,
        isCompleted: isCompleted || mission.isCompleted
      };
    }));
  }, [visitedTracks.size, autoModeStats, trainPassengers.length, trainSpeed, setMoney, setPoints, addMessage, onMissionComplete]);

  // Efecto para generar misiones periódicamente
  useEffect(() => {
    if (!isAutoModeActive) return;

    const missionInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% de probabilidad cada 30 segundos
        generateRandomMission();
      }
    }, 30000);

    return () => clearInterval(missionInterval);
  }, [isAutoModeActive, generateRandomMission]);

  // Efecto para generar eventos aleatorios
  useEffect(() => {
    if (!isAutoModeActive) return;

    const eventInterval = setInterval(() => {
      generateRandomEvent();
    }, 20000); // Cada 20 segundos

    return () => clearInterval(eventInterval);
  }, [isAutoModeActive, generateRandomEvent]);

  // Efecto para actualizar estadísticas y progreso
  useEffect(() => {
    if (!isAutoModeActive) return;

    const statsInterval = setInterval(() => {
      setAutoModeStats(prev => ({
        ...prev,
        timeInAutoMode: prev.timeInAutoMode + 1,
        tracksExplored: visitedTracks.size
      }));

      updateMissionProgress();
    }, 1000);

    return () => clearInterval(statsInterval);
  }, [isAutoModeActive, visitedTracks.size, updateMissionProgress]);

  if (!isAutoModeActive) return null;

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
      {/* Misiones activas */}
      <AnimatePresence>
        {activeMissions.filter(m => m.isActive && !m.isCompleted).map(mission => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="bg-blue-900/90 backdrop-blur-sm text-white p-3 rounded-lg border border-blue-400"
          >
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-300" />
              <span className="font-semibold text-sm">{mission.title}</span>
            </div>
            <p className="text-xs text-blue-200 mb-2">{mission.description}</p>
            <div className="flex justify-between items-center">
              <div className="text-xs">
                {mission.current}/{mission.target}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Coins className="h-3 w-3" />
                {mission.reward.money}
                <Star className="h-3 w-3 ml-1" />
                {mission.reward.points}
              </div>
            </div>
            {mission.timeRemaining && (
              <div className="mt-1 text-xs text-yellow-300 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.floor(mission.timeRemaining / 1000)}s restantes
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Evento actual */}
      <AnimatePresence>
        {currentEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`p-4 rounded-lg border-2 ${
              currentEvent.type === 'positive' ? 'bg-green-900/90 border-green-400' :
              currentEvent.type === 'negative' ? 'bg-red-900/90 border-red-400' :
              currentEvent.type === 'choice' ? 'bg-purple-900/90 border-purple-400' :
              'bg-gray-900/90 border-gray-400'
            } backdrop-blur-sm text-white`}
          >
            <div className="flex items-center gap-2 mb-2">
              {currentEvent.type === 'positive' && <Gift className="h-5 w-5 text-green-300" />}
              {currentEvent.type === 'negative' && <AlertTriangle className="h-5 w-5 text-red-300" />}
              {currentEvent.type === 'choice' && <Zap className="h-5 w-5 text-purple-300" />}
              <span className="font-semibold">{currentEvent.title}</span>
            </div>
            <p className="text-sm mb-3">{currentEvent.description}</p>
            
            {currentEvent.choices && (
              <div className="space-y-2">
                {currentEvent.choices.map(choice => (
                  <Button
                    key={choice.id}
                    onClick={() => handleEventResolution(currentEvent, choice.id)}
                    className="w-full text-xs py-1 h-8"
                    variant="outline"
                  >
                    {choice.text}
                  </Button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estadísticas del modo automático */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-900/80 backdrop-blur-sm text-white p-2 rounded-lg text-xs"
      >
        <div className="flex items-center gap-1 mb-1">
          <Trophy className="h-3 w-3 text-yellow-400" />
          <span className="font-semibold">Estadísticas Auto</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>Vías: {autoModeStats.tracksExplored}</div>
          <div>Tiempo: {Math.floor(autoModeStats.timeInAutoMode / 60)}m</div>
          <div>Pasajeros: {autoModeStats.passengersDelivered}</div>
          <div>Dinero: ${autoModeStats.moneyEarned}</div>
        </div>
      </motion.div>
    </div>
  );
};

export default AutoModeEnhancements;