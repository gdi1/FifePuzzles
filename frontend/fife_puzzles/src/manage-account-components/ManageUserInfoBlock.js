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
import React, { useCallback, useRef, useState } from "react";
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
import { Button } from "react-native-web";

export default function ManageUserInfoBlock({
  setChangePasswordModalIsOpen,
  setChangeNameModalIsOpen,
  setRequestPromModalIsOpen,
  setDeleteAccountIsOpenModal,
}) {
  // Get the user currently logged in to display their information
  const { user } = useSelector((state) => state.login);

  //get c
  const [comments, setComments] = useState([]);

  return (
    <>
      {/*Organise the data being displayed into rows so we can start to form a table of data */}
      <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
        {/*Display the name of the data being displayed in columns*/}
        <div
          style={{
            alignItems: "center",
            backgroundColor: "",
            flexDirection: "column",
            display: "flex",
            flex: 1,
          }}
        >
          {!user.isGuest && (
            <span
              style={{
                margin: margins.lrg,
                color: `#${colors.chocolate}`,
                fontSize: text_styles.resizbale_font.small_med,
              }}
            >
              Email:
            </span>
          )}
          <span
            style={{
              margin: margins.lrg,
              color: `#${colors.chocolate}`,
              fontSize: text_styles.resizbale_font.small_med,
            }}
          >
            Display Name:
          </span>
          <span
            style={{
              margin: margins.lrg,
              color: `#${colors.chocolate}`,
              fontSize: text_styles.resizbale_font.small_med,
            }}
          >
            Role:
          </span>
        </div>

        {/*The display the data on the user in the correct row to match up with the data title*/}
        <div
          style={{
            alignItems: "center",
            backgroundColor: "",
            flexDirection: "column",
            display: "flex",
            flex: 1,
          }}
        >
          {!user.isGuest && (
            <span
              style={{
                margin: margins.lrg,
                color: `#${colors.chocolate}`,
                fontSize: text_styles.resizbale_font.small_med,
              }}
            >
              {user.email}
            </span>
          )}
          <span
            style={{
              margin: margins.lrg,
              color: `#${colors.chocolate}`,
              fontSize: text_styles.resizbale_font.small_med,
            }}
          >
            {user.name}
          </span>
          <span
            style={{
              margin: margins.lrg,
              color: `#${colors.chocolate}`,
              fontSize: text_styles.resizbale_font.small_med,
            }}
          >
            {user.role}
          </span>
        </div>

        {/*Add a button to let the user change their details*/}
        <div
          style={{
            alignItems: "center",
            backgroundColor: "",
            flexDirection: "column",
            display: "flex",
            flex: 1,
          }}
        >
          {/*Ignore the first two rows for styling*/}
          <span
            style={{
              margin: margins.lrg,
              color: `#${colors.chocolate}`,
              fontSize: text_styles.resizbale_font.small_med,
            }}
          >
            &nbsp;
          </span>
          <span
            style={{
              margin: margins.lrg,
              color: `#${colors.chocolate}`,
              fontSize: text_styles.resizbale_font.small_med,
            }}
          >
            &nbsp;
          </span>

          {/*Add a button allowing the user to change their details in the last row */}
          {!user.isGuest ? (
            <GeneralButton
              label={"Change Name"}
              handleButtonPress={() => setChangeNameModalIsOpen(true)}
            ></GeneralButton>
          ) : (
            <span
              style={{
                margin: margins.lrg,
                color: `#${colors.chocolate}`,
                fontSize: text_styles.resizbale_font.small_med,
              }}
            >
              &nbsp;
            </span>
          )}
        </div>
      </div>

      {/*Provide user options to change data not displayed on their profile page so long as they aren't a guest*/}
      {!user.isGuest && (
        <>
          {/*Allow a user to delete their profile or reset their password*/}
          <div
            style={{
              display: "flex",
              flex: 2,
              flexDirection: "row",
              backgroundColor: "",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <GeneralButton
              label={"Reset Password"}
              handleButtonPress={() => setChangePasswordModalIsOpen(true)}
            ></GeneralButton>
            <GeneralButton
              label={"Delete Account"}
              handleButtonPress={() => setDeleteAccountIsOpenModal(true)}
            ></GeneralButton>
          </div>
        </>
      )}

      {/*Offer users the ability to apply for better roles*/}
      <div
        style={{
          display: "flex",
          flex: 2,
          flexDirection: "row",
          backgroundColor: "",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        {/*Solvers can apply to be creators and checkers*/}
        {user.role === "solver" && (
          <GeneralButton
            label={"Request To Become Creator"}
            handleButtonPress={() => setRequestPromModalIsOpen(true)}
          ></GeneralButton>
        )}
      </div>
    </>
  );
}
