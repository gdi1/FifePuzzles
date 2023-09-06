import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import colors from "../style-utils/colors";
import text_styles from "../style-utils/text_styles";
import account_icon from "../icons/account_icon.png"
import { useSelector } from "react-redux";
//This copnent initiates hover drop down from navigation bar. Must have setIsOpenDropDown prop from parent
export default function HomeHoverDropDown(props) {
  const { user } = useSelector((state) => state.login);
  return (
    <Link to="#" style={{
      display: 'flex',
      alignItems: "center",
      textDecoration: 'none',
      zIndex: 10
    }} onMouseEnter={() => { props.setIsOpenDropDown(true) }} onMouseLeave={() => { props.setIsOpenDropDown(false) }}>
      <span style={{
        color: `#${colors.chocolate}`,
        fontWeight: 'bold',
        fontSize: text_styles.resizbale_font.med,
      }}> {user.name} </span>
      <img src={account_icon} style={{ width: '5vw', height: '5vw' }} />
    </Link>
  );
}
