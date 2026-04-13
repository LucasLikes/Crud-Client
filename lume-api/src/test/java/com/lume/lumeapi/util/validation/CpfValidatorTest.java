package com.lume.lumeapi.util.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("CpfValidator — unit tests")
class CpfValidatorTest {

    private CpfValidator validator;

    @BeforeEach
    void setUp() {
        validator = new CpfValidator();
    }

    // ── valid CPFs ─────────────────────────────────────────────────────────────

    @ParameterizedTest(name = "valid: {0}")
    @ValueSource(strings = {
        "529.982.247-25",   // formatted
        "52998224725",      // digits only
        "71428793860",
        "11144477735",
        "87748248800"
    })
    @DisplayName("accepts valid CPFs with or without formatting")
    void validCpfs(String cpf) {
        assertThat(validator.isValid(cpf, null)).isTrue();
    }

    // ── invalid CPFs ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("rejects null")
    void nullValue() {
        assertThat(validator.isValid(null, null)).isFalse();
    }

    @Test
    @DisplayName("rejects empty string")
    void emptyString() {
        assertThat(validator.isValid("", null)).isFalse();
    }

    @ParameterizedTest(name = "all-same: {0}")
    @ValueSource(strings = {
        "00000000000", "11111111111", "22222222222",
        "33333333333", "44444444444", "55555555555",
        "66666666666", "77777777777", "88888888888", "99999999999"
    })
    @DisplayName("rejects CPFs with all identical digits")
    void allSameDigits(String cpf) {
        assertThat(validator.isValid(cpf, null)).isFalse();
    }

    @Test
    @DisplayName("rejects CPF with wrong first check digit")
    void wrongFirstCheckDigit() {
        // 52998224725 is valid; changing last 2 digits makes it invalid
        assertThat(validator.isValid("52998224700", null)).isFalse();
    }

    @Test
    @DisplayName("rejects CPF with wrong second check digit")
    void wrongSecondCheckDigit() {
        assertThat(validator.isValid("52998224724", null)).isFalse();
    }

    @Test
    @DisplayName("rejects CPF with fewer than 11 digits")
    void tooShort() {
        assertThat(validator.isValid("1234567890", null)).isFalse();
    }

    @Test
    @DisplayName("rejects CPF with more than 11 digits")
    void tooLong() {
        assertThat(validator.isValid("529982247250", null)).isFalse();
    }

    @Test
    @DisplayName("rejects string with only letters")
    void onlyLetters() {
        assertThat(validator.isValid("ABCDEFGHIJK", null)).isFalse();
    }
}
