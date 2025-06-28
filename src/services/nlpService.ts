// NLP Service for processing patient input and extracting tasks
export interface ExtractedTask {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: 'medication' | 'appointment' | 'personal' | 'social' | 'household' | 'other';
  timeContext?: string;
  completed: boolean;
  extractedFrom: string;
}

export interface NLPResponse {
  tasks: ExtractedTask[];
  summary: string;
  confidence: number;
}

// Enhanced NLP service that integrates with real AI API and provides fallback processing
export class NLPTaskExtractor {
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private categorizeTask(taskText: string): ExtractedTask['category'] {
    const text = taskText.toLowerCase();
    
    if (text.includes('medication') || text.includes('pill') || text.includes('medicine') || text.includes('doctor')) {
      return 'medication';
    }
    if (text.includes('appointment') || text.includes('visit') || text.includes('meeting')) {
      return 'appointment';
    }
    if (text.includes('call') || text.includes('phone') || text.includes('visit') || text.includes('family')) {
      return 'social';
    }
    if (text.includes('clean') || text.includes('wash') || text.includes('cook') || text.includes('grocery')) {
      return 'household';
    }
    if (text.includes('exercise') || text.includes('walk') || text.includes('shower') || text.includes('eat')) {
      return 'personal';
    }
    
    return 'other';
  }

  private determinePriority(taskText: string, timeContext?: string): ExtractedTask['priority'] {
    const text = taskText.toLowerCase();
    const urgent = ['urgent', 'important', 'asap', 'immediately', 'emergency'];
    const medication = ['medication', 'pill', 'medicine'];
    const today = ['today', 'this morning', 'this afternoon', 'tonight'];
    
    if (urgent.some(word => text.includes(word))) return 'high';
    if (medication.some(word => text.includes(word))) return 'high';
    if (today.some(word => text.includes(word)) || timeContext?.includes('today')) return 'high';
    
    const soon = ['tomorrow', 'this week', 'soon'];
    if (soon.some(word => text.includes(word))) return 'medium';
    
    return 'low';
  }

