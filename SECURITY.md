# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | :white_check_mark: Yes |
| Older   | :x: No     |

## Reporting a Vulnerability

To report a security vulnerability, please:

1. **Do NOT** open a public issue
2. Email: security@example.com
3. Or use GitHub's private vulnerability reporting

We will:
- Acknowledge your report within 24 hours
- Provide a timeline for fix within 7 days
- Credit you in the release notes (if desired)

## Security Best Practices

- Dependencies are audited automatically via npm audit
- CI/CD includes security scanning
- Secrets are never committed to the repository
- Environment variables are used for sensitive configuration
- All user input is validated and sanitized

## Common Security Considerations

### Environment Variables
Never commit `.env` files. Use `.env.example` as a template for required variables.

### Dependencies
- Run `npm audit` regularly to check for vulnerabilities
- Keep dependencies up to date
- Review changes to `package.json` before merging

### Data Handling
- Course data is read-only from the catalog file
- User preferences are stored in localStorage
- No sensitive user data is collected or stored
