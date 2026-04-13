function createMockJWT(email, role = 'ROLE_USER') {
  const payload = {
    email,
    sub: email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3_600_000,
  }
  const header         = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  const encodedPayload = btoa(JSON.stringify(payload))
  const signature      = 'MOCK_SIGNATURE_' + Math.random().toString(36).substring(2, 9)
  return `${header}.${encodedPayload}.${signature}`
}

function mockRefreshToken() {
  return 'refresh_token_mock_' + Math.random().toString(36).substring(2, 9)
}

export const mockApi = {
  login: async ({ email }) => {
    console.log('🎭 MOCK: Login com', email)
    // email contendo "admin" → ROLE_ADMIN, caso contrário ROLE_USER
    const role = email.toLowerCase().includes('admin') ? 'ROLE_ADMIN' : 'ROLE_USER'
    return {
      accessToken:  createMockJWT(email, role),
      refreshToken: mockRefreshToken(),
    }
  },

  register: async ({ email }) => {
    console.log('🎭 MOCK: Register', email)
    return { message: 'User registered successfully' }
  },

  refreshToken: async () => {
    return {
      accessToken:  createMockJWT('admin@lume.com', 'ROLE_ADMIN'),
      refreshToken: mockRefreshToken(),
    }
  },

  logout: async () => ({ message: 'Logged out successfully' }),

  listCustomers: async () => ([
    { id: 1, name: 'João Silva', cpf: '12345678909',
      address: { street: 'Rua A', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zipCode: '01000000' } },
    { id: 2, name: 'Maria Santos', cpf: '98765432100',
      address: { street: 'Av B', neighborhood: 'Bom Retiro', city: 'São Paulo', state: 'SP', zipCode: '01001000' } },
  ]),

  getCustomerById: async (id) => {
    const list = await mockApi.listCustomers()
    return list.find(c => c.id === Number(id))
  },

  createCustomer: async (payload) => ({ id: Math.floor(Math.random() * 1_000), ...payload }),
  updateCustomer: async (id, payload) => ({ id, ...payload }),
  deleteCustomer: async () => ({ message: 'Cliente removido' }),
  lookupAddress:  async (zipCode) => ({
    zipCode, street: 'Rua Mock', neighborhood: 'Bairro Mock', city: 'São Paulo', state: 'SP',
  }),
}