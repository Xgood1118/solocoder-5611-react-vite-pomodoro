import { useState } from 'react'
import {
  DndContext, closestCenter,
  PointerSensor, KeyboardSensor, useSensor, useSensors
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove
} from '@dnd-kit/sortable'
import { useTaskStore } from '../stores/useTaskStore'
import TaskItem from './TaskItem'
import './TaskList.css'

const STATUS_GROUPS = [
  { key: 'inProgress', label: '进行中' },
  { key: 'todo', label: '待办' },
  { key: 'done', label: '已完成' }
]

function TaskForm({ onSubmit, initial, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [estimatedPomodoros, setEstimated] = useState(initial?.estimatedPomodoros || 1)
  const [project, setProject] = useState(initial?.project || '')
  const [priority, setPriority] = useState(initial?.priority || 'medium')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), estimatedPomodoros, project: project.trim(), priority })
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        className="input"
        placeholder="任务标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <div className="task-form-row">
        <label className="task-form-label">
          预计🍅
          <input
            className="input input-sm"
            type="number"
            min="1"
            max="20"
            value={estimatedPomodoros}
            onChange={(e) => setEstimated(Number(e.target.value))}
          />
        </label>
        <label className="task-form-label">
          项目
          <input
            className="input input-sm"
            placeholder="项目名"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          />
        </label>
        <label className="task-form-label">
          优先级
          <select
            className="input input-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </label>
      </div>
      <div className="task-form-actions">
        <button className="btn btn-primary btn-sm" type="submit">
          {initial ? '保存' : '添加'}
        </button>
        {onCancel && (
          <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel}>
            取消
          </button>
        )}
      </div>
    </form>
  )
}

export default function TaskList() {
  const tasks = useTaskStore((s) => s.tasks)
  const addTask = useTaskStore((s) => s.addTask)
  const updateTask = useTaskStore((s) => s.updateTask)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const visibleTasks = tasks.filter((t) => !t.archived)

  const groupedTasks = STATUS_GROUPS.map((group) => ({
    ...group,
    tasks: visibleTasks
      .filter((t) => t.status === group.key)
      .sort((a, b) => a.order - b.order)
  }))

  const handleDragEnd = (event, statusGroup) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const groupTasks = visibleTasks
      .filter((t) => t.status === statusGroup)
      .sort((a, b) => a.order - b.order)
    const oldIndex = groupTasks.findIndex((t) => t.id === active.id)
    const newIndex = groupTasks.findIndex((t) => t.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(groupTasks, oldIndex, newIndex)
    reordered.forEach((t, i) => {
      updateTask(t.id, { order: i })
    })
  }

  const handleEdit = (task) => {
    setEditingTask(task)
  }

  const handleEditSubmit = (data) => {
    updateTask(editingTask.id, data)
    setEditingTask(null)
  }

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>任务</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '取消' : '+ 添加任务'}
        </button>
      </div>

      {showForm && (
        <TaskForm
          onSubmit={(data) => {
            addTask(data)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>编辑任务</h3>
            <TaskForm
              initial={editingTask}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        </div>
      )}

      {groupedTasks.map((group) => (
        <div key={group.key} className="task-group">
          <div className="task-group-header">
            <span className="task-group-label">{group.label}</span>
            <span className="task-group-count">{group.tasks.length}</span>
          </div>
          {group.tasks.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event, group.key)}
            >
              <SortableContext
                items={group.tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="task-group-list">
                  {group.tasks.map((task) => (
                    <TaskItem key={task.id} task={task} onEdit={handleEdit} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="task-group-empty">暂无任务</div>
          )}
        </div>
      ))}
    </div>
  )
}
