import ApiStatusGrid from '@/components/backend-system/ApiStatusGrid';
import ProcessingLogTable from '@/components/backend-system/ProcessingLogTable';

export default function BackendSystemPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-semibold text-3xl">Backend System</h1>
        <p className="text-muted-foreground">
          View API status and processing logs.
        </p>
      </header>
      <ApiStatusGrid />
      <ProcessingLogTable />
    </div>
  );
}
