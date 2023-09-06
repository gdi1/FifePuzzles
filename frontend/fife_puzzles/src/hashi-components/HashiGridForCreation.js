import styled from 'styled-components';
import { useRef } from 'react';
import sudoku_colors from '../style-utils/sudoku_colors';
import borders from '../style-utils/borders'
import text_styles from '../style-utils/text_styles'
import margins from '../style-utils/margins';
export default function HashiGridForCreation({setPuzzleSetting,puzzleSetting,puzzleHeight,puzzleWidth}){
    const grid = useRef(new Array(puzzleHeight).fill(null).map(() => new Array(puzzleWidth).fill(0))).current
    return(
        <Grid>
            {grid.map((row, gridRowIndex) => {
                return <Row>{row.map((section, gridColumnIndex) => {
                  
                        return <Section onDragOver={(e)=>{
                          e.preventDefault()
                          e.target.style.backgroundColor=sudoku_colors.focus_section
                        }}
                        onDragExit={(e)=>{
                          e.target.style.backgroundColor=sudoku_colors.non_focus_section
                        }}
                        onDragLeave={(e)=>{
                          e.target.style.backgroundColor=sudoku_colors.non_focus_section
                        }}
                        onDrop={(e)=>{
                          e.target.style.backgroundColor=sudoku_colors.non_focus_section
                          let allow=false;
                          let numberToSet=parseInt(e.dataTransfer.getData("text/plain"))
                          if(gridRowIndex==0&&gridColumnIndex==0){
                            if(
                                (puzzleSetting[gridRowIndex][gridColumnIndex+1]==null)
                                &&
                                (puzzleSetting[gridRowIndex+1][gridColumnIndex]==null)
                                &&
                                (numberToSet<5)
                            ){
                              allow=true;
                            }
                          }
                          else if(gridRowIndex==0&&gridColumnIndex==puzzleWidth-1){
                            if(
                                (puzzleSetting[gridRowIndex][gridColumnIndex-1]==null)
                                &&
                                (puzzleSetting[gridRowIndex+1][gridColumnIndex]==null)
                                &&
                                (numberToSet<5)
                            ){
                              allow=true;
                            }
                          }
                          else if(gridRowIndex==puzzleHeight-1&&gridColumnIndex==0){
                            if(
                                (puzzleSetting[gridRowIndex][gridColumnIndex+1]==null)
                                &&
                                (puzzleSetting[gridRowIndex-1][gridColumnIndex]==null)
                                &&
                                (numberToSet<5)
                            ){
                              allow=true;
                            }
                          }
                          else if(gridRowIndex==puzzleHeight-1&&gridColumnIndex==puzzleWidth-1){
                            if(
                                (puzzleSetting[gridRowIndex][gridColumnIndex-1]==null)
                                &&
                                (puzzleSetting[gridRowIndex-1][gridColumnIndex]==null)
                                &&
                                (numberToSet<5)
                            ){
                              allow=true;
                            }
                          }

                          else if(gridColumnIndex==0 && gridRowIndex!=0 && gridRowIndex!=puzzleHeight-1){
                            if(
                                (puzzleSetting[gridRowIndex][gridColumnIndex+1]==null)
                                &&
                                (puzzleSetting[gridRowIndex-1][gridColumnIndex]==null)
                                &&
                                (puzzleSetting[gridRowIndex+1][gridColumnIndex]==null)
                                &&
                                (numberToSet<7)
                            ){
                              allow=true;
                            }
                          }
                          else if(gridColumnIndex==puzzleWidth-1 && gridRowIndex!=0 && gridRowIndex!=puzzleHeight-1){
                            if(
                                (puzzleSetting[gridRowIndex][gridColumnIndex-1]==null)
                                &&
                                (puzzleSetting[gridRowIndex-1][gridColumnIndex]==null)
                                &&
                                (puzzleSetting[gridRowIndex+1][gridColumnIndex]==null)
                                &&
                                (numberToSet<7)
                            ){
                              allow=true;
                            }
                          }
                          else if(gridRowIndex==0 && gridColumnIndex!=0 && gridColumnIndex!=puzzleWidth-1){
                            if(
                                (puzzleSetting[gridRowIndex+1][gridColumnIndex]==null)
                                &&
                                (puzzleSetting[gridRowIndex][gridColumnIndex-1]==null)
                                &&
                                (puzzleSetting[gridRowIndex][gridColumnIndex+1]==null)
                                &&
                                (numberToSet<7)
                            ){
                              allow=true;
                            }
                          }
                          else if(gridRowIndex==puzzleHeight-1 && gridColumnIndex!=0 && gridColumnIndex!=puzzleWidth-1){
                            if(
                                (puzzleSetting[gridRowIndex-1][gridColumnIndex]==null)
                                &&
                                (puzzleSetting[gridRowIndex][gridColumnIndex-1]==null)
                                &&
                                (puzzleSetting[gridRowIndex][gridColumnIndex+1]==null)
                                &&
                                (numberToSet<7)
                            ){
                              allow=true;
                            }
                          }
                          else{
                            if(
                              (puzzleSetting[gridRowIndex-1][gridColumnIndex]==null)
                              &&
                              (puzzleSetting[gridRowIndex+1][gridColumnIndex]==null)
                              &&
                              (puzzleSetting[gridRowIndex][gridColumnIndex-1]==null)
                              &&
                              (puzzleSetting[gridRowIndex][gridColumnIndex+1]==null)
                          ){
                            allow=true;
                          }
                          }
                          if(allow){
                            let puzzleSettingPrev=[...puzzleSetting];
                            puzzleSettingPrev[gridRowIndex][gridColumnIndex]=numberToSet
                            setPuzzleSetting(puzzleSettingPrev)
                          }
                        }}
                        >
                            {puzzleSetting[gridRowIndex][gridColumnIndex]!=null&&
                            <NumberCell draggable={true} onDragStart={(e)=>{
                              e.dataTransfer.setData("text/plain", puzzleSetting[gridRowIndex][gridColumnIndex]);
                            }}
                            
                            onDragEnd={()=>{
                              let puzzleSettingPrev=[...puzzleSetting];
                              puzzleSettingPrev[gridRowIndex][gridColumnIndex]=null
                              setPuzzleSetting(puzzleSettingPrev)
                            }}>
                              <Number>{puzzleSetting[gridRowIndex][gridColumnIndex]}</Number>
                            </NumberCell>}
                        </Section>
                    
                })}</Row>
            })}
        </Grid>
    )
}

const Grid = styled.div`
  display:flex;
  flex-direction:column;
  border:${borders.lrg}px solid ${sudoku_colors.border};
  width:50vh;
  height:70vh;
`;
const Row = styled.div`
  display:flex;
  flex:1;
`;
const Section = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
  background-color:${sudoku_colors.non_focus_section};
`;

const NumberCell = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
  border:${borders.small}px solid ${sudoku_colors.border};
  border-radius:500px;
  justify-content:center;
  align-items:center;
  margin:${margins.small}px
`;
const Number = styled.span`
  font-size:${text_styles.resizbale_font.small_plus};
`;