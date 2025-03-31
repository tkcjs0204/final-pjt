// 회원가입 폼 제출 처리
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // 비밀번호 확인
            if (password !== confirmPassword) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            }
            
            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
                    window.location.href = '/login';
                } else {
                    alert(data.message || '회원가입에 실패했습니다.');
                }
            } catch (error) {
                console.error('회원가입 중 오류 발생:', error);
                alert('회원가입 중 오류가 발생했습니다.');
            }
        });
    }
    
    // 로그인 폼 제출 처리
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // 로그인 성공
                    localStorage.setItem('token', data.token);
                    window.location.href = '/';
                } else {
                    // 로그인 실패
                    alert(data.message || '로그인에 실패했습니다.');
                }
            } catch (error) {
                console.error('로그인 중 오류 발생:', error);
                alert('로그인 중 오류가 발생했습니다.');
            }
        });
    }
});

// API 요청 시 JWT 토큰 추가
function addAuthHeader(headers = {}) {
    const token = localStorage.getItem('token');
    if (token) {
        return {
            ...headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return headers;
}

// 인증 상태 UI 업데이트
function updateAuthUI(isAuthenticated, user) {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');

    if (isAuthenticated && user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userInfo) {
            userInfo.style.display = 'block';
            userInfo.textContent = `${user.name}님 환영합니다`;
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (signupBtn) signupBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// 인증 상태 확인
async function checkAuthStatus() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/status', {
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });

        if (!response.ok) {
            throw new Error('인증 상태 확인에 실패했습니다.');
        }

        const data = await response.json();
        updateAuthUI(data.isAuthenticated, data.user);
    } catch (error) {
        console.error('Error:', error);
        updateAuthUI(false, null);
    }
}

// 로그인 모달 표시
function showLoginModal() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

// 회원가입 모달 표시
function showSignupModal() {
    const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
    signupModal.show();
}

// 로그인 처리
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '로그인에 실패했습니다.');
        }

        // 토큰 저장
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 성공 메시지 표시
        showAlert('success', '로그인 성공! 환영합니다.');
        
        // 모달 닫기
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) {
            loginModal.hide();
        }

        // UI 업데이트
        updateAuthUI(true, data.user);
        
        // 페이지 새로고침
        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (error) {
        console.error('Error:', error);
        showAlert('danger', error.message || '로그인 중 오류가 발생했습니다.');
    }
}

// 회원가입 처리
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '회원가입에 실패했습니다.');
        }

        // 성공 메시지 표시
        showAlert('success', '회원가입이 완료되었습니다. 로그인해주세요.');
        
        // 모달 전환
        const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
        if (signupModal) {
            signupModal.hide();
        }
        
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();

    } catch (error) {
        console.error('Error:', error);
        showAlert('danger', error.message || '회원가입 중 오류가 발생했습니다.');
    }
}

// 로그아웃 처리
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateAuthUI(false, null);
    showAlert('success', '로그아웃되었습니다.');
}

// 알림 표시
function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alert);

    // 5초 후 자동으로 알림 제거
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    // 인증 상태 확인
    checkAuthStatus();
    
    // 로그인 폼 이벤트 리스너
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 회원가입 폼 이벤트 리스너
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // 로그아웃 버튼 이벤트 리스너
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}); 