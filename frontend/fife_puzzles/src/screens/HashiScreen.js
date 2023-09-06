import {
  Link,
  Outlet,
  Route,
  Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useState, useCallback, useEffect, useRef } from "react";
import GeneralButton from "../components/GeneralButton";
import Navigation from "../components/NavigationBar";
import SudokuScreen from "./SudokuScreen";
import hahsi_image from "../images/hashi_image.jpg";
import CustomProgress from "../components/CustomProgress";
import StarRatings from "react-star-ratings";
import { useLocation } from "react-router-dom";
import { useFilePicker } from "use-file-picker";
import Modal from "react-modal";
import hashi_rules from "../FixedMessages/hashi_rules.txt";
import PanelComponent from "../hashi-components/PanelComponent";
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
import sudoku_colors from "../style-utils/sudoku_colors";
import borders from "../style-utils/borders";
import text_styles from "../style-utils/text_styles";
import DrawPath from "../hashi-components/DrawPath";
import HashiGrid from "../hashi-components/HashiGrid";
import HashiConnectionChecker from "../hashi-components/HashiConnectionChecker";
import CustomSwitch from "../components/CustomSwitch";
import {
  optionSize,
  switch_container,
  switch_label,
} from "../inline-styles/switch";
import DownloadButton from "../components/DownloadButton";
import FlagPuzzleButton from "../components/FlagPuzzleButton";
import { CircularProgress } from "@mui/material";
import GeneralInputField from "../components/GenearlnputField";
import { useSelector } from "react-redux";
import RatingsLabel from "../components/RatingsLabel";
import InfoButton from "../components/InfoButton";
import {
  RulesTextConatiner,
  TextConatinerP,
} from "../components/TextContainer";
import { emitMessage } from "../client";

