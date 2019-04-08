package de.hbt.power.util;

import java.util.Locale;
import java.util.Optional;

/**
 * Created by nt on 07.08.2017.
 */
public class LocaleUtil {
    public static Optional<Locale> getLocaleFromISO639_2(String code) {
        for (Locale locale : Locale.getAvailableLocales()) {
            if (locale.getISO3Language().equals(code)) {
                return Optional.of(locale);
            }
        }
        return Optional.empty();
    }
}
