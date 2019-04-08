package de.hbt.power;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

public class SkillServiceTestUtils {

    public static <E extends Throwable> E expectThrown(Runnable runnable, Class<E> clazz) {
        try {
            runnable.run();
            fail("Expected method to throw an exception");
        } catch (Throwable throwable) {
            assertThat(throwable).isInstanceOf(clazz);
            return (E) throwable;
        }
        throw new RuntimeException("This shouldn't happen.");
    }
}
