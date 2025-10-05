# AI Tutor SG - Setup Instructions

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed  
- PostgreSQL 12+ installed
- Git installed

### 1. Clone and Setup

```bash
# Navigate to project directory
cd ai-tutor-web

# Run the setup script (Windows)
setup.bat

# Or manually setup:

# Backend setup
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python setup_database.py

# Frontend setup  
cd ..\frontend
npm install
# Note: Tailwind CSS PostCSS plugin is already configured
```

### 2. Start Development Servers

```bash
# Run the startup script (Windows)
start_dev.bat

# Or manually start servers:

# Terminal 1 - Backend
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm start
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

## 🧪 Testing the Application

### Parent Flow
1. Go to http://localhost:3000
2. Click "Parent Signup" to create a new account
3. Or click "Parent Login" to sign in with existing account
4. Add children through the dashboard
5. View progress analytics

### Student Flow  
1. Go to http://localhost:3000
2. Click "Join as Student"
3. Use join code from parent dashboard
4. Select subject and topic
5. Practice with AI-generated questions

## 📊 Sample Data

The setup script creates sample data:
- **Parent Account**: parent@example.com / password123
- **Student Join Codes**: Generated automatically for each child
- **Sample Topics**: Math topics for P4-P6 levels

## 🔧 Configuration

### Database Configuration
Update `backend/ai_tutor_sg/settings.py` or create `.env` file:

```env
DB_NAME=ai_tutor_sg
DB_USER=postgres  
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### Google OAuth (Optional)
For production, configure Google OAuth:
1. Create Google OAuth credentials
2. Update settings with client ID and secret
3. Configure redirect URIs

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure PostgreSQL is running
- Check database credentials
- Create database: `ai_tutor_sg`

**Frontend Build Errors**
- Run `npm install` in frontend directory
- Check Node.js version (16+)

**CORS Errors**
- Ensure backend is running on port 8000
- Check CORS settings in Django

**API Connection Issues**
- Verify backend is running
- Check API_BASE_URL in frontend/src/services/api.js

**Tailwind CSS PostCSS Error**
- If you see "tailwindcss directly as a PostCSS plugin" error:
- Run: `npm install -D tailwindcss@^3.4.0`
- The postcss.config.js and tailwind.config.js are already configured correctly

**Google OAuth Error**
- If you see "SocialApp.DoesNotExist" error:
- Run: `python setup_google_oauth.py` in the backend directory
- Or use the "Parent Signup" button to create a new account

## 📱 Features Implemented

### ✅ Completed Features
- [x] Project structure setup
- [x] Django backend with REST API
- [x] React frontend with Tailwind CSS
- [x] User authentication (Google OAuth + Join codes)
- [x] Parent dashboard with child management
- [x] Student dashboard with topic selection
- [x] Interactive practice interface
- [x] Progress tracking and analytics
- [x] Responsive mobile design
- [x] Mock AI question generation

### 🚧 MVP Features
- Parent Google OAuth login
- Child profile management with join codes
- Student login with join codes
- AI-generated MOE-aligned questions
- Progress tracking and analytics
- Responsive web design
- Mock question database

### 🔮 Future Enhancements
- Real AI integration (OpenAI API)
- Additional subjects (Science, English)
- Advanced analytics
- Mobile app version
- Subscription model

## 📞 Support

For issues or questions:
1. Check the README.md file
2. Review the setup instructions
3. Check console logs for errors
4. Verify all prerequisites are installed

---

**Ready to start learning with AI Tutor SG! 🎓**
