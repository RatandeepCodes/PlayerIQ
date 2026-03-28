const sampleEvents = [
  { minute: 3, playerId: "10", rating: 72, ppi: 68 },
  { minute: 21, playerId: "10", rating: 75, ppi: 74 },
  { minute: 67, playerId: "10", rating: 81, ppi: 83 },
];

export const registerSimulationHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("simulation:start", ({ matchId }) => {
      sampleEvents.forEach((event, index) => {
        setTimeout(() => {
          socket.emit("simulation:update", {
            matchId,
            ...event,
          });
        }, 1200 * (index + 1));
      });
    });
  });
};

