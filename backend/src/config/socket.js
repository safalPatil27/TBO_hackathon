import { Server } from 'socket.io';

const socketConfig = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*', // Update as per your frontend's origin
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('message', (data) => {
            console.log('Message received:', data);
            io.emit('message', data); // Broadcast to all clients
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export default socketConfig;
