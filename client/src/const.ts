export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate Google login URL
export const getLoginUrl = () => {
  return `${window.location.origin}/api/google/login`;
};
