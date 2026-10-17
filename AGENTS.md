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

`docker compose up -d` (or `podman compose` / `docker-compose`) starts MariaDB on host port **3307** (`skill`, `profile`, `report` DBs, root/`changeit`) and Redis on 6379 (password `changeit`) in their own `hbt-power` network. Port 3307 keeps it clear of other local MySQLs; the `localDev` JDBC URLs and the seed URLs in the POMs point there. Start services with the `localDev` Spring profile: IntelliJ run configs in `.run/` (`[localDev] Backend` starts all but the edge service), or from a terminal `./mvnw package -DskipTests` and then `java -jar target/<name>.jar --spring.profiles.active=localDev` from inside the service folder (report-service resolves its `localDev` file paths relative to it). Sample data: `./mvnw sql:execute` in profile/skill service, report template: `./mvnw exec:exec` in report service. Tables are created by Hibernate, so start the services once before seeding.

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
- **Data flow:** profile service owns consultants and their profiles; skill service owns the skill tree and search. View-profile service builds editable "view profiles" (snapshots of a profile for one export) in Redis and sends them to the report service, which maps them onto the BIRT data model and renders the report.
- **Schema management:** no Liquibase/Flyway. `localDev` uses `ddl-auto: update`; production runs with `ddl-auto: none` (env `DB_HIBERNATE_DDL_AUTO`), so entity changes need hand-written SQL for production (see `pwr-profile-service/fix-id-columns.sql`).
- **Skill search** uses Hibernate Search/Lucene; the index is rebuilt via the `/skill/lucene/index` endpoint.
- **Spring profile syntax differs by Boot version:** 2.2 services use `spring.profiles: localDev` in multi-document YAML, the 2.7 services (edge, statistics) use `spring.config.activate.on-profile`.
- Java base packages differ per service (`de.hbt.pwr.profile`, `de.hbt.power`, `de.hbt`, `de.hbt.pwr.view`, `de.hbt.pwr`).

### Webclient

- Redux state in `src/reducers`, components in `src/modules` (`admin`, `home` = profile editing, `general` = shared components).
- Backend access goes through the axios wrappers in `src/clients` (`XyzServiceClient.instance()`), which handle the loading spinner, payload extraction and error alerts, and re-throw errors.
- Runtime config: `config.js` contains `#PLACEHOLDER`s that `configure_api.sh` replaces from env vars when the nginx container starts. `start:local` sets `REACT_APP_LOCAL_DEV=true`, which serves `config.local.js` and proxies `/api/<service>` to the local ports (`src/setupProxy.js`) and skips Azure login (`CONFIG.LOCAL_DEV`).
- Conventions: render user-facing text through `PowerLocalizer`; use string values in enums (Redux); prefer components from `modules/general`, e.g. `PwrButton` / `PwrIconButton` with the icon on the right, icon buttons need a tooltip.

## CI

One GitHub Actions workflow per folder (`.github/workflows/<folder>.yml`), path-filtered, running only on push to `main` (or manually): build with Zulu JDK 13 / Node 20, run tests, push the image to `ghcr.io/hbtgmbh/hbt-power/<folder>`. There are no PR checks.
