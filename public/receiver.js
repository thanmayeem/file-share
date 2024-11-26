document.addEventListener("DOMContentLoaded", () => {
    const socket = io("http://localhost:5000");
    const connectButton = document.querySelector("#receiver-start-btn");
    const joinInput = document.querySelector("#join-id");
    let fileBuffer = [];
    let fileMetadata = null;

    // Receiver joins the Room
    connectButton.addEventListener("click", () => {
        const roomID = joinInput.value.trim();

        if (roomID) {
            socket.emit("receiver.join", { uid: roomID });
            alert(`Joined Room: ${roomID}`);
        }
    });

    // Receive file metadata
    socket.on("file-metadata", (metadata) => {
        console.log("File metadata received:", metadata);
        fileMetadata = metadata;
        fileBuffer = [];
    });

    // Receive file chunks
    socket.on("file-chunk", (data) => {
        console.log("File chunk received");
        fileBuffer.push(data.chunk);

        // Check if file is fully received
        const receivedSize = fileBuffer.reduce((acc, chunk) => acc + chunk.byteLength, 0);

        if (receivedSize === fileMetadata.size) {
            // Create a Blob from the chunks
            const blob = new Blob(fileBuffer, { type: fileMetadata.type });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileMetadata.filename;
            link.textContent = `Download ${fileMetadata.filename}`;
            document.body.appendChild(link);
        }
    });
});
