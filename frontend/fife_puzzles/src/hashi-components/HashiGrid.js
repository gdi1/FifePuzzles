import styled from 'styled-components';
import { useRef } from 'react';
import sudoku_colors from '../style-utils/sudoku_colors';
import borders from '../style-utils/borders'
import text_styles from '../style-utils/text_styles'
import margins from '../style-utils/margins';
export default function HashiGrid({accordingToSolution,errorCicrles,puzzle,CirclesRefs,CompletedCricles,setStartNode,setEndNode,startNodeSelected,setStartNodeSelected,findDoneRelationShips,bridges,setBridges,findDrawPaths,setEndNodeSelected,puzzleHeight,puzzleWidth}){
    const grid = useRef(new Array(puzzleHeight).fill(null).map(() => new Array(puzzleWidth).fill(0))).current
    return(
        <Grid>
            {grid.map((row, gridRowIndex) => {
                return <Row>{row.map((section, gridColumnIndex) => {
                    if (puzzle[gridRowIndex][gridColumnIndex] == null) {
                        return <Section>

                        </Section>
                    } else {
                        return <Section>
                            <NumberCell ref={(elem) => {
                                return CirclesRefs[gridRowIndex][gridColumnIndex] = elem
                            }} style={{ backgroundColor:
                                (errorCicrles[gridRowIndex][gridColumnIndex] && accordingToSolution?
                                  sudoku_colors.error_number  
                                 :   
                                (CompletedCricles[gridRowIndex][gridColumnIndex] ?
                                     sudoku_colors.correct_number
                                     : sudoku_colors.non_focus_section
                                     ) 
                                )}}
                                onClick={(e) => {
                                    if (!startNodeSelected) {
                                        CirclesRefs[gridRowIndex][gridColumnIndex].style.backgroundColor = sudoku_colors.same_number
                                        setStartNode({ x: gridColumnIndex, y: gridRowIndex })
                                        setStartNodeSelected(true);
                                        if(CompletedCricles[gridRowIndex][gridColumnIndex]){
                                            let foundDoneRelationShips=findDoneRelationShips(gridRowIndex,gridColumnIndex);
                                            foundDoneRelationShips.forEach((elem) => {
                                                let index = bridges.indexOf(elem);
                                                let prev = [...bridges];
                                                prev[index].showDrawPath = true;
                                                setBridges(prev)
                                            })
                                        }else{
                                            let drawPaths = findDrawPaths(bridges, gridColumnIndex, gridRowIndex);
                                            drawPaths.forEach((elem) => {
                                                let index = bridges.indexOf(elem);
                                                let prev = [...bridges];
                                                prev[index].showDrawPath = true;
                                                setBridges(prev)
                                            })
                                        }
                                    }
                                }}
                                onMouseEnter={()=>{
                                    if (startNodeSelected) {
                                        CirclesRefs[gridRowIndex][gridColumnIndex].style.backgroundColor = sudoku_colors.focus_section
                                        setEndNode({ x: gridColumnIndex, y: gridRowIndex })
                                        setEndNodeSelected(true);
                                    }
                                }}>
                                <Number style={
                                    {
                                        color:
                                        (errorCicrles[gridRowIndex][gridColumnIndex]&&accordingToSolution?
                                            sudoku_colors.correct_number  
                                           :   
                                        (!CompletedCricles[gridRowIndex][gridColumnIndex] ?
                                             sudoku_colors.correct_number
                                             : 
                                             sudoku_colors.non_focus_section)
                                        )}}>{puzzle[gridRowIndex][gridColumnIndex]}</Number>
                            </NumberCell>
                        </Section>
                    }
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