import { Server, Socket as IOSocket } from "socket.io";
import { Server as HttpServer } from "http";

let connection: Socket = null;

export class Socket {
	socket: IOSocket;

	constructor() {
		this.socket = null;
	}

	connect(server: HttpServer) {
		const io = new Server(server, {
			cors: {
				origin: "https://browserheroes.com",
			},
		});

		console.log("Socket.connect");

		io.on("connection", (socket) => {
			console.log("Socket connected");
			console.log(socket.id);
			this.socket = socket;
		});

		io.on("error", (error) => {
			console.error("Socket error:", error);
		});
	}

	emit(event: string, data: any) {
		console.log("Emitting", this.socket, event, data);
		this.socket?.emit(event, data);
	}

	static init(server: HttpServer) {
		if (!connection) {
			connection = new Socket();
			connection.connect(server);
		}
	}

	static get() {
		return connection;
	}
}

export default {
	connect: Socket.init,
	connection: Socket.get,
};
