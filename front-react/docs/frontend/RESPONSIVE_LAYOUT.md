# 📱 Responsive Layout - Menu Drawer & Grid

## Overview

O layout foi implementado com responsividade total usando Context para sincronizar o estado do drawer com o layout principal. O menu não sobrepõe a grid em nenhuma situação - sempre ajusta o espaço.

---

## 🏗️ Arquitetura

### Context: DrawerContext
```jsx
// Compartilha estado do drawer com toda aplicação
{
  isExpanded: boolean,      // Drawer expandido (250px) ou colapsado (80px)
  toggleExpanded: fn        // Função para alternar estado
}
```

### Components

**Drawer.jsx**
- Consome DrawerContext
- Usa `isExpanded` para mostrar/ocultar texto
- Em mobile: usa backdrop overlay
- Em desktop: não usa overlay (fica ao lado)

**AppLayout.jsx**
- Consome DrawerContext
- Aplica classes CSS: `expanded` ou `collapsed`
- Main ajusta `margin-left` dinamicamente

---

## 📊 Responsividade

### Desktop (> 768px)

```
┌─────────────────────────────────────────├
│  Drawer        │                        │
│  (80px)        │    Main Content        │
│  ┌──────┐      │    (com margin-left)   │
│  │ 📊   │      │                        │
│  │ 🏠   │      │  Grid Layout           │
│  │ 👥   │      │  ├─ Card 1 │ Card 2   │
│  └──────┘      │                        │
│                │                        │
└─────────────────────────────────────────┤

Quando Drawer expande:
┌──────────────────────────────────────────┤
│ Drawer              │                    │
│ (250px)             │  Main Content      │
│ ┌──────────────┐    │  (com margin-left) │
│ │ 📊 Home      │    │                    │
│ │ 👥 Clientes  │    │  Grid Layout       │
│ │ ⚙️ Config    │    │                    │
│ └──────────────┘    │                    │
└──────────────────────────────────────────┤

✅ Grid NUNCA fica sob o drawer
✅ Transição suave
✅ Sem overlay
```

### Mobile (< 768px)

```
┌────────────────────────┤
│                        │
│   Main Content         │
│   (sem margin-left)    │
│                        │
│   Grid Layout          │
│                        │
└────────────────────────┤

Quando Drawer expande:
┌────────────────────────┤
│████████████████████████│ <- Backdrop overlay
│█ Drawer (250px)  ████ │
│█ ┌──────────────┐ ████ │
│█ │ 📊 Home      │ ████ │
│█ │ 👥 Clientes  │ ████ │
│█ │ ⚙️ Config    │ ████ │
│█ └──────────────┘ ████ │
│████████████████████████│

✅ Grid visível mas com overlay semitransparente
✅ Toque fora fecha drawer
✅ No menu nav, toque em item fecha drawer
```

---

## 🎯 Key Features

### 1. **Sem Sobreposição em Desktop**
- Main content sempre tem espaço
- Drawer desliza para o lado
- Não há overlay

```css
@media (min-width: 769px) {
  .app-main.collapsed {
    margin-left: 80px;      /* Drawer colapsado */
  }
  
  .app-main.expanded {
    margin-left: 250px;     /* Drawer expandido */
  }
}
```

### 2. **Overlay Apenas em Mobile**
- Main sem margens em mobile
- Backdrop escurece conteúdo
- Drawer flutua por cima

```css
@media (max-width: 768px) {
  .app-main {
    margin-left: 0 !important;
  }
  
  .drawer-backdrop {
    display: block;  /* Mostra overlay */
  }
}
```

### 3. **Transição Suave**
```css
transition: margin-left var(--transition-base) ease-out;
/* --transition-base: 250ms */
```

### 4. **Auto-collapse em Mobile**
```javascript
// Drawer.jsx
const handleNavigate = (path) => {
  navigate(path)
  if (window.innerWidth < 768) {
    toggleExpanded()  // Fecha drawer após navegar
  }
}
```

---

## 📁 Files Modified/Created

### Created
- `.../context/DrawerContext.jsx` - Context para estado do drawer
- `.../layout/Drawer.jsx` - Componente drawer com overlay
- `.../layout/AppLayout.jsx` - Wrapper com layout principal
- `.../layout/AppLayout.module.css` - CSS responsivo
- `.../layout/Drawer.module.css` - CSS drawer com media queries

### Modified
- `main.jsx` - Added DrawerProvider
- `App.jsx` - Wrapped pages with AppLayout

---

## 🧪 Testing Responsividade

### Desktop (DevTools > 769px)
1. Abrir http://localhost:5174/home
2. Clicar toggle arrow (◀) no drawer
3. **Esperar**: Grid se move para 250px à direita ✅
4. Clicar novo: Grid volta para 80px ✅
5. **Não deve haver overlay** ✅

### Mobile (DevTools < 768px, ex: 375px)
1. Abrir http://localhost:5174/home (em mobile view)
2. Menu começa COLAPSADO (width: 0)
3. Clicar toggle arrow
4. **Esperar**: Drawer expande por cima do conteúdo ✅
5. + dark overlay aparece ✅
6. Clicar overlay: fecha drawer ✅
7. Clicar item de menu: fecha drawer ✅
8. **Grid nunca tem margin-left em mobile** ✅

---

## 🔄 State Flow

```
User clicks toggle
    ↓
Drawer.toggleExpanded() → DrawerContext
    ↓
isExpanded state updates
    ↓
AppLayout consome context
    ↓
`expanded` ou `collapsed` class aplicado
    ↓
CSS margin-left muda (desktop) ou nada (mobile)
    ↓
Main content reposiciona suavemente
```

---

## 💡 Best Practices Aplicadas

✅ **DRY** - DrawerContext evita prop drilling  
✅ **KISS** - CSS media queries simples  
✅ **Responsive** - Duas estratégias (side panel + overlay)  
✅ **Accessible** - aria-labels, semantic HTML  
✅ **Performance** - `transition` em CSS (não JS)  
✅ **Mobile-First** - Começa pequeno, expande em desktop  

---

## 🎨 CSS Variables Used

```css
--transition-base: 250ms        /* Suave mas rápido */
--color-primary: #0B1F3B        /* Gradient drawer */
```

---

## 🚀 How to Use

### Componente já está pronto!

Apenas certifique-se que:

1. **DrawerProvider** envolve App em `main.jsx` ✅
2. **AppLayout** envolve cada página com conteúdo ✅
3. **Drawer** está dentro de AppLayout ✅

```jsx
// main.jsx
<DrawerProvider>
  <App />
</DrawerProvider>

// App.jsx
<AppLayout>
  <HomePage />
</AppLayout>

// HomePage
const HomePage = () => {
  return (
    <div>
      {/* Seu conteúdo aqui - nunca sobreposto */}
    </div>
  )
}
```

---

## 📊 Breakpoints

| Viewport | Drawer | Main | Overlay |
|----------|--------|------|---------|
| < 768px (Mobile) | Width 0-250px | margin-left: 0 | ✅ Yes |
| ≥ 769px (Desktop) | Width 80-250px | margin-left: 80-250px | ❌ No |

---

## ✅ Checklist

- [x] Menu não sobrepõe grid em desktop
- [x] Grid não sofre margin em mobile
- [x] Transição suave ao expandir/colapsar
- [x] Overlay apenas em mobile
- [x] Context para sincronização
- [x] Responsive media queries
- [x] Auto-collapse em mobile após navegar
- [x] Acessibilidade (aria-labels)

---

**Status**: ✅ Pronto para usar
**Último Update**: Current Session
**Tested**: Desktop (1024px, 1440px) e Mobile (375px, 425px)
