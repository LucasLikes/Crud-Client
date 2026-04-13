package com.lume.lumeapi.domain.dto.response;
import com.lume.lumeapi.domain.entity.Customer;

public record CustomerResponse(Long id, String name, String cpf, AddressResponse address) {
    public record AddressResponse(String street, String neighborhood, String city, String state, String zipCode) {}
    public static CustomerResponse from(Customer c) {
        var a = c.getAddress();
        return new CustomerResponse(c.getId(), c.getName(), c.getCpf(),
                a == null ? null : new AddressResponse(a.getStreet(), a.getNeighborhood(), a.getCity(), a.getState(), a.getZipCode()));
    }
}