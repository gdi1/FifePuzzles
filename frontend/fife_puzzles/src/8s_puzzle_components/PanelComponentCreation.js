import cancel_creme_icon from '../icons/cancel_creme_icon.png'
import back_creme_icon from '../icons/back_creme_icon.png'
import forward_creme_icon from '../icons/forward_creme_icon.png'
import pencil_creme_icon from '../icons/pencil_creme_icon.png';
import colors from "../style-utils/colors"
import radiuses from "../style-utils/radiuses"
import borders from "../style-utils/borders"
import styled from 'styled-components';
import { useRef, useState, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native-web';
import margins from '../style-utils/margins';
import CircularProgress from '@mui/material/CircularProgress';
import GeneralButton from '../components/GeneralButton'
import { NumberPanel, PencilPanelRow, NumberPanelRow, PanelNumber } from './Panel';
import text_styles from '../style-utils/text_styles';
import CustomProgress from '../components/CustomProgress';

//This components is used to controll numbers on the sudoku grid. 
//It can set grid to numbers, from 1-9. Also it can controll back-state function, errase and set notes.
//Required props:
//pencil: notes mode
//setPencil: switches notes mode
//setSelectedNumber: function that modifies grid state
//backState: function that requests to comeback to previous state from stack

export default function PanelComponentCreation({frontState,backState}) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <NumberPanel style={{width:'flex'}}>
      <NumberPanelRow>
        <TouchableOpacity onPress={backState}>
          <img alt='' style={{ width: '4vw', height: '4vw' }} src={back_creme_icon} />
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={frontState}>
          <img alt='' style={{transform:'scaleX(-1)', width: '4vw', height: '4vw' }} src={back_creme_icon} />
        </TouchableOpacity> */}
      </NumberPanelRow>
    </NumberPanel>
  );
}
