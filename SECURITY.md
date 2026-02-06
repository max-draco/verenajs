# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in verenajs, please report it responsibly:

1. **Do NOT** open a public issue
2. Email security details to: **security@northfast.co.ke**
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within **48 hours** and keep you updated on progress.

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.0.x   | Yes |
| 1.x.x   | Security fixes only |
| < 1.0   | No |

---

## Security Measures

### Built-in Protections

verenajs includes several security measures by default:

#### XSS Prevention
- Components use DOM APIs (not innerHTML)
- User input is not directly injected into HTML
- Event handlers are properly bound

```javascript
// Safe - uses textContent
const el = document.createElement('div');
el.textContent = userInput; // Escaped automatically

// Avoid this pattern
el.innerHTML = userInput; // Unsafe!
```

#### Content Security Policy
- No inline scripts required
- Compatible with strict CSP headers
- No eval() or Function() usage

Recommended CSP header:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
```

#### Dependency Security
- Minimal external dependencies
- Regular security audits
- Dependabot alerts enabled

---

## Platform-Specific Security

### ZeroMQ Communication

When using ZeroMQ:

```javascript
import zmq from 'verenajs/core/zeromq';

// Always use secure WebSocket (wss://)
await zmq.initialize({
  wsUrl: 'wss://your-server.com:5555'
});
```

Recommendations:
- Use TLS/SSL for all connections
- Implement message signing
- Validate all incoming data

### Qt Bridge (Desktop)

Desktop apps have additional considerations:

```javascript
import { QtDialogs } from 'verenajs/core/bridges/qt';

// File dialogs are sandboxed
const file = await QtDialogs.openFile({
  filters: [{ name: 'Safe Types', extensions: ['txt', 'json'] }]
});
```

Recommendations:
- Limit file type access
- Validate file contents
- Use least-privilege permissions

### Mobile (Capacitor)

Mobile apps should:
- Request only necessary permissions
- Store sensitive data in secure storage
- Use certificate pinning for API calls

---

## Best Practices

### Input Validation

```javascript
import { createInput } from 'verenajs';

const emailInput = createInput({
  type: 'email',
  required: true,
  // Built-in HTML5 validation
});

// Additional server-side validation required
form.onSubmit = (data) => {
  if (!isValidEmail(data.email)) {
    throw new Error('Invalid email');
  }
};
```

### Secure Storage

```javascript
// Don't store sensitive data in localStorage
// Use secure alternatives:

// Browser - Encrypted IndexedDB
// Desktop - OS Keychain via Qt
// Mobile - Secure Storage via Capacitor
```

### API Security

```javascript
// Always validate API responses
const response = await fetch('/api/data');
const data = await response.json();

// Validate structure before using
if (!isValidDataStructure(data)) {
  throw new Error('Invalid API response');
}
```

---

## Security Updates

Security patches are released as soon as possible after verification:

1. **Critical**: Within 24 hours
2. **High**: Within 72 hours
3. **Medium**: Within 1 week
4. **Low**: Next regular release

Subscribe to security advisories:
- Watch the GitHub repository
- Check the [Changelog](CHANGELOG.md)

---

## Acknowledgments

We thank the following for responsible disclosure:
- (Your name could be here)

---

## Contact

- Security issues: security@northfast.co.ke
- General questions: [GitHub Issues](https://github.com/muslihabdiker/vplusplus/issues)
