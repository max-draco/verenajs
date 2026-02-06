/**
 * verenajs ValidationEngine v2.0
 * Comprehensive validation system with 30+ rules
 *
 * @version 2.0.0
 */

// Common regex patterns
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-()]{10,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alpha: /^[a-zA-Z]+$/,
  numeric: /^\d+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  hex: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^([01]\d|2[0-3]):([0-5]\d)$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Default error messages
const MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  url: 'Please enter a valid URL',
  min: 'Must be at least {0} characters',
  max: 'Must be at most {0} characters',
  minValue: 'Must be at least {0}',
  maxValue: 'Must be at most {0}',
  between: 'Must be between {0} and {1}',
  pattern: 'Invalid format',
  alphanumeric: 'Only letters and numbers allowed',
  alpha: 'Only letters allowed',
  numeric: 'Only numbers allowed',
  integer: 'Must be a whole number',
  decimal: 'Must be a valid decimal number',
  positive: 'Must be a positive number',
  negative: 'Must be a negative number',
  date: 'Please enter a valid date',
  dateAfter: 'Date must be after {0}',
  dateBefore: 'Date must be before {0}',
  time: 'Please enter a valid time',
  creditCard: 'Please enter a valid credit card number',
  equals: 'Fields do not match',
  contains: 'Must contain "{0}"',
  startsWith: 'Must start with "{0}"',
  endsWith: 'Must end with "{0}"',
  in: 'Must be one of: {0}',
  notIn: 'Must not be one of: {0}',
  unique: 'This value is already taken',
  slug: 'Must be a valid slug (lowercase, hyphens only)',
  uuid: 'Must be a valid UUID',
  hex: 'Must be a valid hex color',
  ipv4: 'Must be a valid IPv4 address',
  json: 'Must be valid JSON',
  password: 'Password must contain uppercase, lowercase, number, and special character',
  confirmed: 'Confirmation does not match',
  file: 'Please select a valid file',
  fileSize: 'File size must be less than {0}',
  fileType: 'File type must be: {0}',
  image: 'Please select a valid image',
  custom: 'Validation failed'
};

/**
 * Format message with parameters
 */
function formatMessage(template, ...args) {
  return template.replace(/\{(\d+)\}/g, (_, index) => args[index] ?? '');
}

/**
 * Parse validation rules from string or array
 */
function parseRules(rules) {
  if (!rules) return [];
  if (Array.isArray(rules)) return rules;
  if (typeof rules === 'string') {
    return rules.split('|').map(rule => {
      const [name, param] = rule.split(':');
      return { name, param: param?.split(',') };
    });
  }
  if (typeof rules === 'object') {
    return Object.entries(rules).map(([name, param]) => ({
      name,
      param: Array.isArray(param) ? param : [param]
    }));
  }
  return [];
}

/**
 * Main ValidationEngine class
 */
export class ValidationEngine {
  constructor(options = {}) {
    this.messages = { ...MESSAGES, ...options.messages };
    this.customRules = options.customRules || {};
    this.stopOnFirst = options.stopOnFirst ?? false;
  }

