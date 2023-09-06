import { Link, Outlet, Route, Router, Routes, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import GeneralButton from "../components/GeneralButton";
import Navigation from "../components/NavigationBar";
import SudokuScreen from "./SudokuScreen";
import CustomProgress from "../components/CustomProgress";
import { useFilePicker } from 'use-file-picker';
import Modal from 'react-modal';
import { GeneralModalButtonStyle, modal_content, modal_label } from '../inline-styles/modal'
import MainPageContainer from '../components/MainPageContainer'
import margins from "../style-utils/margins";
import colors from "../style-utils/colors";
import sudoku_image from "../images/sudoku_image.jpg"
//Base code for file picker is taken from 
//Unknown. 2022. use-file-picker. npm. https://www.npmjs.com/package/use-file-picker
//This component allows choice of difficulty of puzzle and also allows to upload user's file and play that puzzle.
export default function SudokuMenuScreen() {
    //Upload controll booleans and modal controll boolean
    const [fileUploadModalIsOpen, setFileUploadModalIsOpen] = useState(false);
    const [isLoadingInModalStarted, setIsLoadingInModalStarted] = useState(false);
    const [isLoadingInModalFinished, setIsLoadingInModalFinished] = useState(false);
    const [loadingInModalMessage, setLoadingInModalMessage] = useState("");
    const [loadingInModalRedirectToGame, setLoadingInModalRedirectToGame] = useState(false);
    //Puzzle to upload
    const [puzzleFromFile, setPuzzleFromFile] = useState(null);
    //Selector of file that allows only one json file
    const [openFileSelector, { filesContent, loading }] = useFilePicker({
        multiple: false,
        accept: '.json',
    });
    //Navigation
    const navigate = useNavigate();
    //Loading controll boolean before going to game screen
    const [isLoading, setIsLoading] = useState(false);

    //Upload file on selection
    useEffect(() => {
        if (filesContent.length == 1) {
            (async () => {
                setFileUploadModalIsOpen(true);
                setIsLoadingInModalStarted(true);
                try{
                let puzzle = JSON.parse(filesContent[0].content);
                //Uploading file
                let upload_result = await fetch(`${process.env.REACT_APP_BACKEND_URL}sudoku/add_sudoku_puzzle_from_upload/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    withCredentials: true,
                    credentials: "include",
                    body: JSON.stringify({ "puzzle_file": puzzle })
                }).then(response => {
                    return response.json();
                }).catch(err => console.log(err));
                console.log(upload_result);

                //If doesn't exist and is invalid
                if (!upload_result.puzzle_exists && !upload_result.added) {
                    setLoadingInModalRedirectToGame(false);//Disallow to redirect to game
                    setLoadingInModalMessage(upload_result.message)
                }
                //If doesn't exist and is valid
                if (!upload_result.puzzle_exists && upload_result.added) {

                    setLoadingInModalRedirectToGame(true);//Allow to redirect to game
                    setLoadingInModalMessage(upload_result.message)
                    setPuzzleFromFile(upload_result.new_puzzle)
                }
                //If does exist and is invalid but not added to databse
                if (upload_result.puzzle_exists && !upload_result.added) {

                    setLoadingInModalRedirectToGame(true);//Allow to redirect to game
                    setLoadingInModalMessage(upload_result.message)
                    setPuzzleFromFile(upload_result.new_puzzle)
                }
                setIsLoadingInModalFinished(true);
            }catch(err){
                console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh")
                setLoadingInModalRedirectToGame(false); //Disallow to redirect to game
                setLoadingInModalMessage("Invalid Content!");
                setIsLoadingInModalFinished(true);
              }
            })()
        }
    }, [filesContent]);
    let button_style = { width: '15vw', marginTop: margins.lrg };
    const [didFindPuzzleIsOpen, setDidFindPuzzleIsOpen] = useState(false);
    return (
        <>
            <Modal
                isOpen={fileUploadModalIsOpen}
                ariaHideApp={false}
                style={modal_content}
            >{/*Modal for uploading puzzle */}
                {isLoadingInModalStarted ?
                    isLoadingInModalFinished ?
                        !loadingInModalRedirectToGame ?//If there is a problem with file, don't offer redirect
                            <>
                                <span style={modal_label}>{loadingInModalMessage}</span>
                                <GeneralButton style={GeneralModalButtonStyle} label={"OK"} handleButtonPress={() => setFileUploadModalIsOpen(false)} />
                            </>
                            ://If there is no problem with file, offer redirect with received puzzle
                            <>
                                <span style={modal_label}>{loadingInModalMessage}</span>
                                <GeneralButton style={GeneralModalButtonStyle} label={"Go to game"} handleButtonPress={() => {
                                    navigate('/sudoku/sudoku_play', { state: { game: puzzleFromFile } });
                                }} />
                            </>
                        :
                        <CustomProgress />
                    :
                    <CustomProgress />
                }

            </Modal>
            <Modal
                isOpen={didFindPuzzleIsOpen}
                ariaHideApp={false}
                style={modal_content}
                onRequestClose={() => {
                    setDidFindPuzzleIsOpen(false);
                }}
            >{/*Modal for uploading puzzle */}
                <span style={modal_label}>There is no active puzzle of this difficulty.</span>
                <GeneralButton style={GeneralModalButtonStyle} label={"OK"} handleButtonPress={() => setDidFindPuzzleIsOpen(false)} />
            </Modal>
            <MainPageContainer image_back={sudoku_image}>
                <Navigation />
                {isLoading ?
                    <CustomProgress />
                    :
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'space-evenly' }}>
                        <div style={{ alignSelf: 'center', textDecoration: 'none', color: 'black' }}>{/*Getting easy puzzle */}
                            <GeneralButton style={button_style}
                                handleButtonPress={async () => {
                                    setIsLoading(true);
                                    //Getting puzzle from db
                                    let result = await fetch(`${process.env.REACT_APP_BACKEND_URL}sudoku/get_sudoku_puzzle/`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        withCredentials: true,
                                        credentials: "include",
                                        body: JSON.stringify({ "difficulty": "easy" })
                                    }).then(response => {
                                        return response.json();
                                    }).catch(err => console.log(err));
                                    setIsLoading(false);
                                    //Redirecting to play puzzle with received puzzle
                                    console.log(result)
                                    if (!result.found) {
                                        setDidFindPuzzleIsOpen(true);
                                    } else {
                                        navigate('/sudoku/sudoku_play', { state: { game: result.game } });
                                    }
                                }} label={"Easy"} />
                        </div>
                        <div style={{ alignSelf: 'center', textDecoration: 'none', color: 'black' }}>{/*Getting medium puzzle */}
                            <GeneralButton
                                style={button_style}
                                handleButtonPress={async () => {
                                    setIsLoading(true);
                                    //Getting puzzle from db
                                    let result = await fetch(`${process.env.REACT_APP_BACKEND_URL}sudoku/get_sudoku_puzzle/`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        withCredentials: true,
                                        credentials: "include",
                                        body: JSON.stringify({ "difficulty": "medium" })
                                    }).then(response => {
                                        return response.json();
                                    }).catch(err => console.log(err));
                                    setIsLoading(false);
                                    //Redirecting to play puzzle with received puzzle
                                    if (!result.found) {
                                        setDidFindPuzzleIsOpen(true);
                                    } else {
                                        navigate('/sudoku/sudoku_play', { state: { game: result.game } });
                                    }
                                }} label={"Medium"} />
                        </div>
                        <div style={{ alignSelf: 'center', textDecoration: 'none', color: 'black' }}>{/*Getting hard puzzle */}
                            <GeneralButton
                                style={button_style}
                                handleButtonPress={async () => {
                                    setIsLoading(true);
                                    //Getting puzzle from db
                                    let result = await fetch(`${process.env.REACT_APP_BACKEND_URL}sudoku/get_sudoku_puzzle/`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        withCredentials: true,
                                        credentials: "include",
                                        body: JSON.stringify({ "difficulty": "hard" })
                                    }).then(response => {
                                        return response.json();
                                    }).catch(err => console.log(err));
                                    setIsLoading(false);
                                    //Redirecting to play puzzle with received puzzle
                                    if (!result.found) {
                                        setDidFindPuzzleIsOpen(true);
                                    } else {
                                        navigate('/sudoku/sudoku_play', { state: { game: result.game } });
                                    }
                                }} label={"Hard"} />
                        </div>
                        <div to={"/sudoku/sudoku_play"} style={{ alignSelf: 'center', textDecoration: 'none', color: 'black' }}>{/*Play with uploaded puzzle */}
                            <GeneralButton
                                style={button_style}
                                label={"Upload puzzle"} handleButtonPress={() => {
                                    openFileSelector();//Opening file selector
                                }} />
                        </div>
                    </div>
                }

            </MainPageContainer>
        </>
    );
}