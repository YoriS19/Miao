if (!load(K.a, []).length)
    save(K.a, [{
        user_id: 1,
        user_name: 'mao',
        user_email: 'mao@miao.id',
        user_password: 'miao123'
    }]);

const lf = $('#loginForm'),
    rf = $('#registerForm');

if (load(K.u, null))
    location.href = 'dashboard.html';

const show = m => {
    const e = $('#err');
    e.textContent = m;
    e.classList.remove('show');
    void e.offsetWidth;
    e.classList.add('show');
};

$$('.eye').forEach(b =>
    b.onclick = () => {
        const i = b.previousElementSibling;
        i.type = i.type === 'password' ? 'text' : 'password';
    }
);

if (lf) {
    if (location.search.includes('registered'))
        $('#err').textContent = 'Account created. Please login.';

    lf.onsubmit = e => {
        e.preventDefault();

        const n = lf.username.value.trim(),
            p = lf.password.value;

        if (!n || !p)
            return show('Input belum lengkap');

        const a = load(K.a, []).find(
            x => x.user_name === n && x.user_password === p
        );

        if (!a)
            return show('Username atau Password salah');

        save(K.u, {
            user_id: a.user_id,
            user_name: a.user_name
        });

        location.href = 'dashboard.html';
    };
}

if (rf)
    rf.onsubmit = e => {
        e.preventDefault();

        const n = rf.username.value.trim(),
            m = rf.email.value.trim(),
            p = rf.password.value,
            a = load(K.a, []);

        if (!n || !m || !p)
            return show('Input belum lengkap');

        if (!/^\S+@\S+\.\S+$/.test(m))
            return show('Enter a valid email.');

        if (p.length < 6)
            return show('Password must be at least 6 characters.');

        if (a.some(x => x.user_name === n || x.user_email === m))
            return show('Username or email is already used.');

        a.push({
            user_id: nextId(a, 'user_id'),
            user_name: n,
            user_email: m,
            user_password: p
        });

        save(K.a, a);
        location.href = 'login.html?registered=1';
    };