  /**
   * Validate a single value against rules
   */
  validate(value, rules, context = {}) {
    const errors = [];
    const parsedRules = parseRules(rules);

    for (const rule of parsedRules) {
      const error = this.validateRule(value, rule, context);
      if (error) {
        errors.push(error);
        if (this.stopOnFirst) break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      value
    };
  }

  /**
   * Validate a single rule
   */
  validateRule(value, rule, context) {
    const { name, param = [] } = rule;
    const isEmpty = value === '' || value === null || value === undefined;

    // Check custom rules first
    if (this.customRules[name]) {
      const result = this.customRules[name](value, param, context);
      if (result !== true) {
        return typeof result === 'string' ? result : this.messages[name] || this.messages.custom;
      }
      return null;
    }

    // Built-in rules
    switch (name) {
      case 'required':
        if (isEmpty || (Array.isArray(value) && value.length === 0)) {
          return this.messages.required;
        }
        break;

      case 'email':
        if (!isEmpty && !PATTERNS.email.test(value)) {
          return this.messages.email;
        }
        break;

      case 'phone':
        if (!isEmpty && !PATTERNS.phone.test(value)) {
          return this.messages.phone;
        }
        break;

      case 'url':
        if (!isEmpty && !PATTERNS.url.test(value)) {
          return this.messages.url;
        }
        break;

      case 'min':
        if (!isEmpty) {
          const minLength = parseInt(param[0], 10);
          if (String(value).length < minLength) {
            return formatMessage(this.messages.min, minLength);
          }
        }
        break;

      case 'max':
        if (!isEmpty) {
          const maxLength = parseInt(param[0], 10);
          if (String(value).length > maxLength) {
            return formatMessage(this.messages.max, maxLength);
          }
        }
        break;

      case 'minValue':
        if (!isEmpty) {
          const minVal = parseFloat(param[0]);
          if (parseFloat(value) < minVal) {
            return formatMessage(this.messages.minValue, minVal);
          }
        }
        break;

      case 'maxValue':
        if (!isEmpty) {
          const maxVal = parseFloat(param[0]);
          if (parseFloat(value) > maxVal) {
            return formatMessage(this.messages.maxValue, maxVal);
          }
        }
        break;

      case 'between':
        if (!isEmpty) {
          const [minB, maxB] = param.map(Number);
          const numVal = parseFloat(value);
          if (numVal < minB || numVal > maxB) {
            return formatMessage(this.messages.between, minB, maxB);
          }
        }
        break;

      case 'pattern':
        if (!isEmpty) {
          const regex = new RegExp(param[0]);
          if (!regex.test(value)) {
            return param[1] || this.messages.pattern;
          }
        }
        break;

      case 'alphanumeric':
        if (!isEmpty && !PATTERNS.alphanumeric.test(value)) {
          return this.messages.alphanumeric;
        }
        break;

      case 'alpha':
        if (!isEmpty && !PATTERNS.alpha.test(value)) {
          return this.messages.alpha;
        }
        break;

      case 'numeric':
        if (!isEmpty && !PATTERNS.numeric.test(value)) {
          return this.messages.numeric;
        }
        break;

      case 'integer':
        if (!isEmpty && !Number.isInteger(Number(value))) {
          return this.messages.integer;
        }
        break;

      case 'decimal':
        if (!isEmpty && isNaN(parseFloat(value))) {
          return this.messages.decimal;
        }
        break;

      case 'positive':
        if (!isEmpty && parseFloat(value) <= 0) {
          return this.messages.positive;
        }
        break;

      case 'negative':
        if (!isEmpty && parseFloat(value) >= 0) {
          return this.messages.negative;
        }
        break;

      case 'date':
        if (!isEmpty && !PATTERNS.date.test(value)) {
          return this.messages.date;
        }
        break;

      case 'dateAfter':
        if (!isEmpty) {
          const afterDate = new Date(param[0]);
          if (new Date(value) <= afterDate) {
            return formatMessage(this.messages.dateAfter, param[0]);
          }
        }
        break;

      case 'dateBefore':
        if (!isEmpty) {
          const beforeDate = new Date(param[0]);
          if (new Date(value) >= beforeDate) {
            return formatMessage(this.messages.dateBefore, param[0]);
          }
        }
        break;

      case 'time':
        if (!isEmpty && !PATTERNS.time.test(value)) {
          return this.messages.time;
        }
        break;

      case 'creditCard':
        if (!isEmpty) {
          const cleaned = value.replace(/\D/g, '');
          if (!PATTERNS.creditCard.test(cleaned) || !this.luhnCheck(cleaned)) {
            return this.messages.creditCard;
          }
        }
        break;

      case 'equals':
        if (!isEmpty) {
          const otherValue = context[param[0]];
          if (value !== otherValue) {
            return this.messages.equals;
          }
        }
        break;

      case 'confirmed':
        if (!isEmpty) {
          const confirmField = context[`${context._fieldName}_confirmation`];
          if (value !== confirmField) {
            return this.messages.confirmed;
          }
        }
        break;

      case 'contains':
        if (!isEmpty && !String(value).includes(param[0])) {
          return formatMessage(this.messages.contains, param[0]);
        }
        break;

      case 'startsWith':
        if (!isEmpty && !String(value).startsWith(param[0])) {
          return formatMessage(this.messages.startsWith, param[0]);
        }
        break;

      case 'endsWith':
        if (!isEmpty && !String(value).endsWith(param[0])) {
          return formatMessage(this.messages.endsWith, param[0]);
        }
        break;

      case 'in':
        if (!isEmpty && !param.includes(String(value))) {
          return formatMessage(this.messages.in, param.join(', '));
        }
        break;

      case 'notIn':
        if (!isEmpty && param.includes(String(value))) {
          return formatMessage(this.messages.notIn, param.join(', '));
        }
        break;

      case 'slug':
        if (!isEmpty && !PATTERNS.slug.test(value)) {
          return this.messages.slug;
        }
        break;

      case 'uuid':
        if (!isEmpty && !PATTERNS.uuid.test(value)) {
          return this.messages.uuid;
        }
        break;

      case 'hex':
        if (!isEmpty && !PATTERNS.hex.test(value)) {
          return this.messages.hex;
        }
        break;

      case 'ipv4':
        if (!isEmpty && !PATTERNS.ipv4.test(value)) {
          return this.messages.ipv4;
        }
        break;

      case 'json':
        if (!isEmpty) {
          try {
            JSON.parse(value);
          } catch {
            return this.messages.json;
          }
        }
        break;

      case 'password':
        if (!isEmpty && !PATTERNS.password.test(value)) {
          return this.messages.password;
        }
        break;

      case 'file':
        if (value && !(value instanceof File)) {
          return this.messages.file;
        }
        break;

      case 'fileSize':
        if (value instanceof File) {
          const maxSize = this.parseFileSize(param[0]);
          if (value.size > maxSize) {
            return formatMessage(this.messages.fileSize, param[0]);
          }
        }
        break;

      case 'fileType':
        if (value instanceof File) {
          const allowedTypes = param;
          const fileType = value.type.split('/')[1];
          if (!allowedTypes.includes(fileType) && !allowedTypes.includes(value.type)) {
            return formatMessage(this.messages.fileType, param.join(', '));
          }
        }
        break;

      case 'image':
        if (value instanceof File && !value.type.startsWith('image/')) {
          return this.messages.image;
        }
        break;
    }

    return null;
  }

  /**
   * Validate an object with multiple fields
   */
  validateAll(data, schema) {
    const results = {};
    const allErrors = {};
    let isValid = true;

    for (const [field, rules] of Object.entries(schema)) {
      const context = { ...data, _fieldName: field };
      const result = this.validate(data[field], rules, context);
      results[field] = result;

      if (!result.valid) {
        isValid = false;
        allErrors[field] = result.errors;
      }
    }

    return {
      valid: isValid,
      errors: allErrors,
      results
    };
  }

  /**
   * Add a custom validation rule
   */
  addRule(name, validator, message) {
    this.customRules[name] = validator;
    if (message) {
      this.messages[name] = message;
    }
  }

  /**
   * Luhn algorithm for credit card validation
   */
  luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Parse file size string (e.g., "5MB", "1GB")
   */
  parseFileSize(size) {
    const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
    const match = String(size).match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/i);
    if (!match) return parseInt(size, 10);
    return parseFloat(match[1]) * (units[match[2]?.toUpperCase() || 'B'] || 1);
  }
}

