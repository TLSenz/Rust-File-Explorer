use sysinfo::{Disks};
use walkdir::WalkDir;
use std::path::Path;
use std::sync::{Arc, Mutex};
use tauri::State;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


struct BackStack {
    history: Mutex<Vec<String>>,
}




#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Arc::new(BackStack {
            history: Mutex::new(Vec::new()),
        }))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_partition_of_disk, get_directorys, file_search])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_partition_of_disk() -> Vec<String> {
    let disks = Disks::new_with_refreshed_list();
    let mut list_of_disk: Vec<String> = Vec::new();

    for disk in disks.list() {
        list_of_disk.push(disk.mount_point().to_str().unwrap_or("unknown").to_string())
    }

    list_of_disk
}

#[tauri::command]
fn get_directorys(parent_directory: &str, state: State<Arc<BackStack>>) -> Result<Vec<String>, String> {
    let mut history = state.history.lock().unwrap();
    let mut directory = Vec::new();

    for entry in WalkDir::new(parent_directory).max_depth(1).into_iter() {
        match entry {
            Ok(entry) => {
                println!("{}", entry.path().display());
                directory.push(entry.path().to_string_lossy().into_owned());
            }
            Err(e) => {
                // Return the error message to the frontend
                return Err(format!("Error reading directory: {}", e));
            }
        }
    }
    history.push(parent_directory.clone().parse().unwrap());
    Ok(directory)
}

#[tauri::command]
fn file_search(filename:String, state: State<Arc<BackStack>>) -> (String, String, bool){
    println!("Hello");
    let mut history = state.history.lock().unwrap();
    let mut  result:(String,String, bool) = ( "Not Found".parse().unwrap(), "Not Found".parse().unwrap(), false);

    for entry in WalkDir::new(history.last().unwrap()) // Replace with your own logic for `history`
        .into_iter()
        .filter_map(Result::ok) // Filter out errors
    {
        println!("{}", entry.path().display());
        // Access the file name
        let file_name = entry.file_name().to_string_lossy(); // Convert OsString to String


        println!("{}", file_name);
        // Compare the file name with 'filename'
        if file_name == filename{
            println!("Found file: {}", file_name);
            result = (entry.path().to_string_lossy().parse().unwrap(), filename.clone(), true);

        }
    }
    println!("filename: {}", filename);
    result

}