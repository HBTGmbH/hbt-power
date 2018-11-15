package de.hbt.pwr.view.controller;

import de.hbt.pwr.view.service.StorageService;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;
import org.junit.runner.RunWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.io.File;
import java.nio.file.Path;
import java.util.stream.Stream;

@RunWith(SpringJUnit4ClassRunner.class)
public class FileUploadControllerTest {
/*
    @Autowired
    private MockMvc mvc;
*/
    @MockBean
    private StorageService storageService;


    private String uploadDirectory = "D:\\mp\\Projekte\\HBT-Power2\\pwr-view-profile-service\\src\\main\\resources\\uploads\\test\\";

    private File directory = new File(uploadDirectory);

    @Rule
    public TemporaryFolder folder = new TemporaryFolder();

    @Test
    public void shouldCreateAndDeleteFile() throws Exception {
        File file = folder.newFile("testFile1.rptdesign");


    }

    @Test
    public void shouldGetAListOfFiles(){
        Stream<Path> allFiles = storageService.loadAll();




    }


}