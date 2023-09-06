import React, { useState } from "react";
import menu_icon from "../icons/menu_icon.png";
import cancel_icon from "../icons/cancel_icon.png";
import { Link } from "react-router-dom";
import { TouchableOpacity } from "react-native-web";
import text_styles from "../style-utils/text_styles";
import colors from "../style-utils/colors";
import radiuses from "../style-utils/radiuses";
import margins from "../style-utils/margins";
import styled from 'styled-components';
import ButtonText from "./ButtonText";
//A home button whose, functionality is defined by parent component. For example open a Modal.
//This button is always placed in left top corner
export default function HomeButton({ handleHomeButton }) {
    return (
        <ButtonStyled
            onClick={() => handleHomeButton()}>
            <ButtonText>Home</ButtonText>
        </ButtonStyled>
    );
}
const ButtonStyled = styled.div`
    background-color: #${colors.creme};
    align-self: flex-start;
    margin-left: ${margins.lrg}px;
    margin-top: ${margins.xlrg}px;
    border-radius: ${radiuses.lrg}px;
    width: 7vw;
    height: 4vw;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover {
        background-color: #${colors.chocolate};
    }
`;