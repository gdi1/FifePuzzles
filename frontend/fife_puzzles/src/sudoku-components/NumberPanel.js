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
import FieldsContainer from '../components/FeildsContainer';
import text_styles from '../style-utils/text_styles';



export function NumberPanel(props) {
  return (
    <FieldsContainer style={{ width: '20%' }}>
      {props.children}
    </FieldsContainer>
  )
}

export const NumberPanelRow = styled.div`
  display:flex;
  justify-content:space-evenly;
  margin-top: ${margins.med}px;
  margin-bottom: ${margins.med}px;
`;
export const PencilPanelRow = styled.div`
  display:flex;
  justify-content:center;
  margin-top:${margins.med}px;
  margin-bottom:${margins.med}px;
`;

export const PanelNumber = styled.span`
  font-size:${text_styles.resizbale_font.med_lrg};
  color:#${colors.creme};
`;