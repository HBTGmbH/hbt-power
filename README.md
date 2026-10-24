# HBT Power

| Folder                                                   | What                                | Local port | Stack                   |
|----------------------------------------------------------|-------------------------------------|-----------:|-------------------------|
| [`pwr-webclient`](pwr-webclient/README.md)               | React frontend                      |       3000 | React 18, MUI v4        |
| [`pwr-profile-service`](pwr-profile-service/README.md)   | Consultants, profiles, admin        |       9004 | Spring Boot 2.2, MariaDB |
| [`pwr-skill-service`](pwr-skill-service/README.MD)       | Skill tree and search               |       9003 | Spring Boot 2.2, MariaDB |
| [`pwr-report-service`](pwr-report-service/README.md)     | Report generation (BIRT)            |       9005 | Spring Boot 2.2, MariaDB |
| `pwr-statistics-service`                                 | Statistics                          |       9007 | Spring Boot 2.7, Redis  |
| `pwr-view-profile-service`                               | View profiles and report templates  |       9008 | Spring Boot 2.2, Redis  |
| `pwr-edge-service`                                       | Routing and auth                    |       9000 | Spring Cloud Gateway    |

Infrastructure for local development (MariaDB, Redis) is defined in [`docker-compose.yaml`](docker-compose.yaml).

The architecture (context, building blocks, runtime flows, deployment, decisions, risks) is documented after arc42 in [`docs/arc42/`](docs/arc42/README.md); the rules for development are in [`AGENTS.md`](AGENTS.md).

## Prerequisites

Works on macOS (Apple Silicon and Intel), Linux and Windows.

