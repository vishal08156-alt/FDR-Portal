
import React, { useEffect, useState } from "react";
import { Search, Eye, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getFDRs, deleteFDR } from "../services/fdrService";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import { getMaturityStatus } from "../utils/fdrStatus";

function VerificationQueue() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const loadRecords = () => {
    setRecords(getFDRs());
  };

  useEffect(() => {
    loadRecords();

    window.addEventListener("fdr-records-updated", loadRecords);

    return () => {
      window.removeEventListener("fdr-records-updated", loadRecords);
    };
  }, []);

  const filteredRecords = records.filter((record) => {
    const query = search.toLowerCase();

    const matchesSearch = [
      record.fdrNumber,
      record.institutionName,
      record.bankName,
      record.institutionId
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );

    const matchesStatus =
      status === "All" ||
      record.verificationStatus === status;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id) => {
    if (!window.confirm("Delete this FDR record?")) return;

    deleteFDR(id);
    loadRecords();
  };

  return (
    <div className="dynamic-page">

      <div className="page-heading">
        <div>
          <h2>Verification Queue</h2>
          <p>Manage submitted FDR documents and verification cases.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/upload-fdr")}
        >
          <Plus size={16} />
          Upload FDR
        </button>
      </div>

      <section className="panel">

        <div className="queue-filters">
          <div className="search-box">
            <Search size={17} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FDR, institution or bank..."
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Verified">Verified</option>
            <option value="Discrepancy">Discrepancy</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="comparison-table queue-table">
            <thead>
              <tr>
                <th>FDR Number</th>
                <th>Institution</th>
                <th>Bank</th>
                <th>Amount</th>
                <th>Maturity Date</th>
                <th>Maturity Status</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.fdrNumber}</td>
                  <td>{record.institutionName}</td>
                  <td>{record.bankName}</td>
                  <td>{formatCurrency(record.depositAmount)}</td>
                  <td>{formatDate(record.maturityDate)}</td>
                  <td>{getMaturityStatus(record.maturityDate)}</td>
                  <td>
                    <span className="status-pill status-pending">
                      {record.verificationStatus}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        title="Review FDR"
                        onClick={() =>
                          navigate(`/verification-review/${record.id}`)
                        }
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        title="Delete FDR"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-state">
                    No FDR records found. Upload an FDR to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="record-count">
          Showing {filteredRecords.length} of {records.length} records
        </p>

      </section>
    </div>
  );
}

export default VerificationQueue;
