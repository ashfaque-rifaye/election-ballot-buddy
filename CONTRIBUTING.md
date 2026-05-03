# Contributing to Election Ballot Buddy

## Code Standards

- TypeScript strict mode enabled
- All functions documented with JSDoc comments
- Consistent naming: camelCase for variables/functions, PascalCase for components/types
- ESLint for linting, Prettier-compatible formatting

## Testing

- Write tests for all new features
- Property-based tests using `fast-check` for correctness properties
- Unit tests using Jest + React Testing Library
- Run `npm test` before committing

## Security

- Never commit secrets or API keys
- Use environment variables for all configuration
- Sanitize all user input
- Follow least-privilege principle for IAM roles

## Commit Messages

Follow conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
