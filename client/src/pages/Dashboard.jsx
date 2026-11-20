
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  IndianRupee,
  CheckCircle,
  Clock,
  AlertTriangle,
  CalendarDays,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { getFDRs } from "../services/fdrService";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

function getStatus(record) {
  if (!record.maturityDate) return "Date Missing";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maturity = new Date(record.maturityDate);
  maturity.setHours(0, 0, 0, 0);

  const daysRemaining = Math.ceil(
    (maturity - today) / (1000 * 60 * 60 * 24)
  );

  if (daysRemaining < 0) return "Matured";
  if (daysRemaining <= 30) return "Expiring Soon";

  return "Active";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);

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

  const stats = useMemo(() => {
    const totalAmount = records.reduce(
      (sum, record) => sum + Number(record.depositAmount || 0),
      0
    );

    const active = records.filter(
      (record) => getStatus(record) === "Active"
    ).length;

    const expiring = records.filter(
      (record) => getStatus(record) === "Expiring Soon"
    ).length;

    const matured = records.filter(
      (record) => getStatus(record) === "Matured"
    ).length;

    const pending = records.filter(
      (record) =>
        !record.verificationStatus ||
        record.verificationStatus === "Pending"
    ).length;

    const verified = records.filter(
      (record) => record.verificationStatus === "Verified"
    ).length;

    const discrepancies = records.filter(
      (record) => record.verificationStatus === "Discrepancy"
    ).length;

    return {
      total: records.length,
      totalAmount,
      active,
      expiring,
      matured,
      pending,
      verified,
      discrepancies,
    };
  }, [records]);

  const recentRecords = [...records]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  const cards = [
    {
      title: "Total FDRs",
      value: stats.total,
      icon: FileText,
      color: "blue",
    },
    {
      title: "Total Deposit Value",
      value: formatCurrency(stats.totalAmount),
      icon: IndianRupee,
      color: "green",
    },
    {
      title: "Active FDRs",
      value: stats.active,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Expiring Soon",
      value: stats.expiring,
      icon: Clock,
      color: "orange",
    },
    {
      title: "Matured FDRs",
      value: stats.matured,
      icon: AlertTriangle,
      color: "red",
    },
    {
      title: "Pending Verification",
      value: stats.pending,
      icon: CalendarDays,
      color: "purple",
    },
  ];

  const verificationTotal =
    stats.verified + stats.pending + stats.discrepancies;

  const percentage = (value) =>
    verificationTotal
      ? Math.round((value / verificationTotal) * 100)
      : 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <h1>Dashboard</h1>
          <p>
            Overview of FDR records, deposits and verification activities.
          </p>
        </div>

        <button className="dashboard-refresh" onClick={loadRecords}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="dashboard-stats">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="dashboard-stat-card" key={card.title}>
              <div className={`dashboard-stat-icon ${card.color}`}>
                <Icon size={22} />
              </div>

              <div>
                <p>{card.title}</p>
                <h2>{card.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Verification Overview</h2>
              <p>Current status of submitted FDR records</p>
            </div>
          </div>

          {verificationTotal === 0 ? (
            <p className="dashboard-empty">
              No verification records available yet.
            </p>
          ) : (
            <div className="verification-breakdown">
              <div className="verification-row">
                <div>
                  <span className="status-dot verified-dot" />
                  Verified
                </div>
                <strong>{stats.verified}</strong>
              </div>

              <div className="verification-bar">
                <div
                  className="verification-fill verified-fill"
                  style={{ width: `${percentage(stats.verified)}%` }}
                />
              </div>

              <div className="verification-row">
                <div>
                  <span className="status-dot pending-dot" />
                  Pending
                </div>
                <strong>{stats.pending}</strong>
              </div>

              <div className="verification-bar">
                <div
                  className="verification-fill pending-fill"
                  style={{ width: `${percentage(stats.pending)}%` }}
                />
              </div>

              <div className="verification-row">
                <div>
                  <span className="status-dot discrepancy-dot" />
                  Discrepancy
                </div>
                <strong>{stats.discrepancies}</strong>
              </div>

              <div className="verification-bar">
                <div
                  className="verification-fill discrepancy-fill"
                  style={{ width: `${percentage(stats.discrepancies)}%` }}
                />
              </div>
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>FDR Status Summary</h2>
              <p>Instrument maturity status</p>
            </div>
          </div>

          <div className="status-summary-list">
            <div>
              <span>Active</span>
              <strong>{stats.active}</strong>
            </div>
            <div>
              <span>Expiring Soon</span>
              <strong>{stats.expiring}</strong>
            </div>
            <div>
              <span>Matured</span>
              <strong>{stats.matured}</strong>
            </div>
            <div>
              <span>Date Missing</span>
              <strong>
                {records.filter(
                  (record) => getStatus(record) === "Date Missing"
                ).length}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <section className="dashboard-panel recent-records-panel">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Recent FDR Submissions</h2>
            <p>Latest five submitted instruments</p>
          </div>

          <button
            className="dashboard-view-all"
            onClick={() => navigate("/verification-queue")}
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        {recentRecords.length === 0 ? (
          <div className="dashboard-empty">
            <FileText size={35} />
            <p>No FDR records have been uploaded yet.</p>
            <button
              onClick={() => navigate("/upload-fdr")}
              className="dashboard-primary-button"
            >
              Upload First FDR
            </button>
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>FDR Number</th>
                  <th>Institution</th>
                  <th>Deposit Amount</th>
                  <th>Maturity Date</th>
                  <th>Status</th>
                  <th>Verification</th>
                </tr>
              </thead>

              <tbody>
                {recentRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.fdrNumber}</td>
                    <td>{record.institutionName}</td>
                    <td>
                      {formatCurrency(Number(record.depositAmount || 0))}
                    </td>
                    <td>{formatDate(record.maturityDate)}</td>
                    <td>
                      <span className={`dashboard-status ${getStatus(record)
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}>
                        {getStatus(record)}
                      </span>
                    </td>
                    <td>
                      {record.verificationStatus || "Pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
