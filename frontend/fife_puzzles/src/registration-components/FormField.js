import React from "react";
import {
  ErrorMessage,
  FormFieldConatiner,
  FormFieldInput,
  FormFieldLabel,
  MessageFieldInput,
} from "../registration-components/RegistrationPageConatiner";
import text_styles from "../style-utils/text_styles";

// Field required to input data for a form
const FormField = (props) => {
  const {
    reference,
    title,
    type,
    invalid,
    onFocus,
    message,
    extendedMessage,
    centerLabel,
    smallLabel,
    fixedWidth,
    fixedHeight,
  } = props;

  console.log(fixedWidth);
  return (
    <FormFieldConatiner>
      {/*Displays the name of the field that needs filling in */}
      <FormFieldLabel centerLabel={centerLabel} smallLabel={smallLabel}>
        {title}{" "}
        {message && (
          <ErrorMessage style={{ fontSize: text_styles.resizbale_font.small }}>
            {message}
          </ErrorMessage>
        )}
      </FormFieldLabel>
      {/*The text box that the user will type in*/}
      {!extendedMessage && (
        <FormFieldInput
          isInvalid={invalid}
          type={type}
          ref={reference}
          onFocus={onFocus}
          extendedMessage={extendedMessage}
          required
        />
      )}
      {extendedMessage && (
        <MessageFieldInput
          isInvalid={invalid}
          type={type}
          ref={reference}
          onFocus={onFocus}
          extendedMessage={extendedMessage}
          fixedWidth={fixedWidth}
          fixedHeight={fixedHeight}
          required
        ></MessageFieldInput>
      )}
    </FormFieldConatiner>
  );
};

export default FormField;
