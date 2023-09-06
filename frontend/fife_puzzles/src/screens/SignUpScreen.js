import { useRef, useCallback, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginActions } from "../store/login-slice";
import React from "react";
import { redirect } from "react-router-dom";
import RegistrationForm from "../registration-components/RegistrationForm";
import RegistrationPageConatiner, {
  FormContainer,
  RegistartionTitle,
} from "../registration-components/RegistrationPageConatiner";
import puzzles_pattern from "../images/puzzles_pattern.png";
import { setSocketCreator, setSocketAdmin, setSocketSolver } from "../client";

const SignUpScreen = (props) => {
  const dispatch = useDispatch();
  const [invalidCreds, setInvalidCreds] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState(undefined);

  // References to the data in the input fields for each data ty;e
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const nameRef = useRef();

  const getErrorMessage = useCallback(async (res) => {
    const { status, message, keys } = await res.json();
    if (status === "fail" && message) {
      setInvalidCreds(true);
      if (keys) {
        const messagesMap = {};
        const messages = message.split("\n");
        for (let key in keys) {
          messagesMap[keys[key]] = messages[key];
        }
        console.log(messagesMap);
        setInvalidMessage(messagesMap);
      }
    }
  }, []);

  const buttonTitle = "Sign Up";

  // Function for when the user tries to submit their data to sign up
  const signUp = useCallback(
    async (event) => {
      event.preventDefault();

      // Get the data inputted by the user
      const name = nameRef.current.value;
      const email = emailRef.current.value;
      const password = passwordRef.current.value;
      const passwordConfirm = passwordConfirmRef.current.value;

      // Wait for the response from the server about trying to register the user
      const response = await fetch(
        // Send the registration data to the server to process
        `${process.env.REACT_APP_BACKEND_URL}users/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          credentials: "include",
          body: JSON.stringify({
            name,
            email,
            password,
            passwordConfirm,
          }),
        }
      );

      // Check if the registration was successful
      if (response.ok) {
        // Get the data about the user returned from the server
        const data = await response.json();
        const { user } = data.data;
        console.log(data);

        // Set the new user to be the current user of the website and set the flag to show that a user is logged in
        dispatch(loginActions.setUser({ user, isLoggedIn: true }));
        // Go to the home page

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

        // The registration was a failure
      } else {
        console.log("ERRORrr");
        //await getErrorMessage(response);
        // Get the error message from the server
        const { status, messageMap } = await response.json();
        // If an error message is returned then display on the screen
        if (status === "fail" && messageMap) {
          setInvalidCreds(true);
          setInvalidMessage(messageMap);
        }
      }
    },
    [dispatch, getErrorMessage]
  );

  // Upon focusing back at the sign in page we reset the varaibles related to invalid inputs to their defaults
  const onFocus = useCallback(() => {
    if (invalidCreds && invalidMessage) {
      setInvalidCreds(false);
      setInvalidMessage(undefined);
    }
  }, [invalidCreds, invalidMessage]);

  useEffect(() => {
    /* 
    ----------- REFERENCE -----------
    How to submit a form using enter key in react.js? (no date) Stack Overflow. 
    Available at: https://stackoverflow.com/questions/33211672/how-to-submit-a-form-using-enter-key-in-react-js 
    (Accessed: February 17, 2023). 
    */
    const listener = (event) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        console.log("Enter key was pressed. Run your function.");
        event.preventDefault();
        signUp(event);
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  return (
    <>
      {/*Set the background of the page*/}
      <RegistrationPageConatiner image_back={puzzles_pattern}>
        <FormContainer>
          {/*The form where the user will input their data*/}
          <RegistrationForm
            isSignUp={true}
            references={{
              emailRef,
              passwordConfirmRef,
              passwordRef,
              nameRef,
            }}
            onSubmit={signUp}
            buttonTitle={buttonTitle}
            invalid={invalidCreds}
            messageMap={invalidMessage}
            onFocus={onFocus}
          />
        </FormContainer>
        <RegistartionTitle>
          Register to explore the magical world behind the curtain.
        </RegistartionTitle>
      </RegistrationPageConatiner>
    </>
  );
};

export default SignUpScreen;
