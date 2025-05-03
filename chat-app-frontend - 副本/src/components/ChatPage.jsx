import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { IoSend } from "react-icons/io5";
import { IoMdAttach } from "react-icons/io";
import { AvatarGenerator } from "random-avatar-generator";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { getRoomMessages } from "../services/RoomService";
import { baseURL } from "../config/AxiosHelper";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const generator = new AvatarGenerator();
  const {
    roomId,
    currentUser,
    connected,
    setRoomId,
    setCurrentUser,
    setConnected,
  } = useChatContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [roomId, currentUser, connected]);

  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);

  // Store avatars in a ref so they persist
  const avatarsRef = useRef(new Map());

  // Function to get or generate an avatar
  const getAvatar = (sender) => {
    if (!avatarsRef.current.has(sender)) {
      avatarsRef.current.set(sender, generator.generateRandomAvatar());
    }
    return avatarsRef.current.get(sender);
  };

  //scroll to bottom of message container
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  //setup connection using SockJS and use it for communication via STOMP protocol
  useEffect(() => {
    const connectWebSocket = () => {
      //create SockJS connection to server at "http://localhost:8080/chat"
      const socket = new SockJS(`${baseURL}/chat`);

      //create a STOMP client over SockJS connection
      const client = Stomp.over(socket);

      client.connect({}, () => {
        setStompClient(client);

        //subscribe to room topic
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log(message);

          //for each message parse and add to existing messages
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };

    //recreate connection when roomId changes

    if (connected) {
      connectWebSocket();
    }
  }, [roomId]);

  useEffect(() => {
    //function to load previous messages of a room
    async function loadMessages() {
      try {
        const messages = await getRoomMessages(roomId);
        setMessages(messages);
      } catch (error) {
        console.log(error);
      }
    }
    if (connected) {
      loadMessages();
    }
  }, []);

  //function to send messages
  async function sendMessage() {
    if (stompClient && connected && input.trim()) {
      //create new message of type MessageRequest
      const newMessage = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      //send the message using stompClient
      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(newMessage)
      );

      setInput("");
    }
  }

  //function to handle logout event
  const handleLogout = () => {
    stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  };

  return (
    <div>
      {/* the header */}
      <header className="dark:bg-gray-700 fixed w-full h-20 py-5 shadow items-center flex justify-around">
        <div>
          <h1 className="text-xl font-semibold">
            Room Name:<span> {roomId}</span>
          </h1>
        </div>
        <div>
          <h1 className="text-xl font-semibold">
            Username: <span>{currentUser}</span>
          </h1>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="rounded-lg dark:bg-red-500 hover:dark:bg-red-700 px-3 py-2 cursor-pointer"
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* the message container */}
      <main
        ref={chatBoxRef}
        className="py-20 px-10 h-screen w-2/3 mx-auto dark:bg-slate-600 overflow-auto"
      >
        {messages.map((message, key) => (
          <div
            key={key}
            className={`flex ${
              message.sender === currentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`my-3 ${
                message.sender === currentUser ? "bg-green-600" : "bg-gray-800"
              } max-w-xs p-2 rounded-lg`}
            >
              <div className="flex flex-row gap-2">
                <img
                  className="h-10 w-10 gap-2"
                  src={getAvatar(message.sender)}
                  alt="icon"
                />
                <div className="flex flex-col gap-1">
                  <p className="font-sm font-bold">{message.sender}</p>
                  <p>{message.content}</p>
                  <p className="text-xs text-gray-300">
                    {timeAgo(message.timeStamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* the icons */}
      <div className="py-2 dark:bg-gray-700 fixed bottom-0 w-full h-16">
        <div className="gap-4 flex items-center justify-between h-full w-2/3 mx-auto ">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
            type="text"
            placeholder="Send a message..."
            className="h-full w-full px-5 py-3 border-2 rounded-full dark:bg-gray-950 dark:border-gray-500 focus:outline-none"
          />
          <div className="flex gap-4">
            <button className="dark:bg-purple-600 dark:hover:bg-purple-700 cursor-pointer h-10 w-10 flex justify-center items-center rounded-full">
              <IoMdAttach size={25} />
            </button>
            <button
              onClick={sendMessage}
              className="dark:bg-green-600 dark:hover:bg-green-700 cursor-pointer h-10 w-10 flex justify-center items-center rounded-full"
            >
              <IoSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
