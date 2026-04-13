package com.lume.lumeapi.service;

import com.lume.lumeapi.domain.dto.request.CustomerRequest;
import com.lume.lumeapi.domain.dto.response.CustomerResponse;
import com.lume.lumeapi.domain.entity.Address;
import com.lume.lumeapi.domain.entity.Customer;
import com.lume.lumeapi.exception.CpfAlreadyExistsException;
import com.lume.lumeapi.exception.ResourceNotFoundException;
import com.lume.lumeapi.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (customerRepository.existsByCpf(request.cpf())) {
            throw new CpfAlreadyExistsException(request.cpf());
        }

        var customer = Customer.builder()
                .name(request.name())
                .cpf(request.cpf())
                .address(toAddress(request.address()))
                .build();

        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(Long id) {
        return customerRepository.findById(id)
                .map(CustomerResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> findAll() {
        return customerRepository.findAll()
                .stream()
                .map(CustomerResponse::from)
                .toList();
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        var customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));

        if (customerRepository.existsByCpfAndIdNot(request.cpf(), id)) {
            throw new CpfAlreadyExistsException(request.cpf());
        }

        customer.setName(request.name());
        customer.setCpf(request.cpf());
        customer.setAddress(toAddress(request.address()));

        return CustomerResponse.from(customerRepository.save(customer));
    }

    @Transactional
    public void delete(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer", id);
        }
        customerRepository.deleteById(id);
    }

    private Address toAddress(CustomerRequest.AddressRequest req) {
        return Address.builder()
                .street(req.street())
                .neighborhood(req.neighborhood())
                .city(req.city())
                .state(req.state())
                .zipCode(req.zipCode())
                .build();
    }
}