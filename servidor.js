const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const admin = require('firebase-admin');

// Crear servidor HTTP
const server = http.createServer(app);

// Inicializar Socket.IO con configuración CORS
const io = new Server(server, {
    cors: {
        origin: "*", // Permitir todas las conexiones para desarrollo
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true
});

// Inicializar Firebase Admin (solo si existe serviceaccount.json)
let firebaseInitialized = false;
try {
    const serviceaccount = require('./serviceaccount.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceaccount)
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin inicializado correctamente');
} catch (error) {
    console.warn('⚠️ Advertencia: No se encontró serviceaccount.json. La autenticación no funcionará.');
    console.warn('Para usar autenticación, crea el archivo serviceaccount.json con tus credenciales de Firebase.');
}

// Servir archivos estáticos
app.use(express.static('FROND'));

// Middleware de autenticación
io.use(async (socket, next) => {
    console.log('🔐 Nueva conexión intentando autenticarse...');
    console.log('📦 Auth data recibida:', socket.handshake.auth);
    
    if (!firebaseInitialized) {
        console.error('❌ Firebase no está inicializado');
        return next(new Error("Firebase no está configurado"));
    }
    
    const token = socket.handshake.auth.token;
    if (!token) {
        console.error('❌ No se recibió token de autenticación');
        return next(new Error("autenticacion requerida"));
    }
    
    try {
        console.log('🔍 Verificando token de Firebase...');
        const decodedToken = await admin.auth().verifyIdToken(token);
        socket.user = {
            uid: decodedToken.uid,
            name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Usuario',
            picture: decodedToken.picture || '',
            email: decodedToken.email
        };
        console.log('✅ Token verificado correctamente para:', socket.user.name);
        next();
    } catch (error) {
        console.error("❌ Error de autenticacion:", error.message);
        console.error("Detalles del error:", error);
        next(new Error("autenticacion requerida: " + error.message));
    }
});

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
    const currentUser = socket.user;
    console.log(`👤 Usuario verificado: ${currentUser.name} entró al chat`);

    // Notificar que un usuario se conectó
    io.emit('user connected', {
        text: `${currentUser.name} se ha unido al chat`,
        type: 'conectado'
    });

    // Escuchar mensajes del chat
    socket.on('chat_message', (msg) => {
        const now = new Date();
        io.emit('chat_message', {
            user: currentUser.name,
            avatar: currentUser.picture,
            text: msg,
            time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        });
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        io.emit('user disconnected', {
            text: `${currentUser.name} ha salido del chat`,
            type: 'desconectado'
        });
        console.log(`👋 Usuario: ${currentUser.name} salió del chat`);
    });
});

// Iniciar servidor
server.listen(3000, () => {
    console.log('🚀 Servidor corriendo en http://localhost:3000');
    console.log('📁 Archivos estáticos servidos desde: ./FROND');
});

