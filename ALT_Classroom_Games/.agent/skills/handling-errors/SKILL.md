---
name: handling-errors
description: Comprehensive guide to error handling patterns, custom exceptions, and resilience strategies (Retry, Circuit Breaker) for Python, TypeScript, Rust, and Go. Use when hardening applications or debugging production failures.
---

# Error Handling Patterns

Build resilient applications with robust error handling strategies that gracefully handle failures and provide excellent debugging experiences.

## When to Use This Skill
- Implementing error handling in new features
- Designing error-resilient APIs
- Debugging production issues
- Improving application reliability
- Creating better error messages for users and developers
- Implementing retry and circuit breaker patterns
- Handling async/concurrent errors
- Building fault-tolerant distributed systems

## Core Concepts

### 1. Error Handling Philosophies
- **Exceptions**: Traditional try-catch. best for unexpected errors or exceptional conditions. Disrupts control flow.
- **Result Types**: Explicit success/failure (Functional approach). Best for expected errors and validation failures.
- **Error Codes**: C-style, requires discipline.
- **Option/Maybe Types**: For nullable values.
- **Panics/Crashes**: Unrecoverable errors, programming bugs.

### 2. Error Categories
- **Recoverable Errors**: Network timeouts, missing files, invalid input, rate limits.
- **Unrecoverable Errors**: OOM, Stack overflow, programming bugs (null pointers).

## Language-Specific Patterns

### Python
#### Custom Exception Hierarchy
```python
class ApplicationError(Exception):
    """Base exception for all application errors."""
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow()

class ValidationError(ApplicationError):
    pass

class NotFoundError(ApplicationError):
    pass
```

#### Context Managers & Decorators
```python
@contextmanager
def database_transaction(session):
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# usage
with database_transaction(db.session) as session: ...
```

#### Retry with Exponential Backoff
```python
def retry(max_attempts=3, backoff_factor=2.0, exceptions=(Exception,)):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions:
                    if attempt < max_attempts - 1:
                        time.sleep(backoff_factor ** attempt)
                        continue
                    raise
        return wrapper
    return decorator
```

### TypeScript/JavaScript
#### Custom Error Classes
```typescript
class ApplicationError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
```

#### Result Type Pattern
```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function Ok<T>(value: T): Result<T, never> { return { ok: true, value }; }
function Err<E>(error: E): Result<never, E> { return { ok: false, error }; }
```

### Rust
- Use `Result<T, E>` for recoverable errors.
- Use `Option<T>` for nullable values.
- Implement `From` trait for custom error conversion.

### Go
- Use explicit error returns: `func getUser() (*User, error)`.
- Use custom error structs for data interception.
- Check errors with `errors.Is` and `errors.As`.

## Universal Resilience Patterns

### 1. Circuit Breaker
Prevent cascading failures in distributed systems.
- **States**: CLOSED (Normal), OPEN (Failing), HALF_OPEN (Testing).
- **Logic**: Trip after N failures, wait T timeout, allow 1 test request (Half-Open), reset on success.

### 2. Error Aggregation
Collect multiple errors instead of failing on the first one (e.g., Form Validation).
```typescript
class ErrorCollector {
    private errors: Error[] = [];
    add(e: Error) { this.errors.push(e); }
    throw() { if(this.errors.length) throw new AggregateError(this.errors); }
}
```

### 3. Graceful Degradation
Provide fallback functionality when errors occur.
```python
def get_user_profile(user_id):
    try:
        return fetch_from_cache(user_id)
    except:
        return fetch_from_database(user_id)
```

## Best Practices
1.  **Fail Fast**: Validate input early.
2.  **Preserve Context**: Include stack traces and metadata.
3.  **Meaningful Messages**: Explain what happened and how to fix it.
4.  **Log Appropriately**: Don't spam logs with expected failures.
5.  **Clean Up**: Use `try-finally`, `defer`, or context managers.
6.  **Don't Swallow Errors**: Log or re-throw.
7.  **Type-Safe Errors**: Use typed errors where possible.

## Common Pitfalls
- `except Exception:` (Catching too broadly)
- Empty catch blocks.
- Logging AND re-throwing (duplicate logs).
- "Error occurred" messages (vague).
- Ignoring Async errors (unhandled promise rejections).

## Resources
- `references/exception-hierarchy-design.md`
- `references/error-recovery-strategies.md`
- `references/async-error-handling.md`
- `scripts/error-analyzer.py`
