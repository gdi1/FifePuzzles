import styled from 'styled-components';
import borders from '../style-utils/borders'
import text_styles from '../style-utils/text_styles';
import { useRef, useState, useEffect } from 'react'
import GeneralButton from '../components/GeneralButton';
import puzzle8s_styles from "../style-utils/puzzle8s_styles";
import CustomProgress from '../components/CustomProgress';
export default function Puzzle8sGrid({ puzzle, handle8sClick, NumberRefs, CellsRefs , showParts}) {
    const grid = useRef(new Array(3).fill(null).map(() => new Array(3).fill(0))).current




    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true)
    }, [isMounted])
    return (
        <>
            {isMounted ?
                <Grid>
                    {grid.map((row, gridRowIndex) => {
                        return (<Row>{row.map((cell, gridCellIndex) => {
                            return (
                                <Cell ref={(elem) => {
                                    CellsRefs[gridRowIndex][gridCellIndex] = elem;
                                }}>
                                    {puzzle[gridRowIndex][gridCellIndex]==null?
                                        null
                                        :
                                        (showParts[gridRowIndex][gridCellIndex]&&
                                        <NumberCell onClick={() => {
                                            console.log("hiuhiw")
                                            handle8sClick(gridRowIndex, gridCellIndex,false,false)
                                        }}
                                            ref={(elem) => {
                                                NumberRefs[gridRowIndex][gridCellIndex] = elem;
                                            }}>
                                            <Number>{puzzle[gridRowIndex][gridCellIndex]}</Number>
                                        </NumberCell>
                                        )
                                    }
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
  border:${borders.lrg}px solid ${puzzle8s_styles.border};
  width:60vh;
  height:60vh;
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
  font-size:${text_styles.resizbale_font.med};
  font-color:${puzzle8s_styles.correct_number}
`;