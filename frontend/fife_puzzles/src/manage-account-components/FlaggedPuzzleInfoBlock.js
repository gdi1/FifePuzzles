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
import MiniEightsPuzzle from "./MiniEightsPuzzle";
import MiniSudoku from "./MiniSudoku";
import MiniHashi from "./MiniHashi";
import { fpActions } from "../store/flagged-puzzles-slice";

const FlaggedPuzzleInfoBlock = (props) => {
  const { flaggedPuzzleInfo } = props;
  const { ticketer, datePosted, puzzle, puzzleType } = flaggedPuzzleInfo;
  const [isResponding, setIsResponding] = useState(false);
  const [isIssue, setIsIssue] = useState(false);
  const messageRef = useRef();
  const subjectRef = useRef();
  const dispatch = useDispatch();

  const resolveFlaggedPuzzleTicket = async () => {
    const message = messageRef.current.value;
    const subject = subjectRef.current.value;

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}flagged-puzzles/resolve-ticket`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketID: flaggedPuzzleInfo._id,
          message,
          subject,
          isIssue,
        }),
        withCredentials: true,
        credentials: "include",
      }
    );

    if (response.ok) {
      const { data } = await response.json();
      console.log(data);
      dispatch(fpActions.resolveFlaggedPuzzle(data.flaggedPuzzleTicket._id));
      emitMessage("resolved-new-flagged-puzzle-ticket", {
        ticketID: data.flaggedPuzzleTicket._id,
        hasMessage: message !== "" || subject !== "",
        isIssue,
      });
    } else {
      console.log("Something went wrong");
    }
  };

  return (
    <FlaggedPuzzleBlock>
      <React.Fragment>
        <TicketInfo>
          <div>
            <b>Ticketer ID:</b> {ticketer}
          </div>
          <div>
            <b>Creator ID:</b> {puzzle["creator-id"]}
          </div>
          <div>
            <b>Puzzle ID:</b> {puzzle._id}
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
        <PuzzleInfo>
          {!isResponding && (
            <PuzzleInfoLeft>
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
                    overflowY: "auto",
                    maxHeight: "36vh",
                  }}
                >
                  {flaggedPuzzleInfo.message}
                </div>
              </Message>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  padding: `${paddings.xxsmall}vw`,
                  width: "100%",
                }}
              >
                <GeneralButton
                  label={"Remove puzzle"}
                  handleButtonPress={() => {
                    setIsResponding(true);
                    setIsIssue(true);
                  }}
                ></GeneralButton>
                <GeneralButton
                  label={"No issue"}
                  handleButtonPress={() => {
                    setIsResponding(true);
                  }}
                ></GeneralButton>
              </div>
            </PuzzleInfoLeft>
          )}
          {isResponding && (
            <PuzzleInfoLeft>
              <div>
                <FormField
                  title={"Subject (optional)"}
                  reference={subjectRef}
                  type={"text"}
                  smallLabel={true}
                />
                <FormField
                  title={`Message to ${
                    isIssue ? "puzzle creator" : "ticketer"
                  } (optional)`}
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
                }}
              >
                <GeneralButton
                  label={"Cancel"}
                  handleButtonPress={() => {
                    setIsResponding(false);
                    if (isIssue) setIsIssue(false);
                  }}
                ></GeneralButton>
                <GeneralButton
                  label={"Confirm"}
                  handleButtonPress={() => {
                    resolveFlaggedPuzzleTicket();
                  }}
                ></GeneralButton>
              </div>
            </PuzzleInfoLeft>
          )}
          {puzzleType === "eights_puzzle" && (
            <MiniEightsPuzzle
              puzzle={puzzle.values}
              gridStyleExtra={{
                width: "36vh",
                height: "36vh",
                marginRight: margins.lrg,
              }}
              numberStyleExtra={{
                fontSize: text_styles.resizbale_font.med,
                color: "black",
              }}
            />
          )}
          {puzzleType === "sudoku" && (
            <MiniSudoku
              selectedNumbers={puzzle.values}
              gridSize={3}
              gridStyleExtra={{
                width: "36vh",
                height: "36vh",
                marginRight: margins.lrg,
              }}
              numberStyleExtra={{
                fontSize: text_styles.resizbale_font.small,
                color: "black",
              }}
            />
          )}
          {puzzleType === "hashi" && (
            <MiniHashi
              puzzleHeight={puzzle.values.length}
              puzzleWidth={puzzle.values[0].length}
              puzzle={puzzle.values}
              gridStyleExtra={{
                width: "36vh",
                height: "50vh",
                marginRight: margins.lrg,
              }}
              numberStyleExtra={{ fontSize: text_styles.resizbale_font.small }}
            />
          )}
        </PuzzleInfo>
      </React.Fragment>
    </FlaggedPuzzleBlock>
  );
};

const FlaggedPuzzleBlock = styled.div`
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

const PuzzleInfo = styled.div`
  display: flex;

  justify-content: space-between;
  color: #${colors.creme};
  font-size: ${text_styles.resizbale_font.small};
  width: 100%;
`;

const PuzzleInfoLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  width: 60%;
`;
// align-items: center;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1vh;
  width: 100%;
`;

export default FlaggedPuzzleInfoBlock;
