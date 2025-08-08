import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Settings, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

const DISCORD_BOT_INVITE_URL = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

export default async function ServersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Server Management</h1>
        <Link href={DISCORD_BOT_INVITE_URL} target="_blank">
          <Button>
            <ExternalLink className="h-4 w-4 mr-2" />
            Invite Bot
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="opacity-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Example Server</CardTitle>
              <Server className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Members</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="text-yellow-600">Not Joined</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Link href={DISCORD_BOT_INVITE_URL} target="_blank">
                <Button className="w-full" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Invite Bot
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>No Servers Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The bot hasn't been added to any servers yet. Click the button below to invite the bot to your Discord server.
            </p>
            <Link href={DISCORD_BOT_INVITE_URL} target="_blank">
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" />
                Invite Bot to Server
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}