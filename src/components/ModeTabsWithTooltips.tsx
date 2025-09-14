import React from 'react';
import { TabsList, TabsTrigger } from './ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { BookOpen, Volume2, Eye, HelpCircle } from 'lucide-react';

interface ModeTab {
  value: string;
  icon: React.ElementType;
  label: string;
  tooltip: string;
}

const ModeTabWithTooltip = React.forwardRef<HTMLButtonElement, {
  mode: ModeTab;
}>(({ mode }, ref) => {
  const Icon = mode.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TabsTrigger 
          ref={ref}
          value={mode.value} 
          className="flex items-center space-x-2"
          title={mode.tooltip}
        >
          <Icon className="w-4 h-4" />
          <span>{mode.label}</span>
        </TabsTrigger>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-center">
        <p>{mode.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
});

ModeTabWithTooltip.displayName = "ModeTabWithTooltip";

export function ModeTabsWithTooltips() {
  const modes: ModeTab[] = [
    {
      value: 'standard',
      icon: BookOpen,
      label: 'Standard Text Mode',
      tooltip: 'Traditional reading mode – ideal for focused, linear learning and note-taking'
    },
    {
      value: 'speech',
      icon: Volume2,
      label: 'Text-to-Speech Mode',
      tooltip: 'Audio mode – great for multitasking, auditory learners, and reducing eye strain'
    },
    {
      value: 'visual',
      icon: Eye,
      label: 'Visual Diagram Mode',
      tooltip: 'Visual learning mode – perfect for understanding complex relationships and spatial concepts'
    },
    {
      value: 'quiz',
      icon: HelpCircle,
      label: 'Interactive Quiz Mode',
      tooltip: 'Active recall testing – proven to improve retention and identify knowledge gaps'
    }
  ];

  return (
    <TabsList className="grid w-full grid-cols-4 bg-white">
      {modes.map((mode) => (
        <ModeTabWithTooltip key={mode.value} mode={mode} />
      ))}
    </TabsList>
  );
}