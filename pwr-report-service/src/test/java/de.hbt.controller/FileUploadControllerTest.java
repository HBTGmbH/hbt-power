package de.hbt.controller;

import de.hbt.service.StorageService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
public class FileUploadControllerTest {
    /*
        @Autowired
        private MockMvc mvc;
    */
    @MockBean
    private StorageService storageService;


    private String uploadDirectory = "D:\\mp\\Projekte\\HBT-Power2\\pwr-view-profile-service\\src\\main\\resources\\uploads\\test\\";


    //@Rule
    //public TemporaryFolder folder = new TemporaryFolder();


    @Test
    public void shouldCreateFile() throws Exception {
    }

    @Test
    public void shouldGetAListOfFiles() throws Exception {


    }


}