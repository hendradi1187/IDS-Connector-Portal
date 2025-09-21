import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function BackendSystemPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Backend System</CardTitle>
        <CardDescription>View API status and processing logs.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20">
          <p className="text-muted-foreground">Backend System UI</p>
        </div>
      </CardContent>
    </Card>
  );
}
