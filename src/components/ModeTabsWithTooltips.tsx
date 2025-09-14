import React from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { BookOpen, Volume2, Eye, HelpCircle } from 'lucide-react';

/**
 * ModeTabsWithTooltips
 *
 * Renders a set of tabbed navigation items for switching between the
 * different learning modes. Each tab contains an icon and a succinct label
 * and reveals a longer description when hovered over. The active tab is
 * highlighted using the styling provided by the underlying tab component.
 *
 * The parent component should wrap the returned structure in a `Tabs`
 * element and manage the active value via the `value` and `onValueChange`
 * props. For convenience this component accepts the active mode and
 * change handler directly and instantiates the `Tabs` wrapper.
 */
export interface ModeTabsWithTooltipsProps {
  /** The currently selected mode value. */
  activeMode: string;
  /** Handler invoked when the user selects a different tab. */
  onModeChange: (mode: string) => void;
}

interface ModeTab {
  value: string;
  icon: React.ElementType;
  label: string;
  tooltip: string;
}

export function ModeTabsWithTooltips({ activeMode, onModeChange }: ModeTabsWithTooltipsProps): JSX.Element {
  const modes: ModeTab[] = [
    {
      value: 'standard',
      icon: BookOpen,
      label: 'Standard',
      tooltip: 'Traditional reading mode – ideal for focused, linear learning and note‑taking',
    },
    {
      value: 'speech',
      icon: Volume2,
      label: 'Audio',
      tooltip: 'Text‑to‑speech mode – great for multitasking, auditory learners and reducing eye strain',
    },
    {
      value: 'visual',
      icon: Eye,
      label: 'Visual',
      tooltip: 'Visual diagram mode – perfect for understanding complex relationships and spatial concepts',
    },
    {
      value: 'quiz',
      icon: HelpCircle,
      label: 'Quiz',
      tooltip: 'Interactive quiz mode – proven to improve retention and identify knowledge gaps',
    },
  ];

  return (
    <Tabs value={activeMode} onValueChange={onModeChange} className="w-full">
      <TabsList className="grid grid-cols-4 gap-2">
        {modes.map(mode => {
          const Icon = mode.icon;
          return (
            <Tooltip key={mode.value} delayDuration={300}>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value={mode.value}
                  className="flex flex-col items-center justify-center p-2 text-xs font-medium focus:outline-none"
                >
                  <Icon className="w-5 h-5 mb-1" />
                  {mode.label}
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm">
                <strong className="block mb-1">{mode.label} Mode</strong>
                <span>{mode.tooltip}</span>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TabsList>
    </Tabs>
  );
}