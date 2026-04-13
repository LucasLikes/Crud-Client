package com.lume.lumeapi.service;

import com.lume.lumeapi.domain.dto.request.CustomerRequest;
import com.lume.lumeapi.domain.entity.Address;
import com.lume.lumeapi.domain.entity.Customer;
import com.lume.lumeapi.exception.CpfAlreadyExistsException;
import com.lume.lumeapi.exception.ResourceNotFoundException;
import com.lume.lumeapi.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerService — unit tests")
class CustomerServiceTest {

    @Mock CustomerRepository customerRepository;

    @InjectMocks CustomerService customerService;

    // ── fixtures ─────────────────────────────────────────────────────────────

    private static final String VALID_CPF  = "52998224725";  // CPF válido gerado algoritmicamente
    private static final String OTHER_CPF  = "71428793860";
    private static final Long   CUSTOMER_ID = 1L;

    private CustomerRequest.AddressRequest addressRequest() {
        return new CustomerRequest.AddressRequest(
                "Rua das Flores", "Centro", "São Paulo", "SP", "01310100"
        );
    }

    private CustomerRequest customerRequest(String cpf) {
        return new CustomerRequest("João Silva", cpf, addressRequest());
    }

    private Customer savedCustomer(Long id, String cpf) {
        var address = Address.builder()
                .street("Rua das Flores").neighborhood("Centro")
                .city("São Paulo").state("SP").zipCode("01310100")
                .build();
        return Customer.builder().id(id).name("João Silva").cpf(cpf).address(address).build();
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("create()")
    class Create {

        @Test
        @DisplayName("saves and returns response when CPF is unique")
        void success() {
            given(customerRepository.existsByCpf(VALID_CPF)).willReturn(false);
            given(customerRepository.save(any(Customer.class)))
                    .willReturn(savedCustomer(CUSTOMER_ID, VALID_CPF));

            var result = customerService.create(customerRequest(VALID_CPF));

            assertThat(result.id()).isEqualTo(CUSTOMER_ID);
            assertThat(result.cpf()).isEqualTo(VALID_CPF);
            then(customerRepository).should().save(any(Customer.class));
        }

        @Test
        @DisplayName("throws CpfAlreadyExistsException when CPF is duplicate")
        void duplicateCpf() {
            given(customerRepository.existsByCpf(VALID_CPF)).willReturn(true);

            assertThatThrownBy(() -> customerService.create(customerRequest(VALID_CPF)))
                    .isInstanceOf(CpfAlreadyExistsException.class)
                    .hasMessageContaining(VALID_CPF);

            then(customerRepository).should(never()).save(any());
        }

        @Test
        @DisplayName("maps address fields correctly from request to entity")
        void mapsAddressFields() {
            given(customerRepository.existsByCpf(VALID_CPF)).willReturn(false);
            given(customerRepository.save(any(Customer.class)))
                    .willAnswer(inv -> {
                        Customer c = inv.getArgument(0);
                        c = Customer.builder()
                                .id(1L).name(c.getName()).cpf(c.getCpf()).address(c.getAddress()).build();
                        return c;
                    });

            var result = customerService.create(customerRequest(VALID_CPF));

            assertThat(result.address().city()).isEqualTo("São Paulo");
            assertThat(result.address().state()).isEqualTo("SP");
            assertThat(result.address().zipCode()).isEqualTo("01310100");
        }
    }

    // ── findById ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("findById()")
    class FindById {

        @Test
        @DisplayName("returns response when customer exists")
        void found() {
            given(customerRepository.findById(CUSTOMER_ID))
                    .willReturn(Optional.of(savedCustomer(CUSTOMER_ID, VALID_CPF)));

            var result = customerService.findById(CUSTOMER_ID);

            assertThat(result.id()).isEqualTo(CUSTOMER_ID);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when id does not exist")
        void notFound() {
            given(customerRepository.findById(CUSTOMER_ID)).willReturn(Optional.empty());

            assertThatThrownBy(() -> customerService.findById(CUSTOMER_ID))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining(String.valueOf(CUSTOMER_ID));
        }
    }

    // ── findAll ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("findAll()")
    class FindAll {

        @Test
        @DisplayName("returns all customers from repository")
        void returnsAll() {
            given(customerRepository.findAll()).willReturn(List.of(
                    savedCustomer(1L, VALID_CPF),
                    savedCustomer(2L, OTHER_CPF)
            ));

            var result = customerService.findAll();

            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("returns empty list when no customers exist")
        void emptyList() {
            given(customerRepository.findAll()).willReturn(List.of());

            assertThat(customerService.findAll()).isEmpty();
        }
    }

    // ── update ────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("update()")
    class Update {

        @Test
        @DisplayName("saves updated customer when CPF belongs to same id")
        void success() {
            given(customerRepository.findById(CUSTOMER_ID))
                    .willReturn(Optional.of(savedCustomer(CUSTOMER_ID, VALID_CPF)));
            given(customerRepository.existsByCpfAndIdNot(VALID_CPF, CUSTOMER_ID)).willReturn(false);
            given(customerRepository.save(any(Customer.class)))
                    .willAnswer(inv -> inv.getArgument(0));

            var result = customerService.update(CUSTOMER_ID, customerRequest(VALID_CPF));

            assertThat(result.cpf()).isEqualTo(VALID_CPF);
            then(customerRepository).should().save(any(Customer.class));
        }

        @Test
        @DisplayName("throws CpfAlreadyExistsException when CPF belongs to another customer")
        void cpfBelongsToAnotherId() {
            given(customerRepository.findById(CUSTOMER_ID))
                    .willReturn(Optional.of(savedCustomer(CUSTOMER_ID, OTHER_CPF)));
            given(customerRepository.existsByCpfAndIdNot(VALID_CPF, CUSTOMER_ID)).willReturn(true);

            assertThatThrownBy(() -> customerService.update(CUSTOMER_ID, customerRequest(VALID_CPF)))
                    .isInstanceOf(CpfAlreadyExistsException.class)
                    .hasMessageContaining(VALID_CPF);

            then(customerRepository).should(never()).save(any());
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when customer does not exist")
        void notFound() {
            given(customerRepository.findById(CUSTOMER_ID)).willReturn(Optional.empty());

            assertThatThrownBy(() -> customerService.update(CUSTOMER_ID, customerRequest(VALID_CPF)))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // ── delete ────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("calls deleteById when customer exists")
        void success() {
            given(customerRepository.existsById(CUSTOMER_ID)).willReturn(true);

            customerService.delete(CUSTOMER_ID);

            then(customerRepository).should().deleteById(CUSTOMER_ID);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when customer does not exist")
        void notFound() {
            given(customerRepository.existsById(CUSTOMER_ID)).willReturn(false);

            assertThatThrownBy(() -> customerService.delete(CUSTOMER_ID))
                    .isInstanceOf(ResourceNotFoundException.class);

            then(customerRepository).should(never()).deleteById(any());
        }
    }
}
