import styled from "styled-components";
import colors from "../style-utils/colors";
import borders from "../style-utils/borders";
import margins from "../style-utils/margins";
import radiuses from "../style-utils/radiuses";
import text_styles from "../style-utils/text_styles";
import { Link } from "react-router-dom";

// Holds the components required for registration and login pages
export default function RegistrationPageConatiner(props) {
  return (
    <Container image_back={props.image_back} style={props.style}>
      {props.children}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100vh;
  width: 100vw;
  background-image: linear-gradient(rgba(0, 0, 0, 0.681), rgba(0, 0, 0, 0.68)),
    url(${(props) => props.image_back});
  background-size: cover;
  background-position: center;
`;

export const FormContainer = styled.div`
  display: flex;
  width: 50%;
  height: max-content;
  justify-content: center;
`;

export const RegistartionTitle = styled.div`
  display: flex;
  justify-content: center;
  font-size: ${text_styles.resizbale_font.xlrg};
  font-weight: bolder;
  color: #${colors.chocolate};
  width: 50%;
`;

export const RegistartionLinkContainer = styled.div`
  display: flex;
  font-size: ${text_styles.resizbale_font.small_med};
  color: #${colors.chocolate};
  text-decoration: none;
  margin-top: ${margins.med}px;
  margin-bottom: ${margins.med}px;
`;
export const ErrorMessage = styled.div`
  color: #${colors.error};
  padding: 0;
  white-space: pre-wrap;
`;

export const RegistartionConfirmationMessage = styled.div`
  font-size: ${text_styles.resizbale_font.lrg};
  font-weight: bold;
  color: #${colors.chocolate};
  align-self: center;
`;

export const FormFieldConatiner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: baseline;
  justify-content: center;
  gap: 0;
  width: 100%;
  margin-top: ${margins.small}px;
  margin-bottom: ${margins.xxlrg}px;
`;

export const FormFieldLabel = styled.label`
  font-size: ${(props) =>
    props.smallLabel
      ? text_styles.resizbale_font.small_med
      : text_styles.resizbale_font.med};
  font-weight: bold;
  color: #${colors.chocolate};
  margin-bottom: ${margins.small}px;
  align-self: ${(props) => (props.centerLabel ? "center" : "baseline")};
`;
export const FormFieldInput = styled.input`
  border-radius: ${radiuses.small}px;
  border: ${borders.med}px solid antiquewhite;
  width: 100%;
  height: 5vh;
  font-size: ${text_styles.resizbale_font.small};
  outline: ${(props) => (props.isInvalid ? "auto" : "none")};
  outline-color: ${(props) => props.isInvalid && `#${colors.error}`};
`;

export const MessageFieldInput = styled.textarea`
  border-radius: ${radiuses.small}px;
  border: ${borders.med}px solid antiquewhite;
  width: ${(props) => (props.fixedWidth ? props.fixedWidth : "100%")};
  height: ${(props) => (props.extendedMessage ? "15vh" : "5vh")};
  font-size: ${text_styles.resizbale_font.small};
  outline: ${(props) => (props.isInvalid ? "auto" : "none")};
  outline-color: ${(props) => props.isInvalid && `#${colors.error}`};
`;

export const RegistartionLink = styled(Link)`
  text-decoration: none;
  color: #${colors.link};
`;

export const OtherSiteLinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: baseline;
  gap: 15px;
`;

export const OtherSiteLinkArrowImage = styled.img`
  height: 2vw;
  width: 2vw;
  cursor: pointer;
`;

export const OtherSiteLinkSelection = styled.select`
  width: 5vw;
  height: 2vw;
  border-radius: ${radiuses.med}px;
  color: #${colors.chocolate};
  background-color: #${colors.minor};
  font-size: ${text_styles.resizbale_font.small};
  font-weight: bold;
  border-color: #${colors.secondary};
  select.option {
    color: yellow;
  }
`;
