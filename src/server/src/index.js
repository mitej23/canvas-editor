import express from "express";
import expressWebsockets from "express-ws";
import { Server } from "@hocuspocus/server";

const server = Server.configure({
  name: "hocuspocus-fra1-01",
  timeout: 4000, // connection healthcheck interval
  debounce: 5000, // call onStoreDocument hook
  maxDebounce: 5000, // make sure to call above onStoreDocument hook atleast
  quiet: false,
  async onConfigure(data) {
    // Output some information
    console.log(`Server was configured!`);
  },
  async onConnect(data) {
    console.log(`New websocket connection: ${data.documentName}`);
  },
  async onLoadDocument() {
    console.log("Load document from server")
  },
  async connected() {
    console.log("connections:", server.getConnectionsCount());
  },
  async onStoreDocument({
    clientsCount,
    context,
    document,
    documentName,
    instance,
    requestHeaders,
    requestParameters,
    socketId,
  }) {
    console.log("On store document")
    // console.log("document", document)
    console.log("documentname ", documentName)
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