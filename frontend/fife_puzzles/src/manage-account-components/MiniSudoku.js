
import styled from 'styled-components';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import sudoku_colors from '../style-utils/sudoku_colors'
import borders from '../style-utils/borders'
import text_styles from '../style-utils/text_styles'
var intViewportHeight = window.innerHeight;

export default function MiniSudoku({ selectedNumbers, gridSize, gridStyleExtra, numberStyleExtra }) {
  //arrays that will be populated with divs.
  const size = useRef(gridSize).current;
  const grid = useRef(new Array(size).fill(null).map(() => new Array(size).fill(null).map(() => new Array(size).fill(null).map(() => new Array(size).fill(0))))).current
  const gridDivRef = useRef(null);

  //Below, there many if clauses that define how cell should displayed
  return (
    <Grid
      style={gridStyleExtra} ref={gridDivRef} key={selectedNumbers} heightDiv={intViewportHeight}>
      {grid.map((row, gridRowIndex) => {
        return <Row>{row.map((section, gridColumnIndex) => {
          return <Section> {section.map((numberRow, sectionRowIndex) => {
            return <NumberRow> {numberRow.map((number, sectionColIndex) => {
              return <NumberCell style={{ backgroundColor: sudoku_colors.non_focus_section }} id={`cell${(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)}${(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)}`}>
                <Number style={Object.assign({},
                  numberStyleExtra,
                  {
                    color: sudoku_colors.correct_number
                  })}>{selectedNumbers[(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)][(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)]!==0 && selectedNumbers[(gridRowIndex + gridRowIndex) + (sectionRowIndex + gridRowIndex)][(gridColumnIndex + gridColumnIndex) + (sectionColIndex + gridColumnIndex)]}</Number>
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
  border:${borders.lrg}px solid ${sudoku_colors.border};
  width:20vh;
  height:20vh;
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
  border:${borders.xsmall}px solid ${sudoku_colors.border}
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
  border:${borders.xsmall}px solid ${sudoku_colors.border};
  justify-content:center;
  align-items:center
`;
const Number = styled.span`
  font-size:${text_styles.resizbale_font.xsmall};
`;