# FlowDapt Analytics Platform

## 🚀 Production-Ready AI-Powered Analytics Platform

A secure, scalable, and cost-controlled analytics platform that transforms raw data into actionable insights. Built with enterprise-grade security, comprehensive monitoring, and intelligent cost management for reliable production deployment.

[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen.svg)](https://github.com/Sandythedev11/FlowDapt)
[![Security](https://img.shields.io/badge/Security-Hardened-blue.svg)](https://github.com/Sandythedev11/FlowDapt)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

**Version 2.0.0** - Production-Hardened Release

---

## � Table of Contents

- [Overview](#overview)
- [Production Features](#production-features)
- [Core Analytics](#core-analytics)
- [Technology Stack](#technology-stack)
- [Security & Compliance](#security--compliance)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Monitoring & Logging](#monitoring--logging)
- [Cost Management](#cost-management)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

---

## 🎯 Overview

FlowDapt is an enterprise-grade analytics platform designed for production environments. It combines powerful data analysis capabilities with robust security measures, intelligent cost controls, and comprehensive monitoring to deliver a reliable, scalable solution for data-driven decision making.

### Key Highlights

- **🛡️ Production-Ready Security** - Multi-layered protection with rate limiting, security headers, and input sanitization
- **💰 Cost-Controlled** - Intelligent quotas prevent unexpected expenses (60-95% cost savings)
- **📊 Fully Monitored** - Comprehensive logging and health monitoring for operational excellence
- **🚀 High Performance** - Optimized database queries, response compression, and efficient resource utilization
- **🤖 AI-Powered** - Natural language queries with Google Gemini AI integration
- **📈 Scalable Architecture** - Built to handle growth from beta to enterprise scale

---

## 🏆 Production Features

### Security (5 Layers)

#### **1. Rate Limiting**
Protects against brute force attacks, DDoS, and service abuse:
- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- AI Queries: 20 queries per hour per user
- File Uploads: 10 uploads per hour per user
- Password Reset: 3 attempts per hour

#### **2. Security Headers (Helmet)**
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options (Clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- X-XSS-Protection

#### **3. Input Sanitization**
- NoSQL injection prevention
- XSS attack protection
- Request data sanitization

#### **4. Authentication & Authorization**
- JWT-based secure authentication
- bcrypt password hashing (10 salt rounds)
- Email verification with OTP
- Secure password reset flow

#### **5. Audit Logging**
- Complete security event tracking
- Request logging with user context
- Failed authentication attempts
- Rate limit violations

### Cost Management (3 Systems)

#### **1. AI Usage Quotas**
Prevents unlimited AI API costs:

| Tier | Daily Limit | Monthly Limit | Cost Impact |
|------|-------------|---------------|-------------|
| Free | 20 queries | 500 queries | $20-50/month |
| Premium | 200 queries | 5000 queries | $100-200/month |

**Features:**
- Automatic daily reset at midnight
- Monthly reset on 1st of each month
- Per-user tracking and enforcement
- Quota information in API responses
- Upgrade prompts for premium features

#### **2. Storage Quotas**
Prevents disk space exhaustion:

| Tier | Storage Limit | File Retention |
|------|---------------|----------------|
| Free | 100 MB | 30 days |
| Premium | 5 GB | Unlimited |

**Features:**
- Real-time storage calculation
- Pre-upload quota validation
- Clear error messages with usage details
- Automatic cleanup for free tier

#### **3. Automated File Cleanup**
- Daily cleanup job at 2 AM
- Deletes files older than 30 days (free users)
- Removes orphaned files
- Generates weekly storage reports
- Zero manual intervention required

### Monitoring & Observability

#### **Winston Logger**
Professional logging system with:
- **Daily log rotation** - Automatic file management
- **Separate log streams** - Error, security, and combined logs
- **Automatic compression** - Saves disk space
- **Configurable retention** - 14-30 day retention policies
- **Structured JSON logging** - Easy parsing and analysis

**Log Files:**
```
backend/logs/
├── error-YYYY-MM-DD.log       # Error logs (14-day retention)
├── security-YYYY-MM-DD.log    # Security events (30-day retention)
└── combined-YYYY-MM-DD.log    # All logs (14-day retention)
```

#### **Health Monitoring**
- `/api/health` endpoint for system status
- Database connection monitoring
- Email service status
- API operational status
- Integration-ready for external monitoring tools

#### **Operational Automation**
Scheduled cron jobs for maintenance:
- **File Cleanup** - Daily at 2 AM
- **Quota Reset** - 1st of month at midnight
- **Storage Reports** - Sundays at 3 AM

### Performance Optimizations

- **Database Indexes** - Optimized queries on User and Upload models
- **Connection Pooling** - Efficient database connection management (min: 2, max: 10)
- **Response Compression** - Gzip compression for reduced bandwidth
- **Efficient Queries** - Indexed fields for fast data retrieval

---

## 🎨 Core Analytics

### Data Processing
- **Multi-Format Support**: CSV, Excel (XLSX/XLS), JSON, and PDF files
- **Intelligent Parsing**: Automatic format detection and data extraction
- **Large File Handling**: Supports files up to 10MB
- **Real-time Processing**: Instant data analysis and visualization

### Visualizations
Interactive charts powered by Recharts:
- **Bar Chart** - Compare categories and values
- **Line Chart** - Visualize trends over time
- **Pie Chart** - Display proportions and distributions
- **Area Chart** - Show cumulative data patterns
- **Scatter Plot** - Identify correlations and relationships
- **Funnel Chart** - Track conversion rates and processes
- **Gauge Chart** - Display KPI performance metrics
- **Heatmap** - Visualize correlation matrices

### Statistical Analysis
Comprehensive analytics including:
- Descriptive statistics (mean, median, mode, std deviation)
- Correlation analysis
- Distribution analysis
- Outlier detection
- Missing value analysis
- Duplicate detection
- Trend identification

### AI-Powered Insights
Natural language queries powered by Google Gemini AI:
- Ask questions about your data in plain English
- Get intelligent interpretations and recommendations
- Context-aware responses based on your dataset
- Conversation history for follow-up questions
- Quota-controlled to prevent cost overruns

### User Experience
- **Drag & Drop Upload** - Intuitive file upload interface
- **Responsive Design** - Optimized for all devices and screen sizes
- **Dark/Light Mode** - Theme switching for comfortable viewing
- **Export Capabilities** - Download charts and premium reports
- **Premium Reports** - Professional PDF reports with cover pages, watermarks, and branding

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible React components
- **Recharts** - Composable charting library
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **PapaParse** - High-performance CSV parsing
- **XLSX** - Excel file processing

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, minimalist web framework
- **MongoDB** - NoSQL database with Atlas cloud hosting
- **Mongoose** - Elegant MongoDB object modeling
- **JWT** - Secure authentication tokens
- **bcrypt** - Password hashing
- **Nodemailer** - Email service integration
- **Multer** - File upload handling
- **Google Gemini AI** - Advanced AI analytics

### Production Infrastructure
- **Helmet** - Security headers middleware
- **express-rate-limit** - Rate limiting and throttling
- **express-mongo-sanitize** - NoSQL injection prevention
- **Winston** - Professional logging framework
- **node-cron** - Scheduled job management
- **compression** - Response compression

---

## � Security & Compliance

### Authentication & Authorization
- **JWT Tokens** - Secure, stateless authentication
- **Password Security** - bcrypt hashing with 10 salt rounds
- **Email Verification** - OTP-based account verification
- **Password Reset** - Secure reset flow with time-limited OTPs
- **Session Management** - Automatic cleanup and security

### Data Protection
- **Input Sanitization** - All user inputs sanitized
- **NoSQL Injection Prevention** - Query sanitization
- **XSS Protection** - Content Security Policy headers
- **CORS Configuration** - Controlled cross-origin access
- **File Validation** - Type and size restrictions

### Compliance Features
- **Audit Logging** - Complete activity tracking
- **Data Retention** - Configurable retention policies
- **User Data Management** - Account deletion and data export
- **Security Event Tracking** - Failed logins, rate limits, quota violations

### Security Best Practices
- Environment variable protection
- Secure HTTP headers (HSTS, CSP, X-Frame-Options)
- Rate limiting on all endpoints
- Graceful error handling without information leakage
- Regular security updates and dependency audits

---

## 🚀 Quick Start

**New to FlowDapt?** Get up and running in 5 minutes:

👉 **[QUICK_START.md](./QUICK_START.md)** - Step-by-step setup guide

**Having issues?** Check our troubleshooting guide:

👉 **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solutions for common problems

**Production deployment?** Follow our comprehensive guide:

👉 **[PRODUCTION_HARDENING_GUIDE.md](./PRODUCTION_HARDENING_GUIDE.md)** - Production deployment guide

---

## 📦 Installation

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **MongoDB** (local installation or Atlas cloud account)
- **Gmail account** for SMTP email service
- **Google Gemini API key** for AI features

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
NODE_ENV=production

# Database
MONGO_URI=your_mongodb_connection_string

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

# Optional: Logging
LOG_LEVEL=info
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

---

## ⚙️ Configuration

### Environment Variables

#### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port number | Yes | 5000 |
| `NODE_ENV` | Environment (development/production) | Yes | development |
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | Yes | - |
| `JWT_EXPIRE` | JWT expiration time | Yes | 7d |
| `SMTP_HOST` | SMTP server host | Yes | smtp.gmail.com |
| `SMTP_PORT` | SMTP server port | Yes | 587 |
| `SMTP_USER` | Email address for sending | Yes | - |
| `SMTP_PASS` | Email app password | Yes | - |
| `SMTP_FROM` | From email display name | Yes | - |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | No | info |

#### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | http://localhost:5000 |

### Email Configuration (Gmail SMTP)

1. **Enable 2-Step Verification:**
   - Visit: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
   - Use this password in `SMTP_PASS`

### Google Gemini AI Setup

1. Visit: https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key to `GEMINI_API_KEY` in your `.env` file

### MongoDB Atlas Setup

1. Create a cluster at https://cloud.mongodb.com
2. Create a database user with read/write permissions
3. Whitelist your IP address (or use 0.0.0.0/0 for development)
4. Copy connection string to `MONGO_URI`
5. Enable automated backups (recommended for production)

---

## 🏃 Running the Application

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

### Health Check

Verify the server is running:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-29T10:00:00.000Z",
  "services": {
    "database": { "connected": true, "state": "connected" },
    "email": { "ready": true, "configured": true },
    "api": { "status": "operational" }
  }
}
```

---

## 🚢 Deployment

### Production Deployment Options

#### Option 1: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel):**
1. Connect GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. Add environment variable: `VITE_API_URL`
5. Deploy

**Backend (Railway/Render):**
1. Connect GitHub repository
2. Set root directory: `backend`
3. Set start command: `npm start`
4. Add all environment variables from `.env`
5. Deploy

#### Option 2: VPS (DigitalOcean, AWS, etc.)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed VPS deployment instructions.

#### Option 3: Docker

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for Docker and Docker Compose configurations.

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB Atlas cluster created and configured
- [ ] Gmail SMTP credentials tested
- [ ] Gemini API key validated
- [ ] Frontend build succeeds (`npm run build`)
- [ ] Backend starts without errors
- [ ] Health check endpoint returns 200 OK
- [ ] Rate limiting tested
- [ ] AI quotas tested
- [ ] Storage quotas tested

### Post-Deployment Monitoring

1. **Monitor logs** for first 24-48 hours
2. **Check health endpoint** regularly
3. **Verify rate limiting** is working
4. **Monitor AI usage** and costs
5. **Check storage usage** and cleanup jobs
6. **Set up external monitoring** (Sentry, UptimeRobot)

---

## 📊 Monitoring & Logging

### Log Files

All logs are stored in `backend/logs/` with automatic rotation:

| Log File | Content | Retention |
|----------|---------|-----------|
| `error-YYYY-MM-DD.log` | Application errors | 14 days |
| `security-YYYY-MM-DD.log` | Security events | 30 days |
| `combined-YYYY-MM-DD.log` | All logs | 14 days |

### Monitoring Logs

**View all logs:**
```bash
tail -f backend/logs/combined-*.log
```

**View errors only:**
```bash
tail -f backend/logs/error-*.log
```

**View security events:**
```bash
tail -f backend/logs/security-*.log
```

### What to Monitor

- Rate limit exceeded events
- AI quota exceeded events
- Storage quota exceeded events
- Authentication failures
- File upload errors
- Database connection issues
- API response times

### External Monitoring (Recommended)

1. **Sentry** (Error Tracking)
   - Free tier: 5,000 errors/month
   - Sign up: https://sentry.io

2. **UptimeRobot** (Uptime Monitoring)
   - Free tier: 50 monitors
   - Sign up: https://uptimerobot.com
   - Monitor `/api/health` endpoint

3. **MongoDB Atlas** (Database Monitoring)
   - Built-in monitoring dashboard
   - Enable automated backups

---

## 💰 Cost Management

### Pricing Tiers

| Feature | Free Tier | Premium Tier |
|---------|-----------|--------------|
| **AI Queries** | 20/day, 500/month | 200/day, 5000/month |
| **Storage** | 100 MB | 5 GB |
| **File Retention** | 30 days | Unlimited |
| **Support** | Community | Priority |

### Cost Estimates

#### With Cost Controls (100 users):
- MongoDB Atlas: $25/month
- Vercel (Frontend): Free
- Railway/Render (Backend): $5-10/month
- Gemini API (controlled): $20-50/month
- **Total: $50-85/month** ✅

#### At Scale (1000 users):
- MongoDB Atlas: $57/month (M10 cluster)
- Vercel: $20/month
- Railway: $20-30/month
- Gemini API (controlled): $100-200/month
- **Total: $197-307/month** ✅

**Cost Savings:** 60-95% compared to uncontrolled usage

### Quota Management

**AI Usage Quotas:**
- Automatic daily reset at midnight
- Monthly reset on 1st of each month
- Per-user tracking and enforcement
- Quota information in API responses

**Storage Quotas:**
- Real-time storage calculation
- Pre-upload validation
- Automatic cleanup for free tier (30 days)
- Manual cleanup for premium tier

---

## 📚 API Documentation

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/register` | Register new user | 5/15min |
| POST | `/login` | User login | 5/15min |
| GET | `/me` | Get current user (protected) | 100/15min |
| POST | `/verify-email` | Verify email with OTP | 100/15min |
| POST | `/resend-verification` | Resend verification OTP | 100/15min |
| POST | `/forgot-password` | Request password reset | 3/hour |
| POST | `/verify-reset-otp` | Verify reset OTP | 3/hour |
| POST | `/reset-password` | Reset password | 3/hour |

### File Upload Endpoints (`/api/upload`)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/` | Upload file (protected) | 10/hour |
| GET | `/` | Get all uploads (protected) | 100/15min |
| GET | `/:id` | Get single upload (protected) | 100/15min |
| DELETE | `/:id` | Delete upload (protected) | 100/15min |
| DELETE | `/session/clear` | Clear session data (protected) | 100/15min |

**Supported File Types:** CSV, Excel (XLSX/XLS), JSON, PDF
**Max File Size:** 10MB

### AI Analytics Endpoints (`/api/ai`)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/index` | Index user data for AI (protected) | 100/15min |
| POST | `/chat` | Chat with AI (protected) | 20/hour |
| POST | `/clear-session` | Clear conversation (protected) | 100/15min |
| DELETE | `/clear-all` | Clear all AI data (protected) | 100/15min |
| GET | `/debug` | Debug indexed data (protected) | 100/15min |

**AI Quotas:**
- Free tier: 20 queries/day, 500/month
- Premium tier: 200 queries/day, 5000/month

### Feedback Endpoint (`/api/feedback`)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/submit` | Submit feedback (protected) | 100/15min |

### Health Check Endpoint

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/api/health` | System health status | None |

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Testing Production Features

See **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** for comprehensive testing instructions including:
- Rate limiting tests
- AI quota tests
- Storage quota tests
- Log monitoring
- Security event testing

### Manual Testing

1. **Upload Sample Data:**
   - Navigate to Dashboard → Upload Data
   - Drag and drop or select a CSV/Excel file
   - Click "Analyze Files"

2. **View Visualizations:**
   - Go to Visual Analytics
   - Explore different chart types
   - Export charts as needed

3. **Ask AI Questions:**
   - Go to Insights tab
   - Ask questions about your data
   - View quota usage in responses

4. **Test Rate Limiting:**
   - Make rapid API requests
   - Verify 429 responses after limits

---

## 📁 Project Structure

```
FlowDapt/
├── backend/                    # Backend API
│   ├── config/                 # Configuration files
│   │   └── db.js              # MongoDB connection
│   ├── middleware/             # Express middleware
│   │   ├── auth.js            # Authentication
│   │   ├── rateLimiter.js     # Rate limiting
│   │   ├── aiQuota.js         # AI & storage quotas
│   │   ├── dbCheck.js         # Database health check
│   │   └── errorHandler.js    # Error handling
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js            # User model
│   │   └── Upload.js          # Upload model
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js      # Authentication
│   │   ├── uploadRoutes.js    # File uploads
│   │   ├── aiRoutes.js        # AI analytics
│   │   └── feedbackRoutes.js  # Feedback
│   ├── utils/                  # Utilities
│   │   ├── emailService.js    # Email sending
│   │   ├── aiService.js       # AI integration
│   │   ├── fileParser.js      # File parsing
│   │   ├── logger.js          # Winston logger
│   │   └── fileCleanup.js     # Automated cleanup
│   ├── logs/                   # Log files (auto-created)
│   ├── uploads/                # Uploaded files
│   ├── .env                    # Environment variables
│   ├── .env.example            # Environment template
│   ├── package.json            # Dependencies
│   └── server.js               # Entry point
│
├── frontend/                   # Frontend React app
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities & helpers
│   │   ├── pages/              # Page components
│   │   └── App.tsx             # Main app component
│   ├── public/                 # Static assets
│   ├── .env                    # Environment variables
│   ├── .env.example            # Environment template
│   ├── package.json            # Dependencies
│   └── index.html              # HTML template
│
├── docs/                       # Documentation
│   ├── PRODUCTION_HARDENING_GUIDE.md
│   ├── PRODUCTION_READY_SUMMARY.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── TESTING_GUIDE.md
│   └── QUICK_REFERENCE.md
│
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
├── DEPLOYMENT.md               # Deployment guide
├── QUICK_START.md              # Quick start guide
├── TROUBLESHOOTING.md          # Troubleshooting
├── CONTRIBUTING.md             # Contribution guidelines
└── LICENSE                     # ISC License
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

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
- Add tests for new features
- Ensure all tests pass

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for detailed guidelines.

---

## 📞 Support

### Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started quickly
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructions
- **[PRODUCTION_HARDENING_GUIDE.md](./PRODUCTION_HARDENING_GUIDE.md)** - Production deployment
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing instructions
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference card

### Getting Help

- **GitHub Issues:** https://github.com/Sandythedev11/FlowDapt/issues
- **Email:** sandeepgouda209@gmail.com
- **Documentation:** Check the docs folder for detailed guides

### Reporting Issues

When reporting issues, please include:
- Description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)
- Relevant log files from `backend/logs/`

---

## 🗺️ Roadmap

### Completed ✅
- [x] Core analytics platform
- [x] AI-powered insights
- [x] Production-grade security
- [x] Cost control systems
- [x] Comprehensive monitoring
- [x] Automated maintenance
- [x] Premium report builder
- [x] Feedback system

### In Progress 🚧
- [ ] Real-time collaboration features
- [ ] Advanced ML models integration
- [ ] Custom report templates
- [ ] Webhook integrations

### Planned 📋
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced user roles and permissions
- [ ] API rate limiting dashboard
- [ ] Custom branding options
- [ ] White-label solutions

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Sandythedev11**
- GitHub: [@Sandythedev11](https://github.com/Sandythedev11)
- Email: sandeepgouda209@gmail.com

---

## 🙏 Acknowledgments

- **Google Gemini AI** - Intelligent analytics capabilities
- **shadcn/ui** - Beautiful, accessible UI components
- **Recharts** - Powerful data visualization
- **MongoDB Atlas** - Reliable cloud database
- **The Open Source Community** - For amazing tools and libraries

---

## 📊 Project Stats

- **Version:** 2.0.0 (Production-Hardened)
- **Status:** ✅ Production Ready
- **Security:** 5 layers of protection
- **Cost Control:** 3 quota systems
- **Monitoring:** Comprehensive logging
- **Performance:** Optimized queries
- **Reliability:** Automated maintenance

---

## 🎯 Production Readiness

| Category | Status | Details |
|----------|--------|---------|
| **Security** | ✅ Production-Ready | Rate limiting, security headers, input sanitization |
| **Cost Control** | ✅ Production-Ready | AI quotas, storage quotas, automated cleanup |
| **Monitoring** | ✅ Production-Ready | Winston logger, health checks, audit trails |
| **Performance** | ✅ Production-Ready | Database indexes, compression, connection pooling |
| **Reliability** | ✅ Production-Ready | Automated maintenance, graceful shutdown, error handling |

**Suitable for:**
- ✅ Demo/Portfolio - Ready NOW
- ✅ Beta (50-100 users) - Ready NOW
- ✅ Limited Public (1000 users) - Ready NOW
- ✅ Full Public (5000+ users) - Ready after monitoring period

---

## 💡 Key Features Summary

### Security
- Multi-layered rate limiting
- Helmet security headers
- NoSQL injection prevention
- JWT authentication
- Audit logging

### Cost Management
- AI usage quotas (20-200 queries/day)
- Storage quotas (100MB-5GB)
- Automated file cleanup
- Predictable monthly costs

### Monitoring
- Winston logger with rotation
- Separate error/security logs
- Health check endpoints
- Request tracking
- Security event logging

### Performance
- Database indexes
- Connection pooling
- Response compression
- Efficient queries

### Automation
- Daily file cleanup (2 AM)
- Monthly quota reset (1st of month)
- Weekly storage reports (Sundays)
- Graceful shutdown handling

---

**Built with ❤️ for secure, scalable, cost-effective analytics**

**Ready for production deployment!** 🚀
