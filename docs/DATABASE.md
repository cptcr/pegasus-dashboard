# Database Schema Documentation

## Overview
The Pegasus Bot Dashboard uses PostgreSQL with Drizzle ORM for database management. The database schema is comprehensive and covers all major Discord bot functionalities.

## Database Structure

### Core Tables

#### 1. **guilds** - Discord Server Information
- `id` (varchar): Discord guild ID (primary key)
- `prefix` (varchar): Command prefix for the guild
- `language` (varchar): Preferred language
- `createdAt`, `updatedAt`: Timestamps

#### 2. **guild_settings** - Server Configuration
Comprehensive settings for each guild including:
- **Welcome System**: Messages, channels, embeds, DMs
- **Goodbye System**: Leave messages and configuration
- **Logging**: Event logging configuration
- **XP System**: Rates, cooldowns, announcements
- **Autorole**: Automatic role assignment
- **Security**: Anti-raid, anti-spam settings

#### 3. **users** - Discord User Data
- `id` (varchar): Discord user ID
- `globalName`, `username`, `discriminator`: User identification
- `avatar`: Avatar URL
- `isBot`: Bot flag
- `rankCardBackground`, `rankCardAccent`: Customization
- `preferredLocale`: Language preference

#### 4. **members** - Guild Member Data
- Composite key: `userId` + `guildId`
- `nickname`: Server-specific nickname
- `joinedAt`: Join timestamp
- `xp`, `level`: Experience and level
- `messages`, `voiceMinutes`: Activity tracking

### Moderation System

#### 5. **mod_cases** - Moderation Actions
- `id`: Unique case ID
- `type`: warn, mute, kick, ban, timeout, unban
- `reason`, `duration`, `expiresAt`: Action details
- `proof`: Evidence URLs
- Full user/moderator tracking

#### 6. **warnings** - Warning System
- Custom warning IDs
- Warning levels (1-5)
- Edit history tracking
- Proof attachments

#### 7. **warning_automations** - Automated Actions
- Threshold-based actions
- Configurable punishment types
- Duration settings

### Economy System

#### 8. **economy_balances** - User Balances
- `wallet`, `bank`: Currency storage
- `netWorth`: Total value
- Statistics: total earned, spent, gambled
- Streak tracking

#### 9. **economy_transactions** - Transaction History
- Complete transaction log
- Metadata support
- Related transaction linking

#### 10. **economy_shop_items** - Shop Configuration
- Item types: role, item, boost, custom
- Effects system
- Stock management
- Requirements and cooldowns

#### 11. **economy_user_items** - User Inventory
- Item ownership tracking
- Quantity and expiration
- Metadata storage

#### 12. **economy_cooldowns** - Command Cooldowns
- Per-command cooldown tracking
- Expiration management

#### 13. **economy_gambling_stats** - Gambling Statistics
- Per-game tracking
- Win/loss ratios
- Profit calculations

### XP/Leveling System

#### 14. **user_xp** - Experience Tracking
- Per-guild XP storage
- Level calculation
- Activity timestamps

#### 15. **xp_rewards** - Level Rewards
- Role-based rewards
- Custom messages
- Stack/replace options

#### 16. **xp_multipliers** - XP Modifiers
- Channel multipliers
- Role multipliers
- Percentage-based

#### 17. **xp_settings** - XP Configuration
- Ignored channels/roles
- Double XP channels
- No-XP zones

### Ticket System

#### 18. **ticket_panels** - Ticket Creation Panels
- Custom buttons (up to 5)
- Category configuration
- Welcome messages
- Role assignments

#### 19. **tickets** - Support Tickets
- Status tracking: open, claimed, closed, locked, frozen
- Claiming system
- Close reasons
- User ratings

#### 20. **ticket_messages** - Ticket History
- Complete conversation log
- Attachment tracking
- Author identification

### Giveaway System

#### 21. **giveaways** - Giveaway Configuration
- Prize and winner count
- Requirements system
- Duration and scheduling
- Host tracking

#### 22. **giveaway_entries** - Participation Tracking
- Entry management
- Bonus entry support
- Timestamp tracking

### Security & Audit

#### 23. **security_logs** - Security Events
- Event categorization
- Severity levels (low, medium, high, critical)
- Metadata storage
- User agent tracking

#### 24. **blacklist** - Entity Blocking
- Multi-type support: user, guild, role, channel
- Reason tracking
- Moderator attribution
- Appeal status

#### 25. **audit_logs** - Enhanced Audit Trail
- Comprehensive action logging
- Before/after states
- IP hashing (privacy-compliant)
- User agent tracking

#### 26. **rate_limit_violations** - Rate Limiting
- Endpoint tracking
- Violation counting
- IP logging

#### 27. **security_incidents** - Incident Management
- Incident tracking
- Resolution status
- Investigation notes
- Affected entity tracking

#### 28. **api_keys** - API Management
- Key generation
- Permission scopes
- Usage statistics
- Expiration handling

## Database Commands

### Setup and Migration
```bash
# Generate migrations from schema
npm run db:generate

# Push schema to database (development)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Open Drizzle Studio (GUI)
npm run db:studio

# Pull schema from existing database
npm run db:pull

# Check schema validity
npm run db:check

# Drop all tables (DANGEROUS!)
npm run db:drop
```

### Environment Configuration
Create a `.env.local` file with:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/pegasus_bot
```

### Connection Pooling
The database client is configured with:
- Maximum connections: 10
- Idle timeout: 20 seconds
- Connect timeout: 10 seconds

## Indexes and Performance

Key indexes are automatically created for:
- Primary keys
- Foreign key relationships
- Frequently queried fields (userId, guildId)
- Timestamp fields for sorting

## Relations

The schema maintains referential integrity through:
- Foreign key constraints
- Cascade deletes where appropriate
- Composite keys for many-to-many relationships

## Type Safety

All schemas export TypeScript types:
- Insert types for creating records
- Select types for querying
- Relation types for joins

Example usage:
```typescript
import { users, type InsertUser } from '@/lib/db/schemas';

const newUser: InsertUser = {
  id: '123456789',
  username: 'example',
  // ... other fields
};
```

## Best Practices

1. **Always use transactions** for multi-table operations
2. **Use prepared statements** to prevent SQL injection
3. **Implement soft deletes** where appropriate
4. **Regular backups** of production data
5. **Monitor query performance** with indexes
6. **Use connection pooling** for scalability

## Migration Strategy

1. Development: Use `db:push` for rapid iteration
2. Staging: Test migrations with `db:generate` and `db:migrate`
3. Production: Always use migrations, never push directly

## Security Considerations

- Database credentials are never committed
- Use environment variables for all secrets
- Implement row-level security where needed
- Regular security audits of database access
- Encrypt sensitive data at rest
- Use SSL for database connections in production