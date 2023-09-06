import { useParams } from "react-router-dom";
import FormField from "../registration-components/FormField";
import React, { useRef, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { loginActions } from "../store/login-slice";
import GeneralButton from "../components/GeneralButton";
import { redirect } from "react-router-dom";
import puzzles_pattern from "../images/puzzles_pattern.png";
import RegistrationPageConatiner, {
  ErrorMessage,
  RegistartionConfirmationMessage,
  RegistartionTitle,
} from "../registration-components/RegistrationPageConatiner";
import Spacer from "../components/Spacer";
import FieldsContainer from "../components/FeildsContainer";
import paddings from "../style-utils/paddings";

// Screen to let the user reset their password after clicking the link in the email when they have forgotten their password
const ResetPasswordScreen = (props) => {
  const { resetToken } = useParams();

  // Used to display messages to the user
  const [invalidMessage, setInvalidMessage] = useState(undefined);
  const [invalidTokenMessage, setInvalidTokenMessage] = useState(undefined);
  const [message, setMessage] = useState(undefined);

  const dispatch = useDispatch();

  // Used to get eh inputs provided by the user for their email and password inputs
  const emailRef = useRef();
  const newPasswordRef = useRef();
  const newPasswordConfirmRef = useRef();

  // Removes any error messages when the user starts interacting with the input fields again
  const onFocus = useCallback(() => {
    if (invalidMessage) setInvalidMessage(undefined);
    if (invalidTokenMessage) setInvalidTokenMessage(undefined);
  }, [invalidMessage, invalidTokenMessage]);

  // Let the user reset their password
  const resetPassword = useCallback(
    async (event) => {
      event.preventDefault();
      // Get the values inputted by the user
      const email = emailRef.current.value;
      const newPassword = newPasswordRef.current.value;
      const newPasswordConfirm = newPasswordConfirmRef.current.value;

      // Make a request to the server
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}users/resetPassword/${resetToken}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          credentials: "include",
          // Send the email and passwords to the server
          body: JSON.stringify({
            email,
            password: newPassword,
            passwordConfirm: newPasswordConfirm,
          }),
        }
      );

      // The request was successful
      if (response.ok) {
        // Get the user returned from the server and log them in
        const data = await response.json();
        const { user } = data.data;
        dispatch(loginActions.setUser({ user, isLoggedIn: true }));
        // Display a message to let the user know they were able to change their password
        setMessage("Password changed successfully!");
        // Redirects the user to the home page
        redirect("/");
      // The request was unsuccessful
      } else {
        // Get the messages returned from the server
        const { status, message, messageMap } = await response.json();
        console.log(status, message, messageMap);
        // Check that the status indicates that the request failed rather then didn't work due to an error
        if (status === "fail") {
          // There's only one error
          if (message && !messageMap) {
            // Check if the error is due to the email being incorrect
            if (message.includes("email")) {
              setInvalidMessage({ email: message });
            // The error is due to a problem with the token
            } else {
              setInvalidTokenMessage(message);
            }
          // There are multiple errors to be displayed
          } else if (messageMap) {
            console.log("HEREEEE");
            setInvalidMessage(messageMap);
          }
        }
      }
    },
    [dispatch, resetToken]
  );

  return (
    // Sets the background of the page and the format for the page
    <RegistrationPageConatiner
      image_back={puzzles_pattern}
      style={{ justifyContent: "start", flexDirection: "column" }}
    >
      <Spacer />
      <RegistartionTitle>Password Reset</RegistartionTitle>
      <Spacer />
      <FieldsContainer style={{ padding: paddings.xxxlrg, width: "50vw" }}>
        {/*If there is an error due to the token then it is shown*/}
        {invalidTokenMessage && (
          <ErrorMessage>{invalidTokenMessage}</ErrorMessage>
        )}
        {/*If there isn't a message then we display the form fields required to reset the password*/}
        {!message && (
          <React.Fragment>
            <FormField
              title={"Email"}
              reference={emailRef}
              type={"text"}
              onFocus={onFocus}
              invalid={invalidMessage || invalidTokenMessage ? true : false}
              message={invalidMessage ? invalidMessage.email : undefined}
            />
            <FormField
              title={"New Password"}
              reference={newPasswordRef}
              type={"password"}
              onFocus={onFocus}
              invalid={invalidMessage || invalidTokenMessage ? true : false}
              message={invalidMessage ? invalidMessage.password : undefined}
            />
            <FormField
              title={"Confirm New Password"}
              reference={newPasswordConfirmRef}
              type={"password"}
              onFocus={onFocus}
              invalid={invalidMessage || invalidTokenMessage ? true : false}
              message={
                invalidMessage ? invalidMessage.passwordConfirm : undefined
              }
            />
            <GeneralButton
              handleButtonPress={resetPassword}
              style={{ width: "50%" }}
              label={"Reset Password"}
            />
          </React.Fragment>
        )}
        {/*If the previous password reset was successful then we display the message saying so instead of the form*/}
        {message && (
          <RegistartionConfirmationMessage>
            {message}
          </RegistartionConfirmationMessage>
        )}
      </FieldsContainer>
      <Spacer />
      <Spacer />
      <Spacer />
    </RegistrationPageConatiner>
  );
};
export default ResetPasswordScreen;
