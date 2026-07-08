import { ReactNode, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, ShieldCheck, LucideIcon } from "lucide-react";

export interface DeskStat { label: string; value: string | number; hint?: string; }
export interface DeskColumn<Row> { header: string; cell: (r: Row) => ReactNode; }
export interface DeskAction<Row> { label: string; onClick: (r: Row) => void; variant?: "default" | "outline" | "secondary" | "destructive"; }
export interface DeskTab<Row> {
  value: string;
  label: string;
  rows: Row[];
  emptyLabel?: string;
  actions?: DeskAction<Row>[];
}

interface Props<Row> {
  icon: LucideIcon;
  title: string;
  description: string;
  regulatoryNote?: string;
  stats: DeskStat[];
  columns: DeskColumn<Row>[];
  tabs: DeskTab<Row>[];
  searchKey?: (r: Row) => string;
  headerAction?: ReactNode;
}

export function AdminDeskPage<Row>({
  icon: Icon, title, description, regulatoryNote,
  stats, columns, tabs, searchKey, headerAction,
}: Props<Row>) {
  const [query, setQuery] = useState("");
  const [tabValue, setTabValue] = useState(tabs[0]?.value ?? "");

  const filter = (rows: Row[]) => {
    if (!query || !searchKey) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => searchKey(r).toLowerCase().includes(q));
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Icon className="h-7 w-7" /> {title}
          </h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        {headerAction}
      </div>

      {regulatoryNote && (
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Regulatory context</AlertTitle>
          <AlertDescription>{regulatoryNote}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-2xl font-semibold">{s.value}</div>
              {s.hint && <div className="text-xs text-muted-foreground mt-1">{s.hint}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Work queue</CardTitle>
            <CardDescription>Triage, action and audit-log every item.</CardDescription>
          </div>
          {searchKey && (
            <div className="relative w-64">
              <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="pl-8" />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList>
              {tabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label} <Badge variant="secondary" className="ml-2">{t.rows.length}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((t) => (
              <TabsContent key={t.value} value={t.value}>
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((c) => <TableHead key={c.header}>{c.header}</TableHead>)}
                        {t.actions && t.actions.length > 0 && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filter(t.rows).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground py-6">
                            {t.emptyLabel ?? "Nothing to action."}
                          </TableCell>
                        </TableRow>
                      )}
                      {filter(t.rows).map((r, i) => (
                        <TableRow key={i}>
                          {columns.map((c) => <TableCell key={c.header}>{c.cell(r)}</TableCell>)}
                          {t.actions && (
                            <TableCell>
                              <div className="flex gap-2">
                                {t.actions.map((a) => (
                                  <Button key={a.label} size="sm" variant={a.variant ?? "outline"} onClick={() => a.onClick(r)}>
                                    {a.label}
                                  </Button>
                                ))}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
