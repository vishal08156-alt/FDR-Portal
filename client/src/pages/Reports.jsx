
import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  Search,
  FileSpreadsheet,
  IndianRupee,
  Landmark,
  CalendarClock,
  CheckCircle
} from "lucide-react";

import { getFDRs } from "../services/fdrService";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value + "T00:00:00");

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN");
}

function getMaturityStatus(record) {
  if (!record.maturityDate) return "Date Missing";

  const maturity = new Date(record.maturityDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Math.ceil(
    (maturity - today) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) return "Matured";
  if (days <= 30) return "Expiring Soon";

  return "Active";
}

function Reports() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadRecords = () => {
    setRecords(getFDRs());
  };

  useEffect(() => {
    loadRecords();

    window.addEventListener("fdr-records-updated", loadRecords);
    window.addEventListener("storage", loadRecords);

    return () => {
      window.removeEventListener("fdr-records-updated", loadRecords);
      window.removeEventListener("storage", loadRecords);
    };
  }, []);

  const institutions = useMemo(() => {
    return [
      ...new Set(
        records
          .map((record) => record.institutionName)
          .filter(Boolean)
      )
    ].sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (record.institutionName || "").toLowerCase().includes(searchText) ||
        (record.fdrNumber || "").toLowerCase().includes(searchText) ||
        (record.bankName || "").toLowerCase().includes(searchText) ||
        (record.aicteId || "").toLowerCase().includes(searchText);

      const matchesInstitution =
        institutionFilter === "All" ||
        record.institutionName === institutionFilter;

      const matchesStatus =
        statusFilter === "All" ||
        getMaturityStatus(record) === statusFilter;

      return matchesSearch && matchesInstitution && matchesStatus;
    });
  }, [records, search, institutionFilter, statusFilter]);

  const summary = useMemo(() => {
    const totalDeposit = filteredRecords.reduce(
      (sum, record) => sum + Number(record.depositAmount || 0),
      0
    );

    const totalRefund = filteredRecords.reduce(
      (sum, record) => sum + Number(record.refundAmount || 0),
      0
    );

    const matured = filteredRecords.filter(
      (record) => getMaturityStatus(record) === "Matured"
    ).length;

    const verified = filteredRecords.filter(
      (record) => record.verificationStatus === "Verified"
    ).length;

    const released = filteredRecords.filter(
      (record) => record.releaseStatus === "Released"
    ).length;

    return {
      total: filteredRecords.length,
      totalDeposit,
      totalRefund,
      matured,
      verified,
      released
    };
  }, [filteredRecords]);

  const institutionSummary = useMemo(() => {
    const grouped = {};

    filteredRecords.forEach((record) => {
      const name = record.institutionName || "Unknown Institution";

      if (!grouped[name]) {
        grouped[name] = {
          name,
          count: 0,
          amount: 0,
          matured: 0
        };
      }

      grouped[name].count += 1;
      grouped[name].amount += Number(record.depositAmount || 0);

      if (getMaturityStatus(record) === "Matured") {
        grouped[name].matured += 1;
      }
    });

    return Object.values(grouped).sort(
      (a, b) => b.amount - a.amount
    );
  }, [filteredRecords]);

  const downloadCSV = () => {
    if (filteredRecords.length === 0) {
      alert("No records available to export.");
      return;
    }

    const headers = [
      "Institution",
      "AICTE ID",
      "FDR Number",
      "Bank",
      "Deposit Amount",
      "Interest Rate",
      "Issue Date",
      "Maturity Date",
      "Maturity Status",
      "Verification Status",
      "Release Status",
      "Refund Amount",
      "Release Reference",
      "Release Date"
    ];

    const rows = filteredRecords.map((record) => [
      record.institutionName,
      record.aicteId,
      record.fdrNumber,
      record.bankName,
      record.depositAmount,
      record.interestRate,
      record.issueDate,
      record.maturityDate,
      getMaturityStatus(record),
      record.verificationStatus || "Pending",
      record.releaseStatus || "Pending",
      record.refundAmount || 0,
      record.releaseReference || "",
      record.releaseDate || ""
    ]);

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(","))
    ].join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "FDR_Report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      <div className="reports-heading">
        <div>
          <h1>Reports & Analytics</h1>
          <p>
            View FDR statistics, financial summaries and institution-wise reports.
          </p>
        </div>

        <button className="reports-export-btn" onClick={downloadCSV}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="reports-summary">
        <div className="report-card">
          <div className="report-icon blue">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <p>Total FDR Records</p>
            <h2>{summary.total}</h2>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon green">
            <IndianRupee size={22} />
          </div>
          <div>
            <p>Total Deposit Value</p>
            <h2>{formatCurrency(summary.totalDeposit)}</h2>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon orange">
            <CalendarClock size={22} />
          </div>
          <div>
            <p>Matured FDRs</p>
            <h2>{summary.matured}</h2>
          </div>
        </div>

        <div className="report-card">
          <div className="report-icon purple">
            <CheckCircle size={22} />
          </div>
          <div>
            <p>Verified FDRs</p>
            <h2>{summary.verified}</h2>
          </div>
        </div>
      </div>

      <div className="reports-financial">
        <div className="financial-card">
          <p>Total Refund Recorded</p>
          <h2>{formatCurrency(summary.totalRefund)}</h2>
          <span>Based on recorded refund amounts</span>
        </div>

        <div className="financial-card">
          <p>Total FDRs Released</p>
          <h2>{summary.released}</h2>
          <span>Release status marked as Released</span>
        </div>
      </div>

      <div className="reports-panel">
        <div className="reports-panel-heading">
          <div>
            <h2>FDR Register Report</h2>
            <p>Search and filter your institution's FDR records.</p>
          </div>
        </div>

        <div className="reports-filters">
          <div className="reports-search">
            <Search size={18} />
            <input
              placeholder="Search institution, FDR, bank or AICTE ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
          >
            <option value="All">All Institutions</option>
            {institutions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Maturity Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Matured">Matured</option>
            <option value="Date Missing">Date Missing</option>
          </select>
        </div>

        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>AICTE ID</th>
                <th>FDR Number</th>
                <th>Bank</th>
                <th>Deposit Amount</th>
                <th>Maturity Date</th>
                <th>Maturity Status</th>
                <th>Verification</th>
                <th>Release</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="reports-empty">
                    No matching FDR records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.institutionName || "-"}</td>
                    <td>{record.aicteId || "-"}</td>
                    <td>{record.fdrNumber || "-"}</td>
                    <td>{record.bankName || "-"}</td>
                    <td>{formatCurrency(record.depositAmount)}</td>
                    <td>{formatDate(record.maturityDate)}</td>
                    <td>{getMaturityStatus(record)}</td>
                    <td>{record.verificationStatus || "Pending"}</td>
                    <td>{record.releaseStatus || "Pending"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="reports-footer">
          Showing {filteredRecords.length} of {records.length} records
        </div>
      </div>

      <div className="reports-panel institution-panel">
        <div className="reports-panel-heading">
          <div>
            <h2>
              <Landmark size={20} />
              Institution-wise Summary
            </h2>
            <p>Deposit distribution across institutions.</p>
          </div>
        </div>

        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Total FDRs</th>
                <th>Total Deposit Value</th>
                <th>Matured FDRs</th>
              </tr>
            </thead>

            <tbody>
              {institutionSummary.length === 0 ? (
                <tr>
                  <td colSpan="4" className="reports-empty">
                    No institution data available.
                  </td>
                </tr>
              ) : (
                institutionSummary.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.count}</td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>{item.matured}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
