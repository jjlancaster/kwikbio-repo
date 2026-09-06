# ARS v4.2 — Jewel/Hydro Functional Specification

- **Status:** Reconstructed draft for Lumen review
- **Specification version:** 4.2
- **Repository:** `jjlancaster/kwikbio-repo`
- **Application:** `hydrojoule`
- **Review owner:** Lumen
- **Scaffold/build owner after approval:** Replit Watt

## Recovery notice

This document reconstructs the lost ARS v4.2 Jewel/Hydro handoff specification. The original was reported at `hydrojoule/docs/ars-v4.2-jewel-hydro-functional-spec.md` on a local `work` branch at commit `80fed98`, but neither that branch nor that commit is present in the surviving repository, GitHub pull-request refs, local Git objects, Codex worktrees, or the accessible WSL filesystem.

The reconstruction is based on:

- the preserved handoff summary, including the original operating roles, file map, action IDs, and review workflow;
- the current Hydrojoule authentication, RBAC, Telegram gatekeeper, and deployment-control code on `master`;
- the requirement that Lumen review and freeze the contract before Watt scaffolds or extends the implementation.

This is therefore a faithful functional reconstruction, not a claim of byte-for-byte recovery. It becomes the v4.2 baseline only after Lumen review and approval.

## 1. Purpose

ARS v4.2 defines a controlled deployment path from the Hydrojoule web portal to the Jewel server through the Hydro agent. It replaces placeholder “queued” responses with an explicit, auditable dispatch contract while preserving strict administrator and Telegram step-up controls.

The specification must be sufficient for Watt to scaffold the portal-to-agent integration without inventing terminology, action names, security rules, or runtime responsibilities.

## 2. Operating model

| Component or role | Responsibility | Explicit boundary |
| --- | --- | --- |
| Hydrojoule portal | Authenticates the operator, enforces Admin RBAC, obtains step-up verification, displays approved actions, dispatches signed requests, and presents status | Does not execute infrastructure commands or accept arbitrary commands from the browser |
| Jewel server | Named deployment target that hosts the approved ARS/Hydrojoule runtime and deployment adapters | Does not expose a general-purpose shell through the portal |
| Hydro agent | Execution-plane agent that validates and runs allowlisted actions against Jewel and returns durable receipts/status | Does not decide who is an Admin and cannot expand the action allowlist dynamically |
| Lumen | Review owner for terminology, scope, security, action semantics, and sufficiency of the handoff | Reviews the specification before implementation expansion; does not scaffold prematurely |
| Replit Watt | Scaffold/build owner after Lumen approval | Implements the approved contract and maps every changed file to a specification section |

### 2.1 Canonical terminology

- **Hydrojoule** means the authenticated web control plane in this repository.
- **Jewel** means the server or deployment target identified by `JEWEL_SERVER_ID`.
- **Hydro** means the assisting runtime/deployment agent reached through `HYDRO_AGENT_ENDPOINT`.
- **Lumen** means the specification review role.
- **Watt** means the post-approval scaffold/build role.
- **Joule**, where used elsewhere in the wider agent system, is not a synonym for Jewel and is outside this deployment contract unless added by a later specification.

These names must not be silently renamed or conflated in code, environment variables, UI copy, logs, or handoff notes.

## 3. Scope

### 3.1 In scope

- Admin-only deployment controls in Hydrojoule.
- Telegram-backed step-up verification for every dispatch.
- A closed allowlist of Jewel/Hydro action IDs.
- Typed portal-to-Hydro request, response, and status contracts.
- Stable identification of the Jewel target.
- Audit records covering request, authorization, dispatch, progress, and result.
- Safe failure, retry, timeout, and idempotency behavior.
- A traceable scaffold and test plan.

### 3.2 Out of scope

- A browser-accessible shell or arbitrary command runner.
- Dynamic action definitions supplied by a client.
- Model selection or general ARS swarm orchestration.
- Provisioning credentials through the UI.
- Storing production secrets in source control.
- Automatic production rollout merely because this specification is merged.
- Replacing the existing Auth.js, Prisma, Google Secret Manager, or Telegram foundations unless separately approved.

## 4. Current baseline and required delta

The surviving `master` branch already provides:

