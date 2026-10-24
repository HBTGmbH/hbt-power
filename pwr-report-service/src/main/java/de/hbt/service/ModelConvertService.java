package de.hbt.service;

import de.hbt.model.ReportInfo;
import de.hbt.model.export.*;
import de.hbt.model.view.*;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

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

    public ModelConvertService() {
    }

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
        res.setBezeichnung(toSynonymSet(nameInLanguage(viewQualification.getLocalizedName(), viewQualification.getName())));
        res.setDatum(toDatum(viewQualification.getDate()));
        return res;
    }

    private static Branche toBranche(ViewSector viewSector) {
        Branche res = new Branche();
        res.setBezeichnung(toSynonymSet(nameInLanguage(viewSector.getLocalizedName(), viewSector.getName())));
        return res;
    }

    private static Sprache toSprache(ViewLanguage viewLanguage) {
        Sprache res = new Sprache();
        res.setNiveau(viewLanguage.getLevel().name());
        res.setSprache(nameInLanguage(viewLanguage.getLocalizedName(), viewLanguage.getName()));
        return res;
    }

    private static Ausbildung toAusbildung(ViewEducation viewEducation) {
        Ausbildung result = new Ausbildung();
        result.setAbschluss(toSynonymSet(viewEducation.getDegree()));
        result.setBezeichnung(toSynonymSet(nameInLanguage(viewEducation.getLocalizedName(), viewEducation.getName())));
        result.setZeitraum(toZeitraum(viewEducation.getStartDate(), viewEducation.getEndDate()));
        return result;
    }

    private static Ausbildung toAusbildung(ViewCareer viewCareer) {
        Ausbildung result = new Ausbildung();
        result.setBezeichnung(toSynonymSet(nameInLanguage(viewCareer.getLocalizedName(), viewCareer.getName())));
        result.setZeitraum(toZeitraum(viewCareer.getStartDate(), viewCareer.getEndDate()));
        return result;
    }

    private static Ausbildung toAusbildung(ViewTraining viewTraining) {
        Ausbildung result = new Ausbildung();
        String name = nameInLanguage(viewTraining.getLocalizedName(), viewTraining.getName());
        result.setAbschluss(toSynonymSet(name));
        result.setBezeichnung(toSynonymSet(name));
        result.setZeitraum(toZeitraum(viewTraining.getStartDate(), viewTraining.getEndDate()));
        return result;
    }

    private static Werdegang toWerdegang(ViewEducation viewEducation) {
        Werdegang res = new Werdegang();
        res.setTyp(WerdegangTyp.AUSBILDUNG.name());
        res.setAusbildung(toAusbildung(viewEducation));
        res.setBeschreibung(viewEducation.getDegree() + " " + nameInLanguage(viewEducation.getLocalizedName(), viewEducation.getName()));
        return res;
    }

    private static Werdegang toWerdegang(ViewCareer viewCareer) {
        Werdegang res = new Werdegang();
        res.setTyp(WerdegangTyp.BERUF.name());
        res.setAusbildung(toAusbildung(viewCareer));
        res.setBeschreibung(nameInLanguage(viewCareer.getLocalizedName(), viewCareer.getName()));
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
        String name = nameInLanguage(keySkillEntry.getLocalizedName(), keySkillEntry.getName());
        spezialgebiet.setBeschreibung(name);
        spezialgebiet.setKurzbeschreibung(name);
        return spezialgebiet;
    }

    private static List<Skill> extractSkills(ViewProject project) {
        return project.getSkills().stream().filter(ViewEntry::getEnabled).map(skill -> {
            Skill res = new Skill();
            res.setBezeichnung(toSynonymSet(nameInLanguage(skill.getLocalizedName(), skill.getName())));
            return res;
        }).collect(Collectors.toList());
    }

    /**
     * The name in the language of the view profile (#174, #291), otherwise the one of the skill tree or the profile
     */
    private static String nameInLanguage(String localizedName, String name) {
        return localizedName == null || localizedName.isBlank() ? name : localizedName;
    }

    private static ProjektRolle mapRolle(ViewProjectRole viewProjectRole) {
        ProjektRolle rolle = new ProjektRolle();
        rolle.setBezeichnung(toSynonymSet(nameInLanguage(viewProjectRole.getLocalizedName(), viewProjectRole.getName())));
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
        result.setBranche(null);
        result.setKurzbeschreibung(viewProject.getDescription());
        result.setTitel(viewProject.getName());
        result.setZeitraum(toZeitraum(viewProject.getStartDate(), viewProject.getEndDate()));
        result.setEndkunde(toUnternehmen(nameInLanguage(viewProject.getLocalizedClient(), viewProject.getClient())));
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
            // A category switched off brings none of its skills (#159); null from older data counts as on
            if (Boolean.FALSE.equals(viewCategory.getEnabled())) {
                continue;
            }
            for (ViewSkill viewSkill : viewCategory.getDisplaySkills()) {
                displayCategoryNamesBySkill.put(viewSkill.getName(),
                        nameInLanguage(viewCategory.getLocalizedName(), viewCategory.getName()));
                groupIndexBySkillName.put(viewSkill.getName(), i);
                skills.add(viewSkill);
            }
        }
        // Versions of all skills can be switched off at once (#151)
        boolean showVersions = !Boolean.FALSE.equals(viewProfile.getShowSkillVersions());
        return skills.stream().filter(ViewEntry::getEnabled).map(viewSkill -> {
            Skill sExport = new Skill();
            sExport.setBezeichnung(toSynonymSet(nameInLanguage(viewSkill.getLocalizedName(), viewSkill.getName())));
            sExport.setGruppe(displayCategoryNamesBySkill.get(viewSkill.getName()));
            sExport.setLevel(toSkillLevel(viewSkill.getRating()));
            sExport.setGroupIndex(groupIndexBySkillName.get(viewSkill.getName()));
            String collect = viewSkill.getVersions().stream()
                    .filter(ViewSkillVersion::isEnabled)
                    .map(ViewSkillVersion::getName)
                    .collect(Collectors.joining(", "));
            if (showVersions && !collect.equals("")) {
                sExport.setVersions(collect);
            }
            return sExport;
        }).collect(Collectors.toList());
    }

    private static List<Spezialgebiet> extractKeySkills(ViewProfile viewProfile) {
        return viewProfile.getKeySkills().stream().filter(ViewEntry::getEnabled)
                .map(ModelConvertService::toSpezialgebiet).collect(Collectors.toList());
    }

    Profil convert(ReportInfo reportInfo, String picturePath) {
        Profil result = new Profil();
        ViewProfile viewProfile = reportInfo.viewProfile;
        result.setBildUrl(picturePath);

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
