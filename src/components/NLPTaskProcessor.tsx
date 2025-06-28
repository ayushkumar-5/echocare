import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  User,
  Calendar,
  Home,
  Phone,
  Pill,
  MoreHorizontal,
  Mic,
  MicOff
} from 'lucide-react';
import { NLPTaskExtractor, ExtractedTask, TaskDatabase } from '../services/nlpService';

interface NLPTaskProcessorProps {
  onExtracted: (result: { tasks: ExtractedTask[]; summary: string; originalInput: string }) => void;
}

const NLPTaskProcessor: React.FC<NLPTaskProcessorProps> = ({ onExtracted }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [summary, setSummary] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [interimTranscript, setInterimTranscript] = useState('');

  const nlpExtractor = new NLPTaskExtractor();
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
        let interim = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }
        
        if (finalTranscript) {
          setInput(prev => prev + finalTranscript + ' ');
          setInterimTranscript('');
        } else {
          setInterimTranscript(interim);
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimTranscript('');
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please type your input instead.');
      return;
    }

    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
  };

  const getCategoryIcon = (category: ExtractedTask['category']) => {
    switch (category) {
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      case 'social': return <Phone className="h-4 w-4" />;
      case 'household': return <Home className="h-4 w-4" />;
      case 'personal': return <User className="h-4 w-4" />;
      default: return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: ExtractedTask['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const handleProcessInput = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    setShowResults(false);
    
    try {
      // Call the real AI webhook endpoint
      const response = await fetch('https://Ayush5-n8n.hf.space/webhook/99fa79d2-e7cf-4e5e-96b2-96437a30aa18', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiResult = await response.json();
      
      // Process the AI response and convert to our task format
      const result = await nlpExtractor.processAIResponse(aiResult, input);
      
      setExtractedTasks(result.tasks);
      setSummary(result.summary);
      setConfidence(result.confidence);
      setShowResults(true);
      
      // Save to database
      await taskDB.saveTasks(result.tasks);
      
      // Notify parent component
      onExtracted({ tasks: result.tasks, summary: result.summary, originalInput: input.trim() });
    } catch (error) {
      console.error('Error processing input:', error);
      
      // Fallback to local processing if API fails
      try {
        const result = await nlpExtractor.processInput(input);
        setExtractedTasks(result.tasks);
        setSummary(`${result.summary} (Note: Using local processing due to API unavailability)`);
        setConfidence(result.confidence * 0.8); // Reduce confidence for fallback
        setShowResults(true);
        
        await taskDB.saveTasks(result.tasks);
        onExtracted({ tasks: result.tasks, summary: `${result.summary} (Note: Using local processing due to API unavailability)`, originalInput: input.trim() });
      } catch (fallbackError) {
        console.error('Fallback processing failed:', fallbackError);
        alert('Unable to process your input. Please try again later.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptTasks = () => {
    setInput('');
    setShowResults(false);
    setExtractedTasks([]);
    setInterimTranscript('');
  };

  const sampleInputs = [
    "I need to remember to take my blood pressure medication at 8 AM and 6 PM today. Also, I should call my daughter Sarah about dinner plans for Sunday. Don't forget to water the plants in the living room and pick up groceries - we need milk, bread, and apples. I have a doctor's appointment tomorrow at 2 PM with Dr. Johnson.",
    "This morning I woke up thinking about all the things I need to do. I should really clean the kitchen, it's been bothering me. My friend Mary called yesterday and I promised to call her back today. I also need to take my vitamins - I keep forgetting them. Oh, and I need to pay the electric bill before it's due next week.",
    "I'm feeling a bit overwhelmed today. I need to shower and get dressed, then take my morning pills. I should probably eat something healthy for breakfast. Later I want to go for a walk in the park if the weather is nice. I also need to remember to call the pharmacy about my prescription refill."
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-xl border border-purple-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
          <Brain className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">AI Task Processor</h3>
          <p className="text-gray-600">Share your thoughts and let AI organize them into tasks</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Input Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell me about your day, thoughts, or things you need to remember:
          </label>
          <div className="relative">
            <textarea
              value={input + interimTranscript}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: I need to take my medication at 9 AM, call my son later, and don't forget to water the plants. I also have a doctor's appointment tomorrow..."
              className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-base"
              disabled={isProcessing || isListening}
            />
            {isListening && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm animate-pulse flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Listening...
              </div>
            )}
            {interimTranscript && (
              <div className="absolute bottom-2 left-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {interimTranscript}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {(input + interimTranscript).length} characters
              </span>
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    isListening 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                  disabled={isProcessing}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isListening ? 'Stop' : 'Voice Input'}
                </button>
              )}
            </div>
            <span className="text-sm text-gray-500">
              Minimum 50 characters recommended
            </span>
          </div>
          
          {!speechSupported && (
            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                Speech recognition is not supported in your browser. Please type your input instead.
              </p>
            </div>
          )}
        </div>

        {/* Sample Inputs */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Try these examples:</p>
          <div className="grid gap-2">
            {sampleInputs.map((sample, index) => (
              <button
                key={index}
                onClick={() => setInput(sample)}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-sm"
                disabled={isProcessing || isListening}
              >
                <span className="text-purple-600 font-medium">Example {index + 1}:</span>
                <span className="text-gray-600 ml-2">
                  {sample.substring(0, 100)}...
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Process Button */}
        <button
          onClick={handleProcessInput}
          disabled={isProcessing || input.trim().length < 20 || isListening}
          className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing with AI...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5" />
              Extract Tasks with AI
            </>
          )}
        </button>

        {isListening && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">Voice Recording Active</span>
            </div>
            <p className="text-sm text-blue-800">
              Speak naturally about your day, tasks, and things you need to remember. Click "Stop" when finished.
            </p>
          </div>
        )}

        {/* Results Section */}
        {showResults && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">AI Processing Complete</h4>
                  <p className="text-blue-800 text-sm">{summary}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-blue-600">Confidence:</span>
                    <div className="bg-blue-200 rounded-full h-2 w-20">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-blue-600">{Math.round(confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Tasks */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">
                Extracted Tasks ({extractedTasks.length})
              </h4>
              <div className="space-y-3">
                {extractedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        {getCategoryIcon(task.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-gray-900 font-medium">{task.text}</p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              {task.category}
                            </span>
                          </div>
                        </div>
                        {task.timeContext && (
                          <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{task.timeContext}</span>
                          </div>
                        )}
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View original text
                          </summary>
                          <p className="text-xs text-gray-500 mt-1 italic">
                            "{task.extractedFrom}"
                          </p>
                        </details>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleAcceptTasks}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Accept & Add to List
              </button>
              <button
                onClick={() => setShowResults(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NLPTaskProcessor;