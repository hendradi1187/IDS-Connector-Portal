import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { mockModules } from '@/lib/data';
  
  export default function DataspaceModules() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dataspace Connector Modules</CardTitle>
          <CardDescription>
            Overview of integrated data management modules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead className="text-right">Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockModules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell>
                    <div className="font-medium">{module.name}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {module.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {module.items}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
  