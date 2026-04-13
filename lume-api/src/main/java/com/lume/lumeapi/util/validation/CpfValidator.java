package com.lume.lumeapi.util.validation;
import jakarta.validation.*;

public class CpfValidator implements ConstraintValidator<ValidCpf, String> {
    public boolean isValid(String cpf, ConstraintValidatorContext ctx) {
        if (cpf == null) return false;
        String d = cpf.replaceAll("[^0-9]", "");
        if (d.length() != 11 || d.chars().distinct().count() == 1) return false;
        int s = 0;
        for (int i = 0; i < 9; i++) s += (d.charAt(i)-'0') * (10-i);
        int f = 11 - (s % 11); if (f >= 10) f = 0;
        if (f != d.charAt(9)-'0') return false;
        s = 0;
        for (int i = 0; i < 10; i++) s += (d.charAt(i)-'0') * (11-i);
        int g = 11 - (s % 11); if (g >= 10) g = 0;
        return g == d.charAt(10)-'0';
    }
}