import { httpClient } from "../config/AxiosHelper";

export const createRoomService = async (roomId) => {
  const response = await httpClient.post("/api/v1/rooms", roomId, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
  return response.data;
};

export const joinRoomService = async (roomId) => {
  const response = await httpClient.get(`api/v1/rooms/${roomId}`);
  return response.data;
};

export const getRoomMessages = async (roomId) => {
  const response = await httpClient.get(`api/v1/rooms/${roomId}/messages`);
  return response.data;
};
