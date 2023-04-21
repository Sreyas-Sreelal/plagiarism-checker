#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::collections::BTreeSet;

use serde::Serialize;
mod rabinkarp;

#[derive(Serialize)]
pub struct ResultVal {
    content_a: String,
    content_b: String,
    idx: BTreeSet<usize>,
    percentage: f64,
}

#[tauri::command]
fn check_plagiarism(file_a: &str, file_b: &str) -> ResultVal {
    let result = rabinkarp::robin_karp(file_a.to_string(), file_b.to_string());
    ResultVal {
        content_a: result.1,
        content_b: result.2,
        idx: result.0,
        percentage: result.3,
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![check_plagiarism])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
