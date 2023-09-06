import React, { useState } from "react";
import menu_icon from "../icons/menu_icon.png";
import cancel_icon from "../icons/cancel_icon.png";
import { Link } from "react-router-dom";
import download_icon from "../icons/download_icon.png"
import text_styles from "../style-utils/text_styles";
import colors from "../style-utils/colors";
import radiuses from "../style-utils/radiuses";
import margins from "../style-utils/margins";
import paddings from "../style-utils/paddings";
import styled from 'styled-components';
import { TouchableOpacity } from "react-native-web";
import ButtonText from "./ButtonText";

//Styled download button, specifically defined for Sudoku screen. 
//Must have handleDownload function
export default function DownloadButton({ handleDownload }) {
    return (
        <ButtonStyled onClick={handleDownload}>
            <img style={{ width: '3vw', height: '3vw' }} src={download_icon} />
            <ButtonText>Download Puzzle</ButtonText>
        </ButtonStyled>
    );
}
const ButtonStyled = styled.div`
    background-color: #${colors.creme};
    width: 20vw;
    display: flex; 
    flex-direction: row;
    align-items: center;
    padding: ${paddings.xlrg}px;
    border-radius: ${radiuses.xlrg}px; 
    justify-content: space-evenly;
    cursor: pointer;
    &:hover {
        background-color: #${colors.chocolate};
    }
`;