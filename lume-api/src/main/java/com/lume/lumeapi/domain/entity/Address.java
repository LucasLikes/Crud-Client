package com.lume.lumeapi.domain.entity;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Address {
    private String street, neighborhood, city, state, zipCode;
}