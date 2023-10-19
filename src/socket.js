// import { io } from "socket.io-client";
// import { getToken } from "./Services/authService";

// // "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.REACT_APP_API_URL;

// export class NoCallBackErr extends Error {
//   constructor(msg) {
//     super(msg);
//     this.name = "NoCallBackErr";
//   }
// }

// export const socket = io(URL, { autoConnect: false });
// socket.connectWithToken = () => {
//   if (socket.disconnected) {
//     socket.io.opts.query = {
//       token: getToken(),
//     };
//     socket.connect();
//   }
// };
// socket.emitWithPromise = (eventName, data) => {
//   return new Promise((resolve, reject) => {
//     const timeout = setTimeout(() => {
//       reject(
//         new NoCallBackErr(`Timeout: No response received for ${eventName}`)
//       );
//     }, 5000); // Set a timeout for 5 seconds (adjust as needed)

//     socket.emit(eventName, data, (response) => {
//       clearTimeout(timeout);
//       console.log(response);
//       if (response && response.error) reject(new Error(response.error));
//       else resolve(response);
//     });
//   });
// };
