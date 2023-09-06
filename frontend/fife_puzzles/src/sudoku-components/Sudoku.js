
import styled from 'styled-components';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import sudoku_colors from '../style-utils/sudoku_colors'
import borders from '../style-utils/borders'
import text_styles from '../style-utils/text_styles'
import useFocusOnKeyDown from 'react-focus-onkeydown';
var intViewportHeight = window.innerHeight;

//Sudoku grid. This component displays sudoku grid depending on layered state of the game.
//Required layers:
//selectedNumbers: 2d array that contains numbers on the grid.
//errorNumbers: 2d array of booleans that indicates which cells contain invalid numbers
//displaySelectedNumbers: 2d array that states what cell is supposed to be in notes mode or not. If a cell is notes mode, then the cell will have another 3x3 mini-grid.
//pencilNumbers: 2d array where each item is another 2d array that contains notes numbers.
//Other important props:
//selectedCell: cell coordinates that is being modified
//setSelectedCell:function that defines coordinates of a cell that is to be modified.
//gridSize:size of grid.
export default function Sudoku({ isFocusActive, handleKeyDown, heightRef, pencilNumbers, selectedNumbers, errorNumbers, displaySelectedNumbers, selectedCell, gridSize, pencil, setSelectedCell }) {
  //arrays that will be populated with divs.
  const size = useRef(gridSize).current;
  const grid = useRef(new Array(size).fill(null).map(() => new Array(size).fill(null).map(() => new Array(size).fill(null).map(() => new Array(size).fill(0))))).current
  const pencilGrid = useRef(new Array(size).fill(0).map(() => new Array(size).fill(0))).current;
  const gridDivRef = useRef(null);
  //Cell that needs to be outlined in focus
  const [focusNumber, setFocusNumber] = useState(0);
  useFocusOnKeyDown(gridDivRef, isFocusActive);
  useEffect(() => {
    if (selectedCell != 0 && selectedNumbers[selectedCell.x][selectedCell.y] != 0) {
      setFocusNumber(selectedNumbers[selectedCell.x][selectedCell.y]);
    } else {
      setFocusNumber(0)
    }
  }, [pencilNumbers, selectedNumbers, errorNumbers, displaySelectedNumbers, selectedCell])




  //Below, there many if clauses that define how cell should displayed
  return (
    <Grid
      tabIndex="1"
      onKeyDown={(e) => {
        handleKeyDown(e)
      }}
      ref={gridDivRef} heightRef={heightRef} key={selectedNumbers} heightDiv={intViewportHeight}>
      {grid.map((row, gridRowIndex) => {
        return <Row>{row.map((section, gridColumnIndex) => {
          return <Section> {section.map((numberRow, sectionRowIndex) => {
            return <NumberRow> {numberRow.map((number, sectionColIndex) => {
              return !displaySelectedNumbers[(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)][(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)] ?
                <PencilGridCell onClick={() => { setSelectedCell({ x: (gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex), y: (gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex) }) }} id={`cell${(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)}${(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)}`}>
                  {pencilGrid.map((pencilRow, pencilRowIndex) => {
                    return <PencilNumberRow>{pencilRow.map((pencilNumberCell, pencilNumberCellIndex) => {
                      return <PencilNumberCell style={{
                        backgroundColor:
                          (selectedCell != 0) && (selectedCell.x == ((gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)) && selectedCell.y == ((gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)))
                            ?
                            sudoku_colors.focus_cell
                            :
                            (selectedCell != 0 && (
                              (
                                (selectedCell.x == (gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex))
                                ||
                                (selectedCell.y == (gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex))
                                ||
                                (((Math.floor(selectedCell.x / gridSize) * gridSize <= ((gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex))) && (((gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)) <= (Math.floor(selectedCell.x / gridSize) * gridSize + gridSize - 1))) &&
                                  ((Math.floor(selectedCell.y / gridSize) * gridSize <= (gridRowIndex + gridRowIndex + sectionRowIndex + gridRowIndex)) && (((gridRowIndex + gridRowIndex + sectionRowIndex + gridRowIndex)) <= (Math.floor(selectedCell.y / gridSize) * gridSize + gridSize - 1))))
                              )
                            )
                            ) ? sudoku_colors.focus_section : sudoku_colors.non_focus_section
                      }} id={`subcell${pencilNumberCellIndex}${pencilRowIndex}`}>
                        <PencilNumber>{pencilNumbers[(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)][(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)][pencilNumberCellIndex][pencilRowIndex] !== 0 && pencilNumbers[(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)][(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)][pencilNumberCellIndex][pencilRowIndex]}</PencilNumber>
                      </PencilNumberCell>
                    })}</PencilNumberRow>
                  })}
                </PencilGridCell>
                :
                <NumberCell
                  style={{
                    backgroundColor:
                      (selectedCell != 0) && (selectedCell.x == ((gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)) && selectedCell.y == ((gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)))
                        ?
                        sudoku_colors.focus_cell
                        :
                        (selectedCell != 0 && (
                          (
                            (selectedCell.x == (gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)) && selectedNumbers[(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)][(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)] == focusNumber && focusNumber != 0
                            ||
                            (selectedCell.y == (gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)) && selectedNumbers[(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)][(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)] == focusNumber && focusNumber != 0
                            ||
                            (((Math.floor(selectedCell.x / gridSize) * gridSize <= ((gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex))) && (((gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)) <= (Math.floor(selectedCell.x / gridSize) * gridSize + gridSize - 1))) &&
                              ((Math.floor(selectedCell.y / gridSize) * gridSize <= (gridRowIndex + gridRowIndex + sectionRowIndex + gridRowIndex)) && (((gridRowIndex + gridRowIndex + sectionRowIndex + gridRowIndex)) <= (Math.floor(selectedCell.y / gridSize) * gridSize + gridSize - 1)))) && selectedNumbers[(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)][(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)] == focusNumber && focusNumber != 0
                          )
                        )
                        )
                          ?
                          sudoku_colors.error_cell
                          :
                          (focusNumber != 0) && (selectedNumbers[(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)][(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)] == focusNumber)
                            ?
                            sudoku_colors.same_number
                            :
                            (selectedCell != 0 && (
                              (
                                (selectedCell.x == (gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex))
                                ||
                                (selectedCell.y == (gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex))
                                ||
                                (((Math.floor(selectedCell.x / gridSize) * gridSize <= ((gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex))) && (((gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)) <= (Math.floor(selectedCell.x / gridSize) * gridSize + gridSize - 1))) &&
                                  ((Math.floor(selectedCell.y / gridSize) * gridSize <= (gridRowIndex + gridRowIndex + sectionRowIndex + gridRowIndex)) && (((gridRowIndex + gridRowIndex + sectionRowIndex + gridRowIndex)) <= (Math.floor(selectedCell.y / gridSize) * gridSize + gridSize - 1))))
                              )
                            )
                            ) ? sudoku_colors.focus_section : sudoku_colors.non_focus_section
                  }} onClick={(e) => {
                    setSelectedCell({ x: (gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex), y: (gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex) })
                  }}
                  id={`cell${(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)}${(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)}`}>
                  <Number style={{
                    color:
                      (errorNumbers[(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)][(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)])
                        ? sudoku_colors.error_number : sudoku_colors.correct_number
                  }}>{selectedNumbers[(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)][(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)] !== 0 && selectedNumbers[(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)][(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)]}</Number>
                </NumberCell>
            })}</NumberRow>
          })}</Section>
        })}</Row>
      })}
    </Grid>
  );
}

const Grid = styled.div`
  display:flex;
  flex-direction:column;
  border:${borders.xlrg}px solid ${sudoku_colors.border};
  width:65vh;
  height:65vh;
  &:focus {
        outline: none;
    }
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
  border:${borders.small}px solid ${sudoku_colors.border}
`;
const NumberRow = styled.div`
  display:flex;
  flex:1;
`;
const NumberCell = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
  background-color:${sudoku_colors.non_focus_section};
  border:${borders.small}px solid ${sudoku_colors.border};
  justify-content:center;
  align-items:center
`;
const Number = styled.span`
  font-size:${text_styles.resizbale_font.med};
`;
const PencilGridCell = styled.div`
  flex:1;
  display:flex;
  flex-direction:column;
  background-color:${sudoku_colors.non_focus_section};
  border:${borders.small}px solid ${sudoku_colors.border};
`;
const PencilNumberRow = styled.div`
  display:flex;
  flex:1;
`;
const PencilNumberCell = styled.div`
  flex:1;
  display:flex;
  background-color:${sudoku_colors.non_focus_section};
  justify-content:center;
  align-items:center
`;
const PencilNumber = styled.span`
  font-size: ${text_styles.resizbale_font.small};
  color:${sudoku_colors.pencil_number};
`;