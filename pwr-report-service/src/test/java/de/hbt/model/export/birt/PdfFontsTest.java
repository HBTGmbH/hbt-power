package de.hbt.model.export.birt;

import com.lowagie.text.pdf.BaseFont;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.entry;

class PdfFontsTest {

    private static Set<String> available(String... names) {
        Set<String> set = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        set.addAll(List.of(names));
        return set;
    }

    @Test
    void mapsTheTemplateNamesToTheHbtFontFiles() {
        Map<String, String> aliases = PdfFonts.aliases(available("Simplon Norm HBT Regular", "Simplon Norm HBT Light",
                "Simplon Norm HBT Medium", "Simplon Norm HBT Bold", "Noto Sans", "Noto Sans Light"));

        assertThat(aliases).contains(
                entry("Simplon Norm", "Simplon Norm HBT Regular"),
                entry("Simplon Norm Light", "Simplon Norm HBT Light"),
                entry("Simplon Norm Medium", "Simplon Norm HBT Medium"),
                entry("Simplon Norm Bold", "Simplon Norm HBT Bold"),
                entry("Arial", "Simplon Norm HBT Regular"));
    }

    @Test
    void needsNoMappingWhenTheFontHasTheTemplateName() {
        Map<String, String> aliases = PdfFonts.aliases(available("simplon norm", "Simplon Norm Light"));

        assertThat(aliases).doesNotContainKeys("Simplon Norm", "Simplon Norm Light");
        assertThat(aliases).contains(entry("Arial", "Simplon Norm"));
    }

    @Test
    void fallsBackToNotoSansWeightForWeight() {
        Map<String, String> aliases = PdfFonts.aliases(available("Noto Sans", "Noto Sans Light", "Noto Sans Medium",
                "Noto Sans Bold"));

        assertThat(aliases).contains(
                entry("Simplon Norm", "Noto Sans"),
                entry("Simplon Norm Light", "Noto Sans Light"),
                entry("Simplon Norm Medium", "Noto Sans Medium"),
                entry("Simplon Norm Bold", "Noto Sans Bold"),
                entry("Arial", "Noto Sans"),
                entry("sans-serif", "Noto Sans"));
    }

    @Test
    void usesTheFallbackOnlyForTheMissingWeights() {
        Map<String, String> aliases = PdfFonts.aliases(available("Simplon Norm HBT Regular", "Noto Sans Bold"));

        assertThat(aliases).contains(
                entry("Simplon Norm", "Simplon Norm HBT Regular"),
                entry("Simplon Norm Bold", "Noto Sans Bold"));
        // Neither the font nor its fallback: BIRT keeps its default
        assertThat(aliases).doesNotContainKeys("Simplon Norm Light", "Simplon Norm Medium");
    }

    @Test
    void writesAliasesAndFontPathsForBirt() {
        String xml = PdfFonts.fontsConfigXml(List.of(Path.of("/fonts"), Path.of("/usr/share/fonts/pwr-fallback")),
                Map.of("Simplon Norm", "Simplon Norm HBT Regular"));

        assertThat(xml).contains("<mapping name=\"Simplon Norm\" font-family=\"Simplon Norm HBT Regular\"/>",
                "<path path=\"/fonts\"/>", "<path path=\"/usr/share/fonts/pwr-fallback\"/>");
    }

    @Test
    void escapesPathsInTheConfiguration() {
        String xml = PdfFonts.fontsConfigXml(List.of(Path.of("/fonts/A & B \"<x>\"")), Map.of());

        assertThat(xml).contains("<path path=\"/fonts/A &amp; B &quot;&lt;x&gt;&quot;\"/>");
    }

    @Test
    void keepsBirtDefaultsWithoutAnyFontDirectory(@TempDir Path temp) {
        assertThat(PdfFonts.fontConfig(temp.resolve("missing"), temp.resolve("also-missing"))).isEmpty();
    }

    @Test
    void writesAConfigurationForAnExistingDirectory(@TempDir Path temp) throws Exception {
        Path fonts = Files.createDirectory(temp.resolve("fonts"));
        Files.writeString(fonts.resolve("not-a-font.ttf"), "no font");

        Path config = Path.of(PdfFonts.fontConfig(fonts, temp.resolve("missing")).orElseThrow().toURI());

        assertThat(Files.readString(config)).contains("<path path=\"" + fonts.toAbsolutePath() + "\"/>")
                .doesNotContain("missing");
    }

    @Test
    void ignoresFilesThatAreNoFonts(@TempDir Path temp) throws Exception {
        Files.writeString(temp.resolve("broken.otf"), "no font");
        Files.writeString(temp.resolve("readme.txt"), "text");

        assertThat(PdfFonts.fontNames(temp)).isEmpty();
    }

    @Test
    void builtInFontsHaveNoCffOutlines() throws Exception {
        assertThat(PdfFonts.hasCffOutlines(BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, false))).isFalse();
    }
}
