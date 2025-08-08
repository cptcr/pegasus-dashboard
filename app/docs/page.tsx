'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, DollarSign, TrendingUp, Ticket, Gift, MessageSquare, 
  Settings, Users, Zap, Search, ChevronRight, Hash, Star,
  Gamepad2, Lock, AlertTriangle, Award, ShoppingBag, Dice1,
  Calendar, HelpCircle, Sparkles, LucideIcon
} from 'lucide-react';

interface Command {
  name: string;
  description: string;
  usage: string;
  permission?: string;
}

interface Category {
  name: string;
  icon: LucideIcon;
  color: string;
  commands: Command[];
}

const commandCategories: Record<string, Category> = {
  utility: {
    name: 'Utility',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    commands: [
      { name: 'ping', description: 'Check bot latency', usage: '/ping' },
      { name: 'help', description: 'Get help with commands', usage: '/help [command]' },
      { name: 'avatar', description: 'Display user avatar', usage: '/utils avatar [user]' },
      { name: 'banner', description: 'Display user banner', usage: '/utils banner [user]' },
      { name: 'userinfo', description: 'Get user information', usage: '/utils userinfo [user]' },
      { name: 'serverinfo', description: 'Get server information', usage: '/utils serverinfo' },
      { name: 'roleinfo', description: 'Get role information', usage: '/utils roleinfo <role>' },
      { name: 'weather', description: 'Get weather information', usage: '/utils weather <location>' },
      { name: 'steam', description: 'Get Steam profile info', usage: '/utils steam <steamid>' },
    ]
  },
  moderation: {
    name: 'Moderation',
    icon: Shield,
    color: 'from-red-500 to-orange-500',
    commands: [
      { name: 'warn', description: 'Warn a user', usage: '/moderation warn <user> [reason]', permission: 'ModerateMembers' },
      { name: 'kick', description: 'Kick a user', usage: '/moderation kick <user> [reason]', permission: 'KickMembers' },
      { name: 'ban', description: 'Ban a user', usage: '/moderation ban <user> [reason] [duration]', permission: 'BanMembers' },
      { name: 'unban', description: 'Unban a user', usage: '/moderation unban <user_id>', permission: 'BanMembers' },
      { name: 'timeout', description: 'Timeout a user', usage: '/moderation timeout <user> <duration> [reason]', permission: 'ModerateMembers' },
      { name: 'warnings', description: 'View user warnings', usage: '/moderation warnings <user>', permission: 'ModerateMembers' },
      { name: 'clear', description: 'Clear messages', usage: '/moderation clear <amount> [user]', permission: 'ManageMessages' },
      { name: 'slowmode', description: 'Set channel slowmode', usage: '/moderation slowmode <seconds>', permission: 'ManageChannels' },
      { name: 'lock', description: 'Lock a channel', usage: '/moderation lock [channel]', permission: 'ManageChannels' },
      { name: 'unlock', description: 'Unlock a channel', usage: '/moderation unlock [channel]', permission: 'ManageChannels' },
    ]
  },
  economy: {
    name: 'Economy',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    commands: [
      { name: 'balance', description: 'Check your balance', usage: '/eco balance [user]' },
      { name: 'daily', description: 'Claim daily reward', usage: '/eco daily' },
      { name: 'work', description: 'Work for money', usage: '/eco work' },
      { name: 'deposit', description: 'Deposit to bank', usage: '/eco deposit <amount|all>' },
      { name: 'withdraw', description: 'Withdraw from bank', usage: '/eco withdraw <amount|all>' },
      { name: 'give', description: 'Give money to user', usage: '/eco give <user> <amount>' },
      { name: 'rob', description: 'Rob another user', usage: '/eco rob <user>' },
      { name: 'shop', description: 'View shop items', usage: '/eco shop' },
      { name: 'buy', description: 'Buy an item', usage: '/eco buy <item>' },
      { name: 'inventory', description: 'View your inventory', usage: '/eco inventory' },
      { name: 'leaderboard', description: 'View economy leaderboard', usage: '/eco leaderboard' },
    ]
  },
  gambling: {
    name: 'Gambling',
    icon: Dice1,
    color: 'from-purple-500 to-pink-500',
    commands: [
      { name: 'coinflip', description: 'Flip a coin', usage: '/gamble coinflip <amount> <heads|tails>' },
      { name: 'dice', description: 'Roll the dice', usage: '/gamble dice <amount>' },
      { name: 'slots', description: 'Play slots', usage: '/gamble slots <amount>' },
      { name: 'blackjack', description: 'Play blackjack', usage: '/gamble blackjack <amount>' },
      { name: 'roulette', description: 'Play roulette', usage: '/gamble roulette <amount> <bet>' },
      { name: 'crash', description: 'Play crash game', usage: '/gamble crash <amount>' },
    ]
  },
  xp: {
    name: 'XP & Leveling',
    icon: TrendingUp,
    color: 'from-indigo-500 to-purple-500',
    commands: [
      { name: 'rank', description: 'Check your rank', usage: '/xp rank [user]' },
      { name: 'leaderboard', description: 'View XP leaderboard', usage: '/xp leaderboard' },
      { name: 'rewards', description: 'View level rewards', usage: '/xp rewards' },
      { name: 'setxp', description: 'Set user XP', usage: '/xp setxp <user> <amount>', permission: 'Administrator' },
      { name: 'setlevel', description: 'Set user level', usage: '/xp setlevel <user> <level>', permission: 'Administrator' },
      { name: 'addxp', description: 'Add XP to user', usage: '/xp addxp <user> <amount>', permission: 'Administrator' },
      { name: 'removexp', description: 'Remove XP from user', usage: '/xp removexp <user> <amount>', permission: 'Administrator' },
    ]
  },
  tickets: {
    name: 'Ticket System',
    icon: Ticket,
    color: 'from-yellow-500 to-amber-500',
    commands: [
      { name: 'create', description: 'Create a ticket', usage: '/ticket create [reason]' },
      { name: 'close', description: 'Close current ticket', usage: '/ticket close' },
      { name: 'add', description: 'Add user to ticket', usage: '/ticket add <user>', permission: 'ManageChannels' },
      { name: 'remove', description: 'Remove user from ticket', usage: '/ticket remove <user>', permission: 'ManageChannels' },
      { name: 'claim', description: 'Claim a ticket', usage: '/ticket claim', permission: 'ManageChannels' },
      { name: 'unclaim', description: 'Unclaim a ticket', usage: '/ticket unclaim', permission: 'ManageChannels' },
      { name: 'transcript', description: 'Get ticket transcript', usage: '/ticket transcript', permission: 'ManageChannels' },
      { name: 'panel', description: 'Create ticket panel', usage: '/ticket panel', permission: 'Administrator' },
    ]
  },
  giveaways: {
    name: 'Giveaways',
    icon: Gift,
    color: 'from-pink-500 to-rose-500',
    commands: [
      { name: 'start', description: 'Start a giveaway', usage: '/giveaway start <duration> <winners> <prize>', permission: 'ManageGuild' },
      { name: 'end', description: 'End a giveaway', usage: '/giveaway end <message_id>', permission: 'ManageGuild' },
      { name: 'reroll', description: 'Reroll giveaway winners', usage: '/giveaway reroll <message_id>', permission: 'ManageGuild' },
      { name: 'pause', description: 'Pause a giveaway', usage: '/giveaway pause <message_id>', permission: 'ManageGuild' },
      { name: 'resume', description: 'Resume a giveaway', usage: '/giveaway resume <message_id>', permission: 'ManageGuild' },
      { name: 'list', description: 'List active giveaways', usage: '/giveaway list' },
    ]
  },
  fun: {
    name: 'Fun & Games',
    icon: Gamepad2,
    color: 'from-cyan-500 to-blue-500',
    commands: [
      { name: '8ball', description: 'Ask the magic 8ball', usage: '/fun 8ball <question>' },
      { name: 'meme', description: 'Get a random meme', usage: '/fun meme' },
      { name: 'joke', description: 'Get a random joke', usage: '/fun joke' },
      { name: 'cat', description: 'Get a random cat image', usage: '/fun cat' },
      { name: 'dog', description: 'Get a random dog image', usage: '/fun dog' },
      { name: 'rps', description: 'Rock Paper Scissors', usage: '/fun rps <choice>' },
      { name: 'tictactoe', description: 'Play Tic Tac Toe', usage: '/fun tictactoe <user>' },
      { name: 'trivia', description: 'Answer trivia questions', usage: '/fun trivia [category]' },
    ]
  },
  admin: {
    name: 'Admin & Config',
    icon: Settings,
    color: 'from-gray-500 to-slate-500',
    commands: [
      { name: 'setup', description: 'Setup bot features', usage: '/config setup', permission: 'Administrator' },
      { name: 'autorole', description: 'Configure autorole', usage: '/config autorole <role>', permission: 'Administrator' },
      { name: 'welcome', description: 'Configure welcome messages', usage: '/config welcome', permission: 'Administrator' },
      { name: 'goodbye', description: 'Configure goodbye messages', usage: '/config goodbye', permission: 'Administrator' },
      { name: 'logs', description: 'Configure logging', usage: '/config logs <channel>', permission: 'Administrator' },
      { name: 'prefix', description: 'Set bot prefix', usage: '/config prefix <prefix>', permission: 'Administrator' },
      { name: 'language', description: 'Set bot language', usage: '/config language <language>', permission: 'Administrator' },
      { name: 'blacklist', description: 'Manage blacklist', usage: '/config blacklist <add|remove> <user>', permission: 'Administrator' },
    ]
  }
};

