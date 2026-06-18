import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '../utils/format'

export const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) => set((state) => ({
        tasks: [
          ...state.tasks,
          {
            id: generateId(),
            title: task.title,
            estimatedPomodoros: task.estimatedPomodoros || 1,
            completedPomodoros: 0,
            project: task.project || '',
            priority: task.priority || 'medium',
            status: 'todo',
            archived: false,
            createdAt: Date.now(),
            order: state.tasks.filter((t) => !t.archived).length
          }
        ]
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        )
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),

      archiveTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, archived: true, status: 'todo' } : t
        )
      })),

      incrementPomodoro: (id) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id
            ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
            : t
        )
      })),

      startTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) => {
          if (t.status === 'inProgress') return { ...t, status: 'todo' }
          if (t.id === id) return { ...t, status: 'inProgress' }
          return t
        })
      })),

      completeTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, status: 'done' } : t
        )
      })),

      reorderTasks: (statusGroup, oldIndex, newIndex) => set((state) => {
        const grouped = state.tasks
          .filter((t) => !t.archived && t.status === statusGroup)
          .sort((a, b) => a.order - b.order)

        const [moved] = grouped.splice(oldIndex, 1)
        grouped.splice(newIndex, 0, moved)

        const reorderedIds = grouped.map((t) => t.id)
        const otherTasks = state.tasks.filter(
          (t) => t.archived || t.status !== statusGroup
        )

        const updatedGrouped = grouped.map((t, i) => ({
          ...t,
          order: i
        }))

        return { tasks: [...otherTasks, ...updatedGrouped] }
      }),

      getActiveTask: () => {
        return get().tasks.find((t) => t.status === 'inProgress' && !t.archived)
      },

      getVisibleTasks: () => {
        return get().tasks.filter((t) => !t.archived)
      }
    }),
    {
      name: 'pomodoro-tasks'
    }
  )
)
