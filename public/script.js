function toggleForms() {
    const div1 = document.getElementById('sign-in-form');
    const div2 = document.getElementById('sign-up-form');

    if (div1.style.display === 'none') {
        div1.style.display = 'flex';
        div2.style.display = 'none';
    } else {
        div1.style.display = 'none';
        div2.style.display = 'flex';
    }
}
