interface FetchOptions extends RequestInit {
  token?: string;
}

export class BotAPI {
  private baseURL: string;
  private token: string;

  constructor() {
    this.baseURL = process.env.API_URL || 'http://localhost:2000';
    this.token = process.env.BOT_API_TOKEN || '';
  }

  private async fetch(endpoint: string, options: FetchOptions = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token && !endpoint.includes('/health')) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  // Core endpoints
  async getHealth() {
    return this.fetch('/health');
  }

  async getStatus() {
    return this.fetch('/status');
  }

  // Server management
  async getServers() {
    return this.fetch('/servers');
  }

  async getServer(serverId: string) {
    return this.fetch(`/servers/${serverId}`);
  }

  async getServerSettings(serverId: string) {
    return this.fetch(`/servers/${serverId}/settings`);
  }

  async updateServerSettings(serverId: string, settings: any) {
    return this.fetch(`/servers/${serverId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
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

  async updateWarningAutomations(serverId: string, automations: any) {
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

  async createShopItem(serverId: string, item: any) {
    return this.fetch(`/economy/shop/${serverId}`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateShopItem(serverId: string, itemId: string, updates: any) {
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

  async updateEconomySettings(serverId: string, settings: any) {
    return this.fetch(`/economy/settings/${serverId}`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  // XP System
  async getXPLeaderboard(serverId: string) {
    return this.fetch(`/xp/leaderboard/${serverId}`);
  }

  async getXPRewards(serverId: string) {
    return this.fetch(`/xp/rewards/${serverId}`);
  }

  async createXPReward(serverId: string, reward: any) {
    return this.fetch(`/xp/rewards/${serverId}`, {
      method: 'POST',
      body: JSON.stringify(reward),
    });
  }

  async deleteXPReward(serverId: string, rewardId: string) {
    return this.fetch(`/xp/rewards/${serverId}/${rewardId}`, {
      method: 'DELETE',
    });
  }

  async getXPSettings(serverId: string) {
    return this.fetch(`/xp/settings/${serverId}`);
  }

  async updateXPSettings(serverId: string, settings: any) {
    return this.fetch(`/xp/settings/${serverId}`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  // Tickets
  async getTickets(serverId: string, status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.fetch(`/tickets/${serverId}${query}`);
  }

  async getTicketPanels(serverId: string) {
    return this.fetch(`/tickets/panels/${serverId}`);
  }

  async createTicketPanel(serverId: string, panel: any) {
    return this.fetch(`/tickets/panels/${serverId}`, {
      method: 'POST',
      body: JSON.stringify(panel),
    });
  }

  async updateTicketPanel(serverId: string, panelId: string, updates: any) {
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

  // Giveaways
  async getGiveaways(serverId: string, active?: boolean) {
    const query = active !== undefined ? `?active=${active}` : '';
    return this.fetch(`/giveaways/${serverId}${query}`);
  }

  async createGiveaway(serverId: string, giveaway: any) {
    return this.fetch(`/giveaways/${serverId}`, {
      method: 'POST',
      body: JSON.stringify(giveaway),
    });
  }

  async endGiveaway(serverId: string, giveawayId: string) {
    return this.fetch(`/giveaways/${serverId}/${giveawayId}/end`, {
      method: 'POST',
    });
  }

  async rerollGiveaway(serverId: string, giveawayId: string) {
    return this.fetch(`/giveaways/${serverId}/${giveawayId}/reroll`, {
      method: 'POST',
    });
  }

  async getGiveawayEntries(serverId: string, giveawayId: string) {
    return this.fetch(`/giveaways/${serverId}/${giveawayId}/entries`);
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