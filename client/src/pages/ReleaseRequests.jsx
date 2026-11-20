
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  IndianRupee,
  CheckCircle,
  Clock,
  FileText,
  X
} from "lucide-react";

import { getFDRs, updateFDR } from "../services/fdrService";
import formatCurrency from "../utils/formatCurrency";
import formatDate from "../utils/formatDate";

function ReleaseManagement() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedFDR, setSelectedFDR] = useState(null);

  const [formData, setFormData] = useState({
    releaseReference: "",
    refundAmount: "",
    releaseDate: "",
    releaseRemarks: ""
  });

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

  const getReleaseStatus = (record) => {
    return record.releaseStatus || "Pending";
  };

  const isMatured = (record) => {
    if (!record.maturityDate) return false;

    const maturityDate = new Date(record.maturityDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return maturityDate <= today;
  };

  const eligibleRecords = records.filter(
    (record) => isMatured(record)
  );

  const pendingCount = eligibleRecords.filter(
    (record) => getReleaseStatus(record) === "Pending"
  ).length;

  const processingCount = eligibleRecords.filter(
    (record) => getReleaseStatus(record) === "Processing"
  ).length;

  const releasedCount = eligibleRecords.filter(
    (record) => getReleaseStatus(record) === "Released"
  ).length;

  const filteredRecords = eligibleRecords.filter((record) => {
    const matchesSearch =
      record.institutionName?.toLowerCase().includes(search.toLowerCase()) ||
      record.fdrNumber?.toLowerCase().includes(search.toLowerCase()) ||
      record.bankName?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || getReleaseStatus(record) === filter;

    return matchesSearch && matchesFilter;
  });

  const openReleaseForm = (record) => {
    setSelectedFDR(record);

    setFormData({
      releaseReference: record.releaseReference || "",
      refundAmount: record.refundAmount ?? record.depositAmount ?? "",
      releaseDate: record.releaseDate || "",
      releaseRemarks: record.releaseRemarks || ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const saveReleaseDetails = () => {
    if (!formData.releaseReference.trim()) {
      alert("Please enter the release reference number.");
      return;
    }

    if (!formData.releaseDate) {
      alert("Please select the release date.");
      return;
    }

    if (!formData.refundAmount || Number(formData.refundAmount) <= 0) {
      alert("Please enter a valid refund amount.");
      return;
    }

    if (new Date(formData.releaseDate + "T00:00:00") > new Date()) {
      alert("Release date cannot be in the future.");
      return;
    }

    updateFDR(selectedFDR.id, {
      releaseStatus: "Released",
      releaseReference: formData.releaseReference.trim(),
      refundAmount: Number(formData.refundAmount),
      releaseDate: formData.releaseDate,
      releaseRemarks: formData.releaseRemarks,
      releasedAt: new Date().toISOString()
    });

    setSelectedFDR(null);
    loadRecords();

    alert("Release details saved successfully.");
  };

  const markProcessing = (record) => {
    updateFDR(record.id, {
      releaseStatus: "Processing"
    });

    loadRecords();
  };

  const getStatusClass = (status) => {
    if (status === "Released") return "release-success";
    if (status === "Processing") return "release-processing";
    return "release-pending";
  };

  return (
    <div className="release-page">
      <div className="release-heading">
        <div>
          <h1>FDR Release & Refund</h1>
          <p>
            Manage matured FDRs and track their release and refund status.
          </p>
        </div>
      </div>

      <div className="release-summary">
        <div className="release-card">
          <div className="release-card-icon">
            <FileText size={22} />
          </div>
          <div>
            <p>Matured FDRs</p>
            <h2>{eligibleRecords.length}</h2>
          </div>
        </div>

        <div className="release-card">
          <div className="release-card-icon pending-icon">
            <Clock size={22} />
          </div>
          <div>
            <p>Pending Release</p>
            <h2>{pendingCount}</h2>
          </div>
        </div>

        <div className="release-card">
          <div className="release-card-icon processing-icon">
            <IndianRupee size={22} />
          </div>
          <div>
            <p>Processing</p>
            <h2>{processingCount}</h2>
          </div>
        </div>

        <div className="release-card">
          <div className="release-card-icon success-icon">
            <CheckCircle size={22} />
          </div>
          <div>
            <p>Released</p>
            <h2>{releasedCount}</h2>
          </div>
        </div>
      </div>

      <div className="release-panel">
        <div className="release-toolbar">
          <div>
            <h2>Matured FDR Register</h2>
            <p>Only FDRs that have reached their maturity date are shown.</p>
          </div>

          <div className="release-controls">
            <div className="release-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search institution, FDR or bank..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Released">Released</option>
            </select>
          </div>
        </div>

        <div className="release-table-wrapper">
          <table className="release-table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>FDR Number</th>
                <th>Bank</th>
                <th>Deposit Amount</th>
                <th>Maturity Date</th>
                <th>Release Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="release-empty">
                    No matured FDR records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const status = getReleaseStatus(record);

                  return (
                    <tr key={record.id}>
                      <td>{record.institutionName || "-"}</td>
                      <td>{record.fdrNumber || "-"}</td>
                      <td>{record.bankName || "-"}</td>
                      <td>{formatCurrency(record.depositAmount || 0)}</td>
                      <td>{formatDate(record.maturityDate)}</td>
                      <td>
                        <span className={`release-status ${getStatusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <div className="release-actions">
                          {status !== "Released" && (
                            <>
                              {status === "Pending" && (
                                <button
                                  className="release-process-btn"
                                  onClick={() => markProcessing(record)}
                                >
                                  Start
                                </button>
                              )}

                              <button
                                className="release-action-btn"
                                onClick={() => openReleaseForm(record)}
                              >
                                Record Release
                              </button>
                            </>
                          )}

                          {status === "Released" && (
                            <button
                              className="release-view-btn"
                              onClick={() => openReleaseForm(record)}
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFDR && (
        <div className="release-modal-overlay">
          <div className="release-modal">
            <div className="release-modal-heading">
              <div>
                <h2>
                  {getReleaseStatus(selectedFDR) === "Released"
                    ? "Release Details"
                    : "Record FDR Release"}
                </h2>
                <p>{selectedFDR.fdrNumber}</p>
              </div>

              <button
                className="release-close-btn"
                onClick={() => setSelectedFDR(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="release-fdr-info">
              <p>
                <strong>Institution:</strong>{" "}
                {selectedFDR.institutionName}
              </p>
              <p>
                <strong>Bank:</strong> {selectedFDR.bankName}
              </p>
              <p>
                <strong>Deposit Amount:</strong>{" "}
                {formatCurrency(selectedFDR.depositAmount || 0)}
              </p>
            </div>

            <div className="release-form">
              <label>Release Reference Number</label>
              <input
                name="releaseReference"
                value={formData.releaseReference}
                onChange={handleInputChange}
                placeholder="Enter release reference"
                disabled={getReleaseStatus(selectedFDR) === "Released"}
              />

              <label>Refund Amount (₹)</label>
              <input
                type="number"
                name="refundAmount"
                value={formData.refundAmount}
                onChange={handleInputChange}
                placeholder="Enter refund amount"
                disabled={getReleaseStatus(selectedFDR) === "Released"}
              />

              <label>Release Date</label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleInputChange}
                disabled={getReleaseStatus(selectedFDR) === "Released"}
              />

              <label>Remarks</label>
              <textarea
                name="releaseRemarks"
                value={formData.releaseRemarks}
                onChange={handleInputChange}
                placeholder="Enter remarks..."
                disabled={getReleaseStatus(selectedFDR) === "Released"}
              />

              {getReleaseStatus(selectedFDR) !== "Released" && (
                <button
                  className="release-save-btn"
                  onClick={saveReleaseDetails}
                >
                  Save Release Details
                </button>
              )}

              <button
                className="release-cancel-btn"
                onClick={() => setSelectedFDR(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReleaseManagement;
