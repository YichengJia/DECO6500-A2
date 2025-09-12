import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface TaskQueueProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
}

export function TaskQueue({ tasks, onAddTask, onDeleteTask, onReorderTasks }: TaskQueueProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      onAddTask({
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
        priority: newTask.priority
      });
      setNewTask({ title: '', description: '', priority: 'medium' });
      setIsAddingTask(false);
    }
  };

  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Task Queue ({incompleteTasks.length} remaining)</h2>
        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What do you need to focus on?"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Any additional details..."
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setNewTask(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddTask} className="flex-1">Add Task</Button>
                <Button variant="outline" onClick={() => setIsAddingTask(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h3>Upcoming Tasks</h3>
        {incompleteTasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No tasks in queue. Add one to get started!</p>
        ) : (
          incompleteTasks.map((task, index) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span>#{index + 1}</span>
                      <h4>{task.title}</h4>
                      <Badge className={priorityColors[task.priority]}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteTask(task.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h3>Completed Tasks ({completedTasks.length})</h3>
          {completedTasks.map((task) => (
            <Card key={task.id} className="p-4 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="line-through">{task.title}</h4>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-through">{task.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}