package de.hbt.pwr.profile.controller;

import de.hbt.pwr.profile.model.FormerNameDTO;
import de.hbt.pwr.profile.service.NameEntityAdminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * The aliases of all profile elements for the suggestions while typing (#270): typing <code>DB</code> suggests
 * <code>Deutsche Bahn AG</code>. Only names of elements, nothing about consultants, so for every user.
 */
@RestController
@RequestMapping(value = "/suggestions", produces = "application/json")
public class NameEntityAliasEndpoint {

    private final NameEntityAdminService nameEntityAdminService;

    public NameEntityAliasEndpoint(NameEntityAdminService nameEntityAdminService) {
        this.nameEntityAdminService = nameEntityAdminService;
    }

    @GetMapping("/aliases")
    public List<FormerNameDTO> findAliases() {
        return nameEntityAdminService.findFormerNames();
    }
}
