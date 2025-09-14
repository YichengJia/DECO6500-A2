import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { ZoomIn, ZoomOut, RotateCcw, Eye } from 'lucide-react';
import { useLearning } from './LearningContext';

/**
 * VisualDiagramMode
 *
 * This component renders an interactive diagram of a eukaryotic cell.  Users
 * can zoom in and out, reset the view and select individual organelles to
 * reveal details about their structure and function.  Time spent exploring
 * the diagram contributes to visual learning progress.
 */

interface Organelle {
  id: string;
  name: string;
  description: string;
  color: string;
  x: number;
  y: number;
}

// Define the organelles and their positions within the diagram.  The
// coordinates are percentages relative to the container size.
const organelles: Organelle[] = [
  {
    id: 'membrane',
    name: 'Cell Membrane',
    description:
      'Controls what enters and exits the cell. Composed of a phospholipid bilayer with embedded proteins.',
    color: 'bg-green-500',
    x: 50,
    y: 50,
  },
  {
    id: 'nucleus',
    name: 'Nucleus',
    description:
      'Contains genetic material and controls cellular activities. Surrounded by a nuclear envelope with pores.',
    color: 'bg-blue-500',
    x: 30,
    y: 40,
  },
  {
    id: 'mitochondria',
    name: 'Mitochondrion',
    description:
      'Powerhouse of the cell. Produces ATP through cellular respiration. Has an inner membrane folded into cristae.',
    color: 'bg-red-500',
    x: 70,
    y: 60,
  },
  {
    id: 'cytoplasm',
    name: 'Cytoplasm',
    description:
      'Gel‑like substance filling the cell. Site of many metabolic reactions and houses organelles.',
    color: 'bg-yellow-500',
    x: 55,
    y: 30,
  },
];

export function VisualDiagramMode(): JSX.Element {
  const { readingProgress, updateProgress } = useLearning();
  const [selected, setSelected] = useState<Organelle | null>(null);
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const diagramRef = useRef<HTMLDivElement>(null);

  // Track time spent on the visual mode
  useEffect(() => {
    const interval = setInterval(() => {
      updateProgress('visual', { viewTime: readingProgress.visual.viewTime + 1 });
    }, 1000);
    return () => clearInterval(interval);
  }, [readingProgress.visual.viewTime, updateProgress]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setSelected(null);
    updateProgress('visual', { currentDiagram: 0 });
  };

  /**
   * When an organelle is selected, update the currentDiagram index in the
   * context and store the selected organelle in local state.  Selecting
   * the same organelle again deselects it.
   */
  const handleSelect = (org: Organelle) => {
    if (selected && selected.id === org.id) {
      setSelected(null);
      updateProgress('visual', { currentDiagram: 0 });
    } else {
      setSelected(org);
      // Use index + 1 to avoid 0 which represents no selection
      const idx = organelles.findIndex(o => o.id === org.id) + 1;
      updateProgress('visual', { currentDiagram: idx });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Diagram Area */}
      <Card className="relative flex-1 p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Eye className="w-5 h-5" /> <span>Visual Diagram Mode</span>
          </h2>
          <div className="flex space-x-2">
            <Button size="icon" variant="secondary" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Interactive canvas */}
        <div
          ref={diagramRef}
          className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-100 border border-gray-200 rounded-md overflow-hidden"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {organelles.map(org => (
            <button
              key={org.id}
              onClick={() => handleSelect(org)}
              style={{
                position: 'absolute',
                left: `${org.x}%`,
                top: `${org.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`w-10 h-10 rounded-full opacity-80 hover:opacity-100 focus:outline-none ${
                selected?.id === org.id ? 'ring-4 ring-blue-500' : ''
              } ${org.color}`}
              title={org.name}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">Click an organelle to learn more.</p>
        <p className="text-sm text-gray-500">Zoom: {Math.round(zoom * 100)}%</p>
      </Card>
      {/* Details Panel */}
      <Card className="w-full lg:w-1/3 p-4 space-y-4">
        {selected ? (
          <>
            <h3 className="text-lg font-semibold">{selected.name}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{selected.description}</p>
            {/* Example: provide additional contextual details for each organelle */}
            {selected.id === 'nucleus' && (
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>Stores DNA and controls gene expression.</li>
                <li>Surrounded by a double membrane with nuclear pores.</li>
                <li>Contains the nucleolus where ribosomes are assembled.</li>
              </ul>
            )}
            {selected.id === 'mitochondria' && (
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>Site of oxidative phosphorylation and ATP production.</li>
                <li>Has its own genome and replicates independently of the cell.</li>
                <li>Thought to have arisen from endosymbiosis of bacteria.</li>
              </ul>
            )}
            {selected.id === 'membrane' && (
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>Composed of a phospholipid bilayer with embedded proteins.</li>
                <li>Regulates transport and communication with the environment.</li>
                <li>Fluid and dynamic, allowing lateral movement of components.</li>
              </ul>
            )}
            {selected.id === 'cytoplasm' && (
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>Contains cytosol, organelles and cytoskeletal elements.</li>
                <li>Site of metabolic pathways such as glycolysis.</li>
                <li>Supports cell shape and facilitates intracellular transport.</li>
              </ul>
            )}
          </>
        ) : (
          <div className="text-gray-500 text-sm">
            <p>Select an organelle from the diagram to view its details. Use the zoom controls to explore the diagram in more detail.</p>
            <p className="mt-2">Time spent exploring contributes to your visual learning progress.</p>
          </div>
        )}
        {/* Progress indicator for visual mode */}
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Viewed Diagrams: {readingProgress.visual.currentDiagram}/{organelles.length}
          </p>
          <p className="text-sm text-gray-500">
            Time Spent: {Math.floor(readingProgress.visual.viewTime / 60)}m{' '}
            {readingProgress.visual.viewTime % 60}s
          </p>
        </div>
      </Card>
    </div>
  );
}