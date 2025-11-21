const express = require('express');
const app = express();
const http = require('http');
const io = new Server(server);
const server = http.createServer(app);
const { Server } = require("socket.io");
const conecctedUsers = {};
const serviceaccount = require('./serviceaccount.json');
const admin = require('firebase-admin');
const { text } = require('stream/consumers');
const { time } = require('console');
admin.initializeApp({
  credential: admin.credential.cert(serviceaccount)
});
/*const db = admin.firestore();*/
app.use(express.static('FROND'));
//importante este es el medidador 
io.use(async (socket, next) => {  
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("autenticacion requerida"));
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        socket.user={
            uid: decodedToken.uid,
            name: decodedToken.name,
            picture: decodedToken.picture,
            email: decodedToken.email
            
        };
        next();
    }catch (error) {
        console.log("error de autenticacion", error);
        next (new Error("autenticacion requerida"));
    }   
});
//chatchatchat
    io.on('connection', (socket) => {
        const currentUser = socket.user;
        console.log(`iam verificado :${currentUser.name}$ entro al chat`);

        io.emit('user connected', {
            text: `${currentUser.name} se ha unido al chat`,
            type: 'conectado'       
        });
        socket.on('chat message', (msg) => {
            io.emit('chat message', {
                user: currentUser,
                avatar: currentUser.picture,
                text: msg,
                time: new Date().toLocaleDateString() 
            });
        });
        socket.on('disconnect', () => { 
            io.emit('user disconnected', {
                text: `${currentUser.name} ha salido del chat`,
                type: 'desconectado'       
            });
            console.log(`el usuario :${currentUser.name}$ salio del chat`);
        }   );





    });
    server.listen(3000, () => {
        console.log('servidor corriendo en http://localhost:3000');
    });



