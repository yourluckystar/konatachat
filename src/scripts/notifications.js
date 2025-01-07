export function setupNotifications() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            console.log(permission === "granted" ? "notifications enabled!" : "no notifications for you :(");
        }).catch(err => console.log("error enabling notifications", err));
    }
}
