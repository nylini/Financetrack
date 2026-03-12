const AuthService = {
  login: ({ email, password }) => {
    return new Promise((resolve, reject) => {
      if (email === "user@test.com" && password === "123456") {
        localStorage.setItem("token", "dummy-token");
        resolve({ data: { token: "dummy-token" } });
      } else {
        reject("Invalid credentials");
      }
    });
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  isAuthenticated: () => !!localStorage.getItem("token"),
};

export default AuthService;