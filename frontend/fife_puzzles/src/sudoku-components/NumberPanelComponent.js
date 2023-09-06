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
import { NumberPanel, PencilPanelRow, NumberPanelRow, PanelNumber } from './NumberPanel';
import text_styles from '../style-utils/text_styles';

//This components is used to controll numbers on the sudoku grid. 
//It can set grid to numbers, from 1-9. Also it can controll back-state function, errase and set notes.
//Required props:
//pencil: notes mode
//setPencil: switches notes mode
//setSelectedNumber: function that modifies grid state
//backState: function that requests to comeback to previous state from stack

export default function NumberPanelComponent({ setPencil, pencil, setSelectedNumber, backState }) {
  const NumberPanelRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <NumberPanel ref={NumberPanelRef}>
      <PencilPanelRow>
        <TouchableOpacity onPress={() => {
          setPencil(!pencil)
        }}>
          <img alt='' style={{ width: '4vw', height: '4vw' }} src={pencil_creme_icon} />
        </TouchableOpacity>
        <span style={{ marginLeft: margins.small, display: 'flex', fontSize: text_styles.resizbale_font.med, alignItems: 'center', color: `#${colors.creme}` }}>{pencil ? 'On' : 'Off'}</span>
      </PencilPanelRow>
      <NumberPanelRow>
        <TouchableOpacity onPress={() => { setSelectedNumber(1); }}><PanelNumber pencil={pencil}>1</PanelNumber></TouchableOpacity>
        <TouchableOpacity onPress={() => { setSelectedNumber(2); }}><PanelNumber pencil={pencil}>2</PanelNumber></TouchableOpacity>
      </NumberPanelRow>
      <NumberPanelRow>
        <TouchableOpacity onPress={() => { setSelectedNumber(3); }}><PanelNumber pencil={pencil}>3</PanelNumber></TouchableOpacity>
        <TouchableOpacity onPress={() => { setSelectedNumber(4); }}><PanelNumber pencil={pencil}>4</PanelNumber></TouchableOpacity>
      </NumberPanelRow>
      <NumberPanelRow>
        <TouchableOpacity onPress={() => { setSelectedNumber(5); }}><PanelNumber pencil={pencil}>5</PanelNumber></TouchableOpacity>
        <TouchableOpacity onPress={() => { setSelectedNumber(6); }}><PanelNumber pencil={pencil}>6</PanelNumber></TouchableOpacity>
      </NumberPanelRow>
      <NumberPanelRow>
        <TouchableOpacity onPress={() => { setSelectedNumber(7); }}><PanelNumber pencil={pencil}>7</PanelNumber></TouchableOpacity>
        <TouchableOpacity onPress={() => { setSelectedNumber(8); }}><PanelNumber pencil={pencil}>8</PanelNumber></TouchableOpacity>
      </NumberPanelRow>
      <NumberPanelRow>
        <TouchableOpacity onPress={() => { setSelectedNumber(9); }}><PanelNumber pencil={pencil}>9</PanelNumber></TouchableOpacity>
        {!pencil && <TouchableOpacity onPress={() => { setSelectedNumber(0); }}><img style={{ width: '2vw', height: '2vw' }} src={cancel_creme_icon} /></TouchableOpacity>}
      </NumberPanelRow>
      <PencilPanelRow>
        <TouchableOpacity onPress={backState}>
          <img alt='' style={{ width: '4vw', height: '4vw' }} src={back_creme_icon} />
        </TouchableOpacity>
      </PencilPanelRow>
    </NumberPanel>
  );
}
