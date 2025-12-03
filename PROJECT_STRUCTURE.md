# FlowDapt Project Structure

## Overview

FlowDapt is a full-stack MERN application with a React frontend and Express backend.

## Directory Structure

```
FlowDapt/
│
├── backend/                      # Backend API (Node.js + Express)
│   ├── config/
│   │   └── db.js                # MongoDB connection configuration
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── errorHandler.js     # Global error handling
│   │
│   ├── models/
│   │   ├── User.js              # User schema (auth, profile)
│   │   └── Upload.js            # File upload schema
│   │
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication endpoints
│   │   ├── uploadRoutes.js      # File upload endpoints
│   │   ├── aiRoutes.js          # AI insights endpoints
│   │   └── feedbackRoutes.js    # User feedback endpoints
│   │
│   ├── utils/
│   │   ├── emailService.js      # Email sending (SMTP)
│   │   ├── fileParser.js        # File parsing utilities
│   │   └── aiService.js         # AI integration (Gemini)
│   │
│   ├── analysis/                # Empty (for future analytics)
│   ├── exports/                 # Empty (for generated exports)
│   ├── uploads/                 # Empty (for uploaded files)
│   │
│   ├── .env.example             # Environment variables template
│   ├── .gitignore               # Backend-specific ignores
│   ├── package.json             # Backend dependencies
│   └── server.js                # Express server entry point
│
├── frontend/                     # Frontend (React + TypeScript)
│   ├── public/
│   │   ├── flowdapt-logo.png   # App logo
│   │   ├── placeholder.svg      # Placeholder image
│   │   └── robots.txt           # SEO configuration
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── AIChatBox.tsx           # AI chat interface
│   │   │   │   ├── DashboardHeader.tsx     # Dashboard header
│   │   │   │   ├── DashboardLayout.tsx     # Dashboard wrapper
│   │   │   │   └── DashboardSidebar.tsx    # Navigation sidebar
│   │   │   │
│   │   │   ├── charts/
│   │   │   │   └── GaugeChart.tsx          # Gauge chart component
│   │   │   │
│   │   │   ├── landing/
│   │   │   │   ├── DemoModal.tsx           # Demo showcase
│   │   │   │   ├── Features.tsx            # Features section
│   │   │   │   ├── Footer.tsx              # Site footer
│   │   │   │   ├── Hero.tsx                # Landing hero
│   │   │   │   ├── Navbar.tsx              # Navigation bar
│   │   │   │   └── Testimonials.tsx        # User testimonials
│   │   │   │
│   │   │   └── ui/                         # shadcn/ui components
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── input.tsx
│   │   │       └── ... (30+ components)
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-toast.ts                # Toast notifications
│   │   │   ├── useKeyboardShortcuts.ts     # Keyboard shortcuts
│   │   │   └── useTheme.tsx                # Theme management
│   │   │
│   │   ├── lib/
│   │   │   ├── analyticsEngine.ts          # Data analysis logic
│   │   │   ├── reportBuilder.ts            # Report generation
│   │   │   ├── smoothScroll.ts             # Smooth scrolling
│   │   │   ├── userStorage.ts              # Session management
│   │   │   └── utils.ts                    # Utility functions
│   │   │
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardHome.tsx       # Dashboard overview
│   │   │   │   ├── UploadData.tsx          # File upload page
│   │   │   │   ├── VisualAnalytics.tsx     # Charts & visualizations
│   │   │   │   ├── Insights.tsx            # AI insights page
│   │   │   │   ├── ReportBuilder.tsx       # Report creation
│   │   │   │   ├── Feedback.tsx            # User feedback
│   │   │   │   └── Settings.tsx            # User settings
│   │   │   │
│   │   │   ├── About.tsx                   # About page
│   │   │   ├── Contact.tsx                 # Contact page
│   │   │   ├── ForgotPassword.tsx          # Password reset
│   │   │   ├── Index.tsx                   # Landing page
│   │   │   ├── Login.tsx                   # Login page
│   │   │   ├── NotFound.tsx                # 404 page
│   │   │   ├── PrivacyPolicy.tsx           # Privacy policy
│   │   │   ├── Register.tsx                # Registration
│   │   │   ├── SecurityPolicy.tsx          # Security policy
│   │   │   ├── TermsOfService.tsx          # Terms of service
│   │   │   └── VerifyEmail.tsx             # Email verification
│   │   │
│   │   ├── App.tsx                         # Main app component
│   │   ├── main.tsx                        # React entry point
│   │   └── index.css                       # Global styles
│   │
│   ├── .env.example                        # Frontend env template
│   ├── .gitignore                          # Frontend-specific ignores
│   ├── components.json                     # shadcn/ui config
│   ├── eslint.config.js                    # ESLint configuration
│   ├── index.html                          # HTML template
│   ├── package.json                        # Frontend dependencies
│   ├── postcss.config.js                   # PostCSS config
│   ├── tailwind.config.ts                  # Tailwind config
│   ├── tsconfig.json                       # TypeScript config
│   └── vite.config.ts                      # Vite config
│
├── .git/                                   # Git repository
├── .gitignore                              # Root gitignore
├── CONTRIBUTING.md                         # Contribution guidelines
├── DEPLOYMENT.md                           # Deployment guide
├── LICENSE                                 # MIT License
├── PROJECT_STRUCTURE.md                    # This file
└── README.md                               # Project documentation
```

