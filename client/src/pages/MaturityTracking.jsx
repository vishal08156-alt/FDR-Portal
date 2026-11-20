
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  FileText,
  Search,
} from "lucide-react";

import {
  getFDRs,
  updateFDR,
} from "../services/fdrService";

import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

function parseLocalDate(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function getDaysRemaining(dateValue) {
  const maturity = parseLocalDate(dateValue);
  if (!maturity) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  maturity.setHours(0, 0, 0, 0);

  return Math.ceil((maturity - today) / 86400000);
}

function getMaturityStatus(record) {
  const days = getDaysRemaining(record.maturityDate);

  if (days === null) return "Date Missing";
  if (days < 0) return "Matured";
  if (days <= 30) return "Expiring Soon";

  return "Active";
}

export default function MaturityManagement() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [renewalDate, setRenewalDate] = useState("");
  const [renewalReference, setRenewalReference] = useState("");
  const [renewalAmount, setRenewalAmount] = useState("");

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

  const summary = useMemo(() => {
    const upcoming = records.filter(
      (record) => getMaturityStatus(record) === "Expiring Soon"
    );

    const matured = records.filter(
      (record) => getMaturityStatus(record) === "Matured"
    );

    const active = records.filter(
      (record) => getMaturityStatus(record) === "Active"
    );

    const renewed = records.filter(
      (record) => record.renewalStatus === "Renewed"
    );

    return {
      upcoming: upcoming.length,
      matured: matured.length,
      active: active.length,
      renewed: renewed.length,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        const status = getMaturityStatus(record);

        if (filter === "Upcoming" && status !== "Expiring Soon") {
          return false;
        }

        if (filter === "Matured" && status !== "Matured") {
          return false;
        }

        if (filter === "Active" && status !== "Active") {
          return false;
        }

        const searchText = search.toLowerCase();

        return (
          (record.fdrNumber || "").toLowerCase().includes(searchText) ||
          (record.institutionName || "").toLowerCase().includes(searchText) ||
          (record.bankName || "").toLowerCase().includes(searchText)
        );
      })
      .sort((a, b) => {
        const dateA = parseLocalDate(a.maturityDate);
        const dateB = parseLocalDate(b.maturityDate);

        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateA - dateB;
      });
  }, [records, filter, search]);

  const openRenewalForm = (record) => {
    setSelectedRecord(record);
    setRenewalDate("");
    setRenewalReference("");
    setRenewalAmount(record.depositAmount || "");
  };

  const saveRenewal = () => {
    if (!selectedRecord) return;

    const newDate = parseLocalDate(renewalDate);
    const oldDate = parseLocalDate(selectedRecord.maturityDate);

    if (!renewalDate || !newDate || newDate <= oldDate) {
      alert("Enter a valid new maturity date after the current maturity date.");
      return;
    }

    if (!renewalReference.trim()) {
      alert("Enter the new FDR / renewal reference number.");
      return;
    }

    const history = selectedRecord.renewalHistory || [];

    const renewalEntry = {
      previousFDRNumber: selectedRecord.fdrNumber,
      previousMaturityDate: selectedRecord.maturityDate,
      newFDRNumber: renewalReference.trim(),
      newMaturityDate: renewalDate,
      renewalAmount: Number(renewalAmount || selectedRecord.depositAmount || 0),
      recordedAt: new Date().toISOString(),
    };

    updateFDR(selectedRecord.id, {
      previousMaturityDate: selectedRecord.maturityDate,
      previousFDRNumber: selectedRecord.fdrNumber,
      maturityDate: renewalDate,
      fdrNumber: renewalReference.trim(),
      depositAmount: Number(
        renewalAmount || selectedRecord.depositAmount || 0
      ),
      renewalStatus: "Renewed",
      renewalDate: new Date().toISOString().slice(0, 10),
      renewalHistory: [...history, renewalEntry],
    });

    setSelectedRecord(null);
    loadRecords();
    alert("Renewal details saved successfully.");
  };

  const markNotRenewed = (record) => {
    const confirmed = window.confirm(
      "Mark this FDR as not renewed?"
    );

    if (!confirmed) return;

    updateFDR(record.id, {
      renewalStatus: "Not Renewed",
    });

    loadRecords();
  };

  return (
    <div className="maturity-page">
      <div className="maturity-heading">
        <div>
          <h1>Maturity & Renewal Management</h1>
          <p>
            Monitor FDR maturity dates and maintain renewal records.
          </p>
        </div>

        <button className="maturity-refresh" onClick={loadRecords}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="maturity-summary">
        <div className="maturity-card">
          <CalendarClock />
          <div>
            <span>Expiring Within 30 Days</span>
            <strong>{summary.upcoming}</strong>
          </div>
        </div>

        <div className="maturity-card">
          <AlertTriangle />
          <div>
            <span>Matured FDRs</span>
            <strong>{summary.matured}</strong>
          </div>
        </div>

        <div className="maturity-card">
          <FileText />
          <div>
            <span>Active FDRs</span>
            <strong>{summary.active}</strong>
          </div>
        </div>

        <div className="maturity-card">
          <CheckCircle />
          <div>
            <span>Renewed FDRs</span>
            <strong>{summary.renewed}</strong>
          </div>
        </div>
      </div>

      <section className="maturity-panel">
        <div className="maturity-panel-heading">
          <div>
            <h2>FDR Maturity Register</h2>
            <p>All uploaded FDR instruments and their maturity status</p>
          </div>
        </div>

        <div className="maturity-controls">
          <div className="maturity-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search FDR, institution or bank..."
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="All">All FDRs</option>
            <option value="Upcoming">Expiring Soon</option>
            <option value="Matured">Matured</option>
            <option value="Active">Active</option>
          </select>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="maturity-empty">
            <CalendarClock size={35} />
            <p>No matching FDR records found.</p>
          </div>
        ) : (
          <div className="maturity-table-wrapper">
            <table className="maturity-table">
              <thead>
                <tr>
                  <th>FDR Number</th>
                  <th>Institution</th>
                  <th>Deposit Amount</th>
                  <th>Maturity Date</th>
                  <th>Days Remaining</th>
                  <th>Maturity Status</th>
                  <th>Renewal Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => {
                  const status = getMaturityStatus(record);
                  const days = getDaysRemaining(record.maturityDate);

                  return (
                    <tr key={record.id}>
                      <td>{record.fdrNumber}</td>
                      <td>{record.institutionName}</td>
                      <td>
                        {formatCurrency(Number(record.depositAmount || 0))}
                      </td>
                      <td>{formatDate(record.maturityDate)}</td>
                      <td>
                        {days === null
                          ? "—"
                          : days < 0
                            ? `${Math.abs(days)} days overdue`
                            : `${days} days`}
                      </td>
                      <td>
                        <span
                          className={`maturity-status ${status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        {record.renewalStatus || "Not Started"}
                      </td>
                      <td>
                        <div className="maturity-actions">
                          <button
                            onClick={() =>
                              navigate(`/verification-review/${record.id}`)
                            }
                          >
                            View
                          </button>

                          {status === "Matured" && (
                            <button
                              className="renew-button"
                              onClick={() => openRenewalForm(record)}
                            >
                              Renew
                            </button>
                          )}

                          {status === "Matured" && (
                            <button
                              className="not-renew-button"
                              onClick={() => markNotRenewed(record)}
                            >
                              Not Renewed
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedRecord && (
        <div className="renewal-modal-backdrop">
          <div className="renewal-modal">
            <h2>Record FDR Renewal</h2>
            <p>
              Institution: <strong>{selectedRecord.institutionName}</strong>
            </p>
            <p>
              Existing FDR: <strong>{selectedRecord.fdrNumber}</strong>
            </p>
            <p>
              Existing maturity:{" "}
              <strong>{formatDate(selectedRecord.maturityDate)}</strong>
            </p>

            <label>New FDR / Renewal Reference Number</label>
            <input
              value={renewalReference}
              onChange={(event) => setRenewalReference(event.target.value)}
              placeholder="Enter new FDR number"
            />

            <label>New Maturity Date</label>
            <input
              type="date"
              value={renewalDate}
              onChange={(event) => setRenewalDate(event.target.value)}
            />

            <label>Renewed Deposit Amount (₹)</label>
            <input
              type="number"
              min="0"
              value={renewalAmount}
              onChange={(event) => setRenewalAmount(event.target.value)}
            />

            <div className="renewal-modal-actions">
              <button onClick={() => setSelectedRecord(null)}>
                Cancel
              </button>
              <button className="renew-button" onClick={saveRenewal}>
                Save Renewal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
