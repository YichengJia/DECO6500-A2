import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface CurrentTaskProps {
  task: Task | null;
  onComplete: (taskId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  queuePosition: number;
  totalTasks: number;
}

export function CurrentTask({ 
  task, 
  onComplete, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious, 
  queuePosition, 
  totalTasks 
}: CurrentTaskProps) {
  if (!task) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <Circle className="w-16 h-16 mx-auto text-muted-foreground" />
          <div>
            <h2>No tasks in queue</h2>
            <p className="text-muted-foreground">Add a task to get started with focused work!</p>
          </div>
        </div>
      </Card>
    );
  }

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            Task {queuePosition} of {totalTasks}
          </Badge>
          <Badge className={priorityColors[task.priority]}>
            {task.priority} priority
          </Badge>
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl">{task.title}</h1>
          {task.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">{task.description}</p>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={() => onComplete(task.id)}
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Complete Task
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <Button 
            onClick={onPrevious} 
            disabled={!hasPrevious}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button 
            onClick={onNext} 
            disabled={!hasNext}
            variant="outline"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
}