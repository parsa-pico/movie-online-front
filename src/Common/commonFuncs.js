import { clearToken } from "../Services/authService.js";
export const persianDays = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];
export function getBackUrl() {
  const url = process.env.REACT_APP_API_URL;
  console.log(url);
  if (!url) throw new Error("back end url not defined");
  else return url;
}
export function handleLogout() {
  clearToken();
  window.location = `/`;
}
export async function tryHTTP(func, doFinally, doCatch) {
  try {
    await func();
  } catch (e) {
    if (e && e.response) {
      const expectedError =
        e.response && e.response.status >= 400 && e.response.status < 500;
      if (expectedError) alert(e.response.data);
    } else alert(e.message);

    if (doCatch) doCatch(e);
  } finally {
    if (doFinally) doFinally();
  }
}
export function areDatesOnSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
export function hasOptions(question) {
  return ["checkbox", "radio"].includes(question.type);
}
export function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "data:application/text" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
export function toggleFullScreen(elementId) {
  const container = document.getElementById(elementId);
  if (document.fullscreenElement) {
    document.exitFullscreen();
    return;
  }

  if (container.requestFullscreen) return container.requestFullscreen();
  if (container.mozRequestFullScreen) return container.mozRequestFullScreen();
  if (container.webkitRequestFullscreen)
    return container.webkitRequestFullscreen();
  if (container.msRequestFullscreen) return container.msRequestFullscreen();
}
export function secondsToTime(seconds, maxSeconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = parseInt(seconds % 60);

  const maxHours = maxSeconds ? Math.floor(maxSeconds / 3600) : hours;

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  if (maxHours > 0) {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}
export function isEmptyObj(obj) {
  return Object.keys(obj).length === 0;
}
