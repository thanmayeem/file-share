document.addEventListener("DOMContentLoaded", () => {
    const socket = io("http://localhost:5000");

    let receiverID;
    const fileInput = document.querySelector("#file-input");

    // Generate Room ID and set up room for sharing
    const createRoomButton = document.querySelector("#sender-start-btn");
    createRoomButton.addEventListener("click", () => {
        const roomID = `${Math.trunc(Math.random() * 999)}.${Math.trunc(Math.random() * 999)}.${Math.trunc(Math.random() * 999)}`;
        document.querySelector("#join-id").innerHTML = `<b>Room ID</b><span>${roomID}</span>`;

        socket.emit("sender.join", { uid: roomID });

        socket.on("init", (uid) => {
            receiverID = uid;
            document.querySelector(".sharing").classList.remove("active");
            document.querySelector(".fileShare-screen").classList.add("active");
        });
    });

    // When a file is selected
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];

        if (file) {
            const metadata = {
                filename: file.name,
                size: file.size,
                type: file.type,
                uid: receiverID,
            };

            // Send metadata to receiver
            socket.emit("file-metadata", metadata);

            // Send file chunks
            const chunkSize = 64 * 1024; // 64 KB
            const reader = new FileReader();
            let offset = 0;

            reader.onload = (event) => {
                socket.emit("file-chunk", {
                    uid: receiverID,
                    chunk: event.target.result,
                });

                offset += chunkSize;

                if (offset < file.size) {
                    readSlice(offset);
                }
            };

            const readSlice = (o) => {
                const slice = file.slice(o, o + chunkSize);
                reader.readAsArrayBuffer(slice);
            };

            readSlice(0); // Start reading the file
        }
    });
});
