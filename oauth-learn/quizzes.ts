// OAuth 2.0 quiz questions per topic

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number; // 0-based index
  explanation: string;
}

export const quizzes: Record<string, QuizQuestion[]> = {

// ── Authorization Code / Delegated ──
delegated: [
  {
    question: "In the Authorization Code flow, who does the app act on behalf of?",
    options: [
      "A) The application itself",
      "B) The signed-in user",
      "C) The tenant administrator",
      "D) The resource server",
    ],
    correct: 1,
    explanation: "Delegated = the app acts ON BEHALF OF the user. The access token carries the user's identity.",
  },
  {
    question: "Why is the authorization code exchanged server-side for tokens?",
    options: [
      "A) It's faster than doing it client-side",
      "B) To prevent the access token from being exposed in the browser",
      "C) The authorization server only accepts server IPs",
      "D) To avoid CORS issues",
    ],
    correct: 1,
    explanation: "The code-for-token exchange happens server-side so the access token and client_secret are never exposed to the browser/user-agent.",
  },
  {
    question: "What does the STATE parameter in the authorization URL prevent?",
    options: [
      "A) Token expiration",
      "B) Cross-Site Request Forgery (CSRF) attacks",
      "C) Man-in-the-middle attacks",
      "D) Replay attacks",
    ],
    correct: 1,
    explanation: "The state parameter is a random value stored in the user's session. On callback, the app verifies it matches — preventing CSRF attacks where an attacker crafts a malicious callback URL.",
  },
  {
    question: "What is PKCE and when should you use it?",
    options: [
      "A) A certificate format — use for daemon apps",
      "B) A Proof Key for Code Exchange — always use for public clients (SPAs, mobile apps)",
      "C) A password hashing algorithm — use for storing credentials",
      "D) A token encryption standard — use when tokens contain sensitive claims",
    ],
    correct: 1,
    explanation: "PKCE (Proof Key for Code Exchange) prevents authorization code interception. The client generates a code_verifier and sends a code_challenge. The token endpoint requires the original verifier to exchange the code. Essential for public clients that can't securely store a client_secret.",
  },
  {
    question: "In single-tenant delegated flow, what does the authority URL look like?",
    options: [
      "A) https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      "B) https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize",
      "C) https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize",
      "D) https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize",
    ],
    correct: 1,
    explanation: "Single-tenant uses the specific tenant ID in the URL. /common and /organizations are for multi-tenant apps.",
  },
  {
    question: "What happens if a user's access token expires?",
    options: [
      "A) The user must sign in again immediately",
      "B) The app uses the refresh token to silently get a new access token",
      "C) The authorization code is reused",
      "D) The API automatically extends the token's lifetime",
    ],
    correct: 1,
    explanation: "Refresh tokens allow the app to obtain new access tokens without user interaction. Access tokens are short-lived (typically 1 hour); refresh tokens are longer-lived. 🏢 Like PawPals going back to the front desk with a renewal slip to get a new key card — without bothering the resident.",
  },
  {
    question: "🏢 Analogy check: Why does PawPals get a useless 'pickup slip' instead of the key card directly?",
    options: [
      "A) The front desk is lazy",
      "B) The resident carries the slip through public space (browser) — if someone copies it, they still can't use it without PawPals' Business ID Badge",
      "C) Key cards are too large to carry",
      "D) The building manager requires paperwork",
    ],
    correct: 1,
    explanation: "The pickup slip (authorization code) is useless without PawPals' Business ID Badge (client_secret). Even if someone intercepts the slip in transit (browser redirect), they can't exchange it for a key card (access token). This is why the code-for-token exchange happens server-side.",
  },
],

// ── Client Credentials ──
credentials: [
  {
    question: "In the Client Credentials flow, who authenticates?",
    options: [
      "A) The end user via a browser",
      "B) The application itself using client_id + secret/certificate",
      "C) An admin on behalf of the app",
      "D) The resource server",
    ],
    correct: 1,
    explanation: "Client Credentials = the APPLICATION authenticates as ITSELF. No user is involved.",
  },
  {
    question: "Why is there no refresh token in the Client Credentials flow?",
    options: [
      "A) It's a bug in the OAuth spec",
      "B) The app can request a new token anytime with its credentials — no user needed",
      "C) Refresh tokens are insecure for daemon apps",
      "D) The access token never expires",
    ],
    correct: 1,
    explanation: "Since the app has its credentials available at all times, it can simply request a new access token whenever the current one expires. There's no user session to preserve.",
  },
  {
    question: "What scope format is used in Client Credentials requests?",
    options: [
      "A) User.Read",
      "B) openid profile email",
      "C) https://graph.microsoft.com/.default",
      "D) api://app-id/access_as_user",
    ],
    correct: 2,
    explanation: "Client Credentials uses the .default scope (e.g., https://graph.microsoft.com/.default). This requests ALL pre-configured application permissions. Individual scopes like User.Read are for delegated flows.",
  },
  {
    question: "What type of permissions does Client Credentials use?",
    options: [
      "A) Delegated permissions",
      "B) Application permissions (requires admin consent)",
      "C) User-consented permissions",
      "D) Anonymous permissions",
    ],
    correct: 1,
    explanation: "Application permissions are pre-configured in the app registration and require tenant admin consent. They grant tenant-wide access (e.g., User.Read.All reads ALL users, not just one).",
  },
  {
    question: "Why should you prefer certificates over client secrets in production?",
    options: [
      "A) Certificates are easier to manage",
      "B) Certificates use asymmetric crypto — the private key never leaves your service",
      "C) Certificates don't expire",
      "D) Client secrets don't work with Azure",
    ],
    correct: 1,
    explanation: "With certificates, the private key stays on your server. You sign a JWT assertion and send only the public proof. Client secrets are symmetric — if leaked, anyone can impersonate your app. Certificates can also be stored in HSMs for extra security.",
  },
  {
    question: "A daemon app with Mail.Read application permission can read:",
    options: [
      "A) Only the service account's email",
      "B) Only emails explicitly shared with it",
      "C) ALL users' email in the entire tenant",
      "D) No emails — Mail.Read is delegated only",
    ],
    correct: 2,
    explanation: "Application permissions are tenant-wide! Mail.Read as an application permission means the app can read every mailbox. This is why least privilege and careful permission review are critical. \ud83c\udfe2 Like FixIt Corp's master key card — it opens EVERY apartment, not just one.",
  },
  {
    question: "\ud83c\udfe2 Analogy check: Why doesn't the maintenance crew (Client Credentials) get a renewal slip?",
    options: [
      "A) Renewal slips are too expensive for businesses",
      "B) The crew has their Business ID Badge on hand 24/7 — they just request a new key card each time",
      "C) Master key cards never expire",
      "D) The building manager renews it for them automatically",
    ],
    correct: 1,
    explanation: "No refresh token needed because the app always has its credentials (client_id + secret/certificate). It can request a fresh access token anytime. Unlike the delegated flow, there's no user session to preserve.",
  },
],

