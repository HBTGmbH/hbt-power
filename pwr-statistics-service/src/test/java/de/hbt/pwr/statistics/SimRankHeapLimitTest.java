package de.hbt.pwr.statistics;

import de.hbt.pwr.model.profile.Profile;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.lang.management.ManagementFactory;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * SimRank in the size of production needs little memory (#292). Runs in its own surefire execution with
 * {@code -Xmx64m} (pom.xml). The implementation before allocated 4.5 GB in 43 s for this and ran out of memory with
 * 128 MB; it never held that much at once, but its garbage let G1 grow the heap to the maximum.
 */
@Tag(SimRankHeapLimitTest.TAG)
public class SimRankHeapLimitTest {

    static final String TAG = "heap-limit";

    @Test
    public void sixtyProfilesWithAThousandSkills_fitIntoASmallHeap_andAllocateLittle() {
        assertThat(Runtime.getRuntime().maxMemory())
                .as("runs in the execution with -Xmx64m")
                .isLessThanOrEqualTo(64L * 1024 * 1024);
        List<Profile> profiles = SimRankTest.randomProfiles(60, 60, 1000, 50, 80);
        com.sun.management.ThreadMXBean threads = (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean();
        long thread = Thread.currentThread().getId();
        long before = threads.getThreadAllocatedBytes(thread);

        SimRank.Similarities similarities = new SimRank().rank(profiles);

        // About 16 MB: two matrices of the skills and the edges
        assertThat(threads.getThreadAllocatedBytes(thread) - before).isLessThan(64L * 1024 * 1024);
        assertThat(similarities.profileIds()).hasSize(60);
        assertThat(similarities.skillNames()).hasSizeGreaterThan(950);
        assertThat(similarities.profileSimilarity(1L, 2L)).isBetween(0.0, 1.0);
    }
}
