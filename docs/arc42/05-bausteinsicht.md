# 5. Bausteinsicht

## 5.1 Ebene 1: Gesamtsystem

```mermaid
flowchart LR
    W["pwr-webclient<br/>React-SPA in nginx"]
    E["pwr-edge-service<br/>Spring Cloud Gateway · 9000"]

    subgraph fach[Fachliche Services]
        direction TB
        P["pwr-profile-service<br/>Berater, Profile · 9004"]
        S["pwr-skill-service<br/>Skill-Baum, Suche · 9003"]
        V["pwr-view-profile-service<br/>View-Profile, Vorlagen · 9008"]
        R["pwr-report-service<br/>Dokumente (BIRT) · 9005"]
        ST["pwr-statistics-service<br/>Statistik · 9007"]
    end

    subgraph daten[Daten]
        direction TB
        DBP[("MariaDB profile")]
        DBS[("MariaDB skill<br/>+ Lucene-Index")]
        RV[("Redis<br/>View-Profile, Vorlagen")]
        DBR[("MariaDB report")]
        RS[("Redis<br/>Statistikkopie")]
    end

    W -->|"/api/pwr-&lt;service&gt;/**"| E
    E -->|"/pwr-&lt;service&gt;/** → Service"| fach
    P --- DBP
    S --- DBS
    V --- RV
    R --- DBR
    ST --- RS
```

