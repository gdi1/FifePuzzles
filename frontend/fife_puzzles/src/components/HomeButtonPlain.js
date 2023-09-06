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
//Home button, that is placed in top left corner and just redirect to home page.
export default function HomeButtonPlain({ style, label }) {
    return (
        <Link style={Object.assign({}, style, { textDecoration: 'none', color: 'black' })} to={"/"}>
            <ButtonStyled>
                <ButtonText>{label}</ButtonText>
            </ButtonStyled>
        </Link>
    );
}
const ButtonStyled = styled.div`
    background-color: #${colors.creme};
    border-radius: ${radiuses.lrg}px;
    width: 7vw;
    height: 5vh;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover {
        background-color: #${colors.chocolate};
    }
`;