  private extractTimeContext(text: string): string | undefined {
    const timePatterns = [
      /at (\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))/g,
      /(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))/g,
      /(this morning|this afternoon|tonight|today|tomorrow|this week|next week)/gi,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi
    ];
    
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    
    return undefined;
  }

  // Process AI API response and convert to our task format
  async processAIResponse(aiResult: any, originalInput: string): Promise<NLPResponse> {
    try {
      let aiTasks: any[] = [];
      let aiSummary = '';

      // NEW FORMAT: [{ output: '```json\n[ ... ]\n```' }]
      if (Array.isArray(aiResult) && aiResult.length > 0 && aiResult[0].output) {
        const outputStr = aiResult[0].output;
        // Extract JSON from Markdown code block
        const match = outputStr.match(/```json\n([\s\S]*?)\n```/);
        if (match && match[1]) {
          try {
            const parsed = JSON.parse(match[1]);
            if (Array.isArray(parsed)) {
              aiTasks = parsed.map((task: string) => ({ text: task }));
              aiSummary = 'AI successfully processed your input.';
            }
          } catch (e) {
            // Fallback: treat as plain text
            aiSummary = outputStr;
          }
        } else {
          aiSummary = outputStr;
        }
      }
      // Handle previous formats
      else if (aiResult.tasks && Array.isArray(aiResult.tasks)) {
        aiTasks = aiResult.tasks;
        aiSummary = aiResult.summary || 'AI successfully processed your input.';
      } else if (aiResult.response && typeof aiResult.response === 'string') {
        const response = aiResult.response;
        aiSummary = response;
        const taskMatches = response.match(/\d+\.\s*(.+?)(?=\d+\.|$)/g);
        if (taskMatches) {
          aiTasks = taskMatches.map((match: string, index: number) => ({
            text: match.replace(/^\d+\.\s*/, '').trim(),
            priority: index < 2 ? 'high' : 'medium',
            category: 'other'
          }));
        }
      } else if (typeof aiResult === 'string') {
        aiSummary = aiResult;
        const taskMatches = aiResult.match(/\d+\.\s*(.+?)(?=\d+\.|$)/g);
        if (taskMatches) {
          aiTasks = taskMatches.map((match: string, index: number) => ({
            text: match.replace(/^\d+\.\s*/, '').trim(),
            priority: index < 2 ? 'high' : 'medium',
            category: 'other'
          }));
        }
      }

      // Convert AI tasks to our format
      const tasks: ExtractedTask[] = aiTasks.map((aiTask: any) => {
        const taskText = aiTask.text || aiTask.task || aiTask.description || String(aiTask);
        const timeContext = this.extractTimeContext(taskText);
        return {
          id: this.generateId(),
          text: this.cleanTaskText(taskText),
          priority: aiTask.priority || this.determinePriority(taskText, timeContext),
          category: aiTask.category || this.categorizeTask(taskText),
          timeContext: aiTask.timeContext || timeContext,
          completed: false,
          extractedFrom: originalInput
        };
      });

      if (tasks.length === 0) {
        tasks.push({
          id: this.generateId(),
          text: this.extractGeneralTask(originalInput),
          priority: 'medium',
          category: 'other',
          completed: false,
          extractedFrom: originalInput
        });
      }

      return {
        tasks: tasks.slice(0, 10),
        summary: aiSummary || this.generateSummary(tasks, originalInput),
        confidence: Math.min(0.95, 0.8 + (tasks.length * 0.05))
      };
    } catch (error) {
      console.error('Error processing AI response:', error);
      return this.processInput(originalInput);
    }
  }

  async processInput(input: string): Promise<NLPResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Enhanced task extraction logic
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const tasks: ExtractedTask[] = [];
    
    // Keywords that indicate actionable tasks
    const actionKeywords = [
      'need to', 'have to', 'should', 'must', 'remember to', 'don\'t forget',
      'call', 'visit', 'take', 'go to', 'buy', 'pick up', 'clean', 'wash',
      'cook', 'eat', 'drink', 'exercise', 'walk', 'shower', 'brush',
      'appointment', 'meeting', 'medication', 'pill', 'medicine'
    ];
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length < 10) continue; // Skip very short sentences
      
      // Check if sentence contains actionable content
      const hasAction = actionKeywords.some(keyword => 
        trimmed.toLowerCase().includes(keyword)
      );
      
      if (hasAction) {
        const timeContext = this.extractTimeContext(trimmed);
        const task: ExtractedTask = {
          id: this.generateId(),
          text: this.cleanTaskText(trimmed),
          priority: this.determinePriority(trimmed, timeContext),
          category: this.categorizeTask(trimmed),
          timeContext,
          completed: false,
          extractedFrom: trimmed
        };
        
        tasks.push(task);
      }
    }
    
    // If no clear tasks found, try to extract from the entire input
    if (tasks.length === 0) {
      const generalTask: ExtractedTask = {
        id: this.generateId(),
        text: this.extractGeneralTask(input),
        priority: 'medium',
        category: 'other',
        completed: false,
        extractedFrom: input
      };
      tasks.push(generalTask);
    }
    
    const summary = this.generateSummary(tasks, input);
    
    return {
      tasks: tasks.slice(0, 10), // Limit to 10 tasks max
      summary,
      confidence: Math.min(0.95, 0.6 + (tasks.length * 0.1))
    };
  }

  private cleanTaskText(text: string): string {
    // Remove common prefixes and clean up the task text
    let cleaned = text
      .replace(/^(I need to|I have to|I should|I must|Remember to|Don't forget to)\s*/i, '')
      .replace(/^(and then|then|also|plus)\s*/i, '')
      .trim();
    
    // Capitalize first letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    
    // Ensure it ends with proper punctuation
    if (!/[.!?]$/.test(cleaned)) {
      cleaned += '.';
    }
    
    return cleaned;
  }

  private extractGeneralTask(input: string): string {
    // Extract a general task from unstructured input
    const words = input.split(' ').slice(0, 15); // Take first 15 words
    let task = words.join(' ');
    
    if (task.length > 100) {
      task = task.substring(0, 97) + '...';
    }
    
    return this.cleanTaskText(task);
  }

  private generateSummary(tasks: ExtractedTask[], originalInput: string): string {
    if (tasks.length === 0) {
      return "I couldn't identify specific tasks from your input, but I've created a general reminder for you.";
    }
    
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const categories = [...new Set(tasks.map(t => t.category))];
    
    let summary = `I found ${tasks.length} task${tasks.length > 1 ? 's' : ''} from your input. `;
    
    if (highPriority > 0) {
      summary += `${highPriority} ${highPriority > 1 ? 'are' : 'is'} high priority. `;
    }
    
    if (categories.length > 1) {
      summary += `These include ${categories.join(', ')} activities. `;
    }
    
    summary += "Your caregiver can review and modify these tasks as needed.";
    
    return summary;
  }
}

// Simulated database service
export class TaskDatabase {
  private tasks: ExtractedTask[] = [];
  
  async saveTasks(tasks: ExtractedTask[]): Promise<void> {
    // Simulate database save
    await new Promise(resolve => setTimeout(resolve, 500));
    this.tasks.push(...tasks);
  }
  
  async getTasks(): Promise<ExtractedTask[]> {
    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.tasks];
  }
  
  async updateTask(taskId: string, updates: Partial<ExtractedTask>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updates };
    }
  }
  
  async deleteTask(taskId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    this.tasks = this.tasks.filter(t => t.id !== taskId);
  }
}