- Auth.js sessions;
- the `ADMIN`, `RESEARCHER`, and `SUBSCRIBER` role hierarchy;
- Prisma-backed user records with linked Telegram IDs;
- an Admin deployment page with five action cards;
- `/api/deploy/verify-telegram` and `/api/deploy/run` routes;
- Telegram audit notification helpers; and
- a server-side action allowlist for five placeholder actions.

The current `/api/deploy/run` route does not dispatch to Hydro. It returns a simulated queued response. The current deploy page also performs its Admin redirect in a client component. v4.2 requires the following delta:

- move the protected page authorization boundary to a server component;
- keep interactive behavior in a separate `DeployClient.tsx` component;
- add `hydro-healthcheck` and `jewel-sync` to the frozen action catalogue;
- centralize action metadata and request/response types in `lib/hydro-agent.ts`;
- bind Telegram step-up verification to the authenticated Admin rather than accepting any valid Admin Telegram ID;
- derive the Jewel target on the server instead of trusting a client-provided target string;
- dispatch a signed, idempotent request to Hydro;
- return a real Hydro receipt and expose durable status; and
- document the Jewel/Hydro environment variables without committing their values.

## 5. Actors and principal user story

### 5.1 Primary actor

An authenticated Hydrojoule user whose persisted role is `ADMIN` and whose own account has a linked Telegram ID.

### 5.2 Principal user story

As an Admin, I can select a predefined deployment action for the configured Jewel server, complete Telegram step-up verification, review the action severity and target, dispatch it to Hydro, and observe an auditable receipt and final status without gaining arbitrary command execution capability.

### 5.3 Denied actors

- Anonymous users receive `401` from deployment APIs.
- Authenticated non-Admin users receive `403` and cannot render the protected controls.
- Admins without a Telegram ID linked to their own account cannot dispatch.
- Requests with an expired or mismatched step-up proof cannot dispatch.
- Hydro requests with an unknown action, target, signature, or replayed nonce are rejected.

## 6. Frozen deployment action catalogue

Action IDs are protocol identifiers. Changing an ID is a breaking contract change requiring specification review.

| Action ID | Display label | Default severity | Canonical target class | Required behavior |
| --- | --- | --- | --- | --- |
| `hydro-healthcheck` | Hydro Health Check | Low | Hydro agent | Verify agent reachability, version, Jewel binding, and dependency health without mutation |
| `jewel-sync` | Jewel Sync | Medium | Jewel deployment staging | Synchronize an approved versioned bundle/configuration to Jewel staging; do not activate it implicitly |
| `terraform-plan` | Terraform Plan | Low | Jewel infrastructure | Produce a read-only plan and preserve the plan identifier/output for review |
| `terraform-apply` | Terraform Apply | High | Jewel infrastructure | Apply only an approved, immutable plan; reject an absent, expired, or mismatched plan reference |
| `brainfile-update` | BrainFile Update | Medium | ARS knowledge store on Jewel | Synchronize an approved, versioned BrainFile payload and report the resulting revision |
| `ars-restart` | ARS Engine Restart | High | ARS service on Jewel | Perform a graceful restart, health-check the service, and report degraded/healthy state |
| `db-migrate` | Database Migration | Critical | Hydrojoule production database associated with Jewel | Run a reviewed migration set with preflight validation and report the applied migration revision |

### 6.1 Action rules

- The server owns the action-to-target mapping; the browser sends only the action ID and required action-specific references.
- Hydro maintains the same allowlist and rejects unknown IDs even if the portal is compromised.
- No action may contain a free-form shell command, executable path, host, URL, or environment override from the browser.
- Mutating actions must identify the immutable artifact, plan, migration, or BrainFile revision they operate on.
- `terraform-apply` must reference a previously successful plan for the same Jewel server and revision.
- `jewel-sync` stages content; activation requires the appropriate separate action.
- `db-migrate` must be serialized and must not run concurrently with another migration.

## 7. End-to-end deployment workflow

