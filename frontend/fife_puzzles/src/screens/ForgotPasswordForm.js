import FormField from "../registration-components/FormField";
import React, { useRef, useCallback, useState } from "react";
import RegistrationPageConatiner, {
  ErrorMessage,
  RegistartionConfirmationMessage,
  RegistartionTitle,
  RegistartionVerifyEmail,
} from "../registration-components/RegistrationPageConatiner";
import puzzles_pattern from "../images/puzzles_pattern.png";
import Spacer from "../components/Spacer";
import GeneralButton from "../components/GeneralButton";
import FieldsContainer from "../components/FeildsContainer";
import paddings from "../style-utils/paddings";

// Screen for letting the user reset their password after forgetting it
const ForgotPasswordScreen = (props) => {
  const [message, setMessage] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState(undefined);

  const emailRef = useRef();

  // On trying to type a new email, the invalid message is removed if there is one
  const onFocus = useCallback(() => {
    if (invalidMessage) setInvalidMessage(undefined);
  }, [invalidMessage]);

  const requestPasswordChange = useCallback(async (event) => {
    event.preventDefault();
    // Get the email inputted by the user
    const email = emailRef.current.value;

    // Wait for a response from the server
    const response = await fetch(
      // Send a request for the server to handle a forgotten password
      `${process.env.REACT_APP_BACKEND_URL}users/forgotPassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
        // Send the email to the server
        body: JSON.stringify({
          email,
        }),
      }
    );
    // If the request was successful then display a message to the user telling them to check their email
    if (response.ok) {
      const data = await response.json();
      const { message } = data.data;
      setMessage(message);
    // The request was unsuccessful
    } else {
      // Get the message from the server that should be outputted to the user
      const { status, message } = await response.json();
      if (status === "fail" && message) {
        setInvalidMessage(message);
      }
    }
  }, []);

  return (
    // Sets the background of the page
    <RegistrationPageConatiner
      image_back={puzzles_pattern}
      style={{ justifyContent: "start", flexDirection: "column" }}
    >

      {/*Adds the title of the page*/}
      <Spacer />
      <RegistartionTitle>Forgot Password</RegistartionTitle>
      <Spacer />

      {/*The component which will hold the components required to let the user reset their password*/}
      <FieldsContainer style={{ padding: paddings.xxxlrg, width: "50vw" }}>
        {/*If there is an error message it is displayed*/}
        {invalidMessage && <ErrorMessage>{invalidMessage}</ErrorMessage>}
        {/*If no message is displayed showing that the password reset was successful, display the inputs required to reset password */}
        {!message && (
          <React.Fragment>
            {/*Input for the user's email to send a password reset email*/}
            <FormField
              title={"Email"}
              reference={emailRef}
              type={"text"}
              onFocus={onFocus}
            />
            {/*Button to submit email*/}
            <GeneralButton
              handleButtonPress={requestPasswordChange}
              style={{ width: "50%" }}
              label={"Send request"}
            />
          </React.Fragment>
        )}
        {/*If there is a confirmation message after successfully changing password it is displayed*/}
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
export default ForgotPasswordScreen;
