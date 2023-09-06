import React, { useState, useRef } from "react";
import styled from "styled-components";
import GeneralButton from "../components/GeneralButton";
import FormField from "../registration-components/FormField";
import { useDispatch } from "react-redux";
import margins from "../style-utils/margins";
import radiuses from "../style-utils/radiuses";
import borders from "../style-utils/borders";
import colors from "../style-utils/colors";
import paddings from "../style-utils/paddings";
import text_styles from "../style-utils/text_styles";
import { emitMessage } from "../client";
import { fcActions } from "../store/flagged-comments-slice";

const FlaggedCommentInfoBlock = (props) => {
  const { flaggedCommentInfo } = props;
  const { ticketer, datePosted, feedback, message } = flaggedCommentInfo;
  const [isResponding, setIsResponding] = useState(false);
  const [banAccount, setBanAccount] = useState(false);
  const [isIssue, setIsIssue] = useState(false);
  const messageRef = useRef();
  const subjectRef = useRef();
  const dispatch = useDispatch();

  const resolveFlaggedCommentTicket = async () => {
    const message = messageRef.current.value;
    const subject = subjectRef.current.value;

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}flagged-comments/resolve-ticket`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketID: flaggedCommentInfo._id,
          message: message.trim(),
          subject: subject.trim(),
          isIssue,
          banAccount,
        }),
        withCredentials: true,
        credentials: "include",
      }
    );

    if (response.ok) {
      const { data } = await response.json();
      console.log(data);
      dispatch(fcActions.resolveFlaggedComment(data.flaggedCommentTicket._id));
      emitMessage("resolved-new-flagged-comment-ticket", {
        ticketID: data.flaggedCommentTicket._id,
        hasMessage: message !== "" || subject !== "",
        isIssue,
      });
      if (banAccount)
        emitMessage("ban-account", {
          userID: data.flaggedCommentTicket.feedback["user-id"],
        });
    } else {
      console.log("Something went wrong");
    }
  };

  return (
    <FlaggedCommentBlock>
      <React.Fragment>
        <TicketInfo>
          <div>
            <b>Ticketer ID:</b> {ticketer}
          </div>
          <div>
            <b>Commenter ID:</b> {feedback["user-id"]}
          </div>
          <div>
            <b>Puzzle ID:</b> {feedback["puzzle-id"]}
          </div>
          <div>
            {new Date(datePosted).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </TicketInfo>
        <CommentInfo>
          {!isResponding && (
            <CommentInfoLeft>
              <Message style={{ marginBottom: `${margins.xxsmall}vw` }}>
                <div>
                  <b style={{ color: `${colors.creme}` }}>Issue:</b>
                </div>
                <div
                  style={{
                    padding: `${paddings.xxsmall}vw`,
                    background: "white",
                    borderRadius: `${radiuses.med}px`,
                    color: `#${colors.black}`,
                    overflowY: "auto",
                    maxHeight: "36vh",
                  }}
                >
                  {message}
                </div>
              </Message>
              <Message>
                <div>
                  <b style={{ color: `${colors.creme}` }}>Comment:</b>
                </div>
                <div
                  style={{
                    padding: `${paddings.xxsmall}vw`,
                    background: "white",
                    borderRadius: `${radiuses.med}px`,
                    color: `#${colors.black}`,
                    overflowY: "auto",
                    maxHeight: "36vh",
                  }}
                >
                  {feedback.comment}
                </div>
              </Message>
            </CommentInfoLeft>
          )}
          {isResponding && (
            <CommentInfoLeft>
              <div>
                <FormField
                  title={"Subject (optional)"}
                  reference={subjectRef}
                  type={"text"}
                  smallLabel={true}
                  style={{ width: "40vw" }}
                />
                <FormField
                  title={`Message to ${
                    isIssue ? "commenter" : "ticketer"
                  } (optional)`}
                  reference={messageRef}
                  type={"text"}
                  extendedMessage={true}
                  smallLabel={true}
                />
              </div>
            </CommentInfoLeft>
          )}
          <CommentInfoRight>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "space-evenly",
                width: "100%",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  width: "100%",
                }}
              >
                <GeneralButton
                  label={isResponding ? "Cancel" : "Remove"}
                  handleButtonPress={() => {
                    if (isResponding) {
                      setIsResponding(false);
                      if (isIssue) setIsIssue(false);
                      if (banAccount) setBanAccount(false);
                    } else {
                      setIsResponding(true);
                      setIsIssue(true);
                    }
                  }}
                ></GeneralButton>
                <GeneralButton
                  label={isResponding ? "Confirm" : "No issue"}
                  handleButtonPress={() => {
                    if (isResponding) resolveFlaggedCommentTicket();
                    else {
                      setIsResponding(true);
                    }
                  }}
                ></GeneralButton>
              </div>

              {!isResponding && (
                <GeneralButton
                  label={"Remove and ban account"}
                  handleButtonPress={() => {
                    if (isResponding) resolveFlaggedCommentTicket();
                    else {
                      setIsResponding(true);
                      setBanAccount(true);
                      setIsIssue(true);
                    }
                  }}
                ></GeneralButton>
              )}
            </div>
          </CommentInfoRight>
        </CommentInfo>
      </React.Fragment>
    </FlaggedCommentBlock>
  );
};

const FlaggedCommentBlock = styled.div`
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

const TicketInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #${colors.creme};
  font-size: ${text_styles.resizbale_font.small};
  width: 100%;
  margin-bottom: ${margins.xxsmall}vw;
`;

const CommentInfo = styled.div`
  display: flex;

  justify-content: space-between;
  color: #${colors.creme};
  font-size: ${text_styles.resizbale_font.small};
  width: 100%;
`;

const CommentInfoLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  width: 60%;
`;

const CommentInfoRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  width: 40%;
`;
// align-items: center;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1vh;
  width: 100%;
`;

export default FlaggedCommentInfoBlock;
