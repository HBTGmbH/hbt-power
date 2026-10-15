package de.hbt.pwr.profile;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class PwrCollectionUtils {
    @SafeVarargs
    public static <T> Set<T> hashSet(T... values) {
        return new HashSet<T>(Arrays.asList(values));
    }
}
