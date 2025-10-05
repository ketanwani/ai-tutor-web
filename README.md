# AI Tutor SG - Singapore MOE-Aligned AI Learning Platform

A responsive web MVP built with React.js (frontend), Python Django (backend), and PostgreSQL (database). The platform serves Singapore parents and students (Primary 3–6, Secondary 1–4), offering AI-generated, syllabus-aligned questions and explanations for practice and progress tracking.

## 🏗️ Project Structure

```
ai-tutor-web/
├── backend/                 # Django REST API
│   ├── ai_tutor_sg/        # Django project settings
│   ├── accounts/           # User authentication & management
│   ├── quiz/              # Quiz sessions & progress tracking
│   └── requirements.txt   # Python dependencies
└── frontend/              # React.js application
    ├── src/
    │   ├── components/    # React components
    │   ├── contexts/      # React context providers
    │   └── services/      # API service layer
    └── package.json       # Node.js dependencies
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### Backend Setup (Django)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\Activate.ps1
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up PostgreSQL database:**
   - Create database: `ai_tutor_sg`
   - Update database credentials in settings (or use .env file)

5. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start Django server:**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup (React)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database settings
DB_NAME=ai_tutor_sg
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Google OAuth settings (for production)
GOOGLE_OAUTH2_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH2_CLIENT_SECRET=your-google-client-secret
```

### Frontend API Configuration

Update the API base URL in `frontend/src/services/api.js` if needed:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## 🧩 Core Features

### Parent Features
- **Google OAuth Login**: Secure authentication for parents
- **Child Management**: Add multiple children with unique join codes
- **Progress Tracking**: View detailed analytics and performance metrics
- **Dashboard**: Overview of all children's learning progress

### Student Features
- **Join Code Login**: Simple authentication using 6-character codes
- **Interactive Practice**: AI-generated questions with immediate feedback
- **Gamification**: XP points, streaks, and achievement badges
- **Progress Tracking**: Visual progress indicators and statistics

### AI Question Generation
- **MOE-Aligned Content**: Questions match Singapore's official curriculum
- **Adaptive Difficulty**: Questions adjust based on student performance
- **Multiple Subjects**: Mathematics (active), Science & English (coming soon)
- **Detailed Explanations**: Comprehensive answer explanations for learning

## 📊 Database Schema

### Key Models

- **User**: Extended Django user with parent/student roles
- **StudentProfile**: Child profiles with join codes and progress data
- **QuizSession**: Individual quiz attempts and results
- **Topic**: Available topics by level and subject

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/student-login/` - Student login with join code
- `GET /api/auth/profile/` - Get user profile
- `POST /api/auth/create-child/` - Create child profile
- `GET /api/auth/children/` - Get parent's children

### Quiz System
- `GET /api/generate-question/` - Generate AI question
- `POST /api/submit-answer/` - Submit student answer
- `GET /api/topics/` - Get available topics
- `GET /api/progress/<student_id>/` - Get student progress

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Interface**: Clean, child-friendly design with pastel colors
- **Interactive Elements**: Smooth animations and transitions
- **Progress Visualization**: Charts and graphs for analytics
- **Accessibility**: Screen reader friendly and keyboard navigation

## 🚀 Deployment

### Development
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

### Production Considerations
- Configure PostgreSQL for production
- Set up Google OAuth credentials
- Use environment variables for secrets
- Configure CORS for production domains
- Set up static file serving

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Future Enhancements

- **AI Integration**: OpenAI API for dynamic question generation
- **Additional Subjects**: Science and English content
- **Mobile App**: React Native version
- **Bilingual Support**: English and Mandarin explanations
- **Subscription Model**: Premium features and unlimited questions
- **Advanced Analytics**: Machine learning insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for Singapore students and parents**
