export function allow_notifications() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            console.log(permission === 'granted' ? 'notifications enabled .3' : 'notifications disabled :(');
        }).catch(err => console.log('error enabling notifications', err));
    }
}
