# File Explorer in Rust

This project is a file explorer built with Rust and powered by Tauri. Currently, it allows users to browse through files and folders, and perform basic file searches. 

### Features:
- **Browse Files & Folders:** Navigate through your file system.
- **Search Files:** Search for files on your disk (note: the search is currently disk-based and may not be as fast as desired).
- **Create Files:** Create Files in the current Directory
- **Open File** You can now open Files with a right click dropdown menu

### Performance:
The search functionality is currently a bit faster compared to the Windows File Explorer when searching the entire disk. Improvements are planned for future releases to enhance search speed and efficiency. Another Problem right now is that right now that you have to type the intire file name with the file type to get the Result

### Tech Stack:
- **Backend:** Rust
- **Frontend:** React (via Tauri for native desktop apps)

### Planned Features:
- **Improved Search:** Optimizing the search functionality.

- **Enhanced User Interface:** Further refinements to the UI.

### Contributing:
Feel free to contribute to this project! If you have ideas for improvements or want to help out, please submit a pull request.

### Installation & Setup:

1. Clone the repository:
   ```bash
   git clone <repo-url>
   ```

2. Change into Project Folder:
```bash
cd Rust-File-Explorer
```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the app:
   ```bash
   npm run tauri dev
   ```

### License:
This project is open-source, and contributions are welcome!

---

