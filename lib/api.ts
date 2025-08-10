import { ApiResponse, safeApiCall, retryWithBackoff, ApiRequestError } from './errors';

interface FetchOptions extends RequestInit {
  token?: string;
  timeout?: number;
  retries?: number;
}

interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  services?: {
    database: 'up' | 'down';
    discord: 'up' | 'down';
    bot: 'up' | 'down';
  };
  uptime?: number;
}

interface BotStatusResponse {
  online: boolean;
  servers: number;
  users: number;
  uptime: number;
  memory: number;
  cpu: number;
  latency: number;
  version?: string;
  shard?: number;
  shardCount?: number;
}

interface ServerSettings {
  prefix?: string;
  language?: string;
  timezone?: string;
  modules?: {
    moderation?: boolean;
    economy?: boolean;
    xp?: boolean;
    tickets?: boolean;
    giveaways?: boolean;
  };
  [key: string]: unknown;
}

interface WarningAutomations {
  enabled: boolean;
  rules: Array<{
    id: string;
    threshold: number;
    action: 'kick' | 'ban' | 'mute' | 'role';
    duration?: number;
    roleId?: string;
  }>;
}

interface EconomySettings {
  enabled: boolean;
  currency: string;
  startingBalance: number;
  dailyAmount: number;
  dailyCooldown: number;
  maxBalance?: number;
  shopEnabled: boolean;
  gamblingEnabled: boolean;
}

interface XPSettings {
  enabled: boolean;
  baseXpGain: number;
  multiplier: number;
  cooldown: number;
  enabledChannels: string[];
  excludedChannels: string[];
  enabledRoles: string[];
  excludedRoles: string[];
  levelUpMessage: string | null;
  levelUpChannel: string | null;
}

interface CreateShopItemData {
  name: string;
  price: number;
  type: 'role' | 'item' | 'consumable';
  description?: string;
  stock?: number;
  roleId?: string;
  [key: string]: unknown;
}

interface UpdateShopItemData {
  name?: string;
  price?: number;
  description?: string;
  stock?: number;
  enabled?: boolean;
  [key: string]: unknown;
}

interface CreateXPRewardData {
  level: number;
  roleId: string;
  removeOnLevelDown?: boolean;
  [key: string]: unknown;
}

interface CreateTicketPanelData {
  name: string;
  channelId: string;
  categoryId?: string;
  description?: string;
  buttonLabel?: string;
  buttonEmoji?: string;
  [key: string]: unknown;
}

interface UpdateTicketPanelData {
  name?: string;
  description?: string;
  buttonLabel?: string;
  buttonEmoji?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

interface CreateGiveawayData {
  prize: string;
  duration: string;
  winnerCount?: number;
  channelId: string;
  description?: string;
  requirements?: string[];
  [key: string]: unknown;
}

interface Giveaway {
  id: string;
  serverId: string;
  channelId: string;
  messageId: string;
  prize: string;
  description: string | null;
  winnerCount: number;
  hostId: string;
  startTime: Date;
  endTime: Date;
  requirements: string[];
  ended: boolean;
  winnersSelected: boolean;
  entries?: number;
}

export class BotAPI {
  private baseURL: string;
  private token: string;
  private defaultTimeout: number = 10000;
  private defaultRetries: number = 3;

  constructor() {
    // Use environment variables with fallbacks
    this.baseURL = process.env['NEXT_PUBLIC_API_URL'] || process.env['API_URL'] || 'http://localhost:2000';
    this.token = process.env['BOT_API_TOKEN'] || '';
    
    if (!this.token && typeof window === 'undefined') {
      console.warn('[BotAPI] No API token provided');
    }
  }

  private async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = options.timeout || this.defaultTimeout;
    const retries = options.retries ?? this.defaultRetries;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add auth token for authenticated endpoints
    if (this.token && !endpoint.includes('/health')) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const fetchOperation = async () => {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          let errorMessage = `API Error: ${response.status} ${response.statusText}`;
          
          try {
            const errorJson = JSON.parse(errorBody);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            // Use text error if not JSON
            if (errorBody) errorMessage = errorBody;
          }

          throw new ApiRequestError(errorMessage, response.status, { endpoint, status: response.status });
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new ApiRequestError(`Request timeout after ${timeout}ms`, 408, { endpoint, timeout });
          }
          throw error;
        }
        
