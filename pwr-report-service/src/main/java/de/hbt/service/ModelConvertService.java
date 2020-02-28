package de.hbt.service;

import de.hbt.model.ReportInfo;
import de.hbt.model.export.*;
import de.hbt.model.view.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Converts the new view profile model into the old power model.
 */
@Service
@Component
public class ModelConvertService {

    @Value("${export.imgLocation}")
    private String imgLocation;

    private static Synonym toSynonym(String name) {
        Synonym res = new Synonym();
        res.setBezeichnung(name);
        return res;
    }

    private static SynonymSet toSynonymSet(String name) {
        SynonymSet result = new SynonymSet();
        result.setHauptbegriff(toSynonym(name));
        return result;
    }

    private static Datum toDatum(LocalDate localDate) {
        if (localDate != null) {
            Datum result = new Datum();
            result.setJahr(localDate.getYear());
            result.setMonat(localDate.getMonthValue());
            result.setTag(localDate.getDayOfMonth());
            return result;
        }
        return null;
    }

    private static Zeitraum toZeitraum(LocalDate from, LocalDate to) {
        Zeitraum result = new Zeitraum();
        result.setVon(toDatum(from));
        result.setBis(toDatum(to));
        return result;
    }

    private static Personalie toPersonalie(LocalDate birthDate) {
        Personalie personalie = new Personalie();
        if (birthDate != null) {
            personalie.setJahrgang(birthDate.getYear());
        }
        return personalie;
    }

    private static Unternehmen toUnternehmen(String name) {
        Unternehmen result = new Unternehmen();
        result.setBezeichnung(name);
        return result;
    }

    private static SkillLevel toSkillLevel(Integer level) {
        SkillLevel skillLevel = new SkillLevel();
        skillLevel.setLevel(level.toString());
        return skillLevel;
    }

    private static Qualification toQualification(ViewQualification viewQualification) {
        Qualification res = new Qualification();
        res.setBezeichnung(toSynonymSet(viewQualification.getName()));
        res.setDatum(toDatum(viewQualification.getDate()));
        return res;
    }

    private static Branche toBranche(ViewSector viewSector) {
        Branche res = new Branche();
        res.setBezeichnung(toSynonymSet(viewSector.getName()));
        return res;
    }

    private static Sprache toSprache(ViewLanguage viewLanguage) {
        Sprache res = new Sprache();
        res.setNiveau(viewLanguage.getLevel().name());
        res.setSprache(viewLanguage.getName());
        return res;
    }

    private static Ausbildung toAusbildung(ViewEducation viewEducation) {
        Ausbildung result = new Ausbildung();
        result.setAbschluss(toSynonymSet(viewEducation.getDegree()));
        result.setBezeichnung(toSynonymSet(viewEducation.getName()));
        result.setZeitraum(toZeitraum(viewEducation.getStartDate(), viewEducation.getEndDate()));
        return result;
    }

    private static Ausbildung toAusbildung(ViewCareer viewCareer) {
        Ausbildung result = new Ausbildung();
        result.setBezeichnung(toSynonymSet(viewCareer.getName()));
        result.setZeitraum(toZeitraum(viewCareer.getStartDate(), viewCareer.getEndDate()));
        return result;
    }

    private static Ausbildung toAusbildung(ViewTraining viewTraining) {
        Ausbildung result = new Ausbildung();
        result.setAbschluss(toSynonymSet(viewTraining.getName()));
        result.setBezeichnung(toSynonymSet(viewTraining.getName()));
        result.setZeitraum(toZeitraum(viewTraining.getStartDate(), viewTraining.getEndDate()));
        return result;
    }

    private static Werdegang toWerdegang(ViewEducation viewEducation) {
        Werdegang res = new Werdegang();
        res.setTyp(WerdegangTyp.AUSBILDUNG.name());
        res.setAusbildung(toAusbildung(viewEducation));
        res.setBeschreibung(viewEducation.getDegree() + " " + viewEducation.getName());
        return res;
    }

    private static Werdegang toWerdegang(ViewCareer viewCareer) {
        Werdegang res = new Werdegang();
        res.setTyp(WerdegangTyp.BERUF.name());
        res.setAusbildung(toAusbildung(viewCareer));
        res.setBeschreibung(viewCareer.getName());
        return res;
    }

    private static Werdegang toWerdegang(ViewTraining viewTraining) {
        Werdegang res = new Werdegang();
        res.setTyp(WerdegangTyp.WEITERBILDUNG.name());
        res.setAusbildung(toAusbildung(viewTraining));
        return res;
    }

    private static Spezialgebiet toSpezialgebiet(ViewKeySkill keySkillEntry) {
        Spezialgebiet spezialgebiet = new Spezialgebiet();
        spezialgebiet.setBeschreibung(keySkillEntry.getName());
        spezialgebiet.setKurzbeschreibung(keySkillEntry.getName());
        return spezialgebiet;
    }

    private static List<Skill> extractSkills(ViewProject project) {
        return project.getSkills().stream().filter(ViewEntry::getEnabled).map(skill -> {
            Skill res = new Skill();
            res.setBezeichnung(toSynonymSet(skill.getName()));
            return res;
        }).collect(Collectors.toList());
    }

    private static ProjektRolle mapRolle(ViewProjectRole viewProjectRole) {
        ProjektRolle rolle = new ProjektRolle();
        rolle.setBezeichnung(toSynonymSet(viewProjectRole.getName()));
        return rolle;
    }

