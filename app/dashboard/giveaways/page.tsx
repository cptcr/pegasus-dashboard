import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Users, Trophy, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function GiveawaysPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Giveaway Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Giveaways</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active participants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Winners</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Active Giveaways</CardTitle>
            <Button>Create Giveaway</Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No active giveaways. Create a new giveaway to engage your community!</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Giveaway Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Simple Giveaway</h4>
                <p className="text-sm text-muted-foreground">Basic giveaway with one winner</p>
                <Button className="mt-2" size="sm" variant="outline">Use Template</Button>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Advanced Giveaway</h4>
                <p className="text-sm text-muted-foreground">Multiple winners with requirements</p>
                <Button className="mt-2" size="sm" variant="outline">Use Template</Button>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Role Giveaway</h4>
                <p className="text-sm text-muted-foreground">Exclusive for specific roles</p>
                <Button className="mt-2" size="sm" variant="outline">Use Template</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements & Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">Available Requirements:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Minimum account age</li>
                <li>• Server join duration</li>
                <li>• Required roles</li>
                <li>• Message count</li>
                <li>• Level requirement</li>
              </ul>
              <p className="text-sm font-medium mt-4">Bonus Entry Options:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Booster bonus entries</li>
                <li>• Role-based multipliers</li>
                <li>• Activity bonuses</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Winners</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent winners. Winners from completed giveaways will appear here.</p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Scheduled Giveaways</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No scheduled giveaways. Schedule giveaways in advance to plan your events.</p>
        </CardContent>
      </Card>
    </div>
  );
}