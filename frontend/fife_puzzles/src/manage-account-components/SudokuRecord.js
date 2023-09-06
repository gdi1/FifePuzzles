import { useNavigate } from "react-router-dom";
import HomeButton from "../components/HomeButton";
import MainPageContainer from "../components/MainPageContainer";
import puzzles_pattern from "../images/puzzles_pattern.png";
import margins from "../style-utils/margins";
import radiuses from "../style-utils/radiuses";
import sudoku_colors from '../style-utils/sudoku_colors'
import borders from '../style-utils/borders'
import colors from "../style-utils/colors";
import GeneralButton from "../components/GeneralButton";
import paddings from "../style-utils/paddings";
import styled from "styled-components";
import Modal from "react-modal";
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
import { CardContainer, InfoPart, PuzzlePart, Buttons } from './RecordStyledComponents'

// SudokuRecord.defaultProps = {
//     forCreated: true
// };
export default function SudokuRecord({ isActive, rating, values, solution, id, difficulty, handleButtonPress = () => { }, handleLoadComments, forCreated = true, date }) {
    return (
        <CardContainer>
            <InfoPart>
                <span style={{ fontSize: text_styles.resizbale_font.small_med, color: text_styles.colors.primary }}>ID: {id}</span>
                <br />
                <span style={{ fontSize: text_styles.resizbale_font.small_med, color: text_styles.colors.primary }}>Difficulty: {difficulty}</span>
                <br />
                <span style={{ fontSize: text_styles.resizbale_font.small_med, color: text_styles.colors.primary }}>Average Rating: {rating == null ? "N/A" : rating.toFixed(1)}</span>
                {!forCreated ?
                    <>
                        <br />
                        <span style={{ fontSize: text_styles.resizbale_font.small_med, color: text_styles.colors.primary }}>Date Solved: {new Date(date).getFullYear() + "/" + (new Date(date).getMonth() + 1) + "/" + new Date(date).getDate()}</span>
                    </>
                    :
                    <>
                        <br />
                        <span style={{ fontSize: text_styles.resizbale_font.small_med, color: text_styles.colors.primary }}>Status: {isActive ? "active" : "inactive"}</span>
                    </>
                }
            </InfoPart>
            <PuzzlePart>
                <MiniSudoku selectedNumbers={values} gridSize={3} />
                <MiniSudoku selectedNumbers={solution} gridSize={3} />
            </PuzzlePart>
            <Buttons>
                {forCreated &&
                    <>
                        <GeneralButton label={"Delete"} handleButtonPress={handleButtonPress} />
                        <div style={{ height: '1vh' }} />
                    </>
                }
                <GeneralButton label={"Show Comments"} handleButtonPress={handleLoadComments} />
            </Buttons>
        </CardContainer>
    );
}