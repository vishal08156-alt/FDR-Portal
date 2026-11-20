
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { addFDR } from "../services/fdrService";

const initialForm = {
  institutionName: "",
  institutionId: "",
  fdrNumber: "",
  bankName: "",
  branchName: "",
  ifscCode: "",
  depositorName: "",
  beneficiaryName: "AICTE",
  depositAmount: "",
  interestRate: "",
  issueDate: "",
  maturityDate: "",
  maturityAmount: "",
  lienStatus: "Pending Confirmation"
};

function UploadFDR() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFile = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png"
    ];

    if (!allowed.includes(selected.type)) {
      setError("Only PDF, JPG and PNG files are allowed.");
      e.target.value = "";
      return;
    }

    if (selected.size > 2 * 1024 * 1024) {
      setError(
        "For this local demo, please upload a file smaller than 2 MB."
      );
      e.target.value = "";
      return;
    }

    setError("");
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please upload the original FDR document.");
      return;
    }

    if (new Date(form.maturityDate) <= new Date(form.issueDate)) {
      setError("Maturity date must be after issue date.");
      return;
    }

    if (form.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(
      form.ifscCode.toUpperCase()
    )) {
      setError("Please enter a valid IFSC format.");
      return;
    }

    setSaving(true);

    try {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          addFDR({
            ...form,
            ifscCode: form.ifscCode.toUpperCase(),
            depositAmount: Number(form.depositAmount),
            interestRate: Number(form.interestRate),
            maturityAmount: Number(form.maturityAmount),
            document: {
              name: file.name,
              type: file.type,
              data: reader.result
            }
          });

          navigate("/verification-queue");
        } catch (err) {
          setError(err.message || "Unable to save FDR.");
          setSaving(false);
        }
      };

      reader.onerror = () => {
        setError("Unable to read the uploaded document.");
        setSaving(false);
      };

      reader.readAsDataURL(file);

    } catch {
      setError("Something went wrong.");
      setSaving(false);
    }
  };

  return (
    <div className="dynamic-page">
      <div className="page-heading">
        <div>
          <h2>Upload New FDR</h2>
          <p>Submit institution security deposit details and documents.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">

        <section className="panel">
          <h3>Institution Information</h3>

          <div className="form-grid">
            <label>
              Institution Name *
              <input
                name="institutionName"
                value={form.institutionName}
                onChange={handleChange}
                required
                placeholder="Enter institution name"
              />
            </label>

            <label>
              AICTE Permanent ID *
              <input
                name="institutionId"
                value={form.institutionId}
                onChange={handleChange}
                required
                placeholder="Enter AICTE ID"
              />
            </label>
          </div>
        </section>

        <section className="panel">
          <h3>Bank and FDR Information</h3>

          <div className="form-grid">
            <label>
              FDR Number *
              <input
                name="fdrNumber"
                value={form.fdrNumber}
                onChange={handleChange}
                required
                placeholder="Enter FDR number"
              />
            </label>

            <label>
              Bank Name *
              <input
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                required
                placeholder="Enter bank name"
              />
            </label>

            <label>
              Branch Name
              <input
                name="branchName"
                value={form.branchName}
                onChange={handleChange}
                placeholder="Enter branch name"
              />
            </label>

            <label>
              IFSC Code
              <input
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                maxLength={11}
                placeholder="e.g. SBIN0001234"
              />
            </label>

            <label>
              Depositor Name
              <input
                name="depositorName"
                value={form.depositorName}
                onChange={handleChange}
                placeholder="Enter depositor name"
              />
            </label>

            <label>
              Beneficiary Name *
              <input
                name="beneficiaryName"
                value={form.beneficiaryName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Deposit Amount (₹) *
              <input
                type="number"
                name="depositAmount"
                value={form.depositAmount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
              />
            </label>

            <label>
              Interest Rate (%)
              <input
                type="number"
                name="interestRate"
                value={form.interestRate}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.001"
              />
            </label>

            <label>
              Issue Date *
              <input
                type="date"
                name="issueDate"
                value={form.issueDate}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Maturity Date *
              <input
                type="date"
                name="maturityDate"
                value={form.maturityDate}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Maturity Amount (₹)
              <input
                type="number"
                name="maturityAmount"
                value={form.maturityAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </label>

            <label>
              Lien Status
              <select
                name="lienStatus"
                value={form.lienStatus}
                onChange={handleChange}
              >
                <option>Pending Confirmation</option>
                <option>Lien Marked</option>
                <option>Not Marked</option>
                <option>Requires Verification</option>
              </select>
            </label>
          </div>
        </section>

        <section className="panel">
          <h3>Upload Original FDR Document</h3>

          <label className="upload-dropzone">
            <Upload size={28} />

            <strong>
              {file ? file.name : "Click to select FDR document"}
            </strong>

            <span>PDF, JPG or PNG · Maximum 2 MB for this demo</span>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFile}
              hidden
            />
          </label>

          {file && (
            <div className="selected-file">
              <FileText size={18} />

              <span>{file.name}</span>

              <button
                type="button"
                onClick={() => setFile(null)}
              >
                <X size={17} />
              </button>
            </div>
          )}
        </section>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            <CheckCircle size={17} />
            {saving ? "Submitting..." : "Submit FDR"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default UploadFDR;
