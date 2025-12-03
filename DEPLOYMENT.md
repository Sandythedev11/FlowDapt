# FlowDapt Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

#### Backend (.env)
Ensure your `backend/.env` file contains:
- ✅ MongoDB connection string (production database)
- ✅ JWT secret (minimum 32 characters)
- ✅ Gmail SMTP credentials
- ✅ Google Gemini API key
- ✅ Production frontend URL

#### Frontend (.env)
Ensure your `frontend/.env` file contains:
- ✅ Production backend API URL

### 2. Security Verification

- ✅ `.env` files are in `.gitignore`
- ✅ No sensitive data in code
- ✅ All API keys are environment variables
- ✅ CORS configured for production domain
- ✅ MongoDB IP whitelist updated

### 3. Build Verification

```bash
# Test backend
cd backend
npm install
npm start

# Test frontend
cd frontend
npm install
npm run build
npm run preview
```

## GitHub Deployment

### Initial Setup

```bash
# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/Sandythedev11/FlowDapt.git

# Verify remote
git remote -v
```

### Clean Deployment (Overwrite Remote)

```bash
# Stage all files
git add .

# Commit changes
git commit -m "Clean deployment: Production-ready FlowDapt v1.0"

# Force push to overwrite remote
git push -f origin main
```

**⚠️ Warning:** Force push will overwrite all remote history. Ensure you have backups if needed.

### Standard Deployment (Preserve History)

```bash
# Pull latest changes
git pull origin main

# Stage all files
git add .

# Commit changes
git commit -m "Update: Production-ready FlowDapt"

# Push changes
git push origin main
```

## Production Deployment

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

#### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. Add environment variable: `VITE_API_URL`
5. Deploy

#### Backend (Railway/Render)
1. Connect GitHub repository
2. Set root directory: `backend`
3. Set start command: `npm start`
4. Add all environment variables from `.env`
5. Deploy

### Option 2: VPS (DigitalOcean, AWS, etc.)

#### Backend Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/Sandythedev11/FlowDapt.git
cd FlowDapt/backend

# Install dependencies
npm install

# Create .env file
nano .env
# (Add all environment variables)

# Start with PM2
pm2 start server.js --name flowdapt-backend
pm2 save
pm2 startup
```

#### Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Build
npm run build

# Serve with nginx or serve
sudo npm install -g serve
serve -s dist -l 3000
```

### Option 3: Docker

#### Create Dockerfile (Backend)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Create Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
```

## Post-Deployment

### 1. Verify Deployment
- ✅ Frontend loads correctly
- ✅ Backend API responds
- ✅ Database connection works
- ✅ Email service functional
- ✅ AI insights working
- ✅ File uploads working

### 2. Monitor
- Check server logs
- Monitor error rates
- Track API response times
- Monitor database performance

### 3. Backup
- Regular database backups
- Environment variable backups
- Code repository backups

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
- Verify connection string
- Check IP whitelist in MongoDB Atlas
- Ensure network access is configured

#### 2. SMTP Email Not Sending
- Verify Gmail App Password
- Check 2-Step Verification is enabled
- Ensure SMTP credentials are correct

#### 3. AI Insights Not Working
- Verify Gemini API key
- Check API quota/limits
- Ensure API is enabled in Google Cloud

#### 4. CORS Errors
- Update CORS configuration in backend
- Verify frontend URL in backend .env
- Check production domain settings

#### 5. Build Failures
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies are installed

## Maintenance

### Regular Updates
```bash
# Pull latest changes
git pull origin main

# Update dependencies
cd backend && npm update
cd ../frontend && npm update

# Rebuild and restart
pm2 restart flowdapt-backend
```

### Database Maintenance
- Regular backups
- Index optimization
- Monitor storage usage
- Clean up old sessions

### Security Updates
- Keep dependencies updated
- Monitor security advisories
- Rotate API keys periodically
- Review access logs

## Support

For issues or questions:
- GitHub Issues: https://github.com/Sandythedev11/FlowDapt/issues
- Email: support@flowdapt.com

## License

This project is licensed under the MIT License - see the LICENSE file for details.
