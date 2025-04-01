import {useEffect, useState} from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");
    const [disk, setDisks] = useState([])
    const [dir, setDir] = useState([])

    async function greet() {
        // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
        setGreetMsg(await invoke("greet", {name}));
    }

    async function getFileDisks() {
        setDisks(await invoke("get_partition_of_disk"))
    }


    async function getDirs(parentDirectoryDir) {
        setDir(await invoke("get_directorys", { parentDirectory: parentDirectoryDir }))
    }

        useEffect(() => {
            getFileDisks()
            getDirs("C:\\")

        }, [])


    const handleInput = (indexDir) => {
        console.log(indexDir)
        dir.map((item, index) => {
            if(index === indexDir){
                getDirs(item)
            }
        })

    }

        return (
            <div>
                {
                    disk.map((item, index) => {
                        return (<h1 key={index} >{item}</h1>)
                    })

                }
                <ul>
                    {
                        dir.map((item, index) => {
                            return (<li key={index} keys={index} onClick={() => handleInput(index)}>{item}</li>);
                        })
                    }
                </ul>
            </div>

        )

}

export default App;
