import React from 'react';
import { Slider } from './ui/slider';
import { Gauge, ChevronUp, ChevronDown } from 'lucide-react';

export interface GameHeaderProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ speed, onSpeedChange }) => {
  const speedMultipliers = [1, 2, 4, 8, 16];
  const currentMultiplierIndex = Math.min(Math.floor(speed / 25), speedMultipliers.length - 1);
  const currentMultiplier = speedMultipliers[currentMultiplierIndex];

  const getSpeedColor = () => {
    if (currentMultiplier <= 1) return 'bg-slate-500';
    if (currentMultiplier <= 4) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getSpeedLabel = () => {
    if (currentMultiplier <= 1) return 'Normal';
    if (currentMultiplier <= 4) return 'Rápido';
    return 'Turbo';
  };

  const handleSliderChange = (value: number[]) => {
    const multiplierIndex = Math.min(Math.floor(value[0] / 25), speedMultipliers.length - 1);
    const sliderValue = multiplierIndex * 25;
    onSpeedChange(sliderValue);
  };

  const cycleSpeed = (delta: number) => {
    const nextIndex = Math.max(0, Math.min(speedMultipliers.length - 1, currentMultiplierIndex + delta));
    onSpeedChange(nextIndex * 25);
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="bg-slate-800/50 rounded-full p-1 flex-shrink-0">
        <Gauge className="h-3.5 w-3.5 text-slate-400" />
      </div>
      
      <button
        onClick={() => cycleSpeed(-1)}
        disabled={currentMultiplierIndex === 0}
        className="flex-shrink-0 h-5 w-5 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      <Slider 
        defaultValue={[speed]} 
        max={100} 
        step={25}
        className="flex-1"
        onValueChange={handleSliderChange}
      />

      <button
        onClick={() => cycleSpeed(1)}
        disabled={currentMultiplierIndex === speedMultipliers.length - 1}
        className="flex-shrink-0 h-5 w-5 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronUp className="h-3 w-3 text-slate-400" />
      </button>

      <div className="flex-shrink-0 flex items-center gap-1.5 bg-slate-800/60 backdrop-blur-md border border-slate-700/40 px-2.5 py-1 rounded-lg shadow-inner">
        <div className={`h-2 w-2 rounded-full ${getSpeedColor()} animate-pulse`} />
        <span className="text-xs font-bold text-slate-300 tabular-nums">×{currentMultiplier}</span>
      </div>
    </div>
  );
};

export default GameHeader;
