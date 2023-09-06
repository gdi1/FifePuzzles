import cancel_creme_icon from '../icons/cancel_creme_icon.png'
import back_creme_icon from '../icons/back_creme_icon.png'
import pencil_icon from '../icons/pencil_icon.png';
import { NumberPanel, PencilPanelRow, NumberPanelRow, PanelNumber } from './NumberPanel';
import styled from 'styled-components';
import margins from '../style-utils/margins';

import { TouchableOpacity, View } from 'react-native-web';

//This components is used to controll numbers on the sudoku grid in creation mode. So when creating puzzle from solution. This panel is used
//to empty cells 
//Required props:
//setSelectedNumber: function that modifies grid state, in fact it will only errase numbers
//backState: function that requests to comeback to previous state from stack
export default function SudokuPuzzleCreationPanel({ setSelectedNumber, backState }) {
  return (
    <NumberPanel>
      <NumberPanelRow>
        <TouchableOpacity onPress={() => { setSelectedNumber(0); }}><img style={{ width: 30, height: 30 }} src={cancel_creme_icon} /></TouchableOpacity>
      </NumberPanelRow>
      <PencilPanelRow>
        <TouchableOpacity onPress={backState}>
          <img alt='' style={{ width: 70, height: 70 }} src={back_creme_icon} />
        </TouchableOpacity>
      </PencilPanelRow>
    </NumberPanel>
  );
}