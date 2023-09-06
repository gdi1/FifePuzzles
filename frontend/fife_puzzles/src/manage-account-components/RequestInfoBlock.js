import React, { useState, useRef } from "react";
import styled from "styled-components";
import GeneralButton from "../components/GeneralButton";
import FormField from "../registration-components/FormField";
import { useDispatch } from "react-redux";
import { prActions } from "../store/promotion-requests-slice";
import margins from "../style-utils/margins";
import radiuses from "../style-utils/radiuses";
import borders from "../style-utils/borders";
import colors from "../style-utils/colors";
import paddings from "../style-utils/paddings";
import text_styles from "../style-utils/text_styles";
import { emitMessage } from "../client";

const RequestInfoBlock = (props) => {
  const { requestInfo } = props;
  const { user, datePosted } = requestInfo;
  const [verdict, setVerdict] = useState(undefined);
  const messageRef = useRef();
  const subjectRef = useRef();
  const dispatch = useDispatch();

  const resolveRequest = async (verdict) => {
    const message = messageRef.current.value;
    const subject = subjectRef.current.value;

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}promotion-requests/resolve-promotion-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promID: requestInfo._id,
          verdict,
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
      dispatch(prActions.resolvePromotionRequest(requestInfo._id));
      emitMessage("resolved-new-promotion-request", {
        promID: requestInfo._id,
        hasMessage: subject !== "" || message !== "",
      });
      /*if (message !== "" || subject !== "")
        emitMessage("send-new-message", { userID: user._id });*/
    } else {
      console.log("Something went wrong");
    }
  };

  return (
    <RequestBlock>
      {!verdict && (
        <React.Fragment>
          <UserInfo>
            <div>
              <b>User ID:</b> {user.id}
            </div>
            <div>
              <b>User name:</b> {user.name}
            </div>
            <div>
              <b>Group no:</b> {user.groupID}
            </div>
            <div>
              {new Date(datePosted).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </UserInfo>
          <RequestInfo>
            <Message>
              <div>
                <b style={{ color: `${colors.creme}` }}>Message:</b>
              </div>
              <div
                style={{
                  padding: `${paddings.xxsmall}vw`,
                  background: "white",
                  borderRadius: `${radiuses.med}px`,
                  color: `#${colors.black}`,
                }}
              >
                {requestInfo.message}
              </div>
            </Message>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
                width: "60%",
              }}
            >
              <GeneralButton
                label={"Decline"}
                handleButtonPress={() => {
                  setVerdict("rejected");
                }}
              ></GeneralButton>
              <GeneralButton
                label={"Accept"}
                handleButtonPress={() => {
                  setVerdict("accepted");
                }}
              ></GeneralButton>
            </div>
          </RequestInfo>
        </React.Fragment>
      )}
      {verdict && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "80%",
            }}
          >
            <FormField
              title={"Subject (optional)"}
              reference={subjectRef}
              type={"text"}
              smallLabel={true}
            />
            <FormField
              title={"Message (optional)"}
              reference={messageRef}
              type={"text"}
              extendedMessage={true}
              smallLabel={true}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-evenly",
              width: "50%",
            }}
          >
            <GeneralButton
              label={"Cancel"}
              handleButtonPress={() => {
                setVerdict(undefined);
              }}
            ></GeneralButton>
            <GeneralButton
              label={"Confirm"}
              handleButtonPress={() => {
                resolveRequest(verdict);
              }}
            ></GeneralButton>
          </div>
        </div>
      )}
    </RequestBlock>
  );
};

const RequestBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: baseline;
  color: #${colors.creme};
  width: 95%;
  margin: ${margins.xxsmall}vw ${margins.xxsmall}vw;
  border: ${borders.med}px solid #${colors.creme};
  padding: ${paddings.xxsmall}vw;
  box-sizing: border-box;
  border-radius: ${radiuses.med}px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #${colors.creme};
  font-size: ${text_styles.resizbale_font.small};
  width: 100%;
  margin-bottom: ${margins.xxsmall}vw;
`;

const RequestInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #${colors.creme};
  font-size: ${text_styles.resizbale_font.small};
  width: 100%;
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1vh;
  width: 100%;
`;

export default RequestInfoBlock;
