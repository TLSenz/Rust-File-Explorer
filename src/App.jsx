import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [result, setResult] = useState(""); // Initialize result properly
    const [disk, setDisks] = useState([]);
    const [dir, setDir] = useState([]);
    const [verlauf, addVerlauf] = useState(["C:\\"]);
    const [input, setInput] = useState(""); // Add missing input state

    async function search(filename) {
        console.log("Searching for:", filename);
        const searchResult = await invoke("file_search", { filename });
        setResult(searchResult);
        console.log("Finished Searching");
        console.log("Search result:", searchResult);
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

        const handleMouseDown = (event) => {
            if (event.button === 3) { // Right mouse button
                console.log("Back button clicked");
                goBack();
            }
        };

        document.addEventListener("mousedown", handleMouseDown);
        return () => document.removeEventListener("mousedown", handleMouseDown);
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
            </form>

            {result && <p>{result}</p>}

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
