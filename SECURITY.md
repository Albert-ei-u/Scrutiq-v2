# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Scrutiq, **please do not open a public GitHub issue.**

Public disclosure of a vulnerability gives attackers a window to exploit it before a fix is in place. We ask for responsible disclosure instead.

### How to Report

1. Go to the [Security tab](https://github.com/achille010/scrutiq/security) of this repository.
2. Click **"Report a vulnerability"** to open a private security advisory.
3. Describe the vulnerability clearly, including:
   - What the issue is.
   - How to reproduce it.
   - What impact it could have.
   - Any suggested fix if you have one.

Alternatively, you can reach out directly to the maintainers through GitHub.

---

## What to Expect

- We will acknowledge your report within **3 business days**.
- We will investigate and keep you updated on our progress.
- Once a fix is deployed, we will credit you in the release notes (unless you prefer to remain anonymous).

---

## Supported Versions

| Version | Supported |
|---|---|
| `main` branch | Yes |
| Older branches | No |

---

## Good Faith

We will not take legal action against researchers who report vulnerabilities in good faith and follow this policy. We appreciate the work of the security community in keeping open-source projects safe.

---

## Scope

The following are in scope for security reports:

- Authentication and authorization flaws.
- Data exposure or leakage via the API.
- Injection vulnerabilities (SQL, command, etc.).
- Broken access control.
- Exposure of environment variables or secrets.

The following are **out of scope**:

- Denial-of-service attacks.
- Issues that require physical access to a device.
- Issues in third-party dependencies (report these upstream).
