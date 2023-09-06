import styled from "styled-components";
import margins from "../style-utils/margins";
import paddings from "../style-utils/paddings";
import borders from "../style-utils/borders";
import radiuses from "../style-utils/radiuses";
import colors from "../style-utils/colors";

const MessageInfoBlock = (props) => {
  const { subject, message, sentAt, seen } = props.message;

  return (
    <MessageInfo seen={seen}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `${borders.med}px solid #${colors.creme}`,
          width: "100%",
          paddingBottom: `${paddings.xxsmall}vw`,
        }}
      >
        <Subject>
          <b>Subject: </b>
          {subject}
        </Subject>
        <div style={{ color: `#${colors.creme}` }}>
          {new Date(sentAt).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
      <Message>
        <b>Message:</b>
        <div
          style={{
            padding: `${paddings.xxsmall}vw`,
            background: "white",
            borderRadius: `${radiuses.med}px`,
            color: `#${colors.black}`,
          }}
        >
          {message}
        </div>
      </Message>
    </MessageInfo>
  );
};

const MessageInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: baseline;
  color: #${colors.creme};
  width: 95%;
  margin: ${margins.xxsmall}vw ${margins.xxsmall}vw;
  border: ${borders.med}px solid #${colors.creme};
  padding: ${paddings.xxsmall}vw;
  box-sizing: border-box;
  background-color: ${(props) => (props.seen ? "inherit" : "#696969")};
  border-radius: ${radiuses.med}px;
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1vh;
  width: 100%;
  padding-top: ${paddings.xxsmall}vw;
`;

const Subject = styled.div``;

export default MessageInfoBlock;
