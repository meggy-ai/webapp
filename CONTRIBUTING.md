# Contributing to Meggy AI Frontend

Thank you for your interest in contributing to Meggy AI! 🎉

This document provides guidelines for contributing to the project. Please read it carefully before making any contributions.

## 🌟 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/webapp.git
   cd webapp
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### Branch Naming Convention

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/update-description` - Documentation updates
- `refactor/component-name` - Code refactoring
- `chore/task-description` - Maintenance tasks

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(auth): add login functionality
fix(chat): resolve message sending issue
docs(readme): update installation guide
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

### Pre-commit Hooks

The project uses Husky for pre-commit hooks that will:

- Run ESLint and fix auto-fixable issues
- Format code with Prettier
- Type-check with TypeScript
- Validate commit messages

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run type-check
```

### Writing Tests

- Write unit tests for utility functions
- Add component tests for React components
- Include integration tests for complex features
- Use React Testing Library for component testing

## 📝 Code Style

### ESLint & Prettier

Code style is enforced by ESLint and Prettier. Run:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Fix auto-fixable issues
npm run format      # Format with Prettier
```

### TypeScript

- Use strict TypeScript configuration
- Define proper types for all APIs
- Avoid `any` type - use specific types or `unknown`
- Export types from dedicated type files

### Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow the established folder structure
- Use shadcn/ui components when possible

## 🗂️ Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── chat/             # Chat-specific components
│   ├── layout/           # Layout components
│   └── shared/           # Shared components
├── lib/                  # Utilities and configurations
│   ├── api/              # API clients
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # State management
│   └── utils/            # Utility functions
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## 🎯 Pull Request Process

1. **Create Feature Branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Locally**

   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

4. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and Create PR**

   ```bash
   git push origin feat/your-feature-name
   ```

   Then create a pull request on GitHub

6. **PR Requirements**
   - Clear description of changes
   - Link to related issue
   - Screenshots for UI changes
   - All checks must pass
   - Approval from maintainers

## 🐛 Reporting Bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details

## ✨ Suggesting Features

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- Clear description of the feature
- Motivation and use cases
- Proposed implementation
- Alternative solutions considered

## 📞 Getting Help

- **Discord:** [Join our Discord server](https://discord.gg/meggy-ai)
- **GitHub Discussions:** Use GitHub Discussions for questions
- **Issues:** Create an issue for bugs or feature requests

## 🏆 Recognition

Contributors will be:

- Added to the contributors list
- Mentioned in release notes for significant contributions
- Invited to the contributors Discord channel

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

Thank you for contributing to Meggy AI! 🚀
