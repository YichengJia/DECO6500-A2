import React from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { BookOpen, Volume2, Eye, HelpCircle } from 'lucide-react';

interface QuickModeSwitchProps {
  activeMode: string;
  onModeChange: (mode: string) => void;
}

const QuickModeButton = React.forwardRef<HTMLButtonElement, {
  mode: { id: string; icon: React.ElementType; label: string; tooltip: string };
  isActive: boolean;
  onClick: () => void;
}>(({ mode, isActive, onClick }, ref) => {
  const Icon = mode.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={ref}
          variant={isActive ? "default" : "ghost"}
          size="sm"
          onClick={onClick}
          className="w-10 h-10 rounded-full p-0"
          title={mode.tooltip}
        >
          <Icon className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{mode.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
});

QuickModeButton.displayName = "QuickModeButton";

export function QuickModeSwitch({ activeMode, onModeChange }: QuickModeSwitchProps) {
  const modes = [
    { 
      id: 'standard', 
      icon: BookOpen, 
      label: 'Text',
      tooltip: 'Traditional reading mode'
    },
    { 
      id: 'speech', 
      icon: Volume2, 
      label: 'Audio',
      tooltip: 'Text-to-speech mode'
    },
    { 
      id: 'visual', 
      icon: Eye, 
      label: 'Visual',
      tooltip: 'Visual diagram mode'
    },
    { 
      id: 'quiz', 
      icon: HelpCircle, 
      label: 'Quiz',
      tooltip: 'Interactive quiz mode'
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-full shadow-lg border border-gray-200 p-2 flex space-x-1 z-40">
      {modes.map((mode) => (
        <QuickModeButton
          key={mode.id}
          mode={mode}
          isActive={activeMode === mode.id}
          onClick={() => onModeChange(mode.id)}
        />
      ))}
    </div>
  );
}