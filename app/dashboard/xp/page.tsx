import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function XPPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">XP System Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Earned across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Level</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Top user level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Earning XP today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level Rewards</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Configured rewards</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Level Rewards</CardTitle>
            <Button>Add Reward</Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No level rewards configured. Set up rewards to give users roles or perks when they reach certain levels.</p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>XP Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">XP per Message</label>
            <p className="text-sm text-muted-foreground">Amount of XP earned per message: 10-25</p>
          </div>
          <div>
            <label className="text-sm font-medium">XP Cooldown</label>
            <p className="text-sm text-muted-foreground">Cooldown between XP gains: 60 seconds</p>
          </div>
          <div>
            <label className="text-sm font-medium">Level Up Announcements</label>
            <p className="text-sm text-muted-foreground">Enabled in current channel</p>
          </div>
          <Button variant="outline">Edit Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}