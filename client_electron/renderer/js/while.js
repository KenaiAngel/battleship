let socket;

    function log(msg) {
      document.getElementById("log").textContent += msg + "\n";
    }

    function conectar() {
      socket = new WebSocket("ws://localhost:9000");

      socket.onopen = () => {
        log("🟢 Conectado al WebSocket");

        const initData = {
          user_id: "jugador1",
          code: "ABC123" // <-- Reemplaza con el código real de partida
        };
        socket.send(JSON.stringify(initData));
        log("📨 Enviado init: " + JSON.stringify(initData));
      };

      socket.onmessage = (event) => {
        log("📥 Mensaje recibido: " + event.data);
      };

      socket.onclose = () => {
        log("🔴 Conexión cerrada");
      };

      socket.onerror = (error) => {
        log("❌ Error: " + error.message);
      };
    }

    function enviarPosicion() {
      const message = {
        action: "set_position",
        position: [
          { x: 1, y: 1, size: 3, orientation: "H" },
          { x: 3, y: 2, size: 2, orientation: "V" }
        ]
      };
      socket.send(JSON.stringify(message));
      log("🚢 Posiciones enviadas");
    }

    function atacar() {
      const attack = {
        action: "attack",
        x: 1,
        y: 1
      };
      socket.send(JSON.stringify(attack));
      log("🎯 Ataque enviado");
    }