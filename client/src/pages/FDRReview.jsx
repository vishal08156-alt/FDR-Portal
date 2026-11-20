
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, AlertTriangle,
  FileText, Download
} from "lucide-react";

import { getFDRById, updateFDR } from "../services/fdrService";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import { getMaturityStatus } from "../utils/fdrStatus";

function FDRReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);

  useEffect(() => {
    setRecord(id ? getFDRById(id) : null);
  }, [id]);

  if (!record) {
    return (
      <div className="empty-review panel">
        <FileText size={42} />
        <h2>No FDR Selected</h2>
        <p>Select an actual submitted FDR from the verification queue.</p>
        <button
          className="primary-button"
          onClick={() => navigate("/verification-queue")}
        >
          Open Verification Queue
        </button>
      </div>
    );
  }

  const fields = [
    ["FDR Number", record.fdrNumber],
    ["Bank", record.bankName],
    ["Branch", record.branchName],
    ["IFSC", record.ifscCode],
    ["Depositor", record.depositorName],
    ["Beneficiary", record.beneficiaryName],
    ["Deposit Amount", formatCurrency(record.depositAmount)],
    ["Interest Rate", `${record.interestRate || 0}%`],
    ["Issue Date", formatDate(record.issueDate)],
    ["Maturity Date", formatDate(record.maturityDate)],
    ["Maturity Amount", formatCurrency(record.maturityAmount)],
    ["Lien Status", record.lienStatus]
  ];

  const handleReview = (decision) => {
    const updated = updateFDR(id, {
      reviewStatus: "Reviewed",
      verificationStatus: decision,
      reviewedAt: new Date().toISOString()
    });

    setRecord(updated);
  };

  const downloadJSON = () => {
    const blob = new Blob(
      [JSON.stringify(record, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `FDR-${record.fdrNumber}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="dynamic-page">

      <div className="page-heading">
        <div>
          <h2>FDR Verification Review</h2>
          <p>{record.institutionName} · {record.fdrNumber}</p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/verification-queue")}
        >
          <ArrowLeft size={16} />
          Back to Queue
        </button>
      </div>

      <div className="review-grid">

        <section className="panel document-panel">
          <h3>Original Uploaded Document</h3>

          {record.document?.type === "application/pdf" ? (
            <iframe
              className="uploaded-document"
              src={record.document.data}
              title="Uploaded FDR"
            />
          ) : record.document?.type?.startsWith("image/") ? (
            <img
              className="uploaded-document uploaded-image"
              src={record.document.data}
              alt="Uploaded FDR"
            />
          ) : (
            <p>Document unavailable.</p>
          )}

          <p className="document-filename">
            {record.document?.name}
          </p>
        </section>

        <section className="panel">
          <h3>Submitted FDR Information</h3>

          <div className="dynamic-fields">
            {fields.map(([label, value]) => (
              <div className="dynamic-field" key={label}>
                <span>{label}</span>
                <strong>{value || "Not Provided"}</strong>
              </div>
            ))}
          </div>

          <button
            className="download-button"
            onClick={downloadJSON}
          >
            <Download size={15} />
            Download Record JSON
          </button>
        </section>

        <div className="right-column">

          <section className="panel">
            <h3>FDR Status</h3>

            <div className="dynamic-status">
              {record.verificationStatus}
            </div>

            <p>
              Review: {record.reviewStatus}
            </p>

            <p>
              Maturity: {getMaturityStatus(record.maturityDate)}
            </p>
          </section>

          <section className="panel">
            <h3>Initial Data Checks</h3>

            {[
              ["FDR Number", Boolean(record.fdrNumber)],
              ["Institution ID", Boolean(record.institutionId)],
              ["Bank Name", Boolean(record.bankName)],
              ["Deposit Amount", Number(record.depositAmount) > 0],
              ["Date Sequence", new Date(record.maturityDate) > new Date(record.issueDate)],
              ["Beneficiary", Boolean(record.beneficiaryName)]
            ].map(([name, passed]) => (
              <div className="rule-item" key={name}>
                <strong>{name}</strong>
                <span className={`rule-status ${passed ? "pass" : "fail"}`}>
                  {passed ? "Provided" : "Missing / Invalid"}
                </span>
              </div>
            ))}
          </section>

          <section className="panel">
            <h3>Officer Review</h3>

            <p className="review-help">
              Choose the appropriate administrative decision after
              examining the original document and applicable records.
            </p>

            <button
              className="mark-reviewed-button"
              onClick={() => handleReview("Verified")}
            >
              <CheckCircle size={16} />
              Mark as Verified
            </button>

            <button
              className="decision-button"
              onClick={() => handleReview("Discrepancy")}
            >
              <AlertTriangle size={16} />
              Flag Discrepancy
            </button>

            <button
              className="decision-button reject-button"
              onClick={() => handleReview("Rejected")}
            >
              Reject Submission
            </button>

            {record.reviewedAt && (
              <p className="review-help">
                Last review: {new Date(record.reviewedAt).toLocaleString("en-IN")}
              </p>
            )}
          </section>

        </div>

      </div>
    </div>
  );
}

export default FDRReview;
