package com.lume.lumeapi.integration.cep;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class ViaCepClient {

    private final RestTemplate restTemplate;
    private static final String URL = "https://viacep.com.br/ws/{cep}/json/";

    public ViaCepResponse fetchAddress(String cep) {
        return restTemplate.getForObject(URL, ViaCepResponse.class, cep.replaceAll("[^0-9]", ""));
    }
}