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
import { NumberPanel, PencilPanelRow, NumberPanelRow, PanelNumber, NumberCell, Number, FieldsContainer, NumberCell2, Section } from './NumberPanel';
import text_styles from '../style-utils/text_styles';
import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';

//This components is used to controll numbers on the sudoku grid. 
//It can set grid to numbers, from 1-9. Also it can controll back-state function, errase and set notes.
//Required props:
//pencil: notes mode
//setPencil: switches notes mode
//setSelectedNumber: function that modifies grid state
//backState: function that requests to comeback to previous state from stack

export default function NumberPanelComponent() {
  const NumberPanelRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <FieldsContainer onDragOver={(e)=>e.preventDefault()} ref={NumberPanelRef}>
      <NumberPanelRow>
      <Section>
        <NumberCell draggable={true}
        
        onDragStart={async (e)=>{
          e.dataTransfer.setData("text/plain", 1);
        }}>
            <Number draggable={false}>
              1
            </Number>
        </NumberCell>
        </Section>
        <Section>
        <NumberCell draggable={true} onDragStart={(e)=>{
          e.dataTransfer.setData("text/plain", 2);
        }}>
            <Number>
              2
            </Number>
        </NumberCell>
        </Section>
      </NumberPanelRow>
      <NumberPanelRow>
      <Section>
        <NumberCell draggable={true} onDragStart={(e)=>{
          e.dataTransfer.setData("text/plain", 3);
        }}>
              <Number>
                3
              </Number>
          </NumberCell>
          </Section>
          <Section>
          <NumberCell draggable={true} onDragStart={(e)=>{
          e.dataTransfer.setData("text/plain", 4);
        }}>
              <Number>
                4
              </Number>
          </NumberCell>
          </Section>
      </NumberPanelRow>
      <NumberPanelRow>
      <Section>
      <NumberCell draggable={true} onDragStart={(e)=>{
          e.dataTransfer.setData("text/plain", 5);
        }}>
            <Number>
              5
            </Number>
        </NumberCell>
        </Section>
        <Section>
        <NumberCell draggable={true} onDragStart={(e)=>{
          e.dataTransfer.setData("text/plain", 6);
        }}>
            <Number>
              6
            </Number>
        </NumberCell>
        </Section>
      </NumberPanelRow>
      <NumberPanelRow>
      <Section>
      <NumberCell draggable={true} onDragStart={(e)=>{
          e.dataTransfer.setData("text/plain", 7);
        }}>
            <Number>
              7
            </Number>
        </NumberCell>
        </Section>
        <Section>
        <NumberCell draggable={true} onDragStart={(e)=>{
          e.dataTransfer.setData("text/plain", 8);
        }}>
            <Number>
              8
            </Number>
        </NumberCell>
        </Section>
      </NumberPanelRow>
    </FieldsContainer>
  );
}
