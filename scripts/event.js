// Know More Button Click
document.querySelectorAll('.know-more-btn').forEach(button => {
    button.addEventListener('click', () => {
        const eventName = button.closest('.flip-card-back').querySelector('h3').textContent;
        alert(`More details about ${eventName}!`); // Placeholder action
    });
});