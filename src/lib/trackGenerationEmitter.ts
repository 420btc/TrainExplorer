// Definir tipos de eventos para el progreso de generación
export interface TrackGenerationProgress {
  progress: number; // 0-100
  message: string;
  trackGenerated?: {
    id: string;
    path: { lat: number; lng: number }[];
    color: string;
    lineNumber: number;
  };
  totalLines?: number;
}

// Crear un EventEmitter para la generación de vías
class TrackGenerationEmitter {
  private listeners: ((data: TrackGenerationProgress) => void)[] = [];

  addListener(callback: (data: TrackGenerationProgress) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  emit(data: TrackGenerationProgress) {
    this.listeners.forEach(listener => listener(data));
  }
}

export const trackGenerationEmitter = new TrackGenerationEmitter();
