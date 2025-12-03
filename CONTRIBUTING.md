# Contributing to FlowDapt

Thank you for your interest in contributing to FlowDapt! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Sandythedev11/FlowDapt/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check existing feature requests in [Issues](https://github.com/Sandythedev11/FlowDapt/issues)
2. Create a new issue with:
   - Clear feature description
   - Use case and benefits
   - Possible implementation approach
   - Any relevant examples or mockups

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- Gmail account for SMTP
- Google Gemini API key

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/FlowDapt.git
cd FlowDapt

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

## Coding Standards

### General
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

### TypeScript/JavaScript
- Use TypeScript for frontend
- Use ES6+ features
- Avoid `any` types when possible
- Use async/await over callbacks
- Handle errors properly

### React
- Use functional components
- Use hooks appropriately
- Keep components small and reusable
- Follow component naming conventions
- Use proper prop types

### Backend
- Follow RESTful API conventions
- Validate all inputs
- Handle errors gracefully
- Use middleware appropriately
- Document API endpoints

## Testing

### Before Submitting PR
- Test all affected features
- Test on different browsers
- Test responsive design
- Check console for errors
- Verify no breaking changes

### Manual Testing Checklist
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] File upload works
- [ ] Charts render correctly
- [ ] AI insights generate
- [ ] Report builder works
- [ ] Feedback system works
- [ ] Settings update correctly

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add new chart type for data visualization
fix: Resolve email verification bug
docs: Update README with deployment instructions
style: Format code according to style guide
refactor: Simplify authentication logic
test: Add tests for upload functionality
chore: Update dependencies
```

## Project Structure

```
FlowDapt/
├── backend/
│   ├── config/         # Database configuration
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── server.js       # Entry point
├── frontend/
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   ├── lib/        # Utilities
│   │   ├── pages/      # Page components
│   │   └── App.tsx     # Main app
│   └── index.html
├── .gitignore
├── README.md
└── LICENSE
```

## Areas for Contribution

### High Priority
- Additional chart types
- Enhanced AI insights
- Performance optimizations
- Mobile responsiveness improvements
- Accessibility enhancements

### Medium Priority
- Additional file format support
- Advanced filtering options
- Data export formats
- User preferences
- Notification system

### Low Priority
- UI/UX improvements
- Documentation updates
- Code refactoring
- Test coverage
- Internationalization

## Questions?

Feel free to:
- Open an issue for discussion
- Reach out to maintainers
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to FlowDapt! 🚀
