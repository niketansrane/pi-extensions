# Pi Extensions

A collection of extensions for [pi](https://github.com/nicholasgasior/pi-coding-agent), the coding agent.

## Extensions

### 🔐 oauth-learn

An interactive OAuth 2.0 learning extension with flow visualizations, quizzes, comparisons, and an intuitive apartment-building analogy.

**Topics covered:**
- Authorization Code flow (Delegated, Single-Tenant)
- Client Credentials flow (Single-Tenant)
- Multi-Tenant OAuth
- Side-by-side flow comparisons
- Interactive quizzes with scoring & progress tracking

**Install:**

```bash
pi install git:github.com/niketansrane/pi-extensions
```

Or for a quick test without installing:

```bash
pi -e git:github.com/niketansrane/pi-extensions
```

**Commands:**

| Command | Description |
|---------|-------------|
| `/oauth` | Main learning hub — pick a flow to study |
| `/oauth delegated` | Authorization Code flow diagram + walkthrough |
| `/oauth credentials` | Client Credentials flow diagram + walkthrough |
| `/oauth multi-tenant` | Multi-Tenant OAuth flow diagram + walkthrough |
| `/oauth-analogy` | Understand OAuth via the Apartment Building analogy |
| `/oauth-compare` | Side-by-side comparison tables |
| `/oauth-quiz` | Interactive quiz with explanations |
| `/oauth-quiz all` | Combined quiz across all topics |
| `/oauth-progress` | Track what you've viewed and quiz scores |

The extension also registers an `oauth_learn` tool so the LLM can show flows and comparisons when you ask about OAuth naturally in conversation.

**The Apartment Building Analogy:**

| OAuth Concept | Analogy |
|---|---|
| Tenant | An apartment building with its own management |
| Auth Server | The front desk that programs key cards |
| User | A resident |
| Client App | An outside service (dog walker, maintenance crew) |
| Service Principal | The service's local profile at *this* building |
| Access Token | A temporary key card that opens specific doors |
| Scopes | Which doors the card opens |

## Adding Extensions

Each extension lives in its own directory with an `index.ts` entry point. See [pi extension docs](https://github.com/nicholasgasior/pi-coding-agent/blob/main/docs/extensions.md) for the full API.

## License

MIT
