import { ExcelImport } from '../components/ExcelImport';

interface ImportViewProps {
  onFileSelected: (fileBase64: string) => Promise<void>;
}

export function ImportView({ onFileSelected }: ImportViewProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-foreground text-center">Excel Import</h2>
      <ExcelImport onFileSelected={onFileSelected} />
    </div>
  );
}
