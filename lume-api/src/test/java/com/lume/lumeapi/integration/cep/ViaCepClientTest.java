package com.lume.lumeapi.integration.cep;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ViaCepClient — unit tests")
class ViaCepClientTest {

    @Mock RestTemplate restTemplate;

    private ViaCepClient viaCepClient;

    @BeforeEach
    void setUp() {
        viaCepClient = new ViaCepClient(restTemplate);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private ViaCepResponse validResponse() {
        return new ViaCepResponse(
                "Avenida Paulista", "Bela Vista", "São Paulo", "SP", "01310-100"
        );
    }

    // ── happy path ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("returns populated response when ViaCEP responds successfully")
    void success() {
        given(restTemplate.getForObject(anyString(), eq(ViaCepResponse.class), anyString()))
                .willReturn(validResponse());

        var result = viaCepClient.fetchAddress("01310100");

        assertThat(result.street()).isEqualTo("Avenida Paulista");
        assertThat(result.city()).isEqualTo("São Paulo");
        assertThat(result.state()).isEqualTo("SP");
    }

    @Test
    @DisplayName("strips formatting from CEP before sending to ViaCEP")
    void stripsFormatting() {
        given(restTemplate.getForObject(anyString(), eq(ViaCepResponse.class), eq("01310100")))
                .willReturn(validResponse());

        viaCepClient.fetchAddress("01310-100");

        then(restTemplate).should().getForObject(anyString(), eq(ViaCepResponse.class), eq("01310100"));
    }

    // ── fallback scenarios ─────────────────────────────────────────────────────

    @Test
    @DisplayName("returns partial fallback (zipCode only) when RestTemplate throws")
    void networkError() {
        given(restTemplate.getForObject(anyString(), eq(ViaCepResponse.class), anyString()))
                .willThrow(new ResourceAccessException("Connection refused"));

        var result = viaCepClient.fetchAddress("01310100");

        assertThat(result.zipCode()).isEqualTo("01310100");
        assertThat(result.street()).isNull();
        assertThat(result.city()).isNull();
    }

    @Test
    @DisplayName("does not throw when ViaCEP is unavailable")
    void noExceptionOnNetworkError() {
        given(restTemplate.getForObject(anyString(), eq(ViaCepResponse.class), anyString()))
                .willThrow(new ResourceAccessException("timeout"));

        assertThatNoException().isThrownBy(() -> viaCepClient.fetchAddress("01310100"));
    }

    @Test
    @DisplayName("returns partial fallback when ViaCEP returns null (unexpected)")
    void nullResponse() {
        given(restTemplate.getForObject(anyString(), eq(ViaCepResponse.class), anyString()))
                .willReturn(null);

        var result = viaCepClient.fetchAddress("01310100");

        assertThat(result.zipCode()).isEqualTo("01310100");
        assertThat(result.street()).isNull();
    }

    @Test
    @DisplayName("returns partial fallback for ViaCEP error payload {erro:true}")
    void viaCepErrorPayload() {
        // ViaCEP returns { "erro": true } → all fields null when deserialized
        given(restTemplate.getForObject(anyString(), eq(ViaCepResponse.class), anyString()))
                .willReturn(new ViaCepResponse(null, null, null, null, null));

        var result = viaCepClient.fetchAddress("99999999");

        assertThat(result.zipCode()).isEqualTo("99999999");
        assertThat(result.street()).isNull();
    }

    @Test
    @DisplayName("preserves formatted CEP in fallback when input was formatted")
    void preservesDigitsInFallback() {
        given(restTemplate.getForObject(anyString(), eq(ViaCepResponse.class), anyString()))
                .willThrow(new ResourceAccessException("timeout"));

        var result = viaCepClient.fetchAddress("01310-100");

        // digits extracted = "01310100"
        assertThat(result.zipCode()).isEqualTo("01310100");
    }
}
