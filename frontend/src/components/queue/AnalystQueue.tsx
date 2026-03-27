import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import type { Task } from '../../types/task';
import QueueCard from './QueueCard';

interface AnalystQueueProps {
  analystName: string;
  tasks: Task[];
  loading: boolean;
  onReorder: (taskIds: string[]) => void;
  onSetTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function AnalystQueue({ analystName, tasks, loading, onReorder, onSetTasks }: AnalystQueueProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    const reordered = arrayMove(tasks, oldIndex, newIndex);
    onSetTasks(reordered);
    onReorder(reordered.map((t) => t.id));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (tasks.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Nenhuma tarefa ativa na fila de {analystName}.
        </Typography>
      </Box>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <Box>
          {tasks.map((task, index) => (
            <QueueCard key={task.id} task={task} index={index} />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
}
