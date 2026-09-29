const K = {
    t: 'miao_tasks',
    s: 'miao_subtasks',
    f: 'miao_focus',
    u: 'miao_session',
    a: 'miao_accounts'
};

const ICON = n => `img/${n}.png`; /* ganti .png bila ekstensi ikonmu beda */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const load = (k, d) => {
    try {
        return JSON.parse(localStorage.getItem(k)) ?? d;
    } catch {
        return d;
    }
};

const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const esc = s =>
    String(s ?? '').replace(
        /[&<>"']/g,
        c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c])
    );

const P = document.body.dataset.page;

const T = () => load(K.t, []);

const todayStr = () =>
    new Date().toLocaleDateString('sv');

const fmt = d =>
    d
        ? new Date(d + 'T00:00').toLocaleDateString(
              'id-ID',
              {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
              }
          )
        : '-';

const rel = d => {
    const n = Math.round(
        (
            new Date(d + 'T00:00') -
            new Date(todayStr() + 'T00:00')
        ) / 864e5
    );

    return n === 0
        ? 'Today'
        : n === 1
            ? 'Tomorrow'
            : n < 0
                ? 'Overdue'
                : fmt(d);
};

const nextId = (a, k) =>
    a.reduce(
        (m, x) => Math.max(m, x[k]),
        0
    ) + 1;

const prog = id => {
    const s = load(K.s, [])
        .filter(x => x.subtask_task_id == id);

    const d = s.filter(
        x => x.subtask_is_completed
    ).length;

    return {
        done: d,
        total: s.length,
        pct: s.length
            ? Math.round(d / s.length * 100)
            : 0
    };
};

function syncStatus(id) {
    const a = T();
    const k = a.find(x => x.task_id == id);

    if (!k) return;

    const p = prog(id);

    k.task_status =
        p.total && p.done === p.total
            ? 'Completed'
            : p.done
                ? 'In Progress'
                : 'Not Started';

    save(K.t, a);
}

const menu = (extra = '') =>
    `<div class="more">
        <button aria-label="More actions">...</button>
        <div class="menu" hidden>
            ${extra}
            <button data-act="edit">Edit</button>
            <button data-act="delete">Delete</button>
        </div>
    </div>`;

function modal(html) {
    const s = document.createElement('div');

    s.className = 'scrim';

    s.innerHTML = `
        <div
            class="dlg"
            role="dialog"
            aria-modal="true"
        >
            ${html}
        </div>
    `;

    s.addEventListener('click', e => {
        if (
            e.target === s ||
            e.target.closest('[data-close]')
        ) {
            s.remove();
        }
    });

    document.body.appendChild(s);

    $('input,textarea', s)?.focus();

    return s;
}

function confirmBox(msg, yes) {
    const m = modal(`
        <h2>Delete this?</h2>
        <p>${esc(msg)}</p>

        <div class="acts">
            <button
                class="btn ghost"
                data-close
            >
                Cancel
            </button>

            <button
                class="btn dark"
                id="ok"
            >
                Delete
            </button>
        </div>
    `);

    $('#ok', m).onclick = () => {
        m.remove();
        yes();
    };
}

function toast(t) {
    const e = document.createElement('div');

    e.className = 'toast';
    e.textContent = t;

    document.body.appendChild(e);

    setTimeout(
        () => e.remove(),
        2200
    );
}

document.addEventListener('keydown', e =>
    e.key === 'Escape' &&
    $('.scrim')?.remove()
);

document.addEventListener('click', e => {
    const b = e.target.closest('.more>button');

    $$('.menu').forEach(m => {
        if (
            !b ||
            m.previousElementSibling !== b
        ) {
            m.hidden = true;
        }
    });

    if (b) {
        b.nextElementSibling.hidden =
            !b.nextElementSibling.hidden;
    }

    if (!e.target.closest('.bellwrap')) {
        $('#notif') &&
            ($('#notif').hidden = true);
    }
});

function seed() {
    if (load(K.t, null)) return;

    const d = n => {
        const x = new Date();

        x.setDate(
            x.getDate() + n
        );

        return x.toLocaleDateString('sv');
    };

    const t = (
        i,
        n,
        p,
        dd,
        c = 'Academic'
    ) => ({
        task_id: i,
        task_title: n,
        task_description: '',
        task_deadline: d(dd),
        task_priority: p,
        task_status: 'Not Started',
        task_category: c
    });

    const s = (
        i,
        tid,
        n,
        c,
        pos
    ) => ({
        subtask_id: i,
        subtask_task_id: tid,
        subtask_title: n,
        subtask_is_completed: c,
        subtask_position: pos
    });

    save(K.t, [
        t(
            1,
            'Laporan Pemrograman Internet',
            'High',
            0
        ),
        t(
            2,
            'Cari Artikel Kesehatan',
            'Medium',
            0
        ),
        t(
            3,
            'Laporan PCD',
            'Medium',
            1
        ),
        t(
            4,
            'Laporan MJS',
            'Medium',
            1
        ),
        t(
            5,
            'Buat PPT Workshop',
            'High',
            2
        ),
        t(
            6,
            'Project Kecerdasan Tiruan',
            'Medium',
            3
        ),
        t(
            7,
            'Belajar Integral',
            'Low',
            5
        )
    ]);

    save(K.s, [
        s(1, 1, 'Bab 1', true, 1),
        s(2, 1, 'Bab 2', true, 2),
        s(3, 1, 'Bab 3', true, 3),
        s(4, 1, 'Bab 4', false, 4),
        s(5, 2, 'Cari sumber', true, 1),
        s(6, 2, 'Tulis ringkasan', false, 2),
        s(7, 2, 'Cek referensi', false, 3),
        s(8, 3, 'Pahami soal', false, 1),
        s(9, 3, 'Olah data', false, 2),
        s(10, 5, 'Cari & Pahami Materi', true, 1),
        s(11, 5, 'Susun Alur Penjelasan', false, 2),
        s(12, 5, 'Buat PPT', false, 3)
    ]);

    [1, 2, 3, 5].forEach(syncStatus);

    save(
        K.f,
        [1, 2, 3].map(i => ({
            focus_id: i,
            focus_task_id: i,
            focus_date: todayStr()
        }))
    );
}

