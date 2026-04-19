// OAuth 2.0 concepts explained through an Apartment Building & Key Card analogy

export const analogies: Record<string, string> = {

overview: `
╔══════════════════════════════════════════════════════════════════════════╗
║      OAUTH 2.0 — THE APARTMENT BUILDING & KEY CARD ANALOGY            ║
╚══════════════════════════════════════════════════════════════════════════╝

  Imagine apartment buildings, residents, key cards, and outside
  services (dog walkers, cleaners) that need access.

  ┌─────────────────────────────────────────────────────────────────────┐
  │                      CONCEPT MAPPING                                │
  ├──────────────────────────┬──────────────────────────────────────────┤
  │  OAuth 2.0 Concept       │  Analogy                                │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  Tenant (Azure AD)       │  An Apartment Building                  │
  │                          │  (e.g., "Contoso Tower",                │
  │                          │   "Fabrikam Residences")                │
  │                          │  Each building has its own management,  │
  │                          │  its own front desk, its own rules.     │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  Authorization Server    │  The Front Desk / Building Management   │
  │  (Azure AD / Entra)      │  — the trusted authority that verifies  │
  │                          │    identities and programs key cards     │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  User (Resource Owner)   │  A Resident of the building             │
  │                          │  (has their own apartment, their own    │
  │                          │   stuff — the "resources")              │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  Client App              │  An outside Service — a dog walking     │
  │                          │  company ("PawPals") that needs to      │
  │                          │  enter the building and your apartment  │
  │                          │  to walk your dog                       │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  App Registration        │  PawPals is a registered, licensed      │
  │                          │  business — their business license      │
  │                          │  number is known (client_id)            │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  Service Principal       │  PawPals' ACCESS PROFILE at a           │
  │                          │  specific building. They're registered  │
  │                          │  as a company once, but each building   │
  │                          │  creates a LOCAL profile for them       │
  │                          │  with that building's specific rules.   │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  Access Token            │  A Temporary Key Card ⏱️                │
  │                          │  Programmed to open specific doors.     │
  │                          │  Expires at a set time. Has the         │
  │                          │  resident's name + allowed areas on it. │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  Refresh Token           │  A Renewal Slip — PawPals can go back   │
  │                          │  to the front desk and get a new key    │
  │                          │  card without bothering the resident    │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  Scopes / Permissions    │  Which doors the key card opens:        │
  │                          │  🚪 "apartment-4B" (your unit only)     │
  │                          │  🏋️ "gym" (common area)                 │
  │                          │  📬 "mailroom"                          │
  │                          │  The card does NOT open other           │
  │                          │  residents' apartments.                 │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  Consent                 │  YOU telling the front desk:             │
  │                          │  "Yes, give PawPals a key card that     │
  │                          │   opens my apartment."                  │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  Admin Consent           │  The Building Manager approving access  │
  │                          │  to common areas or ALL apartments      │
  │                          │  (e.g., for a maintenance company)      │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  Resource Server (API)   │  The actual apartments, gym, mailroom   │
  │                          │  — the things behind the locked doors   │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  Client Secret /         │  PawPals' verified Business ID Badge    │
  │  Certificate             │  that proves to the front desk:         │
  │                          │  "We really are PawPals, not imposters" │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  Authorization Code      │  A one-time pickup slip — "Take this    │
  │                          │  slip to the front desk, they'll give   │
  │                          │  you the actual key card." Useless      │
  │                          │  without PawPals' Business ID Badge.    │
  ├──────────────────────────┼──────────────────────────────────────────┤
  │  PKCE                    │  A tamper-evident sealed pickup slip    │
  │                          │  — ensures nobody swapped it while      │
  │                          │  the resident was carrying it           │
  └──────────────────────────┴──────────────────────────────────────────┘

  💡 WHY KEY CARDS WORK AS AN ANALOGY:

     You NEVER give PawPals your own building key or your PIN.
     The front desk creates a SEPARATE, LIMITED, TEMPORARY card
     just for them. If PawPals loses it — deactivate it.
     Your own key is unaffected.
`,

delegated: `
╔══════════════════════════════════════════════════════════════════════════╗
║    DELEGATED FLOW — "Let the Dog Walker Into MY Apartment"            ║
║    (Authorization Code, Single-Tenant)                                ║
╚══════════════════════════════════════════════════════════════════════════╝

  You live in Contoso Tower. You use PawPals to walk your dog while
  you're at work. PawPals needs to get into YOUR apartment — but you
  don't want to give them your own key.

  THE STORY:
  ──────────────────────────────────────────────────────────────────────

  ① You open the PawPals app and tap "Connect my building."

  ② PawPals says: "I need access to your apartment. Let me send
     you to your building's front desk so you can authorize me."

     The app redirects you to Contoso Tower's front desk system:

       "Hi! PawPals (License #APP-123) is asking for:
        🚪 Access to your apartment
        🐕 Between 12pm-2pm on weekdays

        Do you approve?"

  ③ You verify it's really PawPals (not "TotallyLegitDogWalkerz").
     You click "Yes, I approve."

  ④ The front desk gives you a ONE-TIME PICKUP SLIP and says:
     "Hand this to PawPals. They can exchange it for a key card."

     ┌─────────────────────────────────────────┐
     │  🎫 PICKUP SLIP #7a3f...                │
     │  For: PawPals (License #APP-123)        │
     │  Authorized by: You (Apt 4B)            │
     │  Expires: 10 minutes                    │
     │  ⚠️ Useless without PawPals' badge     │
     └─────────────────────────────────────────┘

  ⑤ PawPals takes the pickup slip + their Business ID Badge
     to the front desk's BACK OFFICE (server-side, private).

     Front desk verifies:
     ✅ Pickup slip is valid and unused? Yes.
     ✅ Business ID Badge matches PawPals? Yes.

  ⑥ Front desk programs a temporary key card:

     ┌─────────────────────────────────────────┐
     │  🔑 KEY CARD (Access Token)              │
     │  Opens: Apartment 4B ONLY               │
     │  For: PawPals (on behalf of You)        │
     │  Expires: 1 hour                        │
     │  Cannot open: other apartments, office, │
     │    storage, roof                        │
     └─────────────────────────────────────────┘

     Also gives them:
     ┌─────────────────────────────────────────┐
     │  🔄 RENEWAL SLIP (Refresh Token)         │
     │  Present this to get a new key card     │
     │  without bothering the resident again.  │
     └─────────────────────────────────────────┘

  ⑦ PawPals walks up to Apartment 4B, taps the key card.
     Door opens. They walk your dog. 🐕

  ⑧ PawPals tries Apartment 5A (neighbor's door).
     ❌ DENIED. The card only opens 4B.

  ──────────────────────────────────────────────────────────────────────

  WHY THE PICKUP SLIP? (Authorization Code)

    Why not just give PawPals the key card directly?

    Because the approval happens through YOU (the browser).
    If the front desk handed the key card through you, anyone
    watching over your shoulder could copy it.

    Instead:
    • You carry a USELESS pickup slip (auth code)
    • PawPals exchanges it PRIVATELY at the back office
      using their Business ID Badge (client_secret)
    • The real key card (access token) never passes through you

  ──────────────────────────────────────────────────────────────────────

  WHAT MAKES THIS "SINGLE-TENANT":

    PawPals is set up to work with Contoso Tower ONLY.
    They have ONE front desk they talk to:
      https://contoso-tower.com/front-desk

    If someone from Fabrikam Residences tries to use PawPals,
    it won't work — PawPals doesn't know that building's
    front desk.

  ──────────────────────────────────────────────────────────────────────

  WHAT MAKES THIS "DELEGATED":

    The key card says "on behalf of You (Apt 4B)."
    PawPals can ONLY do what YOU are allowed to do,
    and only in the areas YOU consented to.

    • If you don't have gym access, PawPals can't get in either.
    • If you revoke consent, the front desk deactivates the card.
    • PawPals never had your personal key — only a limited copy.
`,

credentials: `
╔══════════════════════════════════════════════════════════════════════════╗
║    CLIENT CREDENTIALS — "The Overnight Maintenance Crew"              ║
║    (No Resident Involved)                                             ║
╚══════════════════════════════════════════════════════════════════════════╝

  Every night at 2am, FixIt Corp sends a maintenance crew to inspect
  pipes, HVAC, and fire systems in EVERY apartment in Contoso Tower.
  No resident is involved — the crew works while everyone sleeps.

  THE STORY:
  ──────────────────────────────────────────────────────────────────────

  ① FixIt Corp walks up to the front desk and says:
     "We're here for the nightly maintenance run.
      Here's our Business ID Badge (client_id + client_secret)."

     There is NO resident involved. No one is "signing in."

  ② The front desk checks:
     ✅ Business ID Badge is valid? Yes.
     ✅ The Building Manager (admin) pre-approved FixIt Corp
        for "all-apartment-access"? Yes.

     ⚠️  A RESIDENT could not approve this — only the
        Building Manager (admin consent).

  ③ Front desk programs a key card:

     ┌─────────────────────────────────────────┐
     │  🔑 MASTER KEY CARD (Access Token)       │
     │  Opens: ALL apartments, all floors      │
     │  For: FixIt Corp (as themselves)        │
     │  Expires: 4 hours                       │
     │  NO resident name on the card           │
     │  — this is FixIt Corp's own access      │
     └─────────────────────────────────────────┘

     ⚠️ No renewal slip (refresh token) — FixIt Corp has their
     badge available 24/7. They just ask for a new card
     each night.

  ④ FixIt Corp enters every apartment and inspects the systems.

  ──────────────────────────────────────────────────────────────────────

  THE KEY DIFFERENCE — WHO'S ON THE CARD:

    ┌─────────────────────────────────────────────────────────┐
    │  Dog Walker's card:                                     │
    │  "PawPals — on behalf of Jean (Apt 4B)"                │
    │  Opens: Apt 4B only                                    │
    │  → DELEGATED: acts as the resident                     │
    │                                                         │
    │  Maintenance card:                                      │
    │  "FixIt Corp — as themselves"                          │
    │  Opens: ALL apartments                                 │
    │  → CLIENT CREDENTIALS: acts as the company             │
    └─────────────────────────────────────────────────────────┘

  ──────────────────────────────────────────────────────────────────────

  WHY THIS IS POWERFUL (AND DANGEROUS):

    PawPals with a stolen key card → can enter ONE apartment.
    FixIt Corp with a stolen key card → can enter EVERY apartment.

    That's why:
    ✅ FixIt Corp uses a biometric badge (certificate) not a
       PIN-based one (secret) — harder to steal
    ✅ The Building Manager reviews FixIt Corp's access quarterly
    ✅ Smart locks log every entry — anomalies trigger alerts
    ✅ Some buildings issue FixIt Corp a key card via their own
       internal system so no badge is needed at all (managed identity)

  ──────────────────────────────────────────────────────────────────────

  WHEN TO USE EACH:

    "Should I use the dog-walker model or the maintenance crew model?"

    Is a RESIDENT actively using the service?
    ├── YES → Dog Walker model (Delegated / Auth Code)
    │         "Act on behalf of me, access only my stuff"
    └── NO  → Maintenance Crew model (Client Credentials)
              "Background job, no user, access everything
               the admin approved"
`,

"multi-tenant": `
╔══════════════════════════════════════════════════════════════════════════╗
║    MULTI-TENANT — "PawPals Expands to Multiple Buildings"             ║
╚══════════════════════════════════════════════════════════════════════════╝

  PawPals started at Contoso Tower. Now residents of Fabrikam
  Residences want to use them too. But Fabrikam has its OWN
  front desk, its own rules, its own building manager.

  THE STORY:
  ──────────────────────────────────────────────────────────────────────

  ① PawPals was originally set up for Contoso Tower only.
     Now they update their license:
     "We serve residents of ANY building" (multi-tenant).

  ② Yuki lives in Fabrikam Residences. She opens PawPals and
     taps "Connect my building."

  ③ PawPals doesn't know Yuki's building yet. So it sends her
     to a GENERAL DIRECTORY (/common endpoint):
     "Which building do you live in?"

     Yuki's email is yuki@fabrikam.com → Fabrikam Residences!
     The directory routes her to FABRIKAM's front desk.

  ④ Fabrikam's front desk says:
     "PawPals is a service that's asking for access.
      This is the first time anyone in our building has
      used them."

  ⑤ ✨ CRITICAL MOMENT — the front desk creates a LOCAL PROFILE
     for PawPals at Fabrikam Residences:

     ┌─────────────────────────────────────────────────────┐
     │  PawPals Inc. (License #APP-123)                    │
     │                                                     │
     │  🏢 Contoso Tower:                                  │
     │     Local Profile (Service Principal #1)            │
     │     — Contoso's manager controls what PawPals       │
     │       can do in THIS building                       │
     │     — 15 residents have connected                   │
     │                                                     │
     │  🏢 Fabrikam Residences:                             │
     │     Local Profile (Service Principal #2) ← NEW!     │
     │     — Same company, same license number             │
     │     — But FABRIKAM's manager controls this one      │
     │     — Fabrikam can revoke it independently          │
     │     — 1 resident connected (Yuki)                   │
     └─────────────────────────────────────────────────────┘

  ⑥ Yuki approves. Fabrikam's front desk programs a key card.

     But notice: the card is issued by FABRIKAM, not Contoso.

     ┌─────────────────────────────────────────┐
     │  🔑 KEY CARD                             │
     │  Issued by: Fabrikam Residences         │  ← NOT Contoso!
     │  Opens: Apt 7C (Yuki's unit)            │
     │  For: PawPals (on behalf of Yuki)       │
     │  Expires: 1 hour                        │
     └─────────────────────────────────────────┘

  ⑦ PawPals receives this card and must verify:
     ✅ Issued by a building we recognize? (issuer validation)
     ✅ We accept Fabrikam Residences? YES, they're in our list.

     ⚠️  If PawPals doesn't check, a card from
        "Totally Real Apartments 🏚️" would work too!

  ⑧ PawPals walks Yuki's dog — but keeps Fabrikam data
     SEPARATE from Contoso data:

     ┌─────────────────────────────────────────────────────┐
     │  PawPals' records:                                  │
     │                                                     │
     │  🏢 Contoso Tower:                                  │
     │     Jean → Apt 4B → Golden Retriever "Max"          │
     │     Marie → Apt 2A → Poodle "Fifi"                  │
     │                                                     │
     │  🏢 Fabrikam Residences:                             │
     │     Yuki → Apt 7C → Shiba Inu "Hachi"               │
     │                                                     │
     │  ⚠️  Jean must NEVER see Yuki's pet info.           │
     │     Data isolation = YOUR responsibility!           │
     └─────────────────────────────────────────────────────┘

  ──────────────────────────────────────────────────────────────────────

  THE 5 MULTI-TENANT TRAPS (in building terms):

  1. 🏚️ ACCEPTING KEY CARDS FROM ANY BUILDING
     A card from "Totally Real Apartments" looks legit but isn't.
     → PawPals must check issuer against a trusted buildings list.
     → In code: validate the "iss" and "tid" claims.

  2. 📂 MIXED-UP RECORDS
     If PawPals keeps one notebook for all buildings, Contoso's
     residents could see Fabrikam's pet records.
     → Separate data per building (partition by tenant ID).

  3. 🤷 CONFUSED BUILDING MANAGER
     Fabrikam's manager doesn't understand what "walk-pet" and
     "enter-apartment" scopes mean and approves everything.
     → Provide clear, plain-English permission descriptions.

  4. 🔧 DIFFERENT RULES PER BUILDING
     Contoso allows dog walking 24/7. Fabrikam only allows it
     9am-5pm. PawPals must handle per-building configuration.
     → Plan for per-tenant settings from day one.

  5. 🚪 BUILDING KICKS PAWPALS OUT
     Fabrikam's manager revokes PawPals' profile. PawPals must
     stop serving Fabrikam residents AND delete their records.
     → Handle tenant offboarding and data cleanup.

  ──────────────────────────────────────────────────────────────────────

  MULTI-TENANT + MAINTENANCE CREW (Client Credentials):

  FixIt Corp wants to service Fabrikam Residences too.

  • Fabrikam's Building Manager must approve: "Yes, FixIt Corp
    may access all apartments in our building for maintenance."
  • FixIt Corp requests a master key card from FABRIKAM's front desk
    (using Fabrikam's building ID in the request).
  • The card grants access to Fabrikam's apartments only.
  • FixIt Corp keeps separate key cards per building.

  ──────────────────────────────────────────────────────────────────────

  SINGLE-TENANT vs MULTI-TENANT — THE CORE DIFFERENCE:

    Single-tenant PawPals:
      → Only works at Contoso Tower
      → Talks to ONE front desk
      → All key cards from the same issuer

    Multi-tenant PawPals:
      → Works at any building that accepts them
      → Each building has its own front desk
      → Key cards come from DIFFERENT issuers
      → PawPals must verify each issuer
      → Data must be kept separate per building
`,

};
