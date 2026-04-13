package com.lume.lumeapi.service;

import com.lume.lumeapi.domain.dto.response.CustomerResponse;
import com.lume.lumeapi.integration.cep.ViaCepClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Serviço de consulta de endereço por CEP.
 *
 * Trata o fallback parcial do ViaCepClient:
 *   - Se os campos essenciais (street, city, state) forem null, o response
 *     ainda é retornado com os campos disponíveis (zipCode no mínimo).
 *   - O frontend interpreta campos null como "não encontrado" e exibe
 *     mensagem adequada ao usuário sem travar o fluxo de cadastro.
 *
 * Não lança exceção quando o ViaCEP está indisponível — a decisão de
 * bloquear ou permitir o cadastro sem endereço completo é do chamador.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CepService {

    private final ViaCepClient viaCepClient;

    public CustomerResponse.AddressResponse lookupAddress(String zipCode) {
        var response = viaCepClient.fetchAddress(zipCode);

        if (response.street() == null) {
            log.info("Address lookup returned partial result for zipCode={}", zipCode);
        }

        return new CustomerResponse.AddressResponse(
                response.street(),
                response.neighborhood(),
                response.city(),
                response.state(),
                response.zipCode() != null ? response.zipCode() : zipCode
        );
    }
}
