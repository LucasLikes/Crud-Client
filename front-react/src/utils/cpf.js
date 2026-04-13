export function sanitizeDigits(value) {
  return value.replace(/\D/g, '')
}

export function formatCpf(value) {
  const digits = sanitizeDigits(value).slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function isValidCpf(value) {
  const cpf = sanitizeDigits(value)

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false
  }

  const calcDigit = (base) => {
    let sum = 0
    for (let i = 0; i < base.length; i += 1) {
      sum += Number(base[i]) * (base.length + 1 - i)
    }
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  const firstDigit = calcDigit(cpf.slice(0, 9))
  const secondDigit = calcDigit(cpf.slice(0, 10))

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10])
}
