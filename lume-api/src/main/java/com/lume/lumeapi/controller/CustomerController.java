package com.lume.lumeapi.controller;

import com.lume.lumeapi.domain.dto.request.CustomerRequest;
import com.lume.lumeapi.domain.dto.response.CustomerResponse;
import com.lume.lumeapi.service.CepService;
import com.lume.lumeapi.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "CRUD operations for customers")
@SecurityRequirement(name = "bearerAuth")
public class CustomerController {

    private final CustomerService customerService;
    private final CepService      cepService;

    // ── ADMIN-ONLY mutations ──────────────────────────────────────────────────

    /**
     * Creates a new customer.
     * Restricted to ROLE_ADMIN — regular users receive 403 Forbidden.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new customer — admin only")
    public CustomerResponse create(@Valid @RequestBody CustomerRequest request) {
        return customerService.create(request);
    }

    /**
     * Updates an existing customer.
     * Restricted to ROLE_ADMIN — regular users receive 403 Forbidden.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a customer — admin only")
    public CustomerResponse update(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        return customerService.update(id, request);
    }

    /**
     * Deletes a customer.
     * Restricted to ROLE_ADMIN — regular users receive 403 Forbidden.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a customer — admin only")
    public void delete(@PathVariable Long id) {
        customerService.delete(id);
    }

    // ── READ-ONLY (all authenticated users) ───────────────────────────────────

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public CustomerResponse findById(@PathVariable Long id) {
        return customerService.findById(id);
    }

    @GetMapping
    @Operation(summary = "List all customers")
    public List<CustomerResponse> findAll() {
        return customerService.findAll();
    }

    @GetMapping("/address-lookup/{zipCode}")
    @Operation(summary = "Lookup address by ZIP code via ViaCEP")
    public CustomerResponse.AddressResponse addressLookup(@PathVariable String zipCode) {
        return cepService.lookupAddress(zipCode);
    }
}
