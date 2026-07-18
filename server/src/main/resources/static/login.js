const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
async function api(url,options={}){const r=await fetch(url,{headers:{'Content-Type':'application/json'},...options});const body=await r.json();if(!r.ok)throw new Error(body.message||'登录失败');return body}
// 登录页保留在浏览器历史中；即使已有会话，用户后退时也允许停留在这里。
function resetLoginButton(){const button=document.querySelector('.login-submit');if(button)button.disabled=false}
window.addEventListener('pageshow',resetLoginButton);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)resetLoginButton()});
$$('[data-account]').forEach(button=>button.onclick=()=>{$$('[data-account]').forEach(x=>x.classList.toggle('selected',x===button));const [user,password]=button.dataset.account.split(',');$('#username').value=user;$('#password').value=password});
$('#loginForm').onsubmit=async event=>{event.preventDefault();const submit=event.target.querySelector('.login-submit');if(submit.disabled)return;submit.disabled=true;$('#loginError').textContent='';try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({username:$('#username').value.trim(),password:$('#password').value})});location.assign('/dashboard.html#home')}catch(error){$('#loginError').textContent=error.message;submit.disabled=false}};
