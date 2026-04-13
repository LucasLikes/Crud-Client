package com.lume.lumeapi.exception;

public class CpfAlreadyExistsException extends RuntimeException {
    public CpfAlreadyExistsException(String cpf) {
        super("CPF already exists: " + cpf);
    }
}
