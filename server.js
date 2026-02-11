import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("./src/db.json"); // مسار ملف db.json بتاعك
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 5000;

server.use(middlewares);
server.use(router);

server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