## Key Files

### Backend

#### server.js
- Express server initialization
- Middleware configuration
- Route registration
- Database connection
- Error handling

#### models/User.js
- User authentication schema
- Password hashing
- Email verification
- Account management

#### models/Upload.js
- File upload tracking
- Metadata storage
- Analysis results

#### routes/authRoutes.js
- User registration
- Login/logout
- Email verification
- Password reset
- Account management

#### routes/uploadRoutes.js
- File upload handling
- File parsing
- Data analysis
- File management

#### routes/aiRoutes.js
- AI chat interface
- Data indexing
- Insight generation
- Query processing

#### routes/feedbackRoutes.js
- User feedback submission
- Email notifications

#### utils/emailService.js
- SMTP configuration
- Email templates
- OTP generation
- Batch email sending

#### utils/aiService.js
- Gemini AI integration
- Data analysis
- Insight generation
- Chat processing

#### utils/fileParser.js
- CSV parsing
- Excel parsing
- JSON parsing
- PDF parsing

### Frontend

#### App.tsx
- Route configuration
- Theme provider
- Query client setup
- Session initialization

#### lib/analyticsEngine.ts
- Statistical analysis
- Correlation detection
- Outlier detection
- Insight generation

#### lib/reportBuilder.ts
- Report queue management
- HTML generation
- Chart compilation
- Export functionality

#### lib/userStorage.ts
- Session management
- User-scoped storage
- Data persistence
- Cleanup logic

#### pages/dashboard/VisualAnalytics.tsx
- Chart rendering (8 types)
- Data visualization
- Statistics display
- Export functionality

#### pages/dashboard/Insights.tsx
- AI insights display
- Regeneration
- Filtering
- Export

#### pages/dashboard/ReportBuilder.tsx
- Chart selection
- Report customization
- PDF generation
- Preview

#### components/dashboard/AIChatBox.tsx
- Chat interface
- Query processing
- Response display
- History management

## Data Flow

### Authentication Flow
```
User → Register → Email Verification → Login → JWT Token → Protected Routes
```

### Upload & Analysis Flow
```
File Upload → Parse → Analyze → Generate Insights → Visualize → Export
```

### AI Chat Flow
```
User Query → Index Data → Send to Gemini → Process Response → Display
```

### Report Generation Flow
```
Select Charts → Customize → Generate HTML → Download/Export
```

## Environment Variables

### Backend (.env)
- `PORT` - Server port
- `NODE_ENV` - Environment mode
- `MONGO_URI` - MongoDB connection
- `JWT_SECRET` - JWT signing key
- `JWT_EXPIRE` - Token expiration
- `SMTP_*` - Email configuration
- `GEMINI_API_KEY` - AI API key
- `FRONTEND_URL` - CORS configuration

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## Dependencies

### Backend Core
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- nodemailer - Email service
- multer - File uploads
- cors - CORS handling

### Backend Utilities
- csv-parser - CSV parsing
- xlsx - Excel processing
- pdf-parse - PDF parsing
- @google/genai - AI integration

### Frontend Core
- react - UI library
- react-router-dom - Routing
- typescript - Type safety
- vite - Build tool

### Frontend UI
- tailwindcss - Styling
- shadcn/ui - Components
- recharts - Charts
- lucide-react - Icons

### Frontend Utilities
- @tanstack/react-query - Data fetching
- papaparse - CSV parsing
- xlsx - Excel processing
- html2canvas - Chart export

## Build & Deploy

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Production
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build
```

## Testing

### Manual Testing
- User registration/login
- File upload (CSV, Excel, JSON)
- Chart generation
- AI insights
- Report builder
- Feedback system

### Browser Testing
- Chrome
- Firefox
- Safari
- Edge

### Device Testing
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

## Security

### Authentication
- JWT tokens (7-day expiry)
- Password hashing (bcrypt)
- Email verification (OTP)
- Session management

### Data Protection
- Environment variables
- CORS configuration
- Input validation
- Error handling

### Best Practices
- No sensitive data in code
- Secure password storage
- Protected API routes
- Rate limiting (future)

## Performance

### Optimization
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies

### Monitoring
- Error tracking
- Performance metrics
- User analytics
- Server logs

## Future Enhancements

### Planned Features
- Real-time collaboration
- Advanced filtering
- Custom dashboards
- API integrations
- Mobile app

### Technical Improvements
- Unit tests
- E2E tests
- CI/CD pipeline
- Docker support
- Kubernetes deployment

## Support

For questions or issues:
- GitHub Issues: https://github.com/Sandythedev11/FlowDapt/issues
- Documentation: README.md
- Contributing: CONTRIBUTING.md
- Deployment: DEPLOYMENT.md
