# 4. Lösungsstrategie

HBT Power ist 2016 als Web-Anwendung mit dem Spring-Cloud-Netflix-Stack entstanden (Eureka, Hystrix, Feign). 2023 wurde dieser Stack abgebaut: Feign wurde durch `RestTemplate` ersetzt, das alte Gateway durch Spring Cloud Gateway. Seit Oktober 2026 liegen alle Teile in einem Monorepo. Geblieben ist die Aufteilung in kleine Services, jeder mit eigenen Daten.

## 4.1 Die grundlegenden Entscheidungen

| Thema | Lösung | Mehr dazu |
|---|---|---|
| **Zerlegung** | Ein Webclient, eine Edge und fünf fachliche Services, geschnitten nach Daten: Profile, Skill-Baum, Dokumente, View-Profile, Statistik | [Kapitel 5](05-bausteinsicht.md), [ADR-02](09-architekturentscheidungen.md#adr-02-kleine-services-je-datenbestand) |
| **Zugang und Sicherheit** | Einziger Eingang ist die Edge. Sie prüft das Token von Entra ID und die Rolle je Pfad, und sie setzt die Identität als Header. Die Services selbst authentifizieren nicht. | [ADR-04](09-architekturentscheidungen.md#adr-04-anmeldung-und-rollen-nur-in-der-edge-identität-über-header), [Kapitel 8.1](08-querschnittliche-konzepte.md#81-sicherheit) |
| **Admin-Funktionen** | Alles nur für Admins liegt unter `/admin/**` des jeweiligen Service. Die Edge braucht dafür eine Regel je Service. | [ADR-05](09-architekturentscheidungen.md#adr-05-admin-funktionen-unter-admin-jedes-service) |
| **Kommunikation** | Synchron über REST/JSON mit `RestTemplate`. Die Basis-URLs kommen aus Properties, keine Service Discovery. | [ADR-03](09-architekturentscheidungen.md#adr-03-aufrufe-zwischen-services-mit-resttemplate) |
| **Datenhaltung** | Relational, was Beziehungen hat (MariaDB: Profile, Skill-Baum, Dokumente). Redis für Momentaufnahmen (View-Profile) und die abgeleitete Statistikkopie. Das Schema legt Hibernate an. | [ADR-08](09-architekturentscheidungen.md#adr-08-schema-mit-hibernate-ddl-auto-update-ohne-migrationswerkzeug), [ADR-09](09-architekturentscheidungen.md#adr-09-redis-für-view-profile-und-vorlagen-metadaten) |
| **Konsistenz über Services** | Keine verteilten Transaktionen. Löschen geht in einer festen Reihenfolge, wiederholbar und von außen nach innen; jeder Service erkennt und bereinigt seine Datenleichen selbst. | [ADR-20](09-architekturentscheidungen.md#adr-20-berater-löschen-über-services-ohne-verteilte-transaktion), [ADR-21](09-architekturentscheidungen.md#adr-21-housekeeping-je-service) |
| **Stammdaten** | Der Skill-Baum ist die Referenz für Skill-Namen (Aliase, Groß-/Kleinschreibung). Profil-Elemente sind gemeinsame Einträge, die Admins pflegen. | [ADR-13](09-architekturentscheidungen.md#adr-13-skill-namen-aliase-normalisierung-auf-den-baum-groß-kleinschreibung) |
| **Dokumente** | BIRT-Vorlagen, DOCX asynchron und gespeichert, PDF-Vorschau synchron im Speicher. Die Hausschrift kommt als Volume dazu. | [ADR-11](09-architekturentscheidungen.md#adr-11-birt-für-dokumente-docx-gespeichert-pdf-vorschau-live), [ADR-12](09-architekturentscheidungen.md#adr-12-lizenzierte-schrift-nie-im-repository-oder-image) |
| **Auswertung** | Der Statistics Service hält eine eigene Kopie aller Profile. Er lädt sie stündlich und nach Massenänderungen neu. | [ADR-10](09-architekturentscheidungen.md#adr-10-statistik-mit-eigener-kopie-aller-berater) |
| **Bedienoberfläche** | Single-Page-App mit Redux. Der Zustand steht in der URL, Material-UI mit einem eigenen Theme, gemeinsame `Pwr*`-Komponenten. | [Kapitel 8.8](08-querschnittliche-konzepte.md#88-bedienoberfläche) |
| **Auslieferung** | Ein Image je Ordner, CI je Ordner mit Pfadfiltern; Watchtower spielt neue Images automatisch ein. | [ADR-07](09-architekturentscheidungen.md#adr-07-betrieb-mit-docker-compose-auf-einem-host-und-watchtower), [ADR-18](09-architekturentscheidungen.md#adr-18-ci-je-ordner-mit-pfadfiltern-und-getrenntem-publish) |
| **Nachvollziehbarkeit** | Jeder Teil zeigt seinen Commit (`/actuator/info`, `build_info.json`); die App zeigt alle zusammen. | [ADR-06](09-architekturentscheidungen.md#adr-06-commit-statt-version) |

## 4.2 Wie die Strategie die Qualitätsziele stützt

| Qualitätsziel | Beitrag der Strategie |
|---|---|
| Korrekte, konsistente Daten | Ein Besitzer je Datenbestand; Namen normalisiert auf den Skill-Baum; Löschen in fester Reihenfolge; Housekeeping; Statistik nach Massenänderungen neu geladen |
| Sicherheit und Datenschutz | Ein einziger Eingang mit Tokenprüfung; Identität nur aus den Headern der Edge; Admin-Pfade getrennt; Binärdaten nur mit Token |
| Bedienbarkeit | Gemeinsame Komponenten und Regeln für Formulare, Löschen und Navigation; Änderungen ohne Ladeüberlagerung (`patchInBackground`) |
| Wartbarkeit | Kleine, getrennt baubare Teile; Regeln in `AGENTS.md`; CI und Definition of Done; Commit als Stand |
| Qualität der Dokumente | Eine Vorlage für Export und Vorschau; Hausschrift eingebettet, mit Ersatz Gewicht für Gewicht |

## 4.3 Bewusst nicht gewählt

- **Verteilte Transaktionen oder Sagas:** Die Datenmengen und Abläufe sind klein. Eine feste Reihenfolge und das Housekeeping reichen.
- **Service Discovery, Circuit Breaker:** 2023 mit Spring Cloud Netflix entfernt. Die Services laufen zusammen auf einem Host.
- **Migrationswerkzeug (Flyway, Liquibase):** Es gibt `ddl-auto: update` und SQL-Skripte von Hand ([ADR-08](09-architekturentscheidungen.md#adr-08-schema-mit-hibernate-ddl-auto-update-ohne-migrationswerkzeug)). Das ist ein bekanntes Risiko ([Kapitel 11](11-risiken-und-technische-schulden.md)).

Für die Zukunft geplant, aber offen:
- Die drei MariaDB-Services zusammenlegen (#50), Java und Spring Boot aktualisieren (#51), Redis ablösen (#52), Material-UI aktualisieren (#53).
- BIRT ablösen (#64).
