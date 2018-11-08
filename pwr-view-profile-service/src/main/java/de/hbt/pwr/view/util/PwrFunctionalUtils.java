package de.hbt.pwr.view.util;

import java.util.function.Consumer;
import java.util.function.UnaryOperator;

public class PwrFunctionalUtils {
    public static <T> UnaryOperator<T> peek(Consumer<T> c) {
        return x -> {
            c.accept(x);
            return x;
        };
    }
}
