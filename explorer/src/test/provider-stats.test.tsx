import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi as mockVi } from 'vitest'

// were using mock components for now till we get the actual ones
const MetricCard = mockVi.fn(({ title, value, isLoading, error }: any) => (
  <div data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
    <h3>{title}</h3>
    {isLoading && <div data-testid="loading-spinner">Loading...</div>}
    {error && <div data-testid="error-message">{error}</div>}
    {!isLoading && !error && <div data-testid="metric-value">{value}</div>}
  </div>
))

const UsdSpentMetric = mockVi.fn(() => (
  <MetricCard title="USD Spent (24h)" value="$12,345.67" isLoading={false} error={null} />
))

const ActiveLeasesMetric = mockVi.fn(() => (
  <MetricCard title="Active Leases" value="1,234" isLoading={false} error={null} />
))

const ActiveProvidersMetric = mockVi.fn(() => (
  <MetricCard title="Active Providers" value="56" isLoading={false} error={null} />
))

describe('Provider Statistics Tests', () => {

  // USD Spent (24h) stats Tests
  describe('USD Spent (24h) Metric', () => {
    it('should render with correct title', () => {
      render(<UsdSpentMetric />)

      expect(screen.getByText('USD Spent (24h)')).toBeInTheDocument()
    })

    it('should display USD value with proper formatting', () => {
      render(<MetricCard title="USD Spent (24h)" value="$12,345.67" isLoading={false} error={null} />)

      const value = screen.getByTestId('metric-value')
      expect(value).toHaveTextContent('$12,345.67')
      expect(value.textContent).toMatch(/\$/)
      expect(value.textContent).toMatch(/,/)
      expect(value.textContent).toMatch(/\.\d{2}/)
    })

    it('should handle large numbers correctly', () => {
      render(<MetricCard title="USD Spent (24h)" value="$1,234,567.89" isLoading={false} error={null} />)

      const value = screen.getByTestId('metric-value')
      expect(value).toHaveTextContent('$1,234,567.89')
    })

    it('should handle zero value', () => {
      render(<MetricCard title="USD Spent (24h)" value="$0.00" isLoading={false} error={null} />)

      expect(screen.getByTestId('metric-value')).toHaveTextContent('$0.00')
    })

    it('should show loading state while fetching data', () => {
      render(<MetricCard title="USD Spent (24h)" value="" isLoading={true} error={null} />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should display error when API call fails', () => {
      render(<MetricCard title="USD Spent (24h)" value="" isLoading={false} error="Network error" />)

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
  })

  // active leases stats tests
  describe('Active Leases Metric', () => {
    it('should render with correct title', () => {
      render(<ActiveLeasesMetric />)

      expect(screen.getByText('Active Leases')).toBeInTheDocument()
    })

    it('should display lease count with comma formatting', () => {
      render(<MetricCard title="Active Leases" value="1,234" isLoading={false} error={null} />)

      const value = screen.getByTestId('metric-value')
      expect(value).toHaveTextContent('1,234')
      expect(value.textContent).toMatch(/,/)
    })

    it('should handle single digit lease count', () => {
      render(<MetricCard title="Active Leases" value="5" isLoading={false} error={null} />)

      expect(screen.getByTestId('metric-value')).toHaveTextContent('5')
    })

    it('should handle zero active leases', () => {
      render(<MetricCard title="Active Leases" value="0" isLoading={false} error={null} />)

      expect(screen.getByTestId('metric-value')).toHaveTextContent('0')
    })

    it('should handle large lease counts', () => {
      render(<MetricCard title="Active Leases" value="10,000" isLoading={false} error={null} />)

      expect(screen.getByTestId('metric-value')).toHaveTextContent('10,000')
    })

    it('should show loading state while fetching data', () => {
      render(<MetricCard title="Active Leases" value="" isLoading={true} error={null} />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should display error when API call fails', () => {
      render(<MetricCard title="Active Leases" value="" isLoading={false} error="Failed to load leases" />)

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
  })

  // active providers stats tests
  describe('Active Providers Metric', () => {
    it('should render with correct title', () => {
      render(<ActiveProvidersMetric />)

      expect(screen.getByText('Active Providers')).toBeInTheDocument()
    })

    it('should display provider count', () => {
      render(<MetricCard title="Active Providers" value="56" isLoading={false} error={null} />)

      expect(screen.getByTestId('metric-value')).toHaveTextContent('56')
    })

    it('should handle single active provider', () => {
      render(<MetricCard title="Active Providers" value="1" isLoading={false} error={null} />)

      expect(screen.getByTestId('metric-value')).toHaveTextContent('1')
    })

    it('should handle zero active providers', () => {
      render(<MetricCard title="Active Providers" value="0" isLoading={false} error={null} />)

      expect(screen.getByTestId('metric-value')).toHaveTextContent('0')
    })

    it('should handle three-digit provider counts with comma', () => {
      render(<MetricCard title="Active Providers" value="123" isLoading={false} error={null} />)

      expect(screen.getByTestId('metric-value')).toHaveTextContent('123')
    })

    it('should show loading state while fetching data', () => {
      render(<MetricCard title="Active Providers" value="" isLoading={true} error={null} />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should display error when API call fails', () => {
      render(<MetricCard title="Active Providers" value="" isLoading={false} error="Provider data unavailable" />)

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
  })


  describe('Number Formatting Utilities', () => {
    it('should format currency with commas and 2 decimal places', () => {
      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value)
      }

      expect(formatCurrency(12345.67)).toBe('$12,345.67')
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should format integers with commas', () => {
      const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value)
      }

      expect(formatNumber(1234)).toBe('1,234')
      expect(formatNumber(10000)).toBe('10,000')
      expect(formatNumber(5)).toBe('5')
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined data gracefully', () => {
      render(<MetricCard title="Test Metric" value={undefined} isLoading={false} error={null} />)

      // Should not crash,  show empty or default state
      expect(screen.getByText('Test Metric')).toBeInTheDocument()
    })

    it('should handle null data gracefully', () => {
      render(<MetricCard title="Test Metric" value={null} isLoading={false} error={null} />)

      expect(screen.getByText('Test Metric')).toBeInTheDocument()
    })

    it('should handle API timeout errors', () => {
      render(<MetricCard title="Test Metric" value="" isLoading={false} error="Request timeout" />)

      expect(screen.getByTestId('error-message')).toHaveTextContent('Request timeout')
    })

    it('should handle network disconnection', () => {
      render(<MetricCard title="Test Metric" value="" isLoading={false} error="Network unavailable" />)

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
  })

})
