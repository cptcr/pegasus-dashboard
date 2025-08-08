import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Command, Settings, Shield, Zap } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Documentation</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Pegasus Bot Documentation</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Invite the bot to your Discord server</li>
                <li>Grant necessary permissions (Administrator recommended)</li>
                <li>Use /setup to configure initial settings</li>
                <li>Customize features through the dashboard</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Set up moderation rules and auto-mod</li>
                <li>Configure XP system and level rewards</li>
                <li>Create economy shop items</li>
                <li>Customize ticket panels</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Command Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Moderation Commands</h3>
                <div className="space-y-1 text-sm">
                  <p><code className="bg-secondary px-2 py-1 rounded">/warn [user] [reason]</code> - Issue a warning</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/ban [user] [reason]</code> - Ban a user</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/kick [user] [reason]</code> - Kick a user</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/mute [user] [duration]</code> - Mute a user</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/cases [user]</code> - View moderation history</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Economy Commands</h3>
                <div className="space-y-1 text-sm">
                  <p><code className="bg-secondary px-2 py-1 rounded">/balance</code> - Check your balance</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/shop</code> - View shop items</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/buy [item]</code> - Purchase an item</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/daily</code> - Claim daily reward</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/pay [user] [amount]</code> - Transfer money</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">XP Commands</h3>
                <div className="space-y-1 text-sm">
                  <p><code className="bg-secondary px-2 py-1 rounded">/rank</code> - Check your rank</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/leaderboard</code> - View XP leaderboard</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/setxp [user] [amount]</code> - Set user XP (Admin)</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Ticket Commands</h3>
                <div className="space-y-1 text-sm">
                  <p><code className="bg-secondary px-2 py-1 rounded">/ticket create</code> - Create a support ticket</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/ticket close</code> - Close current ticket</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/ticket add [user]</code> - Add user to ticket</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/ticket panel</code> - Create ticket panel (Admin)</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Utility Commands</h3>
                <div className="space-y-1 text-sm">
                  <p><code className="bg-secondary px-2 py-1 rounded">/help</code> - Show help menu</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/ping</code> - Check bot latency</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/info</code> - Bot information</p>
                  <p><code className="bg-secondary px-2 py-1 rounded">/setup</code> - Initial server setup (Admin)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Required Permissions:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Read Messages / View Channels</li>
                <li>Send Messages</li>
                <li>Manage Messages</li>
                <li>Manage Roles</li>
                <li>Manage Channels</li>
                <li>Ban Members</li>
                <li>Kick Members</li>
                <li>Moderate Members</li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                For the best experience, grant the bot Administrator permissions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}