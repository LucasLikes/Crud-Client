package com.lume.lumeapi.domain.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "customers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(unique = true, nullable = false, length = 11) private String cpf;
    @Embedded private Address address;
}