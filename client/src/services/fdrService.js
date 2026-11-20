
const STORAGE_KEY = "aicte_fdr_records";

const readRecords = () => {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
  } catch {
    return [];
  }
};

const saveRecords = (records) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(records)
  );

  window.dispatchEvent(new Event("fdr-records-updated"));
};

export const getFDRs = () => readRecords();

export const getFDRById = (id) => {
  return readRecords().find(
    (record) => record.id === id
  );
};

export const addFDR = (data) => {
  const records = readRecords();

  const duplicate = records.some(
    (record) =>
      record.institutionId === data.institutionId &&
      record.fdrNumber === data.fdrNumber
  );

  if (duplicate) {
    throw new Error(
      "This FDR number already exists for this institution."
    );
  }

  const newRecord = {
    ...data,
    id: crypto.randomUUID(),
    verificationStatus: "Pending",
    reviewStatus: "Pending",
    createdAt: new Date().toISOString(),
    issues: [],
    verificationResults: []
  };

  records.unshift(newRecord);
  saveRecords(records);

  return newRecord;
};

export const updateFDR = (id, updates) => {
  const records = readRecords();

  const updatedRecords = records.map((record) =>
    record.id === id
      ? { ...record, ...updates, updatedAt: new Date().toISOString() }
      : record
  );

  saveRecords(updatedRecords);

  return updatedRecords.find(
    (record) => record.id === id
  );
};

export const deleteFDR = (id) => {
  const records = readRecords().filter(
    (record) => record.id !== id
  );

  saveRecords(records);
};

export const clearAllFDRs = () => {
  saveRecords([]);
};
