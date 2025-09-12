import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export function VisualDiagramMode() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  const cellComponents = [
    { id: 'nucleus', name: 'Nucleus', description: 'Contains genetic material and controls cell activities', color: 'bg-blue-500' },
    { id: 'mitochondria', name: 'Mitochondria', description: 'Powerhouse of the cell, produces ATP', color: 'bg-red-500' },
    { id: 'membrane', name: 'Cell Membrane', description: 'Controls what enters and exits the cell', color: 'bg-green-500' },
    { id: 'cytoplasm', name: 'Cytoplasm', description: 'Gel-like substance that fills the cell', color: 'bg-yellow-500' }
  ];

  return (
    <Card className="p-6 bg-white">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Eye className="w-6 h-6 text-purple-600" />
          <div>
            <h3>Visual Diagram Mode</h3>
            <p className="text-sm text-gray-600">Interactive diagrams and visual representations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interactive Diagram */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4>Organelle Function Comparison</h4>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setZoom(100); setSelectedComponent(null); }}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div 
              className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden"
              style={{ height: '300px', transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
            >
              {/* Simplified Cell Diagram */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-48 bg-blue-50 rounded-full border-4 border-green-500">
                  {/* Cell Membrane */}
                  <div 
                    className="absolute inset-0 rounded-full cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => setSelectedComponent('membrane')}
                    title="Cell Membrane"
                  />
                  
                  {/* Nucleus */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                    onClick={() => setSelectedComponent('nucleus')}
                    title="Nucleus"
                  />
                  
                  {/* Mitochondria */}
                  <div 
                    className="absolute top-6 right-6 w-8 h-12 bg-red-500 rounded-lg cursor-pointer hover:bg-red-600 transition-colors"
                    onClick={() => setSelectedComponent('mitochondria')}
                    title="Mitochondria"
                  />
                  
                  {/* Another Mitochondria */}
                  <div 
                    className="absolute bottom-6 left-6 w-8 h-12 bg-red-500 rounded-lg cursor-pointer hover:bg-red-600 transition-colors"
                    onClick={() => setSelectedComponent('mitochondria')}
                    title="Mitochondria"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {cellComponents.map((component) => (
                <Button
                  key={component.id}
                  variant={selectedComponent === component.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedComponent(component.id)}
                  className="flex items-center space-x-2"
                >
                  <div className={`w-3 h-3 rounded-full ${component.color}`} />
                  <span>{component.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Component Information */}
          <div className="space-y-4">
            <h4>Component Details</h4>
            
            {selectedComponent ? (
              <div className="space-y-4">
                {cellComponents
                  .filter(comp => comp.id === selectedComponent)
                  .map((component) => (
                    <Card key={component.id} className="p-4 bg-gray-50">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-4 h-4 rounded-full ${component.color}`} />
                        <h5>{component.name}</h5>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{component.description}</p>
                      
                      {component.id === 'nucleus' && (
                        <div className="space-y-2">
                          <Badge variant="outline">DNA Storage</Badge>
                          <Badge variant="outline">Gene Expression</Badge>
                          <Badge variant="outline">Cell Division Control</Badge>
                        </div>
                      )}
                      
                      {component.id === 'mitochondria' && (
                        <div className="space-y-2">
                          <Badge variant="outline">ATP Production</Badge>
                          <Badge variant="outline">Cellular Respiration</Badge>
                          <Badge variant="outline">Energy Metabolism</Badge>
                        </div>
                      )}
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-600">Click on any component in the diagram to learn more about its function and structure.</p>
              </div>
            )}

            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
              <p className="text-purple-800">
                <strong>Visual Learning Tip:</strong> Use the interactive diagram to explore relationships 
                between different cell components. Visual connections help with memory retention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}