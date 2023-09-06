import React, { useState } from "react";
import menu_chocolate_icon from "../icons/menu_chocolate_icon.png";
import cancel_icon from "../icons/cancel_icon.png";
import { Link } from "react-router-dom";
import colors from "../style-utils/colors";
import text_styles from "../style-utils/text_styles";
import margins from "../style-utils/margins";
import paddings from "../style-utils/paddings";
import { HamburgerCollapse } from "react-animated-burgers";
import account_icon from "../icons/account_icon.png";
import styled from "styled-components";
import HomeHoverDropDown from "./HomeHoverDropDown";
import { useDispatch, useSelector } from "react-redux";
import { redirect } from "react-router-dom";
import { useCallback } from "react";
import { loginActions } from "../store/login-slice";
import { disconnectSocket } from "../client";
//Animated burger is taken form:
//Unkown. 2020. react-animated-burgers. npm. https://www.npmjs.com/package/react-animated-burgers

//This is main navigation bar that opens navigation sidebar and deop down menu to logout and manage account.
export default function Navigation() {
  const { user } = useSelector((state) => state.login);
  const [sidebar, setSideBar] = useState(false);
  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const dispatch = useDispatch();

  function showSideBar() {
    setSideBar(!sidebar);
  }
  //Logout function
  const logout = useCallback(async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}users/logout`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
      }
    );

    if (response.ok) {
      dispatch(
        loginActions.setUser({
          user: undefined,
          isLoggedIn: false,
          token: undefined,
        })
      );
      console.log("Now disconnecting socket");
      disconnectSocket();
    }
  }, []);
  return (
    <>
      {/*Main navigation bar container */}
      <div
        style={{
          backgroundColor: `#${colors.secondary}`,
          height: "5vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/*Menu burger*/}
        <Link
          to="#"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
          onClick={showSideBar}
        >
          <HamburgerCollapse
            buttonWidth={50}
            barColor={`#${colors.chocolate}`}
            buttonStyle={{ marginLeft: margins.med, marginRight: margins.med }}
            isActive={sidebar}
          />
          <span
            style={{
              color: `#${colors.chocolate}`,
              fontWeight: "bold",
              fontSize: text_styles.resizbale_font.med,
            }}
          >
            {" "}
            | Fife Puzzles G26{" "}
          </span>
        </Link>
        {/*Hover drop down menu link container for manage account and logout*/}
        <HomeHoverDropDown setIsOpenDropDown={setIsOpenDropDown} />
      </div>
      {/*Hover drop down. Moves vertically*/}
      <nav
        style={
          isOpenDropDown
            ? {
              backgroundColor: `#${colors.secondary}`,
              width: "15vw",

              position: "fixed",
              display: "flex",
              top: "5vw",
              right: 0,
              transition: "350ms",
              zIndex: 5,
            }
            : {
              width: "15vw",

              position: "fixed",
              display: "flex",
              top: "-100%",
              right: 0,
              transition: "850ms",
              zIndex: 5,
            }
        }
      >
        {isOpenDropDown && (
          <NavLinkContainer
            onMouseEnter={() => setIsOpenDropDown(true)}
            onMouseLeave={() => setIsOpenDropDown(false)}
          >
            <NavOptionLink
              to={"/manage_account"}
              onClick={() => {
                setIsOpenDropDown(false);
              }}
            >
              <NavOptionLinkLabel>Manage Account</NavOptionLinkLabel>
            </NavOptionLink>
            <NavOptionLink
              onClick={() => {
                logout();
                setIsOpenDropDown(false);
              }}
            >
              <NavOptionLinkLabel>Logout</NavOptionLinkLabel>
            </NavOptionLink>
          </NavLinkContainer>
        )}
      </nav>
      {/*Sidebar navigation. Moves horizontally*/}
      <nav
        style={
          sidebar
            ? {
              backgroundColor: `#${colors.secondary}`,
              width: "25vw",
              height: "100vh",
              position: "fixed",
              display: "flex",
              top: "5vw",
              left: 0,
              transition: "350ms",
              zIndex: 10,
            }
            : {
              width: "25vw",
              height: "100vh",
              position: "fixed",
              display: "flex",
              top: 0,
              left: "-100%",
              transition: "850ms",
              zIndex: 10,
            }
        }
      >
        <NavLinkContainer>
          <NavOptionLink to={"/"} onClick={showSideBar}>
            <NavOptionLinkLabel>Home</NavOptionLinkLabel>
          </NavOptionLink>
          <NavOptionLink to={"/sudoku"} onClick={showSideBar}>
            <NavOptionLinkLabel>Sudoku</NavOptionLinkLabel>
          </NavOptionLink>
          {user.role != "solver" && (
            <NavOptionLink to={"/sudoku_create"} onClick={showSideBar}>
              <NavOptionLinkLabel>Create Sudoku</NavOptionLinkLabel>
            </NavOptionLink>
          )}
          <NavOptionLink to={"/8s_puzzle"} onClick={showSideBar}>
            <NavOptionLinkLabel>8's Puzzle</NavOptionLinkLabel>
          </NavOptionLink>
          {user.role != "solver" && (
            <NavOptionLink to={"/create_8s_puzzle"} onClick={showSideBar}>
              <NavOptionLinkLabel>Create 8s Puzzle</NavOptionLinkLabel>
            </NavOptionLink>
          )}
          <NavOptionLink to={"/hashi"} onClick={showSideBar}>
            <NavOptionLinkLabel>Hashi</NavOptionLinkLabel>
          </NavOptionLink>
          {user.role != "solver" && (
            <NavOptionLink to={"/create_hashi_menu"} onClick={showSideBar}>
              <NavOptionLinkLabel>Create Hashi</NavOptionLinkLabel>
            </NavOptionLink>
          )}
        </NavLinkContainer>
      </nav>
    </>
  );
}
const NavLinkContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const NavOptionLink = styled(Link)`
  text-decoration: none;
  display: flex;
  padding-top: ${paddings.med}px;
  padding-bottom: ${paddings.med}px;
  width: inherit;
  justify-content: center;
  margin-top: ${margins.med}px;
  margin-bottom: ${margins.med}px;
  color: #${colors.chocolate};
  &:hover {
    background-color: #${colors.chocolate};
    color: #${colors.minor};
  }
`;
const NavOptionLinkLabel = styled.span`
  font-size: ${text_styles.resizbale_font.small_med};
`;