export default function HashiScreen() {
  const [nodesForCheck, setNodesForCheck] = useState();
  function handleHomeButton() {
    setQuitModalIsOpen(true);
  }
  const [quitModalIsOpen, setQuitModalIsOpen] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const location = useLocation();
  const game = useRef(location.state.game).current;

  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [startNodeSelected, setStartNodeSelected] = useState(false);
  const [endNodeSelected, setEndNodeSelected] = useState(false);
  const size = useRef({
    width: game.values[0].length,
    height: game.values.length,
  }).current;
  const puzzle = useRef(game.values.map((row) => row.map((x) => x))).current;
  const solution = useRef(
    game.solution.map((row) => row.map((x) => x))
  ).current;
  const [puzzleWithDirections, setPuzzleWithDirections] = useState(
    game.values.map((row) => row.map((x) => x))
  );
  const CirclesRefs = useRef(
    game.values.map((row) => row.map((x) => null))
  ).current;
  const [CompletedCricles, setCompletedCricles] = useState(
    game.values.map((row) => row.map((x) => false))
  );
  useEffect(() => {
    if (isMounted) {
      checkErrors(nodesForCheck.startNode, nodesForCheck.endNode);
      checkVictory();
    }
  }, [nodesForCheck]);
  const [loadedGame, setLoadedGame] = useState(false);
  const [bridges, setBridges] = useState([]);
  useEffect(() => {
    if (isMounted) {
      drawBridges();
      setLoadedGame(true);
    }
  }, [isMounted]);

  function findDoneRelationShips(y, x) {
    let foundDoneRelationships = bridges.filter((elem, index) => {
      if (
        (elem.relationship.x1 == x && elem.relationship.y1 == y) ||
        (elem.relationship.x2 == x && elem.relationship.y2 == y)
      ) {
        if (elem.showBridges != 0) {
          return elem;
        }
      }
    });
    return foundDoneRelationships;
  }
  function drawBridges() {
    let drawnBridges = [];
    for (let y = 0; y < size.height; y = y + 1) {
      for (let x = 0; x < size.width; x = x + 1) {
        //vertical
        if (CirclesRefs[y][x] != null && y != 0) {
          let topConnectCircle = null;
          for (let y2 = y - 1; y2 >= 0; y2 = y2 - 1) {
            if (CirclesRefs[y2][x] != null) {
              topConnectCircle = CirclesRefs[y2][x];
              let width = topConnectCircle.offsetWidth * 0.05;
              let startX =
                topConnectCircle.offsetLeft +
                topConnectCircle.offsetWidth / 2 -
                width / 2;
              let startY =
                topConnectCircle.offsetTop + topConnectCircle.offsetHeight;
              let endY = CirclesRefs[y][x].offsetTop;
              let height = endY - startY;
              drawnBridges.push({
                relationship: { x1: x, y1: y, x2: x, y2: y2 },
                none: <></>,
                oneBridge: (
                  <div
                    style={{
                      position: "absolute",
                      width: width,
                      height: height,
                      backgroundColor: "black",
                      left: startX,
                      top: startY,
                      zIndex: 2,
                    }}
                  />
                ),
                twoBridges: (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        width: width,
                        height: height,
                        backgroundColor: "black",
                        left: startX + width * 2,
                        top: startY,
                        zIndex: 2,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        width: width,
                        height: height,
                        backgroundColor: "black",
                        left: startX - width * 2,
                        top: startY,
                        zIndex: 2,
                      }}
                    />
                  </>
                ),
                oneBridgeError: (
                  <div
                    style={{
                      position: "absolute",
                      width: width,
                      height: height,
                      backgroundColor: sudoku_colors.error_number,
                      left: startX,
                      top: startY,
                      zIndex: 2,
                    }}
                  />
                ),
                twoBridgesError: (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        width: width,
                        height: height,
                        backgroundColor: sudoku_colors.error_number,
                        left: startX + width * 2,
                        top: startY,
                        zIndex: 2,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        width: width,
                        height: height,
                        backgroundColor: sudoku_colors.error_number,
                        left: startX - width * 2,
                        top: startY,
                        zIndex: 2,
                      }}
                    />
                  </>
                ),
                drawPathProps: {
                  width: width * 2 + width * 4,
                  height: height,
                  startX: startX - width * 2 - width / 2,
                  startY: startY,
                },
                showBridges: 0,
                showDrawPath: false,
                isVertical: true,
                error: false,
              });
              break;
            }
          }
        }
        //horizontal
        if (CirclesRefs[y][x] != null && x != 0) {
          let leftConnectCircle = null;
          for (let x2 = x - 1; x2 >= 0; x2 = x2 - 1) {
            if (CirclesRefs[y][x2] != null) {
              leftConnectCircle = CirclesRefs[y][x2];
              let height = leftConnectCircle.offsetHeight * 0.05;
              let startY =
                leftConnectCircle.offsetTop +
                leftConnectCircle.offsetHeight / 2 -
                height / 2;
              let startX =
                leftConnectCircle.offsetLeft + leftConnectCircle.offsetWidth;
              let endX = CirclesRefs[y][x].offsetLeft;
              let width = endX - startX;
              drawnBridges.push({
                relationship: { x1: x, y1: y, x2: x2, y2: y },
                none: <></>,
                oneBridge: (
                  <div
                    style={{
                      position: "absolute",
                      width: width,
                      height: height,
                      backgroundColor: "black",
                      left: startX,
                      top: startY,
                      zIndex: 1,
                    }}
                  />
                ),
                twoBridges: (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        width: width,
                        height: height,
                        backgroundColor: "black",
                        left: startX,
                        top: startY + height * 2,
                        zIndex: 2,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        width: width,
                        height: height,
                        backgroundColor: "black",
                        left: startX,
                        top: startY - height * 2,
                        zIndex: 2,
                      }}
                    />
                  </>
                ),
                oneBridgeError: (
                  <div
                    style={{
                      position: "absolute",
                      width: width,
                      height: height,
                      backgroundColor: sudoku_colors.error_number,
                      left: startX,
                      top: startY,
                      zIndex: 1,
                    }}
                  />
                ),
                twoBridgesError: (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        width: width,
                        height: height,
                        backgroundColor: sudoku_colors.error_number,
                        left: startX,
                        top: startY + height * 2,
                        zIndex: 2,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        width: width,
                        height: height,
                        backgroundColor: sudoku_colors.error_number,
                        left: startX,
                        top: startY - height * 2,
                        zIndex: 2,
                      }}
                    />
                  </>
                ),
                drawPathProps: {
                  width: width,
                  height: height * 2 + height * 4,
                  startX: startX,
                  startY: startY - height * 2 - height / 2,
                },
                showBridges: 0,
                showDrawPath: false,
                isVertical: false,
                error: false,
              });
              break;
            }
          }
        }
      }
    }
    setBridges(drawnBridges);
    return drawnBridges;
  }

  function draw(
    canvasCtx,
    x,
    y,
    width,
    height,
    startNode,
    relationship,
    isVertical
  ) {
    if (isVertical) {
      let top = startNode.y - relationship.y1 == 0;
      if (top) {
        canvasCtx.clearRect(0, 0, width, height);
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, height);
        canvasCtx.lineTo(0, y);
        canvasCtx.stroke();
      } else {
        canvasCtx.clearRect(0, 0, width, height);
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, 0);
        canvasCtx.lineTo(0, y);
        canvasCtx.stroke();
      }
    } else {
      let left = startNode.x - relationship.x1 == 0;
      if (left) {
        canvasCtx.clearRect(0, 0, width, height);
        canvasCtx.beginPath();
        canvasCtx.moveTo(width, 0);
        canvasCtx.lineTo(x, 0);
        canvasCtx.stroke();
      } else {
        canvasCtx.clearRect(0, 0, width, height);
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, 0);
        canvasCtx.lineTo(x, 0);
        canvasCtx.stroke();
      }
    }
  }
  function getNumberOfBuildPaths(bridges, x1, y1) {
    let relationshipsFound = bridges.filter((elem, index) => {
      if (
        (elem.relationship.x1 == x1 && elem.relationship.y1 == y1) ||
        (elem.relationship.x2 == x1 && elem.relationship.y2 == y1)
      ) {
        return elem;
      }
    });
    let bridgesBuilt = relationshipsFound.reduce(
      (acc, elem1) => acc + elem1.showBridges,
      0
    );
    return bridgesBuilt;
  }
  function findRelationship(bridges, x1, y1, x2, y2) {
    let blockedPaths = getBlockedPaths(bridges, x1, y1);
    let foundRelationship = bridges.filter((elem, index) => {
      if (
        (elem.relationship.x1 == x1 &&
          elem.relationship.y1 == y1 &&
          elem.relationship.x2 == x2 &&
          elem.relationship.y2 == y2) ||
        (elem.relationship.x1 == x2 &&
          elem.relationship.y1 == y2 &&
          elem.relationship.x2 == x1 &&
          elem.relationship.y2 == y1)
      ) {
        let isBlocked =
          blockedPaths.filter((blockedElem) => {
            if (
              (blockedElem.x == elem.relationship.x1 &&
                blockedElem.y == elem.relationship.y1) ||
              (blockedElem.x == elem.relationship.x2 &&
                blockedElem.y == elem.relationship.y2)
            ) {
              return elem;
            }
          }).length != 0;
        if (!isBlocked) {
          return elem;
        }
      }
    });
    return foundRelationship;
  }
  function findRelationship2(bridges, x1, y1, x2, y2) {
    let blockedPaths = getBlockedPaths2(bridges, x1, y1);
    let foundRelationship = bridges.filter((elem, index) => {
      if (
        (elem.relationship.x1 == x1 &&
          elem.relationship.y1 == y1 &&
          elem.relationship.x2 == x2 &&
          elem.relationship.y2 == y2) ||
        (elem.relationship.x1 == x2 &&
          elem.relationship.y1 == y2 &&
          elem.relationship.x2 == x1 &&
          elem.relationship.y2 == y1)
      ) {
        let isBlocked =
          blockedPaths.filter((blockedElem) => {
            if (
              (blockedElem.x == elem.relationship.x1 &&
                blockedElem.y == elem.relationship.y1) ||
              (blockedElem.x == elem.relationship.x2 &&
                blockedElem.y == elem.relationship.y2)
            ) {
              return elem;
            }
          }).length != 0;
        if (!isBlocked) {
          return elem;
        }
      }
    });
    return foundRelationship;
  }
  function getBlockedPaths2(bridges, x1, y1) {
    let right = null;
    for (let x = x1; x < size.width; x = x + 1) {
      if (CirclesRefs[y1][x] != null && x != x1) {
        right = { y: y1, x: x };
        break;
      }
    }
    let left = null;
    for (let x = x1; x >= 0; x = x - 1) {
      if (CirclesRefs[y1][x] != null && x != x1) {
        left = { y: y1, x: x };
        break;
      }
    }
    let bottom = null;
    for (let y = y1; y < size.height; y = y + 1) {
      if (CirclesRefs[y][x1] != null && y != y1) {
        bottom = { y: y, x: x1 };
        break;
      }
    }
    let top = null;
    for (let y = y1; y >= 0; y = y - 1) {
      if (CirclesRefs[y][x1] != null && y != y1) {
        top = { y: y, x: x1 };
        break;
      }
    }
    let rightHasBlocks = false;
    let leftHasBlocks = false;
    let topHasBlocks = false;
    let bottomHasBlocks = false;
    if (right != null) {
      let verticalBlocks = bridges.filter((elem, index) => {
        if (
          (elem.relationship.y1 < y1 && y1 < elem.relationship.y2) ||
          (elem.relationship.y1 > y1 && y1 > elem.relationship.y2)
        ) {
          if (elem.relationship.x1 < right.x && elem.relationship.x1 > x1) {
            if (elem.showBridges != 0) {
              return elem;
            }
          }
        }
      });
      rightHasBlocks = verticalBlocks.length != 0;
    }
    if (left != null) {
      let verticalBlocks = bridges.filter((elem, index) => {
        if (
          (elem.relationship.y1 < y1 && y1 < elem.relationship.y2) ||
          (elem.relationship.y1 > y1 && y1 > elem.relationship.y2)
        ) {
          if (elem.relationship.x1 > left.x && elem.relationship.x1 < x1) {
            if (elem.showBridges != 0) {
              return elem;
            }
          }
        }
      });
      leftHasBlocks = verticalBlocks.length != 0;
    }
    if (top != null) {
      let horizontalBlocks = bridges.filter((elem, index) => {
        if (
          (elem.relationship.x1 < x1 && x1 < elem.relationship.x2) ||
          (elem.relationship.x1 > x1 && x1 > elem.relationship.x2)
        ) {
          if (elem.relationship.y1 > top.y && elem.relationship.y1 < y1) {
            if (elem.showBridges != 0) {
              return elem;
            }
          }
        }
      });
      topHasBlocks = horizontalBlocks.length != 0;
    }
    if (bottom != null) {
      let horizontalBlocks = bridges.filter((elem, index) => {
        if (
          (elem.relationship.x1 < x1 && x1 < elem.relationship.x2) ||
          (elem.relationship.x1 > x1 && x1 > elem.relationship.x2)
        ) {
          if (elem.relationship.y1 < bottom.y && elem.relationship.y1 > y1) {
            if (elem.showBridges != 0) {
              return elem;
            }
          }
        }
      });
      bottomHasBlocks = horizontalBlocks.length != 0;
    }
    let blockedPaths = [];
    if (topHasBlocks) {
      blockedPaths.push(top);
    }
    if (bottomHasBlocks) {
      blockedPaths.push(bottom);
    }
    if (leftHasBlocks) {
      blockedPaths.push(left);
    }
    if (rightHasBlocks) {
      blockedPaths.push(right);
    }
    return blockedPaths;
  }
  function getBlockedPaths(bridges, x1, y1) {
    let right = null;
    for (let x = x1; x < size.width; x = x + 1) {
      if (CirclesRefs[y1][x] != null && x != x1) {
        right = { y: y1, x: x };
        break;
      }
    }
    let left = null;
    for (let x = x1; x >= 0; x = x - 1) {
      if (CirclesRefs[y1][x] != null && x != x1) {
        left = { y: y1, x: x };
        break;
      }
    }
    let bottom = null;
    for (let y = y1; y < size.height; y = y + 1) {
      if (CirclesRefs[y][x1] != null && y != y1) {
        bottom = { y: y, x: x1 };
        break;
      }
    }
    let top = null;
    for (let y = y1; y >= 0; y = y - 1) {
      if (CirclesRefs[y][x1] != null && y != y1) {
        top = { y: y, x: x1 };
        break;
      }
    }
    let rightHasBlocks = false;
    let leftHasBlocks = false;
    let topHasBlocks = false;
    let bottomHasBlocks = false;
    if (right != null) {
      let verticalBlocks = bridges.filter((elem, index) => {
        if (
          (elem.relationship.y1 < y1 && y1 < elem.relationship.y2) ||
          (elem.relationship.y1 > y1 && y1 > elem.relationship.y2)
        ) {
          if (elem.relationship.x1 < right.x && elem.relationship.x1 > x1) {
            if (elem.showBridges != 0) {
              return elem;
            }
          }
        }
      });
      rightHasBlocks =
        verticalBlocks.length != 0 || CompletedCricles[right.y][right.x];
    }
    if (left != null) {
      let verticalBlocks = bridges.filter((elem, index) => {
        if (
          (elem.relationship.y1 < y1 && y1 < elem.relationship.y2) ||
          (elem.relationship.y1 > y1 && y1 > elem.relationship.y2)
        ) {
          if (elem.relationship.x1 > left.x && elem.relationship.x1 < x1) {
            if (elem.showBridges != 0) {
              return elem;
            }
          }
        }
      });
      leftHasBlocks =
        verticalBlocks.length != 0 || CompletedCricles[left.y][left.x];
    }
    if (top != null) {
      let horizontalBlocks = bridges.filter((elem, index) => {
        if (
          (elem.relationship.x1 < x1 && x1 < elem.relationship.x2) ||
          (elem.relationship.x1 > x1 && x1 > elem.relationship.x2)
        ) {
          if (elem.relationship.y1 > top.y && elem.relationship.y1 < y1) {
            if (elem.showBridges != 0) {
              return elem;
            }
          }
        }
      });
      topHasBlocks =
        horizontalBlocks.length != 0 || CompletedCricles[top.y][top.x];
    }
    if (bottom != null) {
      let horizontalBlocks = bridges.filter((elem, index) => {
        if (
          (elem.relationship.x1 < x1 && x1 < elem.relationship.x2) ||
          (elem.relationship.x1 > x1 && x1 > elem.relationship.x2)
        ) {
          if (elem.relationship.y1 < bottom.y && elem.relationship.y1 > y1) {
            if (elem.showBridges != 0) {
              return elem;
            }
          }
        }
      });
      bottomHasBlocks =
        horizontalBlocks.length != 0 || CompletedCricles[bottom.y][bottom.x];
    }
    let blockedPaths = [];
    if (topHasBlocks) {
      blockedPaths.push(top);
    }
    if (bottomHasBlocks) {
      blockedPaths.push(bottom);
    }
    if (leftHasBlocks) {
      blockedPaths.push(left);
    }
    if (rightHasBlocks) {
      blockedPaths.push(right);
    }
    return blockedPaths;
  }
  function findDrawPaths(bridges, x1, y1) {
    let blockedPaths = getBlockedPaths(bridges, x1, y1);
    let foundRelationships = bridges.filter((elem, index) => {
      if (
        (elem.relationship.x1 == x1 && elem.relationship.y1 == y1) ||
        (elem.relationship.x2 == x1 && elem.relationship.y2 == y1)
      ) {
        let isBlocked =
          blockedPaths.filter((blockedElem) => {
            if (
              (blockedElem.x == elem.relationship.x1 &&
                blockedElem.y == elem.relationship.y1) ||
              (blockedElem.x == elem.relationship.x2 &&
                blockedElem.y == elem.relationship.y2)
            ) {
              return elem;
            }
          }).length != 0;
        if (!isBlocked) {
          return elem;
        }
      }
    });

    return foundRelationships;
  }
  function findDrawPaths2(bridges, x1, y1) {
    let blockedPaths = getBlockedPaths2(bridges, x1, y1);
    let foundRelationships = bridges.filter((elem, index) => {
      if (
        (elem.relationship.x1 == x1 && elem.relationship.y1 == y1) ||
        (elem.relationship.x2 == x1 && elem.relationship.y2 == y1)
      ) {
        let isBlocked =
          blockedPaths.filter((blockedElem) => {
            if (
              (blockedElem.x == elem.relationship.x1 &&
                blockedElem.y == elem.relationship.y1) ||
              (blockedElem.x == elem.relationship.x2 &&
                blockedElem.y == elem.relationship.y2)
            ) {
              return elem;
            }
          }).length != 0;
        if (!isBlocked) {
          return elem;
        }
      }
    });

    return foundRelationships;
  }
  const [victoryModalIsOpen, setVictoryModalIsOpen] = useState(false);
  function checkVictory() {
    if (isMounted) {
      let allUsedInFull = true;
      for (let y = 0; y < size.height; y = y + 1) {
        for (let x = 0; x < size.width; x = x + 1) {
          if (puzzle[y][x] != null) {
            if (!CompletedCricles[y][x]) {
              allUsedInFull = false;
              break;
            }
          }
        }
      }
      let allConnected = HashiConnectionChecker(puzzleWithDirections);
      if (allUsedInFull && !allConnected) {
        console.log("uihiuhiuihu");
        setNotAllConnectedModal(true);
      }

      if (allUsedInFull && allConnected) {
        setVictoryModalIsOpen(true);
      }
    }
  }

  const [notAllConnectedModal, setNotAllConnectedModal] = useState(false);
  useEffect(() => {
    if (endNodeSelected) {
      if (startNode.x == endNode.x && endNode.y == startNode.y) {
        if (
          CompletedCricles[startNode.y][startNode.x] ||
          CompletedCricles[endNode.y][endNode.x]
        ) {
          let drawPaths = findDrawPaths2(bridges, startNode.x, startNode.y);
          drawPaths.forEach((elem) => {
            let index = bridges.indexOf(elem);
            let prev = [...bridges];
            prev[index].showDrawPath = false;
            setBridges(prev);
          });
          let startNodeDone =
            getNumberOfBuildPaths(bridges, startNode.x, startNode.y) >=
            puzzle[startNode.y][startNode.x];
          let endNodeDone =
            getNumberOfBuildPaths(bridges, endNode.x, endNode.y) >=
            puzzle[endNode.y][endNode.x];
          if (errorCicrles[startNode.y][startNode.x] && accordingToSolution) {
            CirclesRefs[startNode.y][startNode.x].style.backgroundColor =
              sudoku_colors.error_number;
          } else {
            if (startNodeDone) {
              CirclesRefs[startNode.y][startNode.x].style.backgroundColor =
                sudoku_colors.correct_number;
            } else {
              CirclesRefs[startNode.y][startNode.x].style.backgroundColor =
                sudoku_colors.non_focus_section;
            }
          }
          if (errorCicrles[endNode.y][endNode.x] && accordingToSolution) {
            CirclesRefs[endNode.y][endNode.x].style.backgroundColor =
              sudoku_colors.error_number;
          } else {
            if (endNodeDone) {
              CirclesRefs[endNode.y][endNode.x].style.backgroundColor =
                sudoku_colors.correct_number;
            } else {
              CirclesRefs[endNode.y][endNode.x].style.backgroundColor =
                sudoku_colors.non_focus_section;
            }
          }
          setEndNodeSelected(false);
          setStartNodeSelected(false);
          setEndNode(null);
          setStartNode(null);
        } else {
          let drawPaths = findDrawPaths2(bridges, startNode.x, startNode.y);
          drawPaths.forEach((elem) => {
            let index = bridges.indexOf(elem);
            let prev = [...bridges];
            prev[index].showDrawPath = false;
            setBridges(prev);
          });
          let startNodeDone =
            getNumberOfBuildPaths(bridges, startNode.x, startNode.y) >=
            puzzle[startNode.y][startNode.x];
          let endNodeDone =
            getNumberOfBuildPaths(bridges, endNode.x, endNode.y) >=
            puzzle[endNode.y][endNode.x];

          if (errorCicrles[startNode.y][startNode.x] && accordingToSolution) {
            CirclesRefs[startNode.y][startNode.x].style.backgroundColor =
              sudoku_colors.error_number;
          } else {
            if (startNodeDone) {
              CirclesRefs[startNode.y][startNode.x].style.backgroundColor =
                sudoku_colors.correct_number;
            } else {
              CirclesRefs[startNode.y][startNode.x].style.backgroundColor =
                sudoku_colors.non_focus_section;
            }
          }
          if (errorCicrles[endNode.y][endNode.x] && accordingToSolution) {
            CirclesRefs[endNode.y][endNode.x].style.backgroundColor =
              sudoku_colors.error_number;
          } else {
            if (endNodeDone) {
              CirclesRefs[endNode.y][endNode.x].style.backgroundColor =
                sudoku_colors.correct_number;
            } else {
              CirclesRefs[endNode.y][endNode.x].style.backgroundColor =
                sudoku_colors.non_focus_section;
            }
          }
          setEndNodeSelected(false);
          setStartNodeSelected(false);
          setEndNode(null);
          setStartNode(null);
        }
      } else {
        if (
          CompletedCricles[startNode.y][startNode.x] ||
          CompletedCricles[endNode.y][endNode.x]
        ) {
          let foundRelationship = findRelationship2(
            bridges,
            startNode.x,
            startNode.y,
            endNode.x,
            endNode.y
          );
          if (foundRelationship.length == 1) {
            let relationship = foundRelationship[0];
            let index = bridges.indexOf(relationship);
            let prev = [...bridges];
            prev[index].showBridges = 0;
            setBridges(prev);
            if (startNode.y == endNode.y) {
              let prevPuzzleWithDirections = [...puzzleWithDirections];
              let fromIndex = startNode.x < endNode.x ? startNode.x : endNode.x;
              let toIndex = startNode.x < endNode.x ? endNode.x : startNode.x;
              for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                prevPuzzleWithDirections[startNode.y][i] = null;
              }
              setPuzzleWithDirections(prevPuzzleWithDirections);
            } else {
              let prevPuzzleWithDirections = [...puzzleWithDirections];
              let fromIndex = startNode.y < endNode.y ? startNode.y : endNode.y;
              let toIndex = startNode.y < endNode.y ? endNode.y : startNode.y;
              for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                prevPuzzleWithDirections[i][startNode.x] = null;
              }
              setPuzzleWithDirections(prevPuzzleWithDirections);
            }
          }
          let drawPaths = findDrawPaths2(bridges, startNode.x, startNode.y);
          drawPaths.forEach((elem) => {
            let index = bridges.indexOf(elem);
            let prev = [...bridges];
            prev[index].showDrawPath = false;
            setBridges(prev);
          });
          let CompletedCriclesPrev = [...CompletedCricles];
          let startNodeDone =
            getNumberOfBuildPaths(bridges, startNode.x, startNode.y) >=
            puzzle[startNode.y][startNode.x];
          let endNodeDone =
            getNumberOfBuildPaths(bridges, endNode.x, endNode.y) >=
            puzzle[endNode.y][endNode.x];
          CompletedCriclesPrev[startNode.y][startNode.x] = startNodeDone;
          CompletedCriclesPrev[endNode.y][endNode.x] = endNodeDone;
          setCompletedCricles(CompletedCriclesPrev);
          setEndNodeSelected(false);
          setStartNodeSelected(false);
          setEndNode(null);
          setStartNode(null);
          if (errorCicrles[startNode.y][startNode.x] && accordingToSolution) {
            CirclesRefs[startNode.y][startNode.x].style.backgroundColor =
              sudoku_colors.error_number;
          } else {
            if (startNodeDone) {
              CirclesRefs[startNode.y][startNode.x].style.backgroundColor =
                sudoku_colors.correct_number;
            } else {
              CirclesRefs[startNode.y][startNode.x].style.backgroundColor =
                sudoku_colors.non_focus_section;
            }
          }
          if (errorCicrles[endNode.y][endNode.x] && accordingToSolution) {
            CirclesRefs[endNode.y][endNode.x].style.backgroundColor =
              sudoku_colors.error_number;
          } else {
            if (endNodeDone) {
              CirclesRefs[endNode.y][endNode.x].style.backgroundColor =
                sudoku_colors.correct_number;
            } else {
              CirclesRefs[endNode.y][endNode.x].style.backgroundColor =
                sudoku_colors.non_focus_section;
            }
          }
        } else {
          let foundRelationship = findRelationship(
            bridges,
            startNode.x,
            startNode.y,
            endNode.x,
            endNode.y
          );
          if (foundRelationship.length == 1) {
            let relationship = foundRelationship[0];
            if (relationship.showBridges == 0) {
              let index = bridges.indexOf(relationship);
              let prev = [...bridges];
              prev[index].showBridges = 1;
              setBridges(prev);
              if (startNode.y == endNode.y) {
                let prevPuzzleWithDirections = [...puzzleWithDirections];
                let fromIndex =
                  startNode.x < endNode.x ? startNode.x : endNode.x;
                let toIndex = startNode.x < endNode.x ? endNode.x : startNode.x;
                for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                  prevPuzzleWithDirections[startNode.y][i] = 11;
                }
                setPuzzleWithDirections(prevPuzzleWithDirections);
              } else {
                let prevPuzzleWithDirections = [...puzzleWithDirections];
                let fromIndex =
                  startNode.y < endNode.y ? startNode.y : endNode.y;
                let toIndex = startNode.y < endNode.y ? endNode.y : startNode.y;
                for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                  prevPuzzleWithDirections[i][startNode.x] = 21;
                }
                setPuzzleWithDirections(prevPuzzleWithDirections);
              }
            } else if (relationship.showBridges == 1) {
              let index = bridges.indexOf(relationship);
              let prev = [...bridges];
              prev[index].showBridges = 2;
              setBridges(prev);
              if (startNode.y == endNode.y) {
                let prevPuzzleWithDirections = [...puzzleWithDirections];
                let fromIndex =
                  startNode.x < endNode.x ? startNode.x : endNode.x;
                let toIndex = startNode.x < endNode.x ? endNode.x : startNode.x;
                for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                  prevPuzzleWithDirections[startNode.y][i] = 12;
                }
                setPuzzleWithDirections(prevPuzzleWithDirections);
              } else {
                let prevPuzzleWithDirections = [...puzzleWithDirections];
                let fromIndex =
                  startNode.y < endNode.y ? startNode.y : endNode.y;
                let toIndex = startNode.y < endNode.y ? endNode.y : startNode.y;
                for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                  prevPuzzleWithDirections[i][startNode.x] = 22;
                }
                setPuzzleWithDirections(prevPuzzleWithDirections);
              }
            } else if (relationship.showBridges == 2) {
              let index = bridges.indexOf(relationship);
              let prev = [...bridges];
              prev[index].showBridges = 0;
              setBridges(prev);
              if (startNode.y == endNode.y) {
                let prevPuzzleWithDirections = [...puzzleWithDirections];
                let fromIndex =
                  startNode.x < endNode.x ? startNode.x : endNode.x;
                let toIndex = startNode.x < endNode.x ? endNode.x : startNode.x;
                for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                  prevPuzzleWithDirections[startNode.y][i] = null;
                }
                setPuzzleWithDirections(prevPuzzleWithDirections);
              } else {
                let prevPuzzleWithDirections = [...puzzleWithDirections];
                let fromIndex =
                  startNode.y < endNode.y ? startNode.y : endNode.y;
                let toIndex = startNode.y < endNode.y ? endNode.y : startNode.y;
                for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                  prevPuzzleWithDirections[i][startNode.x] = null;
                }
                setPuzzleWithDirections(prevPuzzleWithDirections);
              }
            }
          }
          let drawPaths = findDrawPaths2(bridges, startNode.x, startNode.y);
          drawPaths.forEach((elem) => {
            let index = bridges.indexOf(elem);
            let prev = [...bridges];
            prev[index].showDrawPath = false;
            setBridges(prev);
          });
          let CompletedCriclesPrev = [...CompletedCricles];
          let startNodeDone =
            getNumberOfBuildPaths(bridges, startNode.x, startNode.y) >=
            puzzle[startNode.y][startNode.x];
          let endNodeDone =
            getNumberOfBuildPaths(bridges, endNode.x, endNode.y) >=
            puzzle[endNode.y][endNode.x];
          CompletedCriclesPrev[startNode.y][startNode.x] = startNodeDone;
          CompletedCriclesPrev[endNode.y][endNode.x] = endNodeDone;
          setCompletedCricles(CompletedCriclesPrev);
          setEndNodeSelected(false);
          setStartNodeSelected(false);
          setEndNode(null);
          setStartNode(null);
          if (errorCicrles[startNode.y][startNode.x] && accordingToSolution) {
            CirclesRefs[startNode.y][startNode.x].style.backgroundColor =
              sudoku_colors.error_number;
          } else {
            if (startNodeDone) {
              CirclesRefs[startNode.y][startNode.x].style.backgroundColor =
                sudoku_colors.correct_number;
            } else {
              CirclesRefs[startNode.y][startNode.x].style.backgroundColor =
                sudoku_colors.non_focus_section;
            }
          }
          if (errorCicrles[endNode.y][endNode.x] && accordingToSolution) {
            CirclesRefs[endNode.y][endNode.x].style.backgroundColor =
              sudoku_colors.error_number;
          } else {
            if (endNodeDone) {
              CirclesRefs[endNode.y][endNode.x].style.backgroundColor =
                sudoku_colors.correct_number;
            } else {
              CirclesRefs[endNode.y][endNode.x].style.backgroundColor =
                sudoku_colors.non_focus_section;
            }
          }
        }
      }
      setNodesForCheck({ startNode: startNode, endNode: endNode });
      // checkErrors(startNode, endNode);
    }
  }, [endNodeSelected]);

  const [errorCicrles, setErrorCircles] = useState([
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
  ]);
  function checkErrors(startNode, endNode) {
    if (CompletedCricles[startNode.y][startNode.x]) {
      console.log("here started");
      let check_x1 = startNode.x - 1;
      if (check_x1 < 0) {
        check_x1 = 0;
      }
      let check_x2 = startNode.x + 1;
      if (puzzle[0].length <= check_x2) {
        check_x2 = puzzle[0].length - 1;
      }
      let check_y1 = startNode.y - 1;
      if (check_y1 < 0) {
        check_y1 = 0;
      }
      let check_y2 = startNode.y + 1;
      if (puzzle.length <= check_y2) {
        check_y2 = puzzle.length - 1;
      }
      if (
        (puzzleWithDirections[startNode.y][check_x1] !=
          solution[startNode.y][check_x1] &&
          puzzleWithDirections[startNode.y][check_x1] != null) ||
        (puzzleWithDirections[startNode.y][check_x2] !=
          solution[startNode.y][check_x2] &&
          puzzleWithDirections[startNode.y][check_x2] != null) ||
        (puzzleWithDirections[check_y1][startNode.x] !=
          solution[check_y1][startNode.x] &&
          puzzleWithDirections[check_y1][startNode.x] != null) ||
        (puzzleWithDirections[check_y2][startNode.x] !=
          solution[check_y2][startNode.x] &&
          puzzleWithDirections[check_y2][startNode.x] != null)
      ) {
        let rels = findDoneRelationShips(startNode.y, startNode.x);
        for (let i = 0; i < rels.length; i = i + 1) {
          if (
            (isVertical(rels[i]) &&
              checkInRangeVertical(check_y2, startNode.x, rels[i]) &&
              !isVerticalSolution(check_y2, startNode.x)) ||
            (isVertical(rels[i]) &&
              checkInRangeVertical(check_y2, startNode.x, rels[i]) &&
              isVerticalSolution(check_y2, startNode.x) &&
              puzzleWithDirections[check_y2][startNode.x] !=
                solution[check_y2][startNode.x] &&
              puzzleWithDirections[check_y2][startNode.x] != null) ||
            (isVertical(rels[i]) &&
              checkInRangeVertical(check_y1, startNode.x, rels[i]) &&
              !isVerticalSolution(check_y1, startNode.x)) ||
            (isVertical(rels[i]) &&
              checkInRangeVertical(check_y1, startNode.x, rels[i]) &&
              isVerticalSolution(check_y1, startNode.x) &&
              puzzleWithDirections[check_y1][startNode.x] !=
                solution[check_y1][startNode.x] &&
              puzzleWithDirections[check_y1][startNode.x] != null) ||
            (!isVertical(rels[i]) &&
              checkInRangeHorizontal(startNode.y, check_x2, rels[i]) &&
              isVerticalSolution(startNode.y, check_x2)) ||
            (!isVertical(rels[i]) &&
              checkInRangeHorizontal(startNode.y, check_x2, rels[i]) &&
              !isVerticalSolution(startNode.y, check_x2) &&
              puzzleWithDirections[startNode.y][check_x2] !=
                solution[startNode.y][check_x2] &&
              puzzleWithDirections[startNode.y][check_x2] != null) ||
            (!isVertical(rels[i]) &&
              checkInRangeHorizontal(startNode.y, check_x1, rels[i]) &&
              isVerticalSolution(startNode.y, check_x1)) ||
            (!isVertical(rels[i]) &&
              checkInRangeHorizontal(startNode.y, check_x1, rels[i]) &&
              !isVerticalSolution(startNode.y, check_x1) &&
              puzzleWithDirections[startNode.y][check_x1] !=
                solution[startNode.y][check_x1] &&
              puzzleWithDirections[startNode.y][check_x1] != null)
          ) {
            let index = bridges.indexOf(rels[i]);
            let prev = [...bridges];
            prev[index].error = true;
            setBridges(prev);
            let errorCicrlesPrev = [...errorCicrles];
            errorCicrlesPrev[startNode.y][startNode.x] = true;
            setErrorCircles(errorCicrlesPrev);
          }
        }
      }
    } else {
      let errorCicrlesPrev = [...errorCicrles];
      errorCicrlesPrev[startNode.y][startNode.x] = false;
      setErrorCircles(errorCicrlesPrev);
      let rels = findDoneRelationShips(startNode.y, startNode.x);
      for (let i = 0; i < rels.length; i = i + 1) {
        let index = bridges.indexOf(rels[i]);
        let prev = [...bridges];
        if (prev[index].error) {
          if (
            !errorCicrles[prev[index].relationship.y1][
              prev[index].relationship.x1
            ] &&
            !errorCicrles[prev[index].relationship.y2][
              prev[index].relationship.x2
            ]
          ) {
            prev[index].error = false;
          }
        }
        setBridges(prev);
      }
    }
    if (CompletedCricles[endNode.y][endNode.x]) {
      let check_x1 = endNode.x - 1;
      if (check_x1 < 0) {
        check_x1 = 0;
      }
      let check_x2 = endNode.x + 1;
      if (puzzle[0].length <= check_x2) {
        check_x2 = puzzle[0].length - 1;
      }
      let check_y1 = endNode.y - 1;
      if (check_y1 < 0) {
        check_y1 = 0;
      }
      let check_y2 = endNode.y + 1;
      if (puzzle.length <= check_y2) {
        check_y2 = puzzle.length - 1;
      }
      if (
        (puzzleWithDirections[endNode.y][check_x1] !=
          solution[endNode.y][check_x1] &&
          puzzleWithDirections[endNode.y][check_x1] != null) ||
        (puzzleWithDirections[endNode.y][check_x2] !=
          solution[endNode.y][check_x2] &&
          puzzleWithDirections[endNode.y][check_x2] != null) ||
        (puzzleWithDirections[check_y1][endNode.x] !=
          solution[check_y1][endNode.x] &&
          puzzleWithDirections[check_y1][endNode.x] != null) ||
        (puzzleWithDirections[check_y2][endNode.x] !=
          solution[check_y2][endNode.x] &&
          puzzleWithDirections[check_y2][endNode.x] != null)
      ) {
        let rels = findDoneRelationShips(endNode.y, endNode.x);
        for (let i = 0; i < rels.length; i = i + 1) {
          if (
            (isVertical(rels[i]) &&
              checkInRangeVertical(check_y2, endNode.x, rels[i]) &&
              !isVerticalSolution(check_y2, endNode.x)) ||
            (isVertical(rels[i]) &&
              checkInRangeVertical(check_y2, endNode.x, rels[i]) &&
              isVerticalSolution(check_y2, endNode.x) &&
              puzzleWithDirections[check_y2][endNode.x] !=
                solution[check_y2][endNode.x] &&
              puzzleWithDirections[check_y2][endNode.x] != null) ||
            (isVertical(rels[i]) &&
              checkInRangeVertical(check_y1, endNode.x, rels[i]) &&
              !isVerticalSolution(check_y1, endNode.x)) ||
            (isVertical(rels[i]) &&
              checkInRangeVertical(check_y1, endNode.x, rels[i]) &&
              isVerticalSolution(check_y1, endNode.x) &&
              puzzleWithDirections[check_y1][endNode.x] !=
                solution[check_y1][endNode.x] &&
              puzzleWithDirections[check_y1][endNode.x] != null) ||
            (!isVertical(rels[i]) &&
              checkInRangeHorizontal(endNode.y, check_x2, rels[i]) &&
              isVerticalSolution(endNode.y, check_x2)) ||
            (!isVertical(rels[i]) &&
              checkInRangeHorizontal(endNode.y, check_x2, rels[i]) &&
              !isVerticalSolution(endNode.y, check_x2) &&
              puzzleWithDirections[endNode.y][check_x2] !=
                solution[endNode.y][check_x2] &&
              puzzleWithDirections[endNode.y][check_x2] != null) ||
            (!isVertical(rels[i]) &&
              checkInRangeHorizontal(endNode.y, check_x1, rels[i]) &&
              isVerticalSolution(endNode.y, check_x1)) ||
            (!isVertical(rels[i]) &&
              checkInRangeHorizontal(endNode.y, check_x1, rels[i]) &&
              !isVerticalSolution(endNode.y, check_x1) &&
              puzzleWithDirections[endNode.y][check_x1] !=
                solution[endNode.y][check_x1] &&
              puzzleWithDirections[endNode.y][check_x1] != null)
          ) {
            let index = bridges.indexOf(rels[i]);
            let prev = [...bridges];
            prev[index].error = true;
            setBridges(prev);
            let errorCicrlesPrev = [...errorCicrles];
            errorCicrlesPrev[endNode.y][endNode.x] = true;
            setErrorCircles(errorCicrlesPrev);
          }
        }
      }
    } else {
      if (!errorCicrles[startNode.y][startNode.x]) {
        let errorCicrlesPrev = [...errorCicrles];
        errorCicrlesPrev[endNode.y][endNode.x] = false;
        setErrorCircles(errorCicrlesPrev);
        let rels = findDoneRelationShips(endNode.y, endNode.x);
        for (let i = 0; i < rels.length; i = i + 1) {
          let index = bridges.indexOf(rels[i]);
          let prev = [...bridges];
          if (prev[index].error) {
            if (
              !errorCicrles[prev[index].relationship.y1][
                prev[index].relationship.x1
              ] &&
              !errorCicrles[prev[index].relationship.y2][
                prev[index].relationship.x2
              ]
            ) {
              prev[index].error = false;
            }
          }
          setBridges(prev);
        }
      }
    }
  }

  function checkInRangeHorizontal(y, x, rel) {
    if (
      rel.relationship.y1 == rel.relationship.y2 &&
      rel.relationship.y1 == y &&
      rel.relationship.y2 == y
    ) {
      if (rel.relationship.x1 < rel.relationship.x2) {
        return rel.relationship.x1 <= x && x <= rel.relationship.x2;
      } else {
        return rel.relationship.x2 <= x && x <= rel.relationship.x1;
      }
    } else {
      return false;
    }
  }
  function checkInRangeVertical(y, x, rel) {
    if (
      rel.relationship.x1 == rel.relationship.x2 &&
      rel.relationship.x1 == x &&
      rel.relationship.x2 == x
    ) {
      if (rel.relationship.y1 < rel.relationship.y2) {
        return rel.relationship.y1 <= y && y <= rel.relationship.y2;
      } else {
        return rel.relationship.y2 <= y && y <= rel.relationship.y1;
      }
    } else {
      return false;
    }
  }
  function isVerticalSolution(y, x) {
    return solution[y][x] == 21 || solution[y][x] == 22;
  }
  function isVertical(rel) {
    return rel.relationship.x1 == rel.relationship.x2;
  }

  const [accordingToSolution, setAccordingToSolution] = useState(false);
  const [activeAccordingToSolutionOption, setActiveAccordingToSolutionOption] =
    useState("Off");
  function handleAccordingToSolutionSwitch(option) {
    //Handling switch
    if (option === "On") {
      setAccordingToSolution(true);
      setActiveAccordingToSolutionOption("On");
      //   setChecking(true);
    } else {
      setAccordingToSolution(false);
      setActiveAccordingToSolutionOption("Off");
      //   setChecking(true);
    }
  }
  function handleDownloadPuzzle() {
    const myJSON = {
      "puzzle-type": "hashi",
      values: location.state.game.values,
      solution: location.state.game.solution,
      "creator-id": location.state.game["creator-id"],
      difficulty: location.state.game.difficulty * 10,
    };
    const fileData = JSON.stringify(myJSON);
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "hashi.json";
    link.href = url;
    link.click();
  }
  const flagModalRef = useRef(null);
  const [flagModalIsOpen, setFlagModalIsOpen] = useState(false);
  const FlaggInputRef = useRef(null);
  const [isFlagginLoading, setIsFlagginLoading] = useState(false);
  const { user } = useSelector((state) => state.login);
  const navigate = useNavigate();

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
          puzzleType: "hashi",
        }),
      }
    );
    console.log("nnnn");
  }
  const [rules_text, set_rules_text] = useState("");
  const rulesModalRef = useRef(null);
  const [rulesModalIsOpen, setRulesModalIsOpen] = useState(false);
  const RulesContainerRef = useRef(null);
  //History stack of layered state
  const history = useRef([]).current;
  const [popping, setPopping] = useState(false);
  useEffect(() => {
    if (isMounted && !popping) {
      history.push({
        bridges: JSON.parse(JSON.stringify(bridges)),
        CompletedCricles: JSON.parse(JSON.stringify(CompletedCricles)),
        puzzleWithDirections: JSON.parse(JSON.stringify(puzzleWithDirections)),
        errorCicrles: JSON.parse(JSON.stringify(errorCicrles)),
      });
    }
    setPopping(false);
  }, [puzzleWithDirections]);
  function backState() {
    //Popping layered state from history
    if (isMounted && history.length > 1) {
      setPopping(true);
      history.pop();
      copyBridgesBackState(
        JSON.parse(JSON.stringify(history[history.length - 1].bridges))
      );
      setCompletedCricles(
        JSON.parse(JSON.stringify(history[history.length - 1].CompletedCricles))
      );
      setPuzzleWithDirections(
        JSON.parse(
          JSON.stringify(history[history.length - 1].puzzleWithDirections)
        )
      );
      setErrorCircles(
        JSON.parse(JSON.stringify(history[history.length - 1].errorCicrles))
      );
    } else if (isMounted && history.length <= 1) {
      setPopping(true);
      setCompletedCricles(game.values.map((row) => row.map((x) => false)));
      setPuzzleWithDirections(game.values.map((row) => row.map((x) => x)));
      setErrorCircles([
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
      ]);
      drawBridges();
    }
  }
  function copyBridgesBackState(bridgesCopy) {
    let prevBridges = [...bridges];
    for (let i = 0; i < bridgesCopy.length; i = i + 1) {
      prevBridges[i].error = bridgesCopy[i].error;
      prevBridges[i].isVertical = bridgesCopy[i].isVertical;
      prevBridges[i].relationship = bridgesCopy[i].relationship;
      prevBridges[i].showBridges = bridgesCopy[i].showBridges;
      prevBridges[i].showDrawPath = bridgesCopy[i].showDrawPath;
      prevBridges[i].error = bridgesCopy[i].error;
    }
    setBridges(prevBridges);
  }
  function copyBridgesBackState2(newBridges, bridgesCopy) {
    let prevBridges = [...newBridges];
    for (let i = 0; i < bridgesCopy.length; i = i + 1) {
      prevBridges[i].error = bridgesCopy[i].error;
      prevBridges[i].isVertical = bridgesCopy[i].isVertical;
      prevBridges[i].relationship = bridgesCopy[i].relationship;
      prevBridges[i].showBridges = bridgesCopy[i].showBridges;
      prevBridges[i].showDrawPath = bridgesCopy[i].showDrawPath;
      prevBridges[i].error = bridgesCopy[i].error;
    }
    setBridges(prevBridges);
  }
  useEffect(() => {
    function handleResize() {
      let oldBridges = JSON.parse(JSON.stringify(bridges));
      // console.log("here")
      let newBridges = drawBridges();
      copyBridgesBackState2(newBridges, oldBridges);
    }
    window.addEventListener("resize", handleResize);
  });
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
              let puzzleType = "hashi";
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
      <Modal
        ariaHideApp={false}
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
        isOpen={notAllConnectedModal}
        ariaHideApp={false}
        onRequestClose={() => setNotAllConnectedModal(false)}
        style={modal_content}
      >
        {" "}
        {/*Modal for exiting screen */}
        <span style={modal_label}>
          You've used up all bridges but not all islands are interconnected.
        </span>
        <GeneralButton
          style={{ alignSelf: "center", marginTop: 20 }}
          label={"OK"}
          handleButtonPress={() => setNotAllConnectedModal(false)}
        />
      </Modal>
      <MainPageContainer image_back={hahsi_image}>
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
                  fetch(hashi_rules)
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
          style={{
            flex: 5,
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          {bridges.map((elem) => {
            if (elem.showBridges == 0) {
              if (elem.showDrawPath) {
                return (
                  <>
                    <DrawPath
                      width={elem.drawPathProps.width}
                      height={elem.drawPathProps.height}
                      startX={elem.drawPathProps.startX}
                      startY={elem.drawPathProps.startY}
                      draw={draw}
                      startNode={startNode}
                      relationship={elem.relationship}
                      isVertical={elem.isVertical}
                    />
                    {elem.none}
                  </>
                );
              } else {
                return elem.none;
              }
            } else if (elem.showBridges == 1) {
              if (elem.showDrawPath) {
                return (
                  <>
                    <DrawPath
                      width={elem.drawPathProps.width}
                      height={elem.drawPathProps.height}
                      startX={elem.drawPathProps.startX}
                      startY={elem.drawPathProps.startY}
                      draw={draw}
                      startNode={startNode}
                      relationship={elem.relationship}
                      isVertical={elem.isVertical}
                    />
                    {elem.error && accordingToSolution
                      ? elem.oneBridgeError
                      : elem.oneBridge}
                  </>
                );
              } else {
                return elem.error && accordingToSolution
                  ? elem.oneBridgeError
                  : elem.oneBridge;
              }
            } else if (elem.showBridges == 2) {
              if (elem.showDrawPath) {
                return (
                  <>
                    <DrawPath
                      width={elem.drawPathProps.width}
                      height={elem.drawPathProps.height}
                      startX={elem.drawPathProps.startX}
                      startY={elem.drawPathProps.startY}
                      draw={draw}
                      startNode={startNode}
                      relationship={elem.relationship}
                      isVertical={elem.isVertical}
                    />
                    {elem.error && accordingToSolution
                      ? elem.twoBridgesError
                      : elem.twoBridges}
                  </>
                );
              } else {
                return elem.error && accordingToSolution
                  ? elem.twoBridgesError
                  : elem.twoBridges;
              }
            }
          })}
          {isMounted && (
            <>
              <HashiGrid
                accordingToSolution={accordingToSolution}
                errorCicrles={errorCicrles}
                puzzle={puzzle}
                CirclesRefs={CirclesRefs}
                CompletedCricles={CompletedCricles}
                setStartNode={setStartNode}
                setEndNode={setEndNode}
                startNodeSelected={startNodeSelected}
                setStartNodeSelected={setStartNodeSelected}
                findDoneRelationShips={findDoneRelationShips}
                bridges={bridges}
                setBridges={setBridges}
                findDrawPaths={findDrawPaths}
                setEndNodeSelected={setEndNodeSelected}
                puzzleHeight={size.height}
                puzzleWidth={size.width}
              />
              <PanelComponent backState={backState} />
            </>
          )}
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
              }}
            />
          </div>
        </div>
      </MainPageContainer>
    </>
  );
}

// PanelComponent
