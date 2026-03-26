import api from "./api";

export const fileService = {
  async getDocuments(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.department) queryParams.append("department", params.department);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.search) queryParams.append("search", params.search);

    const response = await api.get(
      `/file/get-documents?${queryParams.toString()}`
    );
    return response.data;
  },

  async uploadPdf(formData) {
    const response = await api.post("/file/upload-pdf", formData);
    return response.data;
  },

  async downloadPdf(filename) {
    const response = await api.get(`/file/download-pdf/${filename}`);
    return response.data;
  },

  async approveDocument(fileUniqueName, remarks = "") {
    const response = await api.post("/file/approve", {
      fileUniqueName,
      remarks,
    });
    return response.data;
  },

  async rejectDocument(fileUniqueName, remarks = "") {
    const response = await api.post("/file/reject", {
      fileUniqueName,
      remarks,
    });
    return response.data;
  },

  async requestCorrection(fileUniqueName, remarks) {
    const response = await api.post("/file/correction", {
      fileUniqueName,
      remarks,
    });
    return response.data;
  },

  async getEncKey(clientPublicKey, fileUniqueName = null) {
    const body = { clientPublicKey };
    if (fileUniqueName) body.fileUniqueName = fileUniqueName;
    const response = await api.post("/file/get-enc-key", body);
    return response.data;
  },
};
