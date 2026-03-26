import api from "./api";

export const departmentService = {
  async getAllDepartments() {
    const response = await api.get("/department/get-all-departments");
    return response.data;
  },

  async addDepartment(departmentName) {
    const response = await api.post("/department/add-department", {
      departmentName,
    });
    return response.data;
  },
};
