import { ScrollView } from "react-native-web";
import { useDispatch, useSelector } from "react-redux";
import GeneralButton from "../components/GeneralButton";
import radiuses from "../style-utils/radiuses";
import colors from "../style-utils/colors";
import styled from "styled-components";
import paddings from "../style-utils/paddings";
import borders from "../style-utils/borders";
import { loginActions } from "../store/login-slice";
import { ptdActions } from "../store/puzzle-to-display-slice";
import MiniEightsPuzzle from "./MiniEightsPuzzle";
import MiniSudoku from "./MiniSudoku";
import MiniHashi from "./MiniHashi";
import margins from "../style-utils/margins";
import text_styles from "../style-utils/text_styles";
import CircularProgress from "@mui/material/CircularProgress";
import React from "react";
import { useState, useRef } from "react";
import FormField from "../registration-components/FormField";
import { emitMessage } from "../client";

const DisplaySearchedPuzzle = (props) => {
  const messageRef = useRef();
  const subjectRef = useRef();
  const dispatch = useDispatch();

  const {
    puzzle,
    showPuzzle,
    isFetchingRecentPuzzle,
    numberOfUsersThatSolvedIt,
  } = useSelector((state) => state.puzzleToDisplay);
  const { puzzleType } = useSelector((state) => state.puzzleToDisplay.search);
  const [takeAction, setTakeAction] = useState(false);

  const performAction = async () => {
    const message = messageRef.current.value.trim();
    const subject = subjectRef.current.value.trim();

    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}users/toggle-puzzle-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          puzzleID: puzzle._id,
          puzzleType: puzzleType,
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
      setTakeAction(false);
      dispatch(ptdActions.setPuzzleActive(data.puzzle.active));
      if (message !== "" || subject !== "") {
        emitMessage("send-message", {
          userID: data.puzzleCreator._id,
        });
      }
    } else {
      console.log("Smth went worng");
    }
  };
  return (
    <ScrollView
      style={{
        display: "flex",
        flexDirection: "column",
        height: 100,
      }}
    >
      {puzzle && showPuzzle && !isFetchingRecentPuzzle && (
        <PuzzleInfo>
          {!takeAction && (
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                width: "100%",
                padding: "1vh 2vh 2vh 2vh",
                borderBottom: `${borders.med}px solid #bca38f`,
                boxSizing: "border-box",
              }}
            >
              <PuzzleDetails>
                <div>
                  <b>User ID</b>: {puzzle._id}
                </div>
                <div>
                  <b>Creator ID</b>: {puzzle["creator-id"]}
                </div>
                <div>
                  <b>Difficulty</b>: {puzzle.difficulty}{" "}
                  {puzzle.difficulty < 4
                    ? "(Easy)"
                    : puzzle.difficulty < 8
                    ? "(Medium)"
                    : "(Hard)"}
                </div>
                <div>
                  <b>Status</b>: {puzzle.active ? "Active" : "Not Active"}
                </div>
              </PuzzleDetails>
              <div style={{ fontSize: "2vh" }}>
                <b>No. of users that solved it</b>: {numberOfUsersThatSolvedIt}
              </div>
              <GeneralButton
                label={`${puzzle.active ? "Deactivate" : "Activate"}`}
                handleButtonPress={async () => {
                  setTakeAction(true);
                }}
              />
            </div>
          )}
          {takeAction && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: `${borders.med}px solid #bca38f`,
                boxSizing: "border-box",
              }}
            >
              <MessageSection>
                <div>
                  <FormField
                    title={`Subject (optional)`}
                    type={"text"}
                    smallLabel={true}
                    style={{ width: "40vw" }}
                    reference={subjectRef}
                  />
                  <FormField
                    title={`Message (optional)`}
                    type={"text"}
                    extendedMessage={true}
                    smallLabel={true}
                    reference={messageRef}
                  />
                </div>
              </MessageSection>
              <ButtonGroup>
                <GeneralButton
                  label={"Cancel"}
                  handleButtonPress={() => {
                    setTakeAction(false);
                  }}
                />
                <GeneralButton
                  label={"Confirm"}
                  handleButtonPress={async () => {
                    await performAction();
                  }}
                />
              </ButtonGroup>
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-evenly",
              width: "100%",
              height: "100%",
            }}
          >
            {puzzleType === "eights_puzzle" && (
              <React.Fragment>
                <Puzzle>
                  <PuzzleTitle>Eights Puzzle</PuzzleTitle>
                  <MiniEightsPuzzle
                    puzzle={puzzle.values}
                    gridStyleExtra={{
                      width: "40vh",
                      height: "40vh",
                      marginRight: margins.lrg,
                    }}
                    numberStyleExtra={{
                      fontSize: text_styles.resizbale_font.med,
                      color: "black",
                    }}
                  />
                </Puzzle>
                <Puzzle>
                  <PuzzleTitle>Solution</PuzzleTitle>
                  <MiniEightsPuzzle
                    puzzle={[
                      [1, 2, 3],
                      [4, 5, 6],
                      [7, 8, null],
                    ]}
                    gridStyleExtra={{
                      width: "40vh",
                      height: "40vh",
                      marginRight: margins.lrg,
                    }}
                    numberStyleExtra={{
                      fontSize: text_styles.resizbale_font.med,
                      color: "black",
                    }}
                  />
                </Puzzle>
              </React.Fragment>
            )}
            {puzzleType === "sudoku" && (
              <React.Fragment>
                <Puzzle>
                  <PuzzleTitle>Sudoku Puzzle</PuzzleTitle>
                  <MiniSudoku
                    selectedNumbers={puzzle.values}
                    gridSize={3}
                    gridStyleExtra={{
                      width: "40vh",
                      height: "40vh",
                      marginRight: margins.lrg,
                    }}
                    numberStyleExtra={{
                      fontSize: text_styles.resizbale_font.small,
                      color: "black",
                    }}
                  />
                </Puzzle>
                <Puzzle>
                  <PuzzleTitle>Solution</PuzzleTitle>
                  <MiniSudoku
                    selectedNumbers={puzzle.solution}
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
                </Puzzle>
              </React.Fragment>
            )}
            {puzzleType === "hashi" && (
              <React.Fragment>
                <Puzzle>
                  <PuzzleTitle>Hashi Puzzle</PuzzleTitle>
                  <MiniHashi
                    puzzleHeight={puzzle.values.length}
                    puzzleWidth={puzzle.values[0].length}
                    puzzle={puzzle.values}
                    gridStyleExtra={{
                      width: "36vh",
                      height: "50vh",
                      marginRight: margins.lrg,
                    }}
                    numberStyleExtra={{
                      fontSize: text_styles.resizbale_font.small,
                    }}
                  />
                </Puzzle>
              </React.Fragment>
            )}
          </div>
        </PuzzleInfo>
      )}
      {isFetchingRecentPuzzle && (
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

const PuzzleTitle = styled.div`
  font-weight: bold;
  font-size: 2vh;
`;

const Puzzle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
`;

const PuzzleDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: baseline;
  justify-content: space-evenly;
  width: 40%;
  height: 100%;
  gap: 2vh;
  font-size: 2vh;
`;

const PuzzleInfo = styled.div`
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

export default DisplaySearchedPuzzle;
