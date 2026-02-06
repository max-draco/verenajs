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

## Visual Builder Security

### Code Generation

The Visual Builder generates clean, secure code:

```javascript
import { generateCode, builderState } from 'verenajs/builder';

// Generated code uses safe DOM APIs
const code = generateCode(builderState.componentTree, 'verenajs');
```

Generated code features:
- No eval() usage
- No innerHTML with user data
- Proper event binding
- Escaped string content

### Export Security

When exporting from the Visual Builder:
- All user content is properly escaped
- No sensitive data is included in exports
- Generated code follows security best practices

### Builder Permissions

The Visual Builder runs in the browser context and:
- Cannot access filesystem directly
- Cannot make unauthorized network requests
- Cannot execute arbitrary code

---

## API Manager Security

### Webhook Security

```javascript
import { WebhookManager } from 'verenajs/core/api-manager';

const webhooks = new WebhookManager({
  secret: process.env.WEBHOOK_SECRET // Never hardcode secrets
});

// HMAC signature verification
webhooks.register({
  id: 'orders',
  url: 'https://your-app.com/webhooks/orders',
  events: ['order.created']
});

// Verify incoming webhooks
const isValid = webhooks.verify(signature, payload);
if (!isValid) {
  throw new Error('Invalid webhook signature');
}
```

### API Client Security

```javascript
import { ApiClient } from 'verenajs/core/api-manager';

const api = new ApiClient({
  baseUrl: 'https://api.example.com',
  headers: {
    'Authorization': `Bearer ${token}` // Use secure token storage
  }
});

// Add security interceptors
api.addInterceptor('request', (config) => {
  // Add request ID for tracing
  config.headers['X-Request-ID'] = crypto.randomUUID();
  return config;
});

api.addInterceptor('response', (response) => {
  // Handle unauthorized responses
  if (response.status === 401) {
    // Redirect to login or refresh token
  }
  return response;
});
```

### Backend Connector Security

```javascript
import { BackendConnector } from 'verenajs/core/api-manager';

const backend = new BackendConnector();

// Use TLS for all connections
await backend.connect('python', {
  host: 'localhost',
  port: 5000,
  secure: true, // Enforces HTTPS
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

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
- Use authentication tokens

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
- Sandbox file operations

### Mobile (Capacitor)

Mobile apps should:
- Request only necessary permissions
- Store sensitive data in secure storage
- Use certificate pinning for API calls
- Implement biometric authentication

```javascript
// Use Capacitor's secure storage
import { Preferences } from '@capacitor/preferences';

// Store sensitive data encrypted
await Preferences.set({
  key: 'auth_token',
  value: encryptedToken
});
```

---

## Docker Security

### Secure Dockerfile Practices

```javascript
import { DockerfileGenerator } from 'verenajs/core/docker-integration';

const dockerfile = new DockerfileGenerator();
const content = dockerfile.generate({
  type: 'verenajs',
  nodeVersion: '20-alpine', // Use minimal images
  user: 'node', // Run as non-root
  readOnlyRoot: true // Read-only filesystem
});
```

### Container Security

```yaml
# docker-compose.yml
services:
  app:
    security_opt:
      - no-new-privileges:true
    read_only: true
    user: "1000:1000"
    cap_drop:
      - ALL
```

---

## Plugin Security

### Plugin Isolation

Plugins run in a sandboxed environment:

```javascript
import { PluginManager } from 'verenajs/core/plugin-manager';

const plugins = new PluginManager({
  sandbox: true, // Enable sandboxing
  permissions: ['network', 'storage'] // Limit permissions
});

await plugins.install('analytics');
```

### Plugin Verification

- All built-in plugins are verified
- Third-party plugins should be reviewed before use
- Plugin marketplace includes security ratings

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

### Environment Variables

```javascript
// Never hardcode secrets
// Use environment variables

// Wrong
const secret = 'my-secret-key';

// Correct
const secret = process.env.SECRET_KEY;
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

## Security Checklist

Before deploying to production:

- [ ] Use HTTPS for all connections
- [ ] Implement proper authentication
- [ ] Validate all user input
- [ ] Use secure storage for sensitive data
- [ ] Set appropriate CSP headers
- [ ] Keep dependencies updated
- [ ] Enable logging and monitoring
- [ ] Test for common vulnerabilities (OWASP Top 10)

---

## Acknowledgments

We thank the following for responsible disclosure:
- (Your name could be here)

---

## Contact

- Security issues: security@northfast.co.ke
- General questions: [GitHub Issues](https://github.com/muslihabdiker/vplusplus/issues)
