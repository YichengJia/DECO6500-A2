import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { BookOpen, ArrowRight } from 'lucide-react';

export function StandardTextMode() {
  return (
    <Card className="p-6 bg-white">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <div>
            <h3>Standard Text Mode</h3>
            <p className="text-sm text-gray-600">Traditional reading experience with clear formatting</p>
          </div>
        </div>

        <div className="prose max-w-none">
          <h4>Cell Membrane: Structure and Function</h4>
          
          <p>
            The cell membrane is composed of a phospholipid bilayer with selective permeability, 
            controlling the movement of substances in and out of the cell. This double layer of 
            phospholipids creates a barrier that separates the interior of the cell from the 
            external environment.
          </p>

          <p>
            <strong>Key Components:</strong>
          </p>
          <ul className="space-y-2">
            <li><strong>Phospholipids:</strong> Form the basic structure with hydrophilic heads and hydrophobic tails</li>
            <li><strong>Proteins:</strong> Embedded within the membrane for transport and signaling</li>
            <li><strong>Cholesterol:</strong> Helps maintain membrane fluidity</li>
            <li><strong>Carbohydrates:</strong> Attached to proteins and lipids for cell recognition</li>
          </ul>

          <p>
            Proteins in the membrane are involved in signal transduction, transport, and recognition. 
            These proteins can be integral (spanning the entire membrane) or peripheral (attached 
            to one side of the membrane).
          </p>

          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 my-4">
            <p className="text-blue-800">
              <strong>ADHD Learning Tip:</strong> Break down complex concepts into smaller chunks. 
              Focus on one component at a time before moving to the next.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Progress: 2/10 sections</span>
            <Progress value={20} className="w-32 h-2" />
          </div>
          <Button className="flex items-center space-x-2">
            <span>Continue Reading</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}