import "./App.css";
import { redirect, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import TailoredRoutes from "./TailoredRoutes";
import React, { useCallback, useEffect, useRef } from "react";
import Modal from "react-modal";
import { loginActions } from "./store/login-slice";
import { setSocketAdmin, setSocketSolver, setSocketCreator } from "./client";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useSelector } from "react-redux";
import {
  GeneralModalButtonStyle,
  modal_content,
  modal_label,
} from "./inline-styles/modal";
import GeneralButton from "./components/GeneralButton";
import text_styles from "./style-utils/text_styles";

function App() {
  const dispatch = useDispatch();
  const banRef = useRef();
  const navigate = useNavigate();
  /*const { sendMessage, lastMessage, readyState } = useWebSocket(
    "wss://cs3099user26.host.cs.st-andrews.ac.uk/ws"
  );*/
  const { banned, banMessage, banSubject } = useSelector(
    (state) => state.login
  );

  const verifyToken = useCallback(async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}users/verifyToken`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
      }
    );

    if (response.ok) {
      const data = await response.json();
      const { user, token } = data.data;

      if (user && token) {
        console.log(data);
        dispatch(loginActions.setUser({ user, isLoggedIn: true, token }));

        if (user.role === "administrator") {
          setSocketAdmin(
            `${process.env.REACT_APP_SOCKET_IO_SCHOOL}`,
            {
              withCredentials: true,
              forceNew: true,
            },
            { dispatch: dispatch }
          );
        } else if (user.role === "solver") {
          setSocketSolver(
            `${process.env.REACT_APP_SOCKET_IO_SCHOOL}`,
            {
              withCredentials: true,
              forceNew: true,
            },
            { dispatch: dispatch }
          );
        } else if (user.role === "creator") {
          setSocketCreator(
            `${process.env.REACT_APP_SOCKET_IO_SCHOOL}`,
            {
              withCredentials: true,
              forceNew: true,
            },
            { dispatch: dispatch }
          );
        }
        redirect("/");
      }
    } else {
      const data = await response.json();
      console.log(data);
      if (data.status === "banned-account") {
        dispatch(
          loginActions.setBanned({
            banned: true,
            message: data.data.message,
            subject: data.data.subject,
          })
        );
      }
      dispatch(
        loginActions.setUser({
          user: undefined,
          isLoggedIn: false,
          token: undefined,
        })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return (
    <React.Fragment>
      <TailoredRoutes />
      <Modal
        ref={banRef}
        isOpen={banned}
        ariaHideApp={false}
        onRequestClose={() => {
          dispatch(
            loginActions.setBanned({
              banned: false,
              message: undefined,
              subject: undefined,
            })
          );
          dispatch(
            loginActions.setUser({
              user: undefined,
              isLoggedIn: false,
              token: undefined,
            })
          );
          //redirect("/login");
          navigate("/");
        }}
        style={modal_content}
      >
        <span style={modal_label}>{banSubject}</span>
        <div
          style={{
            color: text_styles.colors.primary,
            fontSize: text_styles.resizbale_font.small,
            fontWeight: "bold",
            paddingTop: "1vw",
          }}
        >
          {banMessage}
        </div>
        {/*A button is provided to close the modal after reading the message*/}
        <GeneralButton
          style={GeneralModalButtonStyle}
          label={"OK"}
          handleButtonPress={() => {
            dispatch(
              loginActions.setBanned({
                banned: false,
                message: undefined,
                subject: undefined,
              })
            );
            dispatch(
              loginActions.setUser({
                user: undefined,
                isLoggedIn: false,
                token: undefined,
              })
            );
            navigate("/");
          }}
        />
      </Modal>
    </React.Fragment>
  );
}

export default App;
