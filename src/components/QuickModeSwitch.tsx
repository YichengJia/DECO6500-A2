import React from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { BookOpen, Volume2, Eye, HelpCircle } from 'lucide-react';

/**
 * QuickModeSwitch
 *
 * A compact set of buttons for switching between the learning modes when the
 * interface is in "minimal" view. Each button displays an icon and a short
 * label and reveals a longer description on hover via a tooltip. The
 * currently active mode is visually distinguished to provide immediate
 * feedback. Clicking a button invokes the supplied callback with the
 * corresponding mode identifier.
 */

export interface QuickModeSwitchProps {
  /** The identifier of the currently active learning mode. */
  activeMode: string;
  /** Called when the user selects a different learning mode. */
  onModeChange: (mode: string) => void;
}

/**
 * Definition of a single mode for quick switching.  Each entry includes an
 * identifier, an icon component from lucide-react, a short label and a
 * tooltip explaining the mode's purpose.  See `modes` below for concrete
 * values.
 */
interface ModeDef {
  id: string;
  icon: React.ElementType;
  label: string;
  tooltip: string;
}

/**
 * A single button used by QuickModeSwitch.  Because tooltip triggers must
 * forward refs, this component wraps a Button and attaches the ref to
 * satisfy React.forwardRef requirements.  The button changes appearance
 * depending on whether it is the active mode.
 */
interface QuickModeButtonProps {
  mode: ModeDef;
  isActive: boolean;
  onClick: () => void;
}

const QuickModeButton = React.forwardRef<HTMLButtonElement, QuickModeButtonProps>(
  ({ mode, isActive, onClick }, ref) => {
    const Icon = mode.icon;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant={isActive ? 'default' : 'outline'}
            size="icon"
            className="flex flex-col items-center justify-center w-16 h-16"
            onClick={onClick}
            aria-label={mode.label}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium leading-none">{mode.label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">
          <strong className="block mb-1">{mode.label}</strong>
          <span>{mode.tooltip}</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);
QuickModeButton.displayName = 'QuickModeButton';

/**
 * QuickModeSwitch component implementation.  It renders a horizontal row
 * of quick switch buttons.  The buttons are separated by small gaps and
 * wrap on small screens.  On larger screens the row remains compact.  The
 * parent component is responsible for positioning this element within the
 * layout.
 */
export function QuickModeSwitch({ activeMode, onModeChange }: QuickModeSwitchProps): JSX.Element {
  const modes: ModeDef[] = [
    {
      id: 'standard',
      icon: BookOpen,
      label: 'Text',
      tooltip: 'Traditional reading mode – ideal for focused, linear learning and note‑taking',
    },
    {
      id: 'speech',
      icon: Volume2,
      label: 'Audio',
      tooltip: 'Text‑to‑speech mode – great for multitasking, auditory learners and reducing eye strain',
    },
    {
      id: 'visual',
      icon: Eye,
      label: 'Visual',
      tooltip: 'Visual diagram mode – perfect for understanding complex relationships and spatial concepts',
    },
    {
      id: 'quiz',
      icon: HelpCircle,
      label: 'Quiz',
      tooltip: 'Interactive quiz mode – proven to improve retention and identify knowledge gaps',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {modes.map(mode => (
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