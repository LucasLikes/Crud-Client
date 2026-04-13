package com.lume.lumeapi.integration.cep;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Cliente HTTP para o ViaCEP.
 *
 * Resiliência implementada:
 *   - Try/catch em torno da chamada HTTP — erros de rede ou timeout não
 *     propagam como 500 para o cliente; retorna um ViaCepResponse parcial
 *     com apenas o zipCode preenchido.
 *   - O RestTemplate deve ser configurado com timeout no BeanConfig
 *     (connect/read timeout de 3s) para evitar threads presas em chamadas lentas.
 *   - O log.warn() registra o CEP e a mensagem de erro para rastreabilidade
 *     sem expor stack trace no response do cliente.
 *
 * Comportamento do fallback:
 *   Quando o ViaCEP está indisponível, o endereço é retornado com campos
 *   null exceto o zipCode. O caller (CepService) pode checar se os campos
 *   essenciais estão preenchidos e exibir mensagem adequada ao usuário.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ViaCepClient {

    private final RestTemplate restTemplate;

    private static final String URL = "https://viacep.com.br/ws/{cep}/json/";

    /**
     * Busca o endereço para o CEP fornecido.
     *
     * @param cep CEP com ou sem formatação — dígitos extraídos internamente.
     * @return ViaCepResponse preenchido, ou um response parcial (só zipCode)
     *         se o ViaCEP estiver indisponível ou retornar erro.
     */
    public ViaCepResponse fetchAddress(String cep) {
        var digits = cep.replaceAll("[^0-9]", "");
        try {
            var response = restTemplate.getForObject(URL, ViaCepResponse.class, digits);

            // ViaCEP retorna { "erro": true } para CEPs inexistentes — JSON válido mas sem campos
            if (response == null || isErrorResponse(response)) {
                log.warn("ViaCEP returned empty/error response for cep={}", digits);
                return fallback(digits);
            }

            return response;

        } catch (RestClientException ex) {
            // Cobre: timeout, connection refused, DNS failure, HTTP 4xx/5xx
            log.warn("ViaCEP unavailable for cep={}: {}", digits, ex.getMessage());
            return fallback(digits);
        }
    }

    /**
     * Response parcial usado quando o ViaCEP não responde.
     * Apenas o zipCode é preenchido para que o caller possa exibir o CEP
     * digitado pelo usuário mesmo sem os demais campos de endereço.
     */
    private ViaCepResponse fallback(String digits) {
        return new ViaCepResponse(null, null, null, null, digits);
    }

    /**
     * Detecta o payload de erro do ViaCEP: {@code { "erro": true }}.
     * Nesse caso todos os campos de endereço são null no objeto deserializado.
     */
    private boolean isErrorResponse(ViaCepResponse response) {
        return response.street() == null
                && response.neighborhood() == null
                && response.city() == null
                && response.state() == null;
    }
}
