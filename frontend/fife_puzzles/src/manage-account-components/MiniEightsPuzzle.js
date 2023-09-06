import styled from 'styled-components';
import borders from '../style-utils/borders'
import text_styles from '../style-utils/text_styles';
import { useRef, useState, useEffect } from 'react'
import GeneralButton from '../components/GeneralButton';
import puzzle8s_styles from "../style-utils/puzzle8s_styles";
import CustomProgress from '../components/CustomProgress';
export default function MiniEightsPuzzle({ puzzle, gridStyleExtra, numberStyleExtra }) {
    const grid = useRef(new Array(3).fill(null).map(() => new Array(3).fill(0))).current




    const [isMounted, setIsMounted] = useState(false);
    const [startingNumberCells, setStartingNumberCells] = useState(null);
    useEffect(() => {
        let starting_number_cells = puzzle.map((row, rowIndex) => {
            return row.map((cell, cellIndex) => {
                return (
                    puzzle[rowIndex][cellIndex] == null ?
                        null
                        :
                        <NumberCell>
                            <Number style={numberStyleExtra}>{puzzle[rowIndex][cellIndex]}</Number>
                        </NumberCell>

                )
            })
        })
        setStartingNumberCells(starting_number_cells)
        setIsMounted(true)
    }, [isMounted])
    return (
        <>
            {isMounted ?
                <Grid style={gridStyleExtra}>
                    {grid.map((row, gridRowIndex) => {
                        return (<Row>{row.map((cell, gridCellIndex) => {
                            return (
                                <Cell>
                                    {startingNumberCells[gridRowIndex][gridCellIndex]}
                                </Cell>)
                        })}</Row>)
                    })}
                </Grid>
                :
                <div>
                    <CustomProgress />
                </div>
            }
        </>
    );
}

const Grid = styled.div`
  display:flex;
  flex-direction:column;
  border:${borders.med}px solid ${puzzle8s_styles.border};
  width:20vh;
  height:20vh;
`;
const Row = styled.div`
  display:flex;
  flex:1;
  border:${borders.xsmall}px solid ${puzzle8s_styles.border};
`;
const Cell = styled.div`
  flex:1;
  display:flex;
  background-color:${puzzle8s_styles.empty_section};
  border:${borders.xsmall}px solid ${puzzle8s_styles.border};
  justify-content:center;
  align-items:center
`;
const NumberCell = styled.div`
  display:flex;
  flex:1;
  height:100%;
  flex-direction:column;
  background-color:${puzzle8s_styles.number_box};
  border:${borders.small}px solid ${puzzle8s_styles.border};
  justify-content:center;
  align-items:center;
`;
const Number = styled.span`
  font-size:${text_styles.resizbale_font.small};
  font-color:${puzzle8s_styles.correct_number}
`;