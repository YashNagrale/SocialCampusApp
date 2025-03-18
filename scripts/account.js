function showTab(tab) {
    document.getElementById('login-content').classList.add('hidden');
    document.getElementById('signup-content').classList.add('hidden');
    document.getElementById('login-tab').classList.remove('tab-active');
    document.getElementById('signup-tab').classList.remove('tab-active');

    if (tab === 'Login') {
        document.getElementById('login-content').classList.remove('hidden');
        document.getElementById('login-tab').classList.add('tab-active');
    } else if (tab === 'Signup') {
        document.getElementById('signup-content').classList.remove('hidden');
        document.getElementById('signup-tab').classList.add('tab-active');
    }
}
