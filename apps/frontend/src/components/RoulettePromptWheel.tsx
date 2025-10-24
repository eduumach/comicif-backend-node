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
  const wheelRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (spinning && selectedPrompt) {
      // Calcular a posição do prompt selecionado
      const selectedIndex = prompts.findIndex(p => p.id === selectedPrompt.id);

      if (selectedIndex !== -1) {
        // Calcular ângulo para parar no prompt selecionado
        const segmentAngle = 360 / prompts.length;
        // Ajustar para o centro do segmento e compensar a rotação inicial
        const targetAngle = -(selectedIndex * segmentAngle) - (segmentAngle / 2);

        // Adicionar rotações extras para efeito visual
        const extraRotations = 360 * 5; // 5 voltas completas
        const finalRotation = extraRotations + targetAngle;

        setRotation(finalRotation);
      }
    }
  }, [spinning, selectedPrompt, prompts, rotation]);

  const getColors = () => {
    return [
      '#ef4444', // red-500
      '#3b82f6', // blue-500
      '#22c55e', // green-500
      '#eab308', // yellow-500
      '#a855f7', // purple-500
      '#ec4899', // pink-500
      '#6366f1', // indigo-500
      '#f97316', // orange-500
      '#06b6d4', // cyan-500
      '#14b8a6', // teal-500
      '#84cc16', // lime-500
      '#f59e0b', // amber-500
    ];
  };

  const colors = getColors();
  
  const createWheelSegments = () => {
    const segments = [];
    const centerX = 192; // w-96 = 384px / 2
    const centerY = 192;
    const radius = 192;
    const segmentAngle = (2 * Math.PI) / prompts.length;

    for (let i = 0; i < prompts.length; i++) {
      const startAngle = i * segmentAngle - Math.PI / 2;
      const endAngle = (i + 1) * segmentAngle - Math.PI / 2;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = segmentAngle > Math.PI ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      // Calcular posição do texto
      const textAngle = startAngle + segmentAngle / 2;
      const textRadius = radius * 0.65;
      const textX = centerX + textRadius * Math.cos(textAngle);
      const textY = centerY + textRadius * Math.sin(textAngle);
      
      segments.push({
        path: pathData,
        color: colors[i % colors.length],
        label: prompts[i].title,
        textX,
        textY,
        textAngle: (textAngle * 180) / Math.PI + 90,
      });
    }
    
    return segments;
  };

  const segments = createWheelSegments();

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Container da Roleta */}
      <div className="relative w-96 h-96">
        {/* Indicador/Seta */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-600 drop-shadow-lg" />
        </div>

        {/* Roda usando SVG */}
        <div className="relative w-full h-full">
          <svg
            ref={wheelRef}
            viewBox="0 0 384 384"
            className="w-full h-full drop-shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {/* Borda externa */}
            <circle
              cx="192"
              cy="192"
              r="192"
              fill="none"
              stroke="#1f2937"
              strokeWidth="8"
            />
            
            {/* Segmentos */}
            {segments.map((segment, index) => (
              <g key={index}>
                <path
                  d={segment.path}
                  fill={segment.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={segment.textX}
                  y={segment.textY}
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${segment.textAngle}, ${segment.textX}, ${segment.textY})`}
                  style={{ 
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                  }}
                >
                  {segment.label.length > 10 ? segment.label.substring(0, 10) + '...' : segment.label}
                </text>
              </g>
            ))}
            
            {/* Centro da roda */}
            <circle
              cx="192"
              cy="192"
              r="40"
              fill="#1f2937"
              stroke="#ffffff"
              strokeWidth="3"
            />
          </svg>
          
          {/* Ícone no centro */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
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
