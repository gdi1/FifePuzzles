import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import MainPageContainer from "../components/MainPageContainer";
import image_8spuzzle from '../images/image_8spuzzle.jpg'
import HomeButton from "../components/HomeButton";
import HomeButtonPlain from "../components/HomeButtonPlain";
import Modal from 'react-modal';
import hahsi_image from "../images/hashi_image.jpg"
import { GeneralModalButtonStyle, modal_content, modal_label } from '../inline-styles/modal'
import HashiGridForCreation from "../hashi-components/HashiGridForCreation";
import CustomProgress from "../components/CustomProgress"
import NumberPanelComponent from "../hashi-components/NumberPanelComponent";
import ReactCardFlip from 'react-card-flip';
import GeneralButton from "../components/GeneralButton";
import margins from "../style-utils/margins";
import sudoku_colors from "../style-utils/sudoku_colors";
import HashiConnectionChecker from "../hashi-components/HashiConnectionChecker";
import HashiGrid from "../hashi-components/HashiGrid";
import DrawPath from "../hashi-components/DrawPath";
import paddings from "../style-utils/paddings";
import { useSelector } from "react-redux";

import PanelComponent from "../hashi-components/PanelComponent";
export default function CreateHashi() {
    const navigate = useNavigate();

    function handleHomeButton() {
        setQuitModalIsOpen(true);
    }
    const [quitModalIsOpen, setQuitModalIsOpen] = useState(false);
    const location = useLocation();
    const size = useRef({
        width: location.state.width,
        height: location.state.height
    }).current;

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        let puzzleTemp = new Array(size.height).fill(null).map(() => new Array(size.width).fill(null));
        setPuzzleSetting(puzzleTemp);
        setIsMounted(true)
    }, [])

    const [puzzleSetting, setPuzzleSetting] = useState(null);

    const [isFlipped, setIsFlipped] = useState(false)
    ///////////////////////////////////////////////////////////////////////////////////

    const [puzzle, setPuzzle] = useState(
        new Array(size.height).fill(null).map(() => new Array(size.width).fill(null))
    );
    const [puzzleWithDirections, setPuzzleWithDirections] = useState(new Array(size.height).fill(null).map(() => new Array(size.width).fill(null)))
    const CirclesRefs = useRef(new Array(size.height).fill(null).map(() => new Array(size.width).fill(null))).current;
    const [CompletedCricles, setCompletedCricles] = useState(new Array(size.height).fill(false).map(() => new Array(size.width).fill(false)));
    const [errorCicrles, setErrorCircles] = useState(new Array(size.height).fill(false).map(() => new Array(size.width).fill(false)))

    const [startNode, setStartNode] = useState(null);
    const [endNode, setEndNode] = useState(null);
    const [startNodeSelected, setStartNodeSelected] = useState(false);
    const [endNodeSelected, setEndNodeSelected] = useState(false);
    const [bridges, setBridges] = useState([]);
    function drawBridges() {
        let drawnBridges = []
        for (let y = 0; y < size.height; y = y + 1) {
            for (let x = 0; x < size.width; x = x + 1) {
                //vertical
                if (CirclesRefs[y][x] != null && y != 0) {
                    let topConnectCircle = null;
                    for (let y2 = y - 1; y2 >= 0; y2 = y2 - 1) {
                        if (CirclesRefs[y2][x] != null) {
                            topConnectCircle = CirclesRefs[y2][x];
                            let width = topConnectCircle.offsetWidth * 0.05
                            let startX = topConnectCircle.offsetLeft + (topConnectCircle.offsetWidth / 2) - width / 2
                            let startY = topConnectCircle.offsetTop + topConnectCircle.offsetHeight
                            let endY = CirclesRefs[y][x].offsetTop;
                            let height = endY - startY;
                            drawnBridges.push(
                                {
                                    relationship: { x1: x, y1: y, x2: x, y2: y2 },
                                    none: (<></>),
                                    oneBridge: (
                                        <div style={{ position: 'absolute', width: width, height: height, backgroundColor: 'black', left: startX, top: startY, zIndex: 2 }} />
                                    ),
                                    twoBridges: (
                                        <>
                                            <div style={{ position: 'absolute', width: width, height: height, backgroundColor: 'black', left: startX + (width * 2), top: startY, zIndex: 2 }} />
                                            <div style={{ position: 'absolute', width: width, height: height, backgroundColor: 'black', left: startX - (width * 2), top: startY, zIndex: 2 }} />
                                        </>
                                    ),
                                    oneBridgeError: (
                                        <div style={{ position: 'absolute', width: width, height: height, backgroundColor: sudoku_colors.error_number, left: startX, top: startY, zIndex: 2 }} />
                                    ),
                                    twoBridgesError: (
                                        <>
                                            <div style={{ position: 'absolute', width: width, height: height, backgroundColor: sudoku_colors.error_number, left: startX + (width * 2), top: startY, zIndex: 2 }} />
                                            <div style={{ position: 'absolute', width: width, height: height, backgroundColor: sudoku_colors.error_number, left: startX - (width * 2), top: startY, zIndex: 2 }} />
                                        </>
                                    ),
                                    drawPathProps: {
                                        width: width * 2 + width * 4,
                                        height: height,
                                        startX: startX - (width * 2) - width / 2,
                                        startY: startY
                                    },
                                    showBridges: 0,
                                    showDrawPath: false,
                                    isVertical: true,
                                    error: false
                                }
                            )
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
                            let height = leftConnectCircle.offsetHeight * 0.05
                            let startY = leftConnectCircle.offsetTop + (leftConnectCircle.offsetHeight / 2) - height / 2
                            let startX = leftConnectCircle.offsetLeft + leftConnectCircle.offsetWidth
                            let endX = CirclesRefs[y][x].offsetLeft;
                            let width = endX - startX;
                            drawnBridges.push(
                                {
                                    relationship: { x1: x, y1: y, x2: x2, y2: y },
                                    none: (<></>),
                                    oneBridge: (
                                        <div style={{ position: 'absolute', width: width, height: height, backgroundColor: 'black', left: startX, top: startY, zIndex: 1 }} />
                                    ),
                                    twoBridges: (
                                        <>
                                            <div style={{ position: 'absolute', width: width, height: height, backgroundColor: 'black', left: startX, top: startY + (height * 2), zIndex: 2 }} />
                                            <div style={{ position: 'absolute', width: width, height: height, backgroundColor: 'black', left: startX, top: startY - (height * 2), zIndex: 2 }} />
                                        </>
                                    ),
                                    oneBridgeError: (
                                        <div style={{ position: 'absolute', width: width, height: height, backgroundColor: sudoku_colors.error_number, left: startX, top: startY, zIndex: 1 }} />
                                    ),
                                    twoBridgesError: (
                                        <>
                                            <div style={{ position: 'absolute', width: width, height: height, backgroundColor: sudoku_colors.error_number, left: startX, top: startY + (height * 2), zIndex: 2 }} />
                                            <div style={{ position: 'absolute', width: width, height: height, backgroundColor: sudoku_colors.error_number, left: startX, top: startY - (height * 2), zIndex: 2 }} />
                                        </>
                                    ),
                                    drawPathProps: {
                                        width: width,
                                        height: height * 2 + height * 4,
                                        startX: startX,
                                        startY: startY - (height * 2) - height / 2
                                    },
                                    showBridges: 0,
                                    showDrawPath: false,
                                    isVertical: false,
                                    error: false
                                }
                            )
                            break;
                        }
                    }
                }
            }
        }
        setBridges(drawnBridges);
        return drawnBridges;
    }
    function draw(canvasCtx, x, y, width, height, startNode, relationship, isVertical) {
        if (isVertical) {
            let top = (startNode.y - relationship.y1) == 0;
            if (top) {
                canvasCtx.clearRect(0, 0, width, height)
                canvasCtx.beginPath();
                canvasCtx.moveTo(0, height);
                canvasCtx.lineTo(0, y);
                canvasCtx.stroke();
            } else {
                canvasCtx.clearRect(0, 0, width, height)
                canvasCtx.beginPath();
                canvasCtx.moveTo(0, 0);
                canvasCtx.lineTo(0, y);
                canvasCtx.stroke();
            }
        } else {
            let left = (startNode.x - relationship.x1) == 0;
            if (left) {
                canvasCtx.clearRect(0, 0, width, height)
                canvasCtx.beginPath();
                canvasCtx.moveTo(width, 0);
                canvasCtx.lineTo(x, 0);
                canvasCtx.stroke();
            } else {
                canvasCtx.clearRect(0, 0, width, height)
                canvasCtx.beginPath();
                canvasCtx.moveTo(0, 0);
                canvasCtx.lineTo(x, 0);
                canvasCtx.stroke();
            }
        }
    }
    function findDoneRelationShips(y, x) {
        let foundDoneRelationships = bridges.filter((elem, index) => {
            if (
                (
                    (elem.relationship.x1 == x && elem.relationship.y1 == y)
                )
                ||
                (
                    (elem.relationship.x2 == x && elem.relationship.y2 == y)
                )
            ) {
                if (elem.showBridges != 0) {
                    return elem;
                }
            }

        });
        return foundDoneRelationships

    }
    function getNumberOfBuildPaths(bridges, x1, y1) {
        let relationshipsFound = bridges.filter((elem, index) => {
            if (
                (
                    (elem.relationship.x1 == x1 && elem.relationship.y1 == y1)
                )
                ||
                (
                    (elem.relationship.x2 == x1 && elem.relationship.y2 == y1)
                )
            ) {
                return elem;
            }
        })
        let bridgesBuilt = relationshipsFound.reduce((acc, elem1) => acc + elem1.showBridges, 0)
        return bridgesBuilt;
    }
    function findRelationship(bridges, x1, y1, x2, y2) {
        let blockedPaths = getBlockedPaths(bridges, x1, y1)
        let foundRelationship = bridges.filter((elem, index) => {
            if (
                (
                    (elem.relationship.x1 == x1 && elem.relationship.y1 == y1)
                    &&
                    (elem.relationship.x2 == x2 && elem.relationship.y2 == y2)
                )
                ||
                (
                    (elem.relationship.x1 == x2 && elem.relationship.y1 == y2) &&
                    (elem.relationship.x2 == x1 && elem.relationship.y2 == y1)
                )
            ) {
                let isBlocked = blockedPaths.filter((blockedElem => {
                    if (
                        (
                            (blockedElem.x == elem.relationship.x1)
                            &&
                            (blockedElem.y == elem.relationship.y1)
                        )
                        ||
                        (
                            (blockedElem.x == elem.relationship.x2)
                            &&
                            (blockedElem.y == elem.relationship.y2)
                        )
                    ) {
                        return elem;
                    }
                })).length != 0
                if (!isBlocked) {
                    return elem;
                }
            }
        })
        return foundRelationship
    }
    function findRelationship2(bridges, x1, y1, x2, y2) {
        let blockedPaths = getBlockedPaths2(bridges, x1, y1)
        let foundRelationship = bridges.filter((elem, index) => {
            if (
                (
                    (elem.relationship.x1 == x1 && elem.relationship.y1 == y1)
                    &&
                    (elem.relationship.x2 == x2 && elem.relationship.y2 == y2)
                )
                ||
                (
                    (elem.relationship.x1 == x2 && elem.relationship.y1 == y2) &&
                    (elem.relationship.x2 == x1 && elem.relationship.y2 == y1)
                )
            ) {
                let isBlocked = blockedPaths.filter((blockedElem => {
                    if (
                        (
                            (blockedElem.x == elem.relationship.x1)
                            &&
                            (blockedElem.y == elem.relationship.y1)
                        )
                        ||
                        (
                            (blockedElem.x == elem.relationship.x2)
                            &&
                            (blockedElem.y == elem.relationship.y2)
                        )
                    ) {
                        return elem;
                    }
                })).length != 0
                if (!isBlocked) {
                    return elem;
                }
            }
        })
        return foundRelationship
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
                    (
                        (elem.relationship.y1 < y1)
                        &&
                        (y1 < elem.relationship.y2)
                    )
                    ||
                    (
                        (elem.relationship.y1 > y1)
                        &&
                        (y1 > elem.relationship.y2)
                    )
                ) {
                    if (elem.relationship.x1 < right.x && elem.relationship.x1 > x1) {
                        if (elem.showBridges != 0) {
                            return elem;
                        }
                    }
                }

            })
            rightHasBlocks = (verticalBlocks.length != 0)
        }
        if (left != null) {
            let verticalBlocks = bridges.filter((elem, index) => {
                if (
                    (
                        (elem.relationship.y1 < y1)
                        &&
                        (y1 < elem.relationship.y2)
                    )
                    ||
                    (
                        (elem.relationship.y1 > y1)
                        &&
                        (y1 > elem.relationship.y2)
                    )
                ) {
                    if (elem.relationship.x1 > left.x && elem.relationship.x1 < x1) {
                        if (elem.showBridges != 0) {
                            return elem;
                        }
                    }
                }

            })
            leftHasBlocks = (verticalBlocks.length != 0)
        }
        if (top != null) {
            let horizontalBlocks = bridges.filter((elem, index) => {
                if (
                    (
                        (elem.relationship.x1 < x1)
                        &&
                        (x1 < elem.relationship.x2)
                    )
                    ||
                    (
                        (elem.relationship.x1 > x1)
                        &&
                        (x1 > elem.relationship.x2)
                    )
                ) {
                    if (elem.relationship.y1 > top.y && elem.relationship.y1 < y1) {
                        if (elem.showBridges != 0) {
                            return elem;
                        }
                    }
                }

            })
            topHasBlocks = (horizontalBlocks.length != 0)
        }
        if (bottom != null) {
            let horizontalBlocks = bridges.filter((elem, index) => {
                if (
                    (
                        (elem.relationship.x1 < x1)
                        &&
                        (x1 < elem.relationship.x2)
                    )
                    ||
                    (
                        (elem.relationship.x1 > x1)
                        &&
                        (x1 > elem.relationship.x2)
                    )
                ) {
                    if (elem.relationship.y1 < bottom.y && elem.relationship.y1 > y1) {
                        if (elem.showBridges != 0) {
                            return elem;
                        }
                    }
                }

            })
            bottomHasBlocks = (horizontalBlocks.length != 0)
        }
        let blockedPaths = [];
        if (topHasBlocks) {
            blockedPaths.push(top)
        }
        if (bottomHasBlocks) {
            blockedPaths.push(bottom)
        }
        if (leftHasBlocks) {
            blockedPaths.push(left)
        }
        if (rightHasBlocks) {
            blockedPaths.push(right)
        }
        return blockedPaths
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
                    (
                        (elem.relationship.y1 < y1)
                        &&
                        (y1 < elem.relationship.y2)
                    )
                    ||
                    (
                        (elem.relationship.y1 > y1)
                        &&
                        (y1 > elem.relationship.y2)
                    )
                ) {
                    if (elem.relationship.x1 < right.x && elem.relationship.x1 > x1) {
                        if (elem.showBridges != 0) {
                            return elem;
                        }
                    }
                }

            })
            rightHasBlocks = (verticalBlocks.length != 0) || CompletedCricles[right.y][right.x]
        }
        if (left != null) {
            let verticalBlocks = bridges.filter((elem, index) => {
                if (
                    (
                        (elem.relationship.y1 < y1)
                        &&
                        (y1 < elem.relationship.y2)
                    )
                    ||
                    (
                        (elem.relationship.y1 > y1)
                        &&
                        (y1 > elem.relationship.y2)
                    )
                ) {
                    if (elem.relationship.x1 > left.x && elem.relationship.x1 < x1) {
                        if (elem.showBridges != 0) {
                            return elem;
                        }
                    }
                }

            })
            leftHasBlocks = (verticalBlocks.length != 0) || (CompletedCricles[left.y][left.x])
        }
        if (top != null) {
            let horizontalBlocks = bridges.filter((elem, index) => {
                if (
                    (
                        (elem.relationship.x1 < x1)
                        &&
                        (x1 < elem.relationship.x2)
                    )
                    ||
                    (
                        (elem.relationship.x1 > x1)
                        &&
                        (x1 > elem.relationship.x2)
                    )
                ) {
                    if (elem.relationship.y1 > top.y && elem.relationship.y1 < y1) {
                        if (elem.showBridges != 0) {
                            return elem;
                        }
                    }
                }

            })
            topHasBlocks = (horizontalBlocks.length != 0) || (CompletedCricles[top.y][top.x])
        }
        if (bottom != null) {
            let horizontalBlocks = bridges.filter((elem, index) => {
                if (
                    (
                        (elem.relationship.x1 < x1)
                        &&
                        (x1 < elem.relationship.x2)
                    )
                    ||
                    (
                        (elem.relationship.x1 > x1)
                        &&
                        (x1 > elem.relationship.x2)
                    )
                ) {
                    if (elem.relationship.y1 < bottom.y && elem.relationship.y1 > y1) {
                        if (elem.showBridges != 0) {
                            return elem;
                        }
                    }
                }

            })
            bottomHasBlocks = (horizontalBlocks.length != 0) || (CompletedCricles[bottom.y][bottom.x])
        }
        let blockedPaths = [];
        if (topHasBlocks) {
            blockedPaths.push(top)
        }
        if (bottomHasBlocks) {
            blockedPaths.push(bottom)
        }
        if (leftHasBlocks) {
            blockedPaths.push(left)
        }
        if (rightHasBlocks) {
            blockedPaths.push(right)
        }
        return blockedPaths
    }
    function findDrawPaths(bridges, x1, y1) {
        let blockedPaths = getBlockedPaths(bridges, x1, y1)
        let foundRelationships = bridges.filter((elem, index) => {
            if (
                (
                    (elem.relationship.x1 == x1 && elem.relationship.y1 == y1)
                )
                ||
                (
                    (elem.relationship.x2 == x1 && elem.relationship.y2 == y1)
                )
            ) {
                let isBlocked = blockedPaths.filter((blockedElem => {
                    if (
                        (
                            (
                                (blockedElem.x == elem.relationship.x1)
                                &&
                                (blockedElem.y == elem.relationship.y1)
                            )
                            ||
                            (
                                (blockedElem.x == elem.relationship.x2)
                                &&
                                (blockedElem.y == elem.relationship.y2)
                            )
                        )
                    ) {

                        return elem;
                    }
                })).length != 0
                if (!isBlocked) {
                    return elem;
                }
            }
        })

        return foundRelationships
    }
    function findDrawPaths2(bridges, x1, y1) {
        let blockedPaths = getBlockedPaths2(bridges, x1, y1)
        let foundRelationships = bridges.filter((elem, index) => {
            if (
                (
                    (elem.relationship.x1 == x1 && elem.relationship.y1 == y1)
                )
                ||
                (
                    (elem.relationship.x2 == x1 && elem.relationship.y2 == y1)
                )
            ) {
                let isBlocked = blockedPaths.filter((blockedElem => {
                    if (
                        (
                            (blockedElem.x == elem.relationship.x1)
                            &&
                            (blockedElem.y == elem.relationship.y1)
                        )
                        ||
                        (
                            (blockedElem.x == elem.relationship.x2)
                            &&
                            (blockedElem.y == elem.relationship.y2)
                        )
                    ) {
                        return elem;
                    }
                })).length != 0
                if (!isBlocked) {
                    return elem;
                }
            }
        })

        return foundRelationships
    }

    useEffect(() => {
        if (endNodeSelected) {
            if (startNode.x == endNode.x && endNode.y == startNode.y) {
                if (CompletedCricles[startNode.y][startNode.x] || CompletedCricles[endNode.y][endNode.x]) {
                    let drawPaths = findDrawPaths2(bridges, startNode.x, startNode.y);
                    drawPaths.forEach((elem) => {
                        let index = bridges.indexOf(elem);
                        let prev = [...bridges];
                        prev[index].showDrawPath = false;
                        setBridges(prev)
                    })
                    let startNodeDone = getNumberOfBuildPaths(bridges, startNode.x, startNode.y) >= puzzle[startNode.y][startNode.x]
                    let endNodeDone = getNumberOfBuildPaths(bridges, endNode.x, endNode.y) >= puzzle[endNode.y][endNode.x]

                    if (startNodeDone) {
                        CirclesRefs[startNode.y][startNode.x].style.backgroundColor = sudoku_colors.correct_number
                    } else {
                        CirclesRefs[startNode.y][startNode.x].style.backgroundColor = sudoku_colors.non_focus_section

                    }


                    if (endNodeDone) {
                        CirclesRefs[endNode.y][endNode.x].style.backgroundColor = sudoku_colors.correct_number
                    } else {
                        CirclesRefs[endNode.y][endNode.x].style.backgroundColor = sudoku_colors.non_focus_section
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
                        setBridges(prev)
                    })
                    let startNodeDone = getNumberOfBuildPaths(bridges, startNode.x, startNode.y) >= puzzle[startNode.y][startNode.x]
                    let endNodeDone = getNumberOfBuildPaths(bridges, endNode.x, endNode.y) >= puzzle[endNode.y][endNode.x]
                    if (startNodeDone) {
                        CirclesRefs[startNode.y][startNode.x].style.backgroundColor = sudoku_colors.correct_number
                    } else {
                        CirclesRefs[startNode.y][startNode.x].style.backgroundColor = sudoku_colors.non_focus_section

                    }
                    if (endNodeDone) {
                        CirclesRefs[endNode.y][endNode.x].style.backgroundColor = sudoku_colors.correct_number
                    } else {
                        CirclesRefs[endNode.y][endNode.x].style.backgroundColor = sudoku_colors.non_focus_section
                    }
                    setEndNodeSelected(false);
                    setStartNodeSelected(false);
                    setEndNode(null);
                    setStartNode(null);
                }
            } else {
                if (CompletedCricles[startNode.y][startNode.x] || CompletedCricles[endNode.y][endNode.x]) {
                    let foundRelationship = findRelationship2(bridges, startNode.x, startNode.y, endNode.x, endNode.y)
                    if (foundRelationship.length == 1) {
                        let relationship = foundRelationship[0];
                        let index = bridges.indexOf(relationship);
                        let prev = [...bridges];
                        prev[index].showBridges = 0;
                        setBridges(prev)
                        if (startNode.y == endNode.y) {
                            let prevPuzzleWithDirections = [...puzzleWithDirections]
                            let fromIndex = startNode.x < endNode.x ? startNode.x : endNode.x;
                            let toIndex = startNode.x < endNode.x ? endNode.x : startNode.x;
                            for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                                prevPuzzleWithDirections[startNode.y][i] = null;
                            }
                            setPuzzleWithDirections(prevPuzzleWithDirections)
                        }
                        else {
                            let prevPuzzleWithDirections = [...puzzleWithDirections]
                            let fromIndex = startNode.y < endNode.y ? startNode.y : endNode.y;
                            let toIndex = startNode.y < endNode.y ? endNode.y : startNode.y;
                            for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                                prevPuzzleWithDirections[i][startNode.x] = null;
                            }
                            setPuzzleWithDirections(prevPuzzleWithDirections)
                        }

                    }
                    let drawPaths = findDrawPaths2(bridges, startNode.x, startNode.y);
                    drawPaths.forEach((elem) => {
                        let index = bridges.indexOf(elem);
                        let prev = [...bridges];
                        prev[index].showDrawPath = false;
                        setBridges(prev)
                    })
                    let CompletedCriclesPrev = [...CompletedCricles];
                    let startNodeDone = getNumberOfBuildPaths(bridges, startNode.x, startNode.y) >= puzzle[startNode.y][startNode.x]
                    let endNodeDone = getNumberOfBuildPaths(bridges, endNode.x, endNode.y) >= puzzle[endNode.y][endNode.x]
                    CompletedCriclesPrev[startNode.y][startNode.x] = startNodeDone
                    CompletedCriclesPrev[endNode.y][endNode.x] = endNodeDone
                    setCompletedCricles(CompletedCriclesPrev)
                    setEndNodeSelected(false);
                    setStartNodeSelected(false);
                    setEndNode(null);
                    setStartNode(null);
                    if (startNodeDone) {
                        CirclesRefs[startNode.y][startNode.x].style.backgroundColor = sudoku_colors.correct_number
                    } else {
                        CirclesRefs[startNode.y][startNode.x].style.backgroundColor = sudoku_colors.non_focus_section

                    }
                    if (endNodeDone) {
                        CirclesRefs[endNode.y][endNode.x].style.backgroundColor = sudoku_colors.correct_number
                    } else {
                        CirclesRefs[endNode.y][endNode.x].style.backgroundColor = sudoku_colors.non_focus_section
                    }
                } else {
                    let foundRelationship = findRelationship(bridges, startNode.x, startNode.y, endNode.x, endNode.y)
                    if (foundRelationship.length == 1) {
                        let relationship = foundRelationship[0];
                        if (relationship.showBridges == 0) {
                            let index = bridges.indexOf(relationship);
                            let prev = [...bridges];
                            prev[index].showBridges = 1;
                            setBridges(prev)
                            if (startNode.y == endNode.y) {
                                let prevPuzzleWithDirections = [...puzzleWithDirections]
                                let fromIndex = startNode.x < endNode.x ? startNode.x : endNode.x;
                                let toIndex = startNode.x < endNode.x ? endNode.x : startNode.x;
                                for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                                    prevPuzzleWithDirections[startNode.y][i] = 11;
                                }
                                setPuzzleWithDirections(prevPuzzleWithDirections)
                            }
                            else {
                                let prevPuzzleWithDirections = [...puzzleWithDirections]
                                let fromIndex = startNode.y < endNode.y ? startNode.y : endNode.y;
                                let toIndex = startNode.y < endNode.y ? endNode.y : startNode.y;
                                for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                                    prevPuzzleWithDirections[i][startNode.x] = 21;
                                }
                                setPuzzleWithDirections(prevPuzzleWithDirections)
                            }
                        } else if (relationship.showBridges == 1) {
                            let index = bridges.indexOf(relationship);
                            let prev = [...bridges];
                            prev[index].showBridges = 2;
                            setBridges(prev)
                            if (startNode.y == endNode.y) {
                                let prevPuzzleWithDirections = [...puzzleWithDirections]
                                let fromIndex = startNode.x < endNode.x ? startNode.x : endNode.x;
                                let toIndex = startNode.x < endNode.x ? endNode.x : startNode.x;
                                for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                                    prevPuzzleWithDirections[startNode.y][i] = 12;
                                }
                                setPuzzleWithDirections(prevPuzzleWithDirections)
                            }
                            else {
                                let prevPuzzleWithDirections = [...puzzleWithDirections]
                                let fromIndex = startNode.y < endNode.y ? startNode.y : endNode.y;
                                let toIndex = startNode.y < endNode.y ? endNode.y : startNode.y;
                                for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                                    prevPuzzleWithDirections[i][startNode.x] = 22;
                                }
                                setPuzzleWithDirections(prevPuzzleWithDirections)
                            }
                        } else if (relationship.showBridges == 2) {
                            let index = bridges.indexOf(relationship);
                            let prev = [...bridges];
                            prev[index].showBridges = 0;
                            setBridges(prev)
                            if (startNode.y == endNode.y) {
                                let prevPuzzleWithDirections = [...puzzleWithDirections]
                                let fromIndex = startNode.x < endNode.x ? startNode.x : endNode.x;
                                let toIndex = startNode.x < endNode.x ? endNode.x : startNode.x;
                                for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                                    prevPuzzleWithDirections[startNode.y][i] = null;
                                }
                                setPuzzleWithDirections(prevPuzzleWithDirections)
                            }
                            else {
                                let prevPuzzleWithDirections = [...puzzleWithDirections]
                                let fromIndex = startNode.y < endNode.y ? startNode.y : endNode.y;
                                let toIndex = startNode.y < endNode.y ? endNode.y : startNode.y;
                                for (let i = fromIndex + 1; i < toIndex; i = i + 1) {
                                    prevPuzzleWithDirections[i][startNode.x] = null;
                                }
                                setPuzzleWithDirections(prevPuzzleWithDirections)
                            }
                        }
                    }
                    let drawPaths = findDrawPaths2(bridges, startNode.x, startNode.y);
                    drawPaths.forEach((elem) => {
                        let index = bridges.indexOf(elem);
                        let prev = [...bridges];
                        prev[index].showDrawPath = false;
                        setBridges(prev)
                    })
                    let CompletedCriclesPrev = [...CompletedCricles];
                    let startNodeDone = getNumberOfBuildPaths(bridges, startNode.x, startNode.y) >= puzzle[startNode.y][startNode.x]
                    let endNodeDone = getNumberOfBuildPaths(bridges, endNode.x, endNode.y) >= puzzle[endNode.y][endNode.x]
                    CompletedCriclesPrev[startNode.y][startNode.x] = startNodeDone
                    CompletedCriclesPrev[endNode.y][endNode.x] = endNodeDone
                    setCompletedCricles(CompletedCriclesPrev)
                    setEndNodeSelected(false);
                    setStartNodeSelected(false);
                    setEndNode(null);
                    setStartNode(null);
                    if (startNodeDone) {
                        CirclesRefs[startNode.y][startNode.x].style.backgroundColor = sudoku_colors.correct_number
                    } else {
                        CirclesRefs[startNode.y][startNode.x].style.backgroundColor = sudoku_colors.non_focus_section

                    }
                    if (endNodeDone) {
                        CirclesRefs[endNode.y][endNode.x].style.backgroundColor = sudoku_colors.correct_number
                    } else {
                        CirclesRefs[endNode.y][endNode.x].style.backgroundColor = sudoku_colors.non_focus_section
                    }
                }
            }
        }
    }, [endNodeSelected])
    const [startDrawingBridges, setStartDrawingBridges] = useState(false)
    useEffect(() => {
        if (startDrawingBridges) {
            drawBridges()
            setStartDrawingBridges(false);
        }
    }, [startDrawingBridges])


    useEffect(() => {
        if (isFlipped) {
            setBridges([])
            let prevPuzzleWithDirections = [...puzzleWithDirections]
            for (let y = 0; y < puzzleWithDirections.length; y = y + 1) {
                for (let x = 0; x < puzzleWithDirections[0].length; x = x + 1) {
                    prevPuzzleWithDirections[y][x] = puzzleSetting[y][x]
                }
            }
            setPuzzleWithDirections(prevPuzzleWithDirections)

            setCompletedCricles(new Array(size.height).fill(false).map(() => new Array(size.width).fill(false)))
            console.log("iuhihihihihuiuh")
            setPuzzle([...puzzleSetting])
            setStartDrawingBridges(true)
        }
    }, [isFlipped])

    const [issueMessageInternalModalIsOpen, setIssueMessageInternalModalIsOpen] = useState(false)
    function checkAtLeast2Nodes() {
        return puzzleSetting.reduce((l1, l2) => l1.concat(l2)).filter(x => x != null).length >= 2
    }
    const [issueMessageInternal, setInternalMessageInternal] = useState(false);
    const [submitPuzzleModalIsOpen, setSubmitPuzzleModalIsOpen] = useState(false);
    function handleComplete() {
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
        let allConnected = HashiConnectionChecker(puzzleWithDirections)
        if (allUsedInFull && !allConnected) {
            setInternalMessageInternal("Not all islands are interconnected");
            setIssueMessageInternalModalIsOpen(true);
        } else if (allUsedInFull && allConnected) {
            setSubmitPuzzleModalIsOpen(true)
        } else {
            setInternalMessageInternal("Puzzle is not solved");
            setIssueMessageInternalModalIsOpen(true);
        }
    }
    const [uploadStarted, setUploadStarted] = useState(false);
    const [uploadFinished, setUploadFinished] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const { user } = useSelector((state) => state.login);


    //History stack of layered state
    const history = useRef([]).current;
    const [popping, setPopping] = useState(false);
    useEffect(() => {
        if (isFlipped && !popping) {
            history.push({
                "bridges": JSON.parse(JSON.stringify(bridges)),
                "CompletedCricles": JSON.parse(JSON.stringify(CompletedCricles)),
                "puzzleWithDirections": JSON.parse(JSON.stringify(puzzleWithDirections)),
                "errorCicrles": JSON.parse(JSON.stringify(errorCicrles))
            })
        }
        setPopping(false);
    }, [puzzleWithDirections])
    function backState() {//Popping layered state from history
        if (isFlipped && history.length > 2) {
            console.log("here1", history)
            setPopping(true);
            history.pop();
            copyBridgesBackState(JSON.parse(JSON.stringify(history[history.length - 1].bridges)));
            setCompletedCricles(JSON.parse(JSON.stringify(history[history.length - 1].CompletedCricles)));
            setPuzzleWithDirections(JSON.parse(JSON.stringify(history[history.length - 1].puzzleWithDirections)));
            setErrorCircles(JSON.parse(JSON.stringify(history[history.length - 1].errorCicrles)));
        }
        else if (isFlipped && history.length == 2) {
            console.log("here2")
            setPopping(true);
            setCompletedCricles(puzzleSetting.map(row => row.map(x => false)))
            setPuzzleWithDirections(puzzleSetting.map(row => row.map(x => x)))
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
            ])
            setBridges(drawBridges())
            history.pop();
        }
    }
    function copyBridgesBackState(bridgesCopy) {
        let prevBridges = [...bridges];
        for (let i = 0; i < bridgesCopy.length; i = i + 1) {
            prevBridges[i].error = bridgesCopy[i].error
            prevBridges[i].isVertical = bridgesCopy[i].isVertical
            prevBridges[i].relationship = bridgesCopy[i].relationship
            prevBridges[i].showBridges = bridgesCopy[i].showBridges
            prevBridges[i].showDrawPath = bridgesCopy[i].showDrawPath
            prevBridges[i].error = bridgesCopy[i].error
        }
        setBridges(prevBridges)
    }
    function copyBridgesBackState2(newBridges, bridgesCopy) {
        let prevBridges = [...newBridges];
        for (let i = 0; i < bridgesCopy.length; i = i + 1) {
            prevBridges[i].error = bridgesCopy[i].error
            prevBridges[i].isVertical = bridgesCopy[i].isVertical
            prevBridges[i].relationship = bridgesCopy[i].relationship
            prevBridges[i].showBridges = bridgesCopy[i].showBridges
            prevBridges[i].showDrawPath = bridgesCopy[i].showDrawPath
            prevBridges[i].error = bridgesCopy[i].error
        }
        setBridges(prevBridges)
    }
    useEffect(() => {
        function handleResize() {
            let oldBridges = JSON.parse(JSON.stringify(bridges))
            console.log("here")
            let newBridges = drawBridges();
            copyBridgesBackState2(newBridges, oldBridges)
        }
        window.addEventListener('resize', handleResize)
    })

    return (
        <>
            <Modal
                isOpen={quitModalIsOpen}
                ariaHideApp={false}
                onRequestClose={() => setQuitModalIsOpen(false)}
                style={modal_content}
            > {/*Modal for exiting screen */}
                <span style={modal_label}>Are you sure you want to exit?</span>
                <HomeButtonPlain style={{ alignSelf: 'center', marginTop: 20 }} label={"Yes"} />
            </Modal>
            <Modal
                isOpen={issueMessageInternalModalIsOpen}
                ariaHideApp={false}
                onRequestClose={() => setIssueMessageInternalModalIsOpen(false)}
                style={modal_content}
            > {/*Modal for exiting screen */}
                <span style={modal_label}>{issueMessageInternal}</span>
                <div style={{ margin: margins.small }} />
                <GeneralButton label={"OK"} handleButtonPress={() => setIssueMessageInternalModalIsOpen(false)} />
            </Modal>
            <Modal
                isOpen={submitPuzzleModalIsOpen}
                ariaHideApp={false}
                style={modal_content}
            >{/*Modal for submitting puzzle to db */}
                {!uploadStarted ?
                    <>
                        <span style={modal_label}>You have completed puzzle creation, you can upload it and download file.</span>
                        <GeneralButton style={GeneralModalButtonStyle} handleButtonPress={async () => {
                            setUploadStarted(true);
                            const myJSON = {
                                "puzzle-type": "hashi",
                                "values": puzzle,
                                "solution": puzzleWithDirections,
                                "creator-id": user.userID,
                            }
                            //Uploading puzzle to db
                            let upload_result = await fetch(`${process.env.REACT_APP_BACKEND_URL}hashi/add_hashi_puzzle/`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                withCredentials: true,
                                credentials: "include",
                                body: JSON.stringify(myJSON)
                            }).then(response => {
                                return response.json();
                            }).catch(err => console.log(err));
                            console.log(upload_result)
                            setUploadMessage(upload_result.message);
                            setUploadFinished(true);
                            console.log(upload_result);
                            //Downloading puzzle as file if puzzle was accpeted
                            if (upload_result.added && !upload_result.puzzle_exists) {
                                const fileData = JSON.stringify(upload_result.new_puzzle);
                                const blob = new Blob([fileData], { type: "text/plain" });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.download = "hashi.json";
                                link.href = url;
                                link.click();
                            }
                        }} label={"Submit"} />
                    </>
                    :
                    !uploadFinished ?
                        <CustomProgress />
                        :
                        <>
                            <span style={modal_label}>{uploadMessage}</span>
                            <HomeButtonPlain style={{ alignSelf: 'center', marginTop: 20 }} label={"Go Home"} />
                        </>
                }
            </Modal>
            <MainPageContainer image_back={hahsi_image}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <HomeButton handleHomeButton={handleHomeButton} />
                </div>
                <div style={{ flex: 5, display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>

                    {isMounted ?
                        <>
                            <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical" >
                                <HashiGridForCreation setPuzzleSetting={setPuzzleSetting} puzzleSetting={puzzleSetting} puzzleHeight={size.height} puzzleWidth={size.width} />
                                <>
                                    <HashiGrid accordingToSolution={false} errorCicrles={errorCicrles} puzzle={puzzle} CirclesRefs={CirclesRefs} CompletedCricles={CompletedCricles} setStartNode={setStartNode} setEndNode={setEndNode} startNodeSelected={startNodeSelected} setStartNodeSelected={setStartNodeSelected} findDoneRelationShips={findDoneRelationShips} bridges={bridges} setBridges={setBridges} findDrawPaths={findDrawPaths} setEndNodeSelected={setEndNodeSelected} puzzleHeight={size.height} puzzleWidth={size.width} />
                                    {bridges.map((elem) => {
                                        if (elem.showBridges == 0) {
                                            if (elem.showDrawPath) {
                                                return (
                                                    <>
                                                        <DrawPath width={elem.drawPathProps.width} height={elem.drawPathProps.height} startX={elem.drawPathProps.startX} startY={elem.drawPathProps.startY} draw={draw} startNode={startNode} relationship={elem.relationship} isVertical={elem.isVertical} />
                                                        {elem.none}
                                                    </>
                                                )
                                            } else {
                                                return elem.none
                                            }
                                        } else if (elem.showBridges == 1) {
                                            if (elem.showDrawPath) {
                                                return (
                                                    <>
                                                        <DrawPath width={elem.drawPathProps.width} height={elem.drawPathProps.height} startX={elem.drawPathProps.startX} startY={elem.drawPathProps.startY} draw={draw} startNode={startNode} relationship={elem.relationship} isVertical={elem.isVertical} />
                                                        {elem.error && false ?
                                                            elem.oneBridgeError
                                                            :
                                                            elem.oneBridge}
                                                    </>
                                                )
                                            } else {
                                                return elem.error && false ?
                                                    elem.oneBridgeError
                                                    :
                                                    elem.oneBridge
                                            }
                                        } else if (elem.showBridges == 2) {
                                            if (elem.showDrawPath) {
                                                return (
                                                    <>
                                                        <DrawPath width={elem.drawPathProps.width} height={elem.drawPathProps.height} startX={elem.drawPathProps.startX} startY={elem.drawPathProps.startY} draw={draw} startNode={startNode} relationship={elem.relationship} isVertical={elem.isVertical} />
                                                        {elem.error && false ?
                                                            elem.twoBridgesError
                                                            :
                                                            elem.twoBridges}
                                                    </>
                                                )
                                            } else {
                                                return elem.error && false ?
                                                    elem.twoBridgesError
                                                    :
                                                    elem.twoBridges
                                            }
                                        }
                                    })}
                                </>
                            </ReactCardFlip>
                            {!isFlipped ? <NumberPanelComponent /> : <PanelComponent backState={backState} />}
                            {/* <div style={{width:100,height:100,backgroundColor:'red',position:"absolute", top:(184+26)}}/> */}
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "20%", alignItems: 'center' }}>
                                <GeneralButton style={{ marginBottom: margins.lrg }} handleButtonPress={() => {
                                    if (checkAtLeast2Nodes()) {
                                        setIsFlipped(!isFlipped)
                                    } else {
                                        setInternalMessageInternal("The puzzle must have at least 2 nodes.")
                                        setIssueMessageInternalModalIsOpen(true);
                                    }
                                }} label={isFlipped ? "Switch to creating" : "Switch to creating solution"} />
                                {isFlipped && <GeneralButton handleButtonPress={() => handleComplete()} label={"Complete"} />}
                            </div>
                        </>
                        :
                        <CustomProgress />
                    }
                </div>
            </MainPageContainer>
        </>
    );
}