1. Hydrojoule authenticates the user through the existing Auth.js session.
2. The protected server component checks the persisted role and renders no deployment controls unless the user is an Admin.
3. The Admin requests Telegram step-up verification.
4. The server verifies that the supplied Telegram identity belongs to the same authenticated Admin account.
5. The server issues a short-lived, single-purpose step-up proof bound to the user, session, and deployment purpose. A five-minute lifetime is the default pending Lumen approval.
6. The Admin selects an allowlisted action and confirms the displayed severity, canonical Jewel target, and immutable revision/plan where required.
7. `/api/deploy/run` rechecks authentication, Admin role, step-up proof, action parameters, and server-owned target mapping.
8. Hydrojoule creates a unique `requestId`, idempotency key, timestamp, and nonce; records an audit event; and signs the exact request body.
9. Hydrojoule sends the request to Hydro over TLS.
10. Hydro verifies authentication, signature, timestamp window, nonce, action allowlist, Jewel binding, and parameters before accepting work.
11. Hydro returns a durable dispatch receipt. Hydrojoule returns `202 Accepted` for asynchronous work or `200 OK` for an immediately completed health check.
12. Hydrojoule displays status from the durable receipt and records all state transitions.
13. Terminal success, failure, or cancellation generates an audit event and a Telegram notification to the initiating Admin.

## 8. Hydrojoule UI requirements

### 8.1 Protected page

`app/(protected)/deploy/page.tsx` must be a server component that:

- resolves the session before rendering;
- redirects anonymous users to sign-in;
- redirects non-Admins to the unauthorized page; and
- passes only the minimum non-secret session/display data to `DeployClient.tsx`.

Middleware may provide a preliminary route check, but it does not replace the server-component or API authorization checks.

### 8.2 Deployment client

`DeployClient.tsx` must:

- display the seven frozen actions, descriptions, severity, and canonical target label;
- keep every action locked until step-up verification succeeds;
- show when verification expires and relock automatically;
- require an explicit confirmation for High and Critical actions;
- prevent duplicate clicks while a request is pending;
- show the returned `requestId`, `dispatchId`, state, and message;
- distinguish rejected, accepted, running, succeeded, failed, timed-out, and unknown states;
- never receive or render Hydro credentials; and
- label its local list as a session activity view unless it is populated from durable server audit data.

Client-side state must not be treated as authorization or audit evidence.

## 9. Hydrojoule API contract

### 9.1 Telegram step-up

`POST /api/deploy/verify-telegram`

Logical request:

```json
{
  "telegramId": "123456789"
}
```

Successful response:

```json
{
  "verified": true,
  "stepUpToken": "opaque-short-lived-token",
  "expiresAt": "2026-09-06T20:05:00.000Z"
}
```

Requirements:

- The session user must be an Admin.
- The Telegram ID must equal the Telegram ID linked to that same database user.
- The returned token must be opaque or signed, short-lived, deployment-scoped, and unusable after expiry.
- Raw bot tokens or secret material must never appear in the response.

### 9.2 Run action

`POST /api/deploy/run`

Logical browser request:

```json
{
  "actionId": "hydro-healthcheck",
  "stepUpToken": "opaque-short-lived-token",
  "parameters": {}
}
```

The browser must not choose `jewelServerId`, Hydro endpoint, target host, requested user, or signing data.

Successful asynchronous response:

```json
{
  "success": true,
  "requestId": "req_01...",
  "dispatchId": "hydro_01...",
  "actionId": "jewel-sync",
  "jewelServerId": "jewel-production-1",
  "status": "accepted",
  "message": "Jewel synchronization accepted.",
  "acceptedAt": "2026-09-06T20:00:00.000Z"
}
```

### 9.3 Status

The scaffold must provide a same-origin status route, recommended as:

`GET /api/deploy/status/{dispatchId}`

It must recheck Admin authorization, ensure the caller may view the receipt, query Hydro or the durable local audit store, and return the normalized status contract defined below. The browser must not call Hydro directly.

### 9.4 Error semantics

| HTTP status | Meaning |
| --- | --- |
| `400` | Malformed body, unknown action, or invalid action parameters |
| `401` | Missing or invalid Hydrojoule session |
| `403` | Non-Admin, failed/mismatched step-up, or policy denial |
| `409` | Conflicting action, replay, duplicate idempotency key with different body, or unmet prerequisite |
| `422` | Action is known but its immutable revision/plan cannot be used |
| `429` | Rate or concurrency limit exceeded |
| `502` | Hydro returned an invalid response or could not be authenticated |
| `503` | Hydro/Jewel unavailable before acceptance |
| `504` | Dispatch acknowledgement timed out; final state may require reconciliation |

Errors returned to the browser must use stable codes and safe messages; secrets, stack traces, raw upstream bodies, and command output are prohibited.

## 10. Hydro agent contract

### 10.1 Transport and authentication

