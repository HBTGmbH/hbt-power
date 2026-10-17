-- #21: Erstellungszeitpunkt der Exportdokumente (ReportData.createdAt).
-- Vor dem Rollout des neuen Report-Service ausführen; die Produktion läuft mit ddl-auto: none.
-- Bestehende Einträge behalten created_at = null und zeigen weiter nur das Datum.
alter table report_data add column if not exists created_at datetime(6) null;
