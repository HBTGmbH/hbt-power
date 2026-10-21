# AGENTS.md

HBT Power is HBT's skills/profile management app: a React webclient plus six Spring Boot services, each in its own top-level `pwr-*` folder. There is no parent POM: every service is a standalone Maven project that is built, tested and deployed on its own. The root [`README.md`](README.md) is the authoritative setup guide; the per-service READMEs date from the old separate repositories (Travis, `sample_config.js`, Node 10) and are partly outdated.

## Build and test

All Java services need **JDK 13** (Lombok in the Spring Boot 2.2 services fails on JDK 16+). The root `.java-version` pins it for jenv. `./mvnw` uses `JAVA_HOME`; in a non-interactive shell run `eval "$(jenv init -)"` first (the jenv `export` plugin then sets `JAVA_HOME`), otherwise `export JAVA_HOME=$(/usr/libexec/java_home -v 13)`.

```shell
cd pwr-<name>-service
./mvnw package                                   # build + all tests (what CI runs: mvn -B package)
./mvnw test -Dtest=ClassName                     # single test class
./mvnw test -Dtest=ClassName#method              # single test method
```

The wrappers in view-profile and edge download `maven-wrapper.jar` on first use (it is gitignored there). Keep `mvnw` executable in Git (`git update-index --chmod=+x`).

Tests need no running infrastructure: the `test` profile uses in-memory H2, and `pwr-view-profile-service` starts an embedded Redis (`com.github.codemonstur:embedded-redis`, which ships binaries for macOS arm64/x64, Linux and Windows). Most tests are JUnit 4.

Webclient (`pwr-webclient`, CRA/react-scripts, TypeScript). Node version is pinned in `pwr-webclient/.nvmrc` (20, as in CI); npm 11 fails to install the dependencies. Env vars in npm scripts go through `cross-env` so they work on Windows:

```shell
npm --prefix pwr-webclient install
npm --prefix pwr-webclient run start:local       # dev server on :3000 against local services, no login
npm --prefix pwr-webclient run build
```

There are no webclient tests at the moment.

## Local run

`docker compose up -d` (or `podman compose` / `docker-compose`) starts MariaDB on host port **3307** (`skill`, `profile`, `report` DBs, root/`changeit`) and Redis on 6379 (password `changeit`) in their own `hbt-power` network. Port 3307 keeps it clear of other local MySQLs; the `localDev` JDBC URLs and the seed URLs in the POMs point there. Start services with the `localDev` Spring profile: IntelliJ run configs in `.run/` (`[localDev] Backend` starts all but the edge service), or from a terminal `./mvnw package -DskipTests` and then `java -jar target/<name>.jar --spring.profiles.active=localDev` from inside the service folder. Sample data: `./mvnw sql:execute` in profile/skill service, report template: `./mvnw exec:exec` in report service. Tables are created by Hibernate, so start the services once before seeding.

## Architecture

| Service | Port | Storage | Calls |
|---|---:|---|---|
| `pwr-edge-service` (Spring Cloud Gateway, Boot 2.7) | 9000 | – | routes to all |
| `pwr-skill-service` | 9003 | MariaDB + Lucene index | – |
| `pwr-profile-service` | 9004 | MariaDB | skill, view-profile |
| `pwr-report-service` (BIRT → .docx) | 9005 | MariaDB | profile |
| `pwr-statistics-service` (Boot 2.7) | 9007 | Redis | profile |
| `pwr-view-profile-service` | 9008 | Redis | skill, profile, report |

