CLIENT_ELECTRON
--Crear un proyecto con electron
    npm init -y
    npm install electron --save-dev
--Inicializar un proyecto con electron
    npm start 

SERVER_ROUTER
--Crear un proyecto con express
    npm init -y
    npm install express

SERVER ROOM 
Servidor que alberga los sockets 

Intalarlo
--pip install grpcio grpcio-tools

Compilar .proto
--python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. battleship.proto
