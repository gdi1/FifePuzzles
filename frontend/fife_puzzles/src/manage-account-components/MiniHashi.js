import styled from 'styled-components';
import { useRef } from 'react';
import sudoku_colors from '../style-utils/sudoku_colors';
import borders from '../style-utils/borders'
import text_styles from '../style-utils/text_styles'
import margins from '../style-utils/margins';
export default function MiniHashi({ puzzle, puzzleHeight, puzzleWidth, gridStyleExtra, numberStyleExtra }) {
    const grid = useRef(new Array(puzzleHeight).fill(null).map(() => new Array(puzzleWidth).fill(0))).current
    return (
        <Grid style={gridStyleExtra}>
            {grid.map((row, gridRowIndex) => {
                return <Row>{row.map((section, gridColumnIndex) => {
                    if (puzzle[gridRowIndex][gridColumnIndex] == null) {
                        return <Section>

                        </Section>
                    } else {
                        return <Section>
                            <NumberCell style={{
                                backgroundColor: sudoku_colors.non_focus_section
                            }}>
                                <Number style={numberStyleExtra}>
                                    {puzzle[gridRowIndex][gridColumnIndex]}</Number>
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
  width:36vh;
  height:50vh;
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
  border:${borders.xsmall}px solid ${sudoku_colors.border};
  border-radius:500px;
  justify-content:center;
  align-items:center;
  margin:0.2vh
`;
const Number = styled.span`
  font-size:${text_styles.resizbale_font.small};
  color: ${sudoku_colors.correct_number}
`;