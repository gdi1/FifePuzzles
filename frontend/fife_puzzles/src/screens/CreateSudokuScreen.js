import ReactCardFlip from 'react-card-flip';
import { useState, useRef, useEffect } from 'react'
import HomeButton from '../components/HomeButton';
import HomeButtonPlain from '../components/HomeButtonPlain';
import Modal from 'react-modal';
import Sudoku from '../sudoku-components/Sudoku';
import { Touchable, TouchableOpacity } from 'react-native-web';
import GeneralButton from '../components/GeneralButton';
import NumberPanelComponent from '../sudoku-components/NumberPanelComponent';
import SudokuPuzzleCreationPanel from '../sudoku-components/SudokuPuzzleCreationPanel';
import { useNavigate } from "react-router-dom";
import MainPageContainer from "../components/MainPageContainer";
import margins from '../style-utils/margins';
import { GeneralModalButtonStyle, modal_content, modal_label } from '../inline-styles/modal'
import sudoku_image from "../images/sudoku_image.jpg"
import CustomProgress from "../components/CustomProgress"
import { useSelector } from 'react-redux';
//Base code for card flip is taken from:
//Unknown. 2022. react-card-flip. npm. https://www.npmjs.com/package/react-card-flip
//This screen is for creation of puzzle
export default function CreateSudokuScreen() {
    //Controll booleans for upload
    const [uploadStarted, setUploadStarted] = useState(false);
    const [uploadFinished, setUploadFinished] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    //Current user
    const { user } = useSelector((state) => state.login);
    let navigate = useNavigate();
    //Size of puzzle
    const size = useRef(3).current;
    //Array that allows to convert a number from 0 - 9 to coordinates
    const numToGrid = useRef(new Array(size).fill(0).map((row, rowIndex) => new Array(size).fill(0).map((col, colIndex) => { return { x: colIndex, y: rowIndex } })).reduce((row1, row2) => { return row1.concat(row2) })).current;
    //Required size for sudoku grid
    const [neededHeight, setNeededHeight] = useState(0);
    //Boolean to not push changes to state while checking the move
    const [checking, setChecking] = useState(false);
    //Stack of states in solution
    const history = useRef([]).current;
    //Boolean to not push changes to state while popping state
    const [popping, setPopping] = useState(false);
    //Notes mode boolean
    const [pencil, setPencil] = useState(false);
    //Selected cell coordinates
    const [selectedCell, setSelectedCell] = useState(0);

    //Layered state of solution:
    //Notes numbers in a cell in a mini-grid
    const [pencilNumbers, setPencilNumbers] = useState(new Array(size * size).fill(0).map(() => new Array(size * size).fill(0).map(() => new Array(size).fill(0).map(() => new Array(size).fill(0)))));
    //Chosen numbers that are not notes
    const [selectedNumbers, setSelectedNumbers] = useState(new Array(size * size).fill(0).map(() => new Array(size * size).fill(0)));
    //Booleans for which cells are invalid
    const [errorNumbers, setErrorNumbers] = useState(new Array(size * size).fill(0).map(() => new Array(size * size).fill(false)));
    //Booleans to either display notes or selected number
    const [displaySelectedNumbers, setDisplaySelectedNumbers] = useState(new Array(size * size).fill(0).map(() => new Array(size * size).fill(true)));

    //Stack of states in puzzle
    const historyPuzzle = useRef([]).current;
    //Boolean to not push changes to state while popping state
    const [poppingPuzzle, setPoppingPuzzle] = useState(false);
    //Notes mode boolean
    const [pencilPuzzle, setPencilPuzzle] = useState(false);
    //Selected cell coordinates
    const [selectedCellPuzzle, setSelectedCellPuzzle] = useState(0);
    //Layered state of solution:
    //Notes numbers in a cell in a mini-grid
    const [pencilNumbersPuzzle, setPencilNumbersPuzzle] = useState(new Array(size * size).fill(0).map(() => new Array(size * size).fill(0).map(() => new Array(size).fill(0).map(() => new Array(size).fill(0)))));
    //Chosen numbers that are not notes
    const [selectedNumbersPuzzle, setSelectedNumbersPuzzle] = useState(new Array(size * size).fill(0).map(() => new Array(size * size).fill(0)));
    //Booleans for which cells are invalid
    const [errorNumbersPuzzle, setErrorNumbersPuzzle] = useState(new Array(size * size).fill(0).map(() => new Array(size * size).fill(false)));
    //Booleans to either display notes or selected number
    const [displaySelectedNumbersPuzzle, setDisplaySelectedNumbersPuzzle] = useState(new Array(size * size).fill(0).map(() => new Array(size * size).fill(true)));


    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        //If a solver, navigate back home, because solvers are no allowed
        if (user.role == "solver") {
            navigate('/')
        }
        setIsMounted(true);
    }, []);


    //Adding state to solution stack when changes made
    useEffect(() => {
        if (isMounted) {
            if (!popping && !checking) {
                history.push({
                    displaySelectedNumbers: JSON.parse(JSON.stringify(displaySelectedNumbers)),
                    errorNumbers: JSON.parse(JSON.stringify(errorNumbers)),
                    selectedNumbers: JSON.parse(JSON.stringify(selectedNumbers)),
                    pencilNumbers: JSON.parse(JSON.stringify(pencilNumbers)),
                })
            }
            console.log(history);
            setPopping(false);
        }
    }, [selectedNumbers, displaySelectedNumbers, errorNumbers, pencilNumbers, isMounted])
    //If check is invoked ,check grid
    useEffect(() => {
        if (checking) {
            checkErrorsOnField()
        }
        setChecking(false);
    }, [checking])
    //Adding state to puzzle stack when changes made
    useEffect(() => {
        if (isMounted && !poppingPuzzle) {

            historyPuzzle.push({
                displaySelectedNumbers: JSON.parse(JSON.stringify(displaySelectedNumbersPuzzle)),
                errorNumbers: JSON.parse(JSON.stringify(errorNumbersPuzzle)),
                selectedNumbers: JSON.parse(JSON.stringify(selectedNumbersPuzzle)),
                pencilNumbers: JSON.parse(JSON.stringify(pencilNumbersPuzzle)),
            })
        }
        setPoppingPuzzle(false);
    }, [selectedNumbersPuzzle, displaySelectedNumbersPuzzle, errorNumbersPuzzle, pencilNumbersPuzzle])

    //Setting needed height
    useEffect(() => {
        if (isMounted) {
            setNeededHeight(mainDiv.current.clientHeight);
        }
    }, [isMounted])

    //Controll for flipping card (solution/puzzle)
    const mainDiv = useRef(null);
    const [isFlipped, setIsFlipped] = useState(false);

    //Controll booleans for modals
    const [quitModalIsOpen, setQuitModalIsOpen] = useState(false);
    const [solutionIncompleteModalIsOpen, setSolutionIncompleteModalIsOpen] = useState(false);
    const [badPuzzleModalIsOpen, setBadPuzzleModalIsOpen] = useState(false);
    const [submitPuzzleModalIsOpen, setSubmitPuzzleModalIsOpen] = useState(false);
    //Opening quit modal when going home is requested
    function handleHomeButton() {
        setQuitModalIsOpen(true);
    }
    //Handling request to complete puzzle
    function handleComplete() {
        //Checking if puzzle has at least one empty field
        if ((selectedNumbersPuzzle.reduce((row1, row2) => { return row1.concat(row2) }).filter((item) => { if (item !== 0) { return item } }).length === size * size * size * size)) {
            //Opening bad puzzle modal
            setBadPuzzleModalIsOpen(true);
        } else {
            setIsFocusActivePuzzle(false);
            setIsFocusActiveSolution(false);
            //Opening submit modal
            setSubmitPuzzleModalIsOpen(true);
        }
    }
    //Handling flip to creating puzzle
    function handleFlip() {
        if (!victoryCheck()) {//Checking if solution is valid
            setSolutionIncompleteModalIsOpen(true)//Opening solution incomplete modal
            if (!isFlipped) {
                setSelectedNumbersPuzzle(selectedNumbers.map(x => x.map(x => x)));
            }
        } else {
            //If solution is valid
            if (!isFlipped) {
                setSelectedCellPuzzle({ x: 0, y: 0 })
                setIsFocusActivePuzzle(true);
                setIsFocusActiveSolution(false);
                setSelectedNumbersPuzzle(selectedNumbers.map(x => x.map(x => x)));//Copy all solution values into puzzle
            } else {
                setIsFocusActivePuzzle(false);
                setIsFocusActiveSolution(true);
            }
            setIsFlipped(!isFlipped);//Flip to creating puzzle
        }
    }
    //Handling pop state of solution
    function backState() {
        if (history.length > 1) {
            setPopping(true);
            history.pop();
            setDisplaySelectedNumbers(JSON.parse(JSON.stringify(history[history.length - 1].displaySelectedNumbers)))
            setErrorNumbers(JSON.parse(JSON.stringify(history[history.length - 1].errorNumbers)))
            setSelectedNumbers(JSON.parse(JSON.stringify(history[history.length - 1].selectedNumbers)))
            setPencilNumbers(JSON.parse(JSON.stringify(history[history.length - 1].pencilNumbers)))
        }
    }
    //Handling pop state of puzzle
    function backStatePuzzle() {
        if (historyPuzzle.length > 1) {
            setPoppingPuzzle(true);
            historyPuzzle.pop();
            setDisplaySelectedNumbersPuzzle(JSON.parse(JSON.stringify(historyPuzzle[historyPuzzle.length - 1].displaySelectedNumbers)))
            setErrorNumbersPuzzle(JSON.parse(JSON.stringify(historyPuzzle[historyPuzzle.length - 1].errorNumbers)))
            setSelectedNumbersPuzzle(JSON.parse(JSON.stringify(historyPuzzle[historyPuzzle.length - 1].selectedNumbers)))
            setPencilNumbersPuzzle(JSON.parse(JSON.stringify(historyPuzzle[historyPuzzle.length - 1].pencilNumbers)))
        }
    }
    //Setting selected number on solution grid with key board
    function handleKeyDownSolution(event) {
        let allowedNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        let key = event.key;
        if (allowedNumbers.includes(key)) {
            setSelectedNumber(parseInt(key));
        } else if (key == "Backspace") {
            setSelectedNumber(0);
        }
    }
    //Setting selected number on puzzle grid with key board
    function handleKeyDownPuzzle(event) {
        let key = event.key;
        if (key == "Backspace") {
            setSelectedNumberPuzzle(0);
        }
    }

    //Setting selected number on solution grid
    function setSelectedNumber(number) {
        console.log(number)
        if (selectedCell != 0) {//If there is a selected cell
            if (!pencil) {//Non-notes mode

                //If number is not "erase", display selected number and set number in the grid
                if (number != 0) {
                    setDisplaySelectedNumbers(prev => {
                        let copy = [...prev];
                        copy[selectedCell.x][selectedCell.y] = true;
                        return copy;
                    });
                    setSelectedNumbers(prev => {
                        let copy = [...prev];
                        copy[selectedCell.x][selectedCell.y] = number;
                        return copy;
                    });

                }
                if (number == 0) {//if want to empty the cell, errase number and check values
                    setSelectedNumbers(prev => {
                        let copy = [...prev];
                        copy[selectedCell.x][selectedCell.y] = 0;
                        return copy;
                    });
                    checkErrorsOnField();
                }


                // If there is a number to put and it is not same number
                if (number != 0) {
                    // Update notes on row and column
                    for (let i = 0; i < size * size; i = i + 1) {
                        if (pencilNumbers[selectedCell.x][i][numToGrid[number - 1].x][numToGrid[number - 1].y] == number) {
                            setPencilNumbers(prev => {
                                let copy = [...prev];
                                copy[selectedCell.x][i][numToGrid[number - 1].x][numToGrid[number - 1].y] = 0;
                                return copy;
                            });
                        }
                        if (pencilNumbers[i][selectedCell.y][numToGrid[number - 1].x][numToGrid[number - 1].y] == number) {
                            setPencilNumbers(prev => {
                                let copy = [...prev];
                                copy[i][selectedCell.y][numToGrid[number - 1].x][numToGrid[number - 1].y] = 0;
                                return copy;
                            });
                        }
                    }

                    // Update note on mini grid
                    for (let x = Math.floor(selectedCell.x / size) * size; x < Math.floor(selectedCell.x / size) * size + size; x = x + 1) {
                        for (let y = Math.floor(selectedCell.y / size) * size; y < Math.floor(selectedCell.y / size) * size + size; y = y + 1) {
                            if (pencilNumbers[x][y][numToGrid[number - 1].x][numToGrid[number - 1].y] == number) {
                                setPencilNumbers(prev => {
                                    let copy = [...prev];
                                    copy[x][y][numToGrid[number - 1].x][numToGrid[number - 1].y] = 0;
                                    return copy;
                                });
                            }
                        }
                    }
                    // Checking errors on field
                    let containsInRow = rowContains(number, selectedCell.x, selectedCell.y);
                    let containsInCol = colContains(number, selectedCell.x, selectedCell.y);
                    let containsInMiniGrid = miniGridContains(number, selectedCell.x, selectedCell.y);
                    if ((containsInRow || containsInCol || containsInMiniGrid)) {
                        setErrorNumbers(prev => {
                            let copy = [...prev];
                            copy[selectedCell.x][selectedCell.y] = true;
                            return copy;
                        });
                    } else {
                        setErrorNumbers(prev => {
                            let copy = [...prev];
                            copy[selectedCell.x][selectedCell.y] = false;
                            return copy;
                        });
                    }
                    setChecking(true);
                } else {//update that this number is not an error.
                    setErrorNumbers(prev => {
                        let copy = [...prev];
                        copy[selectedCell.x][selectedCell.y] = false;
                        return copy;
                    });
                }

            } else {//If notes mode
                setDisplaySelectedNumbers(prev => {//Display notes in cell
                    let copy = [...prev];
                    copy[selectedCell.x][selectedCell.y] = false;
                    return copy;
                });
                //Errase if same number in notes
                if (pencilNumbers[selectedCell.x][selectedCell.y][numToGrid[number - 1].x][numToGrid[number - 1].y] == number) {
                    setPencilNumbers(prev => {
                        let copy = [...prev];
                        copy[selectedCell.x][selectedCell.y][numToGrid[number - 1].x][numToGrid[number - 1].y] = 0;
                        return copy;
                    });
                } else {//Put selected number in notes
                    setPencilNumbers(prev => {
                        let copy = [...prev];
                        copy[selectedCell.x][selectedCell.y][numToGrid[number - 1].x][numToGrid[number - 1].y] = number;
                        return copy;
                    });
                }
            }
        }
    }
    //Errases numbers on puzzle grid
    function setSelectedNumberPuzzle(number) {
        if (selectedCell != 0) {//If there is a selected cell
            setSelectedNumbersPuzzle(prev => {//Errase number from selected cell
                let copy = [...prev];
                copy[selectedCellPuzzle.x][selectedCellPuzzle.y] = 0;
                return copy;
            });
        }
    }
    //Checking error on a selected cell
    function checkErrorsOnField() {
        for (let x = 0; x < size * size; x = x + 1) {
            for (let y = 0; y < size * size; y = y + 1) {
                if (selectedNumbers[x][y] !== 0) {
                    let containsInRow = rowContains(selectedNumbers[x][y], x, y);
                    let containsInCol = colContains(selectedNumbers[x][y], x, y);
                    let containsInMiniGrid = miniGridContains(selectedNumbers[x][y], x, y);
                    if ((containsInRow || containsInCol || containsInMiniGrid)) {
                        setErrorNumbers(prev => {
                            let copy = [...prev];
                            copy[x][y] = true;
                            return copy;
                        });
                    } else {
                        setErrorNumbers(prev => {
                            let copy = [...prev];
                            copy[x][y] = false;
                            return copy;
                        });
                    }
                }
            }
        }
    }
    //Checking if row contains same number
    function rowContains(number, selectedX, selectedY) {
        for (let col = 0; col < (size * size); col = col + 1) {
            if ((selectedNumbers[col][selectedY] == number) && (col != selectedX)) {
                return true;
            }
        }
        return false;
    }
    //Checking if column contains same number
    function colContains(number, selectedX, selectedY) {
        for (let row = 0; row < size * size; row = row + 1) {
            if ((selectedNumbers[selectedX][row] == number) && (row != selectedY)) {
                return true;
            }
        }
        return false;
    }
    //Checking if 3x3 grid contains same number
    function miniGridContains(number, selectedX, selectedY) {
        for (let x = Math.floor(selectedX / size) * size; x < Math.floor(selectedX / size) * size + size; x = x + 1) {
            for (let y = Math.floor(selectedY / size) * size; y < Math.floor(selectedY / size) * size + size; y = y + 1) {
                if ((selectedNumbers[x][y] == number) && ((x != selectedX) && (y != selectedY))) {
                    return true;
                }
            }
        }
        return false;
    }
    //Checking if solution is complete
    function victoryCheck() {
        return (errorNumbers.reduce((row1, row2) => { return row1.concat(row2) }).filter((item) => { if (item) { return item } }).length == 0)
            && (selectedNumbers.reduce((row1, row2) => { return row1.concat(row2) }).filter((item) => { if (item !== 0) { return item } }).length === size * size * size * size);
    }
    //Using different keydown handlers depending on card side
    const [isFocusActivePuzzle, setIsFocusActivePuzzle] = useState(false);
    const [isFocusActiveSolution, setIsFocusActiveSolution] = useState(true);
    return (
        <MainPageContainer image_back={sudoku_image}> {/*Main container */}
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
                isOpen={solutionIncompleteModalIsOpen}
                ariaHideApp={false}
                onRequestClose={() => setSolutionIncompleteModalIsOpen(false)}
                style={modal_content}
            >{/*Modal for incomlete solution error  */}
                <span style={modal_label}>Solution is either incomplete or has errors</span>
                <GeneralButton style={GeneralModalButtonStyle} handleButtonPress={() => { setSolutionIncompleteModalIsOpen(false) }} label={"OK"} />
            </Modal>
            <Modal
                isOpen={badPuzzleModalIsOpen}
                ariaHideApp={false}
                onRequestClose={() => setBadPuzzleModalIsOpen(false)}
                style={modal_content}
            >{/*Modal for incorrect puzzle error  */}
                <span style={modal_label}>Puzzle must contain at least 1 empty cell and only one solution</span>
                <GeneralButton style={GeneralModalButtonStyle} handleButtonPress={() => { setBadPuzzleModalIsOpen(false) }} label={"OK"} />
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
                                "puzzle-type": "sudoku",
                                "values": selectedNumbersPuzzle.map((row,rowIndex)=>row.map((cell,cellIndex)=>selectedNumbersPuzzle[cellIndex][rowIndex])),
                                "solution": selectedNumbers.map((row,rowIndex)=>row.map((cell,cellIndex)=>selectedNumbers[cellIndex][rowIndex])),
                                "creator-id": user.userID,
                            }
                            console.log(myJSON)
                            //Uploading puzzle to db
                            let upload_result = await fetch(`${process.env.REACT_APP_BACKEND_URL}sudoku/add_sudoku_puzzle/`, {
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
                            setUploadMessage(upload_result.message);
                            setUploadFinished(true);
                            console.log(upload_result);
                            //Downloading puzzle as file if puzzle was accpeted
                            if (upload_result.added && !upload_result.puzzle_exists) {
                                const fileData = JSON.stringify(upload_result.new_puzzle);
                                const blob = new Blob([fileData], { type: "text/plain" });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.download = "sudoku.json";
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
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <HomeButton handleHomeButton={handleHomeButton} />
            </div>
            <div ref={mainDiv} style={{ display: 'flex', flex: 5, justifyContent: 'space-evenly', alignItems: 'center', flexDirection: "row" }}>
                <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal" >
                    <Sudoku isFocusActive={isFocusActiveSolution} handleKeyDown={handleKeyDownSolution} heightRef={neededHeight} pencilNumbers={pencilNumbers} selectedNumbers={selectedNumbers} errorNumbers={errorNumbers} displaySelectedNumbers={displaySelectedNumbers} selectedCell={selectedCell} setSelectedCell={setSelectedCell} gridSize={size} pencil={pencil} />

                    <Sudoku isFocusActive={isFocusActivePuzzle} handleKeyDown={handleKeyDownPuzzle} heightRef={neededHeight} pencilNumbers={pencilNumbersPuzzle} selectedNumbers={selectedNumbersPuzzle} errorNumbers={errorNumbersPuzzle} displaySelectedNumbers={displaySelectedNumbersPuzzle} selectedCell={selectedCellPuzzle} setSelectedCell={setSelectedCellPuzzle} gridSize={size} pencil={pencilPuzzle} />

                </ReactCardFlip>

                {!isFlipped ?
                    <NumberPanelComponent setPencil={setPencil} pencil={pencil} setSelectedNumber={setSelectedNumber} backState={backState} />
                    :
                    <SudokuPuzzleCreationPanel setSelectedNumber={setSelectedNumberPuzzle} backState={backStatePuzzle} />
                }

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "20%", alignItems: 'center' }}>
                    <GeneralButton style={{ marginBottom: margins.lrg }} handleButtonPress={() => handleFlip()} label={isFlipped ? "Switch to creating solution" : "Switch to creating puzzle"} />
                    {isFlipped && <GeneralButton handleButtonPress={() => handleComplete()} label={"Complete"} />}
                </div>
            </div>
        </MainPageContainer>
    );
}