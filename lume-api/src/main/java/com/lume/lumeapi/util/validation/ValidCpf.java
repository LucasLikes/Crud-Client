package com.lume.lumeapi.util.validation;
import jakarta.validation.*;
import java.lang.annotation.*;

@Documented @Constraint(validatedBy = CpfValidator.class)
@Target(ElementType.FIELD) @Retention(RetentionPolicy.RUNTIME)
public @interface ValidCpf {
    String message() default "Invalid CPF";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}