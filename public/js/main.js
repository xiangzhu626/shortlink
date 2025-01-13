// 退出登录
function logout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
    }).finally(() => {
        window.location.href = '/login';
    });
}

// 显示错误消息
function showError(message) {
    // ... 错误提示代码
}

// 显示成功消息
function showSuccess(message) {
    // ... 成功提示代码
} 