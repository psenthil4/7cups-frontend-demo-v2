import React, { useEffect, useRef } from "react";
import io from "socket.io-client";
import "./ChatRoom.css";
import useChat from "../useChat";

let endPoint = "http://35.188.189.237:8000";
let socket = io.connect(`${endPoint}`);

const ChatRoom = (props) => {
  const { chat_id, user_id, is_listener } = props.match.params;
  const { messages, setMessages } = React.useState([]);
  const { message, setMessage } = React.useState("");
  const [predictions, setPredictions] = React.useState([]);
  // const suggestions = ["nice message", "click this", "howdy"]
  const messageRef = useRef()
  
  // const handleNewMessageChange = (event) => {
  //   setNewMessage(event.target.value);
  // };

  // const handleSendMessage = () => {
  //   sendMessage(newMessage);
  //   setNewMessage("");
  // };

  socket.on("error", args => {
    alert("Received error from backend: " + args);
  });

  socket.on("new_message", args => {
    setMessages([...messages, {"is_listener": args["is_listener"], "utterance": args["utterance"]}]);
    setPredictions(args["predictions"]);
  });

  socket.on("dump_logs_success", () => {
    console.log("Dumped logs successfully");
  });
  
  const onChangeMessage = e => {
    setMessage(e.target.value);
  };

  const onSendMessage = () => {
    if (message !== "") {
      socket.emit("add_message", is_listener, message);
      setMessage("");
    } else {
      alert("Please add a message.");
    }
  };

  const onSelectPred = x => {
    socket.emit("log_click", is_listener, predictions.findIndex(x));
    setMessage(x);
  };

  const onDumpLogs = () => {
    socket.emit("dump_logs");
  };

  const onClearSession = () => {
    socket.emit("clear_session");
  };

  console.log(user_id)
  console.log(is_listener)

  // useEffect(() => {
  //   messageRef?.current.scrollIntoView({behavior: "smooth"})
  // }, [messages])

  return (
    <>
      <div className="chat">
        <header className="chat__header">
          <div className="chat__header-container">
            <div className="chat__header-item">
              <div className="chat__item-group">
                <div><img src="/user_logo.png" alt="user logo" /></div>
                <h5>{is_listener ? "Listener" : "Client"}</h5>
              </div>
            </div>
            {!is_listener && <div className="chat__header-item">
              <div className="chat__item-group">
                <button onClick={() => onClearSession()} className="chat__button">Clear Session</button>
                <button onClick={() => onDumpLogs()} className="chat__button">Dump Logs</button>
              </div>
            </div>}

          </div>
        </header>
        <section className="chat__body">
          <div className="chat__body-container" >
            <ol className="chat__messages-list">
              {
                messages.map((message, i) => (
                  <li
                    key={i}
                    ref={messageRef}
                    className={`chat__message-item ${message.ownedByCurrentUser ? "my-message" : "received-message"
                      }`}
                  >
                    {message.body}
                  </li>
                ))}
            </ol>
          </div>
        </section>
        <section className="chat__suggestion">
          {is_listener && <div className="chat__suggestion-container">
            <div className="chat__suggestion-group">
              {predictions.map(i => (<button onClick={() => onSelectPred(i)} className="chat__suggestion-button">{i}</button>))}
            </div>
          </div>}

        </section>
        <section className="chat__input">
          <div className="chat__input-wrapper">
            <input value={message}
              onChange={onChangeMessage}
              placeholder="Write message..." />
            <button onClick={onSendMessage} className="submit__icon">
              <img src="/send_button.png" alt="send button" />
            </button>
          </div>
        </section>
      </div>
    </>
    // <div className="chat-room-container">
    //   <h1 className="room-name">Room: {roomId}</h1>
    //   <h1 className="chat-ID">User ID: {userID}</h1>
    //   <div className="messages-container">
    //     <ol className="messages-list">
    // {messages.map((message, i) => (
    //   <li
    //     key={i}
    //     className={`message-item ${
    //       message.ownedByCurrentUser ? "my-message" : "received-message"
    //     }`}
    //   >
    //     {message.body}
    //   </li>
    // ))}
    //     </ol>
    //   </div>
    //   <textarea
    // value={newMessage}
    // onChange={handleNewMessageChange}
    // placeholder="Write message..."
    //     className="new-message-input-field"
    //   />
    //   <button onClick={handleSendMessage} className="send-message-button">
    //     Send
    //   </button>
    // </div>
  );
};

export default ChatRoom;