- `HYDRO_AGENT_ENDPOINT` is a server-only HTTPS base URL.
- `HYDRO_AGENT_TOKEN` is sent as a bearer credential or equivalent service credential.
- `HYDRO_AGENT_TOKEN_SECRET` signs the exact raw request body with HMAC-SHA-256.
- The request includes a timestamp and nonce. Hydro rejects timestamps outside the approved replay window and rejects reused nonces.
- Secret comparison must be constant-time where applicable.
- TLS certificate validation is mandatory; production cannot use an insecure bypass.

Recommended headers:

```text
Authorization: Bearer <HYDRO_AGENT_TOKEN>
Content-Type: application/json
Idempotency-Key: <requestId>
X-Hydro-Timestamp: <unix-seconds>
X-Hydro-Nonce: <unique-nonce>
X-Hydro-Signature: sha256=<hex-hmac>
```

### 10.2 Dispatch request

Recommended Hydro endpoint:

`POST /v1/deploy/actions`

Canonical request body:

```json
{
  "schemaVersion": "hydro-dispatch-v1",
  "requestId": "req_01...",
  "actionId": "terraform-plan",
  "jewelServerId": "jewel-production-1",
  "requestedAt": "2026-09-06T20:00:00.000Z",
  "requestedBy": {
    "userId": "cuid-from-hydrojoule",
    "email": "admin@example.com"
  },
  "parameters": {
    "revision": "git-or-artifact-revision"
  }
}
```

The Telegram ID is authentication evidence and sensitive personal data; Hydro does not need it in the default request. Hydrojoule records the step-up result locally.

### 10.3 Dispatch acknowledgement

```json
{
  "schemaVersion": "hydro-dispatch-v1",
  "accepted": true,
  "requestId": "req_01...",
  "dispatchId": "hydro_01...",
  "actionId": "terraform-plan",
  "jewelServerId": "jewel-production-1",
  "status": "accepted",
  "message": "Terraform plan accepted.",
  "acceptedAt": "2026-09-06T20:00:01.000Z"
}
```

Hydrojoule must reject a response whose `requestId`, `actionId`, or `jewelServerId` does not match the request.

### 10.4 Normalized status

Allowed states:

```text
accepted | running | succeeded | failed | cancelled | timed_out | unknown
```

Status response:

```json
{
  "schemaVersion": "hydro-dispatch-v1",
  "requestId": "req_01...",
  "dispatchId": "hydro_01...",
  "actionId": "terraform-plan",
  "jewelServerId": "jewel-production-1",
  "status": "succeeded",
  "message": "Terraform plan completed.",
  "startedAt": "2026-09-06T20:00:02.000Z",
  "finishedAt": "2026-09-06T20:00:20.000Z",
  "result": {
    "artifactId": "plan_01...",
    "summary": "0 to add, 0 to change, 0 to destroy"
  }
}
```

Result data must be action-specific, size-bounded, schema-validated, and scrubbed of secrets. Large logs belong in a protected artifact store referenced by an opaque ID.

### 10.5 Idempotency

- Repeating the same `requestId` with the same canonical body returns the original receipt.
- Repeating the same key with a different body returns `409`.
- A client timeout after dispatch must enter reconciliation; it must not cause an automatic second mutation with a new ID.
- Hydro must persist idempotency records long enough to cover retry and operator-reconciliation windows.

## 11. Jewel server contract

Jewel must provide:

- a stable, configured server identifier that exactly matches `JEWEL_SERVER_ID`;
- a Hydro execution service reachable only through the approved private or protected network path;
- one explicit adapter per action ID rather than a generic command executor;
- least-privilege service accounts and filesystem permissions per adapter;
- versioned staging areas for deployment bundles and BrainFiles;
- service-management integration for graceful ARS restart and post-restart health checks;
- Terraform plan/apply separation with immutable plan references;
- serialized, preflighted database migrations with documented recovery procedures;
- durable dispatch/idempotency state and structured audit output;
- bounded execution time, output size, and concurrency; and
- a health endpoint reporting agent version, Jewel binding, dependency status, and readiness without exposing secrets.

The Jewel contract does not require inbound public shell access. Network and operating-system access remain outside the browser-facing control plane.

## 12. Security requirements

### 12.1 Authorization and step-up

