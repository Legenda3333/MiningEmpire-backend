import express from 'express';
const app = express();

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("My first server");
});

app.listen(port, () => {`Сервер запущен на порту ${port}`});