Welcher Service welchen aufruft, zeigt [5.3](#53-abhängigkeiten-zwischen-den-services).

| Baustein | Verantwortung | Daten |
|---|---|---|
| **pwr-webclient** | Bedienoberfläche für Berater und Admins | nur im Browser (Redux) |
| **pwr-edge-service** | Einziger Eingang: Token prüfen, Rollen je Pfad, Identitäts-Header setzen, Routing | keine |
| **pwr-profile-service** | Berater, Profile mit Einträgen, Projekten und Skills, Profil-Elemente, Profilbilder, Profilprüfung; Admin-Operationen über alle Profile | MariaDB `profile` |
| **pwr-skill-service** | Skill-Baum (Kategorien, Skills, Aliase, Versionen, Übersetzungen) und Suche | MariaDB `skill`, Lucene-Index |
| **pwr-view-profile-service** | View-Profile (Momentaufnahmen für einen Export), Vorlagen-Metadaten; stößt Export und Vorschau an | Redis |
| **pwr-report-service** | Rendert Dokumente mit BIRT, speichert die Dokumente (Historie) und die Vorlagen-Dateien | MariaDB `report` |
| **pwr-statistics-service** | Eigene Kopie aller Berater und Profile; Statistik, Suche nach Beratern, wer was benutzt | Redis |

Jeder Ordner ist ein eigenständiges Maven- bzw. npm-Projekt ohne gemeinsamen Code. Modelle, die mehrere Services kennen (z. B. das Profil), hat jeder Service als eigene Klassen.

## 5.2 Ebene 2: Die Bausteine im Einzelnen

Die Services sind nach demselben Muster gebaut: Controller (REST) → Service (Fachlogik) → Repository (Spring Data), dazu `client` für Aufrufe anderer Services. Nur die Edge weicht ab.

### 5.2.1 pwr-edge-service

```mermaid
flowchart LR
    IN(["Anfrage<br/>/pwr-&lt;service&gt;/**"]) --> SEC
    subgraph Edge[pwr-edge-service · de.hbt.pwr]
        SEC["SecurityConfig<br/>JWT prüfen, Rolle je Pfad"]
        AH["AccountHeadersFilter<br/>X-Pwr-User-* entfernen und setzen"]
        RT["PwrRoutingConfig<br/>Route je Service, stripPrefix(1)"]
        CORS[CORS-Filter]
        SEC --> AH --> RT --> CORS
    end
    CORS --> OUT(["Service<br/>pwr.url.&lt;service&gt;"])
```

- `filters/SecurityConfig`:
  - `/pwr-<service>/admin/**` verlangt `Power.Admin`, alles andere `Power.User` oder `Power.Admin`.
  - Die Rollen kommen aus dem Claim `roles`, ohne Präfix.
- `filters/AccountHeadersFilter`:
  - Entfernt `X-Pwr-User-Login` und `X-Pwr-User-Initials`, falls ein Client sie mitschickt.
  - Setzt sie neu aus dem geprüften Token: Login aus `preferred_username`, `upn` oder `email`, Kürzel aus `mailnickname` (klein geschrieben).
- `PwrRoutingConfig` und `PwrEdgeConfig`: Routen `to-profile`, `to-skill`, `to-report`, `to-view-profile` und `to-statistics` mit Ziel aus `pwr.url.*`.
- Eigener Actuator unter `/pwr-edge-service/actuator`, nur `health` und `info`.

### 5.2.2 pwr-profile-service

```mermaid
flowchart TB
    subgraph Controller
        CE["ConsultantsEndpoint<br/>/consultants/{initials}, /consultants/names"]
        PE["ProfileEndpoint, ProfileEntryEndpoint<br/>/profiles, /profile/{initials}/…"]
        PC["ProfileCheckEndpoint<br/>/profile/{initials}/check"]
        SU["SuggestionEndpoint<br/>/suggestions/…"]
        PP["ProfilePictureController<br/>/profile-pictures"]
        AD["Admin: AdminEndpoint, ConsultantAdminEndpoint,<br/>NameEntityAdminEndpoint, ProfileCheckAdminEndpoint,<br/>HousekeepingAdminEndpoint · /admin/**"]
    end
    subgraph Services
        CS[ConsultantService<br/>ConsultantShortNames]
        PES[ProfileEntryService]
        PS[ProfileService<br/>Skills über alle Profile]
        NE[NameEntityAdminService]
        CK[ProfileCheckService]
        HK[HousekeepingService]
    end
    subgraph Clients
        SPC[SkillProfileClient]
        VPC[ViewProfileClient]
        RC[ReportClient]
        STC[StatisticsClient]
    end
    DB[(MariaDB profile)]

    CE --> CS
    PE --> PES
    PC --> CK
    AD --> CS & PS & NE & HK
    PES --> SPC
    PS --> SPC
    CK --> SPC
    CS --> VPC & RC & STC
    PS --> STC
    NE --> STC
    Services --> DB
```

Wichtige Schnittstellen (nach außen über `/pwr-profile-service`):

| Bereich | Endpunkte |
|---|---|
| Eigenes Profil | `GET /consultants/{initials}`, `GET/PUT/DELETE /profile/{initials}/<typ>/{id}` für `language`, `qualification`, `sector`, `specialfield`, `career`, `training`, `education`, `skill`, `project`; `GET/PUT /profile/{initials}/baseProfile` |
| Für alle Benutzer | `GET /consultants/names` (Kürzel, Kurz- und voller Name, #216), `GET /suggestions/*`, `GET /profile-pictures/{id}` |
| Profilprüfung | `GET /profile/{initials}/check`, `POST …/check/confirmation` (wer bestätigt, aus den Headern) |
| Admin | `/admin/consultants` (auch die Quelle der Statistik), `/admin/skills/merge|rename`, `DELETE /admin/skills?name=`, `/admin/name-entities/**`, `/admin/profile-checks`, `/admin/housekeeping` |

Datenmodell (vereinfacht):

```mermaid
erDiagram
    Consultant ||--|| Profile : hat
    Consultant }o..o| ProfilePicture : "profilePictureId (ohne FK)"
    Profile ||--o{ ProfileEntry : "Einträge je Typ"
    Profile ||--o{ Project : projects
    Profile ||--o{ Skill : skills
    Project }o--o{ Skill : "project_skills (Skills des Profils)"
    Project }o--o| NameEntity : "client, broker"
    Project }o--o{ NameEntity : projectRoles
    ProfileEntry }o--|| NameEntity : nameEntity
    NameEntity ||--o{ NameEntityFormerName : "frühere Namen"
    Profile ||--o{ ProfileConfirmation : "bestätigt (profileId)"

    Consultant {
        string initials UK
        string firstName
        string lastName
        string title
        boolean active
        date birthDate
    }
    ProfileEntry {
        long id
        string typ "JOINED: LanguageSkill, QualificationEntry, TrainingEntry, EducationEntry, SectorEntry, CareerEntry, SpecialFieldEntry"
    }
    NameEntity {
        string name
        enum type "EDUCATION, LANGUAGE, QUALIFICATION, SECTOR, TRAINING, CAREER, SPECIAL_FIELD, COMPANY, PROJECT_ROLE"
    }
    Skill {
        string name
        int rating
        set versions
    }
```

Besonderheiten (Details in [`AGENTS.md`](../../AGENTS.md)):
- `ProfileEntry` ist mit `JOINED` vererbt. Altdaten enthalten Zeilen in `profile_entry` ohne Zeile eines Eintragstyps (#236), deshalb werden Einträge je Typ geladen.
- Die Skills eines Projekts sind dieselben Zeilen wie die Skills des Profils (`ProfileEntryService.handleProjectSkill`).
- Ein aus einer Collection entferntes Element bleibt als Zeile mit `profile_id` NULL stehen. Projekte löscht `deleteProject` seit #243 wirklich.
- Profil-Elemente (`NameEntity`) sind gemeinsame Einträge aller Profile. Umbenannte und zusammengeführte Elemente behalten ihre früheren Namen (#227, #230); Admins legen weitere als Aliase an (#270) und machen einen Alias zum Namen, der alte Name wird dann Alias (#331, wie bei Skills im Skill-Baum). Alle Benutzer lesen sie über `GET /suggestions/aliases` für die Vorschläge.

### 5.2.3 pwr-skill-service

```mermaid
flowchart LR
    subgraph Controller
        SC["SkillController /skill<br/>byName, search, suggestions, tree, locales"]
        CC["CategoryController /category"]
        SA["SkillAdminController /admin/skill<br/>Alias, Merge, Rename, Move, Version, Locale, Index"]
        CA["CategoryAdminController /admin/category"]
        HA["HousekeepingAdminController<br/>/admin/housekeeping/unused"]
    end
    HK["HousekeepingService<br/>eigene Skills ohne Nutzer"]
    UC["SkillUsageClient<br/>GET /admin/skills/usage (Profile)"]
    SS[SkillService]
    CS["CategoryService<br/>getOther()"]
    SRCH["SkillSearcherService<br/>Hibernate Search"]
    TM[SkillTreeMappingService]
    INIT["SearchIndexInitializer<br/>beim Start"]
    DB[(MariaDB skill)]
    IDX[(Lucene-Index)]

    SC --> SS & SRCH & TM
    CC --> CS
    SA --> SS & SRCH
    CA --> CS
    SS & CS --> DB
    SRCH --> IDX
    INIT --> SRCH
    HA --> HK --> UC
    HK --> DB
```

```mermaid
erDiagram
    SkillCategory ||--o{ SkillCategory : "Unterkategorien"
    SkillCategory ||--o{ Skill : enthält
    SkillCategory }o--o{ LocalizedQualifier : Übersetzungen
    Skill }o--o{ LocalizedQualifier : Übersetzungen
    Skill ||--o{ SkillAlias : "Aliase (global eindeutig)"
    SkillCategory {
        string qualifier
        boolean custom
        boolean display
    }
    Skill {
        string qualifier
        boolean custom
        set versions
    }
    LocalizedQualifier {
        string locale "ISO 639-2"
        string qualifier
    }
    SkillAlias {
        string alias UK
    }
```

- Ein unbekannter Skill, den ein Berater einträgt, kommt in die Kategorie „Other“ (`POST /skill?qualifier=`). Admins sortieren ihn dort ein.
- Der Index wird bei jedem Start neu aufgebaut (`SearchIndexInitializer`) und lässt sich mit `POST /admin/skill/lucene/index` neu erstellen.
- Der Service ruft keinen anderen Service auf.

### 5.2.4 pwr-view-profile-service

```mermaid
flowchart TB
    subgraph Controller
        VC["ViewProfileController /view<br/>anlegen, aktualisieren, löschen, Export, Vorschau"]
        VO["ViewProfileOperationsController<br/>/{initials}/view/{id}/…: zeigen, sortieren, gruppieren"]
        TC["ReportTemplateController /template"]
        TA["ReportTemplateAdminController /admin/template"]
        HA["HousekeepingAdminController /admin/housekeeping"]
    end
    subgraph Services
        CR[ViewProfileCreatorService]
        OP["ViewProfileOperationService<br/>ViewProfileSortService"]
        MG["ViewProfileMergeService<br/>FormerNames, SkillTreeLookup"]
        LO[ViewProfileLocalizationService]
        TS[ReportTemplateService]
        HK[HousekeepingService]
    end
    AS["Aspekte<br/>@ViewProfileAutoSave, ViewProfileRestoreAspect"]
    subgraph Clients
        PSC[ProfileServiceClient]
        SSC[SkillServiceClient]
        RSC["ReportServiceClient<br/>gibt X-Pwr-User-* weiter"]
        FUC[FileUploadClient]
    end
    RD[(Redis)]

    VC --> CR & MG & RSC
    VO --> OP & LO
    TC --> TS
    TA --> TS & FUC
    HA --> HK
    CR --> PSC & SSC
    MG --> PSC & SSC
    OP -.-> AS
    AS --> RD
    TS & HK --> RD
    HK --> PSC & FUC
```

- **`ViewProfile`** (`@RedisHash("viewProfile")`):
  - Kopie der Profileinträge mit Sichtbarkeit und Reihenfolge.
  - Anzeigekategorien mit Skills und Versionen.
  - Besitzer und Name, Sprache der Übersetzung (`localization`).
- **`ReportTemplate`** (`@RedisHash("reportTemplate")`): Name, Beschreibung und `fileId`. Die Datei liegt im Report Service.
- **Speichern und Lesen:** Jede Änderung speichert über den Aspekt `@ViewProfileAutoSave`. Beim Lesen repariert `ViewProfileRestoreAspect` ältere Daten, z. B. Standardwerte neuer Felder (#151).
- ***Aktualisieren*:** Übernimmt Änderungen des Profils in ein View-Profil und behält dessen Einstellungen. Umbenannte Elemente findet es über die früheren Namen und den Skill-Baum (#230).

### 5.2.5 pwr-report-service

```mermaid
flowchart LR
    subgraph Controller
        RC["ReportController /report<br/>Historie, Datei, Export, Vorschau"]
        FU["FileUploadController /admin/file"]
        RA["ReportAdminController /admin/report/{initials}"]
        HA["HousekeepingAdminController"]
    end
    PRS["ProfileReportService<br/>@Async DOCX, PDF im Speicher"]
    MC["ModelConvertService<br/>View-Profil → Exportmodell (JAXB)"]
    BIRT["BIRT-Engine<br/>DocBirtExportHandler, PdfBirtExportHandler,<br/>BirtRendering (Zeitlimit), PdfFonts"]
    FS[DBFileStorageService]
    CN["ConsultantNameClient<br/>ProfilePictureClient"]
    TF[TemplateFileClient]
    DB[(MariaDB report)]
    FONT[["/fonts<br/>Hausschrift (Volume)"]]

    RC --> PRS --> MC --> BIRT
    PRS --> FS
    PRS --> CN
    FU --> FS
    RA --> DB
    HA --> TF & CN
    FS --> DB
    PRS --> DB
    BIRT --> FONT
```

- **Ablauf beim Rendern:** Das View-Profil wird ins alte Exportmodell (`Profil`, `Projekt`, `Werdegang` …) übersetzt und als XML-Datei geschrieben. Die BIRT-Vorlage liest diese Datei über ihre XML-Datenquelle.
- **`ReportData`** (Tabelle `report_data`):
  - das fertige Dokument, Status `RUNNING`, `DONE` oder `ERROR`;
  - wer exportiert hat (aus den Headern, #214), welche Vorlage verwendet wurde und die Beschreibung des View-Profils.
- **`DBFile`** (Tabelle `designfiles`): die BIRT-Designs. Auf sie verweist die `fileId` einer Vorlage im View-Profile Service.
- **Schrift:** Die Hausschrift kommt aus `/fonts` (`export.font-directory`); ohne sie nimmt BIRT Noto Sans aus dem Image (`PdfFonts`).

### 5.2.6 pwr-statistics-service

```mermaid
flowchart LR
    PSC["ProfileStatisticsController /statistics<br/>Nutzung, Ebenen, Netzwerk, Suche, wer benutzt was"]
    SAC["StatisticsAdminController<br/>POST /admin/consultants/refresh"]
    AIS["AsyncInformationService<br/>@Scheduled stündlich + beim Start"]
    SS[StatisticsService]
    NORM["SkillNameNormalizer<br/>Namen des Skill-Baums"]
    KM["ProfileKMedoidClusterer<br/>SimRank"]
    PPC["PowerProfileClient<br/>GET /admin/consultants"]
    STC["SkillTreeClient<br/>GET /skill/tree"]
    RD[(Redis)]

    SAC --> AIS
    AIS --> PPC
    AIS --> NORM --> STC
    AIS --> KM
    AIS --> RD
    PSC --> SS --> RD
```

- Die Kopie (`@RedisHash("Consultant")` mit eingebettetem Profil) wird bei jedem Laden ganz ersetzt. Scheitert das Laden, bleibt die alte (#218).
- Alles, was der Service beantwortet, kommt aus dieser Kopie, auch „wer benutzt diesen Skill / dieses Profil-Element“ in der Admin-Oberfläche.
- Das Clustering (K-Medoid mit SimRank als Ähnlichkeit) läuft stündlich direkt nach dem Laden, synchron im Scheduler-Thread. SimRank rechnet auf indizierten Matrizen (`double[][]`, #292): bei rund 60 Profilen und 1000 Skills etwa 16 MB in einer Zehntelsekunde. Die frühere Variante mit einem Objekt je Paar legte dafür 4,5 GB in 43 s an und ließ den Heap dauerhaft auf über 1 GiB wachsen.

### 5.2.7 pwr-webclient

```mermaid
flowchart TB
    subgraph UI[modules]
        HOME["home: Profil, Projekte, Skills,<br/>View-Profile, Dokumente, Statistik"]
        ADM["admin: Berater, Report Manager,<br/>Skill-Baum, Profil-Elemente, Housekeeping"]
        GEN["general: Pwr*-Komponenten"]
    end
    subgraph State[reducers · Redux]
        RED["profileStore, adminReducer, statisticsReducer,<br/>skillReducer, viewProfileSlice, templateSlice,<br/>reportStore, consultantNames, navigationSlice,<br/>crossCutting, deferred …"]
        MW["Middleware: deferredActionMiddleware,<br/>asyncActionUnWrapper, thunk"]
    end
    subgraph Clients[clients]
        HTTP["PowerHttpClient<br/>Token, Anfragezähler, Fehlermeldungen"]
        CL["ProfileServiceClient, SkillServiceClient,<br/>ViewProfileServiceClient, TemplateClient,<br/>ReportServiceClient, StatisticsServiceClient, AppInfoClient"]
    end
    AUTH["OIDCService, MSALInstance<br/>Anmeldung, Rollen, Kürzel"]

    HOME & ADM --> GEN
    HOME & ADM --> RED
    RED --> MW --> CL --> HTTP
    HTTP --> AUTH
```

| Bereich | Pfade (`src/Paths.ts`) |
|---|---|
| Einstieg | `/` (Anmeldung, nur nach dem Abmelden), `/start` (Admins → Beraterverwaltung, sonst eigenes Profil; `/profilauswahl` leitet dorthin) |
| Profil eines Beraters | `/app/:initials/home`, `…/profile`, `…/profile/projects/:projectId`, `…/profile/skills`, `…/views`, `…/view/:id`, `…/reports`, `…/search`, `…/statistics/*` |
| Admin | `/admin/home/consultants`, `…/templates`, `…/statistics/skills`, `…/info/skilltree`, `…/info/names`, `…/info/skills`, `…/housekeeping` |

- **Laufzeitkonfiguration:** `config.js` mit Platzhaltern, die `configure_api.sh` beim Start des nginx-Containers ersetzt.
- **Lokal:** `start:local` leitet über `src/setupProxy.js` direkt auf die Ports der Services und überspringt die Anmeldung.

## 5.3 Abhängigkeiten zwischen den Services

```mermaid
flowchart LR
    P[profile]
    S[skill]
    V[view-profile]
    R[report]
    ST[statistics]

    P -->|"neue Skills, Baum,<br/>umbenennen, löschen"| S
    P -->|"Berater löschen"| V
    P -->|"Berater löschen"| R
    P -->|"neu laden"| ST
    V -->|"Profil, Namen,<br/>frühere Namen"| P
    V -->|"Baum, Übersetzungen"| S
    V -->|"Export, Vorschau,<br/>Vorlagen-Dateien"| R
    R -->|"Name, Bild,<br/>Kürzel"| P
    R -->|"Vorlagen-Dateien"| V
    ST -->|"alle Berater"| P
    ST -->|"Baum"| S
```

| Aufrufer | Ziel | Endpunkte | Wozu |
|---|---|---|---|
| profile | skill | `POST /skill?qualifier=`, `GET /skill/tree`, `GET /skill/byName`, `/admin/skill/merge|rename`, `DELETE /admin/skill/{id}` | neue Skills nach „Other“, Namen des Baums, Profilprüfung, Skills umbenennen, zusammenführen, löschen |
| profile | view-profile | `GET /view/{initials}`, `DELETE /view/{initials}/{id}` | Berater löschen |
| profile | report | `DELETE /admin/report/{initials}` | Berater löschen |
| profile | statistics | `POST /admin/consultants/refresh` | Kopie nach Massenänderungen neu laden |
| view-profile | profile | `GET /profiles/{initials}`, `GET /consultants/{initials}`, `GET /admin/name-entities/former-names`, `GET /admin/name-entities/localizations?language=`, `GET /consultants/names` | Momentaufnahme, *Aktualisieren*, Übersetzungen der Profil-Elemente (#291), Housekeeping |
| view-profile | skill | `GET /skill/byName` | Kategorien, Namen und Übersetzungen des Baums |
| view-profile | report | `POST /report?type=`, `POST /report/preview`, `/admin/file` | Export, Vorschau, Vorlagen-Dateien; `POST /report` und `/report/preview` nur von hier, nicht über die Edge (#262) |
| report | profile | `GET /consultants/{initials}`, `GET /consultants/names`, `GET /profile-pictures/by-initials/{initials}` | Name des Exportierenden, Housekeeping, Profilbild im Dokument |
| report | view-profile | `GET /admin/template/files` | Housekeeping |
| statistics | profile | `GET /admin/consultants` | Kopie aller Berater |
| statistics | skill | `GET /skill/tree` | Namen normalisieren |
| skill | profile | `GET /admin/skills/usage` | Housekeeping: eigene Skills ohne Nutzer (#288) |

Diese Aufrufe gehen direkt im Container-Netz, nicht über die Edge. Deshalb erreichen sie auch die `/admin`-Pfade ohne Token.
