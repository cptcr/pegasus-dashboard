// API Response Types

export interface BotStatus {
  online: boolean;
  uptime: string;
  serverCount: number;
  userCount: number;
  shardCount: number;
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  ping: number;
  version: string;
}

export interface ServerInfo {
  id: string;
  name: string;
  icon?: string;
  memberCount: number;
  botJoined: boolean;
  botJoinedAt?: string;
  owner: {
    id: string;
    username: string;
    avatar?: string;
  };
  features: string[];
  premium: boolean;
}

export interface UserInfo {
  id: string;
  username: string;
  globalName?: string;
  discriminator?: string;
  avatar?: string;
  bot: boolean;
  servers: string[];
  xp?: {
    total: number;
    level: number;
    rank: number;
  };
  economy?: {
    wallet: number;
    bank: number;
    netWorth: number;
  };
}

export interface ModerationCase {
  id: string;
  type: 'warn' | 'mute' | 'kick' | 'ban' | 'timeout' | 'unban';
  userId: string;
  moderatorId: string;
  reason?: string;
  duration?: number;
  expiresAt?: string;
  createdAt: string;
}

export interface Warning {
  id: string;
  warnId: string;
  userId: string;
  moderatorId: string;
  reason?: string;
  level: 1 | 2 | 3 | 4 | 5;
  proof?: string;
  editedBy?: string;
  editedAt?: string;
  createdAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: 'role' | 'item' | 'boost' | 'custom';
  effect?: 'none' | 'xp_boost' | 'work_boost' | 'rob_protection' | 'luck_boost' | 'daily_boost' | 'bank_access';
  effectValue?: number;
  effectDuration?: number;
  roleId?: string;
  stock: number;
  purchaseLimit?: number;
  requiredRole?: string;
  requiredLevel?: number;
  active: boolean;
}

export interface EconomyTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description?: string;
  balanceBefore: number;
  balanceAfter: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface GamblingStatistics {
  game: string;
  played: number;
  won: number;
  lost: number;
  profit: number;
  biggestWin: number;
  biggestLoss: number;
  currentStreak: number;
  bestStreak: number;
}

export interface XPLeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  xp: number;
  level: number;
  rank: number;
  messages: number;
  voiceMinutes: number;
}

export interface LevelReward {
  id: string;
  level: number;
  roleId: string;
  roleName?: string;
  message?: string;
  stack: boolean;
}

export interface TicketInfo {
  id: string;
  userId: string;
  channelId: string;
  panelId?: string;
  reason?: string;
  status: 'open' | 'claimed' | 'closed' | 'locked' | 'frozen';
  claimedBy?: string;
  closedBy?: string;
  closeReason?: string;
  rating?: number;
  messageCount: number;
  createdAt: string;
  closedAt?: string;
}

export interface TicketPanel {
  id: string;
  name: string;
  description?: string;
  channelId: string;
  categoryId: string;
  supportRoles: string[];
  welcomeMessage?: string;
  buttons: {
    label: string;
    emoji?: string;
    style: 'primary' | 'secondary' | 'success' | 'danger';
  }[];
  maxTickets: number;
  active: boolean;
}

export interface GiveawayInfo {
  id: string;
  messageId: string;
  channelId: string;
  hostId: string;
  prize: string;
  description?: string;
  winnerCount: number;
  requirements?: {
    minAccountAge?: number;
    minServerAge?: number;
    requiredRoles?: string[];
    minLevel?: number;
    minMessages?: number;
  };
  bonusEntries?: {
    roleId: string;
    bonus: number;
  }[];
  entriesCount: number;
  ended: boolean;
  winners?: string[];
  endsAt: string;
  createdAt: string;
}

export interface SecurityLog {
  id: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  guildId?: string;
  details?: string;
  metadata?: Record<string, any>;
  ipHash?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actorId: string;
  targetId?: string;
  targetType?: string;
  guildId?: string;
  reason?: string;
  changes?: {
    before: any;
    after: any;
  };
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface GlobalStatistics {
  servers: number;
  users: number;
  commands: number;
  messages: number;
  uptime: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  shards: {
    total: number;
    online: number;
  };
  economy: {
    totalBalance: number;
    totalTransactions: number;
    totalGambled: number;
  };
  moderation: {
    totalCases: number;
    totalWarnings: number;
    activeBans: number;
  };
  tickets: {
    total: number;
    open: number;
    avgResponseTime: string;
  };
  giveaways: {
    total: number;
    active: number;
    totalPrizes: number;
  };
}

export interface ServerStatistics {
  id: string;
  name: string;
  memberCount: number;
  messageCount: number;
  commandsUsed: number;
  economy: {
    totalBalance: number;
    richestUser: string;
    transactions: number;
  };
  xp: {
    totalXP: number;
    highestLevel: number;
    activeUsers: number;
  };
  moderation: {
    cases: number;
    warnings: number;
    blacklisted: number;
  };
  tickets: {
    total: number;
    resolved: number;
    avgResolutionTime: string;
  };
}