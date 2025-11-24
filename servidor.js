const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const admin = require('firebase-admin');
const sqlite3 = require('sqlite3').verbose(); // Importar SQLite

const server = http.createServer(app);// Crear servidor HTTP

/*base de datos qlite3 pa no instalar nada :v*/
const db = new sqlite3.Database('./chat.db', (err) => {
    if (err) console.error('error db', err);
    else console.log(' base de datos SQLite conectada');
});

// crea la tabla de mensajes si no existe
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT,
            avatar TEXT,
            text TEXT,
            time TEXT
        )
    `);
});

// Inicializar Socket.IO con configuración CORS
const io = new Server(server, {
    cors: {/*configuramos cors para desarrollo*/
        origin: "*", // Permitir todas las conexiones para desarrollo
        methods: ["GET", "POST"],/*permitimos conexiones GET y POST*/
        credentials: true/*permitimos credenciales*/
    },
    allowEIO3: true/*permitimos compatibilidad con Engine.IO v3 */
});

// Inicializar Firebase Admin (solo si existe serviceaccount.json)
let firebaseInitialized = false;
try {
    const serviceaccount = require('./serviceaccount.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceaccount)
    });
    firebaseInitialized = true;
    console.log('firebase Admin inicializado correctamente');
} catch (error) {
    console.warn(' Advertencia: No se encontró serviceaccount.json. La autenticación no funcionará.');
    console.warn('Para usar autenticación, crea el archivo serviceaccount.json con tus credenciales de Firebase.');
}

// Servir archivos estáticos
app.use(express.static('FROND'));

// Middleware de autenticación
io.use(async (socket, next) => {
    console.log(' Nueva conexión intentando autenticarse...');
    
    if (!firebaseInitialized) {
        return next(new Error("Firebase no está configurado"));
    }
    
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("autenticacion requerida"));
    }
    
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        socket.user = {
            uid: decodedToken.uid,
            name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Usuario',
            picture: decodedToken.picture || '',
            email: decodedToken.email
        };
        console.log(' Token verificado para:', socket.user.name);
        next();
    } catch (error) {
        console.error(" Error auth:", error.message);
        next(new Error("autenticacion fallo"));
    }
});

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
    const currentUser = socket.user;
    console.log(` Usuario conectado: ${currentUser.name}`);

    // --- 2. RECUPERAR HISTORIAL (NUEVO) ---
    // Consultar la BD y enviar mensajes anteriores SOLO al usuario que entra
    db.all("SELECT * FROM messages ORDER BY id ASC", [], (err, rows) => {
        if (err) {
            console.error("Error leyendo historial:", err);
            return;
        }
        rows.forEach((row) => {
            socket.emit('chat_message', {
                user: row.user,
                avatar: row.avatar,
                text: row.text,
                time: row.time
            });
        });
    });

    // Notificar que un usuario se conectó (A todos)
    io.emit('user connected', {
        text: `${currentUser.name} se ha unido al chat`,
        type: 'conectado'
    });

    // Escuchar mensajes del chat
    socket.on('chat_message', (msg) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        // Datos del mensaje
        const messageData = {
            user: currentUser.name,
            avatar: currentUser.picture,
            text: msg,
            time: timeString
        };

        // --- 3. GUARDAR EN BASE DE DATOS (NUEVO) ---
        const stmt = db.prepare("INSERT INTO messages (user, avatar, text, time) VALUES (?, ?, ?, ?)");
        stmt.run(messageData.user, messageData.avatar, messageData.text, messageData.time, (err) => {
            if (err) console.error("Error guardando mensaje:", err);
        });
        stmt.finalize();

        // Enviar a todos los clientes (Broadcast)
        io.emit('chat_message', messageData);
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        io.emit('user disconnected', {
            text: `${currentUser.name} ha salido del chat`,
            type: 'desconectado'
        });
        console.log(` Usuario salió: ${currentUser.name}`);
    });
});

// Iniciar servidor
server.listen(3000, () => {
    console.log(' Servidor corriendo en http://localhost:3000');
    console.log(' Carpeta pública: ./FROND');
});