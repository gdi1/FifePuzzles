import { useRef, useCallback, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginActions } from "../store/login-slice";
import React from "react";
import { redirect } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import RegistrationForm from "../registration-components/RegistrationForm";
import puzzles_pattern from "../images/puzzles_pattern.png";
import RegistrationPageConatiner, {
  FormContainer,
  RegistartionTitle,
} from "../registration-components/RegistrationPageConatiner";
import PopUp from "../registration-components/PopUp";
import { setSocketAdmin, setSocketSolver, setSocketCreator } from "../client";

const LoginScreen = (props) => {
  // Flag for if the login screen is being used to log a user in on a different federation website
  const { isCrossAuth } = props;
  const { isLoggedIn, token, user, isAnotherUser } = useSelector(
    (state) => state.login
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [invalidCreds, setInvalidCreds] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState(undefined);

  // Will store the email and password inputted by the user
  const emailRef = useRef();
  const passwordRef = useRef();

  // Get the error message that needs displaying to the user
  const getErrorMessage = useCallback(async (res) => {
    const data = await res.json();
    const { status, message } = data;
    if (status === "fail" && message) {
      setInvalidCreds(true);
      setInvalidMessage(message);
    } else if (status === "banned-account") {
      const { message, subject } = data.data;
      console.log(data);
      dispatch(loginActions.setBanned({ banned: true, message, subject }));
    }
  }, []);

  const buttonTitle = isCrossAuth ? "Authorize Cross-Site Request" : "Login";

  // Redirect the user to the correct federation page
  const redirectToken = useCallback(
    async (token) => {
      // Get the URL of the site we need to redirect to
      let crossSiteURL = searchParams.get("redirect");
      // Check we have a URL and a token
      if (crossSiteURL && token) {
        // Add the token to the end of the URL then redirect to the new URL which'll be the site logged in as the correct user
        crossSiteURL += `${token}`;
        console.log(crossSiteURL);
        window.location.replace(crossSiteURL);
      }
    },
    [searchParams]
  );

  const login = useCallback(
    async (event) => {
      event.preventDefault();

      // Get the email and password inputted by the user
      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      // Request the server to login the user with the inputted email and password
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          credentials: "include",
          // Send the password and email to the server and if the user logging in is a different user
          body: JSON.stringify({
            email,
            password,
            isAnotherUser: isAnotherUser || (user && user.isGuest),
          }),
        }
      );

      // The request was successful
      if (response.ok) {
        // Get the data from the response
        const data = await response.json();
        const { user, token } = data.data;
        console.log(data);

        // Check if the login was for a different federation website
        if (isCrossAuth) {
          // Redirect the user back to the website they wanted to login to
          console.log(token);
          redirectToken(token);

          // Set the user as the current user and redirect them to the home page so they can start using our website
        } else {
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

        // The server request was unsuccessful and the error message is displayed to the user
      } else {
        console.log("hereee");
        await getErrorMessage(response);
      }
    },
    [redirectToken, dispatch, isCrossAuth, getErrorMessage, isAnotherUser]
  );

  // On putting focus back on the input boxes, any invalid flags from the previous request are reset for the new inputs
  const onFocus = useCallback(() => {
    if (invalidCreds && invalidMessage) {
      setInvalidCreds(false);
      setInvalidMessage(undefined);
    }
  }, [invalidCreds, invalidMessage]);

  // On cancelling the popup, the user is set such that they need to login again
  const onCancel = useCallback(() => {
    dispatch(loginActions.setIsAnotherUser(true));
  }, [dispatch]);

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
        login(event);
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  return (
    <>
      {/*If the user is logged in but has reached the login page, let them decide if they want to stay logged in or login as a different user */}
      {isLoggedIn === true && !isAnotherUser && user && !user.isGuest && (
        <PopUp
          name={user.name}
          token={token}
          onCancel={onCancel}
          onAccept={redirectToken}
        />
      )}
      {/*The user needs to login to the website*/}
      {(isLoggedIn === false ||
        isAnotherUser === true ||
        (user && user.isGuest)) && (
        // The page is constructued to provide inputs to login
        <RegistrationPageConatiner image_back={puzzles_pattern}>
          <FormContainer>
            {/*Create a registration form with the intention of letting the user login*/}
            <RegistrationForm
              isSignUp={false}
              isCrossAuth={isCrossAuth}
              references={{
                emailRef,
                passwordRef,
              }}
              onSubmit={login}
              buttonTitle={buttonTitle}
              invalid={invalidCreds}
              invalidMessage={invalidMessage}
              onFocus={onFocus}
            />
          </FormContainer>
          <RegistartionTitle>
            Register to explore the magical world behind the curtain.
          </RegistartionTitle>
        </RegistrationPageConatiner>
      )}
    </>
  );
};

export default LoginScreen;
