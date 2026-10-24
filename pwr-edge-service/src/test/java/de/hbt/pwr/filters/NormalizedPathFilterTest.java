package de.hbt.pwr.filters;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Which paths count as normalized (#260)
 */
class NormalizedPathFilterTest {

    @Test
    void normalPathsAreNormalized() {
        assertThat(NormalizedPathFilter.isNormalized("/pwr-profile-service/profile/abc/fullProfile")).isTrue();
        assertThat(NormalizedPathFilter.isNormalized("/pwr-profile-service/admin/consultants/")).isTrue();
        assertThat(NormalizedPathFilter.isNormalized("/pwr-view-profile-service/view/abc/view/1/parent/C%23")).isTrue();
        assertThat(NormalizedPathFilter.isNormalized("/pwr-view-profile-service/view/abc/view/1/parent/.NET")).isTrue();
        assertThat(NormalizedPathFilter.isNormalized("/pwr-view-profile-service/view/abc/view/1/parent/a%20b")).isTrue();
        assertThat(NormalizedPathFilter.isNormalized("/pwr-view-profile-service/view/abc/view/1/parent/%C3%84rzte")).isTrue();
        assertThat(NormalizedPathFilter.isNormalized("/")).isTrue();
        assertThat(NormalizedPathFilter.isNormalized("")).isTrue();
    }

    @Test
    void dotSegmentsAreNotNormalized() {
        assertThat(NormalizedPathFilter.isNormalized("/a/../admin")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/./admin")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/..")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/%2e%2e/admin")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/%2E./admin")).isFalse();
    }

    @Test
    void emptySegmentsParametersAndEncodedSeparatorsAreNotNormalized() {
        assertThat(NormalizedPathFilter.isNormalized("/a//admin")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/admin;x")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/admin%3Bx")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a%2fadmin")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a%5Cadmin")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a\\admin")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/%252e%252e/admin")).isFalse();
    }

    @Test
    void encodedCharactersThatNeedNoEncodingAreNotNormalized() {
        assertThat(NormalizedPathFilter.isNormalized("/a/%61dmin")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/%41DMIN")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/adm%69n")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/%5a")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/%7A")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/%30")).isFalse();
        assertThat(NormalizedPathFilter.isNormalized("/a/%2d%5f%7e")).isFalse();
    }
}
