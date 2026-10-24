# 2. Randbedingungen

## 2.1 Technische Randbedingungen

| Randbedingung | Erläuterung |
|---|---|
| **JDK 13** für alle Java-Services | Lombok 1.18.0/1.18.6 in den Spring-Boot-2.2-Services kompiliert ab JDK 16 nicht. Die Version ist in `.java-version` und in CI (Zulu 13) festgelegt, die Images laufen auf `azul/zulu-openjdk-alpine:13-jre`. Ein Upgrade ist in #51 geplant. |
| **Spring Boot 2.2** (Profile, Skill, Report, View-Profile), **2.7** (Edge, Statistics) | Die unterschiedliche Syntax für Profile in YAML ist in [`AGENTS.md`](../../AGENTS.md) beschrieben. |
| **MariaDB 11** | Drei Datenbanken: `profile`, `skill` und `report`. Die Kollation `utf8mb4_uca1400_ai_ci` ignoriert Groß-/Kleinschreibung und Akzente (#207). |
| **Redis 7** | View-Profile, Vorlagen-Metadaten, Statistikkopie. In der Produktion eine Instanz mit getrennten logischen Datenbanken. |
| **BIRT 4.3.1** mit iText 2.1.7 | Rendert DOCX und PDF. Die Vorlagen werden nur mit dem Eclipse BIRT Designer bearbeitet (#64). |
| **Webclient:** React 18, Material-UI v4, Create React App (react-scripts 5), Redux 4, TypeScript 5.3 | Node 20 ist festgelegt (`pwr-webclient/.nvmrc`); npm 11 scheitert an den Abhängigkeiten. |
| **Microsoft Entra ID** (Azure AD) | Anmeldung (OIDC mit `@azure/msal-browser`) und App-Rollen `Power.User` und `Power.Admin`. |
| **Container** | Jeder Ordner liefert ein Image nach `ghcr.io/hbtgmbh/hbt-power/<ordner>`. Die Produktion läuft mit Docker Compose auf einem Host ([Kapitel 7](07-verteilungssicht.md)). |
| **Plattformen für die Entwicklung** | macOS (Apple Silicon und Intel), Linux und Windows mit Podman oder Docker (#1). |

## 2.2 Organisatorische Randbedingungen

| Randbedingung | Erläuterung |
|---|---|
| **Öffentliches Repository** | `HBTGmbH/hbt-power` ist öffentlich. Keine Details der Betriebsumgebung (Hosts, URLs, IDs, Secrets) in Issues, PRs, Commits, Code oder Dokumentation. GitHub behält auch die Bearbeitungshistorie. |
| **Monorepo ohne Parent-POM** | Seit 2026-10-15 liegen die früheren Einzel-Repositories als Ordner nebeneinander. Jeder Ordner wird für sich gebaut, getestet und ausgeliefert ([ADR-01](09-architekturentscheidungen.md#adr-01-monorepo-mit-eigenständigen-projekten-je-ordner)). |
| **Arbeitsweise** | Kein Code ohne Issue (Ist-Zustand, Wunsch, Akzeptanzkriterien). Ein Branch und ein PR je Issue, Commit-Nachricht `#NNN - …`. Definition of Ready und Definition of Done stehen in [`AGENTS.md`](../../AGENTS.md). |
| **Merge ist Deployment** | Jeder Merge nach `main` baut neue Images; die Produktion zieht sie automatisch ([Kapitel 7](07-verteilungssicht.md)). Was vorher passieren muss (SQL-Skript, Umgebungsvariable), steht im PR unter *Operations / Deployment Notes* und wird vor dem Merge erledigt. |
| **Commit statt Version** | Versionsnummern werden nicht gepflegt. Ein Stand ist ein Commit (#77). |
| **Abhängigkeiten** | Dependabot aktualisiert nur GitHub Actions. Maven und npm werden von Hand aktualisiert (#8). |
| **Entwicklung mit Agenten** | `AGENTS.md` (und `CLAUDE.md`) halten die Regeln so fest, dass Menschen und Agenten nach denselben arbeiten. |

## 2.3 Konventionen

- **Sprache:** Bedienoberfläche, Issues und PRs auf Deutsch; Code, Kommentare und `AGENTS.md` auf Englisch.
- **Zeilenenden:** LF für alle Textdateien, CRLF nur für `*.cmd` und `*.bat` (`.gitattributes`, #46).
- **UI:** Texte über `PowerLocalizer`, gemeinsame Komponenten aus `modules/general`, Farben aus dem Theme ([Kapitel 8](08-querschnittliche-konzepte.md#88-bedienoberfläche)).

## 2.4 Rechtliche Randbedingungen

- **Personenbezogene Daten:** Profile enthalten Namen, Geburtsdatum, Profilbild und den beruflichen Werdegang. Zugriff gibt es nur nach Anmeldung. Wer gelöscht wird, wird vollständig gelöscht, in allen Services (#240). An alle angemeldeten Benutzer geht nur das Nötigste (`GET /consultants/names`: Kürzel, Kurz- und voller Name, #216).
- **Lizenzierte Schrift:** Die Hausschrift Simplon Norm darf weder ins Repository noch in ein Image. Die Produktion bindet sie als Volume ein (#81, #82).
- **Keine Übertragung an Dritte im Browser:** Der Icon-Font wird selbst ausgeliefert, nicht von Google geladen (#109).
