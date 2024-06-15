import express from "express";
import expressWebsockets from "express-ws";
import { Server } from "@hocuspocus/server";

const server = Server.configure({
  name: "hocuspocus-fra1-01",
  timeout: 4000, // connection healthcheck interval
  debounce: 5000, // call onStoreDocument hook
  maxDebounce: 50000, // make sure to call above onStoreDocument hook atleast
  quiet: false,
  async onListen(data) {
    console.log(`Websokcet Server is listening on port "${data.port}"!`);
  },
  async onConnect(data) {
    console.log(`New websocket connection: ${data.documentName}`);
  },
  async connected() {
    console.log("connections:", server.getConnectionsCount());
  },
  async onConfigure(data) {
    // Output some information
    console.log(`Server was configured!`);
  },
  async onDisconnect(data) {
    // Output some information
    console.log(`client disconnected.`);
  },
});

const { app } = expressWebsockets(express());
app.set("trust proxy", true)

// Parse incoming requests data
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get("/", async (_req, res) => {
  res.send("Experss App")
})
app.get("/ws-connection", (req, res) => {
  res.send({
    "connections": Server.getConnectionsCount(),
    "documents": Server.getDocumentsCount(),
  });
})

app.ws("/collaboration", (websocket, request) => {

  server.handleConnection(websocket, request); // starts websocket connection
});

app.listen(5000, () => console.log("Listening on http://127.0.0.1:" + 5000));