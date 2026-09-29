if (P === 'task-detail') {

    const id =
        +new URLSearchParams(location.search).get('id');

    let last = 0;

    const subs = () =>
        load(K.s, [])
            .filter(
                x => x.subtask_task_id === id
            )
            .sort(
                (a, b) =>
                    a.subtask_position - b.subtask_position
            );

    function render() {

        const t = T().find(
            k => k.task_id === id
        );

        if (!t) {
            location.href = 'tasks.html';
            return;
        }

        const n = String(
            T().findIndex(
                k => k.task_id === id
            ) + 1
        ).padStart(2, '0');

        const p = prog(id);
        const s = subs();
        const cur = s.findIndex(
            x => !x.subtask_is_completed
        );

        $('#head').innerHTML =
            `<div class="item"><div class="prog"><div class="no">${n}</div><div><h1>${esc(t.task_title)}</h1><span class="muted">${t.task_category} · ${t.task_priority} Priority · ${fmt(t.task_deadline)}</span></div></div><div class="acts"><button class="btn ghost" id="et">Edit</button><button class="btn dark" id="dt">Delete</button></div></div>${t.task_description ? `<p class="row">${esc(t.task_description)}</p>` : ''}<div class="row"><b>Progress</b><span class="muted">${p.done} / ${p.total} subtasks completed</span><div class="prog"><div class="bar"><i id="pbar" style="width:${last}%"></i></div><span class="pct">${p.pct}%</span></div></div>`;

        requestAnimationFrame(() => {
            $('#pbar').style.width = p.pct + '%';
            last = p.pct;
        });

        $('#et').onclick = () =>
            editTask(id, render);

        $('#dt').onclick = () =>
            deleteTask(
                id,
                () => location.href = 'tasks.html'
            );

        $('#steps').innerHTML =
            s
                .map(
                    (x, i) =>
                        `<li class="step ${x.subtask_is_completed ? 'done' : ''}" data-id="${x.subtask_id}"><input type="checkbox" ${x.subtask_is_completed ? 'checked' : ''} aria-label="Mark completed"><div><b>${esc(x.subtask_title)}</b><span class="muted">${x.subtask_is_completed ? 'Completed' : i === cur && p.done > 0 ? 'In Progress' : 'Not Started'}</span></div>${menu()}</li>`
                )
                .join('') ||
            '<li class="muted">No subtasks yet. Add the first step.</li>';
    }

    function subModal(x) {

        const m = modal(
            `<h2>${x ? 'Edit Subtask' : 'Add Subtask'}</h2><form id="sf2" class="fg" novalidate><div><label for="st">Subtask title</label><input class="in" id="st" maxlength="150" value="${esc(x?.subtask_title)}" placeholder="What is the next step?"><p class="err"></p></div><div class="acts"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn">${x ? 'Save changes' : 'Add Subtask'}</button></div></form>`
        );

        $('#sf2', m).onsubmit = e => {
            e.preventDefault();

            const v = $('#st', m).value.trim();

            if (!v) {
                $('.err', m).textContent =
                    'Subtask title is required.';
                return;
            }

            const a = load(K.s, []);

            if (x)
                a.find(
                    y => y.subtask_id === x.subtask_id
                ).subtask_title = v;
            else
                a.push({
                    subtask_id: nextId(a, 'subtask_id'),
                    subtask_task_id: id,
                    subtask_title: v,
                    subtask_is_completed: false,
                    subtask_position: subs().length + 1
                });

            save(K.s, a);
            syncStatus(id);
            m.remove();

            toast(
                x
                    ? 'Subtask updated'
                    : 'Subtask added'
            );

            render();
        };
    }

    $('#addSub').onclick = () =>
        subModal();

    $('#steps').onchange = e => {

        const sid =
            +e.target.closest('.step').dataset.id;

        const a = load(K.s, []);

        const x = a.find(
            y => y.subtask_id === sid
        );

        x.subtask_is_completed =
            e.target.checked;

        save(K.s, a);
        syncStatus(id);
        render();
    };

    $('#steps').onclick = e => {

        const b =
            e.target.closest('[data-act]');

        if (!b)
            return;

        const li =
            b.closest('.step');

        const sid =
            +li.dataset.id;

        if (b.dataset.act === 'edit') {

            subModal(
                subs().find(
                    y => y.subtask_id === sid
                )
            );

        } else {

            confirmBox(
                'This subtask will be removed.',
                () => {

                    li.classList.add('gone');

                    setTimeout(() => {

                        save(
                            K.s,
                            load(K.s, [])
                                .filter(
                                    y =>
                                        y.subtask_id !== sid
                                )
                        );

                        syncStatus(id);
                        toast('Subtask deleted');
                        render();

                    }, 300);
                }
            );
        }
    };

    render();
}