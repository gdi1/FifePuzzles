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

export default function PanelComponent({loadingNextMove,backState,handleNextMoveButtonPress}) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <NumberPanel>
      <PencilPanelRow>
        <TouchableOpacity onPress={backState}>
          <img alt='' style={{ width: '4vw', height: '4vw' }} src={back_creme_icon} />
        </TouchableOpacity>
      </PencilPanelRow>
      <PencilPanelRow>
        {!loadingNextMove?
          <GeneralButton label={"Get Next Move"} handleButtonPress={handleNextMoveButtonPress}/>
          :
          <CircularProgress style={{ width: 80, height: 80, color: `#${colors.creme}` }} color={"inherit"} />
        }
      </PencilPanelRow>
    </NumberPanel>
  );
}
