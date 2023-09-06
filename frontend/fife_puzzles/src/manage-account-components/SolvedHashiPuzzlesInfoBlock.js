import { useNavigate } from "react-router-dom";
import HomeButton from "../components/HomeButton";
import MainPageContainer from "../components/MainPageContainer";
import puzzles_pattern from "../images/puzzles_pattern.png";
import margins from "../style-utils/margins";
import radiuses from "../style-utils/radiuses";
import colors from "../style-utils/colors";
import GeneralButton from "../components/GeneralButton";
import paddings from "../style-utils/paddings";
import styled from "styled-components";
import Modal from "react-modal";
import CircularProgress from '@mui/material/CircularProgress';
import CustomProgress from '../components/CustomProgress';
import React, { useCallback, useRef, useState, useEffect } from "react";
import { ScrollView } from "react-native-web";
import text_styles from "../style-utils/text_styles";
import {
    GeneralModalButtonStyle,
    modal_content,
    modal_label,
} from "../inline-styles/modal";
import FormField from "../registration-components/FormField";
import { useSelector } from "react-redux";
import { ErrorMessage } from "../registration-components/RegistrationPageConatiner";
import { loginActions } from "../store/login-slice";
import { useDispatch } from "react-redux";
import Sudoku from "../sudoku-components/Sudoku";
import MiniSudoku from "./MiniSudoku";
import SudokuRecord from "./SudokuRecord";
import { TextConatinerP } from "../components/TextContainer";
import EightsPuzzleRecord from "./EightsPuzzleRecord";
import MiniEightsPuzzle from "./MiniEightsPuzzle";
import MiniHashi from "./MiniHashi";
import HashiPuzzleRecord from "./HashiPuzzleRecord";

export default function SolvedHashiPuzzlesInfoBlock({ setCommentsScreenIsOpen, set_id_to_show_comments }) {
    const { user } = useSelector((state) => state.login);
    const [puzzlesDownloaded, setPuzzlesDownloaded] = useState([]);
    const [noMoreToLoad, setNoMoreToLoad] = useState(false);
    const handleScroll = (e) => {
        const bottom = e.nativeEvent.contentSize.height - (e.nativeEvent.contentOffset.y + e.nativeEvent.layoutMeasurement.height) == 0
        if (bottom) {
            if (!noMoreToLoad) {
                setShowBottom(false);
                (async () => {
                    let new_puzzles = await downloadFunction(puzzlesDownloaded.length);
                    if (new_puzzles.length == 0) {
                        setNoMoreToLoad(true);
                    }
                    setPuzzlesDownloaded((prev) => {
                        return [...prev, ...new_puzzles]
                    })
                    setShowBottom(true);
                })()
            }
        }
    }

    const [isMounted, setIsMounted] = useState(false);
    const [showBottom, setShowBottom] = useState(true);
    const ScrollViewRef = useRef(null);
    const downloadFunction = async (skip) => {
        let response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}solved-puzzles-for-solvers/get_solved_hashi_puzzles`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
                credentials: "include",
                body: JSON.stringify({
                    current_length: skip
                }),
            }
        ).then((res) => {
            return res.json();
        });
        if (response.puzzles_solved.length < 15) {
            setNoMoreToLoad(true);
        }
        let puzzles_solved = response.puzzles_solved;
        return puzzles_solved;
    }
    useEffect(() => {
        (async () => {
            let first_puzzles = await downloadFunction(puzzlesDownloaded.length);
            if (first_puzzles.length == 0) {
                setNoMoreToLoad(true);
            }
            setPuzzlesDownloaded((prev) => {
                return [...prev, ...first_puzzles]
            })
            setIsMounted(true);
        })()
    }, [])
    useEffect(() => {
        console.log(puzzlesDownloaded);
    }, [puzzlesDownloaded])
    return (
        <>
            {isMounted ?
                (puzzlesDownloaded.length == 0 ?
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <TextConatinerP>
                            There are no solved puzzles yet.
                        </TextConatinerP>
                    </div>
                    :
                    <ScrollView ref={ScrollViewRef} style={{ display: 'flex', flexDirection: 'column', height: 100 }} onScroll={handleScroll} scrollEventThrottle={0.01}>
                        {puzzlesDownloaded.map((elem) => {
                            return <HashiPuzzleRecord rating={elem.average_rating} date={elem.date_solved} forCreated={false} key={elem.hashis._id} id={elem.hashis._id} difficulty={elem.hashis.difficulty} puzzle={elem.hashis.values}
                                handleLoadComments={() => {
                                    set_id_to_show_comments(elem.hashis._id)
                                    setCommentsScreenIsOpen(true);
                                }} />
                        })}
                        {(showBottom && !noMoreToLoad) && <div style={{ marginTop: margins.med, marginBottom: margins.lrg, display: 'flex', width: 'inherit', justifyContent: 'center' }}>
                            <CircularProgress style={{ width: 50, height: 50, color: `#${colors.creme}` }} color={"inherit"} />
                        </div>}
                    </ScrollView>)
                :
                <CustomProgress />
            }
        </>
    );
}