import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTaskStore } from '../stores/useTaskStore'
import './TaskItem.css'

const PRIORITY_LABELS = { high: '高', medium: '中', low: '低' }

export default function TaskItem({ task, onEdit }) {
  const { startTask, completeTask, archiveTask, deleteTask } = useTaskStore()

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const handleStart = () => {
    startTask(task.id)
  }

  const handleComplete = () => {
    completeTask(task.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-item priority-${task.priority} status-${task.status}`}
    >
      <div className="task-drag-handle" {...attributes} {...listeners}>
        ⠿
      </div>

      <div className="task-content">
        <div className="task-header">
          <span className="task-title">{task.title}</span>
          {task.project && (
            <span className="task-project">{task.project}</span>
          )}
        </div>
        <div className="task-meta">
          <span className="task-pomodoros">
            🍅 {task.completedPomodoros}/{task.estimatedPomodoros}
          </span>
          <span className={`task-priority priority-${task.priority}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
      </div>

      <div className="task-actions">
        {task.status === 'todo' && (
          <button className="btn-icon" onClick={handleStart} title="开始">
            ▶
          </button>
        )}
        {task.status === 'inProgress' && (
          <button className="btn-icon" onClick={handleComplete} title="完成">
            ✓
          </button>
        )}
        <button className="btn-icon" onClick={() => onEdit(task)} title="编辑">
          ✎
        </button>
        <button className="btn-icon" onClick={() => archiveTask(task.id)} title="归档">
          📦
        </button>
        <button
          className="btn-icon btn-danger"
          onClick={() => {
            if (window.confirm(`确认删除「${task.title}」？`)) {
              deleteTask(task.id)
            }
          }}
          title="删除"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
