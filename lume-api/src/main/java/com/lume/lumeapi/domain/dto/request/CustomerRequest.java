package com.lume.lumeapi.domain.dto.request;
import com.lume.lumeapi.util.validation.ValidCpf;
import jakarta.validation.*;
import jakarta.validation.constraints.*;

public record CustomerRequest(
        @NotBlank String name,
        @NotBlank @ValidCpf String cpf,
        @NotNull @Valid AddressRequest address
) {
    public record AddressRequest(
            @NotBlank String street, @NotBlank String neighborhood,
            @NotBlank String city, @NotBlank String state,
            @NotBlank @Pattern(regexp = "\\d{5}-?\\d{3}") String zipCode
    ) {}
}