# 🧪 Testing the Refactored CustomersPage

## Quick Start

```bash
# 1. Start the dev server
npm run dev

# 2. Open in browser
http://localhost:5174

# 3. Login with any credentials
# (or use ?mock=true for mock mode)
# Email: any@mail.com
# Password: any123
```

---

## Test Scenarios

### ✅ Test 1: View Empty State (First Load)

**Steps:**
1. Login to the app
2. Go to Customers page
3. Observe the UI

**Expected Result:**
- Loading spinner shows for ~1 second
- Empty state displays: "Nenhum cliente cadastrado 📋"
- Success message: "Clientes carregados com sucesso!"
- Two Cards visible: "Novo Cliente" (left) and "Lista de Clientes" (right)
- No errors in console

**Architecture Validation:**
- ✅ useCustomers hook called fetchCustomers on mount
- ✅ Spinner component rendering
- ✅ EmptyState component rendering
- ✅ Card components with titles
- ✅ Alert feedback showing success

---

### ✅ Test 2: Create New Customer

**Steps:**
1. In "Novo Cliente" form, enter:
   - Name: "João Paulo"
   - Email: "joao.paulo@mail.com"
   - Phone: "(11) 98765-4321"
   - City: "São Paulo"
2. Click "Cadastrar" button
3. Observe page updates

**Expected Result:**
- Form submits
- Button shows loading spinner + "Cadastrando"
- Success alert appears: "Cliente criado com sucesso!"
- Form clears
- Table updates with new customer (appears below existing)
- After 4 seconds, success alert auto-dismisses

**Architecture Validation:**
- ✅ useCustomers hook called createNew method
- ✅ Button component isLoading prop shows spinner
- ✅ Alert component auto-dismisses after 4000ms
- ✅ CustomerTable renders with fresh data
- ✅ No window.alert() used

---

### ✅ Test 3: Edit Customer

**Steps:**
1. Click "Edit" button on any customer row
2. Observe form updates
3. Change customer name (e.g., "João Paulo Silva")
4. Click "Atualizar" button
5. Observe page updates

**Expected Result:**
- Form card title changes to "Editar Cliente"
- Form fills with customer data
- Submit button changes to "Atualizar"
- Cancel button appears
- After edit, success alert: "Cliente atualizado com sucesso!"
- Form clears and title goes back to "Novo Cliente"
- Table shows updated customer

**Architecture Validation:**
- ✅ useCustomers hook called updateExisting method
- ✅ selectedCustomer state managed correctly
- ✅ Form receives initialValues prop
- ✅ Cancel button works (resets selectedCustomer to null)
- ✅ Proper form labeling in UI

---

### ✅ Test 4: Delete Customer (Modal Flow)

**Steps:**
1. Click "Delete" button on any customer
2. Observe ConfirmDialog modal appears
3. Click "Cancelar" on modal
4. Modal closes, data unchanged

**Expected Result:**
- ConfirmDialog modal slides in with scaleIn animation
- Backdrop (dark overlay) visible
- Title: "Remover Cliente"
- Message shows customer name
- Two buttons: "Cancelar" and "Remover"
- Modal closes on cancel
- No data changes

**Repeat then confirm delete:**
1. Click "Delete" again
2. Click "Remover" button
3. Observe modal during deletion

**Expected Result:**
- Button shows loading spinner during deletion
- After success: modal closes
- Success alert: "Cliente removido com sucesso!"
- Table updates WITHOUT the deleted customer
- Alert auto-dismisses after 4 seconds

**Architecture Validation:**
- ✅ ConfirmDialog component with backdrop
- ✅ Modal animations working (scaleIn)
- ✅ deleteConfirm state managing modal open/close
- ✅ useCustomers hook called remove method
- ✅ Customer name shown in confirmation message
- ✅ isLoading state prevents double-click
- ✅ No window.confirm() used

---

### ✅ Test 5: Error Handling

**Steps:**
1. Open DevTools (F12) → Network tab
2. Take network offline (DevTools → Offline)
3. Try to create a new customer
4. Observe error handling

**Expected Result:**
- Button shows loading then stops
- Error alert appears in red
- Message: "Não foi possível..." or network error
- Table and form remain interactive (can retry)
- DevTools console shows logger.error() calls
- No console errors (only intentional error logs)

**Architecture Validation:**
- ✅ useCustomers hook error handling
- ✅ Alert component error variant (red)
- ✅ Logging system catches errors
- ✅ UI remains usable after error

---

### ✅ Test 6: Loading States

**Steps:**
1. Open DevTools → Network tab
2. Throttle to "Slow 3G" speed
3. Refresh page or go back to Customers page
4. Observe Spinner during load

**Expected Result:**
- Spinner displays: "Carregando clientes..."
- Takes longer to show table (simulating slow connection)
- After loading: Spinner disappears, table appears
- All UI responsive, no frozen state

**Architecture Validation:**
- ✅ Spinner component rendering
- ✅ isLoading state controlling UI
- ✅ No hanging/frozen UI

