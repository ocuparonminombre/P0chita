# 🔧 Solución: Error "Connection Failed"

## Pasos para Diagnosticar y Solucionar

### 1. ✅ Verificar que el servidor esté corriendo

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
node servidor.js
```

Deberías ver:
```
Firebase Admin inicializado correctamente
Servidor corriendo en http://localhost:3000
```

**Si ves un error**, puede ser:
- `firebase-admin` no está instalado → Ejecuta: `npm install`
- `serviceaccount.json` no existe o está mal → Verifica que el archivo esté en la raíz

---

### 2. 🔍 Verificar en la Consola del Navegador

1. Abre `http://localhost:3000` en tu navegador
2. Presiona `F12` para abrir las herramientas de desarrollador
3. Ve a la pestaña **Console**
4. Haz clic en "Iniciar Sesión con Google"
5. Revisa los mensajes en la consola

**Mensajes esperados:**
- `Iniciando login con Google...`
- `Login exitoso: [Tu nombre]`
- `Token obtenido, conectando al servidor...`
- `Intentando conectar con token: Token presente`
- `¡Conectado al servidor exitosamente!`

**Si ves errores:**
- `Error de conexión: ...` → Revisa el paso 3
- `autenticacion requerida` → Revisa el paso 4

---

### 3. 🌐 Verificar que el Servidor esté Escuchando

En la terminal donde corre el servidor, deberías ver:

**Cuando alguien intenta conectarse:**
```
🔐 Nueva conexión intentando autenticarse...
📦 Auth data recibida: { token: '...' }
🔍 Verificando token de Firebase...
✅ Token verificado correctamente para: [Nombre]
Usuario verificado: [Nombre] entró al chat
```

**Si ves:**
- `❌ Firebase no está inicializado` → El archivo `serviceaccount.json` no se encontró
- `❌ No se recibió token de autenticación` → El token no se está enviando desde el cliente
- `❌ Error de autenticacion: ...` → Problema con el token de Firebase

---

### 4. 🔑 Verificar Autenticación de Google en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **syscolabora**
3. Ve a **Authentication** > **Sign-in method**
4. Verifica que **Google** esté **habilitado**
5. Si no está habilitado, actívalo y guarda

---

### 5. 🧪 Probar Conexión Directa

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Verificar que Socket.IO esté cargado
console.log(typeof io);

// Intentar conexión simple (sin autenticación)
const testSocket = io('http://localhost:3000');
testSocket.on('connect', () => console.log('✅ Conexión básica funciona'));
testSocket.on('connect_error', (err) => console.error('❌ Error:', err));
```

---

### 6. 🔄 Reiniciar Todo

1. **Detén el servidor** (Ctrl+C en la terminal)
2. **Cierra el navegador** completamente
3. **Vuelve a iniciar el servidor**: `node servidor.js`
4. **Abre el navegador** en modo incógnito: `http://localhost:3000`
5. **Intenta conectarte de nuevo**

---

## Errores Comunes y Soluciones

### Error: "Firebase no está configurado"
**Solución:** Verifica que `serviceaccount.json` esté en la raíz del proyecto (mismo nivel que `servidor.js`)

### Error: "autenticacion requerida"
**Solución:** 
- Verifica que Google Authentication esté habilitado en Firebase
- Verifica que el token se esté obteniendo correctamente (revisa la consola del navegador)

### Error: "Connection refused" o "ECONNREFUSED"
**Solución:** El servidor no está corriendo. Ejecuta `node servidor.js`

### Error: "CORS policy"
**Solución:** Ya está configurado en el servidor, pero si persiste, verifica que estés accediendo desde `http://localhost:3000`

---

## 📝 Checklist Final

- [ ] Servidor corriendo (`node servidor.js`)
- [ ] `serviceaccount.json` existe en la raíz
- [ ] Google Authentication habilitado en Firebase
- [ ] Navegador abierto en `http://localhost:3000`
- [ ] Consola del navegador abierta (F12)
- [ ] Sin errores en la consola del servidor
- [ ] Token se obtiene correctamente (ver en consola del navegador)

---

## 🆘 Si Nada Funciona

1. **Comparte los logs del servidor** (lo que aparece en la terminal)
2. **Comparte los errores de la consola del navegador** (F12 > Console)
3. **Verifica la versión de Node.js**: `node --version` (debe ser 14 o superior)

