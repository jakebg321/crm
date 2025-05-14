import { useState, useRef } from 'react';
import { format, addDays, parseISO, differenceInMilliseconds } from 'date-fns';
import { ExtendedJob } from '../utils/scheduleHelpers';

interface DragState {
  isDragging: boolean;
  draggedJob: ExtendedJob | null;
  dragStartTime: number;
  dragStartPosition: { x: number; y: number } | null;
}

interface DragProps {
  onDragStart: (job: ExtendedJob, event: React.MouseEvent) => void;
  onDragEnd: (event: React.MouseEvent) => void;
  onDrop: (date: Date, employeeId?: string) => void;
  isDragging: boolean;
  draggedJob: ExtendedJob | null;
}

export const useDragDrop = (
  updateJob: (id: string, data: any) => Promise<ExtendedJob | null>
): DragProps => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedJob: null,
    dragStartTime: 0,
    dragStartPosition: null,
  });

  // Store last mouseup position reference to detect drag vs. click
  const lastMouseUpPos = useRef<{ x: number; y: number } | null>(null);
  
  const onDragStart = (job: ExtendedJob, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Store the job and starting position
    setDragState({
      isDragging: true,
      draggedJob: job,
      dragStartTime: Date.now(),
      dragStartPosition: { x: event.clientX, y: event.clientY },
    });
    
    // Apply CSS indicating dragging state
    const target = event.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
    
    // Add global event listeners for the drag operation
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (event: MouseEvent) => {
    // This is just to update any visual feedback - the actual element is
    // not moved during drag as we're using the drop zone pattern
  };
  
  const handleMouseUp = (event: MouseEvent) => {
    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Store the mouseup position to compare with mousedown (dragStartPosition)
    lastMouseUpPos.current = { x: event.clientX, y: event.clientY };
    
    // Reset dragged element visual state
    const draggedElements = document.querySelectorAll('.dragging');
    draggedElements.forEach((el) => {
      (el as HTMLElement).style.opacity = '1';
    });
    
    // Check if this was a genuine drag or just a click
    // Drag operation's end is handled by onDragEnd, which should be called from the component
  };
  
  const onDragEnd = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Reset drag state
    setDragState({
      isDragging: false,
      draggedJob: null,
      dragStartTime: 0,
      dragStartPosition: null,
    });
    
    // Restore opacity of the dragged item if needed
    const target = event.currentTarget as HTMLElement;
    target.style.opacity = '1';
  };
  
  const onDrop = async (targetDate: Date, employeeId?: string) => {
    const { draggedJob } = dragState;
    
    // If there's no job being dragged, or it's not a significant drag, exit
    if (!draggedJob || !lastMouseUpPos.current || !dragState.dragStartPosition) {
      return;
    }
    
    // Check if this was a genuine drag or just a click
    const dx = lastMouseUpPos.current.x - dragState.dragStartPosition.x;
    const dy = lastMouseUpPos.current.y - dragState.dragStartPosition.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    
    // If the drag distance is too small, consider it a click, not a drag
    if (dragDistance < 5) {
      return;
    }
    
    // At this point we have a genuine drag operation
    
    // If the job doesn't have a start date, we can't calculate the time
    if (!draggedJob.startDate) {
      return;
    }
    
    // Get original date and time
    const originalDate = parseISO(draggedJob.startDate);
    
    // Format just the time portion from the original date
    const originalTime = format(originalDate, 'HH:mm:ss');
    
    // Create new date with original time
    const newDateStr = `${format(targetDate, 'yyyy-MM-dd')}T${originalTime}`;
    const newDate = parseISO(newDateStr);
    
    // If there's an end date, adjust it by the same amount
    let newEndDate = null;
    if (draggedJob.endDate) {
      const originalEndDate = parseISO(draggedJob.endDate);
      const timeDiff = differenceInMilliseconds(originalEndDate, originalDate);
      newEndDate = new Date(newDate.getTime() + timeDiff);
    }
    
    // Prepare the update data
    const updateData: any = {
      startDate: newDate.toISOString(),
      ...(newEndDate && { endDate: newEndDate.toISOString() }),
      // If employeeId is provided, update the assigned employee
      ...(employeeId && { assignedToId: employeeId }),
    };
    
    // Update the job
    try {
      await updateJob(draggedJob.id, updateData);
    } catch (error) {
      console.error("Error updating job after drag:", error);
    }
    
    // Reset drag state
    setDragState({
      isDragging: false,
      draggedJob: null,
      dragStartTime: 0,
      dragStartPosition: null,
    });
  };
  
  return {
    onDragStart,
    onDragEnd,
    onDrop,
    isDragging: dragState.isDragging,
    draggedJob: dragState.draggedJob,
  };
}; 