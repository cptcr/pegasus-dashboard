import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ModerationPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Moderation Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Open moderation cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Issued this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Currently banned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Mod</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Auto-moderation status</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Moderation Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent moderation actions. Actions will appear here when moderators issue warnings, bans, or other moderation commands.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Warning Automations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Configure automatic actions based on warning count.</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">3 Warnings</span>
                  <span className="text-sm text-muted-foreground">1 hour timeout</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">5 Warnings</span>
                  <span className="text-sm text-muted-foreground">24 hour timeout</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm">7 Warnings</span>
                  <span className="text-sm text-muted-foreground">7 day ban</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">Configure Automations</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warning Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Warning severity system:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Level 1: Minor offense</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Level 2: Moderate offense</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Level 3: Serious offense</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Level 4: Severe offense</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-900 rounded-full"></div>
                  <span className="text-sm">Level 5: Critical offense</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Blacklisted Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No blacklisted users. Users added to the blacklist cannot use bot commands.</p>
        </CardContent>
      </Card>
    </div>
  );
}