import java.io.ByteArrayOutputStream;
import java.net.ConnectException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Uploads the committed BIRT design file as a report template, the same way the admin "upload template" dialog does:
 * one multipart request to the view-profile service, which stores the file in the report service and the template in Redis.
 * <p>
 * Run with `mvn exec:exec` (see pom.xml). Needs pwr-report-service and pwr-view-profile-service running with localDev.
 * Skips the upload if a template with the same name already exists.
 * <p>
 * Usage: java SeedReportTemplate.java &lt;design file&gt; [view-profile-service url]
 */
public class SeedReportTemplate {

    private static final String NAME = "HBT Standard (local)";
    private static final String DESCRIPTION = "Standard template from pwr-report-service/src/main/resources/templates";
    private static final String CREATE_USER = "Local Developer";

    public static void main(String[] args) throws Exception {
        Path designFile = Path.of(args[0]);
        String baseUrl = args.length > 1 ? args[1] : "http://localhost:9008";
        HttpClient http = HttpClient.newHttpClient();

        try {
            if (templateExists(http, baseUrl)) {
                System.out.println("Report template '" + NAME + "' already exists, nothing to do.");
                return;
            }
            upload(http, baseUrl, designFile);
        } catch (ConnectException e) {
            System.err.println("Could not reach " + baseUrl + ". Start pwr-view-profile-service and pwr-report-service with localDev first.");
            System.exit(1);
        }
    }

    private static boolean templateExists(HttpClient http, String baseUrl) throws Exception {
        String ids = get(http, baseUrl + "/template");
        Matcher id = Pattern.compile("\"([^\"]+)\"").matcher(ids);
        while (id.find()) {
            if (get(http, baseUrl + "/template/" + id.group(1)).contains("\"name\":\"" + NAME + "\"")) {
                return true;
            }
        }
        return false;
    }

    private static void upload(HttpClient http, String baseUrl, Path designFile) throws Exception {
        String boundary = "----seed" + UUID.randomUUID();
        // The view-profile service parses this by splitting at quotes: keep the field order and don't use quotes in values
        String templateSlice = "{\"name\":\"" + NAME + "\",\"description\":\"" + DESCRIPTION + "\",\"createUser\":\"" + CREATE_USER + "\"}";

        ByteArrayOutputStream body = new ByteArrayOutputStream();
        write(body, "--" + boundary + "\r\n"
                + "Content-Disposition: form-data; name=\"file\"; filename=\"" + designFile.getFileName() + "\"\r\n"
                + "Content-Type: application/octet-stream\r\n\r\n");
        body.write(Files.readAllBytes(designFile));
        write(body, "\r\n--" + boundary + "\r\n"
                + "Content-Disposition: form-data; name=\"templateSlice\"\r\n\r\n"
                + templateSlice + "\r\n"
                + "--" + boundary + "--\r\n");

        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/template"))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray()))
                .build();
        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            System.err.println("Upload failed with HTTP " + response.statusCode() + ": " + response.body());
            System.exit(1);
        }
        System.out.println("Uploaded report template '" + NAME + "': " + response.body());
    }

    private static String get(HttpClient http, String url) throws Exception {
        HttpResponse<String> response = http.send(HttpRequest.newBuilder(URI.create(url)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IllegalStateException("GET " + url + " failed with HTTP " + response.statusCode() + ": " + response.body());
        }
        return response.body();
    }

    private static void write(ByteArrayOutputStream out, String text) {
        out.writeBytes(text.getBytes(StandardCharsets.UTF_8));
    }
}
