import { useState, useRef, useEffect } from "react";
import { TouchableOpacity } from "react-native-web";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { modal_content, modal_label } from "../inline-styles/modal";
import CircularProgress from "@mui/material/CircularProgress";
import styled from "styled-components";
import useFocusOnKeyDown from "react-focus-onkeydown";
import CustomSwitch from "../components/CustomSwitch";
import HomeButton from "../components/HomeButton";
import sudoku_rules from "../FixedMessages/sudoku_rules.txt";
import StarRatings from "react-star-ratings";
import NumberPanelComponent from "../sudoku-components/NumberPanelComponent";
import Modal from "react-modal";
import Sudoku from "../sudoku-components/Sudoku";
import DownloadButton from "../components/DownloadButton";
import HomeButtonPlain from "../components/HomeButtonPlain";
import MainPageContainer from "../components/MainPageContainer";
import colors from "../style-utils/colors";
import margins from "../style-utils/margins";
import radiuses from "../style-utils/radiuses";
import borders from "../style-utils/borders";
import { border } from "@mui/system";
import text_styles from "../style-utils/text_styles";
import {
  optionSize,
  switch_container,
  switch_label,
} from "../inline-styles/switch";
import sudoku_image from "../images/sudoku_image.jpg";
import CustomProgress from "../components/CustomProgress";
import GeneralButton from "../components/GeneralButton";
import FlagPuzzleButton from "../components/FlagPuzzleButton";
import Spacer from "../components/Spacer";
import GeneralInputField from "../components/GenearlnputField";
import { useSelector } from "react-redux";
import sudoku_colors from "../style-utils/sudoku_colors";
import RatingsLabel from "../components/RatingsLabel";
import InfoButton from "../components/InfoButton";
import {
  RulesTextConatiner,
  TextConatinerP,
} from "../components/TextContainer";
import { emitMessage } from "../client";
var intViewportHeight = window.innerHeight;
var intViewportWidth = window.innerWidth;
export default function SudokuScreen() {
  const { user } = useSelector((state) => state.login);
  //used to navigate to other screen
  const navigate = useNavigate();
  //used to get puzzle from navigation
  const location = useLocation();

  //Handling set selected number from keyboard event

  //On key down , set selected number or errase number
  function handleKeyDown(event) {
    if (!victoryModalIsOpen) {
      let allowedNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
      let key = event.key;
      if (allowedNumbers.includes(key)) {
        setSelectedNumber(parseInt(key));
      } else if (key == "Backspace") {
        setSelectedNumber(0);
      }
    }
  }
  //Getting puzzle from location state
  const game = useRef(
    // location.state.game.values
    location.state.game.values.map((row, rowIndex) =>
      row.map(
        (cell, cellIndex) => location.state.game.values[cellIndex][rowIndex]
      )
    )
  ).current;
  //Boolean to not push changes to state while checking the move
  const [checking, setChecking] = useState(false);
  //Boolean to not push changes to state while popping from stack
  const [popping, setPopping] = useState(false);
  //Getting solution from location state
  const solution = useRef(
    location.state.game.solution.map((row, rowIndex) =>
      row.map(
        (cell, cellIndex) => location.state.game.solution[cellIndex][rowIndex]
      )
    )
  ).current;
  //History stack of layered state
  const history = useRef([]).current;
  //Getting size of game from location state
  const size = useRef(
    Math.sqrt(location.state.game["solution"].length)
  ).current;
  //Selected cell coordinates
  const [selectedCell, setSelectedCell] = useState(0);
  //Notes mode
  const [pencil, setPencil] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  //Control boolean to check answers according to solution or according just to grid
  const [accordingToSolution, setAccordingToSolution] = useState(false);

  //Layered state:
  //Booleans to either display notes or selected number
  const [displaySelectedNumbers, setDisplaySelectedNumbers] = useState(
    new Array(size * size).fill(0).map(() => new Array(size * size).fill(true))
  );
  //Booleans for which cells are invalid
  const [errorNumbers, setErrorNumbers] = useState(
    new Array(size * size).fill(0).map(() => new Array(size * size).fill(false))
  );
  //Chosen numbers that are not notes
  const [selectedNumbers, setSelectedNumbers] = useState(
    new Array(size * size).fill(0).map(() => new Array(size * size).fill(1))
  );
  //Notes numbers in a cell in a mini-grid
  const [pencilNumbers, setPencilNumbers] = useState(
    new Array(size * size)
      .fill(0)
      .map(() =>
        new Array(size * size)
          .fill(0)
          .map(() => new Array(size).fill(0).map(() => new Array(size).fill(0)))
      )
  );
  //Array that allows to convert a number from 0 - 9 to coordinates
  const numToGrid = useRef(
    new Array(size)
      .fill(0)
      .map((row, rowIndex) =>
        new Array(size).fill(0).map((col, colIndex) => {
          return { x: colIndex, y: rowIndex };
        })
      )
      .reduce((row1, row2) => {
        return row1.concat(row2);
      })
  ).current;

  useEffect(() => {
    //Copy game setting to selected numbers in layered state
    setSelectedNumbers(game.map((x) => x.map((x) => x)));
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (checking) {
      //Check errors in grid when check is requested
      checkErrorsOnField();
      //Update Errors on solution
      if (accordingToSolution) {
        for (let x = 0; x < size * size; x = x + 1) {
          for (let y = 0; y < size * size; y = y + 1) {
            checkErrorAccordingToSolution(x, y);
          }
        }
      }
    }
    setChecking(false);
  }, [checking]);
  useEffect(() => {
    if (isMounted && !popping && !checking) {
      //Push state on changes
      history.push({
        displaySelectedNumbers: JSON.parse(
          JSON.stringify(displaySelectedNumbers)
        ),
        errorNumbers: JSON.parse(JSON.stringify(errorNumbers)),
        selectedNumbers: JSON.parse(JSON.stringify(selectedNumbers)),
        pencilNumbers: JSON.parse(JSON.stringify(pencilNumbers)),
      });
    }
    victoryCheck();
    setPopping(false);
  }, [selectedNumbers, displaySelectedNumbers, errorNumbers, pencilNumbers]);

  //Needed height for grid
  const [neededHeight, setNeededHeight] = useState(0);

  const mainDiv = useRef(null);

  //Setting needed height for grid
  useEffect(() => {
    if (isMounted) {
      setNeededHeight(mainDiv.current.clientHeight);
    }
  }, [isMounted]);

  //Switch active option
  const [activeAccordingToSolutionOption, setActiveAccordingToSolutionOption] =
    useState("Off");
  function handleAccordingToSolutionSwitch(option) {
    //Handling switch
    if (option === "On") {
      setAccordingToSolution(true);
      setActiveAccordingToSolutionOption("On");
      setChecking(true);
    } else {
      setAccordingToSolution(false);
      setActiveAccordingToSolutionOption("Off");
      setChecking(true);
    }
  }
  //Base code for down;pading file itaken from:
  //Molly Alger.2022.How to Create and Export Text Files from a React Frontend. Atomic Object.https://spin.atomicobject.com/2022/03/09/create-export-react-frontend/
  function handleDownloadPuzzle() {
    const myJSON = {
      "puzzle-type": "sudoku",
      values: location.state.game.values,
      solution: location.state.game.solution,
      "creator-id": location.state.game["creator-id"],
      difficulty: location.state.game.difficulty * 10,
    };
    const fileData = JSON.stringify(myJSON);
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "sudoku.json";
    link.href = url;
    link.click();
  }

  //Quit modal controll boolean
  const [quitModalIsOpen, setQuitModalIsOpen] = useState(false);

  //Open quit modal on home button click
  function handleHomeButton() {
    setQuitModalIsOpen(true);
  }
  //Modals refs
  const victoryModalRef = useRef(null);
  const quitModalRef = useRef(null);

  function backState() {
    //Popping layered state from history
    if (history.length > 1) {
      setPopping(true);
      history.pop();
      setDisplaySelectedNumbers(
        JSON.parse(
          JSON.stringify(history[history.length - 1].displaySelectedNumbers)
        )
      );
      setErrorNumbers(
        JSON.parse(JSON.stringify(history[history.length - 1].errorNumbers))
      );
      setSelectedNumbers(
        JSON.parse(JSON.stringify(history[history.length - 1].selectedNumbers))
      );
      setPencilNumbers(
        JSON.parse(JSON.stringify(history[history.length - 1].pencilNumbers))
      );
    }
  }
  //This sets numbers on the grid
  function setSelectedNumber(number) {
    if (selectedCell != 0) {
      //If there is a selected cell
      if (game[selectedCell.x][selectedCell.y] == 0) {
        //If the selected cell is not in setting and can be modifiable
        if (!pencil) {
          if (number != 0) {
            //If number selected is not "erase"
            setDisplaySelectedNumbers((prev) => {
              //Display that cell as a number and not notes grid
              let copy = [...prev];
              copy[selectedCell.x][selectedCell.y] = true;
              return copy;
            });
            setSelectedNumbers((prev) => {
              //Set the number in the cell
              let copy = [...prev];
              copy[selectedCell.x][selectedCell.y] = number;
              return copy;
            });
          }
          if (number == 0) {
            //if want to erase the cell
            setSelectedNumbers((prev) => {
              let copy = [...prev];
              copy[selectedCell.x][selectedCell.y] = 0;
              return copy;
            });
            checkErrorsOnField();
          }

          // if there is a number to put
          if (number != 0) {
            // Update notes on row and column
            for (let i = 0; i < size * size; i = i + 1) {
              if (
                pencilNumbers[selectedCell.x][i][numToGrid[number - 1].x][
                  numToGrid[number - 1].y
                ] == number
              ) {
                setPencilNumbers((prev) => {
                  let copy = [...prev];
                  copy[selectedCell.x][i][numToGrid[number - 1].x][
                    numToGrid[number - 1].y
                  ] = 0;
                  return copy;
                });
              }
              if (
                pencilNumbers[i][selectedCell.y][numToGrid[number - 1].x][
                  numToGrid[number - 1].y
                ] == number
              ) {
                setPencilNumbers((prev) => {
                  let copy = [...prev];
                  copy[i][selectedCell.y][numToGrid[number - 1].x][
                    numToGrid[number - 1].y
                  ] = 0;
                  return copy;
                });
              }
            }

            // Update notes on mini grid
            for (
              let x = Math.floor(selectedCell.x / size) * size;
              x < Math.floor(selectedCell.x / size) * size + size;
              x = x + 1
            ) {
              for (
                let y = Math.floor(selectedCell.y / size) * size;
                y < Math.floor(selectedCell.y / size) * size + size;
                y = y + 1
              ) {
                if (
                  pencilNumbers[x][y][numToGrid[number - 1].x][
                    numToGrid[number - 1].y
                  ] == number
                ) {
                  setPencilNumbers((prev) => {
                    let copy = [...prev];
                    copy[x][y][numToGrid[number - 1].x][
                      numToGrid[number - 1].y
                    ] = 0;
                    return copy;
                  });
                }
              }
            }
            // Checking errors on grid
            let containsInRow = rowContains(
              number,
              selectedCell.x,
              selectedCell.y
            );
            let containsInCol = colContains(
              number,
              selectedCell.x,
              selectedCell.y
            );
            let containsInMiniGrid = miniGridContains(
              number,
              selectedCell.x,
              selectedCell.y
            );
            if (containsInRow || containsInCol || containsInMiniGrid) {
              setErrorNumbers((prev) => {
                let copy = [...prev];
                copy[selectedCell.x][selectedCell.y] = true;
                return copy;
              });
            } else {
              setErrorNumbers((prev) => {
                let copy = [...prev];
                copy[selectedCell.x][selectedCell.y] = false;
                return copy;
              });
            }
            setChecking(true);
          } else {
            //update that this number is not an error becase it is empty
            setErrorNumbers((prev) => {
              let copy = [...prev];
              copy[selectedCell.x][selectedCell.y] = false;
              return copy;
            });
          }
        } else {
          //If it is a note
          setDisplaySelectedNumbers((prev) => {
            //show notes grid
            let copy = [...prev];
            copy[selectedCell.x][selectedCell.y] = false;
            return copy;
          });

          if (
            pencilNumbers[selectedCell.x][selectedCell.y][
              numToGrid[number - 1].x
            ][numToGrid[number - 1].y] == number
          ) {
            //Erase note number if it is same number
            setPencilNumbers((prev) => {
              let copy = [...prev];
              copy[selectedCell.x][selectedCell.y][numToGrid[number - 1].x][
                numToGrid[number - 1].y
              ] = 0;
              return copy;
            });
          } else {
            //Put note number
            setPencilNumbers((prev) => {
              let copy = [...prev];
              copy[selectedCell.x][selectedCell.y][numToGrid[number - 1].x][
                numToGrid[number - 1].y
              ] = number;
              return copy;
            });
          }
        }
      }
    }
    console.log("ujhiuh");
  }
  const [victoryModalIsOpen, setVictoryModalIsOpen] = useState(false);
  //Checking victory
  function victoryCheck() {
    let victory =
      errorNumbers
        .reduce((row1, row2) => {
          return row1.concat(row2);
        })
        .filter((item) => {
          if (item) {
            return item;
          }
        }).length == 0 &&
      selectedNumbers
        .reduce((row1, row2) => {
          return row1.concat(row2);
        })
        .filter((item) => {
          if (item !== 0) {
            return item;
          }
        }).length ===
        size * size * size * size;
    console.log("ljoijojoijio", victory, victoryModalIsOpen);
    if (victory && isMounted) {
      console.log("iojijojoijooijoijoijojojoijojojojoi");
      setVictoryModalIsOpen(true);
      setIsFocusActive(false);
    }
  }
  //Checks if row contains same number
  function rowContains(number, selectedX, selectedY) {
    for (let col = 0; col < size * size; col = col + 1) {
      if (selectedNumbers[col][selectedY] == number && col != selectedX) {
        return true;
      }
    }
    return false;
  }
  //Checks if column contains same number
  function colContains(number, selectedX, selectedY) {
    for (let row = 0; row < size * size; row = row + 1) {
      if (selectedNumbers[selectedX][row] == number && row != selectedY) {
        return true;
      }
    }
    return false;
  }
  //Checks if mini-grid contains same number
  function miniGridContains(number, selectedX, selectedY) {
    for (
      let x = Math.floor(selectedX / size) * size;
      x < Math.floor(selectedX / size) * size + size;
      x = x + 1
    ) {
      for (
        let y = Math.floor(selectedY / size) * size;
        y < Math.floor(selectedY / size) * size + size;
        y = y + 1
      ) {
        if (
          selectedNumbers[x][y] == number &&
          x != selectedX &&
          y != selectedY
        ) {
          return true;
        }
      }
    }
    return false;
  }
  //Checks if row contains same number
  function checkErrorsOnField() {
    for (let x = 0; x < size * size; x = x + 1) {
      for (let y = 0; y < size * size; y = y + 1) {
        if (selectedNumbers[x][y] !== 0) {
          let containsInRow = rowContains(selectedNumbers[x][y], x, y);
          let containsInCol = colContains(selectedNumbers[x][y], x, y);
          let containsInMiniGrid = miniGridContains(
            selectedNumbers[x][y],
            x,
            y
          );
          if (
            (containsInRow || containsInCol || containsInMiniGrid) &&
            game[x][y] == 0
          ) {
            setErrorNumbers((prev) => {
              let copy = [...prev];
              copy[x][y] = true;
              return copy;
            });
          } else {
            setErrorNumbers((prev) => {
              let copy = [...prev];
              copy[x][y] = false;
              return copy;
            });
          }
        }
      }
    }
  }
  //Checks if cell is inccorect according to solution
  function checkErrorAccordingToSolution(selectedX, selectedY) {
    if (
      selectedNumbers[selectedX][selectedY] != solution[selectedX][selectedY]
    ) {
      setErrorNumbers((prev) => {
        let copy = [...prev];
        copy[selectedX][selectedY] = true;
        return copy;
      });
    } else {
      setErrorNumbers((prev) => {
        let copy = [...prev];
        copy[selectedX][selectedY] = false;
        return copy;
      });
    }
  }
  const flagModalRef = useRef(null);
  const [flagModalIsOpen, setFlagModalIsOpen] = useState(false);
  const FlaggInputRef = useRef(null);
  const [isFlagginLoading, setIsFlagginLoading] = useState(false);

  const CommentRef = useRef(null);
  const [newRating, setNewRating] = useState(0);
  function updateRating(log) {
    setNewRating(log);
  }
  function uploadComment() {
    let comment = CommentRef.current.value;
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
    navigate("/");
  }
  //Base code for modal is taken from:
  //diasbruno. 2022. reactjs/react-modal. github. https://github.com/reactjs/react-modal

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
          puzzleID: location.state.game._id,
          puzzleType: "sudoku",
        }),
      }
    );
  }
  const [rules_text, set_rules_text] = useState("");
  const rulesModalRef = useRef(null);
  const [rulesModalIsOpen, setRulesModalIsOpen] = useState(false);
  const RulesContainerRef = useRef(null);
  const [isFocusActive, setIsFocusActive] = useState(true);
  return (
    <MainPageContainer image_back={sudoku_image}>
      <Modal
        ref={rulesModalRef}
        isOpen={rulesModalIsOpen}
        ariaHideApp={false}
        onRequestClose={() => setRulesModalIsOpen(false)}
        style={modal_content}
      >
        <RulesTextConatiner ref={RulesContainerRef}>
          {rules_text.split("\n").map((para) => {
            return (
              <>
                <TextConatinerP>{para}</TextConatinerP>
              </>
            );
          })}
        </RulesTextConatiner>
      </Modal>
      <Modal
        ref={quitModalRef}
        isOpen={quitModalIsOpen}
        ariaHideApp={false}
        onRequestClose={() => setQuitModalIsOpen(false)}
        style={modal_content}
      >
        <span style={modal_label}>Are you sure you want to exit?</span>
        <HomeButtonPlain
          style={{ alignSelf: "center", marginTop: 20 }}
          label={"Yes"}
        />
      </Modal>
      <Modal
        ariaHideApp={false}
        ref={victoryModalRef}
        isOpen={victoryModalIsOpen}
        onRequestClose={() => {}}
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
          <div style={{ marginTop: "10vh" }} />
          <StarRatings
            rating={newRating}
            starEmptyColor={"gray"}
            starRatedColor={sudoku_colors.same_number}
            starHoverColor={sudoku_colors.non_focus_section}
            changeRating={updateRating}
            numberOfStars={5}
            name="rating"
          />
        </div>
        <GeneralInputField inputRef={CommentRef} />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            marginTop: margins.lrg,
          }}
        >
          <GeneralButton
            label={"Home"}
            handleButtonPress={async () => {
              await sendSolvedPuzzleRecord();
              navigate("/");
            }}
          />
          <GeneralButton
            label={"Submit"}
            handleButtonPress={async () => {
              await sendSolvedPuzzleRecord();
              uploadComment();
            }}
          />
        </div>
      </Modal>
      <Modal
        ariaHideApp={false}
        ref={flagModalRef}
        isOpen={flagModalIsOpen}
        onRequestClose={() => {
          setFlagModalIsOpen(false);
          setIsFocusActive(true);
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
              let puzzleType = "sudoku";
              console.log(textSubmitted);
              console.log(puzzleID);
              console.log(userID);
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
      {!isMounted ? (
        <CustomProgress />
      ) : (
        <>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <HomeButton handleHomeButton={handleHomeButton} />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <RatingsLabel rating={location.state.game.average_rating} />
              <CustomSwitch
                style={switch_container}
                optionSize={optionSize}
                labelStyle={switch_label}
                label={"Highlight errors according to solution"}
                options={["On", "Off"]}
                activeOption={activeAccordingToSolutionOption}
                handleSwitch={handleAccordingToSolutionSwitch}
                activeOptionColor={`#${colors.chocolate}`}
                nonActiveOptionColor={`#${colors.modal}`}
                activeOptionTextColor={`#${colors.modal}`}
                nonActiveOptionTextColor={`#${colors.chocolate}`}
              />
              <InfoButton
                handleButtonPress={() => {
                  (async () => {
                    fetch(sudoku_rules)
                      .then((text) => text.text())
                      .then((text) => {
                        set_rules_text(text);
                        setRulesModalIsOpen(true);
                      });
                  })();
                }}
              />
            </div>
          </div>
          <div
            ref={mainDiv}
            style={{
              display: "flex",
              flex: 5,
              justifyContent: "space-evenly",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Sudoku
              isFocusActive={isFocusActive}
              handleKeyDown={handleKeyDown}
              heightRef={neededHeight}
              pencilNumbers={pencilNumbers}
              selectedNumbers={selectedNumbers}
              errorNumbers={errorNumbers}
              displaySelectedNumbers={displaySelectedNumbers}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              gridSize={size}
              pencil={pencil}
            />
            <NumberPanelComponent
              setPencil={setPencil}
              pencil={pencil}
              setSelectedNumber={setSelectedNumber}
              backState={backState}
            />
            <div
              style={{
                height: "inherit",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <DownloadButton handleDownload={handleDownloadPuzzle} />
              <div style={{ height: "3vh" }} />
              <FlagPuzzleButton
                handleFlag={() => {
                  setFlagModalIsOpen(true);
                  setIsFocusActive(false);
                }}
              />
            </div>
          </div>
        </>
      )}
    </MainPageContainer>
  );
}