---

### ✅ Test 7: Responsive Design (Mobile)

**Steps:**
1. DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Set to mobile view (375px width)
3. Interact with all features

**Expected Result:**
- Grid changes to single column (form above table)
- Modal still works on mobile
- ConfirmDialog responsive
- Form is mobile-friendly
- No horizontal scrolling

**Architecture Validation:**
- ✅ CustomersPage.module.css: @media (max-width: 1024px)
- ✅ ConfirmDialog.module.css: @media (max-width: 600px)
- ✅ All components responsive

---

### ✅ Test 8: Console Logging

**Steps:**
1. Open DevTools → Console
2. Perform operations (load, create, edit, delete)
3. Observe colored logs

**Expected Result:**
- Logs show operation flow:
  ```
  ℹ️ [INFO] CustomersPage montado
  📋 [INFO] Buscando clientes...
  ✅ [SUCCESS] Clientes carregados: 3 items
  ✨ [INFO] Formulário submetido: {...}
  📤 [REQUEST] POST /api/customers
  ✅ [SUCCESS] 201: Cliente criado
  ❌ [ERROR] Error on operation: message
  ```
- No errors unless intentional

**Architecture Validation:**
- ✅ Logger utility integrated
- ✅ useCustomers logging all operations
- ✅ Request/response logging via httpClient

---

## Component Integration Checklist

- [ ] **useCustomers Hook**
  - [ ] fetchCustomers() works
  - [ ] createNew() works
  - [ ] updateExisting() works
  - [ ] remove() works
  - [ ] clearMessages() works
  - [ ] All state vars (customers, isLoading, error, success, isSubmitting) updating

- [ ] **Button Component**
  - [ ] variant="primary" renders correctly
  - [ ] variant="ghost" (logout) works
  - [ ] variant="danger" (delete) color is red
  - [ ] isLoading prop shows spinner
  - [ ] disabled prop prevents clicks

- [ ] **Card Component**
  - [ ] "Novo Cliente" card renders
  - [ ] "Lista de Clientes" card renders
  - [ ] Title displays
  - [ ] Children render correctly

- [ ] **Alert Component**
  - [ ] type="success" is green
  - [ ] type="error" is red
  - [ ] autoClose=4000 works (auto-dismisses)
  - [ ] Close button (X) works
  - [ ] Multiple alerts show in order

- [ ] **Spinner Component**
  - [ ] Shows during loading
  - [ ] Message displays
  - [ ] Animation smooth

- [ ] **EmptyState Component**
  - [ ] Shows when customers.length === 0
  - [ ] Icon and title display
  - [ ] Message display

- [ ] **ConfirmDialog Component**
  - [ ] Modal appears on delete click
  - [ ] Backdrop visible
  - [ ] Close on backdrop click
  - [ ] Confirm and Cancel buttons work
  - [ ] scaleIn animation

---

## Performance Testing

### Render Count
```js
// In React DevTools Profiler:
// Record while performing operations
// Expected: Minimal re-renders
```

### Bundle Size
```bash
npm run build
# Check dist/ folder size
# Should be < 500KB (compressed)
```

### Lighthouse Audit
```
DevTools → Lighthouse → Analyze page load
Expected: 
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
```

---

## Network Inspection

### Test with Mock Mode

```bash
http://localhost:5174?mock=true
```

**Expected behavior:**
- All CRUD operations work without backend
- Network tab shows no /api/customers calls
- Logs show "🎭 MODO MOCK ATIVADO"

### Test with Real Backend

```bash
# Make sure backend is running
docker-compose up

# Normal access (without ?mock=true)
http://localhost:5174
```

**Expected behavior:**
- Network tab shows actual API calls
- Bearer token in Authorization header
- Logs show real responses

---

## Known Issues

### If Spinner doesn't disappear
- Check useCustomers hook: setIsLoading(false) in finally
- Check console for network errors

### If Modal doesn't appear
- Check ConfirmDialog component import
- Check deleteConfirm.isOpen state

### If Button spinner doesn't show during delete
- Check ConfirmDialog passes isLoading prop
- Check state update in handleConfirmDelete

### If Design system colors don't apply
- Check src/index.css has CSS variables
- Check browser cache (Ctrl+Shift+Delete)

---

## Browser DevTools Commands

```javascript
// Test Bearer token visibility in logs
window.testBearerToken?.()

// Logout and clear auth
JSON.parse(localStorage.getItem('auth'))

// Simulate slow network
// DevTools → Network → Throttling
```

---

## Acceptance Criteria

✅ All test scenarios pass
✅ No console errors
✅ All components render
✅ All CRUD operations work
✅ Error handling works
✅ Loading states show
✅ Modal confirmations work
✅ Responsive on mobile
✅ Logging captures activity
✅ Performance is acceptable

---

## Debug Mode

To enable verbose logging:

```javascript
// In browser console
window.DEBUG = true
// Then perform operations
```

---

**Last Updated**: Current Session
**Status**: Ready for testing
