/**
 * Switch entre API Real e Mock
 * Para usar Mock: adicione ?mock=true à URL
 */

import { mockApi } from './mockApi'
import * as realAuthApi from './authApi'
import * as realCustomersApi from './customersApi'

const USE_MOCK = new URLSearchParams(window.location.search).get('mock') === 'true'

if (USE_MOCK) {
  console.log('%c🎭 MODO MOCK ATIVADO 🎭', 'color: red; font-size: 16px; font-weight: bold; background: yellow; padding: 10px')
  console.log('%cA API está simulada. Para usar API real, remova ?mock=true da URL', 'color: red; font-weight: bold')
}

export const authApi = USE_MOCK
  ? {
      login: mockApi.login,
      register: mockApi.register,
      refreshToken: mockApi.refreshToken,
      logout: mockApi.logout,
    }
  : realAuthApi

export const customersApi = USE_MOCK
  ? {
      createCustomer: mockApi.createCustomer,
      listCustomers: mockApi.listCustomers,
      getCustomerById: mockApi.getCustomerById,
      updateCustomer: mockApi.updateCustomer,
      deleteCustomer: mockApi.deleteCustomer,
      lookupAddress: mockApi.lookupAddress,
    }
  : realCustomersApi
