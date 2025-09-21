import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DataManagementPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>Manage resources, contracts, routes, and configs.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
          <p className="text-muted-foreground">Data Management UI</p>
        </div>
      </CardContent>
    </Card>
  );
}
