import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import styles from "./overlay.module.css";
import { listen } from "@tauri-apps/api/event";

function App() {
    const [popUpOpen, setOpen] = useState(false);
    const [file, setFile] = useState("");
    const [disk, setDisks] = useState([]);
    const [dir, setDir] = useState([]);
    const [verlauf, addVerlauf] = useState(["C:\\"]);
    const [input, setInput] = useState(""); // Add missing input state

    // State for right-click context menu
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        path: "",
    });

    // Listen for Search completion event
    listen("Search_is_Finished", (event) => {
        console.log("Search Result" + event.payload);
        setDir(event.payload);
    });

    function createFile(filename) {
        invoke("create_file", { filename, currentPath: verlauf[verlauf.length - 1] });
    }

    async function search(filename) {
        console.log("Searching for:", filename);
        invoke("file_search", { filename });
    }

    async function getFileDisks() {
        const disks = await invoke("get_partition_of_disk");
        setDisks(disks);
    }

    async function getDirs(parentDirectoryDir) {
        const directories = await invoke("get_directorys", { parentDirectory: parentDirectoryDir });
        setDir(directories);
    }

    useEffect(() => {
        getFileDisks();
        getDirs("C:\\"); // Load initial directories

        const handleMouseDown = async (event) => {
            if (event.button === 3) { // Right mouse button
                console.log("Back button clicked");
                await goBack();
            }
        };

        document.addEventListener("mousedown", handleMouseDown);

        // Close context menu on click anywhere
        const handleClick = () => setContextMenu((prev) => ({ ...prev, visible: false }));
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    async function goBack() {
        if (verlauf.length > 1) {
            const prevDir = verlauf[verlauf.length - 2];
            addVerlauf(verlauf.slice(0, -1));
            getDirs(prevDir);
        }
    }

    const handleInput = (indexDir) => {
        console.log("Selected directory index:", indexDir);
        const selectedDir = dir[indexDir];
        addVerlauf([...verlauf, selectedDir]);
        getDirs(selectedDir);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        search(input);
    };

    const handleFile = async (e) => {
        console.log(file);
        e.preventDefault();
        setOpen(false);
        createFile(file);
    };

    const handleOverlay = () => {
        setOpen(true);
    };

    // Right-click handler
    const handleContextMenu = (e, path) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            path: path,
        });
    };

    // Handle open file from context menu
    const handleOpenFile = async () => {
        try {
            await invoke("open_file", { filePath: contextMenu.path });
        } catch (err) {
            console.error("Error opening file:", err);
        } finally {
            setContextMenu((prev) => ({ ...prev, visible: false }));
        }
    };

    return (
        <div>
            <h1>Disks</h1>
            {disk.map((item, index) => (
                <h2 key={index}>{item}</h2>
            ))}

            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            <button onClick={handleOverlay}>Create File</button>

            {/* Conditionally render the popup */}
            {popUpOpen && (
                <div className={styles.overlay}>
                    <h3>Create New File</h3>
                    <form onSubmit={handleFile}>
                        <input
                            type="text"
                            value={file}
                            onChange={(e) => setFile(e.target.value)}
                            placeholder="Enter file name"
                        />
                        <button type="submit">Create File</button>
                    </form>
                </div>
            )}

            <button onClick={goBack}>Back</button>
            <h3>Current Directory: {verlauf[verlauf.length - 1]}</h3>

            <ul>
                {dir.map((item, index) => (
                    <li
                        key={index}
                        onClick={() => handleInput(index)}
                        onContextMenu={(e) => handleContextMenu(e, dir[index])} // Right-click to open context menu
                    >
                        {item}
                    </li>
                ))}
            </ul>

            {/* Context Menu */}
            {contextMenu.visible && (
                <ul
                    className="context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x, position: "absolute" }}
                >
                    <li onClick={handleOpenFile}>Open File</li>
                </ul>
            )}
        </div>
    );
}

export default App;
