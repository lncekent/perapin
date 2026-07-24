# Contributing to PeraPin

We are excited that you want to contribute to PeraPin! Here is a guide on how to get started.

## How to Contribute

1. **Fork the repository** and clone it to your local machine.
2. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-
   ```
3. **Make your change** and write tests where applicable.
4. **Ensure the code passes verification:**

- For Frontend (Next.js): run npm run lint and npm run build.
- For Smart Contract (Soroban/Rust): run cargo test.

5. **Commit your changes** with a clear message:

```bash
# Format: Conventional Commits
# Subject: <type>: <short summary>
# Body: <detailed explanation>
# Footer: Closes #<issue_number>
```

Example:

```bash
git commit -m "feat: add user PIN verification hashing"
```

## Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This keeps our Git history organized and clean.

Your commit messages should be formatted as follows:

### Types:

- `feat`: A new feature (e.g., `feat(contract): add daily spending limits`)
- `fix`: A bug fix (e.g., `fix(frontend): resolve PIN alignment on smaller screens`)
- `docs`: Documentation only changes (e.g., `docs(readme): update deployment commands`)
- `style`: Formatting, missing semi-colons, etc. (no production code changes)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Updating build tasks, package manager configs, etc. (no production code changes)

### Examples:

- `feat(frontend): integrate QR sticker scanner interface`
- `fix(contract): resolve challenge verification nonce mismatch`
- `docs(contributing): add commit guidelines`
