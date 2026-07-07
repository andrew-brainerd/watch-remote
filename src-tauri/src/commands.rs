use crate::roku::{self, DeviceInfo, RokuApp};

#[tauri::command]
pub fn ping() -> &'static str {
    "pong"
}

#[tauri::command]
pub async fn roku_launch(
    ip: String,
    channel_id: String,
    content_id: Option<String>,
    media_type: Option<String>,
) -> Result<(), String> {
    roku::launch(&ip, &channel_id, content_id.as_deref(), media_type.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn roku_install(ip: String, channel_id: String) -> Result<(), String> {
    roku::install(&ip, &channel_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn roku_keypress(ip: String, key: String) -> Result<(), String> {
    roku::keypress(&ip, &key).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn roku_type(ip: String, text: String) -> Result<(), String> {
    roku::type_text(&ip, &text).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn roku_device_info(ip: String) -> Result<DeviceInfo, String> {
    roku::device_info(&ip).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn roku_apps(ip: String) -> Result<Vec<RokuApp>, String> {
    roku::apps(&ip).await.map_err(|e| e.to_string())
}
