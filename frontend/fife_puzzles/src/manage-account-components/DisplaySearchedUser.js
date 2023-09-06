import { useSelector, useDispatch } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";
import GeneralButton from "../components/GeneralButton";
import { ScrollView } from "react-native-web";
import { useState } from "react";
import colors from "../style-utils/colors";
import paddings from "../style-utils/paddings";
import margins from "../style-utils/margins";
import borders from "../style-utils/borders";
import radiuses from "../style-utils/radiuses";
import text_styles from "../style-utils/text_styles";
import styled from "styled-components";
import SearchedUserActivityChartContainer from "./SearchedUserActivityChartContainer";
import SearchedUserPuzzleTypeChartContainer from "./SearchedUserPuzzleChartsContainer";
import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import FormField from "../registration-components/FormField";
import { useRef } from "react";
import { emitMessage } from "../client";
import { utdActions } from "../store/user-to-display-slice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DisplaySearchedUser = (props) => {
  const dispatch = useDispatch();
  const { user, showUser, isFetchingRecentUser } = useSelector(
    (state) => state.userToDisplay
  );
  const messageRef = useRef();
  const subjectRef = useRef();
  const [action, setAction] = useState("");

  console.log(action);

  const takeAction = async () => {
    const message = messageRef.current.value.trim();
    const subject = subjectRef.current.value.trim();

    if (action === "ban") {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}users/resolve-ban`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID: user._id,
            message,
            subject,
          }),
          withCredentials: true,
          credentials: "include",
        }
      );
      if (response.ok) {
        const { data } = await response.json();
        console.log(data);
        if (!data.user.active)
          emitMessage("ban-account", {
            userID: data.user._id,
          });
        dispatch(utdActions.setUserActive(data.user.active));
        setAction("");
      }
    } else if (action === "message") {
      if (message === "" || subject === "") {
        setInvalid(true);
        if (message === "") setInvalidMessage("Must provide message");
        if (subject === "") setInvalidSubject("Must provide subject");
      } else {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}users/send-message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userID: user._id,
              message,
              subject,
            }),
            withCredentials: true,
            credentials: "include",
          }
        );
        if (response.ok) {
          const { data } = await response.json();
          console.log(data);
          emitMessage("send-message", {
            userID: user._id,
          });
          setAction("");
        } else {
          console.log("Smth went worng");
        }
      }
    }
  };

  const [invalid, setInvalid] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState(undefined);
  const [invalidSubject, setInvalidSubject] = useState(undefined);

  return (
    <ScrollView
      style={{
        display: "flex",
        flexDirection: "column",
        height: 100,
      }}
    >
      {user && showUser && !isFetchingRecentUser && (
        <React.Fragment>
          {action === "" && (
            <UserInfo>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  height: "100%",
                  padding: "1vw",
                  boxSizing: "border-box",
                  borderBottom: `${borders.med}px solid #${colors.chocolate}`,
                }}
              >
                <div>
                  <b>User ID</b>: {user._id}
                </div>
                <div>
                  <b>Group ID</b>: {user.userID}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "space-evenly",
                    justifyContent: "space-evenly",
                    width: "40%",
                    height: "20vh",
                  }}
                >
                  <div>
                    <b>Email</b>: {user.email}
                  </div>
                  <div>
                    <b>Name</b>: {user.name}
                  </div>
                  <div>
                    <b>Role</b>: {user.role}
                  </div>
                  <div>
                    <b>Group</b>: {user.groupID}
                  </div>
                  <div>
                    <b>Status</b>: {user.active ? "active" : "banned"}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: user.active ? "35%" : "45%",
                  }}
                >
                  <GeneralButton
                    label={user.active ? "Ban account" : "Reactivate account"}
                    handleButtonPress={() => {
                      setAction("ban");
                    }}
                  />
                  <GeneralButton
                    label={"Send message"}
                    handleButtonPress={() => {
                      setAction("message");
                    }}
                  />
                </div>
              </div>
            </UserInfo>
          )}
          {action !== "" && (
            <UserInfo>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <MessageSection>
                  <div>
                    <FormField
                      title={`Subject ${action === "ban" ? "(optional)" : ""}`}
                      type={"text"}
                      smallLabel={true}
                      style={{ width: "40vw" }}
                      reference={subjectRef}
                      invalid={invalid}
                      message={invalidSubject || undefined}
                      onFocus={() => {
                        setInvalidMessage(undefined);
                        setInvalidSubject(undefined);
                        setInvalid(false);
                      }}
                    />
                    <FormField
                      title={`Message ${action === "ban" ? "(optional)" : ""}`}
                      type={"text"}
                      extendedMessage={true}
                      smallLabel={true}
                      reference={messageRef}
                      invalid={invalid}
                      message={invalidMessage || undefined}
                      onFocus={() => {
                        setInvalidMessage(undefined);
                        setInvalidSubject(undefined);
                        setInvalid(false);
                      }}
                    />
                  </div>
                </MessageSection>
                <ButtonGroup>
                  <GeneralButton
                    label={"Cancel"}
                    handleButtonPress={() => {
                      setAction("");
                    }}
                  />
                  <GeneralButton
                    label={"Confirm"}
                    handleButtonPress={async () => {
                      await takeAction();
                    }}
                  />
                </ButtonGroup>
              </div>
            </UserInfo>
          )}
          <SearchedUserPuzzleTypeChartContainer />
          <SearchedUserActivityChartContainer />
        </React.Fragment>
      )}
      {isFetchingRecentUser && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <CircularProgress
            style={{
              width: 50,
              height: 50,
              color: `#${colors.creme}`,
            }}
            color={"inherit"}
          />
        </div>
      )}
    </ScrollView>
  );
};

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  color: #${colors.darkerChocolate};
  width: 100%;
  margin: auto;
  border: ${borders.med}px solid #${colors.chocolate};
  padding: ${paddings.xxsmall}vw;
  box-sizing: border-box;
  border-radius: ${radiuses.med}px;
  gap: 1vw;
  height: 100%;
  margin-bottom: 2vw;
  font-size: 2vh;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 30%;
`;

const MessageSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  width: 60%;
`;

export default DisplaySearchedUser;
