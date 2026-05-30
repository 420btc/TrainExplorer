import React from 'react';
import { Passenger } from './PassengerSystem';
import { Coins, Star, Users } from 'lucide-react';

interface PassengerInfoProps {
  money: number;
  points: number;
  activePassengers: Passenger[];
  pickedUpPassengers: Passenger[];
}

const PassengerInfo: React.FC<PassengerInfoProps> = ({
  money,
  points,
  activePassengers,
  pickedUpPassengers
}) => {
  const waitingCount = activePassengers.filter(p => !p.isPickedUp).length;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2.5 bg-emerald-950/40 backdrop-blur-md border border-emerald-500/30 px-3 py-2 rounded-xl shadow-lg shadow-emerald-900/20">
        <div className="bg-emerald-500/20 rounded-full p-1.5">
          <Coins className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <span className="text-lg font-bold text-emerald-300 tabular-nums tracking-tight">{money.toLocaleString('es-ES')}</span>
          <span className="text-[11px] text-emerald-500/80 ml-1 font-medium">€</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 bg-blue-950/40 backdrop-blur-md border border-blue-500/30 px-3 py-2 rounded-xl shadow-lg shadow-blue-900/20">
        <div className="bg-blue-500/20 rounded-full p-1.5">
          <Star className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <span className="text-lg font-bold text-blue-300 tabular-nums tracking-tight">{points}</span>
          <span className="text-[11px] text-blue-500/80 ml-1 font-medium">pt</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 bg-purple-950/40 backdrop-blur-md border border-purple-500/30 px-3 py-2 rounded-xl shadow-lg shadow-purple-900/20">
        <div className="bg-purple-500/20 rounded-full p-1.5">
          <Users className="h-4 w-4 text-purple-400" />
        </div>
        <div>
          <span className="text-lg font-bold text-purple-300 tabular-nums tracking-tight">
            {pickedUpPassengers.length}
            <span className="text-purple-500/60">/</span>
            {waitingCount}
          </span>
          <span className="text-[11px] text-purple-500/80 ml-1 font-medium">pax</span>
        </div>
      </div>
    </div>
  );
};

export default PassengerInfo;
