import ReactCardFlip from 'react-card-flip';
import { useState, useRef, useEffect } from 'react'
import HomeButton from '../components/HomeButton';
import HomeButtonPlain from '../components/HomeButtonPlain';
import Modal from 'react-modal';
import CircularProgress from '@mui/material/CircularProgress';
import Sudoku from '../sudoku-components/Sudoku';
import { Touchable, TouchableOpacity } from 'react-native-web';
import GeneralButton from '../components/GeneralButton';
import NumberPanelComponent from '../sudoku-components/NumberPanelComponent';
import SudokuPuzzleCreationPanel from '../sudoku-components/SudokuPuzzleCreationPanel';
import { useNavigate } from "react-router-dom";
import MainPageContainer from "../components/MainPageContainer";
import margins from '../style-utils/margins';
import { GeneralModalButtonStyle, modal_content, modal_label } from '../inline-styles/modal'
import image_8spuzzle from "../images/image_8spuzzle.jpg"
import CustomProgress from "../components/CustomProgress"
import { useSelector } from 'react-redux';
import colors from "../style-utils/colors";

import radiuses from "../style-utils/radiuses";
import text_styles from "../style-utils/text_styles";
import Puzzle8sGrid from '../8s_puzzle_components/Puzzle8sGrid';
import sudoku_colors from '../style-utils/sudoku_colors';
import PanelComponentCreation from '../8s_puzzle_components/PanelComponentCreation';
import paddings from '../style-utils/paddings';

