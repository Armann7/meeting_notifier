import { getValidToken, logoff, getUserInfo } from './googleApi.js';

document.addEventListener('DOMContentLoaded', async () => {
  update_user_info(false).then();
  const loginBtn = document.getElementById('login-btn');
  loginBtn.addEventListener('click', login_logout)
});

async function login_logout() {
  const loginBtn = document.getElementById('login-btn');
  const isLoggedIn = loginBtn.textContent.includes('@');
  if (isLoggedIn) {
    await logoff();
    loginBtn.textContent = 'Login to Google Account';
  } else {
    await update_user_info(true);
  }
}

async function update_user_info(interactive) {
  try {
    const token = await getValidToken(interactive);
    const user_info = await getUserInfo(token);
    const loginBtn = document.getElementById('login-btn');
    loginBtn.textContent = `${user_info.name} <${user_info.email}>`; 
    } catch (error) {
    return;
  }
}
