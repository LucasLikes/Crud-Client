import { useState } from 'react'
import styles from './CustomerFilter.module.css'

export function CustomerFilter({
  onFilterChange,
  onSearch,
  isLoading = false,
}) {
  const [searchName, setSearchName] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterState, setFilterState] = useState('')

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchName(value)
    onSearch?.({
      name: value,
      city: filterCity,
      state: filterState,
    })
  }

  const handleCityChange = (e) => {
    const value = e.target.value
    setFilterCity(value)
    onFilterChange?.({
      name: searchName,
      city: value,
      state: filterState,
    })
  }

  const handleStateChange = (e) => {
    const value = e.target.value.toUpperCase()
    setFilterState(value)
    onFilterChange?.({
      name: searchName,
      city: filterCity,
      state: value,
    })
  }

  const handleReset = () => {
    setSearchName('')
    setFilterCity('')
    setFilterState('')
    onFilterChange?.({
      name: '',
      city: '',
      state: '',
    })
  }

  const hasActiveFilters = searchName || filterCity || filterState

  return (
    <div className={styles['customer-filter']}>
      <div className={styles['filter-container']}>
        {/* Search */}
        <div className={styles['search-group']}>
          <input
            type="text"
            placeholder="🔍 Pesquisar por nome..."
            value={searchName}
            onChange={handleSearchChange}
            disabled={isLoading}
            className={styles['search-input']}
          />
        </div>

        {/* Filters */}
        <div className={styles['filters-row']}>
          <div className={styles['filter-group']}>
            <label className={styles['filter-label']}>Cidade</label>
            <input
              type="text"
              placeholder="Filtrar por cidade"
              value={filterCity}
              onChange={handleCityChange}
              disabled={isLoading}
              className={styles['filter-input']}
            />
          </div>

          <div className={styles['filter-group']}>
            <label className={styles['filter-label']}>Estado</label>
            <input
              type="text"
              placeholder="UF"
              value={filterState}
              onChange={handleStateChange}
              disabled={isLoading}
              maxLength={2}
              className={styles['filter-input']}
            />
          </div>

          {hasActiveFilters && (
            <button
              className={styles['btn-reset']}
              onClick={handleReset}
              disabled={isLoading}
              title="Limpar filtros"
            >
              ✕ Limpar
            </button>
          )}
        </div>
      </div>

      {/* Resultado de filtros */}
      {hasActiveFilters && (
        <div className={styles['filter-stats']}>
          {searchName && <span>📝 Nome: "{searchName}"</span>}
          {filterCity && <span>🏙️ Cidade: "{filterCity}"</span>}
          {filterState && <span>📍 Estado: {filterState}</span>}
        </div>
      )}
    </div>
  )
}
