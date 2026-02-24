use serde::Deserialize;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use sysinfo::System;
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{
    image::Image,
    menu::{CheckMenuItemBuilder, MenuBuilder, MenuItemBuilder},
    Manager, RunEvent, WindowEvent,
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

const HEALTH_URL: &str = "http://localhost:4001/health";
const HEALTH_POLL_INTERVAL: Duration = Duration::from_secs(3);

/// Health response from the bridge server
#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
struct HealthResponse {
    status: String,
    #[serde(default)]
    plugin_connected: bool,
    #[serde(default)]
    pending_commands: u32,
    #[serde(default)]
    server_version: Option<String>,
    #[serde(default)]
    protocol_version: Option<u32>,
}

/// Current server state for tray icon updates
#[derive(Debug, Clone, PartialEq)]
enum ServerState {
    Running,
    Waiting,
    Stopped,
}

/// Check bridge server health
fn check_health() -> Option<HealthResponse> {
    let agent = ureq::AgentBuilder::new()
        .timeout(Duration::from_secs(2))
        .build();

    let resp = agent.get(HEALTH_URL).call().ok()?;

    resp.into_json::<HealthResponse>().ok()
}

/// Get the appropriate tray icon image based on server state
fn get_tray_icon(state: &ServerState) -> Image<'static> {
    let icon_data = match state {
        ServerState::Running => include_bytes!("../icons/tray-connected-32x32.png").to_vec(),
        ServerState::Waiting => include_bytes!("../icons/tray-waiting-32x32.png").to_vec(),
        ServerState::Stopped => include_bytes!("../icons/tray-stopped-32x32.png").to_vec(),
    };
    Image::from_bytes(&icon_data).expect("Failed to load tray icon")
}

/// Kill the sidecar process and any child processes (e.g., Chrome for Puppeteer)
fn kill_process_tree(child: &mut Option<CommandChild>) {
    if let Some(child_process) = child.take() {
        let pid = child_process.pid();
        let _ = child_process.kill();

        let mut sys = System::new();
        sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

        let parent_pid = sysinfo::Pid::from_u32(pid);

        let child_pids: Vec<sysinfo::Pid> = sys
            .processes()
            .iter()
            .filter(|(_, process)| process.parent() == Some(parent_pid))
            .map(|(pid, _)| *pid)
            .collect();

        for child_pid in child_pids {
            if let Some(process) = sys.process(child_pid) {
                process.kill();
            }
        }
    }
}

pub fn run() {
    let sidecar_child: Arc<Mutex<Option<CommandChild>>> = Arc::new(Mutex::new(None));
    let should_quit = Arc::new(AtomicBool::new(false));

    let sidecar_child_clone = sidecar_child.clone();
    let should_quit_clone = should_quit.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::AppleScript,
            None,
        ))
        .setup(move |app| {
            let handle = app.handle().clone();

            // === Auto-start: enable by default on first run ===
            let autolaunch = app.autolaunch();
            let autostart_enabled = autolaunch.is_enabled().unwrap_or(false);
            if !autostart_enabled {
                // First run — enable auto-start
                let _ = autolaunch.enable();
                println!("[Tauri] Auto-start enabled (first run)");
            }
            let autostart_checked = autolaunch.is_enabled().unwrap_or(false);

            // === Build tray menu ===
            let show_status = MenuItemBuilder::with_id("show_status", "Show Status")
                .build(app)?;
            let launch_at_login =
                CheckMenuItemBuilder::with_id("launch_at_login", "Launch at Login")
                    .checked(autostart_checked)
                    .build(app)?;
            let check_updates = MenuItemBuilder::with_id("check_updates", "Check for Updates")
                .build(app)?;
            let quit = MenuItemBuilder::with_id("quit", "Quit Bridge to Fig")
                .build(app)?;

            let menu = MenuBuilder::new(app)
                .item(&show_status)
                .item(&launch_at_login)
                .separator()
                .item(&check_updates)
                .separator()
                .item(&quit)
                .build()?;

            // === Create tray icon ===
            let initial_icon = get_tray_icon(&ServerState::Stopped);
            let tray = TrayIconBuilder::new()
                .icon(initial_icon)
                .tooltip("Bridge to Fig")
                .menu(&menu)
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "show_status" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "launch_at_login" => {
                        let autolaunch = app.autolaunch();
                        let currently_enabled = autolaunch.is_enabled().unwrap_or(false);
                        if currently_enabled {
                            let _ = autolaunch.disable();
                            println!("[Tauri] Auto-start disabled by user");
                        } else {
                            let _ = autolaunch.enable();
                            println!("[Tauri] Auto-start enabled by user");
                        }
                    }
                    "check_updates" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.eval(
                                "document.getElementById('btn-check-update')?.click()",
                            );
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // === Spawn sidecar ===
            let sidecar_for_spawn = sidecar_child_clone.clone();
            let shell_handle = handle.clone();

            match shell_handle.shell().sidecar("bridge-server") {
                Ok(command) => match command.spawn() {
                    Ok((_, child)) => {
                        if let Ok(mut guard) = sidecar_for_spawn.lock() {
                            *guard = Some(child);
                        }
                        println!("[Tauri] Bridge server sidecar started");
                    }
                    Err(e) => {
                        eprintln!("[Tauri] Failed to spawn sidecar: {}", e);
                    }
                },
                Err(e) => {
                    eprintln!("[Tauri] Failed to create sidecar command: {}", e);
                }
            }

            // === Health polling thread ===
            let tray_handle = tray.clone();
            let should_quit_health = should_quit_clone.clone();

            thread::spawn(move || {
                let mut last_state = ServerState::Stopped;

                while !should_quit_health.load(Ordering::Relaxed) {
                    let new_state = match check_health() {
                        Some(health) => {
                            if health.status == "ok" {
                                if health.plugin_connected {
                                    ServerState::Running
                                } else {
                                    ServerState::Waiting
                                }
                            } else {
                                ServerState::Stopped
                            }
                        }
                        None => ServerState::Stopped,
                    };

                    if new_state != last_state {
                        let icon = get_tray_icon(&new_state);
                        let tooltip = match &new_state {
                            ServerState::Running => "Bridge to Fig - Connected",
                            ServerState::Waiting => "Bridge to Fig - Waiting for Plugin",
                            ServerState::Stopped => "Bridge to Fig - Server Stopped",
                        };
                        let _ = tray_handle.set_icon(Some(icon));
                        let _ = tray_handle.set_tooltip(Some(tooltip));
                        last_state = new_state;
                    }

                    thread::sleep(HEALTH_POLL_INTERVAL);
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(move |_app_handle, event| {
            if let RunEvent::ExitRequested { .. } = &event {
                should_quit.store(true, Ordering::Relaxed);

                if let Ok(mut guard) = sidecar_child.lock() {
                    kill_process_tree(&mut guard);
                    println!("[Tauri] Sidecar process tree terminated");
                }
            }
        });
}
