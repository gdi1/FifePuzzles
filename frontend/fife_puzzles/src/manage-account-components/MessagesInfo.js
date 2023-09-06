import { TitleInfoBlock } from "./PromotionRequestsInfoBlock";
import React, { useEffect } from "react";
import MessageInfoBlock from "./MessageInfoBlock";
import text_styles from "../style-utils/text_styles";
import margins from "../style-utils/margins";
import { useSelector } from "react-redux";
import { ScrollView } from "react-native";

const MessagesInfo = (props) => {
  const { messages, setMessagesAsSeen } = props;
  const { user } = useSelector((state) => state.login);
  //<TitleInfoBlock>Messages</TitleInfoBlock>
  useEffect(() => {
    if (user.numberOfNewMessages !== 0) setMessagesAsSeen();
  }, [user.numberOfNewMessages]);
  return (
    <React.Fragment>
      {messages.length === 0 && (
        <TitleInfoBlock
          style={{
            fontSize: `${text_styles.resizbale_font.med}`,
            borderBottom: "none",
            marginTop: `${margins.xsmall}vw`,
          }}
        >
          No messages.
        </TitleInfoBlock>
      )}
      <ScrollView
        style={{
          display: "flex",
          flexDirection: "column",
          height: 100,
        }}
      >
        {messages.map((message) => (
          <MessageInfoBlock
            key={message.sentAt}
            message={message}
          ></MessageInfoBlock>
        ))}
      </ScrollView>
    </React.Fragment>
  );
};

export default MessagesInfo;
