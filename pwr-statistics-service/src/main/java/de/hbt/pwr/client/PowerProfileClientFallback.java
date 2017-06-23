package de.hbt.pwr.client;

import de.hbt.pwr.StreamUtils;
import de.hbt.pwr.model.profile.Consultant;
import de.hbt.pwr.repo.ConsultantRepository;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PowerProfileClientFallback implements PowerProfileClient {


    @Autowired
    private ConsultantRepository consultantRepository;

    private final Logger LOG = Logger.getLogger(PowerProfileClientFallback.class);

    public PowerProfileClientFallback() {
    }

    @Override
    public List<Consultant> getAllConsultants() {
        LOG.info("Using Fallback for 'getAllConsultants'");
        return StreamUtils.asStream(consultantRepository.findAll().iterator()).collect(Collectors.toList());
    }
}