- Enforce authentication and Admin RBAC independently in the page, verification route, run route, and status route.
- Resolve the current user from the server session; never trust a browser-supplied user ID, email, role, or Telegram association.
- Bind step-up proof to the current user, current session, deployment purpose, and expiry.
- Consume or rotate step-up proof according to the approved policy; High and Critical actions should default to single-use proof.
- High and Critical actions require an explicit UI confirmation. Lumen must decide whether they also require a second human approval.

### 12.2 Input and target control

- Validate requests with a runtime schema before any dispatch.
- Derive target identifiers from server configuration and the frozen action catalogue.
- Reject extra or unknown parameters by default.
- Constrain revision, plan, migration, and artifact identifiers to defined formats.
- Do not concatenate any request field into a shell command.

### 12.3 Secrets and network

- Store Hydro credentials in Google Secret Manager or an equivalently approved secret store.
- Never commit token values, log them, return them to the browser, or expose them through client bundles.
- Apply request timeouts and response-size limits.
- Prevent redirects to untrusted origins and do not allow the client to influence the endpoint.
- Rotate credentials without requiring a source change.

### 12.4 Replay, concurrency, and recovery

- Sign the raw canonical request body with timestamp and nonce.
- Maintain nonce and idempotency records.
- Define per-action concurrency limits; serialize apply, restart, and migration operations where conflicts are possible.
- Fail closed when authorization, signature verification, target binding, or response validation is uncertain.
- Do not represent an acknowledgement timeout as failure if Hydro may already have accepted the action; reconcile by `requestId`.

## 13. Audit requirements

Every attempt, including denials, must produce a structured server-side event with:

- event timestamp;
- `requestId` and, once available, `dispatchId`;
- authenticated user ID and email;
- role decision and step-up result, without the secret proof;
- action ID, Jewel server ID, and approved immutable revision references;
- request outcome and stable error code;
- Hydro acknowledgement/status transition timestamps;
- terminal result summary; and
- correlation ID suitable for support and incident review.

Audit records must not include access tokens, HMAC secrets, session cookies, raw Telegram bot tokens, database credentials, or unsanitized command output. Retention, access, and export policy require owner approval before production.

Telegram notifications supplement the durable audit trail; they are not the audit trail. Notification failure must be recorded but must not rewrite an already accepted Hydro result.

## 14. Configuration contract

| Name | Classification | Purpose |
| --- | --- | --- |
| `JEWEL_SERVER_ID` | Non-secret, server-only configuration | Stable expected Jewel target identifier |
| `HYDRO_AGENT_ENDPOINT` | Sensitive server-only configuration | HTTPS base URL for Hydro |
| `HYDRO_AGENT_TOKEN` | Secret | Hydro service authentication credential |
| `HYDRO_AGENT_TOKEN_SECRET` | Secret | HMAC signing/verification secret |

The example environment file may list these names with empty values and Secret Manager setup instructions. It must never contain operational credentials. Startup or first use must fail with a clear server-side configuration error when required values are absent.

## 15. Reliability and observability

- Use bounded connection and total request timeouts.
- Retry only connection-level or explicitly retryable failures, using the same idempotency key.
- Emit structured logs with correlation fields, not secret-bearing interpolated bodies.
- Track dispatch counts, rejection counts, latency to acknowledgement, completion latency, failures by action, and reconciliation cases.
- Make Hydro/Jewel health visible to Admins without unlocking mutating actions.
- Preserve the last known durable state across browser refreshes and server restarts.
- Treat `unknown` as an actionable reconciliation state, never as success.

## 16. Required scaffold and traceability

After Lumen approves this specification, Watt should scaffold the following changes and include this mapping in the implementation PR:

| File | Specification responsibility |
| --- | --- |
| `hydrojoule/docs/ars-v4.2-jewel-hydro-functional-spec.md` | Approved source of truth |
| `hydrojoule/lib/hydro-agent.ts` | Frozen action IDs, metadata, runtime schemas, signing, dispatch, and normalized response types |
| `hydrojoule/app/api/deploy/run/route.ts` | Session/RBAC/step-up enforcement, server-owned target resolution, audit creation, Hydro dispatch |
| `hydrojoule/app/api/deploy/status/[dispatchId]/route.ts` | Authorized receipt/status lookup and normalization |
| `hydrojoule/app/(protected)/deploy/page.tsx` | Server-side Admin gate and minimal safe props |
| `hydrojoule/app/(protected)/deploy/DeployClient.tsx` | Interactive verification, confirmations, dispatch, and status UI |
| `hydrojoule/.env.local.example` | Jewel/Hydro configuration names and secret-store guidance |
| `hydrojoule/next.config.mjs` | Supported Next.js server configuration if migration from `.ts` is still required by the selected framework/toolchain |
| deployment API and library tests | Security, validation, signature, idempotency, error, and status acceptance coverage |

