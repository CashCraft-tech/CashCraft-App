# 🤝 Contributing to Bachat

Thank you for your interest in contributing to Bachat! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🎯 How Can I Contribute?

### Reporting Bugs

- Use the GitHub issue tracker
- Include detailed steps to reproduce the bug
- Provide screenshots or videos if applicable
- Include device/OS information
- Check if the bug has already been reported

### Suggesting Enhancements

- Use the GitHub issue tracker
- Clearly describe the enhancement
- Explain why this enhancement would be useful
- Include mockups or examples if applicable

### Pull Requests

- Fork the repository
- Create a feature branch
- Make your changes
- Add tests if applicable
- Update documentation
- Submit a pull request

## 🛠 Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase account
- Git

### Setup Steps

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/bachat.git
   cd bachat
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Follow the [SETUP.md](SETUP.md) guide
   - Create your own Firebase project
   - Configure `app/firebaseConfig.ts`

4. **Start Development**
   ```bash
   npx expo start
   ```

## 🔄 Pull Request Process

### Before Submitting

1. **Test Your Changes**
   - Test on both iOS and Android
   - Verify all functionality works
   - Check for any console errors

2. **Code Quality**
   - Follow coding standards
   - Add comments for complex logic
   - Ensure TypeScript types are correct

3. **Documentation**
   - Update README if needed
   - Add inline comments
   - Update any relevant documentation

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Added unit tests
- [ ] Updated documentation

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code
- [ ] I have made corresponding changes to documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing unit tests pass locally
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type when possible
- Use strict mode

### React Native

- Use functional components with hooks
- Follow React Native best practices
- Use proper prop types
- Implement proper error boundaries

### File Structure

```
app/
├── (tabs)/           # Tab navigation screens
├── auth/             # Authentication screens
├── components/       # Reusable components
├── services/         # Business logic
├── context/          # React Context
├── utils/            # Utility functions
└── support/          # Support pages
```

### Naming Conventions

- **Files**: `kebab-case` (e.g., `personal-information.tsx`)
- **Components**: `PascalCase` (e.g., `PersonalInformation`)
- **Variables**: `camelCase` (e.g., `userProfile`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

### Code Style

```typescript
// Good
const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  
  const handleUpdate = async () => {
    setLoading(true);
    try {
      await onUpdate(user);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Component content */}
    </View>
  );
};

// Bad
const userProfile = (props) => {
  const [l, setL] = useState(false);
  
  const h = async () => {
    setL(true);
    try {
      await props.onUpdate(props.user);
    } catch (e) {
      console.log(e);
    }
    setL(false);
  };

  return <View>{/* content */}</View>;
};
```

## 🧪 Testing

### Unit Tests

- Write tests for all new features
- Test edge cases and error conditions
- Maintain good test coverage
- Use descriptive test names

### Manual Testing

- Test on both iOS and Android
- Test on different screen sizes
- Test with slow network conditions
- Test offline functionality

### Test Structure

```typescript
describe('UserProfile Component', () => {
  it('should display user information correctly', () => {
    const user = mockUser;
    const { getByText } = render(<UserProfile user={user} />);
    
    expect(getByText(user.fullName)).toBeTruthy();
    expect(getByText(user.email)).toBeTruthy();
  });

  it('should handle update errors gracefully', async () => {
    const mockUpdate = jest.fn().mockRejectedValue(new Error('Update failed'));
    const { getByText } = render(
      <UserProfile user={mockUser} onUpdate={mockUpdate} />
    );
    
    fireEvent.press(getByText('Update'));
    
    await waitFor(() => {
      expect(getByText('Update failed')).toBeTruthy();
    });
  });
});
```

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
## Bug Description
Clear and concise description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Environment
- OS: [e.g. iOS 15.0, Android 12]
- Device: [e.g. iPhone 13, Samsung Galaxy S21]
- App Version: [e.g. 1.0.0]
- Expo Version: [e.g. 48.0.0]

## Additional Context
Any other context about the problem
```

## 💡 Suggesting Enhancements

### Enhancement Request Template

```markdown
## Enhancement Description
Clear and concise description of the enhancement

## Problem Statement
What problem does this solve?

## Proposed Solution
Describe the solution you'd like to see

## Alternative Solutions
Describe any alternative solutions you've considered

## Additional Context
Any other context, screenshots, or examples
```

## 📞 Getting Help

If you need help with contributing:

1. **Check Documentation**
   - [README.md](README.md)
   - [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)
   - [SETUP.md](SETUP.md)

2. **Search Issues**
   - Check existing issues for similar problems
   - Look for closed issues with solutions

3. **Create Issue**
   - Use appropriate issue template
   - Provide detailed information
   - Include screenshots if applicable

## 🏆 Recognition

Contributors will be recognized in:

- Project README
- Release notes
- GitHub contributors page
- Special mentions in documentation

## 📄 License

By contributing to Bachat, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Bachat! 🎉 