package com.lume.lumeapi.service;

import com.lume.lumeapi.domain.dto.response.CustomerResponse;
import com.lume.lumeapi.integration.cep.ViaCepClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CepService {

    private final ViaCepClient viaCepClient;

    public CustomerResponse.AddressResponse lookupAddress(String zipCode) {
        var response = viaCepClient.fetchAddress(zipCode);
        return new CustomerResponse.AddressResponse(
                response.street(),
                response.neighborhood(),
                response.city(),
                response.state(),
                response.zipCode()
        );
    }
}