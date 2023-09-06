import { io } from "socket.io-client";
import { prActions } from "./store/promotion-requests-slice";
import { loginActions } from "./store/login-slice";
import { fpActions } from "./store/flagged-puzzles-slice";
import { fcActions } from "./store/flagged-comments-slice";
import { psActions } from "./store/platform-statistics-slice";

export let theSocket;

export const setSocketAdmin = (URL, options, { dispatch }) => {
  const socket = io(URL, options);
  console.log("here");
  console.log(URL);

  socket.on("message", (data) => {
    console.log(data);
  });

  socket.on("connect", (data) => {
    console.log("Just connected");
  });

  socket.on("new-promotion-request", (data) => {
    console.log("New promotion request received:", data);

    dispatch(prActions.addNewPromotionRequest(data));
  });

  socket.on("new-flagged-puzzle", (data) => {
    console.log("New flagged puzzle received:", data);

    dispatch(fpActions.addNewFlaggedPuzzle(data));
  });

  socket.on("new-flagged-comment", (data) => {
    console.log("New flagged comment received:", data);
    dispatch(fcActions.addNewFlaggedComment(data));
  });

  socket.on("remove-promotion-request", (data) => {
    console.log("Removing promotion request:", data);
    dispatch(prActions.resolvePromotionRequest(data.promID));
  });

  socket.on("remove-flagged-puzzle-ticket", (data) => {
    console.log("Removing flagged puzzle ticket:", data);
    dispatch(fpActions.resolveFlaggedPuzzle(data.ticketID));
  });

  socket.on("remove-flagged-comment-ticket", (data) => {
    console.log("Removing flagged comment ticket:", data);
    dispatch(fcActions.resolveFlaggedComment(data.ticketID));
  });

  socket.on("new-message", (data) => {
    console.log("New message ", data);
    dispatch(loginActions.addNewMessage(data));
  });

  socket.on("current-number-of-users", (data) => {
    console.log("New current number of users on platform", data);
    dispatch(psActions.setCurrentNumberOfUsers(data));
  });

  socket.on("user-banned", (data) => {
    console.log("Received ban information", data);
    dispatch(loginActions.setBanned({ banned: true, ...data }));
  });

  theSocket = socket;
};

export const emitMessage = (message, data) => {
  console.log("message is being sent over to server", message);
  theSocket.emit(message, data);
};

export const setSocketSolver = (URL, options, { dispatch }) => {
  const socket = io(URL, options);

  console.log("creating socket with url", URL);
  socket.on("connect", (data) => {
    console.log("Just connected");
  });

  socket.on("message", (data) => {
    console.log(data);
  });

  socket.on("new-message", (data) => {
    console.log("New message ", data);
    dispatch(loginActions.addNewMessage(data));
  });

  socket.on("update-role", (data) => {
    console.log("Updating role: ", data);

    const { role, lastMessage } = data;
    dispatch(loginActions.updateRole(role));
    if (lastMessage) dispatch(loginActions.addNewMessage(lastMessage));

    if (role !== "solver") {
      disconnectSocket();
      if (role === "creator") setSocketCreator(URL, options, { dispatch });
      else if (role === "administrator")
        setSocketAdmin(URL, options, { dispatch });
    }
  });

  socket.on("user-banned", (data) => {
    console.log("Received ban information", data);
    dispatch(loginActions.setBanned({ banned: true, ...data }));
  });

  theSocket = socket;
};

export const setSocketCreator = (URL, options, { dispatch }) => {
  const socket = io(URL, options);

  console.log("creating socket with url", URL);
  console.log("inside creator socket function");
  socket.on("connect", (data) => {
    console.log("Just connected");
  });

  socket.on("message", (data) => {
    console.log(data);
  });

  socket.on("new-message", (data) => {
    console.log(data);
    dispatch(loginActions.addNewMessage(data));
  });

  socket.on("user-banned", (data) => {
    console.log("Received ban information", data);
    dispatch(loginActions.setBanned({ banned: true, ...data }));
  });

  theSocket = socket;
};

export const disconnectSocket = () => {
  if (theSocket) {
    theSocket.disconnect();
    theSocket = undefined;
    console.log("Just disconnected the client");
  } else {
    console.log("Could not disconnect the client because it is not connected.");
  }
};
