import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MessageSquare, 
  Shield, 
  Users, 
  CheckCircle, 
  Heart,
  Brain,
  Smartphone,
  Lock,
  Play,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import NLPTaskProcessor from './components/NLPTaskProcessor';
import CaregiverDashboard from './components/CaregiverDashboard';
import { ExtractedTask, TaskDatabase } from './services/nlpService';

function App() {
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, text: "Take morning medication at 9 AM", completed: false },
    { id: 2, text: "Call Sarah about lunch plans", completed: true },
    { id: 3, text: "Water the plants in the living room", completed: false }
  ]);

  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'simple' | 'nlp' | 'caregiver'>('simple');
  const [summary, setSummary] = useState('');
  const [originalInput, setOriginalInput] = useState('');

  const taskDB = new TaskDatabase();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setNewTask(prev => prev + finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const addTask = () => {
    if (newTask.trim()) {
      setDemoTasks([...demoTasks, { 
        id: Date.now(), 
        text: newTask.trim(), 
        completed: false 
      }]);
      setNewTask("");
    }
  };

  const toggleTask = (id: number) => {
    setDemoTasks(demoTasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setDemoTasks(demoTasks.filter(task => task.id !== id));
  };

  const toggleListening = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please type your task instead.');
      return;
    }

    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartDemo = () => {
    scrollToSection('demo');
  };

  const handleLearnMore = () => {
    scrollToSection('how-it-works');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTask();
    }
  };

  const handleExtracted = ({ tasks, summary, originalInput }: { tasks: ExtractedTask[]; summary: string; originalInput: string }) => {
    setExtractedTasks(prev => [...prev, ...tasks]);
    setSummary(summary);
    setOriginalInput(originalInput);
    setActiveTab('caregiver');
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<ExtractedTask>) => {
    setExtractedTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const handleTaskDelete = (taskId: string) => {
    setExtractedTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleTaskAdd = (newTask: Omit<ExtractedTask, 'id'>) => {
    const task: ExtractedTask = {
      ...newTask,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    setExtractedTasks(prev => [...prev, task]);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm fixed w-full top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">EchoCare</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('demo')}
                className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Demo
              </button>
            </nav>
            <button 
              onClick={handleStartDemo}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                Now with AI-Powered Task Extraction
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              EchoCare – <span className="text-blue-600">Speak.</span>
              <br />
              <span className="text-teal-600">Remember.</span> <span className="text-orange-600">Live Freely.</span>
            </h1>
            
            {/* Dementia Statistics Banner */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Heart className="h-6 w-6 text-red-600" />
                <span className="text-red-800 font-semibold text-lg">The Challenge We're Addressing</span>
              </div>
              <p className="text-xl text-red-700 font-medium leading-relaxed">
                Over 55 million people live with dementia — and counting. EchoCare is here to help.
              </p>
            </div>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Simply share your thoughts naturally, and let our intelligent system organize your entire day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleStartDemo}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-medium text-lg shadow-lg flex items-center justify-center gap-2"
              >
                <Brain className="h-5 w-5" />
                Try AI Demo Now
              </button>
              <button 
                onClick={handleLearnMore}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all font-medium text-lg"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced AI transforms natural conversation into organized, actionable daily tasks
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Natural Input</h3>
              <p className="text-gray-600">
                Patient shares their full day's thoughts, memories, and needs in natural conversation - no structure required
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. AI Processing</h3>
              <p className="text-gray-600">
                Advanced NLP identifies individual tasks, categorizes by priority, and extracts time contexts automatically
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Caregiver Review</h3>
              <p className="text-gray-600">
                Trusted caregivers review AI-extracted tasks, make adjustments, and add additional support as needed
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Smart Completion</h3>
              <p className="text-gray-600">
                Organized task lists with reminders and progress tracking help maintain daily independence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful AI Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced natural language processing designed specifically for dementia care
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">NLP Task Extraction</h3>
              <p className="text-gray-600">
                Advanced AI processes entire paragraphs of natural speech, identifying and extracting individual actionable tasks automatically.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Mic className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Speech-to-Text</h3>
              <p className="text-gray-600">
                Advanced voice recognition that understands natural speech patterns and converts long conversations into structured text.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Prioritization</h3>
              <p className="text-gray-600">
                AI automatically categorizes tasks by priority, type, and urgency, ensuring critical activities are never missed.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Caregiver Dashboard</h3>
              <p className="text-gray-600">
                Comprehensive interface for family members and professional caregivers to monitor, edit, and enhance AI-generated task lists.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Context Understanding</h3>
              <p className="text-gray-600">
                AI understands time contexts, relationships, and personal preferences to create meaningful, personalized task lists.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Lock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy & Security</h3>
              <p className="text-gray-600">
                All AI processing respects privacy with secure data handling and optional local processing for sensitive information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Experience EchoCare AI</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Try our advanced AI task extraction system with real examples
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('simple')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'simple'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Simple Demo
              </button>
              <button
                onClick={() => setActiveTab('nlp')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'nlp'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Processor
                </div>
              </button>
              <button
                onClick={() => setActiveTab('caregiver')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'caregiver'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Caregiver View
                  {extractedTasks.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {extractedTasks.length}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'simple' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Input Section */}
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-8 rounded-xl">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Quick Task Entry</h3>
                
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Try saying: 'I need to remember to take my medication at 2 PM and call my daughter later today...'"
                      className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
                    />
                    {isListening && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm animate-pulse">
                        Listening...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={toggleListening}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${
                        isListening 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } ${!speechSupported ? 'opacity-75' : ''}`}
                    >
                      <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
                      {isListening ? 'Stop Listening' : 'Start Speaking'}
                    </button>
                    
                    <button
                      onClick={addTask}
                      disabled={!newTask.trim()}
                      className="bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-5 w-5" />
                      Add Task
                    </button>
                  </div>
                  
                  {!speechSupported && (
                    <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                      Speech recognition is not supported in your browser. Please type your tasks instead.
                    </p>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Try the AI Processor</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      For advanced task extraction from full conversations, switch to the AI Processor tab above.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* To-Do List Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">Simple To-Do List</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {demoTasks.filter(t => !t.completed).length} remaining
                  </span>
                </div>
                
                <div className="space-y-3">
                  {demoTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                        task.completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {task.completed && <CheckCircle className="h-4 w-4" />}
                      </button>
                      
                      <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.text}
                      </span>
                      
                      <div className="flex gap-1">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nlp' && (
            <NLPTaskProcessor onExtracted={handleExtracted} />
          )}

          {activeTab === 'caregiver' && (
            <CaregiverDashboard
              tasks={extractedTasks}
              summary={summary}
              originalInput={originalInput}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskAdd={handleTaskAdd}
            />
          )}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Advanced AI Technology Stack</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enterprise-grade AI and healthcare technology for reliable, secure dementia care
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { name: 'OpenAI GPT', desc: 'NLP Processing' },
              { name: 'React.js', desc: 'Frontend Framework' },
              { name: 'Node.js', desc: 'Backend Runtime' },
              { name: 'MongoDB', desc: 'Task Database' },
              { name: 'Web Speech API', desc: 'Voice Recognition' },
              { name: 'HIPAA Compliant', desc: 'Healthcare Security' }
            ].map((tech, index) => (
              <div key={index} className="text-center">
                <div className="bg-white w-16 h-16 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <span className="text-2xl font-bold text-blue-600">{tech.name[0]}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                <p className="text-sm text-gray-600">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience AI-Powered Care?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families who trust EchoCare's advanced AI to provide dignified, independent living for their loved ones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleStartDemo}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 font-medium text-lg shadow-lg flex items-center justify-center gap-2"
            >
              <Brain className="h-5 w-5" />
              Start AI Demo
            </button>
            <button 
              onClick={() => scrollToSection('demo')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all font-medium text-lg"
            >
              Schedule Demo
            </button>
          </div>
          <p className="text-blue-100 mt-6 text-sm">
            Free 30-day trial • No credit card required • HIPAA compliant • AI-powered
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">EchoCare</span>
              </div>
              <p className="text-gray-400">
                Empowering independence through compassionate AI technology.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">AI Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><button onClick={() => scrollToSection('demo')} className="hover:text-white transition-colors">AI Demo</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EchoCare. All rights reserved. Built with AI for those who care.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;