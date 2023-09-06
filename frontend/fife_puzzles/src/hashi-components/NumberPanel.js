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
import text_styles from '../style-utils/text_styles';
import sudoku_colors from '../style-utils/sudoku_colors';
import paddings from '../style-utils/paddings';

//Styled coponents for number control panel of sudoku game and creation. Used in NumberPanelCopmonent and in SudokuPuzzleCreationPanel.


export const FieldsContainer=styled.div`
display:flex;
width:20%;
flex-direction:column;
justify-content:space-evenly;
padding:${paddings.lrg}px;
background-color: #${colors.modal};
border-radius: ${radiuses.lrg}px;
border: ${borders.med}px solid #${colors.modal_border};
`
export const NumberPanelRow = styled.div`
  display:flex;
  justify-content:space-evenly;
  margin-top: ${margins.med}px;
  margin-bottom: ${margins.med}px;
  alignItems:center;
  flex-direction:row;
`;
export const Section = styled.div`
  height:10vh;
  width:10vh;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  align-self:center;
  cursor:move;
  transition: all 0.25s;
`;
export const NumberCell = styled.div`
  height:10vh;
  width:10vh;
  display:flex;
  flex-direction:column;
  background-color:${sudoku_colors.non_focus_section};
  border:${borders.small}px solid ${sudoku_colors.border};
  border-radius:500px;
  justify-content:center;
  align-items:center;
  align-self:center;
  cursor:move;
  transition: all 0.25s;
`;

export const Number = styled.span`
  font-size:${text_styles.resizbale_font.med};
  transition: all 0.25s;
`;
