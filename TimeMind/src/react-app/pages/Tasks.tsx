import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import Layout from "@/react-app/components/Layout";
import TaskCard from "@/react-app/components/TaskCard";
import TaskModal from "@/react-app/components/TaskModal";
import { TaskType, CreateTaskType } from "@/shared/types";
import { useLanguage } from "@/react-app/hooks/useLanguage";
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";

export default function Tasks() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: CreateTaskType) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      
      if (response.ok) {
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleEditTask = async (taskData: CreateTaskType) => {
    if (!editingTask) return;
    
    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
        setEditingTask(null);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleToggleComplete = async (taskId: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: completed }),
      });
      
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const openEditModal = (task: TaskType) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === null || task.priority === filterPriority;
    const matchesSubject = !filterSubject || task.subject?.toLowerCase().includes(filterSubject.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && task.is_completed) ||
                         (filterStatus === 'pending' && !task.is_completed);

    return matchesSearch && matchesPriority && matchesSubject && matchesStatus;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.is_completed).length,
    pending: tasks.filter(t => !t.is_completed).length,
    urgent: tasks.filter(t => t.priority >= 4 && !t.is_completed).length,
  };

  const subjects = [...new Set(tasks.map(t => t.subject).filter(Boolean))];

  if (isPending || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Clock className="w-8 h-8 animate-spin text-pink-600 dark:text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {t('tasks.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('tasks.subtitle')}
            </p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 dark:from-blue-600 dark:to-indigo-600 text-white font-medium hover:from-pink-600 hover:to-rose-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <Plus className="w-5 h-5 ml-2" />
            {t('tasks.addTask')}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-blue-100 dark:to-indigo-100 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-pink-600 dark:text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('tasks.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('tasks.stats.completed')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('tasks.stats.pending')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('tasks.stats.urgent')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.urgent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-pink-200/50 dark:border-blue-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('tasks.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500"
            >
              <option value="all">{t('tasks.filter.allStatus')}</option>
              <option value="pending">{t('tasks.filter.pending')}</option>
              <option value="completed">{t('tasks.filter.completed')}</option>
            </select>

            <select
              value={filterPriority || ''}
              onChange={(e) => setFilterPriority(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500"
            >
              <option value="">{t('tasks.filter.allPriorities')}</option>
              <option value="5">{t('priority.urgent')}</option>
              <option value="4">{t('priority.high')}</option>
              <option value="3">{t('priority.medium')}</option>
              <option value="2">{t('priority.low')}</option>
              <option value="1">{t('priority.veryLow')}</option>
            </select>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 dark:focus:ring-blue-500"
            >
              <option value="">{t('tasks.filter.allSubjects')}</option>
              {subjects.map(subject => (
                <option key={subject} value={subject || ''}>{subject}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilterPriority(null);
                setFilterSubject('');
                setFilterStatus('all');
              }}
              className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Filter className="w-5 h-5 mx-auto" />
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {tasks.length === 0 ? t('tasks.noTasks') : t('tasks.noMatch')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {tasks.length === 0 
                  ? t('tasks.noTasksDescription')
                  : t('tasks.noMatchDescription')
                }
              </p>
              {tasks.length === 0 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 dark:from-blue-600 dark:to-indigo-600 text-white font-medium hover:from-pink-600 hover:to-rose-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 transition-all"
                >
                  <Plus className="w-5 h-5 ml-2" />
                  {t('tasks.addFirstTask')}
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </div>

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={editingTask ? handleEditTask : handleCreateTask}
        />
      </div>
    </Layout>
  );
}
