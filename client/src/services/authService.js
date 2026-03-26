import api from "./api";

export const authService = {
  async login({ username, password, deviceToken }) {
    const response = await api.post("/auth/login", {
      username,
      password,
      deviceToken,
    });
    return response.data;
  },

  async logout(deviceToken) {
    const response = await api.post("/auth/logout", { deviceToken });
    return response.data;
  },

  async getSession() {
    const response = await api.get("/auth/get-session");
    return response.data;
  },

  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
};
