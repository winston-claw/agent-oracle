/**
 * DataFetcher Module - Fetches data from external APIs
 */

import axios, { AxiosInstance } from 'axios';
import { DataSource } from './config';

export interface FetchResult {
  success: boolean;
  data?: any;
  source: string;
  timestamp: number;
  error?: string;
}

export class DataFetcher {
  private sources: DataSource[];
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL: number = 30000; // 30 seconds

  constructor(sources: DataSource[]) {
    this.sources = sources;
  }

  /**
   * Fetch crypto price
   */
  async fetchCryptoPrice(pair: string): Promise<FetchResult> {
    const cacheKey = `crypto:${pair}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Try CoinGecko
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${pair}&vs_currencies=usd`,
        { timeout: 5000 }
      );
      
      const data = response.data[pair]?.usd;
      if (data) {
        const result: FetchResult = {
          success: true,
          data,
          source: 'CoinGecko',
          timestamp: Date.now()
        };
        this.setCache(cacheKey, result);
        return result;
      }
    } catch (e) {
      console.log('CoinGecko failed, trying next source...');
    }

    // Try Binance
    try {
      const response = await axios.get(
        `https://api.binance.com/api/v3/ticker/price?symbol=${pair.toUpperCase()}USDT`,
        { timeout: 5000 }
      );
      
      const data = parseFloat(response.data.price);
      if (!isNaN(data)) {
        const result: FetchResult = {
          success: true,
          data,
          source: 'Binance',
          timestamp: Date.now()
        };
        this.setCache(cacheKey, result);
        return result;
      }
    } catch (e) {
      console.log('Binance failed...');
    }

    return {
      success: false,
      source: 'none',
      timestamp: Date.now(),
      error: 'All sources failed'
    };
  }

  /**
   * Fetch weather data
   */
  async fetchWeather(location: string): Promise<FetchResult> {
    const cacheKey = `weather:${location}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Try Open-Meteo (free, no API key needed)
    try {
      const [lat, lon] = await this.geocode(location);
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation`,
        { timeout: 5000 }
      );
      
      const result: FetchResult = {
        success: true,
        data: response.data.current,
        source: 'Open-Meteo',
        timestamp: Date.now()
      };
      this.setCache(cacheKey, result);
      return result;
    } catch (e) {
      console.log('Weather fetch failed:', e);
    }

    return {
      success: false,
      source: 'none',
      timestamp: Date.now(),
      error: 'Weather API failed'
    };
  }

  /**
   * Geocode location string to lat/lon
   */
  private async geocode(location: string): Promise<[number, number]> {
    // Simplified - in production use proper geocoding
    // Default to Melbourne coordinates
    return [-37.8136, 144.9631];
  }

  /**
   * Cache helpers
   */
  private getCached(key: string): FetchResult | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return { ...cached.data, cached: true };
    }
    return null;
  }

  private setCache(key: string, result: FetchResult): void {
    this.cache.set(key, { data: result, timestamp: Date.now() });
  }

  /**
   * Fetch data based on type
   */
  async fetch(dataType: string, params: any): Promise<FetchResult> {
    switch (dataType) {
      case 'crypto_price':
        return this.fetchCryptoPrice(params.pair || 'bitcoin');
      case 'weather':
        return this.fetchWeather(params.location || 'Melbourne');
      default:
        return {
          success: false,
          source: 'none',
          timestamp: Date.now(),
          error: `Unknown data type: ${dataType}`
        };
    }
  }
}

export default DataFetcher;
