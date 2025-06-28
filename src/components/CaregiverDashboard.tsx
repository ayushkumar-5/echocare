import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Edit3, 
  Trash2, 
  Plus, 
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  MessageSquare,
  Brain,
  ChevronLeft,
  ChevronRight,
  Phone,
  Heart,
  Shield
} from 'lucide-react';
import { ExtractedTask, TaskDatabase } from '../services/nlpService';

interface CaregiverDashboardProps {
  tasks: ExtractedTask[];
  summary?: string;
  originalInput?: string;
  onTaskUpdate: (taskId: string, updates: Partial<ExtractedTask>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskAdd: (task: Omit<ExtractedTask, 'id'>) => void;
}

const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  tasks,
  summary,
  originalInput,
  onTaskUpdate,
  onTaskDelete,
  onTaskAdd
}) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'pending' | 'completed' | 'calendar'>('all');
  const [showOriginalText, setShowOriginalText] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Emergency contacts - these could be made configurable
  const emergencyContacts = [
    { name: 'Emergency Services', number: '911', type: 'emergency', icon: <AlertTriangle className="h-4 w-4" /> },
    { name: 'Primary Doctor', number: '(555) 123-4567', type: 'medical', icon: <Heart className="h-4 w-4" /> },
    { name: 'Family Member', number: '(555) 987-6543', type: 'family', icon: <Users className="h-4 w-4" /> },
    { name: 'Pharmacy', number: '(555) 456-7890', type: 'medical', icon: <Shield className="h-4 w-4" /> }
  ];

  const handleEmergencyCall = (contact: typeof emergencyContacts[0]) => {
    if (contact.type === 'emergency') {
      window.open(`tel:${contact.number}`, '_self');
    } else {
      // For non-emergency calls, show confirmation
      if (window.confirm(`Call ${contact.name} at ${contact.number}?`)) {
        window.open(`tel:${contact.number}`, '_self');
      }
    }
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return tasks.filter(task => {
      // Check if task has time context that matches this date
      if (task.timeContext) {
        const timeContext = task.timeContext.toLowerCase();
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (dateStr === today.toDateString()) {
          return timeContext.includes('today') || timeContext.includes('this morning') || 
                 timeContext.includes('this afternoon') || timeContext.includes('tonight');
        } else if (dateStr === tomorrow.toDateString()) {
          return timeContext.includes('tomorrow');
        }
      }
      return false;
    });
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'high': return task.priority === 'high';
      case 'pending': return !task.completed;
      case 'completed': return task.completed;
      case 'calendar': return true; // Calendar view shows all tasks
      default: return true;
    }
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length,
    pending: tasks.filter(t => !t.completed).length
  };

  const handleEditStart = (task: ExtractedTask) => {
    setEditingTask(task.id);
    setEditText(task.text);
  };

  const handleEditSave = (taskId: string) => {
    if (editText.trim()) {
      onTaskUpdate(taskId, { text: editText.trim() });
    }
    setEditingTask(null);
    setEditText('');
  };

  const handleEditCancel = () => {
    setEditingTask(null);
    setEditText('');
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask: Omit<ExtractedTask, 'id'> = {
        text: newTaskText.trim(),
        priority: 'medium',
        category: 'other',
        completed: false,
        extractedFrom: 'Added by caregiver'
      };
      onTaskAdd(newTask);
      setNewTaskText('');
      setShowAddForm(false);
    }
  };

  const getPriorityBadge = (priority: ExtractedTask['priority']) => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return styles[priority];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 w-10 h-10 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Caregiver Dashboard</h3>
            <p className="text-gray-600 text-sm">Manage and monitor daily tasks</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSummary(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Show Summary
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h4 className="text-lg font-semibold text-red-800">🚨 Emergency Contact Section</h4>
        </div>
        <p className="text-red-700 text-sm mb-4">
          Ensure immediate help is accessible for patients or caregivers.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {emergencyContacts.map((contact, index) => (
            <button
              key={index}
              onClick={() => handleEmergencyCall(contact)}
              className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-all ${
                contact.type === 'emergency'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : contact.type === 'medical'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {contact.icon}
              <div className="text-left">
                <div className="font-semibold">{contact.name}</div>
                <div className="text-xs opacity-90">{contact.number}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs text-red-600">
          💡 Tip: Click any contact to call immediately. Emergency services (911) will connect directly.
        </div>
      </div>

      {showSummary && (summary || originalInput) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowSummary(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
            >
              <span className="text-2xl">&times;</span>
            </button>
            
            <h4 className="text-lg font-semibold mb-6 text-purple-700 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              User Input & AI Summary
            </h4>
            
            {originalInput && (
              <div className="mb-6">
                <h5 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Original User Input:
                </h5>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-800 text-base whitespace-pre-line">{originalInput}</p>
                </div>
              </div>
            )}
            
            {summary && (
              <div>
                <h5 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Summary:
                </h5>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-800 text-base whitespace-pre-line">{summary}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{taskStats.total}</div>
          <div className="text-sm text-blue-800">Total Tasks</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
          <div className="text-sm text-green-800">Completed</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">{taskStats.pending}</div>
          <div className="text-sm text-orange-800">Pending</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{taskStats.highPriority}</div>
          <div className="text-sm text-red-800">High Priority</div>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Add New Task</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Enter task description..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <button
              onClick={handleAddTask}
              disabled={!newTaskText.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewTaskText('');
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { key: 'all', label: 'All Tasks', count: taskStats.total },
          { key: 'pending', label: 'Pending', count: taskStats.pending },
          { key: 'high', label: 'High Priority', count: taskStats.highPriority },
          { key: 'completed', label: 'Completed', count: taskStats.completed },
          { key: 'calendar', label: 'Calendar View', count: tasks.length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Calendar View */}
      {filter === 'calendar' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {getMonthName(currentDate)}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
              const days = [];
              
              // Add empty cells for days before the first day of the month
              for (let i = 0; i < startingDay; i++) {
                days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100 bg-gray-50"></div>);
              }
              
              // Add cells for each day of the month
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayTasks = getTasksForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                days.push(
                  <div
                    key={day}
                    className={`h-24 border border-gray-200 p-1 ${
                      isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {day}
                      {isToday && <span className="ml-1 text-blue-600">•</span>}
                    </div>
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {dayTasks.slice(0, 3).map((task, index) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate ${
                            task.completed
                              ? 'bg-green-100 text-green-700 line-through'
                              : task.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                          title={task.text}
                        >
                          {task.text}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              
              return days;
            })()}
          </div>
        </div>
      )}

      {/* Tasks List (when not in calendar view) */}
      {filter !== 'calendar' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tasks match the current filter.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`border rounded-lg p-4 transition-all ${
                  task.completed 
                    ? 'bg-green-50 border-green-200' 
                    : task.priority === 'high'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onTaskUpdate(task.id, { completed: !task.completed })}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="h-4 w-4" />}
                  </button>

                  <div className="flex-1">
                    {editingTask === task.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleEditSave(task.id)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSave(task.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.text}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {task.category}
                            </span>
                          </div>
                        </div>

                        {task.timeContext && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <Clock className="h-4 w-4" />
                            <span>{task.timeContext}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setShowOriginalText(
                              showOriginalText === task.id ? null : task.id
                            )}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            {showOriginalText === task.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            {showOriginalText === task.id ? 'Hide' : 'Show'} original
                          </button>

                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditStart(task)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onTaskDelete(task.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {showOriginalText === task.id && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600 italic">
                              Original: "{task.extractedFrom}"
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CaregiverDashboard;