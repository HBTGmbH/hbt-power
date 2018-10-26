package de.hbt.pwr.view.util;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class PwrListUtil {

    private PwrListUtil() {
        // Avoid construction
    }

    public static <T> List<T> union(List<T> listA, List<T> listB) {
        return Stream.of(listA, listB)
                .flatMap(List::stream)
                .collect(Collectors.toList());
    }

    public static <T> void move(List<T> list, int sourceIndex, int targetIndex) {
        list.add(targetIndex, list.remove(sourceIndex));
    }
}
