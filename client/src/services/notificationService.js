import api from "./api";

export const notificationService = {
  async getNotifications() {
    const response = await api.get("/notification/get-notifications");
    return response.data;
  },

  async markSeen() {
    const response = await api.post("/notification/mark-seen", {});
    return response.data;
  },
};
