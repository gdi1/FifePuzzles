import {
  Link,
  Outlet,
  Route,
  Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import StarRatings from 'react-star-ratings';
import { useState, useEffect, useRef } from "react";
import GeneralButton from "../components/GeneralButton";
import Navigation from "../components/NavigationBar";
import SudokuScreen from "./SudokuScreen";
import CustomProgress from "../components/CustomProgress";
import { useLocation } from "react-router-dom";
import eights_puzzle_rules from '../FixedMessages/eights_puzzle_rules.txt'
import { useFilePicker } from "use-file-picker";
import Modal from "react-modal";
import {
  GeneralModalButtonStyle,
  modal_content,
  modal_label,
} from "../inline-styles/modal";
import MainPageContainer from "../components/MainPageContainer";
import margins from "../style-utils/margins";
import colors from "../style-utils/colors";
import image_8spuzzle from "../images/image_8spuzzle.jpg";
import styled from "styled-components";
import Puzzle8sGrid from "../8s_puzzle_components/Puzzle8sGrid";
import HomeButton from "../components/HomeButton";
import HomeButtonPlain from "../components/HomeButtonPlain";
import PanelComponent from "../8s_puzzle_components/PanelComponent";
import sudoku_colors from "../style-utils/sudoku_colors";
import DownloadButton from "../components/DownloadButton";
import { useSelector } from "react-redux";
import StarRating from "../components/StarRating";
import FlagPuzzleButton from "../components/FlagPuzzleButton";
import { CircularProgress } from "@mui/material";
import GeneralInputField from "../components/GenearlnputField";
import { emitMessage } from "../client";
import RatingsLabel from "../components/RatingsLabel";
import InfoButton from "../components/InfoButton";
import { RulesTextConatiner, TextConatinerP } from "../components/TextContainer";

export default function Puzzle8sScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.login);
  function handleHomeButton() {
    setQuitModalIsOpen(true);
  }
  const [quitModalIsOpen, setQuitModalIsOpen] = useState(false);
  const [victoryModalIsOpen, setVictoryModalIsOpen] = useState(false);

  const [puzzle, setPuzzle] = useState(location.state.game.values);
  const [showParts, setShowParts] = useState(
    location.state.game.values.map((row) =>
      row.map((cell) => (cell == null ? false : true))
    )
  );
  const winningSituation = useRef([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, null],
  ]).current;
  const CellsRefs = useRef([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]).current;
  const NumberRefs = useRef([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]).current;

  function victoryCheck() {
    for (let i = 0; i < 3; i = i + 1) {
      for (let j = 0; j < 3; j = j + 1) {
        if (puzzle[i][j] != winningSituation[i][j]) {
          return false;
        }
      }
    }
    return true;
  }
  function findNULLCell() {
    for (let y = 0; y < 3; y = y + 1) {
      for (let x = 0; x < 3; x = x + 1) {
        if (NumberRefs[y][x] == null) {
          return { x: x, y: y };
        }
      }
    }
  }
  const historyStack = useRef([]).current;
  const [movementInAction, setMovementInAction] = useState(false);
  function handle8sClick(gridRowIndex, gridCellIndex, isPoppingFunc, moveHelp) {
    let nullCoords = findNULLCell();
    let yDiff = Math.abs(gridRowIndex - nullCoords.y);
    let xDiff = Math.abs(gridCellIndex - nullCoords.x);
    if ((yDiff == 0 && xDiff == 1) || (yDiff == 1 && xDiff == 0)) {
      if (!movementInAction) {
        console.log(movementInAction);
        setMovementInAction(true);
        console.log(movementInAction);
        let whatToMove = NumberRefs[gridRowIndex][gridCellIndex];
        let whereToMove = CellsRefs[nullCoords.y][nullCoords.x];
        if (isPoppingFunc || moveHelp) {
          whatToMove.style.backgroundColor = sudoku_colors.focus_cell;
          whereToMove.style.backgroundColor = sudoku_colors.same_number;
        }
        console.log(whereToMove);
        let newLeftPos = whereToMove.offsetLeft;
        let oldLeftPos = whatToMove.offsetLeft;
        let newTopPos = whereToMove.offsetTop;
        let oldTopPos = whatToMove.offsetTop;

        let translateX = newLeftPos - oldLeftPos + whereToMove.clientLeft;
        let translateY = newTopPos - oldTopPos - whereToMove.clientTop;

        let neededWidth = whatToMove.clientWidth - whatToMove.offsetWidth;
        let neededHeight = whatToMove.clientHeight - whatToMove.offsetHeight;

        whatToMove.style.width = `${neededWidth}px`;
        whatToMove.style.height = `${neededHeight}px`;

        let animation = new Animation(
          new KeyframeEffect(
            whatToMove,
            [{ transform: `translate(${translateX}px,${translateY}px)` }],
            {
              duration: 500,
              fill: "forwards",
            }
          )
        );

        animation.onfinish = () => {
          const puzzlePrev = [...puzzle];
          puzzlePrev[nullCoords.y][nullCoords.x] =
            puzzlePrev[gridRowIndex][gridCellIndex];
          puzzlePrev[gridRowIndex][gridCellIndex] = null;
          setPuzzle(puzzlePrev);
          let showPartsPrev = [...showParts];
          showPartsPrev[gridRowIndex][gridCellIndex] = false;
          showPartsPrev[nullCoords.y][nullCoords.x] = true;
          setShowParts(showPartsPrev);

          if (victoryCheck()) {
            setVictoryModalIsOpen(true);
          }

          if (!isPoppingFunc) {
            historyStack.push(nullCoords);
          }
          if (isPoppingFunc || moveHelp) {
            whereToMove.style.backgroundColor = sudoku_colors.non_focus_section;
          }
          setMovementInAction(false);
        };
        animation.play();
      }
    }
  }

  function backState() {
    if (historyStack.length != 0 && !movementInAction) {
      let move = historyStack.pop();
      handle8sClick(move.y, move.x, true, false);
    }
  }

  async function sendSolvedPuzzleRecord() {
    let result = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}solved-puzzles/addPuzzleSolvedRecord/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
        body: JSON.stringify({
          "puzzleID": location.state.game._id,
          puzzleType: "eights_puzzle"
        }),
      }
    )
  }
  const [loadingNextMove, setLoadingNextMove] = useState(false);
  async function handleNextMoveButtonPress() {
    if (!loadingNextMove) {
      setLoadingNextMove(true);
      let result = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}eights_puzzle/get_next_move/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          credentials: "include",
          body: JSON.stringify({ puzzle_state: puzzle }),
        }
      )
        .then((response) => {
          return response.json();
        })
        .catch((err) => console.log(err));
      console.log(result);
      setLoadingNextMove(false);
      handle8sClick(result.y, result.x, false, true);
    }
  }
  const [newRating, setNewRating] = useState(0);
  //upload comments

  function updateRating(log) {
    setNewRating(log);
  }
  function uploadComment() {
    let comment = CommentRef.current.value
    const feedbackToAdd = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "puzzle-id": location.state.game["_id"],
        "user-id": user.userID,
        rating: newRating,
        "comment-body": comment,
      }),
    };
    fetch(
      `${process.env.REACT_APP_BACKEND_URL}feedback/add_feedback`,
      feedbackToAdd
    )
      .then((response) => console.log(response.json))
      //.then((data) => console.log(data))
      .catch((err) => console.log(err));
    navigate('/')
  }
  const flagModalRef = useRef(null);
  const [flagModalIsOpen, setFlagModalIsOpen] = useState(false);
  const FlaggInputRef = useRef(null);
  const [isFlagginLoading, setIsFlagginLoading] = useState(false);
  const CommentRef = useRef(null)

  const [rules_text, set_rules_text] = useState("");
  const rulesModalRef = useRef(null);
  const [rulesModalIsOpen, setRulesModalIsOpen] = useState(false);
  const RulesContainerRef = useRef(null);
  return (
    <>
      <Modal
        ref={rulesModalRef}
        isOpen={rulesModalIsOpen}
        ariaHideApp={false}
        onRequestClose={() => setRulesModalIsOpen(false)}
        style={modal_content}
      >
        <RulesTextConatiner ref={RulesContainerRef}>
          {rules_text.split('\n').map(para => {
            return (
              <>
                <TextConatinerP>
                  {para}
                </TextConatinerP>
              </>
            )
          })}
        </RulesTextConatiner>
      </Modal>
      <Modal
        isOpen={quitModalIsOpen}
        ariaHideApp={false}
        onRequestClose={() => setQuitModalIsOpen(false)}
        style={modal_content}
      >
        {" "}
        {/*Modal for exiting screen */}
        <span style={modal_label}>Are you sure you want to exit?</span>
        <HomeButtonPlain
          style={{ alignSelf: "center", marginTop: 20 }}
          label={"Yes"}
        />
      </Modal>
      <Modal
        isOpen={victoryModalIsOpen}

        ariaHideApp={false}
        onRequestClose={() => { }}
        style={modal_content}
      >
        {/*Modal for exiting screen */}
        <span style={modal_label}>Congratulations you won!</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ marginTop: '10vh' }} />
          <StarRatings
            rating={newRating}
            starEmptyColor={'gray'}
            starRatedColor={sudoku_colors.same_number}
            starHoverColor={sudoku_colors.non_focus_section}
            changeRating={updateRating}
            numberOfStars={5}
            name='rating'
          />
        </div>
        <GeneralInputField inputRef={CommentRef} />
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', marginTop: margins.lrg }}>
          <GeneralButton label={"Home"} handleButtonPress={async () => {
            await sendSolvedPuzzleRecord();
            navigate('/')
          }} />
          <GeneralButton label={"Submit"} handleButtonPress={async () => {
            await sendSolvedPuzzleRecord();
            uploadComment()
          }} />
        </div>
      </Modal>
      <Modal
        ariaHideApp={false}
        ref={flagModalRef}
        isOpen={flagModalIsOpen}
        onRequestClose={() => {
          setFlagModalIsOpen(false);
        }}
        style={modal_content}
      >
        <span style={modal_label}>Is there a problem with a puzzle?</span>
        <span style={Object.assign({ marginBottom: margins.lrg }, modal_label)}>
          Please leave a message.
        </span>
        <GeneralInputField inputRef={FlaggInputRef} />

        {isFlagginLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              marginTop: margins.lrg,
            }}
          >
            <CircularProgress
              style={{ width: 50, height: 50, color: `#${colors.creme}` }}
              color={"inherit"}
            />
          </div>
        ) : (
          <GeneralButton
            style={{ alignSelf: "center", marginTop: 20 }}
            label={"Submit"}
            handleButtonPress={async () => {
              setIsFlagginLoading(true);
              let textSubmitted = FlaggInputRef.current.value;
              let puzzleID = location.state.game._id;
              let userID = user._id;
              let puzzleType = "eights_puzzle";
              let upload_result = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}flagged-puzzles/send-ticket/`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  withCredentials: true,
                  credentials: "include",
                  body: JSON.stringify({
                    info: {
                      textSubmitted: textSubmitted,
                      puzzleID: puzzleID,
                      userID: userID,
                      puzzleType: puzzleType,
                    },
                  }),
                }
              )
                .then((response) => {
                  return response.json();
                })
                .catch((err) => console.log(err));
              console.log(upload_result);
              if (upload_result.added)
                emitMessage("new-flagged-puzzle", {
                  ticketID: upload_result.ticketID,
                });
              setTimeout(() => {
                setIsFlagginLoading(false);
                setTimeout(() => {
                  navigate("/");
                }, 1000);
              }, 2000);
            }}
          />
        )}
      </Modal>
      <MainPageContainer image_back={image_8spuzzle}>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <HomeButton handleHomeButton={handleHomeButton} />
          <div style={{ display: 'flex', flexDirection: "row", alignItems: 'center' }}>
            <RatingsLabel rating={location.state.game.average_rating} />
            <InfoButton handleButtonPress={() => {
              (async () => {
                fetch(eights_puzzle_rules).then(text => text.text()).then(text => {
                  set_rules_text(text);
                  setRulesModalIsOpen(true);
                })
              })();
            }} />
          </div>
        </div>
        <div
          style={{
            flex: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <Puzzle8sGrid
            puzzle={puzzle}
            handle8sClick={handle8sClick}
            NumberRefs={NumberRefs}
            CellsRefs={CellsRefs}
            showParts={showParts}
          />
          <PanelComponent
            loadingNextMove={loadingNextMove}
            backState={backState}
            handleNextMoveButtonPress={handleNextMoveButtonPress}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <DownloadButton
              handleDownload={() => {
                console.log(location.state.game);
                const myJSON = {
                  "puzzle-type": location.state.game["puzzle-type"],
                  values: location.state.game.values,
                  "creator-id": location.state.game["creator-id"],
                  difficulty: location.state.game.difficulty * 10,
                };
                const fileData = JSON.stringify(myJSON);
                const blob = new Blob([fileData], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.download = "8s_puzzle.json";
                link.href = url;
                link.click();
              }}
            />
            <div style={{ height: "3vh" }} />
            <FlagPuzzleButton
              handleFlag={() => {
                setFlagModalIsOpen(true);
              }}
            />
          </div>
        </div>
      </MainPageContainer>
    </>
  );
}
