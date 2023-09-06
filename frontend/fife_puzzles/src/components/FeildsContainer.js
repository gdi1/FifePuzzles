import cancel_creme_icon from '../icons/cancel_creme_icon.png'
import back_creme_icon from '../icons/back_creme_icon.png'
import pencil_creme_icon from '../icons/pencil_creme_icon.png';
import colors from "../style-utils/colors"
import radiuses from "../style-utils/radiuses"
import borders from "../style-utils/borders"
import styled from 'styled-components';
import { useRef, useState, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native-web';
import margins from '../style-utils/margins';
import GeneralButton from '../components/GeneralButton'
import paddings from '../style-utils/paddings';
//Dark container for fields, such as in registartion forms, or for number punel in sudoku game.
//General box to outline an important controll section.
export default function FieldsContainer(props) {
    return (
        <MainContainerStyled style={props.style}>
            {props.children}
        </MainContainerStyled>
    )
}

const MainContainerStyled = styled.div`
  display:flex;
  flex-direction:column;
  justify-content:space-evenly;
  padding:${paddings.lrg}px;
  background-color: #${colors.modal};
  border-radius: ${radiuses.lrg}px;
  border: ${borders.med}px solid #${colors.modal_border};
`;