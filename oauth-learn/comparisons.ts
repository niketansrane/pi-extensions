// Side-by-side comparison tables for OAuth 2.0 flows

export const comparisons: Record<string, string> = {

"delegated-vs-credentials": `
╔══════════════════════════════════════════════════════════════════════════════════╗
║          COMPARISON: Delegated vs Client Credentials (Single-Tenant)           ║
╚══════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────┬──────────────────────────────┬──────────────────────────────┐
│                     │   AUTHORIZATION CODE         │   CLIENT CREDENTIALS         │
│                     │   (Delegated)                │                              │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Who authenticates?  │ The USER (via browser)        │ The APP (no user)            │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Acts as...          │ The signed-in user            │ The application itself       │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ User interaction    │ ✅ Required (sign-in +        │ ❌ None                      │
│                     │    consent)                   │                              │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Permission type     │ Delegated permissions         │ Application permissions      │
│                     │ (e.g., User.Read)             │ (e.g., User.Read.All)        │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Data access scope   │ Only the user's own data      │ Tenant-wide (ALL users)      │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Consent             │ User or admin can consent     │ Admin consent REQUIRED       │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Refresh token       │ ✅ Yes                        │ ❌ No (request new token)    │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ ID token            │ ✅ Yes (user identity)        │ ❌ No (no user)              │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Scope format        │ Individual scopes             │ .default suffix              │
│                     │ (User.Read Mail.Send)         │ (https://.../.default)       │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Use cases           │ • Web apps with users         │ • Background services        │
│                     │ • SPAs                        │ • Daemons / cron jobs        │
│                     │ • Mobile apps                 │ • Service-to-service         │
│                     │ • User-facing APIs            │ • Automated reporting        │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Security risk       │ Token scoped to user;         │ Token has tenant-wide        │
│                     │ limited blast radius          │ access; HIGH blast radius    │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ grant_type          │ authorization_code            │ client_credentials           │
└─────────────────────┴──────────────────────────────┴──────────────────────────────┘

  💡 DECISION GUIDE:
  ═══════════════════════════════════════════════════════════════════
  Is a user present and interacting?
    YES → Authorization Code (Delegated)
    NO  → Client Credentials

  Does the app need to access ONLY the current user's data?
    YES → Delegated (safer, least-privilege)
    NO  → Client Credentials (if no user) or Delegated + admin scope

  Is this a background job / daemon / scheduled task?
    YES → Client Credentials
    NO  → Likely Delegated
`,

"single-vs-multi": `
╔══════════════════════════════════════════════════════════════════════════════════╗
║             COMPARISON: Single-Tenant vs Multi-Tenant OAuth                    ║
╚══════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────┬──────────────────────────────┬──────────────────────────────┐
│                     │   SINGLE-TENANT              │   MULTI-TENANT               │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Who can sign in?    │ Users from ONE specific      │ Users from ANY Azure AD      │
│                     │ Azure AD tenant              │ tenant (+ optionally         │
│                     │                              │ personal accounts)           │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Authority URL       │ /{tenant-id}                 │ /common or /organizations    │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Token issuer (iss)  │ Always the same tenant       │ Varies — matches user's      │
│                     │                              │ home tenant                  │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Service Principals  │ 1 (in the home tenant)       │ 1 per tenant that uses       │
│                     │                              │ your app                     │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Admin consent       │ One admin (home tenant)      │ Each tenant's admin must     │
│                     │                              │ consent separately           │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Token validation    │ Simple — validate iss        │ Complex — must accept        │
│                     │ matches known tenant         │ multiple issuers, validate   │
│                     │                              │ tid against allow-list       │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Data isolation      │ N/A (one tenant)             │ YOUR responsibility          │
│                     │                              │ Use tid to partition          │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ App registration    │ "Accounts in this org only"  │ "Accounts in any org         │
│ setting             │                              │  directory"                  │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Complexity          │ Lower — one tenant to        │ Higher — onboarding,         │
│                     │ manage                       │ isolation, per-tenant        │
│                     │                              │ config                       │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Use cases           │ • Internal LOB apps          │ • SaaS products              │
│                     │ • Intranet portals           │ • ISV applications           │
│                     │ • Internal automation        │ • Marketplace apps           │
│                     │                              │ • Cross-org integrations     │
├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Typical examples    │ • Company HR portal          │ • Slack, Zoom, Salesforce    │
│                     │ • Internal expense app       │ • Any "Sign in with          │
│                     │ • DevOps dashboards          │   Microsoft" SaaS            │
└─────────────────────┴──────────────────────────────┴──────────────────────────────┘

  ⚠️  MULTI-TENANT PITFALLS:
  ═══════════════════════════════════════════════════════════════════

  1. ISSUER VALIDATION
     Without checking the "tid" claim, ANY Azure AD user can
     access your app. This is the #1 multi-tenant security mistake.

  2. DATA LEAKAGE
     If you don't partition by tenant ID, User A from Contoso
     might see data belonging to Fabrikam.

  3. CONSENT CONFUSION
     External admins may not understand what permissions they're
     granting. Provide clear documentation.

  4. PER-TENANT CONFIGURATION
     Some tenants may need custom settings (conditional access,
     allowed IP ranges, etc.). Plan for this.

  5. TENANT OFFBOARDING
     When a tenant revokes consent, you must handle the removal
     of their Service Principal and clean up their data.
`,

"all": `
╔══════════════════════════════════════════════════════════════════════════════════╗
║               OAUTH 2.0 FULL COMPARISON MATRIX                                ║
╚══════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────┬────────────────────┬────────────────────┬────────────────────┐
│                 │  Auth Code          │  Client Creds      │  Multi-Tenant      │
│                 │  Delegated (ST)     │  (ST)              │  (Auth Code)       │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ User present?   │  ✅ Yes             │  ❌ No             │  ✅ Yes            │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ Acts as         │  User              │  App itself         │  User              │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ Authority       │  /{tenant-id}      │  /{tenant-id}      │  /common           │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ grant_type      │  authorization_    │  client_            │  authorization_    │
│                 │  code              │  credentials        │  code              │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ Permissions     │  Delegated         │  Application        │  Delegated         │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ Consent         │  User or Admin     │  Admin only         │  Per-tenant admin  │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ Refresh token   │  ✅                │  ❌                 │  ✅               │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ ID token        │  ✅                │  ❌                 │  ✅               │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ Token issuer    │  Fixed (1 tenant)  │  Fixed (1 tenant)  │  Varies per user   │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ Data scope      │  User's own data   │  Entire tenant     │  User's own data   │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ Service         │  1                 │  1                  │  1 per tenant      │
│ Principals      │                    │                     │                    │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ Validation      │  Simple            │  Simple             │  Complex           │
│ complexity      │                    │                     │  (multi-issuer)    │
├─────────────────┼────────────────────┼────────────────────┼────────────────────┤
│ Best for        │  Web apps,         │  Daemons,           │  SaaS products,    │
│                 │  SPAs, mobile      │  services,          │  marketplace       │
│                 │                    │  batch jobs          │  apps              │
└─────────────────┴────────────────────┴────────────────────┴────────────────────┘

  🧭 CHOOSING THE RIGHT FLOW:
  ═══════════════════════════════════════════════════════════════════

  START HERE:

    Is a user interacting with the app?
    ├── YES: Will users come from multiple organizations?
    │   ├── YES → Multi-Tenant Auth Code
    │   └── NO  → Single-Tenant Auth Code (Delegated)
    └── NO: Is this a background service / daemon?
        └── YES → Client Credentials
            └── Does it need to access other tenants?
                ├── YES → Multi-Tenant Client Credentials
                └── NO  → Single-Tenant Client Credentials
`,

};
