package de.hbt.pwr.view.util;

import java.util.List;

public class ListUtil {
    public static <T> void move(List<T> list, int sourceIndex, int targetIndex) {
        list.add(targetIndex, list.remove(sourceIndex));
    }
}
