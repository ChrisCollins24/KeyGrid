use std::fs;
use std::path::PathBuf;
use tauri::Manager;

/// history.json lives in the app's data folder:
///   macOS:   ~/Library/Application Support/com.keygrid.analyzer/history.json
///   Windows: %APPDATA%\com.keygrid.analyzer\history.json
fn history_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("history.json"))
}

#[tauri::command]
fn load_history(app: tauri::AppHandle) -> Result<String, String> {
    let path = history_path(&app)?;
    match fs::read_to_string(&path) {
        Ok(text) => Ok(text),
        Err(_) => Ok("[]".to_string()),
    }
}

#[tauri::command]
fn save_history(app: tauri::AppHandle, data: String) -> Result<(), String> {
    let path = history_path(&app)?;
    // write to a temp file first, then swap it in, so a crash never leaves a half-written history
    let tmp = path.with_extension("json.tmp");
    fs::write(&tmp, data.as_bytes()).map_err(|e| e.to_string())?;
    fs::rename(&tmp, &path).map_err(|e| e.to_string())
}

#[tauri::command]
fn set_on_top(window: tauri::WebviewWindow, on: bool) -> Result<(), String> {
    window.set_always_on_top(on).map_err(|e| e.to_string())
}

/// Opens an https:// link (credits, notices) in the user's default browser.
#[tauri::command]
fn open_external(url: String) -> Result<(), String> {
    if !url.starts_with("https://") {
        return Err("only https links can be opened".into());
    }
    #[cfg(target_os = "macos")]
    let result = std::process::Command::new("open").arg(&url).spawn();
    #[cfg(target_os = "windows")]
    let result = std::process::Command::new("explorer").arg(&url).spawn();
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    let result = std::process::Command::new("xdg-open").arg(&url).spawn();
    result.map(|_| ()).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_history, save_history, set_on_top, open_external])
        .run(tauri::generate_context!())
        .expect("error while running Keygrid");
}
