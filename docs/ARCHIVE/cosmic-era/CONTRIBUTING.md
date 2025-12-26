# Contributing to CivicBase

First off, thank you for considering contributing to CivicBase! It's people like you that make CivicBase such a great tool for fostering meaningful connections across different spheres of life.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct (to be developed - for now, please be respectful and inclusive in all interactions).

## How Can I Contribute?

### Reporting Bugs

- Ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/yourusername/CivicBase/issues).
- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/yourusername/CivicBase/issues/new). Be sure to include a title and clear description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

- Open a new issue with a clear title and detailed description of the suggested enhancement.
- Provide any relevant examples or mock-ups if applicable.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

1. Fork and clone the repo.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Set up PostgreSQL and create a database for the project.
6. Copy `.env.example` to `.env` and fill in your database credentials.
7. Run database migrations: `alembic upgrade head`
8. Run tests to ensure everything is set up correctly: `python -m unittest discover tests`

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### Python Styleguide

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/).
- Use 4 spaces for indentation (not tabs).
- Use docstrings for functions, classes, and modules.
- Write clear, readable code with descriptive variable names.

### Documentation Styleguide

- Use Markdown for documentation.
- Reference functions, classes, and modules in backticks.
- Provide clear, concise explanations with examples where appropriate.

## Additional Notes

### Issue and Pull Request Labels

This section lists the labels we use to help us track and manage issues and pull requests.

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `question`: Further information is requested

## Sphere-Specific Contributions

When contributing to sphere-specific features (MindSpheres, HeartSpheres, BodySpheres), please:

1. Clearly indicate which sphere(s) your contribution affects.
2. Consider cross-sphere implications and document them.
3. Ensure your contribution aligns with the ethical framework of CivicBase.

Thank you for your interest in contributing to CivicBase. Your efforts help create a more connected and collaborative world!
