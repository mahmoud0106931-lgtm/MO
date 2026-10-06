import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

interface AudioVisualizerCanvasProps {
  isPlaying: boolean;
  accentColor: string;
}

export const AudioVisualizerCanvas: React.FC<AudioVisualizerCanvasProps> = ({
  isPlaying,
  accentColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const data = audioEngine.getVisualizerData();
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const barCount = 36;
      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        // Sample from frequency data with curve
        const dataIdx = Math.floor((i / barCount) * (data.length * 0.75));
        const val = isPlaying ? (data[dataIdx] || 0) : 10;
        const normalized = val / 255;
        const barHeight = Math.max(3, normalized * height * 0.85);

        const x = i * barWidth;
        const y = height - barHeight;

        // Gradient for each bar
        const gradient = ctx.createLinearGradient(0, y, 0, height);
        gradient.addColorStop(0, accentColor || '#f97316');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 1, y, barWidth - 2, barHeight, [3, 3, 0, 0]);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, accentColor]);

  return (
    <div className="w-full max-w-xs mx-auto h-9 px-4 opacity-75">
      <canvas
        ref={canvasRef}
        width={280}
        height={36}
        className="w-full h-full"
      />
    </div>
  );
};