- **Auth lives only in the edge service.** It validates Azure AD JWTs and enforces the `Power.User` / `Power.Admin` roles per path (`pwr-edge-service/.../filters/SecurityConfig.java`), then routes `/pwr-<service>/**` to the service. The backend services themselves have no authentication. In production an ingress maps `/api/<service>/**` the same way.
- **Service-to-service calls use `RestTemplate`** (not Feign, despite some leftover comments/config) with base URLs from `pwr-<name>-service-url` properties. Defaults are docker-compose hostnames; the `localDev` profile overrides them to `localhost`.
- **Data flow:** profile service owns consultants and their profiles; skill service owns the skill tree and search. View-profile service builds editable "view profiles" (snapshots of a profile for one export) in Redis and sends them to the report service, which maps them onto the BIRT data model and renders the report (DOCX, stored in the report history). The report preview (generate dialog, report manager) takes the same path but is rendered as PDF in memory and not stored (`GET /view/{initials}/view/{viewProfileId}/{templateId}/preview` → `POST /report/preview`).
- **Schema management:** no Liquibase/Flyway. `ddl-auto: update` locally (`localDev`) and, since #27, in production too (env `DB_HIBERNATE_DDL_AUTO` in the deployment): Hibernate adds new tables and columns on start. It never drops, renames or changes a column, a type or data, so such changes need hand-written SQL for production (see `pwr-profile-service/fix-id-columns.sql`).
- **Commit instead of version:** a state is identified by commit hash and commit time; the versions in `pom.xml` and `package.json` mean nothing and are not maintained (#77, no `SNAPSHOT`). Every service publishes its commit at `GET /actuator/info` (`git.commit` from the `git-commit-id-plugin`, only branch, commit id and time), the edge at `/pwr-edge-service/actuator/info`, the webclient in `build_info.json` (`compileBuildInfo.js`). Only `health` and `info` are published. The info icon in the app bar shows the commits, together with the logged-in account.
- **Fonts in PDFs** (`PdfFonts`, report service): the templates use the HBT font Simplon Norm, which is licensed and must never be committed or baked into an image. Production mounts its files at `/fonts` (`export.font-directory`, volume in `HBTGmbH/pwr-compose-deploy`); without them the image's Noto Sans stands in, weight for weight. Old templates' Arial maps to Simplon Norm too. iText 2.1.7 in BIRT cannot subset `.otf` fonts with CFF outlines, so those are embedded whole; a PDF without `%%EOF` is reported as a rendering error instead of being delivered.
- **Skill search** uses Hibernate Search/Lucene; the index is rebuilt on every start and via the `/skill/lucene/index` endpoint. Locally it lives in `pwr-skill-service/lucene-data` (gitignored), the tests keep theirs in memory (`local-heap`).
- **Spring profile syntax differs by Boot version:** 2.2 services use `spring.profiles: localDev` in multi-document YAML, the 2.7 services (edge, statistics) use `spring.config.activate.on-profile`.
- Java base packages differ per service (`de.hbt.pwr.profile`, `de.hbt.power`, `de.hbt`, `de.hbt.pwr.view`, `de.hbt.pwr`).

### Webclient

- Redux state in `src/reducers`, components in `src/modules` (`admin`, `home` = profile editing, `general` = shared components).
- Backend access goes through the axios wrappers in `src/clients` (`XyzServiceClient.instance()`), which handle the loading spinner, payload extraction and error alerts, and re-throw errors.
- Binary content (profile pictures, report previews) is loaded through these clients as a blob and shown through a blob URL, never as `src`/iframe URL pointing at the API: those requests carry no token and the edge rejects them. Profile pictures go through `PwrProfilePicture` (`modules/general`), which caches them per picture id.
- Runtime config: `config.js` contains `#PLACEHOLDER`s that `configure_api.sh` replaces from env vars when the nginx container starts. `start:local` sets `REACT_APP_LOCAL_DEV=true`, which serves `config.local.js` and proxies `/api/<service>` to the local ports (`src/setupProxy.js`) and skips Azure login (`CONFIG.LOCAL_DEV`).
- Static files: images, CSS and data live in `src/` and are imported, so the build serves them with a content hash under `/static/`, which nginx (`default.conf`) caches as `immutable`. `public/` only holds `index.html` and `favicon.png`; everything outside `/static/` is served with `no-cache`.
- Conventions: render user-facing text through `PowerLocalizer`; use string values in enums (Redux); prefer components from `modules/general`, e.g. `PwrButton` / `PwrIconButton` with the icon on the right, icon buttons need a tooltip.
- Own profile: the initials of the logged-in account come from the ID token claim `mailnickname` (`OIDCService.getCurrentAccount`). Without the `Power.Admin` role the profile select opens that profile right away; admins choose from the consultant list (`ConsultantSelect`), which the edge only serves to them. Unknown initials get a message, not an error (`ConsultantClient.findConsultant`).
- Unsaved changes in a project: `PWR_HISTORY.block` (registered in `index.tsx`) holds back every navigation and asks through the `UnsavedChangesDialog`. Actions that leave a project without navigating (select another project, add a project, admin area, logout) go through `confirmLeavingUnsavedChanges` (`reducers/navigation/UnsavedChanges.ts`). Saving, cancelling and deleting don't ask.
- Input fields use the Material-UI `filled` variant (grey area), set as default in `PowerTheme.ts`: don't set `variant` per field. Components the theme doesn't reach (`ChipInput`, `FormControl` around a `Select`) get `variant="filled"` explicitly. Disabled and read-only fields have no grey area, so read mode looks different from edit mode.

## CI

One GitHub Actions workflow per folder (`.github/workflows/<folder>.yml`), path-filtered (the same filter for `push` and `pull_request` via a YAML anchor). Each has two jobs:

- **`check`** ("Build and test") on pull requests against `main`: build with Zulu JDK 13 / Node 20, run tests, build the image without pushing. Read-only token, dependency caches allowed.
- **`publish`** on push to `main` (or manually): the same build, then push the image to `ghcr.io/hbtgmbh/hbt-power/<folder>`. Only this job has `packages: write`, and it uses no dependency cache, so nothing cached by a PR run can end up in an image.

A PR only shows checks for the folders it touches. Workflow changes must pass actionlint and zizmor.

- **`lint-actions.yml`** ("Lint GitHub Actions") runs on every PR against `main` and every push to `main` that touches `.github/**`: actionlint with shellcheck and zizmor (online audits), with `contents: read` only. Locally: `uvx --from actionlint-py --with shellcheck-py actionlint` and `uvx zizmor --persona regular .` from the repository root.
- **Pinning policy** in `.github/zizmor.yml`: first-party actions (`actions/*`, `github/*`, `docker/*` …) and `HBTGmbH/*` with a major tag (`@v7`), all others with the full commit SHA plus a `# vX.Y.Z` comment.
- **Dependabot** (`.github/dependabot.yml`) opens a PR for new action versions once a week, at the earliest 7 days after a release (`cooldown`). For a new major version check that every input the workflow uses still exists in the new `action.yml`. Maven and npm are not covered.

## GitHub workflow

- **Repository:** `HBTGmbH/hbt-power` (take the owner from `git remote get-url origin`). It is **public**.
- **No operating environment details on GitHub:** no host names, deployment or management URLs, tenant/client IDs, connection strings, secrets, or queries against live systems in issues, PRs, commit messages, code, comments, docs or screenshots. Write „the production environment“, `<host>` instead. A later edit doesn't help: GitHub keeps the edit history and git keeps the commit.
- **Issue structure:** current behaviour (*Ist-Zustand*, with references into the code), desired behaviour (*Wunsch*), and acceptance criteria as a checklist. Mockups (ASCII sketch or screenshot of the local webclient with seed data) and ` ```mermaid ` diagrams are welcome, e.g. a `sequenceDiagram` when a change crosses services, but not required.
- **Issue type:** set after creation via GraphQL: `Task` `IT_kwDOAYn5ks4AV-6C`, `Bug` `IT_kwDOAYn5ks4AV-6D`, `Feature` `IT_kwDOAYn5ks4AV-6H`.
  ```bash
  gh api graphql -f query='mutation { updateIssue(input: { id: "<node_id>", issueTypeId: "<type_id>" }) { issue { number issueType { name } } } }'
  # node_id: gh api repos/HBTGmbH/hbt-power/issues/NNN --jq .node_id
  ```
- **Branches:** `feature/<issue>-<short-description>` (new capability) or `bug/<issue>-<short-description>` (defect), branched from an up-to-date `main`. One issue per branch and PR, no bundling, except for small fixes (next bullet). No direct pushes to `main`.
- **Small fixes along the way:** fix small defects you come across directly in the current branch, as long as they don't put the current ticket at risk. Small means: an obvious defect, a few lines, cause and fix clear without further analysis, no change to an API contract, entity, Redis model or the edge path rules, and verifiable within the current test and click-through. Commit it separately with the current issue ID (`#12 - Nebenbei: …`) and list it in the PR under *Beschreibung*. Anything bigger, or anything that would delay or blur the current ticket, gets its own issue.
- **Line endings:** LF for all text files, CRLF only for `*.cmd`/`*.bat`, set in `.gitattributes`. Commits that only reformat (like the normalization in #46) go into `.git-blame-ignore-revs`, so `git blame` and GitHub skip them (locally: `git config blame.ignoreRevsFile .git-blame-ignore-revs`).
- **Commit messages:** every commit starts with the issue ID, then ` - `, then a short description, e.g. `#12 - Skill-Suche ignoriert Groß-/Kleinschreibung`. Without an issue (typos, trivial housekeeping): `#noissue - …`.
- **Pull requests:** fill in `.github/pull_request_template.md`, put `Closes #NNN` in the body, and include: *"Reviewed AGENTS.md; changes comply with architecture and security guidelines."*

## Definition of Ready

Before writing any code:

- [ ] An issue exists and its type is set (`Bug`, `Feature`, `Task`) before the branch is created
- [ ] The issue describes the current behaviour (with references into the code), the desired behaviour, and acceptance criteria as a checklist
- [ ] The acceptance criteria are reviewed: each one can be checked, and together they say when the issue is done. Gaps are closed in the issue before coding starts
- [ ] `main` is checked out and up to date: `git checkout main && git pull`
- [ ] A dedicated branch exists: `feature/<issue>-<short-description>` or `bug/<issue>-<short-description>`

## Definition of Done

Apply this at the end of each task to what the task changed, and report which items apply and whether each is satisfied. A task is done when all applicable items are true.

### Build and tests
- [ ] `./mvnw verify` passes in every changed `pwr-*-service` (JDK 13)
- [ ] `npm run build` passes if `pwr-webclient` changed
- [ ] All existing tests pass; new backend behaviour is covered by tests

### Services
- [ ] **API contracts:** if an endpoint changed, every caller is adjusted in the same PR: the `RestTemplate` clients in the other services and `pwr-webclient/src/clients`
- [ ] **Edge security:** new or moved endpoints are checked against the path rules in `pwr-edge-service/.../filters/SecurityConfig.java`. The services check no permissions themselves; admin functionality must live under a path the edge restricts to `Power.Admin`
- [ ] **Redis compatibility:** changes to Redis models (`ViewProfile`, `ReportTemplate`, statistics models) keep existing stored data readable: no renaming or removing fields without a migration
- [ ] **Database schema:** there is no Liquibase/Flyway. New tables and columns are added by Hibernate on start (`ddl-auto: update`); a change it can't do (rename, drop, type change, data migration) comes with a SQL script for production (like `pwr-profile-service/fix-id-columns.sql`). Every schema change is listed under *Operations / Deployment Notes* in the PR

### Webclient (if UI changed)
- [ ] User-facing text goes through `PowerLocalizer`; new keys are in `src/localization/de-DE.json`
- [ ] Shared components from `modules/general` are reused: `PwrButton` / `PwrIconButton`, icon on the right, icon buttons with tooltip
- [ ] Backend access only through the clients in `src/clients`; enums use string values
- [ ] The change was clicked through with `npm run start:local` against the local backend

### Documentation and pull request
- [ ] `AGENTS.md` and `README.md` are updated in the same PR if a rule, command, port or prerequisite changed
- [ ] No operating environment details in code, docs, commits, issue or PR (see GitHub workflow)
- [ ] Every commit message starts with `#NNN - ` (or `#noissue - `)
- [ ] Small fixes made along the way (see GitHub workflow) are listed in the PR
- [ ] PR body follows the template, contains `Closes #NNN` and the compliance sentence
- [ ] The fulfilled acceptance criteria are ticked off in the issue. A criterion that is not fulfilled stays open, and the PR says why
