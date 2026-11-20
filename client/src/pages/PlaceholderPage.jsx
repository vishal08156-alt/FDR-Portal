
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function PlaceholderPage({ title, description }) {
  const navigate = useNavigate();

  return (
    <div className="placeholder-page">
      <h2>{title}</h2>

      <p>{description}</p>

      <div className="placeholder-card">
        <h3>{title} Module</h3>

        <p>
          This module is part of the AICTE FDR Management Portal.
          Its complete functionality will be implemented in the
          upcoming development stages.
        </p>

        <button
          className="primary-button"
          onClick={() => navigate("/verification-review")}
        >
          Open FDR Review
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default PlaceholderPage;
