
import React from 'react';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { UserCircle, Menu, Bell, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu';
import { cn } from '@/lib/utils';

export interface GameHeaderProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ speed, onSpeedChange }) => {
  // Mapear valores del slider a multiplicadores
  const speedMultipliers = [1, 2, 4, 8, 16];
  const currentMultiplierIndex = Math.min(Math.floor(speed / 25), speedMultipliers.length - 1);
  const currentMultiplier = speedMultipliers[currentMultiplierIndex];

  const handleSliderChange = (value: number[]) => {
    // Convertir el valor del slider (0-100) a índice de multiplicador (0-4)
    const multiplierIndex = Math.min(Math.floor(value[0] / 25), speedMultipliers.length - 1);
    // Convertir de vuelta a valor de slider para mantener consistencia
    const sliderValue = multiplierIndex * 25;
    onSpeedChange(sliderValue);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">Velocidad</span>
        <Badge variant="outline" className="text-xs h-4 px-1">x{currentMultiplier}</Badge>
      </div>
      <div className="flex items-center gap-1">
        <Slider 
          defaultValue={[speed]} 
          max={100} 
          step={25}
          className="w-full"
          onValueChange={handleSliderChange}
        />
        <Button 
          variant="outline" 
          size="icon" 
          className="h-5 w-5 flex-shrink-0"
          onClick={() => {
            // Ciclar entre multiplicadores: x1 -> x2 -> x4 -> x8 -> x16 -> x1
            const nextIndex = (currentMultiplierIndex + 1) % speedMultipliers.length;
            const newSpeed = nextIndex * 25;
            onSpeedChange(newSpeed);
          }}
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default GameHeader;
