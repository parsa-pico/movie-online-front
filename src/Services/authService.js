import jwtDecode from "jwt-decode";
// TODO: change this
const storage = sessionStorage;
export function getToken() {
  return storage.getItem("token");
}
export function setToken(token) {
  storage.setItem("token", token);
}
export function clearToken() {
  storage.removeItem("token");
}
export function getDecodedToken() {
  return jwtDecode(getToken());
}
export const authHeader = {
  headers: { ["x-auth-token"]: getToken() },
};
