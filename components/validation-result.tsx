"use client";

import { useState } from "react";
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
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Flag } from "lucide-react";
import { FlagModal } from "@/components/flag-modal";

interface ValidationResultProps {
  result: ValidationResult;
  validationId?: string;
}

export function ValidationResultView({ result, validationId }: ValidationResultProps) {
  const { summary, matches, mismatches, missing_from_equipment, extra_in_equipment } =
    result;

  const [flagOpen, setFlagOpen] = useState(false);
  const [flagTarget, setFlagTarget] = useState<{
    status: string;
    specItem: string;
    equipItem: string | null;
  } | null>(null);

  const openFlag = (status: string, specItem: string, equipItem: string | null) => {
    setFlagTarget({ status, specItem, equipItem });
    setFlagOpen(true);
  };

  const FlagButton = ({ status, spec, equip }: { status: string; spec: string; equip: string | null }) => (
    <button
      onClick={() => openFlag(status, spec, equip)}
      className="rounded p-1 text-muted-foreground/40 transition-colors hover:bg-muted hover:text-muted-foreground"
      title="Flag this result"
    >
      <Flag className="h-3.5 w-3.5" />
    </button>
  );

  const statusIcon = {
    PASS: <CheckCircle2 className="h-6 w-6 text-success" />,
    FAIL: <XCircle className="h-6 w-6 text-destructive" />,
    REVIEW_NEEDED: <AlertTriangle className="h-6 w-6 text-warning" />,
  };

  const statusColor = {
    PASS: "bg-green-50 border-green-200 text-green-800",
    FAIL: "bg-red-50 border-red-200 text-red-800",
    REVIEW_NEEDED: "bg-amber-50 border-amber-200 text-amber-800",
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className={statusColor[summary.validation_status]}>
        <CardContent className="flex items-center gap-4 pt-6">
          {statusIcon[summary.validation_status]}
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              {summary.validation_status === "PASS"
                ? "Validation Passed"
                : summary.validation_status === "FAIL"
                  ? "Validation Failed"
                  : "Review Needed"}
            </h3>
            <p className="text-sm opacity-80">
              {summary.exact_matches} exact matches, {summary.partial_matches}{" "}
              partial, {summary.mismatches} mismatches, {summary.missing} missing,{" "}
              {summary.extra} extra
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confidence indicator (for dual-pass results) */}
      {result.overall_confidence && result.verification_status !== "SINGLE_PASS" && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          <div className="flex-1 text-sm">
            <span className="font-medium">
              {result.verification_status === "CONFIRMED"
                ? "Dual-Pass Verification Complete"
                : result.verification_status === "CORRECTIONS_MADE"
                  ? "Dual-Pass Verification Complete (corrections applied)"
                  : "Verification Status: " + result.verification_status}
            </span>
            <span className="mx-2 text-muted-foreground">&middot;</span>
            <span className="text-muted-foreground">
              Overall Confidence:{" "}
              <span className={`font-semibold ${
                result.overall_confidence === "HIGH" ? "text-success"
                : result.overall_confidence === "MEDIUM" ? "text-warning"
                : "text-destructive"
              }`}>{result.overall_confidence}</span>
            </span>
          </div>
        </div>
      )}

      {/* Value estimate */}
      {result.value_estimate && (result.value_estimate.errors_caught > 0) && (
        <div className="flex items-center gap-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50/50 px-4 py-3">
          <div className="text-sm text-slate-700">
            <span className="font-semibold">{result.value_estimate.errors_caught} error{result.value_estimate.errors_caught !== 1 ? "s" : ""} caught</span>
            <span className="mx-2 text-slate-400">&middot;</span>
            <span className="font-mono font-semibold text-blue-600">
              ${result.value_estimate.estimated_savings_usd.toLocaleString()}
            </span>{" "}
            estimated savings
            <span className="mx-2 text-slate-400">&middot;</span>
            ~{result.value_estimate.time_saved_minutes} min saved
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Card className="gap-0 py-4">
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-success">{summary.exact_matches}</p>
            <p className="text-xs font-medium text-muted-foreground">Exact</p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-4">
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-warning">{summary.partial_matches}</p>
            <p className="text-xs font-medium text-muted-foreground">Partial</p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-4">
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-destructive">{summary.mismatches}</p>
            <p className="text-xs font-medium text-muted-foreground">Mismatches</p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-4">
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-destructive">{summary.missing}</p>
            <p className="text-xs font-medium text-muted-foreground">Missing</p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-4">
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-secondary">{summary.extra}</p>
            <p className="text-xs font-medium text-muted-foreground">Extra</p>
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
                <div className="rounded-xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment Item</TableHead>
                        <TableHead>Spec Item</TableHead>
                        <TableHead>Match</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.equipment_item}</TableCell>
                          <TableCell>{m.spec_item}</TableCell>
                          <TableCell>
                            <Badge variant={m.match_type === "exact" ? "success" : "warning"}>
                              {m.match_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {m.quantity_match ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <span className="font-mono text-xs text-destructive">
                                {m.equipment_qty} vs {m.spec_qty}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {m.notes}
                          </TableCell>
                          <TableCell>
                            <FlagButton status={m.match_type === "exact" ? "MATCH" : "REVIEW"} spec={m.spec_item} equip={m.equipment_item} />
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
                <div className="rounded-xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment Item</TableHead>
                        <TableHead>Expected Spec Item</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Got</TableHead>
                        <TableHead>Expected</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mismatches.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.equipment_item}</TableCell>
                          <TableCell>{m.spec_item}</TableCell>
                          <TableCell className="text-destructive">{m.issue}</TableCell>
                          <TableCell className="font-mono text-xs">{m.equipment_value}</TableCell>
                          <TableCell className="font-mono text-xs">{m.spec_value}</TableCell>
                          <TableCell>
                            <FlagButton status="MISMATCH" spec={m.spec_item} equip={m.equipment_item} />
                          </TableCell>
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
                <div className="rounded-xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Spec Item</TableHead>
                        <TableHead>Required Qty</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {missing_from_equipment.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.spec_item}</TableCell>
                          <TableCell className="font-mono text-xs">{m.spec_qty}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {m.notes}
                          </TableCell>
                          <TableCell>
                            <FlagButton status="MISSING" spec={m.spec_item} equip={null} />
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
                <div className="rounded-xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extra_in_equipment.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.equipment_item}</TableCell>
                          <TableCell className="font-mono text-xs">{m.equipment_qty}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {m.notes}
                          </TableCell>
                          <TableCell>
                            <FlagButton status="EXTRA" spec={m.equipment_item} equip={m.equipment_item} />
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

      {/* Feedback banner */}
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3">
        <Flag className="h-4 w-4 shrink-0 text-blue-500" />
        <p className="text-sm text-muted-foreground">
          Did we get something wrong?{" "}
          <button
            onClick={() => openFlag("", "", null)}
            className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-700"
          >
            Flag it
          </button>{" "}
          and help us improve accuracy for your industry.
        </p>
      </div>

      {/* Flag modal */}
      {flagTarget && (
        <FlagModal
          isOpen={flagOpen}
          onClose={() => setFlagOpen(false)}
          originalStatus={flagTarget.status}
          specItem={flagTarget.specItem}
          equipmentItem={flagTarget.equipItem}
          industryDetected={result.industry_detected}
          validationId={validationId}
          validationPass={result.verification_status === "SINGLE_PASS" ? "single_pass" : "dual_pass"}
        />
      )}
    </div>
  );
}

function EmptyState({ message, icon }: { message: string; icon?: "check" | "info" }) {
  return (
    <div className="flex flex-col items-center py-8 text-muted-foreground">
      {icon === "check" ? (
        <CheckCircle2 className="mb-2 h-8 w-8 text-success/60" />
      ) : (
        <HelpCircle className="mb-2 h-8 w-8" />
      )}
      <p className="text-sm">{message}</p>
    </div>
  );
}
