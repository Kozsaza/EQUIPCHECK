"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import type { Validation, ValidationResult } from "@/types";

interface PdfDownloadButtonProps {
  validation: Validation;
  result: ValidationResult;
}

export function PdfDownloadButton({ validation, result }: PdfDownloadButtonProps) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);

    try {
      // Dynamic import to avoid SSR issues with @react-pdf/renderer
      const { pdf, Document, Page, Text, View, StyleSheet } = await import(
        "@react-pdf/renderer"
      );

      const styles = StyleSheet.create({
        page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
        header: { fontSize: 20, marginBottom: 4, fontFamily: "Helvetica-Bold" },
        subheader: { fontSize: 12, color: "#666", marginBottom: 20 },
        sectionTitle: {
          fontSize: 14,
          fontFamily: "Helvetica-Bold",
          marginTop: 16,
          marginBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: "#ddd",
          paddingBottom: 4,
        },
        statusPass: { color: "#16a34a", fontSize: 16, fontFamily: "Helvetica-Bold" },
        statusFail: { color: "#dc2626", fontSize: 16, fontFamily: "Helvetica-Bold" },
        statusReview: { color: "#ca8a04", fontSize: 16, fontFamily: "Helvetica-Bold" },
        statsRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 4,
        },
        tableRow: {
          flexDirection: "row",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
          paddingVertical: 4,
        },
        tableHeader: {
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: "#333",
          paddingBottom: 4,
          marginBottom: 4,
          fontFamily: "Helvetica-Bold",
        },
        col1: { width: "30%" },
        col2: { width: "30%" },
        col3: { width: "15%" },
        col4: { width: "25%" },
        footer: {
          position: "absolute",
          bottom: 30,
          left: 40,
          right: 40,
          fontSize: 8,
          color: "#999",
          textAlign: "center",
        },
      });

      const { summary, matches, mismatches, missing_from_equipment, extra_in_equipment } = result;

      const statusStyle =
        summary.validation_status === "PASS"
          ? styles.statusPass
          : summary.validation_status === "FAIL"
            ? styles.statusFail
            : styles.statusReview;

      const doc = (
        <Document>
          <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Equipment Validation Report</Text>
            <Text style={styles.subheader}>
              {validation.spec_name} | {validation.equipment_filename ?? "Equipment List"} |{" "}
              {new Date(validation.created_at).toLocaleDateString()}
            </Text>

            <Text style={statusStyle}>
              Status: {summary.validation_status}
            </Text>

            <View style={{ marginTop: 12 }}>
              <View style={styles.statsRow}>
                <Text>Total Equipment Items: {summary.total_equipment_items}</Text>
                <Text>Total Spec Items: {summary.total_spec_items}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text>Exact Matches: {summary.exact_matches}</Text>
                <Text>Partial Matches: {summary.partial_matches}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text>Mismatches: {summary.mismatches}</Text>
                <Text>Missing: {summary.missing}</Text>
                <Text>Extra: {summary.extra}</Text>
              </View>
            </View>

            {matches.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Matches ({matches.length})</Text>
                <View style={styles.tableHeader}>
                  <Text style={styles.col1}>Equipment</Text>
                  <Text style={styles.col2}>Spec</Text>
                  <Text style={styles.col3}>Type</Text>
                  <Text style={styles.col4}>Notes</Text>
                </View>
                {matches.map((m, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.col1}>{m.equipment_item}</Text>
                    <Text style={styles.col2}>{m.spec_item}</Text>
                    <Text style={styles.col3}>
                      {m.match_type} {m.quantity_match ? "" : `(Qty: ${m.equipment_qty}/${m.spec_qty})`}
                    </Text>
                    <Text style={styles.col4}>{m.notes}</Text>
                  </View>
                ))}
              </View>
            )}

            {mismatches.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Mismatches ({mismatches.length})</Text>
                <View style={styles.tableHeader}>
                  <Text style={styles.col1}>Equipment</Text>
                  <Text style={styles.col2}>Expected</Text>
                  <Text style={styles.col3}>Issue</Text>
                  <Text style={styles.col4}>Values</Text>
                </View>
                {mismatches.map((m, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.col1}>{m.equipment_item}</Text>
                    <Text style={styles.col2}>{m.spec_item}</Text>
                    <Text style={styles.col3}>{m.issue}</Text>
                    <Text style={styles.col4}>
                      Got: {m.equipment_value} / Expected: {m.spec_value}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {missing_from_equipment.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>
                  Missing Items ({missing_from_equipment.length})
                </Text>
                {missing_from_equipment.map((m, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.col1}>{m.spec_item}</Text>
                    <Text style={styles.col3}>Qty: {m.spec_qty}</Text>
                    <Text style={styles.col4}>{m.notes}</Text>
                  </View>
                ))}
              </View>
            )}

            {extra_in_equipment.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>
                  Extra Items ({extra_in_equipment.length})
                </Text>
                {extra_in_equipment.map((m, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.col1}>{m.equipment_item}</Text>
                    <Text style={styles.col3}>Qty: {m.equipment_qty}</Text>
                    <Text style={styles.col4}>{m.notes}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.footer}>
              Generated by EquipCheck | {new Date().toISOString()}
            </Text>
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `validation-${validation.spec_name.replace(/\s+/g, "-").toLowerCase()}-${new Date(validation.created_at).toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={generating}>
      {generating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {generating ? "Generating..." : "Download PDF"}
    </Button>
  );
}
