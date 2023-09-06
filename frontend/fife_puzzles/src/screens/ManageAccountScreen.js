import { useNavigate } from "react-router-dom";
import HomeButton from "../components/HomeButton";
import MainPageContainer from "../components/MainPageContainer";
import puzzles_pattern from "../images/puzzles_pattern.png";
import margins from "../style-utils/margins";
import radiuses from "../style-utils/radiuses";
import colors from "../style-utils/colors";
import GeneralButton from "../components/GeneralButton";
import paddings from "../style-utils/paddings";
import styled from "styled-components";
import Modal from "react-modal";
import React, { useCallback, useEffect, useRef, useState } from "react";
import text_styles from "../style-utils/text_styles";
import {
  GeneralModalButtonStyle,
  modal_content,
  modal_label,
} from "../inline-styles/modal";
import FormField from "../registration-components/FormField";
import { useSelector } from "react-redux";
import { ErrorMessage } from "../registration-components/RegistrationPageConatiner";
import { loginActions } from "../store/login-slice";
import { useDispatch } from "react-redux";
import ManageUserInfoBlock from "../manage-account-components/ManageUserInfoBlock";
import CreatedSudokusInfoBlock from "../manage-account-components/CreatedSudokusInfoBlock";
import CustomProgress from "../components/CustomProgress";
import CreatedEightsPuzzlesInfoBlock from "../manage-account-components/CreatedEightsPuzzlesInfoBlock";
import PromotionRequestInfoBlock from "../manage-account-components/PromotionRequestsInfoBlock";
import MessagesInfo from "../manage-account-components/MessagesInfo";
import { emitMessage, disconnectSocket } from "../client";
import { prActions } from "../store/promotion-requests-slice";
import { fpActions } from "../store/flagged-puzzles-slice";
import { fcActions } from "../store/flagged-comments-slice";
import FlaggedPuzzlesInfo from "../manage-account-components/FlaggedPuzzlesInfo";
import FlaggedCommentsInfo from "../manage-account-components/FlaggedCommentsInfo";
import search_icon from "../icons/search.png";
import { CSSTransition } from "react-transition-group";
import { useHotkeys } from "react-hotkeys-hook";
import SearchResults from "../manage-account-components/SearchResults";
import PlatformStatisticsInfo from "../manage-account-components/PlatformStatisticsInfo";
import { ScrollView } from "react-native-web";
import CreatedHashiPuzzlesInfoBlock from "../manage-account-components/CreatedHashiPuzzlesInfoBlock";
import SlidingPane from "react-sliding-pane";
import FeedbackRecord from "../manage-account-components/FeedbackRecord";
import "react-sliding-pane/dist/react-sliding-pane.css";
import DisplaySearchedUser from "../manage-account-components/DisplaySearchedUser";
import SolvedSudokusInfoBlock from "../manage-account-components/SolvedSudokusInfoBlock";
import SolvedEightsPuzzlesInfoBlock from "../manage-account-components/SolvedEightsPuzzlesInfoBlock";
import SolvedHashiPuzzlesInfoBlock from "../manage-account-components/SolvedHashiPuzzlesInfoBlock";
import { utdActions } from "../store/user-to-display-slice";
import DisplaySearchedPuzzle from "../manage-account-components/DisplaySearchedPuzzle";
import { ptdActions } from "../store/puzzle-to-display-slice";
import { TextConatinerP } from "../components/TextContainer";
import GeneralInputField from "../components/GenearlnputField";
import { CircularProgress } from "@mui/material";
import styles from "../components/SlidingPaneStyles.module.css";

