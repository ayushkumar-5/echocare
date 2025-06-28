# EchoCare - AI-Powered Dementia Care Assistant

> Over 55 million people live with dementia — and counting. EchoCare is here to help.

EchoCare is an advanced AI-powered web application designed to support dementia patients and their caregivers through intelligent task management, natural language processing, and comprehensive care coordination.

![EchoCare Screenshot](screenshot.png)

## 🚀 Features

### 🤖 AI-Powered Task Extraction
- **Natural Language Processing**: Converts spoken or typed conversations into structured tasks
- **Smart Prioritization**: Automatically categorizes tasks by priority and urgency
- **Time Context Understanding**: Extracts time-based information (today, tomorrow, specific times)
- **Webhook Integration**: Connects to external AI services for advanced processing

### 🗓️ Calendar Management
- **Monthly Calendar View**: Visual task distribution across days
- **Smart Task Matching**: Automatically assigns tasks to appropriate dates
- **Color-coded Priority**: Easy identification of high-priority tasks
- **Today Highlighting**: Quick identification of current day tasks

### 🚨 Emergency Contact System
- **Quick Access Contacts**: One-click calling for emergency services
- **Medical Contacts**: Direct access to doctors and pharmacies
- **Family Contacts**: Easy communication with family members
- **Smart Call Handling**: Confirmation dialogs for non-emergency calls

### 👥 Caregiver Dashboard
- **Task Management**: Add, edit, delete, and complete tasks
- **Priority Filtering**: Filter tasks by priority level
- **Progress Tracking**: Monitor completion status
- **Original Input Review**: View the original user input and AI summary

### 🎤 Voice Input Support
- **Speech-to-Text**: Natural voice input for task creation
- **Real-time Processing**: Live transcription with interim results
- **Cross-browser Support**: Works on modern browsers with speech recognition

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **AI Integration**: Custom webhook endpoints
- **Deployment**: InfinityFree (Free Hosting)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayushkumar-5/echocare.git
   cd echocare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🚀 Deployment

### InfinityFree Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Upload to InfinityFree**
   - Create account at [infinityfree.net](https://infinityfree.net)
   - Upload contents of `dist/` folder to `htdocs`
   - Include the `.htaccess` file for proper routing

3. **Access your deployed site**
   - Your site will be available at your InfinityFree subdomain
   - Example: `echocare.infinityfreeapp.com`

## 📱 Usage

### For Patients
1. **Natural Input**: Speak or type about your day naturally
2. **AI Processing**: Let AI extract and organize your tasks
3. **Review**: Check the extracted tasks and summary
4. **Accept**: Add tasks to your daily list

### For Caregivers
1. **Dashboard Access**: Use the Caregiver Dashboard for task management
2. **Calendar View**: See tasks organized by date
3. **Emergency Contacts**: Quick access to important contacts
4. **Task Management**: Edit, complete, or add new tasks

## 🔧 Configuration

### Webhook Setup
Update the webhook URL in `src/components/NLPTaskProcessor.tsx`:
```typescript
const response = await fetch('YOUR_WEBHOOK_URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: input.trim()
  })
});
```

### Emergency Contacts
Customize emergency contacts in `src/components/CaregiverDashboard.tsx`:
```typescript
const emergencyContacts = [
  { name: 'Emergency Services', number: '911', type: 'emergency' },
  { name: 'Primary Doctor', number: '(555) 123-4567', type: 'medical' },
  // Add more contacts as needed
];
```

## 🎯 Key Features Explained

### AI Task Extraction
The system processes natural language input and extracts actionable tasks using:
- **NLP Processing**: Identifies task-related content
- **Priority Detection**: Determines urgency based on keywords
- **Time Extraction**: Recognizes temporal references
- **Category Classification**: Groups tasks by type (medical, personal, etc.)

### Calendar Integration
Tasks are automatically assigned to calendar dates based on:
- **Time Context**: "today", "tomorrow", "this week"
- **Specific Times**: "9 AM", "2 PM"
- **Relative Dates**: "next Monday", "this weekend"

### Emergency Contact System
Provides immediate access to critical contacts with:
- **One-click Calling**: Direct phone integration
- **Contact Categorization**: Emergency, medical, family
- **Confirmation Dialogs**: Prevents accidental calls
- **Visual Indicators**: Color-coded by contact type

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for dementia patients and caregivers
- Powered by modern AI and web technologies
- Designed for accessibility and ease of use

## 📞 Support

For support, email support@echocare.com or create an issue in this repository.

---

**EchoCare** - Empowering independence through compassionate AI technology. 🧠💙