- **JDK 13**, e.g. Azul Zulu 13 (IntelliJ: *File → Project Structure → SDKs → + → Download JDK*, or [azul.com/downloads](https://www.azul.com/downloads/?version=java-13-mts&package=jdk), native builds for arm64 and x64).
  Newer JDKs don't work: the Spring Boot 2.2 services use Lombok versions that fail to compile on JDK 16+.
  Homebrew has no `zulu@13` cask.
- **Node.js 20** (as in CI, pinned in [`pwr-webclient/.nvmrc`](pwr-webclient/.nvmrc)) with its bundled npm 10.
  npm 11 (Node 24+) fails on `npm install` with a peer dependency conflict.
- **Podman** or **Docker** with compose support (`podman compose`, `docker compose` or `docker-compose`, e.g. with Colima on macOS)

### Version managers (optional)

The repository root contains a `.java-version` for [jenv](https://www.jenv.be) and `pwr-webclient/.nvmrc` for [fnm](https://github.com/Schniz/fnm) (macOS, Linux and Windows) or nvm.

jenv (macOS/Linux), after installing Zulu 13:

```shell
jenv add /path/to/zulu-13.jdk/Contents/Home   # macOS; on Linux the JDK directory itself
eval "$(jenv init -)"                          # also add this line to ~/.zshrc
jenv enable-plugin export                      # only works after jenv init
```

The `export` plugin sets `JAVA_HOME`. `./mvnw` needs it, otherwise on macOS it falls back to `/usr/libexec/java_home`, which picks the newest installed JDK instead of 13.

fnm (`brew install fnm` or `winget install Schniz.fnm`), then in `~/.zshrc` (PowerShell: see the fnm README):

```shell
eval "$(fnm env --use-on-cd --version-file-strategy=recursive)"
```

`fnm install` in `pwr-webclient` installs the pinned Node version, `cd` switches to it automatically.

## IntelliJ setup

1. Open the repository root in IntelliJ.
2. Go to *File → Project Structure → Modules* and delete the root module.
3. For each Java service (`pwr-*-service`): *+ → Import Module*, select its folder, choose *Import module from external model → Maven*.
4. Import `pwr-webclient` via *+ → Import Module → Create module from existing sources*.
5. Make the Maven build use JDK 13:
   - *Settings → Build, Execution, Deployment → Build Tools → Maven → Runner*: tick **Delegate IDE build/run actions to Maven**

The shared run configurations in [`.run/`](.run) are picked up automatically and appear in the *local development* folder of the run widget.

## Run locally

The `localDev` Spring profiles and the webclient's local mode talk to the services directly. The edge service and Azure login are bypassed.

### 1. Start MariaDB and Redis

```shell
podman compose up -d
```

or, with Docker:

```shell
docker compose up -d
```

MariaDB on `3307` (`root` / `changeit`, databases `skill`, `profile`, `report`). Redis on `6379` (password `changeit`).
Both run in their own `hbt-power` network. MariaDB is published on `3307` instead of `3306` so it can run next to another local MySQL/MariaDB; inside the network it's `mariadb:3306`.

### 2. Start the backend

Run **`[localDev] Backend`** from the run widget. It starts all five services at once:

| Run configuration                                                                     | Health check                                                         |
|---------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| [`[localDev] Profile Server`](.run/[localDev]%20Profile%20Server.run.xml)             | [localhost:9004/actuator/health](http://localhost:9004/actuator/health) |
| [`[localDev] Skill Service`](.run/[localDev]%20Skill%20Service.run.xml)               | [localhost:9003/actuator/health](http://localhost:9003/actuator/health) |
| [`[localDev] Report Service`](.run/[localDev]%20Report%20Service.run.xml)             | [localhost:9005/actuator/health](http://localhost:9005/actuator/health) |
| [`[localDev] Statistics service`](.run/[localDev]%20Statistics%20service.run.xml)     | [localhost:9007/actuator/health](http://localhost:9007/actuator/health) |
| [`[localDev] View profile service`](.run/[localDev]%20View%20profile%20service.run.xml) | [localhost:9008/actuator/health](http://localhost:9008/actuator/health) |

The edge service ([`[localDev] Edge Server`](.run/[localDev]%20Edge%20Server.run.xml)) isn't needed locally and isn't part of it.

### 3. Start the webclient

Run **`[localDev] Webclient`** ([`.run/[localDev] Webclient.run.xml`](.run/[localDev]%20Webclient.run.xml)), or from the terminal:

```shell
npm --prefix pwr-webclient install
```

```shell
npm --prefix pwr-webclient run start:local
```

Open [localhost:3000](http://localhost:3000). Local boot is auto-authenticated as admin

### Load test data (optional)

The profile and skill services each have a Maven goal that inserts sample data into the local MariaDB:

| Service                                                       | Sample data                                                                                |
|---------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| [`pwr-profile-service`](pwr-profile-service/local-dev/seed.sql) | Consultant `mmu` with a filled profile and one project                                   |
| [`pwr-skill-service`](pwr-skill-service/local-dev/seed.sql)     | Skill tree with the roots *Information Technology*, *Agriculture* and *Gaming* (91 skills) |

In IntelliJ's Maven tool window, run *Plugins → sql → sql:execute* under the service. Or from a terminal whose `JAVA_HOME` points to JDK 13:

```shell
cd pwr-profile-service && ./mvnw sql:execute
```

```shell
cd pwr-skill-service && ./mvnw sql:execute
```

The tables are **created by the services, so start the backend at least once before** seeding a fresh database.
The skill service builds its search index on start, so **restart it after seeding** the skills (or call
`POST http://localhost:9003/admin/skill/lucene/index`); until then the skill suggestions stay empty.

#### Report template

The report service has a Maven goal that uploads the committed
[`designfile_hbt_standard.rptdesign`](pwr-report-service/src/main/resources/templates/designfile_hbt_standard.rptdesign)
as the template *HBT Standard (local)*

```shell
cd pwr-report-service && ./mvnw exec:exec
```

#### Fonts in PDFs

The templates use the HBT font Simplon Norm. It is licensed and therefore in no repository and no image. Without it,
the PDF preview uses BIRT's built-in Times-Roman locally; the image falls back to Noto Sans. To see the real font
locally, start the report service with the directory that holds the `.otf`/`.ttf` files (only the directory itself is
read, not its subdirectories):

```shell
java -jar target/pwr-report-service-*.jar --spring.profiles.active=localDev \
  "--export.font-directory=/path/to/Simplon Norm HBT"
```

`--export.fallback-font-directory=<dir>` sets the stand-in fonts (in the image: Noto Sans in
`/usr/share/fonts/pwr-fallback`). The log shows the mapping at start (`[Fonts] Simplon Norm -> …`).

### Stop and reset

```shell
podman compose down
```

Reset MariaDB and Redis to an empty state (deletes all local data):

```shell
podman compose down -v
```

## Known issues

- **Report service hangs on start with no output when run from IntelliJ:** a JDK 13 startup deadlock between IntelliJ attaching to the JVM and the signed BIRT jars.
  Its run configuration therefore sets `-XX:+DisableAttachMechanism`, so IntelliJ's live Spring view (beans, health) isn't available for it.
- **`Lombok … unsupported compiler` or `module jdk.compiler does not "opens" …`:** Maven or IntelliJ is building with a JDK newer than 13. Check the Maven runner JRE (see [IntelliJ setup](#intellij-setup)).
