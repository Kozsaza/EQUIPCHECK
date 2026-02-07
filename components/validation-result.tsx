"use client";

import type { ValidationResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react";

interface ValidationResultProps {
  result: ValidationResult;
}

export function ValidationResultView({ result }: ValidationResultProps) {
  const { summary, matches, mismatches, missing_from_equipment, extra_in_equipment } =
    result;

  const statusIcon = {
    PASS: <CheckCircle2 className="h-6 w-6 text-green-500" />,
    FAIL: <XCircle className="h-6 w-6 text-red-500" />,
    REVIEW_NEEDED: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
  };

  const statusColor = {
    PASS: "bg-green-50 border-green-200 text-green-800",
    FAIL: "bg-red-50 border-red-200 text-red-800",
    REVIEW_NEEDED: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className={statusColor[summary.validation_status]}>
        <CardContent className="flex items-center gap-4 pt-6">
          {statusIcon[summary.validation_status]}
          <div>
            <h3 className="text-lg font-bold">
              {summary.validation_status === "PASS"
                ? "Validation Passed"
                : summary.validation_status === "FAIL"
                  ? "Validation Failed"
                  : "Review Needed"}
            </h3>
            <p className="text-sm">
              {summary.exact_matches} exact matches, {summary.partial_matches}{" "}
              partial, {summary.mismatches} mismatches, {summary.missing} missing,{" "}
              {summary.extra} extra
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">{summary.exact_matches}</p>
            <p className="text-xs text-muted-foreground">Exact</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{summary.partial_matches}</p>
            <p className="text-xs text-muted-foreground">Partial</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.mismatches}</p>
            <p className="text-xs text-muted-foreground">Mismatches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{summary.missing}</p>
            <p className="text-xs text-muted-foreground">Missing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{summary.extra}</p>
            <p className="text-xs text-muted-foreground">Extra</p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Tabs */}
      <Tabs defaultValue="matches">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="matches">
            Matches ({matches.length})
          </TabsTrigger>
          <TabsTrigger value="mismatches">
            Mismatches ({mismatches.length})
          </TabsTrigger>
          <TabsTrigger value="missing">
            Missing ({missing_from_equipment.length})
          </TabsTrigger>
          <TabsTrigger value="extra">
            Extra ({extra_in_equipment.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Matched Items</CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment Item</TableHead>
                        <TableHead>Spec Item</TableHead>
                        <TableHead>Match</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.equipment_item}</TableCell>
                          <TableCell>{m.spec_item}</TableCell>
                          <TableCell>
                            <Badge variant={m.match_type === "exact" ? "default" : "secondary"}>
                              {m.match_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {m.quantity_match ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <span className="text-red-600">
                                {m.equipment_qty} vs {m.spec_qty}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {m.notes}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState message="No matches found" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mismatches">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mismatched Items</CardTitle>
            </CardHeader>
            <CardContent>
              {mismatches.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment Item</TableHead>
                        <TableHead>Expected Spec Item</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Got</TableHead>
                        <TableHead>Expected</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mismatches.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.equipment_item}</TableCell>
                          <TableCell>{m.spec_item}</TableCell>
                          <TableCell className="text-red-600">{m.issue}</TableCell>
                          <TableCell>{m.equipment_value}</TableCell>
                          <TableCell>{m.spec_value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState message="No mismatches" icon="check" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Missing from Equipment List</CardTitle>
            </CardHeader>
            <CardContent>
              {missing_from_equipment.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Spec Item</TableHead>
                        <TableHead>Required Qty</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {missing_from_equipment.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.spec_item}</TableCell>
                          <TableCell>{m.spec_qty}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {m.notes}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState message="Nothing missing" icon="check" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extra">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Extra Items (not in spec)</CardTitle>
            </CardHeader>
            <CardContent>
              {extra_in_equipment.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extra_in_equipment.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.equipment_item}</TableCell>
                          <TableCell>{m.equipment_qty}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {m.notes}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState message="No extra items" icon="check" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message, icon }: { message: string; icon?: "check" | "info" }) {
  return (
    <div className="flex flex-col items-center py-8 text-muted-foreground">
      {icon === "check" ? (
        <CheckCircle2 className="mb-2 h-8 w-8 text-green-400" />
      ) : (
        <HelpCircle className="mb-2 h-8 w-8" />
      )}
      <p className="text-sm">{message}</p>
    </div>
  );
}
