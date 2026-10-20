package de.hbt.model.export.birt;

import com.lowagie.text.FontFactory;
import com.lowagie.text.FontFactoryImp;
import com.lowagie.text.pdf.BaseFont;
import lombok.extern.slf4j.Slf4j;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontFormatException;
import java.io.IOException;
import java.lang.reflect.Field;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Fonts for rendering PDFs. The templates use the HBT font Simplon Norm. It is licensed, so it is not part of the
 * repository or the image: in production it comes from a mounted directory. If it is missing, the free Noto Sans of
 * the image stands in for it, weight for weight. Without either, BIRT falls back to its built-in Times-Roman.
 * <p>
 * BIRT looks fonts up by the names inside the font files. The HBT files are called "Simplon Norm HBT …", the templates
 * ask for "Simplon Norm …", so the names are mapped even when the font is there.
 * <p>
 * The HBT files are OpenType fonts with CFF outlines (.otf). iText 2.1.7, which BIRT uses for PDFs, cannot embed a
 * subset of them (CFFFontSubset fails with a NullPointerException, BIRT swallows it and the PDF ends unfinished), so
 * such fonts are embedded whole, see {@link WholeCffFontFactory}.
 */
@Slf4j
public final class PdfFonts {

    /**
     * A font family the templates use, the names it may have in the font files (in order of preference) and the free
     * font that stands in for it
     */
    static final class TemplateFont {
        final String name;
        final List<String> candidates;
        final String fallback;

        TemplateFont(String name, List<String> candidates, String fallback) {
            this.name = name;
            this.candidates = candidates;
            this.fallback = fallback;
        }
    }

    static final List<TemplateFont> TEMPLATE_FONTS = List.of(
            new TemplateFont("Simplon Norm",
                    List.of("Simplon Norm", "Simplon Norm Regular", "Simplon Norm HBT Regular", "Simplon Norm HBT"),
                    "Noto Sans"),
            new TemplateFont("Simplon Norm Light",
                    List.of("Simplon Norm Light", "Simplon Norm HBT Light"), "Noto Sans Light"),
            new TemplateFont("Simplon Norm Medium",
                    List.of("Simplon Norm Medium", "Simplon Norm HBT Medium"), "Noto Sans Medium"),
            new TemplateFont("Simplon Norm Bold",
                    List.of("Simplon Norm Bold", "Simplon Norm HBT Bold"), "Noto Sans Bold"),
            // Older templates (in production until replaced) still use Arial, which is not part of the HBT design (#81)
            new TemplateFont("Arial",
                    List.of("Simplon Norm", "Simplon Norm Regular", "Simplon Norm HBT Regular", "Simplon Norm HBT"),
                    "Noto Sans"));

    private PdfFonts() {
    }

    /**
     * Writes a BIRT font configuration for the given directories (those that do not exist are skipped).
     *
     * @return the configuration, empty if none of the directories exists: then BIRT keeps its defaults
     */
    public static Optional<URL> fontConfig(Path fontDirectory, Path fallbackDirectory) {
        List<Path> directories = Stream.of(fontDirectory, fallbackDirectory)
                .filter(Files::isDirectory)
                .collect(Collectors.toList());
        // Before BIRT registers or creates any font: iText's FontFactory is global
        FontFactory.setFontImp(new WholeCffFontFactory());
        if (directories.isEmpty()) {
            log.warn("[Fonts] Neither {} nor {} exists: PDFs use BIRT's built-in Times-Roman",
                    fontDirectory, fallbackDirectory);
            return Optional.empty();
        }
        Set<String> available = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        directories.forEach(directory -> available.addAll(fontNames(directory)));
        Map<String, String> aliases = aliases(available);
        TEMPLATE_FONTS.forEach(font -> log.info("[Fonts] {} -> {}", font.name,
                aliases.getOrDefault(font.name, available.contains(font.name) ? font.name : "Times-Roman (BIRT default)")));
        try {
            Path config = Files.createTempFile("birt-fontsConfig", ".xml");
            config.toFile().deleteOnExit();
            Files.writeString(config, fontsConfigXml(directories, aliases), StandardCharsets.UTF_8);
            return Optional.of(config.toUri().toURL());
        } catch (IOException e) {
            throw new IllegalStateException("BIRT font configuration could not be written", e);
        }
    }

