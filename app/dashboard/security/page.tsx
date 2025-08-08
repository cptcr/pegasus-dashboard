import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield, AlertTriangle, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SecurityPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Security Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">High</div>
            <p className="text-xs text-muted-foreground">Current security status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blacklisted</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Users/Servers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Active keys</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Blacklist Management</CardTitle>
            <Button>Add Entry</Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No blacklisted entities. Add users or servers to prevent them from using the bot.</p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Security Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No security events logged. Suspicious activities and security incidents will appear here.</p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No audit entries. All administrative actions are logged here for transparency.</p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-secondary rounded">
              <span className="text-sm font-medium">Dashboard API Key</span>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
          </div>
          <Button className="mt-4" variant="outline">Generate New Key</Button>
        </CardContent>
      </Card>
    </div>
  );
}