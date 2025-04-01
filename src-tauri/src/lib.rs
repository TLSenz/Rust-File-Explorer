// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/


use sysinfo::{Disks};
use walkdir::WalkDir;



#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet,get_partition_of_disk, get_directorys])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}



#[tauri::command]
fn get_partition_of_disk() -> Vec<String>{


        let disks = Disks::new_with_refreshed_list();

        let mut list_of_disk:Vec<String> = Vec::new();

        for disk in disks.list() {
            list_of_disk.push(disk.mount_point().to_str().unwrap_or("unknown").to_string())
        }

        list_of_disk
}


#[tauri::command]
fn get_directorys(parent_directory : &str) -> Vec<String>{

    let mut directory = Vec::new();

        for entry in WalkDir::new(parent_directory).max_depth(1).into_iter() {
       match entry{
            Ok(entry) => {
                println!("{}", entry.path().display());
                directory.push(entry.path().to_string_lossy().into_owned());
            }
            Err(E) =>{
                println!("{}", E)
            }
        }
    }
    directory

}