    /**
     * Template font → font to use instead: the first candidate that is available, otherwise the fallback if that is.
     * No entry if the template font is available under its own name, or if neither is.
     */
    static Map<String, String> aliases(Set<String> available) {
        Map<String, String> aliases = new LinkedHashMap<>();
        for (TemplateFont font : TEMPLATE_FONTS) {
            Optional<String> found = font.candidates.stream().filter(available::contains).findFirst();
            if (found.isPresent()) {
                if (!found.get().equalsIgnoreCase(font.name)) {
                    aliases.put(font.name, found.get());
                }
            } else if (available.contains(font.fallback)) {
                aliases.put(font.name, font.fallback);
            }
        }
        // Generic families of the templates, if any, also look like the fallback rather than Helvetica / Times
        if (available.contains("Noto Sans")) {
            aliases.put("sans-serif", "Noto Sans");
        }
        return aliases;
    }

    static String fontsConfigXml(List<Path> directories, Map<String, String> aliases) {
        StringBuilder xml = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<font>\n");
        xml.append("  <font-aliases>\n");
        aliases.forEach((name, fontFamily) -> xml.append("    <mapping name=\"").append(escape(name))
                .append("\" font-family=\"").append(escape(fontFamily)).append("\"/>\n"));
        xml.append("  </font-aliases>\n");
        // With font-paths, BIRT loads only these directories and ignores the system fonts
        xml.append("  <font-paths>\n");
        directories.forEach(directory -> xml.append("    <path path=\"")
                .append(escape(directory.toAbsolutePath().toString())).append("\"/>\n"));
        xml.append("  </font-paths>\n</font>\n");
        return xml.toString();
    }

    /**
     * Names inside the font files of a directory (full name, family and PostScript name), as BIRT finds them. Like
     * BIRT, only the directory itself, not its subdirectories
     */
    static Set<String> fontNames(Path directory) {
        Set<String> names = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        try (Stream<Path> files = Files.list(directory)) {
            files.filter(Files::isRegularFile)
                    .filter(file -> file.getFileName().toString().toLowerCase(Locale.ROOT).matches(".*\\.(ttf|otf)"))
                    .forEach(file -> {
                        try {
                            Font font = Font.createFont(Font.TRUETYPE_FONT, file.toFile());
                            names.add(font.getFontName(Locale.ROOT));
                            names.add(font.getFamily(Locale.ROOT));
                            names.add(font.getPSName());
                        } catch (FontFormatException | IOException e) {
                            log.warn("[Fonts] {} is not a readable font, ignored", file);
                        }
                    });
        } catch (IOException e) {
            log.warn("[Fonts] {} could not be read", directory, e);
        }
        return names;
    }

    /**
     * Embeds fonts with CFF outlines whole instead of as a subset, which iText 2.1.7 cannot do for them. TrueType fonts
     * stay subsets, so the PDFs stay small.
     */
    static final class WholeCffFontFactory extends FontFactoryImp {

        @Override
        public com.lowagie.text.Font getFont(String fontname, String encoding, boolean embedded, float size, int style,
                                             Color color, boolean cached) {
            com.lowagie.text.Font font = super.getFont(fontname, encoding, embedded, size, style, color, cached);
            BaseFont baseFont = font.getBaseFont();
            if (baseFont != null && hasCffOutlines(baseFont)) {
                baseFont.setSubset(false);
            }
            return font;
        }
    }

    /**
     * iText's TrueTypeFont (package-private) knows whether a font has CFF outlines
     */
    static boolean hasCffOutlines(BaseFont baseFont) {
        try {
            Class<?> trueTypeFont = Class.forName("com.lowagie.text.pdf.TrueTypeFont");
            if (!trueTypeFont.isInstance(baseFont)) {
                return false;
            }
            Field cff = trueTypeFont.getDeclaredField("cff");
            cff.setAccessible(true);
            return cff.getBoolean(baseFont);
        } catch (ReflectiveOperationException e) {
            // Another iText version: subsetting may work there
            return false;
        }
    }

    private static String escape(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
