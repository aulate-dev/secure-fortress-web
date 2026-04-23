# 🛡️ Secure Fortress - Web Interface

Este repositorio contiene la interfaz de usuario construida con **React, TypeScript y Vite**. Está diseñada para interactuar con la Secure Fortress API y permite la gestión de inventario y visualización de registros de auditoría.

## 🚀 Guía de Configuración (Solo Docker)

### 1. Levantar el Entorno
Este comando prepara el entorno de desarrollo de Vite dentro de un contenedor:
```bash
docker-compose up -d --build
```

### 2. Acceso a la Plataforma
Una vez que el contenedor esté corriendo, la aplicación estará disponible en:
👉 **URL:** `http://localhost:5173`

---

## 🛠️ Características Implementadas

- **Dashboard Dinámico:** Visualización de productos según el rol del usuario.
- **Gestión de Sesión:** Implementación de persistencia de sesión segura y logout automático por inactividad.
- **Seguridad en UI:** - Protección de rutas por roles (RBAC).
  - Manejo de cookies `HttpOnly` para evitar ataques XSS.
  - Validación de formularios y sanitización de entradas.
- **Logs de Auditoría:** Interfaz para que el `SuperAdmin` visualice logs de sistema en tiempo real.

---

## 🔐 Pruebas de Acceso (Integración)

Para que el frontend funcione correctamente, asegúrese de que el **Backend API** esté arriba y los **seeds** hayan sido ejecutados. Use las siguientes credenciales para probar los flujos:

| Nivel de Acceso | Email | Password |
| :--- | :--- | :--- |
| **Control Total** | `admin@fortress.com` | `Secur3Seed!Admin2026` |
| **Solo Lectura** | `auditor@fortress.com` | `Secur3Seed!Audit2026` |
| **Gestión Stock** | `registrador@fortress.com` | `Secur3Seed!Reg2026` |

---

## 🐳 Comandos Útiles de Docker

- **Ver logs de Vite:** `docker-compose logs -f secure-fortress-web`
- **Reiniciar el contenedor:**
  `docker-compose restart secure-fortress-web`
- **Limpieza de volúmenes (en caso de errores de caché):**
  `docker-compose down -v && docker-compose up -d`

---

> **⚠️ Nota de Red:** El frontend está configurado para comunicarse con la API en `http://localhost:3000`. Si cambias el puerto del backend en el archivo `.env`, asegúrate de actualizar la variable `VITE_API_URL` en el entorno del frontend.