// ── Multi-Tenant ──
"multi-tenant": [
  {
    question: "What is a Service Principal in the context of multi-tenant apps?",
    options: [
      "A) The app's source code deployed to another tenant",
      "B) A shadow/reference of the app registration in an external tenant",
      "C) A user account created for the app",
      "D) A DNS record that routes to the app",
    ],
    correct: 1,
    explanation: "When a user from an external tenant first accesses your app, Azure AD creates a Service Principal in their tenant. It's like a local reference to your app registration, controlled by that tenant's admin.",
  },
  {
    question: "Which authority endpoint should a multi-tenant app use?",
    options: [
      "A) https://login.microsoftonline.com/{home-tenant-id}",
      "B) https://login.microsoftonline.com/common",
      "C) https://login.microsoftonline.com/localhost",
      "D) https://login.microsoftonline.com/multi",
    ],
    correct: 1,
    explanation: "/common accepts users from any Azure AD tenant AND personal Microsoft accounts. Use /organizations for work/school accounts only.",
  },
  {
    question: "What is the MOST critical security step when validating tokens from /common?",
    options: [
      "A) Check that the token is not expired",
      "B) Validate the issuer (iss) and tenant ID (tid) against an allowed list",
      "C) Verify the token has a scope claim",
      "D) Check the token size is under 4KB",
    ],
    correct: 1,
    explanation: "When using /common, Azure AD doesn't filter tenants for you. If you don't validate the issuer/tenant ID, ANY Azure AD user from ANY organization could access your app. You must maintain an allow-list of tenant IDs.",
  },
  {
    question: "How does data isolation work in a multi-tenant app?",
    options: [
      "A) Azure AD handles it automatically",
      "B) Each tenant gets a separate database server",
      "C) The app uses the tenant ID (tid) claim to partition/isolate data",
      "D) Data isolation isn't needed for multi-tenant apps",
    ],
    correct: 2,
    explanation: "Data isolation is YOUR responsibility. Use the 'tid' (tenant ID) claim from the token to ensure Tenant A's users never see Tenant B's data. This applies to database queries, file storage, caches, etc.",
  },
  {
    question: "What happens when an admin from Fabrikam consents to your multi-tenant app?",
    options: [
      "A) A copy of your code is deployed to Fabrikam's Azure",
      "B) A Service Principal is created in Fabrikam's tenant with the consented permissions",
      "C) Fabrikam's users are added to your app's home tenant",
      "D) Your app's secret is shared with Fabrikam",
    ],
    correct: 1,
    explanation: "Admin consent creates a Service Principal in Fabrikam's tenant with the approved permissions. Fabrikam's admin can later modify or revoke these permissions independently.",
  },
  {
    question: "Can Client Credentials flow work across tenants?",
    options: [
      "A) No — Client Credentials is always single-tenant",
      "B) Yes — the external tenant admin must consent, and your daemon uses that tenant's ID in the token request",
      "C) Yes — but only with certificates, not secrets",
      "D) Yes — but only through Microsoft Graph, not custom APIs",
    ],
    correct: 1,
    explanation: "Multi-tenant client credentials works! The external tenant admin consents to your app's application permissions. Your daemon then requests tokens using the external tenant's ID in the authority URL. \ud83c\udfe2 Like FixIt Corp getting a separate master key card from each building's front desk.",
  },
  {
    question: "\ud83c\udfe2 Analogy check: PawPals receives a key card issued by Fabrikam Residences (not Contoso Tower). What MUST PawPals verify?",
    options: [
      "A) That the card is a nice shade of blue",
      "B) That Fabrikam Residences is in their list of trusted buildings (issuer + tenant ID validation)",
      "C) That the card was issued today",
      "D) That Contoso Tower also trusts Fabrikam",
    ],
    correct: 1,
    explanation: "When using /common, tokens come from ANY tenant. Without validating the issuer (iss) and tenant ID (tid) against an allow-list, a card from 'Totally Real Apartments' would work too. This is the #1 multi-tenant security mistake.",
  },
],

};
