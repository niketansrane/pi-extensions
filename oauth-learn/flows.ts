// OAuth 2.0 flow visualizations — ASCII diagrams + step-by-step explanations

export const flows: Record<string, string> = {

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELEGATED — Authorization Code Flow (Single-Tenant)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
delegated: `
╔══════════════════════════════════════════════════════════════════════════╗
║         OAUTH 2.0 — AUTHORIZATION CODE FLOW (DELEGATED)               ║
║                      Single-Tenant                                     ║
╚══════════════════════════════════════════════════════════════════════════╝

  A USER delegates permission to an APP to act on their behalf.
  The app never sees the user's password.

┌──────────────┐                                           ┌──────────────┐
│              │                                           │   Authorization│
│    USER      │                                           │    Server     │
│  (Resource   │                                           │  (e.g. Azure  │
│   Owner)     │                                           │   AD / Entra) │
└──────┬───────┘                                           └──────┬───────┘
       │                                                          │
       │  ① User clicks "Sign in"                                 │
       │  ───────────────────────────►  ┌──────────────┐          │
       │                                │              │          │
       │                                │  CLIENT APP  │          │
       │                                │  (Web App /  │          │
       │                                │   SPA / etc) │          │
       │                                └──────┬───────┘          │
       │                                       │                  │
       │  ② App redirects user to              │                  │
       │    Authorization Server               │                  │
       │  ◄────────────────────────────────────┘                  │
       │                                                          │
       │  ③ User authenticates &                                  │
       │    consents to permissions                               │
       │  ─────────────────────────────────────────────────────►  │
       │                                                          │
       │  ④ Auth Server redirects back                            │
       │    with AUTHORIZATION CODE                               │
       │  ◄─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
       │        (via browser redirect to redirect_uri)            │
       │                                                          │
       │          ┌──────────────┐                                │
       │          │  CLIENT APP  │  ⑤ App exchanges code          │
       │          │              │    + client_secret              │
       │          │              │    for ACCESS TOKEN             │
       │          │              │  ─────────────────────────────► │
       │          │              │                                │
       │          │              │  ⑥ Auth Server returns          │
       │          │              │    Access Token                 │
       │          │              │    + Refresh Token              │
       │          │              │  ◄───────────────────────────── │
       │          │              │                                │
       │          │              │  ⑦ App calls API               │
       │          │              │    with Access Token            │
       │          │              │  ──────────►  ┌─────────────┐  │
       │          │              │               │  RESOURCE    │  │
       │          │              │               │  SERVER      │  │
       │          │              │               │  (API)       │  │
       │          │              │  ◄────────────┘              │  │
       │          │              │  ⑧ API returns data          │  │
       │          └──────────────┘    (user's data)             │  │
       │                                                          │
       ▼                                                          ▼

═══════════════════════════════════════════════════════════════════════
  KEY CONCEPTS
═══════════════════════════════════════════════════════════════════════

  🔑 SINGLE-TENANT means the app is registered in ONE Azure AD tenant
     and only users from THAT tenant can sign in.

     App Registration setting:
       "Supported account types" = "Accounts in this organizational
                                    directory only"
       Tenant ID is hardcoded in the authority URL:
         https://login.microsoftonline.com/{tenant-id}

  🎭 DELEGATED means the app acts ON BEHALF OF the signed-in user.
     The access token carries the user's identity and permissions.
     The app can only do what the user is allowed to do.

  📋 SCOPES requested (e.g. "User.Read", "Mail.Send") define
     what the app can do on behalf of the user.

  🔒 The AUTHORIZATION CODE is short-lived and exchanged server-side
     — the user never sees the access token in their browser.

  🔄 REFRESH TOKEN lets the app get new access tokens without
     asking the user to sign in again.

═══════════════════════════════════════════════════════════════════════
  STEP-BY-STEP BREAKDOWN
═══════════════════════════════════════════════════════════════════════

  STEP ①  User initiates sign-in
          ─────────────────────────────────────────────
          User clicks "Sign in" or accesses a protected page.

  STEP ②  App constructs authorization URL & redirects
          ─────────────────────────────────────────────
          GET https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize
            ?client_id=<app-id>
            &response_type=code
            &redirect_uri=https://myapp.com/callback
            &scope=User.Read Mail.Send
            &state=<random-csrf-token>

  STEP ③  User authenticates
          ─────────────────────────────────────────────
          Microsoft login page shown. User enters credentials.
          If first time, consent screen shows requested permissions.

  STEP ④  Auth code returned
          ─────────────────────────────────────────────
          Browser redirected to:
            https://myapp.com/callback?code=<auth-code>&state=<csrf-token>
          The code is SHORT-LIVED (~10 min) and SINGLE-USE.

  STEP ⑤  App exchanges code for tokens (server-side)
          ─────────────────────────────────────────────
          POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
            grant_type=authorization_code
            &code=<auth-code>
            &client_id=<app-id>
            &client_secret=<secret>
            &redirect_uri=https://myapp.com/callback

  STEP ⑥  Tokens returned
          ─────────────────────────────────────────────
          Response: { access_token, refresh_token, expires_in, id_token }

  STEP ⑦  App calls API with bearer token
          ─────────────────────────────────────────────
          GET https://graph.microsoft.com/v1.0/me
          Authorization: Bearer <access-token>

  STEP ⑧  API validates token & returns data
          ─────────────────────────────────────────────
          Token validated: signature, expiry, audience, tenant, scopes.
          Returns ONLY data the user has access to.

═══════════════════════════════════════════════════════════════════════
  SECURITY CONSIDERATIONS
═══════════════════════════════════════════════════════════════════════

  ✅ PKCE (Proof Key for Code Exchange) — always use for public clients
     (SPAs, mobile apps). Prevents authorization code interception.

  ✅ STATE parameter — prevents CSRF attacks. Generate random value,
     store in session, verify on callback.

  ✅ NEVER expose client_secret in frontend code. Code-for-token
     exchange must happen server-side.

  ✅ Use HTTPS for redirect_uri.

  ✅ Validate the id_token's nonce, issuer, and audience.
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLIENT CREDENTIALS (Single-Tenant)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
credentials: `
╔══════════════════════════════════════════════════════════════════════════╗
║       OAUTH 2.0 — CLIENT CREDENTIALS FLOW (Single-Tenant)             ║
║              App-to-App / Daemon / Background Service                  ║
╚══════════════════════════════════════════════════════════════════════════╝

  NO USER involved. The APPLICATION authenticates as ITSELF.
  Used for background jobs, daemons, service-to-service calls.

                                                    ┌──────────────┐
                                                    │ Authorization│
                                                    │   Server     │
                                                    │ (Azure AD /  │
                                                    │  Entra ID)   │
                                                    └──────┬───────┘
                                                           │
  ┌──────────────┐                                         │
  │              │  ① App sends client_id + secret          │
  │  DAEMON /    │     (or certificate) directly            │
  │  SERVICE     │  ────────────────────────────────────►   │
  │  (No user)   │                                         │
  │              │  ② Auth Server validates credentials     │
  │              │     and returns Access Token              │
  │              │  ◄────────────────────────────────────   │
  │              │                                         │
  │              │  ③ App calls API with Access Token       │
  │              │  ──────────────►  ┌─────────────┐       │
  │              │                   │  RESOURCE    │       │
  │              │                   │  SERVER      │       │
  │              │                   │  (API)       │       │
  │              │  ◄────────────────┘              │       │
  │              │  ④ API returns data              │       │
  └──────────────┘                                         │
                                                           ▼

═══════════════════════════════════════════════════════════════════════
  KEY CONCEPTS
═══════════════════════════════════════════════════════════════════════

  🤖 NO USER INTERACTION — the app authenticates using its own
     identity (client_id + client_secret or certificate).

  🔑 SINGLE-TENANT — the app and the API are in the SAME Azure AD
     tenant. The authority URL uses that tenant's ID.

  📋 SCOPES use the ".default" suffix:
       https://graph.microsoft.com/.default
     This requests ALL pre-configured application permissions.

  ⚠️  APPLICATION PERMISSIONS vs DELEGATED PERMISSIONS:
     ┌────────────────────┬──────────────────────────────┐
     │   Delegated        │   Application                │
     ├────────────────────┼──────────────────────────────┤
     │ User must sign in  │ No user needed               │
     │ Acts as the user   │ Acts as the app itself       │
     │ User.Read scope    │ User.Read.All app permission │
     │ Limited to user's  │ Tenant-wide access           │
     │   own data         │   (all users' data!)         │
     └────────────────────┴──────────────────────────────┘

  ⚡ ADMIN CONSENT is REQUIRED for application permissions.
     A tenant admin must pre-approve the permissions in Azure Portal.

═══════════════════════════════════════════════════════════════════════
  STEP-BY-STEP BREAKDOWN
═══════════════════════════════════════════════════════════════════════

  STEP ①  App requests token directly
          ─────────────────────────────────────────────
          POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
            grant_type=client_credentials
            &client_id=<app-id>
            &client_secret=<secret>
            &scope=https://graph.microsoft.com/.default

          OR with certificate:
            grant_type=client_credentials
            &client_id=<app-id>
            &client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
            &client_assertion=<signed-jwt>
            &scope=https://graph.microsoft.com/.default

  STEP ②  Token returned
          ─────────────────────────────────────────────
          Response: { access_token, expires_in, token_type: "Bearer" }
          ⚠️  NO refresh_token — just request a new token when expired.
          ⚠️  NO id_token — there is no user identity.

  STEP ③  App calls API
          ─────────────────────────────────────────────
          GET https://graph.microsoft.com/v1.0/users
          Authorization: Bearer <access-token>

  STEP ④  API validates and responds
          ─────────────────────────────────────────────
          Token validated. App has tenant-wide access per its
          configured application permissions.

═══════════════════════════════════════════════════════════════════════
  COMMON USE CASES
═══════════════════════════════════════════════════════════════════════

  📧 Background email processing (read all users' mail)
  📊 Reporting service (aggregate data across all users)
  🔄 Data sync between systems
  🤖 Automated provisioning / de-provisioning
  📁 Backup service (access all SharePoint sites)
  🔔 Webhook processors (no user in the loop)

═══════════════════════════════════════════════════════════════════════
  SECURITY CONSIDERATIONS
═══════════════════════════════════════════════════════════════════════

  ✅ Prefer CERTIFICATES over client_secret in production.
     Secrets can be leaked; certificates use asymmetric crypto.

  ✅ Use MANAGED IDENTITIES in Azure to avoid secrets entirely.
     Azure provides tokens automatically to your app.

  ✅ Apply LEAST PRIVILEGE — only request permissions you need.
     Application permissions are powerful (tenant-wide).

  ✅ Store secrets in Azure Key Vault, never in code or config.

  ✅ Monitor token usage — a compromised service can access
     everything its permissions allow.

  ✅ Rotate secrets/certificates before expiry.
`,

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MULTI-TENANT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"multi-tenant": `
╔══════════════════════════════════════════════════════════════════════════╗
║           OAUTH 2.0 — MULTI-TENANT OAUTH                              ║
║         Users from ANY Azure AD tenant can sign in                     ║
╚══════════════════════════════════════════════════════════════════════════╝

  The app is registered in ONE tenant (home tenant) but accepts
  users from OTHER tenants. Each external tenant gets a
  SERVICE PRINCIPAL (shadow copy of your app).

┌──────────────────────────────────────────────────────────────────────┐
│                        HOME TENANT (Contoso)                        │
│                                                                      │
│   ┌──────────────────┐                                               │
│   │  App Registration │  ◄── Defined here with:                      │
│   │  (client_id)      │      • Supported account types:              │
│   │                   │        "Accounts in any org directory"        │
│   │                   │      • Or "...and personal MS accounts"      │
│   └──────────────────┘                                               │
│           │                                                          │
│           │  Automatic Service Principal                              │
│           ▼                                                          │
│   ┌──────────────────┐                                               │
│   │ Service Principal │  ◄── Users in Contoso use this               │
│   │ (Home Tenant)     │                                              │
│   └──────────────────┘                                               │
└──────────────────────────────────────────────────────────────────────┘
          │
          │  When a user from Fabrikam signs in for the first time...
          │
          ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL TENANT (Fabrikam)                      │
│                                                                      │
│   ┌──────────────────┐                                               │
│   │ Service Principal │  ◄── CREATED automatically on first          │
│   │ (Fabrikam copy)   │      user sign-in or admin consent.          │
│   │                   │      Same client_id, but Fabrikam's          │
│   │                   │      admin controls permissions here.        │
│   └──────────────────┘                                               │
│           │                                                          │
│           │  Fabrikam admin can:                                      │
│           │  • Require admin consent                                  │
│           │  • Restrict which users can access                        │
│           │  • Revoke the service principal entirely                  │
│           │                                                          │
└──────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
  THE MULTI-TENANT AUTH FLOW
═══════════════════════════════════════════════════════════════════════

  ┌────────┐      ┌──────────┐      ┌───────────────┐      ┌─────────┐
  │Fabrikam│      │  Your    │      │  Azure AD     │      │ Resource│
  │ User   │      │  App     │      │  /common or   │      │  API    │
  │        │      │          │      │  /organizations│     │         │
  └───┬────┘      └────┬─────┘      └──────┬────────┘      └────┬────┘
      │                │                    │                     │
      │ ① Click       │                    │                     │
      │   "Sign in"   │                    │                     │
      │───────────────►│                    │                     │
      │                │                    │                     │
      │                │ ② Redirect to      │                     │
      │                │   /common/...      │                     │
      │◄───────────────│                    │                     │
      │                │                    │                     │
      │ ③ User enters  │                    │                     │
      │   creds        │                    │                     │
      │────────────────────────────────────►│                     │
      │                │                    │                     │
      │                │                    │ ④ Azure AD          │
      │                │                    │   identifies user's │
      │                │                    │   HOME TENANT       │
      │                │                    │   (fabrikam.com)    │
      │                │                    │                     │
      │                │                    │ ⑤ Creates Service   │
      │                │                    │   Principal in      │
      │                │                    │   Fabrikam if first │
      │                │                    │   time              │
      │                │                    │                     │
      │ ⑥ Consent      │                    │                     │
      │   screen       │                    │                     │
      │   (if needed)  │                    │                     │
      │◄───────────────────────────────────│                     │
      │                │                    │                     │
      │ ⑦ Approve      │                    │                     │
      │────────────────────────────────────►│                     │
      │                │                    │                     │
      │ ⑧ Redirect     │                    │                     │
      │   with code    │                    │                     │
      │───────────────►│                    │                     │
      │                │                    │                     │
      │                │ ⑨ Exchange code    │                     │
      │                │   for tokens       │                     │
      │                │───────────────────►│                     │
      │                │                    │                     │
      │                │ ⑩ Token returned   │                     │
      │                │   (issuer =        │                     │
      │                │    Fabrikam!)       │                     │
      │                │◄───────────────────│                     │
      │                │                    │                     │
      │                │ ⑪ Call API         │                     │
      │                │────────────────────────────────────────►│
      │                │                    │                     │
      │                │ ⑫ Data returned    │                     │
      │                │◄────────────────────────────────────────│
      │                │                    │                     │
      ▼                ▼                    ▼                     ▼

═══════════════════════════════════════════════════════════════════════
  KEY DIFFERENCES FROM SINGLE-TENANT
═══════════════════════════════════════════════════════════════════════

  ┌─────────────────────┬────────────────────┬──────────────────────┐
  │                     │   SINGLE-TENANT    │    MULTI-TENANT      │
  ├─────────────────────┼────────────────────┼──────────────────────┤
  │ Authority URL       │ /  {tenant-id}     │ /common              │
  │                     │                    │ /organizations       │
  │                     │                    │ /consumers           │
  ├─────────────────────┼────────────────────┼──────────────────────┤
  │ Token Issuer (iss)  │ Always same        │ Varies per user's    │
  │                     │ tenant ID          │ home tenant          │
  ├─────────────────────┼────────────────────┼──────────────────────┤
  │ Token Validation    │ Validate iss =     │ Must accept MULTIPLE │
  │                     │ known tenant       │ valid issuers        │
  ├─────────────────────┼────────────────────┼──────────────────────┤
  │ Service Principal   │ One (home tenant)  │ One per tenant that  │
  │                     │                    │ uses your app        │
  ├─────────────────────┼────────────────────┼──────────────────────┤
  │ Admin Consent       │ Home admin only    │ Each tenant's admin  │
  │                     │                    │ must consent         │
  ├─────────────────────┼────────────────────┼──────────────────────┤
  │ Data Isolation      │ N/A                │ YOUR responsibility  │
  │                     │                    │ — use tenant ID      │
  └─────────────────────┴────────────────────┴──────────────────────┘

═══════════════════════════════════════════════════════════════════════
  AUTHORITY ENDPOINTS EXPLAINED
═══════════════════════════════════════════════════════════════════════

  /common          → Any Azure AD tenant + personal Microsoft accounts
  /organizations   → Any Azure AD tenant (no personal accounts)
  /consumers       → Personal Microsoft accounts only
  /{tenant-id}     → One specific tenant only

═══════════════════════════════════════════════════════════════════════
  CRITICAL: TOKEN VALIDATION IN MULTI-TENANT
═══════════════════════════════════════════════════════════════════════

  When you use /common, Azure AD does NOT validate the audience
  or issuer for you — YOUR APP must:

  1. Validate the token signature (use JWKS endpoint)
  2. Check "aud" (audience) = your app's client_id
  3. Check "iss" (issuer) matches an allowed tenant
  4. Check "tid" (tenant ID) is in your list of allowed tenants
  5. Use "tid" to isolate data per tenant

  ⚠️  WITHOUT issuer/tenant validation, ANY Azure AD user
      could access your app — this is a critical security hole.

═══════════════════════════════════════════════════════════════════════
  MULTI-TENANT + CLIENT CREDENTIALS
═══════════════════════════════════════════════════════════════════════

  Client Credentials also works multi-tenant:
  • External tenant admin must consent to your app's permissions
  • Your daemon uses the EXTERNAL tenant's ID in the token request:

    POST https://login.microsoftonline.com/{external-tenant-id}
         /oauth2/v2.0/token
      grant_type=client_credentials
      &client_id=<your-app-id>
      &client_secret=<your-secret>
      &scope=https://graph.microsoft.com/.default

  • The token returned grants access to the EXTERNAL tenant's data
  • Store separate tokens per tenant
`,

};
