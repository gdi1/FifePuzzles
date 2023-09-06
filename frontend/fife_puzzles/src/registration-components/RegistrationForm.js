import FormField from "./FormField";

import React, { useState, useCallback } from "react";
import FieldsContainer from "../components/FeildsContainer";
import paddings from "../style-utils/paddings";
import {
  ErrorMessage,
  OtherSiteLinkArrowImage,
  OtherSiteLinkContainer,
  OtherSiteLinkSelection,
  OtherSiteLinkSelectionOption,
  RegistartionLink,
  RegistartionLinkContainer,
} from "../registration-components/RegistrationPageConatiner";
import GeneralButton from "../components/GeneralButton";
import right_arrow from "./../icons/right-arrow.png";

// used on the registration and login screens to take inputs from the user
const RegistrationForm = (props) => {
  const {
    isSignUp,
    isCrossAuth,
    references,
    onSubmit,
    buttonTitle,
    invalid,
    messageMap,
    invalidMessage,
    onFocus,
  } = props;

  const { nameRef, passwordRef, passwordConfirmRef, emailRef } = references;

  // The options for other federation sites the user can cross-register on
  const puzzleSites = [20, 21, 22, 23, 24, 25, 27, 28, 29];
  const [puzzleSite, setPuzzleSite] = useState(20);

  // Redirect the user to the new puzzle site login they wanted to go to
  const goToPuzzleSite = useCallback(() => {
    // Get the URL of the puzzle site by replacing the general group id with the actual id of the group
    const redirectURL =
      process.env.REACT_APP_REDIRECT_URL.replace("<groupID>", puzzleSite) +
      "redirect=" +
      process.env.REACT_APP_REDIRECT_BACK_URL;
    // Change the window to display the new URL
    window.location.replace(redirectURL);
  }, [puzzleSite]);

  return (
    <FieldsContainer style={{ padding: paddings.xxxlrg }}>
      {/*If the user isn't signing up or logging in to a different ferderation site then we provide functionality to register on a different
      puzzle site */}
      {!isSignUp && !isCrossAuth && (
        <OtherSiteLinkContainer>
          <RegistartionLinkContainer>
            Registered somewhere else?
          </RegistartionLinkContainer>
          {/*Let the user go to a different puzzle site for cross-registration */}
          <OtherSiteLinkArrowImage
            alt="Right Arrow For Redirect"
            src={right_arrow}
            onClick={goToPuzzleSite}
          />
          {/*Select the group website they want to cross-register with*/}
          <OtherSiteLinkSelection
            value={puzzleSite}
            onChange={(e) => {
              setPuzzleSite(e.target.value);
            }}
          >
            {puzzleSites.map((puzzSite) => (
              <option key={puzzSite} value={puzzSite}>
                {puzzSite}
              </option>
            ))}
          </OtherSiteLinkSelection>
        </OtherSiteLinkContainer>
      )}
      {/*Display an error message if a previous sign in attempt failed*/}
      {invalid && !isSignUp && <ErrorMessage>{invalidMessage}</ErrorMessage>}
      {/*If a user is signing up then they need to provide a username*/}
      {isSignUp && (
        <FormField
          title={"Name"}
          reference={nameRef}
          type={"text"}
          onFocus={onFocus}
          invalid={invalid}
          message={messageMap ? messageMap.name : undefined}
        />
      )}
      {/*Provide the email and password fields which are needed for any kind of signup or registration*/}
      <FormField
        title={"Email"}
        reference={emailRef}
        type={"text"}
        onFocus={onFocus}
        invalid={invalid}
        message={messageMap ? messageMap.email : undefined}
      />
      <FormField
        title={"Password"}
        reference={passwordRef}
        type={"password"}
        onFocus={onFocus}
        invalid={invalid}
        message={messageMap ? messageMap.password : undefined}
      />
      {/*If a user is signing up then a confirmation password field is used to check the user knows their password*/}
      {isSignUp && (
        <React.Fragment>
          <FormField
            title={"Confirm"}
            reference={passwordConfirmRef}
            type={"password"}
            onFocus={onFocus}
            invalid={invalid}
            message={messageMap ? messageMap.passwordConfirm : undefined}
          />
        </React.Fragment>
      )}
      {/*Button to submit the form*/}
      <GeneralButton
        handleButtonPress={onSubmit}
        label={buttonTitle}
        style={{ width: !isCrossAuth ? "50%" : "70%", "text-align": "center" }}
      />
      {/*Provide links to switch between registering a new account and logging in */}
      {!isCrossAuth && (
        <React.Fragment>
          <RegistartionLinkContainer>
            <div>
              {!isSignUp
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
              &nbsp;
            </div>
            <RegistartionLink to={!isSignUp ? "/signup" : "/login"}>
              here
            </RegistartionLink>
            <div>.</div>
          </RegistartionLinkContainer>
          {/*If a user is logging in, provide the option to reset their password if they forgot it*/}
          {!isSignUp && (
            <RegistartionLinkContainer>
              <div>Forgot your password? Reset it&nbsp;</div>
              <RegistartionLink to={"/forgotPassword"}>here</RegistartionLink>
              <div>.</div>
            </RegistartionLinkContainer>
          )}
        </React.Fragment>
      )}
    </FieldsContainer>
  );
};
export default RegistrationForm;
