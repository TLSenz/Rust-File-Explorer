import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { } from '@tauri-apps/api/event';
import {app} from "@tauri-apps/api";
import {listen} from "@tauri-apps/api/event";

function App() {

listen('Search_is_Finished', (event) => {
    console.log("Search Result" + event.payload);
    setDir(event.payload)
})


    const [popUpOpen, setOpen] = useState(false);
    const [file, setFile] = useState('')
    const [disk, setDisks] = useState([]);
    const [dir, setDir] = useState([]);
    const [verlauf, addVerlauf] = useState(["C:\\"]);
    const [input, setInput] = useState(""); // Add missing input state

    async function search(filename) {
        console.log("Searching for:", filename);
        invoke("file_search", {filename});
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
        e.preventDefault()
        setOpen(false)


    }
    const handleOverlay = () => {
        setOpen(true)
    }


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
                    onChange={(e) => setInput(e.target.value)} // Fix missing input handler
                />
                <button type="submit">Search</button>
                <button type="submit" onClick={handleOverlay}>Create File</button>

            </form>




            {
                popUpOpen &&(
                    <div>
                        <h3>Create New File</h3>

                        <form onSubmit={handleFile}>
                            <input
                                type="text"
                                value={file} // Verknüpft den Wert des Eingabefelds mit dem State
                                onChange={(e) => setFile(e.target.value)} // Setzt den State mit dem Wert des Eingabefelds
                                placeholder="Enter file name"
                            />
                            <button type="submit">Create File</button>
                        </form>
                    </div>
                )
            }



            <button onClick={goBack}>Back</button>
            <h3>Current Directory: {verlauf[verlauf.length - 1]}</h3>

            <ul>
                {dir.map((item, index) => (
                    <li key={index} onClick={() => handleInput(index)}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