function shell() {
    if (!P) return;

    const u = load(K.u, null);

    if (!u) {
        location.href = 'login.html';
        return;
    }

    seed();

    const nav = [
        [
            'dashboard',
            'Dashboard',
            'dashboard_icon'
        ],
        [
            'tasks',
            'Tasks',
            'task_icon'
        ],
        [
            'create-task',
            'Create Task',
            'create_icon'
        ],
        [
            'daily-focus',
            'Daily Focus',
            'focus_icon'
        ],
        [
            'settings',
            'Settings',
            'setting_icon'
        ]
    ];

    document.body.insertAdjacentHTML(
        'afterbegin',
        `<aside class="side" id="side">
            <a
                class="brand"
                href="dashboard.html"
            >
                <img
                    src="${ICON('mascot')}"
                    alt=""
                >
                <span>Miáo</span>
            </a>

            <nav aria-label="Main">
                ${nav
                    .map(
                        n => `
                            <a
                                class="nv ${P === n[0] ? 'on' : ''}"
                                href="${n[0]}.html"
                            >
                                <img
                                    src="${ICON(n[2])}"
                                    alt=""
                                >
                                <span>${n[1]}</span>
                            </a>
                        `
                    )
                    .join('')}
            </nav>

            <button
                class="nv out"
                id="logout"
            >
                <b aria-hidden="true">⎋</b>
                <span>Logout</span>
            </button>
        </aside>

        <div
            class="shade"
            id="shade"
        ></div>`
    );

    $('main').insertAdjacentHTML(
        'afterbegin',
        `<header class="top">
            <button
                class="dots"
                id="dots"
                aria-label="Toggle sidebar"
            >
                •••
            </button>

            <a
                class="avatar"
                href="settings.html"
                aria-label="Profile"
            >
                <img
                    src="${ICON('user_icon')}"
                    alt=""
                >
            </a>

            <form
                class="search"
                id="sf"
                role="search"
            >
                <img
                    src="${ICON('search_icon')}"
                    alt=""
                >

                <input
                    id="q"
                    type="search"
                    placeholder="Search your tasks..."
                    aria-label="Search your tasks"
                >
            </form>

            <div class="bellwrap">

                <button
                    class="bell"
                    id="bell"
                    aria-label="Notifications"
                >
                    <img
                        src="${ICON('notification_icon')}"
                        alt=""
                    >
                </button>

                <div
                    class="pop"
                    id="notif"
                    hidden
                ></div>

            </div>
        </header>`
    );

    document.body.insertAdjacentHTML(
        'beforeend',
        `<nav
            class="quick"
            aria-label="Quick actions"
        >
            ${
                [
                    [
                        'create-task',
                        'create_icon',
                        'Add task'
                    ],
                    [
                        'daily-focus',
                        'focus_icon',
                        'Daily focus'
                    ],
                    [
                        'tasks',
                        'task_icon',
                        'Tasks'
                    ],
                    [
                        'dashboard',
                        'dashboard_icon',
                        'Dashboard'
                    ]
                ]
                    .map(
                        n => `
                            <a
                                class="${P === n[0] ? 'on' : ''}"
                                href="${n[0]}.html"
                                aria-label="${n[2]}"
                            >
                                <img
                                    src="${ICON(n[1])}"
                                    alt=""
                                >
                            </a>
                        `
                    )
                    .join('')
            }
        </nav>`
    );

    const apply = () =>
        document.body.classList.toggle(
            'collapsed',
            load(
                'miao_collapsed',
                innerWidth <= 1024
            )
        );

    apply();

    $('#dots').onclick = () => {
        if (innerWidth <= 768) {
            document.body.classList.toggle('open');
        } else {
            save(
                'miao_collapsed',
                !document.body.classList.contains(
                    'collapsed'
                )
            );

            apply();
        }
    };

    $('#shade').onclick = () =>
        document.body.classList.remove('open');

    $('#logout').onclick = () => {
        localStorage.removeItem(K.u);
        location.href = 'login.html';
    };

    $('#sf').onsubmit = e => {
        e.preventDefault();

        if (P !== 'tasks') {
            location.href =
                'tasks.html?q=' +
                encodeURIComponent($('#q').value);
        }
    };

    $('#bell').onclick = () => {
        const n = $('#notif');

        const due = T().filter(
            k =>
                k.task_status !== 'Completed' &&
                ['Today', 'Tomorrow'].includes(
                    rel(k.task_deadline)
                )
        );

        n.innerHTML = due.length
            ? due
                  .map(
                      k => `
                          <a
                              class="nt"
                              href="task-detail.html?id=${k.task_id}"
                          >
                              <b>${esc(k.task_title)}</b>
                              <span class="muted">
                                  Due ${rel(k.task_deadline).toLowerCase()}
                              </span>
                          </a>
                      `
                  )
                  .join('')
            : `<p class="muted">
                  You're all caught up.</p>`;
        n.hidden = !n.hidden;
    };

    $('#sName') &&
        ($('#sName').textContent = u.user_name);
}

shell();