/**
 * Create a form validator helper
 */
export function createFormValidator(schema, options = {}) {
  const engine = new ValidationEngine(options);

  return {
    validateField(name, value, allValues = {}) {
      if (!schema[name]) return { valid: true, errors: [] };
      const context = { ...allValues, _fieldName: name };
      return engine.validate(value, schema[name], context);
    },

    validateForm(values) {
      return engine.validateAll(values, schema);
    },

    addRule(name, validator, message) {
      engine.addRule(name, validator, message);
    }
  };
}

/**
 * Validate data reactively (for use with inputs)
 */
export function createReactiveValidator(rules, options = {}) {
  const engine = new ValidationEngine(options);
  let lastValue = undefined;
  let lastResult = { valid: true, errors: [] };

  return {
    validate(value, context = {}) {
      if (value !== lastValue) {
        lastValue = value;
        lastResult = engine.validate(value, rules, context);
      }
      return lastResult;
    },

    get isValid() {
      return lastResult.valid;
    },

    get errors() {
      return lastResult.errors;
    },

    reset() {
      lastValue = undefined;
      lastResult = { valid: true, errors: [] };
    }
  };
}

// Export singleton instance
export const validator = new ValidationEngine();

// Export patterns for external use
export { PATTERNS, MESSAGES };

export default ValidationEngine;