    private static List<ProjektRolle> extractProjektRolles(ViewProject project) {
        return project.getProjectRoles().stream().filter(ViewEntry::getEnabled)
                .map(ModelConvertService::mapRolle).collect(Collectors.toList());
    }

    private static Projekt toProjekt(ViewProject viewProject) {
        Projekt result = new Projekt();
        result.setProjektId(viewProject.getId());
        result.setAuszeit(null);
        result.setBerater("TODO");
        result.setBranche(null);
        result.setKurzbeschreibung(viewProject.getDescription());
        result.setTitel(viewProject.getName());
        result.setZeitraum(toZeitraum(viewProject.getStartDate(), viewProject.getEndDate()));
        result.setEndkunde(toUnternehmen(viewProject.getClient()));
        result.setSkills(extractSkills(viewProject));
        result.setRollen(extractProjektRolles(viewProject));
        return result;
    }

    private static List<Qualification> extractQualifications(ViewProfile viewProfile) {
        return viewProfile.getQualifications().stream().filter(ViewEntry::getEnabled)
                .map(ModelConvertService::toQualification).collect(Collectors.toList());
    }

    private static List<Branche> extractSectors(ViewProfile viewProfile) {
        return viewProfile.getSectors().stream().filter(ViewEntry::getEnabled)
                .map(ModelConvertService::toBranche).collect(Collectors.toList());
    }

    private static List<Sprache> extractLanguages(ViewProfile viewProfile) {
        return viewProfile.getLanguages().stream().filter(ViewEntry::getEnabled)
                .map(ModelConvertService::toSprache).collect(Collectors.toList());
    }

    private static List<Werdegang> extractCareer(ViewProfile viewProfile) {
        List<Werdegang> education =
                viewProfile.getEducations().stream().filter(ViewEntry::getEnabled)
                        .map(ModelConvertService::toWerdegang).collect(Collectors.toList());
        List<Werdegang> trainings =
                viewProfile.getTrainings().stream().filter(ViewEntry::getEnabled)
                        .map(ModelConvertService::toWerdegang).collect(Collectors.toList());
        List<Werdegang> career = viewProfile.getCareers().stream().filter(ViewEntry::getEnabled)
                .map(ModelConvertService::toWerdegang).collect(Collectors.toList());
        education.addAll(trainings);
        education.addAll(career);
        return education;
    }

    private static List<Projekt> extractProjects(ViewProfile viewProfile) {
        return viewProfile.getProjects().stream().filter(ViewEntry::getEnabled)
                .map(ModelConvertService::toProjekt).collect(Collectors.toList());
    }

    private static List<ProjektRolle> extractProjectRoles(ViewProfile viewProfile) {
        return viewProfile.getProjectRoles().stream().filter(ViewEntry::getEnabled)
                .map(ModelConvertService::mapRolle).collect(Collectors.toList());
    }

    private static List<Skill> extractSkills(ViewProfile viewProfile) {
        Map<String, String> displayCategoryNamesBySkill = new HashMap<>();
        Map<String, Integer> groupIndexBySkillName = new HashMap<>();
        List<ViewSkill> skills = new ArrayList<>();
        for (int i = 0; i < viewProfile.getDisplayCategories().size(); i++) {
            ViewCategory viewCategory = viewProfile.getDisplayCategories().get(i);
            for (ViewSkill viewSkill : viewCategory.getDisplaySkills()) {
                displayCategoryNamesBySkill.put(viewSkill.getName(), viewCategory.getName());
                groupIndexBySkillName.put(viewSkill.getName(), i);
                skills.add(viewSkill);
            }
        }
        return skills.stream().filter(ViewEntry::getEnabled).map(viewSkill -> {
            Skill sExport = new Skill();
            sExport.setBezeichnung(toSynonymSet(viewSkill.getName()));
            sExport.setGruppe(displayCategoryNamesBySkill.get(viewSkill.getName()));
            sExport.setLevel(toSkillLevel(viewSkill.getRating()));
            sExport.setGroupIndex(groupIndexBySkillName.get(viewSkill.getName()));
            String collect = viewSkill.getVersions().stream()
                    .filter(ViewSkillVersion::isEnabled)
                    .map(ViewSkillVersion::getName)
                    .collect(Collectors.joining(", "));
            if (!collect.equals("")) {
                sExport.setVersions(collect);
            }
            return sExport;
        }).collect(Collectors.toList());
    }

    private static List<Spezialgebiet> extractKeySkills(ViewProfile viewProfile) {
        return viewProfile.getKeySkills().stream().filter(ViewEntry::getEnabled)
                .map(ModelConvertService::toSpezialgebiet).collect(Collectors.toList());
    }

    public Profil convert(ReportInfo reportInfo) {
        Profil result = new Profil();
        ViewProfile viewProfile = reportInfo.viewProfile;
        result.setBildUrl(String.format(imgLocation, reportInfo.initials));

        result.setKurztext(viewProfile.getDescription());
        result.setName(reportInfo.name);
        result.setPersonalie(toPersonalie(reportInfo.birthDate));
        result.setQualifikationen(extractQualifications(viewProfile));
        result.setBranchen(extractSectors(viewProfile));
        result.setSprachen(extractLanguages(viewProfile));
        result.setWerdegang(extractCareer(viewProfile));
        result.setSpezialgebiete(extractKeySkills(viewProfile));
        result.setProjekte(extractProjects(viewProfile));
        result.setProfilRollen(extractProjectRoles(viewProfile));
        result.setSkills(extractSkills(viewProfile));
        return result;
    }
}
