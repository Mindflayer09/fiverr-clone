export const getLoggedInUser = () => {
  try {
    const user =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (err) {
    console.error("Error parsing stored user:", err);
    return null;
  }
};
