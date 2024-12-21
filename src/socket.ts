import { Server, Socket as IOSocket } from "socket.io";
import { Server as HttpServer } from "http";

let connection: Socket = null;

export class Socket {
	server: Server;
	socket: IOSocket;

	constructor() {
		this.socket = null;
	}

	connect(server: HttpServer) {
		this.server = new Server(server, {
			cors: {
				origin: "https://browserheroes.com",
			},
		});

		this.server.on("connection", (socket) => {
			console.log("User connected", socket.id);
			this.socket = socket;
		});
	}

	emit(event: string, data: any) {
		this.server?.sockets.emit(event, data);
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
