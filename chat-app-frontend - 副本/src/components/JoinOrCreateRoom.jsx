import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import chatIcon from "../assets/chat.png";
import { createRoomService, joinRoomService } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinOrCreateRoom = () => {
  const [details, setDetails] = useState({
    userName: "",
    roomId: "",
  });

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();

  const navigate = useNavigate();

  function handleInputChange(event) {
    setDetails({ ...details, [event.target.name]: event.target.value });
  }

  async function joinRoom() {
    if (validateInput()) {
      //call api to join room
      try {
        const response = await joinRoomService(details.roomId);
        toast.success("Joined room successfully!!");

        //set the context
        setRoomId(response.roomId);
        setCurrentUser(details.userName);
        setConnected(true);

        //navigate to room
        navigate("/chat");
      } catch (error) {
        if (error.status === 400) {
          toast.error("Room does not exist");
        } else {
          toast.error("Failed to join room");
        }
      }
    }
  }

  async function createRoom() {
    if (validateInput()) {
      //call api to create room
      try {
        const response = await createRoomService(details.roomId);
        toast.success("Room created successfully!!");

        //set the context
        setRoomId(response.roomId);
        setCurrentUser(details.userName);
        setConnected(true);

        //navigate to room
        navigate("/chat");
      } catch (error) {
        if (error.status === 400) {
          toast.error("Room already exists");
        } else {
          toast.error("Unable to create room");
        }
      }
    }
  }

  function validateInput() {
    if (details.roomId === "" || details.userName === "") {
      console.log("in validate func");
      toast.error("Invalid input");
      return false;
    }
    return true;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-10 border dark:border-gray-700 w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900">
        <div>
          <img src={chatIcon} className="w-24 h-24 mx-auto" />
        </div>
        <h1 className="text-2xl font-semibold text-center shadow">
          Join Or Create a Room
        </h1>
        <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="userName"
            onChange={handleInputChange}
            value={details.userName}
            placeholder="Enter name"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="">
          <label htmlFor="roomId" className="block font-medium mb-2">
            Room ID / New Room ID
          </label>
          <input
            type="text"
            id="roomId"
            name="roomId"
            value={details.roomId}
            placeholder="Enter Room ID"
            onChange={handleInputChange}
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-center gap-8 mt-4">
          <button
            onClick={joinRoom}
            className="px-3 py-2 cursor-pointer rounded-lg dark:bg-blue-500 hover:dark:bg-blue-800"
          >
            Join Room
          </button>
          <button
            onClick={createRoom}
            className="px-3 py-2 cursor-pointer rounded-lg dark:bg-green-500 hover:dark:bg-green-800"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinOrCreateRoom;
