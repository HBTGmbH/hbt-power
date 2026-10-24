# 6. Laufzeitsicht

Die Diagramme zeigen die wichtigen Abläufe über die Services. Pfade sind so angegeben, wie der Service sie sieht. Von außen haben sie noch `/api/pwr-<service>` davor; der Ingress entfernt `/api`, die Edge `/pwr-<service>`.

## 6.1 Anmeldung und ein Aufruf

```mermaid
sequenceDiagram
    autonumber
    actor U as Benutzer
    participant W as Webclient
    participant ID as Entra ID
    participant I as Ingress
    participant E as Edge
    participant P as Profile Service

    U->>W: öffnet Power
    W->>ID: loginRedirect (OIDC, MSAL)
    ID-->>W: ID-Token (roles, mailnickname), Access-Token
    W->>W: Kürzel aus mailnickname, Rollen aus roles
    W->>I: GET /api/pwr-profile-service/consultants/{kürzel}<br/>Authorization: Bearer …
    I->>E: GET /pwr-profile-service/consultants/{kürzel}
    E->>E: JWT prüfen, Rolle je Pfad (Power.User / Power.Admin)
    E->>E: X-Pwr-User-* entfernen, aus dem Token neu setzen
    E->>P: GET /consultants/{kürzel}<br/>X-Pwr-User-Login, X-Pwr-User-Initials
    P-->>W: Berater mit Profil
```

