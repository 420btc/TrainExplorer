import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { useGame } from '@/contexts/GameContext';
import { 
  Zap, 
  Target, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  XCircle,
  Star,
  Coins,
  Timer,
  Gamepad2
} from 'lucide-react';

// Tipos para los mini-juegos
export interface Minigame {
  id: string;
  type: 'reaction' | 'sequence' | 'memory' | 'timing' | 'math';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  reward: {
    money: number;
    points: number;
    happiness: number;
  };
  isActive: boolean;
}

// Componente para el mini-juego de reacción
const ReactionGame: React.FC<{
  onComplete: (success: boolean) => void;
  timeLimit: number;
}> = ({ onComplete, timeLimit }) => {
  const [isWaiting, setIsWaiting] = useState(true);
  const [showTarget, setShowTarget] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);

  useEffect(() => {
    const waitTime = 2000 + Math.random() * 3000; // 2-5 segundos de espera
    
    const timer = setTimeout(() => {
      setIsWaiting(false);
      setShowTarget(true);
      setStartTime(Date.now());
      
      // Auto-fail si no reacciona a tiempo
      setTimeout(() => {
        if (showTarget) {
          onComplete(false);
        }
      }, timeLimit);
    }, waitTime);

    return () => clearTimeout(timer);
  }, [timeLimit, showTarget, onComplete]);

  const handleClick = () => {
    if (isWaiting) {
      onComplete(false); // Clickeó muy temprano
      return;
    }
    
    if (showTarget) {
      const reaction = Date.now() - startTime;
      setReactionTime(reaction);
      setShowTarget(false);
      onComplete(reaction < timeLimit);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-2">¡Prueba de Reflejos!</h3>
        <p className="text-sm text-gray-300">
          {isWaiting ? 'Espera a que aparezca el objetivo...' : '¡Haz clic en el objetivo rápidamente!'}
        </p>
      </div>
      
      <div 
        className={`w-32 h-32 mx-auto rounded-full border-4 cursor-pointer transition-all duration-200 ${
          isWaiting 
            ? 'bg-gray-600 border-gray-500' 
            : showTarget 
              ? 'bg-green-500 border-green-400 animate-pulse' 
              : 'bg-red-500 border-red-400'
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center justify-center h-full">
          {showTarget && <Target className="h-12 w-12 text-white" />}
          {isWaiting && <Clock className="h-12 w-12 text-gray-400" />}
        </div>
      </div>
      
      {reactionTime > 0 && (
        <p className="mt-4 text-sm text-yellow-300">
          Tiempo de reacción: {reactionTime}ms
        </p>
      )}
    </div>
  );
};

// Componente para el mini-juego de secuencia
const SequenceGame: React.FC<{
  onComplete: (success: boolean) => void;
  difficulty: 'easy' | 'medium' | 'hard';
}> = ({ onComplete, difficulty }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [showingSequence, setShowingSequence] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const buttons = useMemo(() => ['up', 'down', 'left', 'right'], []);
  const sequenceLength = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;

  useEffect(() => {
    // Generar secuencia aleatoria
    const newSequence = Array.from({ length: sequenceLength }, () => 
      buttons[Math.floor(Math.random() * buttons.length)]
    );
    setSequence(newSequence);

    // Mostrar la secuencia
    let step = 0;
    const showSequence = () => {
      if (step < newSequence.length) {
        setActiveButton(newSequence[step]);
        setTimeout(() => {
          setActiveButton(null);
          step++;
          setTimeout(showSequence, 300);
        }, 600);
      } else {
        setShowingSequence(false);
      }
    };

    setTimeout(showSequence, 1000);
  }, [difficulty, sequenceLength, buttons]);

  const handleButtonClick = (button: string) => {
    if (showingSequence) return;

    const newPlayerSequence = [...playerSequence, button];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      onComplete(false);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      onComplete(true);
    }
  };

  const getButtonIcon = (button: string) => {
    switch (button) {
      case 'up': return <ArrowUp className="h-6 w-6" />;
      case 'down': return <ArrowDown className="h-6 w-6" />;
      case 'left': return <ArrowLeft className="h-6 w-6" />;
      case 'right': return <ArrowRight className="h-6 w-6" />;
      default: return null;
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-2">¡Memoriza la Secuencia!</h3>
        <p className="text-sm text-gray-300">
          {showingSequence 
            ? 'Memoriza la secuencia de botones...' 
            : `Repite la secuencia (${playerSequence.length}/${sequence.length})`
          }
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
        <div></div>
        <Button
          onClick={() => handleButtonClick('up')}
          disabled={showingSequence}
          className={`h-12 w-12 ${
            activeButton === 'up' 
              ? 'bg-yellow-500 hover:bg-yellow-600' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {getButtonIcon('up')}
        </Button>
        <div></div>
        
        <Button
          onClick={() => handleButtonClick('left')}
          disabled={showingSequence}
          className={`h-12 w-12 ${
            activeButton === 'left' 
              ? 'bg-yellow-500 hover:bg-yellow-600' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {getButtonIcon('left')}
        </Button>
        <div></div>
        <Button
          onClick={() => handleButtonClick('right')}
          disabled={showingSequence}
          className={`h-12 w-12 ${
            activeButton === 'right' 
              ? 'bg-yellow-500 hover:bg-yellow-600' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {getButtonIcon('right')}
        </Button>
        
        <div></div>
        <Button
          onClick={() => handleButtonClick('down')}
          disabled={showingSequence}
          className={`h-12 w-12 ${
            activeButton === 'down' 
              ? 'bg-yellow-500 hover:bg-yellow-600' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {getButtonIcon('down')}
        </Button>
        <div></div>
      </div>
    </div>
  );
};

// Componente para el mini-juego de matemáticas
const MathGame: React.FC<{
  onComplete: (success: boolean) => void;
  difficulty: 'easy' | 'medium' | 'hard';
}> = ({ onComplete, difficulty }) => {
  const [problem, setProblem] = useState({ question: '', answer: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    let a, b, operation, question, answer;
    
    if (difficulty === 'easy') {
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      operation = Math.random() > 0.5 ? '+' : '-';
      if (operation === '-' && a < b) [a, b] = [b, a]; // Evitar negativos
      question = `${a} ${operation} ${b}`;
      answer = operation === '+' ? a + b : a - b;
    } else if (difficulty === 'medium') {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      operation = Math.random() > 0.5 ? '*' : '/';
      if (operation === '/') {
        a = b * (Math.floor(Math.random() * 10) + 1); // Asegurar división exacta
        question = `${a} ÷ ${b}`;
        answer = a / b;
      } else {
        question = `${a} × ${b}`;
        answer = a * b;
      }
    } else {
      a = Math.floor(Math.random() * 100) + 1;
      b = Math.floor(Math.random() * 100) + 1;
      const ops = ['+', '-', '*'];
      operation = ops[Math.floor(Math.random() * ops.length)];
      if (operation === '-' && a < b) [a, b] = [b, a];
      question = `${a} ${operation === '*' ? '×' : operation} ${b}`;
      answer = operation === '+' ? a + b : operation === '-' ? a - b : a * b;
    }

    setProblem({ question, answer });

    // Generar opciones (una correcta y tres incorrectas)
    const wrongAnswers = [];
    for (let i = 0; i < 3; i++) {
      let wrong;
      do {
        wrong = answer + (Math.floor(Math.random() * 20) - 10);
      } while (wrong === answer || wrongAnswers.includes(wrong) || wrong < 0);
      wrongAnswers.push(wrong);
    }

    const allOptions = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  }, [difficulty]);

  const handleAnswerSelect = (answer: number) => {
    setSelectedAnswer(answer);
    setTimeout(() => {
      onComplete(answer === problem.answer);
    }, 500);
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-2">¡Cálculo Rápido!</h3>
        <p className="text-sm text-gray-300 mb-4">Resuelve la operación matemática</p>
        <div className="text-3xl font-bold text-yellow-300 mb-6">
          {problem.question} = ?
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            disabled={selectedAnswer !== null}
            className={`h-12 text-lg font-semibold ${
              selectedAnswer === option
                ? option === problem.answer
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};

// Componente principal de mini-juegos
interface AutoModeMinigamesProps {
  isAutoModeActive: boolean;
  onGameComplete: (success: boolean, reward: { money: number; points: number; happiness: number }) => void;
}

const AutoModeMinigames: React.FC<AutoModeMinigamesProps> = ({
  isAutoModeActive,
  onGameComplete
}) => {
  const { addMessage } = useGame();
  const [currentGame, setCurrentGame] = useState<Minigame | null>(null);
  const [gameResult, setGameResult] = useState<{ success: boolean; reward: { money: number; points: number; happiness: number } } | null>(null);

  // Plantillas de mini-juegos
  const gameTemplates = useMemo(() => [
    {
      type: 'reaction' as const,
      title: 'Prueba de Reflejos',
      description: 'Haz clic en el objetivo tan rápido como puedas',
      difficulty: 'easy' as const,
      timeLimit: 1500,
      reward: { money: 150, points: 50, happiness: 5 }
    },
    {
      type: 'sequence' as const,
      title: 'Memoriza la Secuencia',
      description: 'Repite la secuencia de botones mostrada',
      difficulty: 'medium' as const,
      timeLimit: 30000,
      reward: { money: 250, points: 100, happiness: 8 }
    },
    {
      type: 'math' as const,
      title: 'Cálculo Rápido',
      description: 'Resuelve la operación matemática',
      difficulty: 'easy' as const,
      timeLimit: 15000,
      reward: { money: 200, points: 75, happiness: 6 }
    },
    {
      type: 'math' as const,
      title: 'Matemáticas Avanzadas',
      description: 'Resuelve operaciones más complejas',
      difficulty: 'hard' as const,
      timeLimit: 20000,
      reward: { money: 400, points: 150, happiness: 10 }
    }
  ], []);

  // Generar mini-juego aleatorio
  const generateRandomGame = useCallback(() => {
    if (currentGame || !isAutoModeActive) return;

    // 10% de probabilidad cada vez que se llama
    if (Math.random() > 0.1) return;

    const template = gameTemplates[Math.floor(Math.random() * gameTemplates.length)];
    const newGame: Minigame = {
      ...template,
      id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isActive: true
    };

    setCurrentGame(newGame);
    toast.info(`¡Mini-juego disponible: ${newGame.title}!`);
    
    addMessage({
      id: `game_msg_${Date.now()}`,
      text: `🎮 Mini-juego: ${newGame.title} - ¡Participa para ganar recompensas!`,
      color: '#8B5CF6'
    });
  }, [currentGame, isAutoModeActive, addMessage, gameTemplates]);

  // Manejar completación del juego
  const handleGameComplete = useCallback((success: boolean) => {
    if (!currentGame) return;

    const result = {
      success,
      reward: success ? currentGame.reward : { money: 0, points: 0, happiness: 0 }
    };

    setGameResult(result);
    onGameComplete(success, result.reward);

    if (success) {
      toast.success(`¡${currentGame.title} completado! +$${result.reward.money} +${result.reward.points}⭐`);
      addMessage({
        id: `game_complete_${Date.now()}`,
        text: `🏆 ¡${currentGame.title} completado! Recompensa: $${result.reward.money} y ${result.reward.points} puntos`,
        color: '#10B981'
      });
    } else {
      toast.error(`${currentGame.title} fallido. ¡Inténtalo la próxima vez!`);
    }

    // Cerrar el juego después de mostrar el resultado
    setTimeout(() => {
      setCurrentGame(null);
      setGameResult(null);
    }, 3000);
  }, [currentGame, onGameComplete, addMessage]);

  // Cerrar juego manualmente
  const handleCloseGame = () => {
    setCurrentGame(null);
    setGameResult(null);
  };

  // Efecto para generar juegos periódicamente
  useEffect(() => {
    if (!isAutoModeActive) return;

    const gameInterval = setInterval(() => {
      generateRandomGame();
    }, 45000); // Cada 45 segundos

    return () => clearInterval(gameInterval);
  }, [isAutoModeActive, generateRandomGame]);

  if (!currentGame) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 border-2 border-purple-400 max-w-md w-full"
        >
          {!gameResult ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-6 w-6 text-purple-300" />
                  <span className="text-white font-bold">Mini-juego</span>
                </div>
                <Button
                  onClick={handleCloseGame}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              <div className="mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400">${currentGame.reward.money}</span>
                  <Star className="h-4 w-4 text-blue-400 ml-2" />
                  <span className="text-blue-400">{currentGame.reward.points}</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-300">
                  <Timer className="h-3 w-3" />
                  <span>{currentGame.timeLimit / 1000}s límite</span>
                </div>
              </div>

              {/* Renderizar el juego específico */}
              {currentGame.type === 'reaction' && (
                <ReactionGame
                  onComplete={handleGameComplete}
                  timeLimit={currentGame.timeLimit}
                />
              )}
              {currentGame.type === 'sequence' && (
                <SequenceGame
                  onComplete={handleGameComplete}
                  difficulty={currentGame.difficulty}
                />
              )}
              {currentGame.type === 'math' && (
                <MathGame
                  onComplete={handleGameComplete}
                  difficulty={currentGame.difficulty}
                />
              )}
            </>
          ) : (
            // Mostrar resultado
            <div className="text-center">
              <div className="mb-4">
                {gameResult.success ? (
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-2" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-400 mx-auto mb-2" />
                )}
                <h3 className="text-xl font-bold text-white">
                  {gameResult.success ? '¡Éxito!' : '¡Fallaste!'}
                </h3>
              </div>
              
              {gameResult.success && (
                <div className="text-center">
                  <p className="text-green-300 mb-2">¡Recompensa obtenida!</p>
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400">+${gameResult.reward.money}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400">+{gameResult.reward.points}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AutoModeMinigames;