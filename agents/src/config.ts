/**
 * AgentOracle Agent Configuration
 */

export interface AgentConfig {
  agentId: string;
  name: string;
  capabilities: string[];
  dataSources: DataSource[];
  stake: number;
  minReputation: number;
  autoRestake: boolean;
}

export interface DataSource {
  name: string;
  url: string;
  apiKey?: string;
  type: 'rest' | 'ws';
}

// Deployed contract addresses on Hedera Testnet
export const ORACLE_HUB_ADDRESS = "0x4C536b1cd6511481B9EcAa6EdE6448B073A6f6e2";
export const AGENT_REGISTRY_ADDRESS = "0xC9ff8Dfc0f25b7857a77D2fB777f8C420C75e06F";
export const ORACLE_TOKEN_ADDRESS = "0x1fda3ABe6c64386044ADe463468ab2c1edE484D0";

// Hedera Testnet RPC
export const HEDERA_RPC_URL = "https://testnet.hashio.io";
export const CHAIN_ID = 296;

// Pre-configured agents for demo
export const AGENT_CONFIGS: AgentConfig[] = [
  {
    agentId: 'agent-crypto-alpha',
    name: 'Crypto Alpha',
    capabilities: ['crypto_price', 'btc_price', 'eth_price'],
    dataSources: [
      { name: 'CoinGecko', url: 'https://api.coingecko.com/api/v3', type: 'rest' },
      { name: 'Binance', url: 'https://api.binance.com/api/v3', type: 'rest' }
    ],
    stake: 1000,
    minReputation: 80,
    autoRestake: true
  },
  {
    agentId: 'agent-crypto-bravo',
    name: 'Crypto Bravo',
    capabilities: ['crypto_price', 'btc_price', 'sol_price'],
    dataSources: [
      { name: 'Coinbase', url: 'https://api.coinbase.com/v2', type: 'rest' },
      { name: 'Kraken', url: 'https://api.kraken.com/0/public', type: 'rest' }
    ],
    stake: 1000,
    minReputation: 75,
    autoRestake: true
  },
  {
    agentId: 'agent-weather-delta',
    name: 'Weather Delta',
    capabilities: ['weather', 'temperature', 'precipitation'],
    dataSources: [
      { name: 'OpenWeatherMap', url: 'https://api.openweathermap.org/data/2.5', type: 'rest' },
      { name: 'WeatherAPI', url: 'https://api.weatherapi.com/v1', type: 'rest' }
    ],
    stake: 1000,
    minReputation: 70,
    autoRestake: true
  },
  {
    agentId: 'agent-weather-echo',
    name: 'Weather Echo',
    capabilities: ['weather', 'temperature', 'forecast'],
    dataSources: [
      { name: 'TomorrowIO', url: 'https://api.tomorrow.io/v4', type: 'rest' },
      { name: 'OpenMeteo', url: 'https://api.open-meteo.com/v1', type: 'rest' }
    ],
    stake: 1000,
    minReputation: 70,
    autoRestake: true
  },
  {
    agentId: 'agent-sports-foxtrot',
    name: 'Sports Foxtrot',
    capabilities: ['sports', 'scores', 'standings'],
    dataSources: [
      { name: 'TheSportsDB', url: 'https://www.thesportsdb.com/api/v1/json/3', type: 'rest' },
      { name: 'APIFootball', url: 'https://v3.football.api-sports.io', type: 'rest' }
    ],
    stake: 1000,
    minReputation: 65,
    autoRestake: true
  }
];

export const DEFAULT_CONFIG = AGENT_CONFIGS[0];