export default function ManageAccountScreen() {
  // Get the user currently logged in to display their information
  const { user } = useSelector((state) => state.login);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Return to the home page if the home button is clicked
  function handleHomeButton() {
    navigate("/");
  }

  // Refs to get the inputs for changing the user password
  const passwordRef = useRef();
  const newPasswordRef = useRef();
  const confirmPasswordRef = useRef();

  // Modal for letting the user input the required data to change their password
  const changePasswordModalRef = useRef();
  const [changePasswordModalIsOpen, setChangePasswordModalIsOpen] =
    useState(false);

  // Needed to display messages to the user about their inputs
  const [isInvalidMessage, setIsInvalidMessage] = useState(false);
  const [invalidMessageMap, setInvalidMessageMap] = useState(undefined);
  const [invalidMessage, setInvalidMessage] = useState(undefined);
  const [message, setMessage] = useState(undefined);

  // Constants required for the modal
  const changeNameModalRef = useRef();
  const NewNameRef = useRef();
  const [changeNameModalIsOpen, setChangeNameModalIsOpen] = useState(false);

  const [requestPromModalIsOpen, setRequestPromModalIsOpen] = useState(false);
  const requestPromRef = useRef();
  const requestPromMessageRef = useRef();

  // Function if the user wants to change their password
  const changePassword = useCallback(async () => {
    // Get all the data inputted by the user to change their password
    const password = passwordRef.current.value;
    const newPassword = newPasswordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;

    // Request the server to change the user's password
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}users/changePassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
        body: JSON.stringify({
          password,
          newPassword,
          newPasswordConfirm: confirmPassword,
        }),
      }
    );

    // The request was successful
    if (response.ok) {
      // Get the data from the server response
      const data = await response.json();
      console.log(data);
      // Get the updated user and token then update the stored user in state
      const { user, token } = data.data;
      dispatch(loginActions.setUser({ user, isLoggedIn: true, token }));
      setMessage("Password changed successfully!");
    }
    // The request was unsuccessful
    else {
      // Get the fail status and message describing what failed
      const { status, messageMap, message } = await response.json();

      // Set the invalid messages to be displayed to the user
      if (status === "fail") {
        setIsInvalidMessage(true);
        if (messageMap) {
          setInvalidMessageMap(messageMap);
        } else {
          setInvalidMessage(message);
        }
      }
    }
  }, [dispatch]);

  // Let the user update their screen name
  const updateName = useCallback(async () => {
    // Get the new name that they inputted
    const newName = NewNameRef.current.value;

    // Send a request to the server to update the user's name
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}users/update`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
        // Send the user's new name to the server
        body: JSON.stringify({
          name: newName,
        }),
      }
    );

    // The request was successful
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      // Updates the user's name on the website
      dispatch(loginActions.updateUser({ name: newName }));
      // Display a message to the user to show the name change was a success
      setMessage("Name changed successfully!");
      // The request was unsuccessful
    } else {
      // We get the fail response from the server
      const { status, message } = await response.json();

      // If the server sends an error message then display it to the user
      if (status === "fail" && message) {
        setInvalidMessage(message);
        setIsInvalidMessage(true);
      }
    }
  }, [dispatch]);

  // Gets rid of any error messages from previous attempts to input data once the user changes the information in the input field
  const onFocus = useCallback(() => {
    setIsInvalidMessage(false);
    setInvalidMessage(undefined);
    setInvalidMessageMap(undefined);
  }, []);

  // Close whichever modal is currently open and set the invalid messages to false so they don't display when they are reopened
  const closeAnyModal = useCallback(() => {
    setChangeNameModalIsOpen(false);
    setChangePasswordModalIsOpen(false);
    setIsInvalidMessage(false);
    setInvalidMessage(undefined);
    setInvalidMessageMap(undefined);
    setMessage(undefined);
    setRequestPromModalIsOpen(false);
    setDeleteAccountIsOpenModal(false);
  }, []);

  // const [leftNavigationChoice, setLeftNavigationChoice] = useState("profileChoice");
  const [leftNavigationChoice, setLeftNavigationChoice] =
    useState("profileChoice");
  const HeaderChoices = useRef({
    profileChoice: "Manage Account",
    sudokuSolvedChoice: "Sudoku Puzzles Solved",
    eightsSolvedChoice: "8's Puzzles Solved",
    hashiSolvedChoice: "Hashi Puzzles Solved",
    sudokuCreatedChoice: "Sudoku Puzzles Created",
    eigthsCreatedChoice: "8's Puzzles Created",
    hashiCreatedChoice: "Hashi Puzzles Created",
    messages: "Messages",
  }).current;

  const confirmDeleteModalRef = useRef();
  const [deleteMessageModal, setDeleteMessageModal] = useState(null);
  const [deleteFunctionModal, setDeleteFunctionModal] = useState(null);
  const [deleteContentModal, setDeleteContentModal] = useState(null);
  const [deleteLoadingModal, setDeleteLoadingModal] = useState(false);
  const [deleteLoadingFinishModal, setDeleteLoadingFinishModal] =
    useState(false);
  const [deleteResponseModal, setDeletResponseModal] = useState(null);
  const [confirmDeleteModalIsOpen, setConfirmDeleteModalIsOpen] =
    useState(false);

  const sendPromotionRequest = useCallback(async () => {
    console.log(requestPromMessageRef);
    const message = requestPromMessageRef.current.value;

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}promotion-requests/send-promotion-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
        body: JSON.stringify({
          message,
        }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      const { message, promRequest } = data.data;
      console.log(message);
      setMessage(message);
      emitMessage("new-promotion-request", {
        promID: promRequest._id,
      });
    } else {
      const { message } = data;
      setMessage(message);
    }
  }, []);
  const deleteAccountPasswordRef = useRef();
  const deleteAccountRef = useRef();
  const [deleteAccountIsOpenModal, setDeleteAccountIsOpenModal] =
    useState(false);

  const deleteAccount = useCallback(async () => {
    const password = deleteAccountPasswordRef.current.value;

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}users/delete-account`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
        body: JSON.stringify({
          password,
        }),
      }
    );

    if (response.ok) {
      dispatch(
        loginActions.setUser({
          user: undefined,
          isLoggedIn: false,
          token: undefined,
        })
      );
      disconnectSocket();
    } else {
      const { status, message } = await response.json();
      if (status === "fail" && message) {
        setInvalidMessage(message);
        setIsInvalidMessage(true);
      }
    }
  }, [dispatch]);

  const { totalLength: totalLengthFC } = useSelector(
    (state) => state.flaggedComments
  );
  const getActiveFlaggedComments = useCallback(async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}flagged-comments/active-number`,
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
      const { data } = await response.json();
      dispatch(fcActions.setTotalLength(data.numOfFlaggedComments));
    } else {
      console.log("Something went wrong");
    }
  }, [dispatch]);

  const { totalLength: totalLengthFP } = useSelector(
    (state) => state.flaggedPuzzles
  );
  const getActiveFlaggedPuzzles = useCallback(async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}flagged-puzzles/active-number`,
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
      const { data } = await response.json();
      dispatch(fpActions.setTotalLength(data.numOfFlaggedPuzzles));
    } else {
      console.log("Something went wrong");
    }
  }, [dispatch]);

  const { totalLength: totalLengthPR } = useSelector(
    (state) => state.promotionRequests
  );
  const getActivePromRequests = useCallback(async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}promotion-requests/active-number`,
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
      const { data } = await response.json();
      dispatch(prActions.setTotalLength(data.numberOfPromRequests));
    } else {
      console.log("Something went wrong");
    }
  }, [dispatch]);

  const setMessagesAsSeen = useCallback(async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}users/set-messages-as-seen`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
      }
    );
    if (response.ok) {
      const { data } = await response.json();
      console.log(data);
    } else {
      console.log("Something went wrong");
    }
  }, []);

  const deleteAccountEnter = useCallback(
    (event) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
        deleteAccount();
      }
    },
    [deleteAccount]
  );

  const changeNameEnter = useCallback(
    (event) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
        updateName();
      }
    },
    [updateName]
  );

  const changePasswordEnter = useCallback(
    (event) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
        changePassword();
      }
    },
    [changePassword]
  );

  const sendPromotionEnter = useCallback(
    (event) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
        sendPromotionRequest();
      }
    },
    [sendPromotionRequest]
  );

  useEffect(() => {
    if (user.role === "administrator") {
      getActivePromRequests();
      getActiveFlaggedPuzzles();
      getActiveFlaggedComments();
    }
  }, [
    getActivePromRequests,
    getActiveFlaggedComments,
    getActiveFlaggedPuzzles,
    user.role,
  ]);

  useEffect(() => {
    if (deleteAccountIsOpenModal)
      document.addEventListener("keydown", deleteAccountEnter);
    else document.removeEventListener("keydown", deleteAccountEnter);
  }, [deleteAccountIsOpenModal]);

  useEffect(() => {
    if (changeNameModalIsOpen)
      document.addEventListener("keydown", changeNameEnter);
    else document.removeEventListener("keydown", changeNameEnter);
  }, [changeNameModalIsOpen]);

  useEffect(() => {
    if (changePasswordModalIsOpen)
      document.addEventListener("keydown", changePasswordEnter);
    else document.removeEventListener("keydown", changePasswordEnter);
  }, [changePasswordModalIsOpen]);

  useEffect(() => {
    if (requestPromModalIsOpen)
      document.addEventListener("keydown", sendPromotionEnter);
    else document.removeEventListener("keydown", sendPromotionEnter);
  }, [requestPromModalIsOpen]);

  const [onFocusSearch, setOnFocusSearch] = useState(false);
  const searchRef = useRef();

  useHotkeys("meta+k", () => {
    console.log("here");
    searchRef.current.focus();
    console.log("pressed");
  });

  const [isHoveringResults, setIsHoveringResults] = useState(false);

  const [curentFeedebackIDToDelete, setCurentFeedebackIDToDelete] =
    useState("");
  const [feebackIDToFlag, setFeebackIDToFlag] = useState("");
  const [commentsScreenIsOpen, setCommentsScreenIsOpen] = useState(false);
  const [response, setResponse] = useState([]);
  const [loadingDeleteFeedbackStarted, setLoadingDeleteFeedbackStarted] =
    useState(false);
  const [id_to_show_comments, set_id_to_show_comments] = useState("");
  async function loadComments() {
    let result = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}feedback/get_feedback/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "puzzle-id": id_to_show_comments,
        }),
      }
    ).then((response) => response.json());
    setResponse(result);
  }

  const [searchCategory, setSearchCategory] = useState("users");
  const [searchInput, setSearchInput] = useState("");
  const searchIconRef = useRef();
  const usersButtonRef = useRef();
  const puzzlesButtonRef = useRef();
  const flagModalRef = useRef(null);
  const [flagModalIsOpen, setFlagModalIsOpen] = useState(false);
  const FlaggInputRef = useRef(null);
  const [isFlagginLoading, setIsFlagginLoading] = useState(false);
  useEffect(() => {
    if (leftNavigationChoice === "search") {
      if (searchRef.current) searchRef.current.focus();
    }
  }, [leftNavigationChoice]);
  // Render the page
  return (
    <>
      <Modal
        ariaHideApp={false}
        ref={flagModalRef}
        isOpen={flagModalIsOpen}
        onRequestClose={() => {
          setFlagModalIsOpen(false);
        }}
        style={modal_content}
      >
        <span style={modal_label}>Is there a problem with this comments?</span>
        <span style={Object.assign({ marginBottom: margins.lrg }, modal_label)}>
          Please leave a message.
        </span>
        <GeneralInputField inputRef={FlaggInputRef} />

        {isFlagginLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              marginTop: margins.lrg,
            }}
          >
            <CircularProgress
              style={{ width: 50, height: 50, color: `#${colors.creme}` }}
              color={"inherit"}
            />
          </div>
        ) : (
          <GeneralButton
            style={{ alignSelf: "center", marginTop: 20 }}
            label={"Submit"}
            handleButtonPress={async () => {
              setIsFlagginLoading(true);
              const flaggedFeedbackTicket = {
                info: {
                  textSubmitted: FlaggInputRef.current.value,
                  feedbackID: feebackIDToFlag,
                  userID: user._id,
                },
              };
              console.log(flaggedFeedbackTicket);
              let upload_result = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}flagged-comments/send-ticket/`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  withCredentials: true,
                  credentials: "include",
                  body: JSON.stringify(flaggedFeedbackTicket),
                }
              )
                .then((response) => {
                  return response.json();
                })
                .catch((err) => console.log(err));

              console.log(upload_result);

              if (upload_result.ticketID)
                emitMessage("new-flagged-comment", {
                  ticketID: upload_result.ticketID,
                });

              setTimeout(() => {
                setIsFlagginLoading(false);
                setTimeout(() => {
                  setFlagModalIsOpen(false);
                }, 500);
              }, 500);
            }}
          />
        )}
      </Modal>
      <Modal
        ref={deleteAccountRef}
        isOpen={deleteAccountIsOpenModal}
        ariaHideApp={false}
        onRequestClose={closeAnyModal}
        style={modal_content}
      >
        {/*If there is a message from a previous name change then it is displayed*/}
        {message && (
          <React.Fragment>
            <span style={modal_label}>{message}</span>
            {/*A button is provided to close the modal after reading the message*/}
            <GeneralButton
              style={GeneralModalButtonStyle}
              label={"OK"}
              handleButtonPress={closeAnyModal}
            />
          </React.Fragment>
        )}
        {/*If a previous input has an error then it is displayed at the top of the modal*/}
        {invalidMessage && <ErrorMessage>{invalidMessage}</ErrorMessage>}
        {/*If there is no message from a previous successful name change then provide the input components required to change name*/}
        {!message && (
          <React.Fragment>
            <FormField
              title={"Enter Password"}
              reference={deleteAccountPasswordRef}
              type={"password"}
              onFocus={onFocus}
              invalid={isInvalidMessage}
              centerLabel={true}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
                gap: "2vw",
              }}
            >
              <GeneralButton
                style={GeneralModalButtonStyle}
                label={"Cancel"}
                handleButtonPress={closeAnyModal}
              />
              <GeneralButton
                style={GeneralModalButtonStyle}
                label={"Delete account"}
                handleButtonPress={deleteAccount}
              />
            </div>
          </React.Fragment>
        )}
      </Modal>
      <Modal
        ref={requestPromRef}
        isOpen={requestPromModalIsOpen}
        onRequestClose={closeAnyModal}
        ariaHideApp={false}
        style={modal_content}
      >
        {message && (
          <React.Fragment>
            <span style={modal_label}>{message}</span>
            {/*A button is provided to close the modal after reading the message*/}
            <GeneralButton
              style={GeneralModalButtonStyle}
              label={"OK"}
              handleButtonPress={closeAnyModal}
            />
          </React.Fragment>
        )}
        {!message && (
          <React.Fragment>
            <FormField
              title={"Request Message"}
              reference={requestPromMessageRef}
              type={"text"}
              onFocus={onFocus}
              invalid={isInvalidMessage}
              extendedMessage={true}
              fixedWidth={"35vw"}
              fixedHeight={"20vh"}
              centerLabel={true}
            />
            <GeneralButton
              style={GeneralModalButtonStyle}
              label={"Submit"}
              handleButtonPress={sendPromotionRequest}
            />
          </React.Fragment>
        )}
      </Modal>
      <Modal
        ref={confirmDeleteModalRef}
        isOpen={confirmDeleteModalIsOpen}
        ariaHideApp={false}
        style={modal_content}
      >
        {deleteLoadingModal && !deleteLoadingFinishModal && <CustomProgress />}
        {deleteLoadingModal && deleteLoadingFinishModal && (
          <>
            <span style={modal_label}>{deleteResponseModal}</span>
            <GeneralButton
              style={GeneralModalButtonStyle}
              label={"OK"}
              handleButtonPress={() => {
                setConfirmDeleteModalIsOpen(false);
                setDeleteLoadingModal(false);
                setDeleteLoadingFinishModal(false);
              }}
            />
          </>
        )}
        {!deleteLoadingModal && (
          <>
            <span style={modal_label}>{deleteMessageModal}</span>
            {deleteContentModal}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                width: "flex",
                justifyContent: "space-evenly",
              }}
            >
              <GeneralButton
                style={GeneralModalButtonStyle}
                label={"Yes"}
                handleButtonPress={() => {
                  deleteFunctionModal("kakakak");
                }}
              />
              <GeneralButton
                style={GeneralModalButtonStyle}
                label={"No"}
                handleButtonPress={() => {
                  setConfirmDeleteModalIsOpen(false);
                }}
              />
            </div>
          </>
        )}
      </Modal>
      {/*The modal for if the user wants to change their username*/}
      <Modal
        ref={changeNameModalRef}
        isOpen={changeNameModalIsOpen}
        ariaHideApp={false}
        onRequestClose={closeAnyModal}
        style={modal_content}
      >
        {/*If there is a message from a previous name change then it is displayed*/}
        {message && (
          <React.Fragment>
            <span style={modal_label}>{message}</span>
            {/*A button is provided to close the modal after reading the message*/}
            <GeneralButton
              style={GeneralModalButtonStyle}
              label={"OK"}
              handleButtonPress={closeAnyModal}
            />
          </React.Fragment>
        )}
        {/*If a previous input has an error then it is displayed at the top of the modal*/}
        {invalidMessage && <ErrorMessage>{invalidMessage}</ErrorMessage>}
        {/*If there is no message from a previous successful name change then provide the input components required to change name*/}
        {!message && (
          <React.Fragment>
            <FormField
              title={"New Name"}
              reference={NewNameRef}
              type={"text"}
              onFocus={onFocus}
              invalid={isInvalidMessage}
              centerLabel={true}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
                gap: "2vw",
              }}
            >
              <GeneralButton
                style={GeneralModalButtonStyle}
                label={"Cancel"}
                handleButtonPress={closeAnyModal}
              />
              <GeneralButton
                style={GeneralModalButtonStyle}
                label={"Confirm"}
                handleButtonPress={updateName}
              />
            </div>
          </React.Fragment>
        )}
      </Modal>

      {/*This modal provide inputs required for a user to change their password*/}
      <Modal
        ref={changePasswordModalRef}
        isOpen={changePasswordModalIsOpen}
        ariaHideApp={false}
        onRequestClose={closeAnyModal}
        style={modal_content}
      >
        {/*If there is a message from a previous password change then it is displayed*/}
        {message && (
          <React.Fragment>
            <span style={modal_label}>{message}</span>
            {/*A button is provided to close the modal after reading the message*/}
            <GeneralButton
              style={GeneralModalButtonStyle}
              label={"OK"}
              handleButtonPress={closeAnyModal}
            />
          </React.Fragment>
        )}
        {/*If a previous input has an error then it is displayed at the top of the modal*/}
        {invalidMessage && <ErrorMessage>{invalidMessage}</ErrorMessage>}
        {/*If there is no message from a previous successful password change then provide the input components required to change password*/}
        {!message && (
          <React.Fragment>
            <FormField
              title={"Current Password"}
              reference={passwordRef}
              type={"password"}
              invalid={isInvalidMessage}
              onFocus={onFocus}
            />
            <FormField
              title={"New Password"}
              reference={newPasswordRef}
              type={"password"}
              onFocus={onFocus}
              invalid={isInvalidMessage}
              message={
                invalidMessageMap ? invalidMessageMap.password : undefined
              }
            />
            <FormField
              title={"Confirm New Password"}
              reference={confirmPasswordRef}
              type={"password"}
              onFocus={onFocus}
              invalid={isInvalidMessage}
              message={
                invalidMessageMap
                  ? invalidMessageMap.passwordConfirm
                  : undefined
              }
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}
            >
              <GeneralButton
                style={GeneralModalButtonStyle}
                label={"Cancel"}
                handleButtonPress={closeAnyModal}
              />
              <GeneralButton
                style={GeneralModalButtonStyle}
                label={"Confirm"}
                handleButtonPress={changePassword}
              />
            </div>
          </React.Fragment>
        )}
      </Modal>
      <SlidingPane
        className={styles.sliding_pane_body}
        isOpen={commentsScreenIsOpen}
        onAfterOpen={loadComments}
        hideHeader={true}
        from="bottom"
        onRequestClose={() => setCommentsScreenIsOpen(false)}
        width={"100%"}
      >
        <div className="listOfComments">
          {response.length == 0 ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <TextConatinerP>
                There are no comments for this puzzle yet.
              </TextConatinerP>
            </div>
          ) : (
            response.map((comment, key) => {
              return (
                <div key={key} className="comment">
                  <FeedbackRecord
                    showDelete={user.role === "administrator"}
                    id={comment["user-id"]}
                    comment={comment["comment"]}
                    handleButtonPress={async () => {
                      setLoadingDeleteFeedbackStarted(true);
                      setCurentFeedebackIDToDelete(comment._id);
                      let result = await fetch(
                        `${process.env.REACT_APP_BACKEND_URL}feedback/delete_feedback/`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            commentID: comment._id,
                          }),
                        }
                      );
                      let prevResponse = [...response];
                      prevResponse = prevResponse.filter(
                        (r) => r._id != comment._id
                      );
                      setResponse(prevResponse);
                      setLoadingDeleteFeedbackStarted(false);
                    }}
                    loadingDeleteFeedbackStarted={loadingDeleteFeedbackStarted}
                    isCurrentDeleted={comment._id == curentFeedebackIDToDelete}
                    handleFlag={() => {
                      setFlagModalIsOpen(true);
                      setFeebackIDToFlag(comment._id);
                    }}
                  />
                </div>
              );
            })
          )}
        </div>
      </SlidingPane>
      {/*The main user account page*/}
      <MainPageContainer image_back={puzzles_pattern}>
        {/*Div containing the button back to the home page and the title of the page*/}
        <ManageAccountPageHead>
          <HomeButton handleHomeButton={handleHomeButton} />
          {HeaderChoices[leftNavigationChoice] && (
            <ManageAccountTitle>
              {HeaderChoices[leftNavigationChoice]}
            </ManageAccountTitle>
          )}
          {HeaderChoices[leftNavigationChoice] === undefined && (
            <React.Fragment>
              <SearchBar>
                <div style={{ display: "flex" }}>
                  <div
                    style={{
                      display: "flex",
                      backgroundColor: `#${colors.lightCreme}`,
                      borderRadius: `${radiuses.xxxlrg}px`,
                      marginRight: "2vw",
                    }}
                  >
                    <SearcbBarButton
                      ref={usersButtonRef}
                      style={{
                        borderRadius: `${radiuses.xxxlrg}px`,
                        color:
                          searchCategory === "users"
                            ? `#${colors.lightCreme}`
                            : `#${colors.darkerChocolate}`,
                        backgroundColor:
                          searchCategory === "users"
                            ? `#${colors.darkerChocolate}`
                            : `#${colors.lightCreme}`,
                      }}
                      onClick={() => {
                        setSearchCategory("users");
                        searchRef.current.focus();
                      }}
                    >
                      Users
                    </SearcbBarButton>
                    <SearcbBarButton
                      ref={puzzlesButtonRef}
                      style={{
                        borderRadius: `${radiuses.xxxlrg}px`,
                        color:
                          searchCategory === "puzzles"
                            ? `#${colors.lightCreme}`
                            : `#${colors.darkerChocolate}`,
                        backgroundColor:
                          searchCategory === "puzzles"
                            ? `#${colors.darkerChocolate}`
                            : `#${colors.lightCreme}`,
                      }}
                      onClick={() => {
                        setSearchCategory("puzzles");
                        searchRef.current.focus();
                      }}
                    >
                      Puzzles
                    </SearcbBarButton>
                  </div>
                  <SearchInput
                    ref={searchRef}
                    onFocus={() => {
                      setOnFocusSearch(true);
                      dispatch(utdActions.setShowUser(false));
                      dispatch(ptdActions.setShowPuzzle(false));
                    }}
                    onBlur={() => setOnFocusSearch(false)}
                    onChange={() => {
                      setSearchInput(searchRef.current.value);
                    }}
                    placeholder={
                      searchCategory === "users"
                        ? "Enter user ID"
                        : searchCategory === "puzzles"
                        ? "Enter puzzle ID"
                        : ""
                    }
                    value={searchInput !== "" ? searchInput : ""}
                  />
                  <SearchIcon
                    ref={searchIconRef}
                    onClick={() => setOnFocusSearch(true)}
                  >
                    <img
                      style={{
                        height: "2vw",
                        width: "2vw",
                      }}
                      src={search_icon}
                    />
                  </SearchIcon>
                </div>
                {(onFocusSearch || isHoveringResults) && (
                  <SearchResults
                    setIsHoveringResults={setIsHoveringResults}
                    searchCategory={searchCategory}
                    searchInput={searchInput}
                    searchIconRef={searchIconRef}
                    puzzlesButtonRef={puzzlesButtonRef}
                    usersButtonRef={usersButtonRef}
                    searchInputRef={searchRef}
                    setLeftNavigationChoice={setLeftNavigationChoice}
                    setSearchInput={setSearchInput}
                  />
                )}
              </SearchBar>
            </React.Fragment>
          )}
        </ManageAccountPageHead>

        {/*Div to contain the main part of the page displaying user data*/}
        <ManageAccountPageBody>
          {/*Div to display the different tabs of the user page*/}
          <LeftNavigationContainer>
            <LeftNavigation>
              <ScrollView
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: 100,
                }}
              >
                {/* Displays the user profile */}
                <ManageAccountOption
                  onClick={() => {
                    setLeftNavigationChoice((prev) => {
                      if (prev === "messages")
                        dispatch(loginActions.updateMessages());
                      emitMessage("message", "Heloo!");
                      return "profileChoice";
                    });
                  }}
                >
                  Profile
                </ManageAccountOption>
                {user.role === "administrator" && (
                  <ManageAccountOption
                    onClick={() => {
                      setLeftNavigationChoice((prev) => {
                        if (prev === "messages")
                          dispatch(loginActions.updateMessages());
                        return "search";
                      });
                    }}
                  >
                    Search
                  </ManageAccountOption>
                )}

                {user.role === "administrator" && (
                  <ManageAccountOption
                    onClick={() => {
                      setLeftNavigationChoice((prev) => {
                        if (prev === "messages")
                          dispatch(loginActions.updateMessages());
                        return "promotion-requests";
                      });
                    }}
                  >
                    <OptionTitle>
                      Promotion Requests
                      {totalLengthPR !== 0 && <Bubble>{totalLengthPR}</Bubble>}
                    </OptionTitle>
                  </ManageAccountOption>
                )}

                {user.role === "administrator" && (
                  <ManageAccountOption
                    onClick={() => {
                      setLeftNavigationChoice((prev) => {
                        if (prev === "messages")
                          dispatch(loginActions.updateMessages());

                        return "flagged-comments";
                      });
                    }}
                  >
                    <OptionTitle>
                      Flagged Comments
                      {totalLengthFC !== 0 && <Bubble>{totalLengthFC}</Bubble>}
                    </OptionTitle>
                  </ManageAccountOption>
                )}
                {user.role === "administrator" && (
                  <ManageAccountOption
                    onClick={() => {
                      setLeftNavigationChoice((prev) => {
                        if (prev === "messages")
                          dispatch(loginActions.updateMessages());
                        return "flagged-puzzles";
                      });
                    }}
                  >
                    <OptionTitle>
                      Flagged Puzzles
                      {totalLengthFP !== 0 && <Bubble>{totalLengthFP}</Bubble>}
                    </OptionTitle>
                  </ManageAccountOption>
                )}
                {user.role === "administrator" && (
                  <ManageAccountOption
                    onClick={() => {
                      setLeftNavigationChoice((prev) => {
                        if (prev === "messages")
                          dispatch(loginActions.updateMessages());
                        return "platform-statistics";
                      });
                    }}
                  >
                    Platform Statistics
                  </ManageAccountOption>
                )}
                <ManageAccountOption
                  onClick={() => {
                    setLeftNavigationChoice("messages");
                  }}
                >
                  <OptionTitle>
                    Messages
                    {user.numberOfNewMessages !== 0 && (
                      <Bubble title={"Messages"}>
                        {user.numberOfNewMessages}
                      </Bubble>
                    )}
                  </OptionTitle>
                </ManageAccountOption>
                {/* Displays the puzzles solved by the user */}
                <ManageAccountOption
                  onClick={() => {
                    setLeftNavigationChoice((prev) => {
                      if (prev === "messages")
                        dispatch(loginActions.updateMessages());
                      return "sudokuSolvedChoice";
                    });
                  }}
                >
                  Sudoku Puzzles Solved
                </ManageAccountOption>
                <ManageAccountOption
                  onClick={() => {
                    setLeftNavigationChoice((prev) => {
                      if (prev === "messages")
                        dispatch(loginActions.updateMessages());
                      return "eightsSolvedChoice";
                    });
                  }}
                >
                  8's Puzzles Solved
                </ManageAccountOption>
                <ManageAccountOption
                  onClick={() => {
                    setLeftNavigationChoice((prev) => {
                      if (prev === "messages")
                        dispatch(loginActions.updateMessages());
                      return "hashiSolvedChoice";
                    });
                  }}
                >
                  Hashi Puzzles Solved
                </ManageAccountOption>
                {/* If the user isn't a puzzle solver and a guest to our website, they are allowed to create puzzles and we add the option to see
                            their created puzzles */}
                {user.role !== "solver" && !user.isGeuest && (
                  <ManageAccountOption
                    onClick={() => {
                      setLeftNavigationChoice((prev) => {
                        if (prev === "messages")
                          dispatch(loginActions.updateMessages());
                        return "sudokuCreatedChoice";
                      });
                    }}
                  >
                    Sudoku Puzzles Created
                  </ManageAccountOption>
                )}
                {user.role !== "solver" && !user.isGeuest && (
                  <ManageAccountOption
                    onClick={() => {
                      setLeftNavigationChoice((prev) => {
                        if (prev === "messages")
                          dispatch(loginActions.updateMessages());
                        return "eigthsCreatedChoice";
                      });
                    }}
                  >
                    8's Puzzles Created
                  </ManageAccountOption>
                )}
                {user.role !== "solver" && !user.isGeuest && (
                  <ManageAccountOption
                    onClick={() => {
                      setLeftNavigationChoice((prev) => {
                        if (prev === "messages")
                          dispatch(loginActions.updateMessages());
                        return "hashiCreatedChoice";
                      });
                    }}
                  >
                    Hashi Puzzles Created
                  </ManageAccountOption>
                )}
              </ScrollView>
            </LeftNavigation>
          </LeftNavigationContainer>
          <ManageAccountBarSpacer>
            <MainSplitVerticalBar />
          </ManageAccountBarSpacer>
          {/*Div to display the information about the user*/}
          <ManageAccountInfoContainer>
            <ManageAccountInfoBlock>
              {leftNavigationChoice == "messages" && (
                <MessagesInfo
                  messages={user.messages}
                  setMessagesAsSeen={setMessagesAsSeen}
                />
              )}
              {leftNavigationChoice == "promotion-requests" && (
                <PromotionRequestInfoBlock />
              )}
              {leftNavigationChoice == "platform-statistics" && (
                <PlatformStatisticsInfo />
              )}
              {leftNavigationChoice == "flagged-puzzles" && (
                <FlaggedPuzzlesInfo />
              )}
              {leftNavigationChoice == "flagged-comments" && (
                <FlaggedCommentsInfo />
              )}
              {leftNavigationChoice == "display-searched-user" && (
                <DisplaySearchedUser />
              )}
              {leftNavigationChoice == "display-searched-puzzle" && (
                <DisplaySearchedPuzzle />
              )}
              {leftNavigationChoice == "profileChoice" && (
                <ManageUserInfoBlock
                  setChangePasswordModalIsOpen={setChangePasswordModalIsOpen}
                  setChangeNameModalIsOpen={setChangeNameModalIsOpen}
                  setRequestPromModalIsOpen={setRequestPromModalIsOpen}
                  setDeleteAccountIsOpenModal={setDeleteAccountIsOpenModal}
                />
              )}
              {leftNavigationChoice == "sudokuCreatedChoice" && (
                <CreatedSudokusInfoBlock
                  setDeleteMessageModal={setDeleteMessageModal}
                  setDeleteFunctionModal={setDeleteFunctionModal}
                  setDeleteContentModal={setDeleteContentModal}
                  setConfirmDeleteModalIsOpen={setConfirmDeleteModalIsOpen}
                  setDeleteLoadingModal={setDeleteLoadingModal}
                  setDeleteLoadingFinishModal={setDeleteLoadingFinishModal}
                  setDeletResponseModal={setDeletResponseModal}
                  set_id_to_show_comments={set_id_to_show_comments}
                  setCommentsScreenIsOpen={setCommentsScreenIsOpen}
                />
              )}
              {leftNavigationChoice == "eigthsCreatedChoice" && (
                <CreatedEightsPuzzlesInfoBlock
                  setDeleteMessageModal={setDeleteMessageModal}
                  setDeleteFunctionModal={setDeleteFunctionModal}
                  setDeleteContentModal={setDeleteContentModal}
                  setConfirmDeleteModalIsOpen={setConfirmDeleteModalIsOpen}
                  setDeleteLoadingModal={setDeleteLoadingModal}
                  setDeleteLoadingFinishModal={setDeleteLoadingFinishModal}
                  setDeletResponseModal={setDeletResponseModal}
                  set_id_to_show_comments={set_id_to_show_comments}
                  setCommentsScreenIsOpen={setCommentsScreenIsOpen}
                />
              )}
              {leftNavigationChoice == "hashiCreatedChoice" && (
                <CreatedHashiPuzzlesInfoBlock
                  setDeleteMessageModal={setDeleteMessageModal}
                  setDeleteFunctionModal={setDeleteFunctionModal}
                  setDeleteContentModal={setDeleteContentModal}
                  setConfirmDeleteModalIsOpen={setConfirmDeleteModalIsOpen}
                  setDeleteLoadingModal={setDeleteLoadingModal}
                  setDeleteLoadingFinishModal={setDeleteLoadingFinishModal}
                  setDeletResponseModal={setDeletResponseModal}
                  set_id_to_show_comments={set_id_to_show_comments}
                  setCommentsScreenIsOpen={setCommentsScreenIsOpen}
                />
              )}
              {leftNavigationChoice == "sudokuSolvedChoice" && (
                <SolvedSudokusInfoBlock
                  set_id_to_show_comments={set_id_to_show_comments}
                  setCommentsScreenIsOpen={setCommentsScreenIsOpen}
                />
              )}
              {leftNavigationChoice == "eightsSolvedChoice" && (
                <SolvedEightsPuzzlesInfoBlock
                  set_id_to_show_comments={set_id_to_show_comments}
                  setCommentsScreenIsOpen={setCommentsScreenIsOpen}
                />
              )}
              {leftNavigationChoice == "hashiSolvedChoice" && (
                <SolvedHashiPuzzlesInfoBlock
                  set_id_to_show_comments={set_id_to_show_comments}
                  setCommentsScreenIsOpen={setCommentsScreenIsOpen}
                />
              )}
            </ManageAccountInfoBlock>
          </ManageAccountInfoContainer>
        </ManageAccountPageBody>
      </MainPageContainer>
    </>
  );
}

