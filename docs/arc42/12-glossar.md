# 12. Glossar

| Begriff | Bedeutung |
|---|---|
| **Admin** | Benutzer mit der App-Rolle `Power.Admin`. Sieht alle Berater und pflegt Stammdaten. |
| **Admin-Bereich** | Der Teil des Webclients unter `/admin/home/…`, und die Pfade `/admin/**` der Services, die nur Admins erreichen |
| **Aktualisieren** | Übernimmt die Änderungen des Profils in ein bestehendes View-Profil und behält dessen Einstellungen (`ViewProfileMergeService`) |
| **Alias** | Weiterer Name eines Skills im Skill-Baum (z. B. `JS` für `JavaScript`). Global eindeutig ohne Groß-/Kleinschreibung. |
| **Anzeigekategorie** | Kategorie des Skill-Baums, unter der ein View-Profil Skills gruppiert (`display` in `SkillCategory`) |
| **Berater** (`Consultant`) | Mitarbeiterin oder Mitarbeiter der HBT mit Profil, identifiziert durch das Kürzel |
| **BIRT** | Eclipse Business Intelligence and Reporting Tools; rendert die Dokumente aus Vorlagen (`.rptdesign`) |
| **Bereinigen** | Löscht im Housekeeping, was eine Prüfung gerade findet |
| **Datenleiche** | Datensatz, auf den nichts mehr zeigt oder der auf etwas Gelöschtes zeigt (z. B. ein Dokument zu einem gelöschten Berater). Unbenutzte Profil-Elemente oder eigene Skills sind keine Datenleichen, sondern gültige Einträge; das Housekeeping führt sie in der eigenen Rubrik *Unbenutzt* (#288). |
| **DBFile** | Gespeicherte Vorlagen-Datei im Report Service (Tabelle `designfiles`) |
| **Dokument** (`ReportData`) | Exportiertes Word-Dokument in der Historie des Report Service, mit Status `RUNNING`, `DONE` oder `ERROR` |
| **Edge** | `pwr-edge-service`, der einzige Eingang zu den Services: Tokenprüfung, Rollen, Identitäts-Header, Routing |
| **Eintragstyp** | Art eines Profileintrags: Sprache, Qualifikation, Weiterbildung, Ausbildung, Branche, Werdegang, Schwerpunkt |
| **Entra ID** | Microsoft Entra ID (früher Azure AD), der Identitätsanbieter für die Anmeldung und die App-Rollen |
| **Export** | Erzeugen eines Word-Dokuments aus einem View-Profil mit einer Vorlage |
| **Früherer Name** (`NameEntityFormerName`) | Alter Name eines umbenannten oder zusammengeführten Profil-Elements, oder ein Alias, den ein Admin angelegt hat (#270). Wer ihn tippt, bekommt das Element. Innerhalb des Typs eindeutig. |
| **Hausschrift** | Simplon Norm, lizenziert; in der Produktion als Volume eingebunden |
| **Housekeeping** | Admin-Seite und Endpunkte `/admin/housekeeping` je Service, die das System sauber halten: Rubrik *Datenleichen* melden und bereinigen (#242), Rubrik *Unbenutzt* für gültige Einträge, die niemand mehr nutzt (#288), Rubrik *Alt* für alte Exportdokumente und View-Profile (#289) |
| **Identitäts-Header** | `X-Pwr-User-Login`, `X-Pwr-User-Initials` und `X-Pwr-User-Admin`; die Edge setzt sie aus dem geprüften Token |
| **Ingress** | Der nginx vor allen Containern in der Produktion: TLS, `/` zum Webclient, `/api/` zur Edge |
| **Kurzname** | Name eines Kollegen in der App, z. B. `Kai B.` (`ConsultantShortNames`, #216) |
| **Kürzel** (`initials`) | Eindeutige Kennung eines Beraters, gleich dem Claim `mailnickname` seines Kontos, klein geschrieben |
| **Lokalisierung** (`LocalizedQualifier`, `NameEntityLocalization`) | Übersetzung eines Skills, einer Kategorie (#174) oder eines Profil-Elements (#291) in eine Sprache (ISO 639-2); erscheint in View-Profilen dieser Sprache und ihren Dokumenten |
| **Massenänderung** | Änderung vieler Profile auf einmal: Skills zusammenführen, umbenennen oder löschen, ebenso Profil-Elemente, oder einen Berater löschen. Danach wird die Statistik neu geladen. |
| **Other** | Kategorie des Skill-Baums, in die unbekannte Skills kommen, bis ein Admin sie einsortiert |
| **Power.User / Power.Admin** | App-Rollen in Entra ID für Berater bzw. Admins |
| **Profil** | Alle Angaben eines Beraters: Einträge, Projekte, Skills, Beschreibung |
| **Profil-Element** (`NameEntity`) | Gemeinsamer Eintrag, den mehrere Profile benutzen: Firma, Projektrolle, Sprache, Qualifikation, Branche, Ausbildung, Weiterbildung, Werdegang, Schwerpunkt |
| **Profilprüfung** | Was am Profil fehlt oder veraltet ist, mit Sprung zur Stelle, an der man es behebt (#139) |
| **Projekt** | Station eines Beraters mit Kunde, Vermittler, Rollen, Skills und Zeitraum |
| **Report Manager** | Admin-Seite zum Hochladen und Pflegen der Vorlagen |
| **Skill** | Fähigkeit mit Bewertung (1–5) und Versionen im Profil; im Skill-Baum ein Knoten mit Aliasen und Übersetzungen |
| **Skill-Baum** | Die Hierarchie aus Kategorien und Skills im Skill Service. Seine Namen sind die Referenz für alle Skill-Namen. |
| **Stand** | Ein Commit; Versionsnummern gibt es nicht (#77) |
| **Statistikkopie** | Die Kopie aller Berater und Profile im Statistics Service (Redis) |
| **Vorlage** (`ReportTemplate`) | BIRT-Design mit Name und Beschreibung. Die Metadaten liegen im View-Profile Service, die Datei im Report Service. |
| **Vorschau** | PDF eines View-Profils mit einer Vorlage, live gerendert, nicht gespeichert |
| **View-Profil** | Bearbeitbare Momentaufnahme eines Profils für einen Export: Auswahl, Reihenfolge, Gruppierung, Sprache |
| **Watchtower** | Werkzeug in der Produktion, das neue Images zieht und die Container neu erzeugt |
