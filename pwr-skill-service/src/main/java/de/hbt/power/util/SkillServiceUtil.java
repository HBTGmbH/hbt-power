package de.hbt.power.util;

import java.util.function.Consumer;
import java.util.function.UnaryOperator;

public class SkillServiceUtil {
    /**
     * This allows peeking of an optional.
     * https://stackoverflow.com/questions/43737212/how-to-peek-on-an-optional
     */
    public static <T> UnaryOperator<T> peek(Consumer<T> c) {
        return x -> {
            c.accept(x);
            return x;
        };
    }
}