const ManageAccountTitle = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  font-size: ${text_styles.resizbale_font.xlrg};
  font-weight: bolder;
  color: #${colors.chocolate};
`;
const ManageAccountPageHead = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;

const ManageAccountInfoContainer = styled.div`
  flex: 20;
  display: flex;
  height: 100%;
  justify-content: center;
  flex-direction: column;
`;
const ManageAccountBarSpacer = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  borderradius: ${radiuses.lrg}px;
  justify-content: center;
  align-items: center;
`;
const MainSplitVerticalBar = styled.div`
  height: 100%;
  width: 20%;
  background-color: #${colors.chocolate};
  border-radius: ${radiuses.lrg}px;
`;

const ManageAccountInfoBlock = styled.div`
  background: linear-gradient(rgba(0, 0, 0, 0.681), rgba(0, 0, 0, 0.68));
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: ${margins.lrg}px;
  padding: ${paddings.lrg}px;
  border-radius: ${radiuses.med}px;
`;
const ManageAccountPageBody = styled.div`
  display: flex;
  flex: 5;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: row;
`;
const LeftNavigationContainer = styled.div`
  flex: 6;
  height: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  min-height: min-content;
`;
const LeftNavigation = styled.div`
  background: linear-gradient(rgba(0, 0, 0, 0.681), rgba(0, 0, 0, 0.68));
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  margin: ${margins.lrg}px;
  padding-bottom: ${paddings.lrg}px;
  padding-top: ${paddings.lrg}px;
  border-radius: ${radiuses.med}px;
  overflow-y: auto;
`;
const ManageAccountOption = styled.div`
  width: flex;
  background-color: none;
  flex-direction: column;
  margin-top: ${margins.small}px;
  margin-bottom: ${margins.small}px;
  color: #${colors.chocolate};
  display: flex;
  padding: ${paddings.lrg}px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: ${text_styles.resizbale_font.small_med};
  text-align: center;
  font-weight: bold;
  &:hover {
    background-color: #${colors.chocolate};
    color: #${colors.black};
  }
`;