export default function DocsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCommands = Object.entries(commandCategories).reduce<Record<string, Category>>((acc, [key, category]) => {
    const filtered = category.commands.filter(cmd => 
      cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[key] = { ...category, commands: filtered };
    }
    return acc;
  }, {});

  return (
    <div className="relative min-h-screen">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 font-semibold">Comprehensive Documentation</span>
          </div>
          <h1 className="text-6xl font-bold mb-4 gradient-text">
            Pegasus Bot Commands
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about using Pegasus Bot in your Discord server
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg bg-black/50 border-purple-500/30 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "border-purple-500/30"}
          >
            <Star className="mr-2 h-4 w-4" />
            All Categories
          </Button>
          {Object.entries(commandCategories).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                onClick={() => setSelectedCategory(key)}
                className={selectedCategory === key ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "border-purple-500/30"}
              >
                <Icon className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Commands Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(selectedCategory ? { [selectedCategory]: filteredCommands[selectedCategory] } : filteredCommands).map(([key, category]) => {
            if (!category) return null;
            const Icon = category.icon;
            
            return (
              <Card 
                key={key} 
                className="glass border-white/10 hover-lift animate-slide-up overflow-hidden group"
                style={{ animationDelay: `${Object.keys(filteredCommands).indexOf(key) * 0.1}s` }}
              >
                <div className={`h-2 bg-gradient-to-r ${category.color}`} />
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${category.color} bg-opacity-20`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {category.commands.length} commands
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl gradient-text">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.commands.map((cmd, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg bg-black/30 border border-white/5 hover:border-purple-500/30 transition-all group/cmd"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-purple-400" />
                            <span className="font-semibold text-white group-hover/cmd:text-purple-400 transition-colors">
                              {cmd.name}
                            </span>
                          </div>
                          {'permission' in cmd && cmd.permission && (
                            <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                              {cmd.permission}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{cmd.description}</p>
                        <code className="text-xs px-2 py-1 rounded bg-black/50 text-purple-300 font-mono">
                          {cmd.usage}
                        </code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Start Guide */}
        <div className="mt-20 animate-slide-up">
          <Card className="glass border-purple-500/20 rainbow-border">
            <CardHeader>
              <CardTitle className="text-3xl gradient-text">
                <HelpCircle className="inline-block mr-3 h-8 w-8" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-purple-400 flex items-center gap-2">
                    <span className="text-2xl">1️⃣</span> Initial Setup
                  </h3>
                  <p className="text-gray-400">Run <code className="px-2 py-1 rounded bg-black/50 text-purple-300">/config setup</code> to configure basic settings</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-pink-400 flex items-center gap-2">
                    <span className="text-2xl">2️⃣</span> Configure Features
                  </h3>
                  <p className="text-gray-400">Set up moderation, economy, and XP systems based on your needs</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-400 flex items-center gap-2">
                    <span className="text-2xl">3️⃣</span> Customize Experience
                  </h3>
                  <p className="text-gray-400">Configure welcome messages, autoroles, and logging channels</p>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  Important Notes
                </h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• Commands marked with permissions require specific Discord permissions</li>
                  <li>• Economy and XP systems have configurable cooldowns to prevent spam</li>
                  <li>• Ticket system requires proper channel permissions for the bot</li>
                  <li>• Use <code className="px-1 py-0.5 rounded bg-black/50 text-purple-300">/help</code> in Discord for real-time command assistance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}