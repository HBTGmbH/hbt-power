package de.hbt.pwr.view.util;

import java.text.Collator;
import java.util.Comparator;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Order of names in a CV, the same as in the webclient: without regard to case, umlauts with their base letter, numbers
 * by value (Java 8 before Java 11).
 */
public final class NameOrder {

    private static final Pattern CHUNK = Pattern.compile("\\d+|\\D+");

    /** Ignores case, not accents: a and A are equal, a and ä are not (ä still sorts next to a) */
    private static final Collator COLLATOR = Collator.getInstance(Locale.GERMAN);

    static {
        COLLATOR.setStrength(Collator.SECONDARY);
    }

    public static final Comparator<String> NAMES = Comparator.nullsLast(NameOrder::compare);

    private NameOrder() {
    }

    private static int compare(String name1, String name2) {
        Matcher chunks1 = CHUNK.matcher(name1);
        Matcher chunks2 = CHUNK.matcher(name2);
        while (chunks1.find() && chunks2.find()) {
            String chunk1 = chunks1.group();
            String chunk2 = chunks2.group();
            int result = Character.isDigit(chunk1.charAt(0)) && Character.isDigit(chunk2.charAt(0))
                    ? compareNumbers(chunk1, chunk2)
                    : COLLATOR.compare(chunk1, chunk2);
            if (result != 0) {
                return result;
            }
        }
        int result = Integer.compare(name1.length(), name2.length());
        // equal for the collator (Java and java): the spelling decides, so that the order is stable
        return result != 0 ? result : name1.compareTo(name2);
    }

    private static int compareNumbers(String number1, String number2) {
        String digits1 = number1.replaceFirst("^0+(?=\\d)", "");
        String digits2 = number2.replaceFirst("^0+(?=\\d)", "");
        int result = Integer.compare(digits1.length(), digits2.length());
        return result != 0 ? result : digits1.compareTo(digits2);
    }
}
