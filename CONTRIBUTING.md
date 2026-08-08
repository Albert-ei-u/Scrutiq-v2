# Contributing to Scrutiq

Thank you for your interest in contributing. This guide will help you get set up and explain how to work with the codebase effectively.

---

## Table of Contents

- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Getting Started

1. **Fork** the repository to your GitHub account.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/scrutiq.git
   cd scrutiq
   ```
3. **Install dependencies** (root + client + server):
   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```
4. **Set up your `.env`** file in `server/` as described in the [README](README.md).
5. **Run migrations**:
   ```bash
   npm run migrate
   ```
6. **Start the dev environment**:
   ```bash
   npm run dev
   ```

---

## How to Contribute

1. Check the [Issues](https://github.com/achille010/scrutiq/issues) tab to see what needs work.
2. If there is no existing issue for your change, open one first and describe what you plan to do.
3. Once the issue is confirmed, create a branch (see below) and start coding.
4. When done, open a Pull Request against the `main` branch.

---

## Branch Naming

Use clear, descriptive branch names following this pattern:

| Type | Format | Example |
|---|---|---|
| New feature | `feat/short-description` | `feat/quiz-timer` |
| Bug fix | `fix/short-description` | `fix/score-calculation` |
| Documentation | `docs/short-description` | `docs/api-endpoints` |
| Refactor | `refactor/short-description` | `refactor/auth-middleware` |

---

## Commit Messages

Write clear and concise commit messages. Follow this format:

```
type: short description (max 72 chars)

Optional body explaining the why, not the what.
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```
feat: add time limit to quiz sessions
fix: correct score calculation on retake
docs: update setup instructions in README
```

---

## Pull Request Process

1. Make sure your branch is up to date with `main` before opening a PR.
2. Fill out the PR template completely.
3. Keep PRs focused — one feature or fix per PR.
4. Request a review from at least one collaborator.
5. Address all review comments before the PR is merged.
6. PRs are merged using **squash and merge** to keep the history clean.

---

## Code Style

- All code is written in **TypeScript**. Avoid `any` types where possible.
- Use **2-space indentation**.
- Keep components and functions small and single-purpose.
- Name variables and functions clearly — prefer readability over brevity.
- The project uses **Tailwind CSS** on the frontend. Avoid writing custom CSS unless absolutely necessary.
- Run your code and make sure there are no TypeScript errors before opening a PR.

---

## Reporting Bugs

Open an issue with:

- A clear title describing the problem.
- Steps to reproduce the bug.
- What you expected to happen.
- What actually happened.
- Screenshots or error logs if available.
- Your OS, Node.js version, and browser.

---

## Suggesting Features

Open an issue with:

- A clear title for the feature.
- The problem it solves or the use case behind it.
- A rough description of how it could work.

Features that align with the project's core purpose (quiz and assessment) will be prioritized.

---

## Questions?

If anything here is unclear, open an issue or reach out directly to the maintainers.
