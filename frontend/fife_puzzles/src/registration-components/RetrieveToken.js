import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useCallback, useRef } from "react";
import LoadingScreen from "../screens/LoadingScreen";
import { useDispatch, useSelector } from "react-redux";
import { loginActions } from "../store/login-slice";
import { setSocketAdmin, setSocketSolver, setSocketCreator } from "../client";
import {
  GeneralModalButtonStyle,
  modal_content,
  modal_label,
  multibutton_container,
} from "../inline-styles/modal";
import MainPageContainer from "../components/MainPageContainer";
import puzzles_pattern from "../images/puzzles_pattern.png";
import GeneralButton from "../components/GeneralButton";
import Modal from "react-modal";

const RetrieveToken = (props) => {
  const { token } = useParams();
  const { user, isLoggedIn } = useSelector((state) => state.login);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [invalidMessage, setInvalidMessage] = useState(undefined);

  // Verify that the token for guests shared between federation websites is correct
  const verifyCrossSiteToken = useCallback(async () => {
    console.log("Bla, Bla");
    console.log(token);
    // Request the server validates the guest's JWT
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}users/validateGuest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
        // Send the guest's JWT
        body: JSON.stringify({
          token,
        }),
      }
    );

    // The request was successful and the token is valid
    if (response.ok) {
      // The guest user and its token are stored so that they can use the website as a guest
      const data = await response.json();
      const { user, token } = data.data;

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
      dispatch(loginActions.setUser({ user, isLoggedIn: true, token }));
      navigate("/");
    } else {
      const data = await response.json();
      console.log(data);
      const { message } = data;
      if (data.status === "banned-account") {
        dispatch(
          loginActions.setBanned({
            banned: true,
            message: data.data.message,
            subject: data.data.subject,
          })
        );
      }
      setInvalidMessage(message);
    }
  }, [token, dispatch, navigate]);

  // If there is a token then it needs to be verified
  useEffect(() => {
    if (token && !isLoggedIn) {
      verifyCrossSiteToken();
    }
  }, [verifyCrossSiteToken, token, isLoggedIn]);

  const [switchAccountModalIsOpen, setSwitchAccountModalIsOpen] = useState(
    isLoggedIn === true
  );

  const switchAccountModalRef = useRef();
  const invalidMessageModalRef = useRef();

  const switchAccount = useCallback(() => {
    dispatch(loginActions.setIsLoggedIn(false));
  }, [dispatch]);

  const closeAnyModal = useCallback(() => {
    setInvalidMessage(undefined);
    setSwitchAccountModalIsOpen(false);
    if (user && token && !isLoggedIn) {
      dispatch(loginActions.setIsLoggedIn(true));
    }
    navigate("/");
  }, [navigate, token, isLoggedIn, user, dispatch]);

  return (
    <React.Fragment>
      <MainPageContainer image_back={puzzles_pattern}>
        {isLoggedIn && (
          <Modal
            ariaHideApp={false}
            ref={switchAccountModalRef}
            isOpen={switchAccountModalIsOpen}
            onRequestClose={closeAnyModal}
            style={modal_content}
          >
            <span style={modal_label}>
              Currently registered as {user.name}.
            </span>
            <span style={modal_label}>Do you want to switch account?</span>
            <div style={multibutton_container}>
              <GeneralButton
                style={GeneralModalButtonStyle}
                label={"Cancel"}
                handleButtonPress={closeAnyModal}
              />
              <GeneralButton
                style={GeneralModalButtonStyle}
                label={"Yes"}
                handleButtonPress={switchAccount}
              />
            </div>
          </Modal>
        )}
        {!isLoggedIn && !invalidMessage && <LoadingScreen />}
        {!isLoggedIn && invalidMessage && (
          <Modal
            ref={invalidMessageModalRef}
            isOpen={invalidMessage ? true : false}
            ariaHideApp={false}
            onRequestClose={closeAnyModal}
            style={modal_content}
          >
            <span style={modal_label}>{invalidMessage}</span>
            <GeneralButton
              style={GeneralModalButtonStyle}
              label={"Cancel"}
              handleButtonPress={closeAnyModal}
            />
          </Modal>
        )}
      </MainPageContainer>
    </React.Fragment>
  );
};

export default RetrieveToken;
