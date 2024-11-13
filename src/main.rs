#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();

    if let Some(arg) = args.get(1) {
        match arg.as_str() {
            "--server" | "-s" => {
                konatachat::accept::start_server().await?;
            }
            _ => eprintln!("Invalid argument: {}", arg),
        }
    } else {
        konatachat::client::start_client().await?;
    }

    Ok(())
}
