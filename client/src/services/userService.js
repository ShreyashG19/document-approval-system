import api from "./api";

export const userService = {
  async getUsers() {
    const response = await api.get("/user/get-users");
    return response.data;
  },

  async setUserStatus(username, isActive) {
    const response = await api.post("/user/set-user-status", {
      username,
      isActive,
    });
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.post("/user/update-profile", data);
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post("/user/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
