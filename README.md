# FlowDapt Analytics Platform

A modern, AI-powered analytics platform that transforms raw data into actionable insights. Upload your data files and leverage advanced visualizations, statistical analysis, and AI-driven interpretations to make data-driven decisions.

## 🚀 Features

### Core Analytics
- **Multi-Format Support**: Upload CSV, Excel (XLSX/XLS), JSON, and PDF files
- **Intelligent Data Parsing**: Automatic detection and parsing of various data formats
- **Interactive Visualizations**: Multiple chart types including bar, line, pie, area, scatter, funnel, and gauge charts
- **Statistical Analysis**: Comprehensive statistics including mean, median, correlations, distributions, and trends
- **AI-Powered Insights**: Natural language queries powered by Google Gemini AI for deep data interpretation

### User Management
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Email Verification**: OTP-based email verification system
- **Password Recovery**: Secure password reset flow with time-limited OTPs
- **Session Management**: Persistent sessions with automatic cleanup on browser close

### User Experience
- **Drag & Drop Upload**: Intuitive file upload with drag-and-drop support
- **Real-time Analysis**: Instant data processing and visualization
- **Responsive Design**: Fully responsive interface optimized for all devices
- **Dark/Light Mode**: Theme switching for comfortable viewing
- **Export Capabilities**: Download charts and reports in multiple formats

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Recharts** - Composable charting library
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **PapaParse** - CSV parsing
- **XLSX** - Excel file processing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Secure authentication tokens
- **Nodemailer** - Email service integration
- **Multer** - File upload handling
- **Google Gemini AI** - AI-powered analytics

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Gmail account (for SMTP email service)
- Google Gemini API key

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sandythedev11/FlowDapt.git
cd FlowDapt
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_secure_random_jwt_secret_key_min_32_characters
JWT_EXPIRE=7d

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM=FlowDapt <your_email@gmail.com>

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Running the Application

### Development Mode

**Backend:**
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm run dev
```
Application runs on `http://localhost:5173`

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
npm start
```

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | Yes |
| `JWT_EXPIRE` | JWT expiration time (e.g., 7d) | Yes |
| `SMTP_HOST` | SMTP server host | Yes |
| `SMTP_PORT` | SMTP server port | Yes |
| `SMTP_USER` | Email address for sending | Yes |
| `SMTP_PASS` | Email app password | Yes |
| `SMTP_FROM` | From email display name | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

## 📧 Email Configuration

### Gmail SMTP Setup

1. Enable 2-Step Verification on your Gmail account:
   - Visit: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. Generate an App Password:
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
   - Use this password in `SMTP_PASS`

## 🔑 Google Gemini AI Setup

1. Visit: https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key to `GEMINI_API_KEY` in your `.env` file

## 📁 Project Structure

```
FlowDapt/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Authentication & error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Utilities (email, AI, parsers)
│   ├── uploads/         # Uploaded files storage
│   ├── .env.example     # Environment template
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities & helpers
│   │   ├── pages/       # Page components
│   │   └── App.tsx      # Main app component
│   ├── public/          # Static assets
│   └── index.html       # HTML template
│
├── .gitignore
└── README.md
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based auth
- **Email Verification**: OTP-based verification
- **File Validation**: Type and size restrictions (5MB limit)
- **CORS Protection**: Configured cross-origin policies
- **Environment Variables**: Sensitive data protection
- **Input Sanitization**: Protection against injection attacks

## 📊 API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user (protected)
- `POST /verify-email` - Verify email with OTP
- `POST /resend-verification` - Resend verification OTP
- `POST /forgot-password` - Request password reset
- `POST /verify-reset-otp` - Verify reset OTP
- `POST /reset-password` - Reset password

### File Upload (`/api/upload`)

- `POST /` - Upload file (protected)
- `GET /` - Get all uploads (protected)
- `GET /:id` - Get single upload (protected)
- `DELETE /:id` - Delete upload (protected)

### AI Analytics (`/api/ai`)

- `POST /query` - Query AI with data context (protected)

## 🎨 Available Chart Types

- **Bar Chart**: Compare categories
- **Line Chart**: Show trends over time
- **Pie Chart**: Display proportions
- **Area Chart**: Visualize cumulative data
- **Scatter Plot**: Show correlations
- **Funnel Chart**: Track conversion rates
- **Gauge Chart**: Display KPI performance
- **Heatmap**: Show correlation matrices

## 🧪 Testing

Upload sample data files to test the platform:

1. Navigate to Dashboard → Upload Data
2. Drag and drop or select a CSV/Excel file
3. Click "Analyze Files"
4. View visualizations in Visual Analytics
5. Ask AI questions in the Insights tab

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to your hosting service

3. Set environment variables in your hosting dashboard

### Backend Deployment (Heroku/Railway/Render)

1. Ensure all environment variables are set
2. Deploy using your platform's CLI or Git integration
3. Update frontend `VITE_API_URL` to production backend URL

### MongoDB Atlas Setup

1. Create a cluster at https://cloud.mongodb.com
2. Create a database user
3. Whitelist your IP or use 0.0.0.0/0 for all IPs
4. Copy connection string to `MONGODB_URI`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write clean, documented code
- Test thoroughly before submitting
- Follow existing code style
- Update documentation as needed

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Sandythedev11**
- GitHub: [@Sandythedev11](https://github.com/Sandythedev11)

## 🙏 Acknowledgments

- Google Gemini AI for intelligent analytics
- shadcn/ui for beautiful components
- Recharts for powerful visualizations
- The open-source community

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced ML models integration
- [ ] Custom report builder
- [ ] API rate limiting
- [ ] Webhook integrations
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

**Built with ❤️ by Sandythedev11**
