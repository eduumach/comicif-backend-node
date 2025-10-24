import { useState, useEffect, useRef } from 'react';
import type { Prompt } from '@/types/prompt';
import { Button } from '@/components/ui/button';
import { Dices } from 'lucide-react';

interface RoulettePromptWheelProps {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  onSpin: () => void;
  spinning: boolean;
}

export function RoulettePromptWheel({ prompts, selectedPrompt, onSpin, spinning }: RoulettePromptWheelProps) {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spinning && selectedPrompt) {
      // Calcular a posição do prompt selecionado
      const selectedIndex = prompts.findIndex(p => p.id === selectedPrompt.id);

      if (selectedIndex !== -1) {
        // Calcular ângulo para parar no prompt selecionado
        const segmentAngle = 360 / prompts.length;
        const targetAngle = -(selectedIndex * segmentAngle) + (segmentAngle / 2);

        // Adicionar rotações extras para efeito visual
        const extraRotations = 360 * 5; // 5 voltas completas
        const finalRotation = rotation + extraRotations + targetAngle;

        setRotation(finalRotation);
      }
    }
  }, [spinning, selectedPrompt, prompts]);

  const getColors = () => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-cyan-500',
      'bg-teal-500',
      'bg-lime-500',
      'bg-amber-500',
    ];
    return colors;
  };

  const colors = getColors();

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Container da Roleta */}
      <div className="relative w-96 h-96">
        {/* Indicador/Seta */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-600 drop-shadow-lg" />
        </div>

        {/* Roda */}
        <div
          ref={wheelRef}
          className="relative w-full h-full rounded-full shadow-2xl overflow-hidden border-8 border-gray-800"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {prompts.map((prompt, index) => {
            const segmentAngle = 360 / prompts.length;
            const rotation = index * segmentAngle;
            const color = colors[index % colors.length];

            return (
              <div
                key={prompt.id}
                className={`absolute w-full h-full ${color}`}
                style={{
                  transformOrigin: 'center',
                  transform: `rotate(${rotation}deg)`,
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + Math.tan((Math.PI * segmentAngle) / 360) * 50}% 0%)`,
                }}
              >
                <div
                  className="absolute top-8 left-1/2 -translate-x-1/2 text-white font-bold text-center px-2"
                  style={{
                    transform: `rotate(${segmentAngle / 2}deg)`,
                    maxWidth: '120px',
                  }}
                >
                  <span className="text-xs drop-shadow-md line-clamp-2">
                    {prompt.title}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Centro da roda */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gray-800 rounded-full shadow-lg flex items-center justify-center z-10">
            <Dices className="text-white h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Botão para girar */}
      <Button
        onClick={onSpin}
        disabled={spinning || prompts.length === 0}
        size="lg"
        className="px-8 py-6 text-lg font-bold"
      >
        {spinning ? 'Girando...' : 'Girar Roleta'}
      </Button>

      {/* Resultado */}
      {selectedPrompt && !spinning && (
        <div className="bg-muted border-2 border-primary rounded-lg p-6 text-center max-w-md">
          <p className="text-lg font-semibold">Resultado</p>
          <p className="text-2xl font-bold mt-2">{selectedPrompt.title}</p>
        </div>
      )}
    </div>
  );
}
