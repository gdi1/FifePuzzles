import GeneralButton from "../components/GeneralButton";
import radiuses from "../style-utils/radiuses";
import colors from "../style-utils/colors";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import paddings from "../style-utils/paddings";
import borders from "../style-utils/borders";
import { loginActions } from "../store/login-slice";
import { utdActions } from "../store/user-to-display-slice";

const SearchedUserInfo = (props) => {
  const {
    user,
    setLeftNavigationChoice,
    setIsHoveringResults,
    setSearchInput,
    recentSearchedUser,
    searchUser,
  } = props;

  const dispatch = useDispatch();

  return (
    <UserInfo recentSearchedUser={recentSearchedUser}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "baseline",
          justifyContent: "space-evenly",
          width: "60%",
          height: "100%",
        }}
      >
        <div>
          <b>User ID</b>: {user._id}
        </div>
        <div>
          <b>Group ID</b>: {user.userID}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "space-evenly",
          justifyContent: "space-evenly",
          width: "40%",
          height: "100%",
        }}
      >
        <div>
          <b>Email</b>: {user.email}
        </div>
        <div>
          <b>Name</b>: {user.name}
        </div>
        <div>
          <b>Role</b>: {user.role}
        </div>
        <div>
          <b>Group</b>: {user.groupID}
        </div>
        <div>
          <b>Status</b>: {user.active ? "active" : "banned"}
        </div>
      </div>
      <GeneralButton
        label={"View"}
        handleButtonPress={async () => {
          setLeftNavigationChoice((prev) => {
            if (prev === "messages") dispatch(loginActions.updateMessages());
            return "display-searched-user";
          });
          console.log("heree");
          dispatch(utdActions.setShowUser(true));
          setIsHoveringResults(false);
          setSearchInput("");
          console.log("heree");

          if (recentSearchedUser) {
            dispatch(utdActions.setIsFetchingRecentUser(true));
            await searchUser(user._id);
            dispatch(utdActions.setIsFetchingRecentUser(false));
          }
        }}
      />
    </UserInfo>
  );
};

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  color: #${colors.darkerChocolate};
  width: 98%;
  margin: auto;
  border: ${borders.med}px solid #${colors.chocolate};
  padding: ${paddings.xxsmall}vw;
  box-sizing: border-box;
  border-radius: ${radiuses.med}px;
  gap: 1vw;
  height: ${(props) => (props.recentSearchedUser ? "20vh" : "80%")};
`;

export default SearchedUserInfo;