const Bubble = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: red;
  border-radius: 70%;
  font-size: 2vh;
  color: white;
  position: absolute;
  z-index: -1;
  top: 50%;
  right: ${(props) => (props.title === "Messages" ? "-40%" : "-16%")};
  transform: translate(0%, -50%);
  width: 3vh;
  height: 3vh;
`;

const OptionTitle = styled.span`
  position: relative;
  z-index: 100;
`;

const SearchBar = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #${colors.lightCreme};
  padding: 1vw;
  position: relative;
`;

const SearchInput = styled.input`
  background-color: #${colors.lightCreme};
  padding: 1vw 2vw;
  width: 28vw;
  height: 4vw;
  box-sizing: border-box;
  border-bottom-left-radius: ${radiuses.xxxlrg}px;
  border-top-left-radius: ${radiuses.xxxlrg}px;
  border: none;
  font-size: 2vh;
  color: #${colors.darkerChocolate};
  font-weight: 500;
  &:focus {
    outline: none;
  }
  border: 1px solid #${colors.darkerChocolate};
  border-right: none;
  &::placeholder {
    font-weight: bold;
    font-style: italic;
    font-size: 2vh;
  }
`;

const SearcbBarButton = styled.div`
  background-color: #${colors.lightCreme};
  color: #${colors.darkerChocolate};
  font-size: 2vh;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2vh;
`;

const SearchIcon = styled.div`
  background-color: #${colors.lightCreme};
  padding: 1vw;
  height: 4vw;
  box-sizing: border-box;
  border-bottom-right-radius: ${radiuses.xxxlrg}px;
  border-top-right-radius: ${radiuses.xxxlrg}px;
  border: none;
  cursor: pointer;
  border-left: 1px solid black;
  border: 1px solid #${colors.darkerChocolate};
  border-left: none;
`;

const Results = styled.div`
  background-color: #${colors.lightCreme};
  padding: 1vw;
  height: 20vw;
  position: absolute;
  width: 50vw;
  top: 90%;
  z-index: 1000;
  border-radius: ${radiuses.med}px;
`;
