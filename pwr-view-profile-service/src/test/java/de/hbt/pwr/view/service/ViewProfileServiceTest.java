package de.hbt.pwr.view.service;

import de.hbt.pwr.view.model.ViewProfile;
import de.hbt.pwr.view.repo.ViewProfileRepository;
import org.junit.Before;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import static org.junit.Assert.*;

@RunWith(SpringJUnit4ClassRunner.class)
public class ViewProfileServiceTest {

    private ViewProfileService viewProfileService;

    @MockBean
    private ViewProfileRepository viewProfileRepository;

    @Before
    public void setUp() {
        viewProfileService = new ViewProfileService(viewProfileRepository);
    }


}