Implementation may adjust filenames only with an explicit traceability note and no loss of the server/client security boundary.

## 17. Acceptance criteria

The v4.2 scaffold/implementation is acceptable only when all of the following are demonstrable:

1. Anonymous and non-Admin users cannot render or invoke deployment controls.
2. An Admin cannot use another Admin's Telegram ID as step-up proof.
3. An expired, replayed, malformed, or wrong-purpose step-up proof is rejected.
4. Exactly the seven frozen action IDs are accepted.
5. Unknown action IDs and unknown parameters fail before any Hydro request.
6. Browser-supplied target, endpoint, identity, role, or signing fields are ignored or rejected.
7. Every dispatch uses the configured `JEWEL_SERVER_ID` and validates that the Hydro response matches it.
8. The request is authenticated, signed, timestamped, nonce-protected, and idempotent.
9. A duplicate identical request resolves to the original receipt and cannot repeat a mutation.
10. A duplicate idempotency key with different content returns a conflict.
11. Hydro and Jewel expose no generic shell-command action.
12. `terraform-apply` cannot run without a matching approved plan reference.
13. `jewel-sync` stages a versioned artifact without implicit activation.
14. Database migrations are serialized and report their applied revision.
15. ARS restart includes a post-restart health result.
16. Acknowledgement, running, terminal, timeout, and unknown states are distinguishable in both API and UI.
17. Upstream errors and logs are sanitized before reaching the browser.
18. Secrets never appear in client bundles, source, API responses, audit events, or application logs.
19. Every attempt has a durable, correlated audit record.
20. Tests cover authentication, RBAC, step-up binding, allowlisting, target derivation, signing, replay, idempotency, timeout/reconciliation, response validation, and redaction.
21. The implementation PR contains a section-to-file traceability matrix and records any approved deviations.

## 18. Lumen review checklist

Lumen should review and either approve or comment on:

- Jewel/Hydro/Lumen/Watt terminology and boundaries;
- the seven action IDs and their exact semantics;
- target and artifact naming conventions;
- step-up lifetime and single-use policy;
- whether High/Critical actions need second-person approval;
- signature format, credential storage, and replay window;
- status polling versus a signed callback/webhook;
- durable audit storage and retention;
- per-action concurrency, rollback, and recovery behavior;
- whether the contract is sufficiently precise for Watt to scaffold without design invention; and
- whether `next.config.mjs` is required for the chosen Next.js version or should remain unchanged.

## 19. Handoff workflow

1. **Codex reconstruction:** restore the lost specification path and mark recovery provenance.
2. **Lumen review:** review the specification only; return comments and proposed edits. Do not scaffold code yet.
3. **Specification freeze:** resolve comments, record approval, and merge the approved specification.
4. **Watt scaffold:** create the typed contract, protected page split, routes, configuration placeholders, and tests from the approved text.
5. **Implementation PR review:** compare the code against every acceptance criterion and the traceability matrix.
6. **Staged verification:** test against a non-production Hydro/Jewel environment before enabling mutating production actions.

## 20. Process improvements

- Keep specification approval separate from scaffold approval and production enablement.
- Treat action IDs, schemas, and state names as versioned protocols.
- Require a traceability matrix in every implementation PR.
- Record security-sensitive decisions as short architecture decision records rather than leaving them in chat.
- Keep deployment actions disabled until their adapter, tests, audit storage, and recovery procedure exist.
- Use feature flags or environment policy to enable actions per environment.
- Review the action catalogue periodically and remove obsolete capability instead of leaving dormant privileged paths.

## 21. Review disposition

Until Lumen approves this reconstruction:

- status remains **draft**;
- the current placeholder deployment behavior must not be described as a completed Hydro integration;
- Watt should not scaffold against unresolved items; and
- production mutation through this interface remains out of scope.

Approval should record reviewer, date, reviewed commit, decisions on the checklist items, and any accepted deviations.
