# HBT Power – Architekturdokumentation

Diese Dokumentation beschreibt die Architektur von HBT Power nach [arc42](https://arc42.org/overview/), eine Datei je Hauptkapitel. Sie beschreibt den Stand im Code; wo [`AGENTS.md`](../../AGENTS.md) eine Regel schon festhält, verweist sie darauf, statt sie zu wiederholen. Einrichtung und lokaler Start stehen in der [`README.md`](../../README.md) im Wurzelverzeichnis.

| Nr. | Kapitel | Inhalt |
|---:|---|---|
| 1 | [Einführung und Ziele](01-einfuehrung-und-ziele.md) | Aufgabenstellung, Qualitätsziele, Stakeholder |
| 2 | [Randbedingungen](02-randbedingungen.md) | technische, organisatorische und rechtliche Vorgaben |
| 3 | [Kontextabgrenzung](03-kontextabgrenzung.md) | fachlicher und technischer Kontext |
| 4 | [Lösungsstrategie](04-loesungsstrategie.md) | die grundlegenden Entscheidungen im Überblick |
| 5 | [Bausteinsicht](05-bausteinsicht.md) | Services, Webclient und ihr Innenleben |
| 6 | [Laufzeitsicht](06-laufzeitsicht.md) | wichtige Abläufe über die Services |
| 7 | [Verteilungssicht](07-verteilungssicht.md) | Build, Auslieferung, Betrieb |
| 8 | [Querschnittliche Konzepte](08-querschnittliche-konzepte.md) | Sicherheit, Persistenz, Konsistenz, UI, Tests … |
| 9 | [Architekturentscheidungen](09-architekturentscheidungen.md) | Entscheidungen als ADRs |
| 10 | [Qualitätsanforderungen](10-qualitaetsanforderungen.md) | Qualitätsbaum und Szenarien |
| 11 | [Risiken und technische Schulden](11-risiken-und-technische-schulden.md) | was bekannt ist und was dagegen spricht |
| 12 | [Glossar](12-glossar.md) | Begriffe der Fachlichkeit und der Technik |

Diagramme sind in [Mermaid](https://mermaid.js.org) geschrieben; GitHub stellt sie direkt dar.

Wer eine Regel, einen Service, einen Ablauf oder eine Entscheidung ändert, passt das betroffene Kapitel im selben PR an (Definition of Done in [`AGENTS.md`](../../AGENTS.md)).
