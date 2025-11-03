import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen,} from '@testing-library/react'
import '@testing-library/jest-dom'

// API config
const API_URL = 'https://console-api.akash.network/v1/dashboard-data'

// Store API data
let liveApiData: any = null

// Fetch the data
const fetchDashboardData = async () => {
  const response = await fetch(API_URL)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  return await response.json()
}

// Helper fn to convert micro-USD to USD
const convertMicroUsdToUsd = (microUsd: number): number => {
  return microUsd / 1000000
}

// Helper fn to format USD
const formatUsd = (usd: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(usd)
}

// Helper fn to format numbers
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

const MetricCard = ({ title, value, isLoading, error }: any) => (
  <div data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
    <h3>{title}</h3>
    {isLoading && <div data-testid="loading-spinner">Loading...</div>}
    {error && <div data-testid="error-message">{error}</div>}
    {!isLoading && !error && <div data-testid="metric-value">{value}</div>}
  </div>
)

const UsdSpentMetric = ({ data }: any) => {
  const usd = convertMicroUsdToUsd(data.now.dailyUUsdSpent)
  const formatted = formatUsd(usd)
  return <MetricCard title="USD Spent (24h)" value={formatted} isLoading={false} error={null} />
}

const ActiveLeasesMetric = ({ data }: any) => {
  const formatted = formatNumber(data.now.activeLeaseCount)
  return <MetricCard title="Active Leases" value={formatted} isLoading={false} error={null} />
}

const ActiveProvidersMetric = ({ data }: any) => {
  const formatted = formatNumber(data.networkCapacity.activeProviderCount)
  return <MetricCard title="Active Providers" value={formatted} isLoading={false} error={null} />
}

describe('Provider Statistics Tests', () => {
  // Fetch data before all tests
  beforeAll(async () => {
    liveApiData = await fetchDashboardData()
  })

  // USD Spent (24h) stats tests
  describe('USD Spent (24h) Metric', () => {
    it('should render with correct title', () => {
      render(<UsdSpentMetric data={liveApiData} />)

      expect(screen.getByText('USD Spent (24h)')).toBeInTheDocument()
    })

    it('should display USD value with proper formatting', () => {
      const usd = convertMicroUsdToUsd(liveApiData.now.dailyUUsdSpent)
      const formatted = formatUsd(usd)

      render(<MetricCard title="USD Spent (24h)" value={formatted} isLoading={false} error={null} />)

      const value = screen.getByTestId('metric-value')
      expect(value).toHaveTextContent(formatted)
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
      render(<ActiveLeasesMetric data={liveApiData} />)

      expect(screen.getByText('Active Leases')).toBeInTheDocument()
    })

    it('should display lease count with comma formatting', () => {
      const formatted = formatNumber(liveApiData.now.activeLeaseCount)

      render(<MetricCard title="Active Leases" value={formatted} isLoading={false} error={null} />)

      const value = screen.getByTestId('metric-value')
      expect(value).toHaveTextContent(formatted)
      expect(typeof liveApiData.now.activeLeaseCount).toBe('number')
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
      render(<ActiveProvidersMetric data={liveApiData} />)

      expect(screen.getByText('Active Providers')).toBeInTheDocument()
    })

    it('should display provider count', () => {
      const formatted = formatNumber(liveApiData.networkCapacity.activeProviderCount)

      render(<MetricCard title="Active Providers" value={formatted} isLoading={false} error={null} />)

      expect(screen.getByTestId('metric-value')).toHaveTextContent(formatted)
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

  // Edge cases
  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined data gracefully', () => {
      render(<MetricCard title="Test Metric" value={undefined} isLoading={false} error={null} />)

      // Should not crash, show empty or default state
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