- Danach führt die Startseite (`/start`, #263) Admins in die Beraterverwaltung und alle anderen gleich ins eigene Profil (#135). Ohne eigenes Profil oder Kürzel zeigt sie eine Meldung.
- Läuft das Token ab, erneuert MSAL es still (`acquireTokenSilent`). Scheitert das, meldet der Webclient einmal automatisch neu an (#129).
- Profilbilder und Vorschauen lädt der Webclient mit Token als Blob und zeigt sie über eine Blob-URL. Ein `src` oder `iframe` direkt auf die API scheitert an der Edge, weil es kein Token mitschickt (#65, #67).

## 6.2 Einen Skill ins Profil eintragen

```mermaid
sequenceDiagram
    autonumber
    participant W as Webclient
    participant P as Profile Service
    participant S as Skill Service

    W->>P: PUT /profile/{kürzel}/skill { name: ".net", rating: 4 }
    P->>S: GET /skill/byName?qualifier=.net
    S-->>P: Skill ".NET" (Name oder Alias, ohne Groß-/Kleinschreibung)
    P->>P: Schreibweise des Baums übernehmen (".NET") – Aliase bleiben, wie getippt
    P->>S: POST /skill?qualifier=.NET
    S-->>P: Kategorie (ein unbekannter Skill kommt nach „Other“)
    P->>P: Skill speichern
    P-->>W: Skill
```

Ein Skill in einem Projekt ist derselbe Datensatz wie der Skill im Profil. Fehlt er im Profil, legt `ProfileEntryService.handleProjectSkill` ihn dort an.

## 6.3 View-Profil anlegen

```mermaid
sequenceDiagram
    autonumber
    participant W as Webclient
    participant V as View-Profile Service
    participant P as Profile Service
    participant S as Skill Service
    participant R as Redis

    W->>V: POST /view/{kürzel} { Name, Beschreibung, Sprache }
    V->>P: GET /profiles/{kürzel}
    V->>P: GET /consultants/{kürzel}
    loop je Skill (einmal je Name)
        V->>S: GET /skill/byName?qualifier=…
        S-->>V: Kategorie, Name des Baums, Übersetzungen
    end
    V->>V: Momentaufnahme bauen: Einträge, Projekte,<br/>Anzeigekategorien, Sichtbarkeit
    V->>R: speichern (@RedisHash viewProfile)
    V-->>W: View-Profil
    Note over W,V: Jede weitere Änderung (zeigen, sortieren, verschieben)<br/>ist ein PATCH – @ViewProfileAutoSave speichert danach.
```

*Aktualisieren* (`POST /view/update/{kürzel}/{alteId}`) baut eine neue Momentaufnahme aus dem aktuellen Profil. Die Einstellungen der alten übernimmt es; umbenannte Elemente findet es über `GET /admin/name-entities/former-names` und den Skill-Baum (#230).

## 6.4 Dokument exportieren (DOCX)

```mermaid
sequenceDiagram
    autonumber
    participant W as Webclient
    participant E as Edge
    participant V as View-Profile Service
    participant R as Report Service
    participant P as Profile Service

    W->>E: POST …/view/{id}/{vorlage}/report
    E->>V: + X-Pwr-User-Login, X-Pwr-User-Initials
    V->>V: View-Profil und Vorlage laden, Besitzer prüfen
    V->>R: POST /report?type=DOC (ReportInfo)<br/>gibt die X-Pwr-User-* weiter
    R->>P: GET /consultants/{exportiert von} (Name)
    R->>R: ReportData anlegen: RUNNING
    R-->>V: 201 Location
    V-->>W: 201
    par asynchron (@Async)
        R->>R: View-Profil → Exportmodell → XML
        R->>P: GET /profile-pictures/by-initials/{kürzel}
        R->>R: BIRT rendert DOCX mit der Vorlage aus designfiles
        R->>R: ReportData: DONE (oder ERROR)
    and Webclient fragt nach
        loop bis DONE oder ERROR
            W->>R: GET /report/{kürzel} (still)
        end
    end
    W->>R: GET /report/file/{id}
    R-->>W: DOCX
```

Die **Vorschau** nimmt denselben Weg: `GET …/view/{id}/{vorlage}/preview` → `POST /report/preview`. BIRT rendert dabei PDF im Speicher und speichert nichts. Nach 10 Sekunden bricht das Rendern ab (#155). Kann die Vorlage mit diesen Daten nicht rendern, kommt `422` mit dem Grund als Text.

## 6.5 Statistik aktuell halten

```mermaid
sequenceDiagram
    autonumber
    participant ST as Statistics Service
    participant P as Profile Service
    participant S as Skill Service
    participant RS as Redis

    Note over ST: beim Start und dann stündlich (@Scheduled)
    ST->>P: GET /admin/consultants (alle Berater mit Profil)
    ST->>S: GET /skill/tree
    ST->>ST: Skill-Namen auf den Baum normalisieren
    ST->>RS: alte Kopie löschen, neue speichern
    ST->>ST: Clustering (K-Medoid, SimRank) → ClusteredNetwork

    Note over P: nach einer Massenänderung<br/>(Skills zusammenführen, umbenennen, löschen,<br/>Profil-Elemente, Berater löschen)
    P->>P: Transaktion committet
    P->>ST: POST /admin/consultants/refresh (afterCommit)
    ST->>P: GET /admin/consultants
```

Scheitert das Laden, bleibt die alte Kopie. Ist der Skill Service nicht erreichbar, nimmt der Statistics Service den zuletzt bekannten Baum (#208, #218). Ein Fehler beim Anstoßen nach dem Commit wird nur geloggt; der nächste stündliche Lauf holt das nach.

## 6.6 Einen Skill in allen Profilen umbenennen (Admin)

```mermaid
sequenceDiagram
    autonumber
    participant W as Webclient (Admin)
    participant P as Profile Service
    participant S as Skill Service
    participant ST as Statistics Service

    W->>P: POST /admin/skills/rename?name=JS&newName=JavaScript
    P->>S: POST /admin/skill/rename (der alte Name wird Alias)
    S-->>P: ok
    P->>P: in einer Transaktion: Skills in Profilen und Projekten umbenennen<br/>(gleichnamige im selben Profil werden einer, höhere Bewertung)
    P-->>W: ok
    P->>ST: POST /admin/consultants/refresh (nach dem Commit)
    W->>W: Nutzungsangaben im Cache verwerfen
```

Zusammenführen (#205) und Löschen (#229) gehen genauso: erst der Skill-Baum, dann die Profile, danach die Statistik.

## 6.7 Berater löschen (Admin)

```mermaid
sequenceDiagram
    autonumber
    participant W as Webclient (Admin)
    participant P as Profile Service
    participant V as View-Profile Service
    participant R as Report Service
    participant ST as Statistics Service

    W->>W: Kürzel zweimal eingeben (#181)
    W->>P: DELETE /admin/consultants/{kürzel}
    P->>P: nur inaktive Berater (sonst 423)
    P->>V: GET /view/{kürzel}
    loop je View-Profil
        P->>V: DELETE /view/{kürzel}/{id}
    end
    P->>R: DELETE /admin/report/{kürzel}
    alt ein Service antwortet nicht
        P-->>W: 502, der Berater bleibt (erneut löschen löscht den Rest)
    else alles gelöscht
        P->>P: eine Transaktion: Projekte samt Verknüpfungen,<br/>Skills, Profil, Profilbild, Berater (#240, #243)
        P-->>W: 200
        P->>ST: POST /admin/consultants/refresh (nach dem Commit)
    end
```

Die Reihenfolge geht von außen nach innen. Ein Abbruch lässt den Berater stehen, und das Löschen lässt sich wiederholen. Was trotzdem übrig bleibt, findet das Housekeeping ([6.8](#68-housekeeping-admin)). Dokumente, die der Berater für andere exportiert hat, bleiben, ebenso die Profil-Elemente und Skills des Baums.

## 6.8 Housekeeping (Admin)

```mermaid
sequenceDiagram
    autonumber
    participant W as Webclient (Housekeeping)
    participant P as Profile Service
    participant R as Report Service
    participant V as View-Profile Service
    participant S as Skill Service

    par jeder Service prüft seine eigenen Daten
        W->>P: GET /admin/housekeeping
        P-->>W: Profileinträge ohne Typ, ohne Profil, Projekte, Skills,<br/>Profilbilder
    and
        W->>R: GET /admin/housekeeping
        R->>P: GET /consultants/names
        R->>V: GET /admin/template/files
        R-->>W: Dokumente ohne Berater, hängende Dokumente,<br/>Dateien ohne Vorlage
    and
        W->>V: GET /admin/housekeeping
        V->>P: GET /consultants/names
        V->>R: GET /admin/file
        V-->>W: View-Profile ohne Berater, Vorlagen ohne Datei
    and Rubrik „Unbenutzt“ (#288)
        W->>P: GET /admin/housekeeping/unused
        P-->>W: Profil-Elemente ohne Nutzer je Typ
    and
        W->>S: GET /admin/housekeeping/unused
        S->>P: GET /admin/skills/usage
        S-->>W: eigene Skills ohne Nutzer
    and Rubrik „Alt“ (#289)
        W->>R: GET /admin/housekeeping/old
        R-->>W: alte Exportdokumente mit Speicherplatz
    and
        W->>V: GET /admin/housekeeping/old
        V-->>W: alte View-Profile
    end
    W->>W: Bereinigen? (Rückfrage mit Anzahl)
    W->>R: DELETE /admin/housekeeping/reports-without-consultant
    R->>P: GET /consultants/names (erneut)
    R->>R: löscht, was jetzt noch zutrifft – loggt Anzahl und IDs
    R-->>W: Anzahl
```

Antwortet ein benötigter Service nicht oder liefert er keinen einzigen Berater, meldet die Prüfung einen Fehler statt Treffern, und sie lässt sich nicht bereinigen (`503`). Eine leere Liste darf nie alle Daten zu Datenleichen machen.
