# Usamos una imagen de Node ligera
FROM node:22-alpine

# Creamos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de Vite
EXPOSE 5173

# Comando para arrancar Vite con el host abierto para ngrok
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]