//Base code for card flip is taken from:
//Unknown. 2022. react-card-flip. npm. https://www.npmjs.com/package/react-card-flip
//This screen is for creation of puzzle
export default function CreatePuzzle8sScreen() {
    //Controll booleans for upload
    const [uploadStarted, setUploadStarted] = useState(false);
    const [uploadFinished, setUploadFinished] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    //Current user
    const { user } = useSelector((state) => state.login);
    let navigate = useNavigate();


    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        //If a solver, navigate back home, because solvers are no allowed
        if (user.role == "solver") {
            navigate('/')
        }
        setIsMounted(true);
    }, []);


    //Controll booleans for modals
    const [quitModalIsOpen, setQuitModalIsOpen] = useState(false);
    const [badPuzzleModalIsOpen, setBadPuzzleModalIsOpen] = useState(false);
    const [submitPuzzleModalIsOpen, setSubmitPuzzleModalIsOpen] = useState(false);
    //Opening quit modal when going home is requested
    function handleHomeButton() {
        setQuitModalIsOpen(true);
    }

    function handleComplete() {
        if (victoryCheck()) {
            setBadPuzzleModalIsOpen(true);
        } else {
            setSubmitPuzzleModalIsOpen(true);
        }
    }

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
                    return { x: x, y: y }
                }
            }
        }
    }
    const historyStack=useRef([]).current;
    const forwardHistoryStack=useRef([]).current;
    const [movementInAction,setMovementInAction]=useState(false)
    function handle8sClick(gridRowIndex, gridCellIndex,isPoppingFunc,moveHelp) {
        let nullCoords = findNULLCell()
        let yDiff = Math.abs(gridRowIndex - nullCoords.y);
        let xDiff = Math.abs(gridCellIndex - nullCoords.x);
        if ((yDiff == 0 && xDiff == 1) || (yDiff == 1 && xDiff == 0)) {
            
            if(!movementInAction){

                setMovementInAction(true);

                let whatToMove = NumberRefs[gridRowIndex][gridCellIndex];
                let whereToMove = CellsRefs[nullCoords.y][nullCoords.x];
                if(isPoppingFunc||moveHelp){
                    whatToMove.style.backgroundColor=sudoku_colors.focus_cell
                    whereToMove.style.backgroundColor=sudoku_colors.same_number
                }

                let newLeftPos = whereToMove.offsetLeft;
                let oldLeftPos = whatToMove.offsetLeft;
                let newTopPos = whereToMove.offsetTop;
                let oldTopPos = whatToMove.offsetTop;

                let translateX = newLeftPos - oldLeftPos + whereToMove.clientLeft;
                let translateY = newTopPos - oldTopPos - whereToMove.clientTop;

                let neededWidth = whatToMove.clientWidth-whatToMove.offsetWidth
                let neededHeight = whatToMove.clientHeight-whatToMove.offsetHeight

                whatToMove.style.width = `${neededWidth}px`
                whatToMove.style.height = `${neededHeight}px`

                let animation = new Animation(new KeyframeEffect(
                    whatToMove,
                    [
                        { transform: `translate(${translateX}px,${translateY}px)` },
                    ], {
                    duration: 500,
                    fill: 'forwards'
                }))

                animation.onfinish = () => {

                    const puzzlePrev=[...puzzle];
                    puzzlePrev[nullCoords.y][nullCoords.x]=puzzlePrev[gridRowIndex][gridCellIndex];
                    puzzlePrev[gridRowIndex][gridCellIndex]=null
                    setPuzzle(puzzlePrev)
                    let showPartsPrev=[...showParts];
                    showPartsPrev[gridRowIndex][gridCellIndex]=false;
                    showPartsPrev[nullCoords.y][nullCoords.x]=true;
                    setShowParts(showPartsPrev)

                    if(!isPoppingFunc){
                        historyStack.push(nullCoords)
                    }
                    if(isPoppingFunc||moveHelp){
                        whereToMove.style.backgroundColor=sudoku_colors.non_focus_section
                    }
                    setMovementInAction(false);
                    setLoadingDifficulty(true)
                }
                animation.play();
            }
            
        }
    }
    const [puzzle,setPuzzle] = useState([[1, 2, 3], [4, 5, 6], [7, 8, null]])
    const [showParts,setShowParts] = useState([[1, 2, 3], [4, 5, 6], [7, 8, null]].map((row)=>row.map((cell)=>cell==null? false : true)));
    const CellsRefs = useRef([[null, null, null], [null, null, null], [null, null, null]]).current;
    const NumberRefs = useRef([[null, null, null], [null, null, null], [null, null, null]]).current;
    const winningSituation = useRef([[1, 2, 3], [4, 5, 6], [7, 8, null]]).current

    function backState(){
        if(historyStack.length!=0){
            let move=historyStack.pop()
            handle8sClick(move.y,move.x,true,false)
            forwardHistoryStack.push(findNULLCell())
        }
    }
    function frontState(){
        if(forwardHistoryStack.length!=0){
            let move=forwardHistoryStack.pop()
            handle8sClick(move.y,move.x,true,false)
            historyStack.push(findNULLCell())

        }
    }
    
    const [currentDifficulty,setCurrentDifficulty]=useState(1)
    const [loadingDifficulty,setLoadingDifficulty]=useState(false);
    useEffect(()=>{(async ()=>{
        if(loadingDifficulty){
            await getDifficultyFromRoute();
        }
    })()},[loadingDifficulty])
    async function getDifficultyFromRoute(){
        let result = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}eights_puzzle/get_difficulty/`,
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
            setCurrentDifficulty(result.difficulty)
            setLoadingDifficulty(false)
    }
    return (
        <MainPageContainer image_back={image_8spuzzle}> {/*Main container */}
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
                isOpen={badPuzzleModalIsOpen}
                ariaHideApp={false}
                onRequestClose={() => setBadPuzzleModalIsOpen(false)}
                style={modal_content}
            >{/*Modal for incorrect puzzle error  */}
                <span style={modal_label}>You must move at least one number!</span>
                <GeneralButton style={GeneralModalButtonStyle} handleButtonPress={() => { setBadPuzzleModalIsOpen(false) }} label={"OK"} />
            </Modal>
            <Modal
                isOpen={submitPuzzleModalIsOpen}
                ariaHideApp={false}
                onRequestClose={() => setSubmitPuzzleModalIsOpen(false)}
                style={modal_content}
            >{/*Modal for submitting puzzle to db */}
                {!uploadStarted ?
                    <>
                        <span style={modal_label}>You have completed puzzle creation, you can upload it and download file.</span>
                        <GeneralButton style={GeneralModalButtonStyle} handleButtonPress={async () => {
                            setUploadStarted(true);
                            const myJSON = {
                                "puzzle-type": "8s_puzzle",
                                "values": puzzle,
                                "creator-id": user.userID,
                                "checker-id": user.userID,
                            }
                            //Uploading puzzle to db
                            let upload_result = await fetch(`${process.env.REACT_APP_BACKEND_URL}eights_puzzle/add_eights_puzzle/`, {
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
                            // Downloading puzzle as file if puzzle was accpeted
                            if (upload_result.added && !upload_result.puzzle_exists) {
                                const fileData = JSON.stringify(upload_result.new_puzzle);
                                const blob = new Blob([fileData], { type: "text/plain" });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.download = "puzzle8s.json";
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
            <div style={{ display: 'flex', flex: 5, justifyContent: 'space-evenly', alignItems: 'center', flexDirection: "row" }}>
                <Puzzle8sGrid puzzle={puzzle} showParts={showParts} handle8sClick={handle8sClick} NumberRefs={NumberRefs} CellsRefs={CellsRefs} />
                <div style={{width:'20%', display:'flex', flexDirection:'column', justifyContent:'center'}}>
                    <div style={{display:'flex',justifyContent:'center',marginBottom : 60,background: 'linear-gradient(rgba(0, 0, 0, 0.681), rgba(0, 0, 0, 0.68))',borderRadius: radiuses.xxxlrg, padding:paddings.lrg}}>
                        
                        <span style={{ color: `#${colors.chocolate}`,fontWeight: 'bold',fontSize: text_styles.resizbale_font.small_med, margin: margins.lrg}}>Current difficulty: {loadingDifficulty?  <CircularProgress style={{alignSelf:'center',marginLeft: margins.lrg, width: 30, height: 30, color: `#${colors.creme}` }} color={"inherit"} />:(currentDifficulty==0 ? "N/A" : currentDifficulty)}</span>
                        </div>
                    <PanelComponentCreation  frontState={frontState} backState={backState} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "20%", alignItems: 'center' }}>
                    <GeneralButton handleButtonPress={() =>
                        handleComplete()
                    } label={"Complete"} />
                </div>
            </div>
        </MainPageContainer>
    );
}