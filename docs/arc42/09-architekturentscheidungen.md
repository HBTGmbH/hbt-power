# 9. Architekturentscheidungen

Die Entscheidungen sind als kurze ADRs festgehalten: Kontext, Entscheidung, Konsequenzen.

Status:
- **gilt:** umgesetzt und in `AGENTS.md` beschrieben.
- **übernommen:** stammt aus dem alten Code und gilt weiter.
- **vorgeschlagen:** ein offenes Issue.

Neue Entscheidungen bekommen die nächste Nummer. Eine abgelöste Entscheidung bleibt stehen und verweist auf ihre Nachfolgerin.

| ADR | Entscheidung | Status | Issues |
|---|---|---|---|
| [01](#adr-01-monorepo-mit-eigenständigen-projekten-je-ordner) | Monorepo mit eigenständigen Projekten je Ordner | gilt | #1, #71, #77 |
| [02](#adr-02-kleine-services-je-datenbestand) | Kleine Services je Datenbestand | übernommen, Zusammenlegung vorgeschlagen | #50, #51, #52 |
| [03](#adr-03-aufrufe-zwischen-services-mit-resttemplate) | Aufrufe zwischen Services mit `RestTemplate` | gilt | – |
| [04](#adr-04-anmeldung-und-rollen-nur-in-der-edge-identität-über-header) | Anmeldung und Rollen nur in der Edge, Identität über Header | gilt | #65, #67, #129, #203, #214 |
| [05](#adr-05-admin-funktionen-unter-admin-jedes-service) | Admin-Funktionen unter `/admin` jedes Service | gilt | #178, #203, #218 |
| [06](#adr-06-commit-statt-version) | Commit statt Version | gilt | #71, #77, #78 |
| [07](#adr-07-betrieb-mit-docker-compose-auf-einem-host-und-watchtower) | Betrieb mit Docker Compose auf einem Host und Watchtower | gilt | – |
| [08](#adr-08-schema-mit-hibernate-ddl-auto-update-ohne-migrationswerkzeug) | Schema mit Hibernate `ddl-auto: update`, ohne Migrationswerkzeug | gilt | #27 |
| [09](#adr-09-redis-für-view-profile-und-vorlagen-metadaten) | Redis für View-Profile und Vorlagen-Metadaten | übernommen, Ablösung vorgeschlagen | #52, #179 |
| [10](#adr-10-statistik-mit-eigener-kopie-aller-berater) | Statistik mit eigener Kopie aller Berater | gilt | #205, #208, #218 |
| [11](#adr-11-birt-für-dokumente-docx-gespeichert-pdf-vorschau-live) | BIRT für Dokumente, DOCX gespeichert, PDF-Vorschau live | gilt, Ablösung untersucht | #64, #66, #155 |
| [12](#adr-12-lizenzierte-schrift-nie-im-repository-oder-image) | Lizenzierte Schrift nie im Repository oder Image | gilt | #81, #82 |
| [13](#adr-13-skill-namen-aliase-normalisierung-auf-den-baum-groß-kleinschreibung) | Skill-Namen: Aliase, Normalisierung auf den Baum, Groß-/Kleinschreibung | gilt | #27, #207, #208, #215 |
| [14](#adr-14-skill-suche-mit-hibernate-search-und-lucene) | Skill-Suche mit Hibernate Search und Lucene | übernommen | #32, #33, #74 |
| [15](#adr-15-kurznamen-der-berater-zentral-berechnet) | Kurznamen der Berater zentral berechnet | gilt | #216 |
| [16](#adr-16-localdate-als-string-im-webclient) | `LocalDate` als String im Webclient | gilt | #24, #26 |
| [17](#adr-17-vorerst-jdk-13-und-spring-boot-22) | Vorerst JDK 13 und Spring Boot 2.2 | gilt, Upgrade vorgeschlagen | #51 |
| [18](#adr-18-ci-je-ordner-mit-pfadfiltern-und-getrenntem-publish) | CI je Ordner mit Pfadfiltern und getrenntem Publish | gilt | #6, #8 |
| [19](#adr-19-profil-elemente-als-gemeinsame-einträge-mit-früheren-namen) | Profil-Elemente als gemeinsame Einträge mit früheren Namen | gilt | #227, #230 |
| [20](#adr-20-berater-löschen-über-services-ohne-verteilte-transaktion) | Berater löschen über Services ohne verteilte Transaktion | gilt | #240, #243 |
| [21](#adr-21-housekeeping-je-service) | Housekeeping je Service | gilt | #242 |
| [22](#adr-22-löschen-in-der-oberfläche-absichern) | Löschen in der Oberfläche absichern | gilt | #134, #181 |
| [23](#adr-23-webclient-mit-laufzeitkonfiguration-und-gehashten-dateien) | Webclient mit Laufzeitkonfiguration und gehashten Dateien | gilt | #9, #10, #109 |

---

## ADR-01: Monorepo mit eigenständigen Projekten je Ordner

- **Status:** gilt (seit 2026-10-15)
- **Kontext:** HBT Power bestand aus sieben Repositories `HBTGmbH/pwr-*` mit eigener CI (Travis) und Jira-Schlüsseln in den Commits. Änderungen über Services hinweg brauchten mehrere PRs, und die Stände passten nicht sicher zusammen.
- **Entscheidung:** Ein Repository `hbt-power`, in das die sieben Repositories als Ordner gemergt wurden; ihre Historie bleibt erhalten. Es gibt keinen Parent-POM und keinen gemeinsamen Code: Jeder Ordner wird für sich gebaut, getestet und ausgeliefert.
- **Konsequenzen:**
  - Eine Änderung über Services ist ein PR.
  - CI läuft je Ordner ([ADR-18](#adr-18-ci-je-ordner-mit-pfadfiltern-und-getrenntem-publish)).
  - Die Teile laufen mit verschiedenen Commits, deshalb zeigt die App jeden an (#71).
  - Modelle, die mehrere Services kennen, sind mehrfach vorhanden.
  - Die README-Dateien der Services sind teils veraltet; maßgeblich ist die `README.md` im Wurzelverzeichnis.

## ADR-02: Kleine Services je Datenbestand

- **Status:** übernommen; Zusammenlegung vorgeschlagen (#50 → #51 → #52)
- **Kontext:** Die Web-Anwendung entstand 2016 mit dem Spring-Cloud-Netflix-Stack (Eureka, Hystrix, Feign). #50 nennt das schon damals überdimensioniert. 2023 wurde der Netflix-Stack entfernt, die Aufteilung blieb.
- **Entscheidung:** Fünf fachliche Services, je einer mit eigenen Daten: Profile, Skill-Baum, Dokumente, View-Profile, Statistik. Dazu kommen die Edge und der Webclient.
- **Konsequenzen:**
  - Die Daten liegen in drei MariaDB-Datenbanken und Redis.
  - Verweise sind bloße Kürzel und IDs, Löschen ist nicht transaktional ([ADR-20](#adr-20-berater-löschen-über-services-ohne-verteilte-transaktion), [ADR-21](#adr-21-housekeeping-je-service)).
  - Für jedes Upgrade sind sieben Teile zu bewegen.
  - Vorgeschlagen ist, Profile, Skill und Report zusammenzulegen (#50), danach Java und Spring Boot zu aktualisieren (#51) und View-Profile von Redis nach MariaDB zu holen (#52).

## ADR-03: Aufrufe zwischen Services mit RestTemplate

- **Status:** gilt (seit 2023)
- **Kontext:** Feign-Clients und Hystrix gehörten zum entfernten Netflix-Stack.
- **Entscheidung:** Synchrone REST-Aufrufe mit `RestTemplate`. Die Basis-URLs kommen aus `pwr-<name>-service-url`; Standard sind die Compose-Namen, `localDev` setzt `localhost`. Es gibt weder Service Discovery noch Circuit Breaker.
- **Konsequenzen:**
  - Einfach und lokal ohne Infrastruktur lauffähig.
  - Ausfälle behandelt jeder Aufruf selbst: abbrechen, loggen oder melden ([Kapitel 8.4](08-querschnittliche-konzepte.md#84-kommunikation-zwischen-services)).
  - Timeouts sind nicht gesetzt.
  - Reste von Feign stehen noch in Kommentaren und Testkonfigurationen.

## ADR-04: Anmeldung und Rollen nur in der Edge, Identität über Header

- **Status:** gilt
- **Kontext:**
  - Die Anmeldung über MSAL gibt es seit 2023; seit #129 läuft sie automatisch.
  - Die Services hatten nie eine eigene Anmeldung.
  - Wer etwas angelegt oder exportiert hat, kam teils aus dem Request-Body. Ein Client konnte das fälschen (#203, #214).
  - Profilbilder waren ohne Token abrufbar (#67).
- **Entscheidung:**
  - Die Edge prüft das JWT und die Rolle je Pfad. Sie entfernt `X-Pwr-User-Login` und `X-Pwr-User-Initials` aus der Anfrage und setzt sie aus dem Token neu.
  - Die Services lesen den angemeldeten Benutzer nur aus diesen Headern, nie aus Body, Pfad oder Query.
  - Ein Service, der im Auftrag des Benutzers einen anderen ruft, gibt die Header weiter.
  - Binärdaten lädt der Webclient mit Token als Blob.
- **Konsequenzen:**
  - Ein Ort für die Sicherheitsregeln, getestet in `SecurityConfigTest` und `AccountHeadersFilterTest`.
  - Die Backend-Services dürfen nur über die Edge und das Container-Netz erreichbar sein.
  - Lokal ohne Edge fehlen die Header.

## ADR-05: Admin-Funktionen unter /admin jedes Service

- **Status:** gilt
- **Kontext:** Den Skill-Baum, die Vorlagen und die Berater konnte jeder `Power.User` ändern, weil die Edge nur einzelne Admin-Pfade sperrte (#178, #203, #218). Eine Regel je Methode und Pfad in der Edge wäre kürzer gewesen, hätte die Rechte aber auf einen zweiten Ort verteilt, den man beim nächsten Endpunkt vergisst (#178).
- **Entscheidung:** Alles nur für Admins liegt unter `/admin/**` des jeweiligen Service. Die Edge hat eine Regel je Service-Präfix (`/pwr-<service>/admin/**` → `Power.Admin`) und danach `/**` für beide Rollen.
- **Konsequenzen:**
  - Neue Admin-Funktionen sind ohne Änderung an der Edge geschützt.
  - Verschobene Endpunkte erfordern, dass alle Aufrufer im selben PR angepasst werden.
  - Aufrufe zwischen Services gehen an der Edge vorbei und erreichen `/admin` direkt, etwa die Statistik bei `GET /admin/consultants`.

## ADR-06: Commit statt Version

- **Status:** gilt (seit #77)
- **Kontext:** Die Versionsnummern aus den alten Repositories wurden nicht mehr erhöht. Merge ist Deployment, Releases gibt es nicht.
- **Entscheidung:**
  - Ein Stand ist Commit-Hash und Commit-Zeit. Die Versionen in `pom.xml` und `package.json` bedeuten nichts und werden nicht gepflegt, auch kein `SNAPSHOT` (#78).
  - Jeder Service zeigt `git.commit` unter `/actuator/info`, der Webclient in `build_info.json`. Die App zeigt alle zusammen (#71).
  - Images tragen `:main` und `:sha-<commit>`.
- **Konsequenzen:**
  - Jeder Stand ist eindeutig und ohne Pflegeaufwand.
  - Ein Zurück auf einen älteren Stand geht über das `sha`-Image; ein beschriebenes Verfahren fehlt noch.

## ADR-07: Betrieb mit Docker Compose auf einem Host und Watchtower

- **Status:** gilt
- **Kontext:** Die Last ist klein (eine Firma), und es gibt keinen eigenen Betrieb.
- **Entscheidung:**
  - Alle Container laufen mit Docker Compose auf einem Host; die Konfiguration liegt in `HBTGmbH/pwr-compose-deploy`.
  - Watchtower zieht alle 10 Minuten neue `:main`-Images und erzeugt die Container neu.
  - Ein nginx-Ingress terminiert TLS.
  - MariaDB wird täglich gesichert.
- **Konsequenzen:**
  - Einfach, und jeder Merge ist ohne Handgriff in etwa 10 Minuten live.
  - Es gibt keine Staging-Umgebung und kein Rolling Update. Beim Austausch ist ein Container kurz nicht erreichbar.
  - Der Host ist ein einzelner Ausfallpunkt ([Kapitel 11](11-risiken-und-technische-schulden.md)).

## ADR-08: Schema mit Hibernate ddl-auto: update, ohne Migrationswerkzeug

- **Status:** gilt (seit #27)
- **Kontext:** Die Produktion lief mit `ddl-auto: none`. #27 brauchte eine neue Tabelle für Skill-Aliase. Ein Migrationswerkzeug gab es nie.
- **Entscheidung:**
  - `ddl-auto: update` in der Produktion (`DB_HIBERNATE_DDL_AUTO`); Hibernate legt neue Tabellen und Spalten beim Start an.
  - Was Hibernate nicht kann (umbenennen, löschen, Typ ändern, Daten migrieren), kommt als SQL-Skript in den Ordner des Service. Das Skript steht im PR unter *Operations / Deployment Notes* und läuft vor dem Merge.
- **Konsequenzen:**
  - Neue Spalten kosten keinen Handgriff.
  - Es gibt keine Historie der Migrationen und keine automatische Rückabwicklung. Alte Spalten bleiben stehen.
  - Ein Skript läuft nur, wenn jemand es ausführt.

## ADR-09: Redis für View-Profile und Vorlagen-Metadaten

- **Status:** übernommen; Ablösung durch JPA vorgeschlagen (#52)
- **Kontext:** Der View-Profile Service war ein technisches Experiment: Aktionen als RPC, automatisches Speichern über einen Aspekt (#52).
- **Entscheidung:** View-Profile und die Metadaten der Vorlagen liegen als Hashes in Redis. Die Vorlagen-Dateien liegen im Report Service (MariaDB).
- **Konsequenzen:**
  - Änderungen am Modell müssen alte Daten lesbar halten ([Kapitel 8.2](08-querschnittliche-konzepte.md#82-persistenz)).
  - Metadaten und Datei einer Vorlage liegen in zwei Speichern; das Housekeeping prüft beide.
  - Redis ist nicht im täglichen Backup.

## ADR-10: Statistik mit eigener Kopie aller Berater

- **Status:** gilt
- **Kontext:** Statistik und Suche brauchen alle Profile auf einmal. Der Profile Service soll dafür nicht bei jeder Abfrage alle laden.
- **Entscheidung:**
  - Der Statistics Service lädt alle Berater mit Profil über `GET /admin/consultants`: beim Start, stündlich und nach jeder Massenänderung (`POST /admin/consultants/refresh` nach dem Commit, #205).
  - Skill-Namen werden beim Laden auf den Baum normalisiert (#208).
  - Scheitert das Laden, bleibt die alte Kopie (#218).
- **Konsequenzen:**
  - Schnelle Auswertungen.
  - Einzelne Änderungen an einem Profil sind bis zu einer Stunde nicht sichtbar.
  - Jede neue Massenänderung muss das Neuladen anstoßen, und der Webclient verwirft seine zwischengespeicherten Nutzungsangaben.

## ADR-11: BIRT für Dokumente, DOCX gespeichert, PDF-Vorschau live

- **Status:** gilt; Ablösung wird untersucht (#64)
- **Kontext:**
  - Die Dokumente kamen schon immer aus BIRT-Vorlagen.
  - Vorschauen waren gespeicherte Beispieldateien und zeigten nicht die eigenen Daten (#66).
  - BIRT kann sich bei manchen Daten endlos in Seitenumbrüchen verfangen (#65).
- **Entscheidung:**
  - Der Report Service rendert DOCX asynchron und speichert es in der Historie.
  - Die Vorschau nimmt denselben Datenweg, rendert aber PDF im Speicher und speichert nichts.
  - Das Rendern bricht nach 10 Sekunden ab (#155).
  - Admins laden Vorlagen im Report Manager hoch.
- **Konsequenzen:**
  - Die Vorschau zeigt die echten Daten. PDF und Word können sich im Detail unterscheiden.
  - BIRT 4.3.1 bringt alte Abhängigkeiten mit, und Vorlagen lassen sich nur mit dem BIRT Designer bearbeiten.
  - #64 untersucht Alternativen: HTML/CSS mit Chromium, OpenHTMLtoPDF, Typst.

## ADR-12: Lizenzierte Schrift nie im Repository oder Image

- **Status:** gilt
- **Kontext:** Die Vorlagen nutzen die Hausschrift Simplon Norm, die lizenziert ist (#81, #82).
- **Entscheidung:**
  - Die Schrift wird in der Produktion unter `/fonts` eingebunden (`export.font-directory`); ohne sie nimmt das Image Noto Sans, Gewicht für Gewicht.
  - Arial aus alten Vorlagen wird auf Simplon Norm abgebildet.
  - `.otf`-Dateien mit CFF-Konturen werden ganz eingebettet, weil iText 2.1.7 sie nicht in Teilmengen einbetten kann.
  - Ein PDF ohne `%%EOF` gilt als Fehler.
- **Konsequenzen:**
  - Lokal und in CI sieht das PDF anders aus als in der Produktion.
  - Die Lizenzfrage für Server und PDF-Einbettung ist in #82 noch offen.

## ADR-13: Skill-Namen: Aliase, Normalisierung auf den Baum, Groß-/Kleinschreibung

- **Status:** gilt
- **Kontext:** In den Profilen standen 1.309 verschiedene Skill-Namen. 606 davon waren Aliase eines Skills im Baum, 67 unterschieden sich nur in der Schreibweise (#208).
- **Entscheidung:**
  - **Aliase und Zusammenführen:** Skills haben global eindeutige Aliase, und Skills lassen sich zusammenführen (#27).
  - **Normalisierung:** Ein Name steht für den Skill im Baum, auch als Alias oder in anderer Schreibweise. Beim Speichern wird nur die Schreibweise übernommen, Aliase bleiben, wie getippt. Statistik und View-Profile zeigen den Namen des Baums.
  - **Vergleich:** Namen vergleicht Java ohne Groß-/Kleinschreibung, wie die Kollation der MariaDB (#207). Die Tests nutzen H2 mit `IGNORECASE=TRUE`.
- **Konsequenzen:**
  - Ein Skill wird überall gleich gezählt und angezeigt.
  - Akzente vergleicht nur die Datenbank so. H2 verhält sich auch sonst anders als MariaDB ([Kapitel 8.2](08-querschnittliche-konzepte.md#82-persistenz)).

## ADR-14: Skill-Suche mit Hibernate Search und Lucene

- **Status:** übernommen
- **Entscheidung:**
  - Hibernate Search 5 mit einem Lucene-Index im Dateisystem, der bei jedem Start neu aufgebaut wird.
  - Treffer in dieser Reihenfolge: genau, Wortanfang, unscharf (#32). Aliase und Übersetzungen sind durchsuchbar.
  - Die Tests nutzen einen Index im Speicher (#74).
- **Konsequenzen:**
  - Der Start dauert länger, dafür gibt es keinen eigenen Suchdienst.
  - Ein Ranking nach Beliebtheit ist offen (#33).

## ADR-15: Kurznamen der Berater zentral berechnet

- **Status:** gilt (#216)
- **Entscheidung:**
  - Der Profile Service berechnet den Kurznamen jedes Beraters: Vorname, sonst so viele Buchstaben des Nachnamens wie nötig, sonst der volle Name mit Kürzel.
  - Er liefert ihn allen Benutzern unter `GET /consultants/names`, mit nichts außer Kürzel, Kurz- und vollem Namen.
  - Im Dokument und in Bestätigungen steht der volle Name.
- **Konsequenzen:**
  - Überall dieselben Namen, ohne doppelte Logik im Webclient.
  - Die Liste ist für jeden angemeldeten Benutzer lesbar, bewusst mit minimalen Daten.

## ADR-16: LocalDate als String im Webclient

- **Status:** gilt (#26)
- **Kontext:** `new Date("YYYY-MM-DD")` ist Mitternacht UTC, `toISOString()` verschiebt lokale Mitternacht auf den Vortag. Datumsangaben sprangen zurück (#24).
- **Entscheidung:**
  - Jedes `LocalDate` bleibt in Modellen und Redux der String `"YYYY-MM-DD"`. Nur `PwrDatePicker` wandelt um.
  - Verworfen: `Temporal.PlainDate` und js-joda. JSON und Redux brauchen ohnehin Strings, und der Picker braucht `Date`.
- **Konsequenzen:**
  - Einfach und sortierbar.
  - Rechnet der Webclient einmal mit Datumsangaben, lohnt ein eigener Typ.

## ADR-17: Vorerst JDK 13 und Spring Boot 2.2

- **Status:** gilt; Upgrade vorgeschlagen (#51)
- **Kontext:** Lombok in den Spring-Boot-2.2-Services kompiliert ab JDK 16 nicht. Ein Upgrade aller Services ist groß.
- **Entscheidung:** JDK 13 bleibt festgelegt (`.java-version`, CI, Images). Das Upgrade kommt nach der Zusammenlegung (#50 → #51).
- **Konsequenzen:**
  - Der Build läuft stabil.
  - JDK, Spring Boot und Bibliotheken bekommen keine Sicherheitskorrekturen mehr ([Kapitel 11](11-risiken-und-technische-schulden.md)).

## ADR-18: CI je Ordner mit Pfadfiltern und getrenntem Publish

- **Status:** gilt (#6, #8)
- **Entscheidung:**
  - Ein Workflow je Ordner, mit demselben Pfadfilter für Push und PR.
  - `check` auf PRs: Lesetoken, Cache, Image ohne Push.
  - `publish` auf `main`: als einziger Job mit `packages: write`, ohne Cache.
  - Actions nach fester Regel gepinnt; actionlint und zizmor prüfen die Workflows.
  - Dependabot aktualisiert nur Actions.
- **Konsequenzen:**
  - Schnelle PRs, und kein Cache eines PR-Laufs gelangt in ein Image.
  - Pflicht-Checks sind nicht eingerichtet, weil gefilterte Workflows bei unberührten Ordnern keinen Status melden.
  - Maven- und npm-Abhängigkeiten werden nicht überwacht.

## ADR-19: Profil-Elemente als gemeinsame Einträge mit früheren Namen

- **Status:** gilt (#227–#230)
- **Kontext:** Firmen, Rollen, Sprachen, Qualifikationen usw. sind Einträge, die alle Profile teilen (`NameEntity`). Tippfehler und Dubletten sammelten sich.
- **Entscheidung:**
  - Admins können Elemente über alle Profile umbenennen, zusammenführen und löschen, ebenso nicht mehr benutzte löschen.
  - Der alte Name geht in `name_entity_former_name`. Wer ihn tippt, bekommt das Element, und *Aktualisieren* eines View-Profils findet es darüber.
- **Konsequenzen:**
  - Stammdaten lassen sich pflegen, ohne Profile oder View-Profile zu brechen.
  - Danach muss die Statistik neu geladen werden.

## ADR-20: Berater löschen über Services ohne verteilte Transaktion

- **Status:** gilt (#240, #243)
- **Kontext:** Ein gelöschter Berater hinterließ View-Profile, Dokumente und sein Bild; die Statistik zeigte ihn weiter.
- **Entscheidung:**
  - Nur inaktive Berater lassen sich löschen.
  - Erst die View-Profile (View-Profile Service) und die Dokumente (Report Service), dann in einer Transaktion alles im Profile Service, danach das Neuladen der Statistik.
  - Scheitert ein anderer Service, bleibt der Berater (`502`), und erneutes Löschen löscht den Rest.
- **Konsequenzen:**
  - Kein Zwei-Phasen-Commit nötig.
  - Teilzustände sind möglich, z. B. Dokumente weg, Berater noch da. Das Housekeeping findet sie.

## ADR-21: Housekeeping je Service

- **Status:** gilt (#242)
- **Kontext:** Datenleichen bleiben durch Altdaten, durch Collections in Hibernate und durch nicht transaktionales Löschen. Bisher sah sie niemand, bis eine Funktion daran scheiterte (#236, #243).
- **Entscheidung:**
  - Jeder Service meldet und bereinigt die Datenleichen seiner eigenen Daten (`/admin/housekeeping`). Andere Services fragt er nur nach Daten.
  - Kann er sie nicht fragen, meldet er einen Fehler statt Treffern.
  - Bereinigen wirkt nur auf das, was beim Ausführen noch zutrifft, und loggt es.
  - Regel: Neue Verweise über Service-Grenzen oder neue nicht transaktionale Löschvorgänge bringen eine Prüfung mit.
- **Konsequenzen:**
  - Die Verantwortung bleibt beim Besitzer der Daten.
  - Das Bereinigen ist ein bewusster Schritt eines Admins und geschieht nicht automatisch.

## ADR-22: Löschen in der Oberfläche absichern

- **Status:** gilt (#134, #181)
- **Entscheidung:**
  - Jedes Löschen fragt nach (`makeDeferrable` mit eigener Aktion).
  - Im Admin-Bereich wird der Name zweimal eingegeben, beim Berater das Kürzel. Nur das Leeren des Papierkorbs und das Bereinigen behalten die einfache Rückfrage.
- **Konsequenzen:** Versehentliches Löschen von Stammdaten über alle Profile wird unwahrscheinlich, kostet aber einen Schritt mehr.

## ADR-23: Webclient mit Laufzeitkonfiguration und gehashten Dateien

- **Status:** gilt (#9, #10, #109)
- **Entscheidung:**
  - **Ein Image für alle Umgebungen:** Die Service-URLs und die IDs der Anmeldung setzt `configure_api.sh` beim Start in `config.js` ein.
  - **Caching:** Statische Dateien tragen einen Hash im Namen und sind `immutable`, alles andere `no-cache`. Fehlt eine Datei, antwortet nginx mit 404 statt mit `index.html`.
  - **Icons:** Der Icon-Font wird selbst ausgeliefert (#109).
- **Konsequenzen:**
  - Nach einem Deployment holt jedes Neuladen den neuen Stand.
  - Ein offener Tab bleibt aber auf dem alten Stand, bis jemand neu lädt (#247).
