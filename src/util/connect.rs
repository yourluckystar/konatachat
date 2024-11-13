use tokio::net::TcpStream;
use tokio::time::{sleep, Duration};

pub async fn connect_or_retry() -> TcpStream {
    loop {
        let address = format!("127.0.0.1:11945");

        match TcpStream::connect(&address).await {
            Ok(stream) => {
                return stream;
            }
            Err(e) => {
                eprintln!("Couldn't connect to {}: {}\nTrying again in 5 seconds...", address, e);
                sleep(Duration::from_secs(5)).await;
            }
        }
    }
}
