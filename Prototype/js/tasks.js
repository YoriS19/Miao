const taskFields = t =>
    `<div><label for="title">Task Title</label><input class="in" id="title" placeholder="What are you working on?" maxlength="150" value="${esc(t.task_title)}"><p class="err" data-e="title"></p></div>
<div><label for="desc">Description</label><textarea class="in" id="desc" placeholder="Add a short description...">${esc(t.task_description)}</textarea></div>
<div class="f2"><div><label for="cat">Category</label><select class="in" id="cat">${['Academic', 'Personal', 'Work', 'Other'].map(c => `<option ${c === (t.task_category || 'Academic') ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
<div><label for="pri">Priority</label><select class="in" id="pri">${['Low', 'Medium', 'High'].map(c => `<option ${c === (t.task_priority || 'Medium') ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div>
<div><label for="dl">Deadline</label><input class="in" type="date" id="dl" value="${t.task_deadline || ''}"><p class="err" data-e="dl"></p></div>`;

function readTask(r) {
    const g = s => $(s, r).value.trim(),
        o = {
            task_title: g('#title'),
            task_description: g('#desc'),
            task_category: g('#cat'),
            task_priority: g('#pri'),
            task_deadline: g('#dl')
        };

    let ok = true;

    $$('.err', r).forEach(
        e => e.textContent = ''
    );

    if (!o.task_title) {
        $('[data-e=title]', r).textContent =
            'Task title is required.';
        ok = false;
    }

    if (!o.task_deadline) {
        $('[data-e=dl]', r).textContent =
            'Choose a deadline.';
        ok = false;
    }

    return ok ? o : null;
}

function editTask(id, after) {
    const t = T().find(
        k => k.task_id == id
    );

    const m = modal(
        `<h2>Edit Task</h2><form id="ef" class="fg" novalidate>${taskFields(t)}<div class="acts"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn">Save changes</button></div></form>`
    );

    $('#ef', m).onsubmit = e => {
        e.preventDefault();

        const o = readTask(m);

        if (!o)
            return;

        const a = T();

        Object.assign(
            a.find(k => k.task_id == id),
            o
        );

        save(K.t, a);
        m.remove();
        toast('Task updated');
        after();
    };
}

function deleteTask(id, after) {
    confirmBox(
        'This task and its subtasks will be removed.',
        () => {
            save(
                K.t,
                T().filter(
                    k => k.task_id != id
                )
            );

            save(
                K.s,
                load(K.s, []).filter(
                    s => s.subtask_task_id != id
                )
            );

            save(
                K.f,
                load(K.f, []).filter(
                    f => f.focus_task_id != id
                )
            );

            toast('Task deleted');
            after();
        }
    );
}

const bar = p =>
    `<div class="bar"><i style="width:${p}%"></i></div><span class="pct">${p}%</span>`;

if (P === 'dashboard') {

    const u = load(K.u),
        h = new Date().getHours(),
        t = T();

    $('#greet').textContent =
        `Good ${h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening'}, ${u.user_name}!`;

    $('#date').textContent =
        new Date().toLocaleDateString(
            'en-GB',
            {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }
        );

    const f = load(K.f, [])
        .filter(
            x => x.focus_date === todayStr()
        )
        .map(
            x =>
                t.find(
                    k => k.task_id == x.focus_task_id
                )
        )
        .filter(Boolean);

    $('#focusList').innerHTML =
        f.length
            ? f
                .map(
                    k =>
                        `<li><a href="task-detail.html?id=${k.task_id}"><b>${esc(k.task_title)}</b><span class="muted">${k.task_priority} · ${rel(k.task_deadline)}</span></a></li>`
                )
                .join('')
            : '<li class="muted">No focus yet. Pick up to 3 tasks to start.</li>';

    const done =
        t.filter(
            k => k.task_status === 'Completed'
        ).length;

    const pc =
        t.length
            ? Math.round(done / t.length * 100)
            : 0;

    $('#overallPct').textContent =
        pc + '%';

    setTimeout(
        () =>
            $('#overallBar').style.width =
                pc + '%',
        60
    );

    $('#overallTxt').textContent =
        `${done} of ${t.length} tasks completed`;

    const open =
        t.filter(
            k => k.task_status !== 'Completed'
        );

    $('#deadlines').innerHTML =
        [...open]
            .sort(
                (a, b) =>
                    a.task_deadline.localeCompare(
                        b.task_deadline
                    )
            )
            .slice(0, 3)
            .map(
                k =>
                    `<li><a href="task-detail.html?id=${k.task_id}"><b>${esc(k.task_title)}</b><span class="muted">${fmt(k.task_deadline)}</span></a></li>`
            )
            .join('') ||
        '<li class="muted">No upcoming deadlines.</li>';

    $('#active').innerHTML =
        open
            .slice(0, 4)
            .map(
                k =>
                    `<li class="prog"><a href="task-detail.html?id=${k.task_id}">${esc(k.task_title)}</a>${bar(prog(k.task_id).pct)}</li>`
            )
            .join('') ||
        '<li class="muted">All tasks are done.</li>';
}

function renderTasks() {

    const q =
        ($('#q').value || '').toLowerCase();

    $('#taskList').innerHTML =
        T()
            .filter(
                k =>
                    k.task_title
                        .toLowerCase()
                        .includes(q)
            )
            .map(
                k =>
                    `<article class="card stack" data-id="${k.task_id}"><div class="item"><a href="task-detail.html?id=${k.task_id}"><b>${esc(k.task_title)}</b><span class="muted">${k.task_category} · ${k.task_priority} · ${fmt(k.task_deadline)} · ${k.task_status}</span></a>${menu(`<a href="task-detail.html?id=${k.task_id}">View</a>`)}</div><div class="prog">${bar(prog(k.task_id).pct)}</div></article>`
            )
            .join('') ||
        '<p class="muted">No tasks found. <a class="link" href="create-task.html">Create a task</a></p>';
}

if (P === 'tasks') {

    const q =
        new URLSearchParams(location.search).get('q');

    if (q)
        $('#q').value = q;

    renderTasks();

    $('#q').addEventListener(
        'input',
        renderTasks
    );

    $('#taskList').onclick = e => {

        const b =
            e.target.closest('[data-act]');

        if (!b)
            return;

        const id =
            +b.closest('[data-id]').dataset.id;

        b.dataset.act === 'edit'
            ? editTask(id, renderTasks)
            : deleteTask(id, renderTasks);
    };
}

if (P === 'create-task') {

    const cf = $('#cf');

    $('#fields').innerHTML =
        taskFields({});

    const pv = () => {

        const g = s =>
            $(s).value.trim();

        $('#pvT').textContent =
            g('#title') || 'Untitled task';

        $('#pvM').textContent =
            `${g('#cat')} · ${g('#pri')}`;

        $('#pvD').textContent =
            g('#desc') || 'No description yet.';

        $('#pvDl').textContent =
            $('#dl').value
                ? fmt($('#dl').value)
                : 'No deadline';

        $('#pvS').textContent =
            `0 / ${$$('.draft input').filter(i => i.value.trim()).length} subtasks completed`;
    };

    cf.addEventListener(
        'input',
        pv
    );

    cf.addEventListener(
        'change',
        pv
    );

    pv();

    $('#addSub').onclick = () => {

        $('#drafts').insertAdjacentHTML(
            'beforeend',
            '<div class="draft item"><input class="in" placeholder="Subtask title..." maxlength="150" aria-label="Subtask title"><button type="button" class="btn ghost sm" aria-label="Remove subtask">✕</button></div>'
        );

        $('#drafts .draft:last-child input')
            .focus();
    };

    $('#drafts').onclick = e => {

        if (
            e.target.closest('button')
        ) {

            e.target
                .closest('.draft')
                .remove();

            pv();
        }
    };

    cf.onsubmit = e => {

        e.preventDefault();

        const o = readTask(cf);

        if (!o)
            return;

        const a = T(),
            id = nextId(a, 'task_id');

        a.push({
            task_id: id,
            ...o,
            task_status: 'Not Started'
        });

        save(K.t, a);

        const s = load(K.s, []);

        $$('.draft input')
            .map(
                i => i.value.trim()
            )
            .filter(Boolean)
            .forEach(
                (v, i) =>
                    s.push({
                        subtask_id:
                            nextId(
                                s,
                                'subtask_id'
                            ),
                        subtask_task_id: id,
                        subtask_title: v,
                        subtask_is_completed:
                            false,
                        subtask_position:
                            i + 1
                    })
            );

        save(K.s, s);

        location.href =
            'task-detail.html?id=' + id;
    };
}