        throw new ApiRequestError('Unknown error occurred', 500, { endpoint, error });
      }
    };

    // Use retry logic for resilience
    if (retries > 0 && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'PATCH' && options.method !== 'DELETE') {
      return retryWithBackoff(fetchOperation, retries, 1000);
    }
    
    return fetchOperation();
  }

  // Core endpoints with error handling
  async getHealth(): Promise<ApiResponse<HealthCheckResponse>> {
    return safeApiCall(
      async () => this.fetch<HealthCheckResponse>('/health', { retries: 1, timeout: 5000 }),
      {
        status: 'down',
        timestamp: new Date().toISOString(),
        services: { database: 'down', discord: 'down', bot: 'down' },
        uptime: 0
      },
      'HEALTH_CHECK'
    );
  }

  async getStatus(): Promise<ApiResponse<BotStatusResponse>> {
    return safeApiCall(
      async () => this.fetch<BotStatusResponse>('/status'),
      {
        online: false,
        servers: 0,
        users: 0,
        uptime: 0,
        memory: 0,
        cpu: 0,
        latency: 0
      },
      'BOT_STATUS'
    );
  }

  // Server management with validation
  async getServers(): Promise<ApiResponse<Array<{ id: string; name: string; icon?: string }>>> {
    return safeApiCall(
      async () => this.fetch<Array<{ id: string; name: string; icon?: string }>>('/servers'),
      [],
      'GET_SERVERS'
    );
  }

  async getServer(serverId: string): Promise<ApiResponse<any>> {
    if (!serverId) throw new ApiRequestError('Server ID is required', 400);
    
    return safeApiCall(
      async () => this.fetch(`/servers/${serverId}`),
      null,
      `GET_SERVER_${serverId}`
    );
  }

  async getServerSettings(serverId: string): Promise<ApiResponse<ServerSettings>> {
    if (!serverId) throw new ApiRequestError('Server ID is required', 400);
    
    return safeApiCall(
      async () => this.fetch<ServerSettings>(`/servers/${serverId}/settings`),
      { prefix: '!', language: 'en', timezone: 'UTC' },
      `GET_SERVER_SETTINGS_${serverId}`
    );
  }

  async updateServerSettings(serverId: string, settings: ServerSettings): Promise<ApiResponse<ServerSettings>> {
    if (!serverId) throw new ApiRequestError('Server ID is required', 400);
    
    return safeApiCall(
      async () => this.fetch<ServerSettings>(`/servers/${serverId}/settings`, {
        method: 'PATCH',
        body: JSON.stringify(settings),
        retries: 0
      }),
      settings,
      `UPDATE_SERVER_SETTINGS_${serverId}`
    );
  }

  // User management
  async getUsers(serverId?: string) {
    const query = serverId ? `?serverId=${serverId}` : '';
    return this.fetch(`/users${query}`);
  }

  async getUser(userId: string) {
    return this.fetch(`/users/${userId}`);
  }

  async getUserServers(userId: string) {
    return this.fetch(`/users/${userId}/servers`);
  }

  // Moderation
  async getModerationCases(serverId?: string) {
    const query = serverId ? `?serverId=${serverId}` : '';
    return this.fetch(`/moderation/cases${query}`);
  }

  async getWarnings(serverId: string, userId?: string) {
    const query = userId ? `?userId=${userId}` : '';
    return this.fetch(`/moderation/warnings/${serverId}${query}`);
  }

  async getWarningAutomations(serverId: string) {
    return this.fetch(`/moderation/automations/${serverId}`);
  }

  async updateWarningAutomations(serverId: string, automations: WarningAutomations) {
    return this.fetch(`/moderation/automations/${serverId}`, {
      method: 'PUT',
      body: JSON.stringify(automations),
    });
  }

  async getBlacklist(serverId?: string) {
    const query = serverId ? `?serverId=${serverId}` : '';
    return this.fetch(`/moderation/blacklist${query}`);
  }

  // Economy
  async getEconomyStats(serverId: string) {
    return this.fetch(`/economy/stats/${serverId}`);
  }

  async getEconomyBalances(serverId: string) {
    return this.fetch(`/economy/balances/${serverId}`);
  }

  async getEconomyTransactions(serverId: string, userId?: string) {
    const query = userId ? `?userId=${userId}` : '';
    return this.fetch(`/economy/transactions/${serverId}${query}`);
  }

  async getShopItems(serverId: string) {
    return this.fetch(`/economy/shop/${serverId}`);
  }

  async createShopItem(serverId: string, item: CreateShopItemData) {
    return this.fetch(`/economy/shop/${serverId}`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateShopItem(serverId: string, itemId: string, updates: UpdateShopItemData) {
    return this.fetch(`/economy/shop/${serverId}/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteShopItem(serverId: string, itemId: string) {
    return this.fetch(`/economy/shop/${serverId}/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getGamblingStats(serverId: string) {
    return this.fetch(`/economy/gambling/${serverId}`);
  }

  async getEconomySettings(serverId: string) {
    return this.fetch(`/economy/settings/${serverId}`);
  }

  async updateEconomySettings(serverId: string, settings: EconomySettings) {
    return this.fetch(`/economy/settings/${serverId}`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  // XP System with proper error handling
  async getXPLeaderboard(serverId: string): Promise<ApiResponse<any[]>> {
    if (!serverId) throw new ApiRequestError('Server ID is required', 400);
    
    return safeApiCall(
      async () => this.fetch<any[]>(`/xp/leaderboard/${serverId}`),
      [],
      `GET_XP_LEADERBOARD_${serverId}`
    );
  }

  async getXPRewards(serverId: string): Promise<ApiResponse<any[]>> {
    if (!serverId) throw new ApiRequestError('Server ID is required', 400);
    
    return safeApiCall(
      async () => this.fetch<any[]>(`/xp/rewards/${serverId}`),
      [],
      `GET_XP_REWARDS_${serverId}`
    );
  }

  async createXPReward(serverId: string, reward: CreateXPRewardData): Promise<ApiResponse<any>> {
    if (!serverId) throw new ApiRequestError('Server ID is required', 400);
    if (!reward.level || !reward.roleId) {
      throw new ApiRequestError('Level and role ID are required', 400);
    }
    
    return safeApiCall(
      async () => this.fetch(`/xp/rewards/${serverId}`, {
        method: 'POST',
        body: JSON.stringify(reward),
        retries: 0
      }),
      null,
      `CREATE_XP_REWARD_${serverId}`
    );
  }

  async deleteXPReward(serverId: string, rewardId: string): Promise<ApiResponse<void>> {
    if (!serverId || !rewardId) {
      throw new ApiRequestError('Server ID and reward ID are required', 400);
    }
    
    return safeApiCall(
      async () => this.fetch<void>(`/xp/rewards/${serverId}/${rewardId}`, {
        method: 'DELETE',
        retries: 0
      }),
      undefined as any,
      `DELETE_XP_REWARD_${serverId}_${rewardId}`
    );
  }

  async getXPSettings(serverId: string): Promise<ApiResponse<XPSettings>> {
    if (!serverId) throw new ApiRequestError('Server ID is required', 400);
    
    return safeApiCall(
      async () => this.fetch<XPSettings>(`/xp/settings/${serverId}`),
      {
        enabled: false,
        baseXpGain: 15,
        multiplier: 1,
        cooldown: 60,
        enabledChannels: [],
        excludedChannels: [],
        enabledRoles: [],
        excludedRoles: [],
        levelUpMessage: null,
        levelUpChannel: null
      },
      `GET_XP_SETTINGS_${serverId}`
    );
  }

  async updateXPSettings(serverId: string, settings: Partial<XPSettings>): Promise<ApiResponse<XPSettings>> {
    if (!serverId) throw new ApiRequestError('Server ID is required', 400);
    
    return safeApiCall(
      async () => this.fetch<XPSettings>(`/xp/settings/${serverId}`, {
        method: 'PATCH',
        body: JSON.stringify(settings),
        retries: 0
      }),
      { ...settings } as XPSettings,
      `UPDATE_XP_SETTINGS_${serverId}`
    );
  }

  // Tickets
  async getTickets(serverId: string, status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.fetch(`/tickets/${serverId}${query}`);
  }

  async getTicketPanels(serverId: string) {
    return this.fetch(`/tickets/panels/${serverId}`);
  }

  async createTicketPanel(serverId: string, panel: CreateTicketPanelData) {
    return this.fetch(`/tickets/panels/${serverId}`, {
      method: 'POST',
      body: JSON.stringify(panel),
    });
  }

  async updateTicketPanel(serverId: string, panelId: string, updates: UpdateTicketPanelData) {
    return this.fetch(`/tickets/panels/${serverId}/${panelId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTicketPanel(serverId: string, panelId: string) {
    return this.fetch(`/tickets/panels/${serverId}/${panelId}`, {
      method: 'DELETE',
    });
  }

  async getTicketStats(serverId: string) {
    return this.fetch(`/tickets/stats/${serverId}`);
  }

  // Giveaways with validation
  async getGiveaways(serverId: string, active?: boolean): Promise<ApiResponse<Giveaway[]>> {
    if (!serverId) throw new ApiRequestError('Server ID is required', 400);
    
    const query = active !== undefined ? `?active=${active}` : '';
    return safeApiCall(
      async () => this.fetch<Giveaway[]>(`/giveaways/${serverId}${query}`),
      [],
      `GET_GIVEAWAYS_${serverId}`
    );
  }

  async getGiveaway(serverId: string, giveawayId: string): Promise<ApiResponse<Giveaway>> {
    if (!serverId || !giveawayId) {
      throw new ApiRequestError('Server ID and giveaway ID are required', 400);
    }
    
    return safeApiCall(
      async () => this.fetch<Giveaway>(`/giveaways/${serverId}/${giveawayId}`),
      null as any,
      `GET_GIVEAWAY_${serverId}_${giveawayId}`
    );
  }

  async updateGiveaway(serverId: string, giveawayId: string, updates: Partial<Giveaway>): Promise<ApiResponse<Giveaway>> {
    if (!serverId || !giveawayId) {
      throw new ApiRequestError('Server ID and giveaway ID are required', 400);
    }
    
    return safeApiCall(
      async () => this.fetch<Giveaway>(`/giveaways/${serverId}/${giveawayId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        retries: 0
      }),
      { ...updates } as Giveaway,
      `UPDATE_GIVEAWAY_${serverId}_${giveawayId}`
    );
  }

  async deleteGiveaway(serverId: string, giveawayId: string): Promise<ApiResponse<void>> {
    if (!serverId || !giveawayId) {
      throw new ApiRequestError('Server ID and giveaway ID are required', 400);
    }
    
    return safeApiCall(
      async () => this.fetch<void>(`/giveaways/${serverId}/${giveawayId}`, {
        method: 'DELETE',
        retries: 0
      }),
      undefined as any,
      `DELETE_GIVEAWAY_${serverId}_${giveawayId}`
    );
  }

  async createGiveaway(serverId: string, giveaway: CreateGiveawayData): Promise<ApiResponse<Giveaway>> {
    if (!serverId) throw new ApiRequestError('Server ID is required', 400);
    if (!giveaway.prize || !giveaway.duration || !giveaway.channelId) {
      throw new ApiRequestError('Prize, duration, and channel ID are required', 400);
    }
    
    return safeApiCall(
      async () => this.fetch<Giveaway>(`/giveaways/${serverId}`, {
        method: 'POST',
        body: JSON.stringify(giveaway),
        retries: 0
      }),
      null as any,
      `CREATE_GIVEAWAY_${serverId}`
    );
  }

  async endGiveaway(serverId: string, giveawayId: string): Promise<ApiResponse<Giveaway>> {
    if (!serverId || !giveawayId) {
      throw new ApiRequestError('Server ID and giveaway ID are required', 400);
    }
    
    return safeApiCall(
      async () => this.fetch<Giveaway>(`/giveaways/${serverId}/${giveawayId}/end`, {
        method: 'POST',
        retries: 0
      }),
      null as any,
      `END_GIVEAWAY_${serverId}_${giveawayId}`
    );
  }

  async rerollGiveaway(serverId: string, giveawayId: string): Promise<ApiResponse<Giveaway>> {
    if (!serverId || !giveawayId) {
      throw new ApiRequestError('Server ID and giveaway ID are required', 400);
    }
    
    return safeApiCall(
      async () => this.fetch<Giveaway>(`/giveaways/${serverId}/${giveawayId}/reroll`, {
        method: 'POST',
        retries: 0
      }),
      null as any,
      `REROLL_GIVEAWAY_${serverId}_${giveawayId}`
    );
  }

  async getGiveawayEntries(serverId: string, giveawayId: string): Promise<ApiResponse<any[]>> {
    if (!serverId || !giveawayId) {
      throw new ApiRequestError('Server ID and giveaway ID are required', 400);
    }
    
    return safeApiCall(
      async () => this.fetch<any[]>(`/giveaways/${serverId}/${giveawayId}/entries`),
      [],
      `GET_GIVEAWAY_ENTRIES_${serverId}_${giveawayId}`
    );
  }

  // Security
  async getSecurityLogs(serverId?: string) {
    const query = serverId ? `?serverId=${serverId}` : '';
    return this.fetch(`/security/logs${query}`);
  }

  async getAuditLogs(serverId?: string) {
    const query = serverId ? `?serverId=${serverId}` : '';
    return this.fetch(`/security/audit${query}`);
  }

  async getSecurityIncidents(serverId?: string) {
    const query = serverId ? `?serverId=${serverId}` : '';
    return this.fetch(`/security/incidents${query}`);
  }

  async getRateLimits() {
    return this.fetch('/security/ratelimits');
  }

  async getAPIKeys() {
    return this.fetch('/security/apikeys');
  }

  async createAPIKey(name: string, permissions: string[]) {
    return this.fetch('/security/apikeys', {
      method: 'POST',
      body: JSON.stringify({ name, permissions }),
    });
  }

  async revokeAPIKey(keyId: string) {
    return this.fetch(`/security/apikeys/${keyId}`, {
      method: 'DELETE',
    });
  }

  // Statistics
  async getGlobalStats() {
    return this.fetch('/stats/global');
  }

  async getServerStats(serverId: string) {
    return this.fetch(`/stats/server/${serverId}`);
  }

  async getUserStats(userId: string) {
    return this.fetch(`/stats/user/${userId}`);
  }
}

export const botAPI = new BotAPI();