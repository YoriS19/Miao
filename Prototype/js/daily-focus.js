if (P === 'daily-focus') {

    const day = todayStr();

    let sel = new Set(
        load(K.f, [])
            .filter(
                f => f.focus_date === day
            )
            .map(
                f => f.focus_task_id
            )
    );

    const info = k =>
        `<span class="muted">
            ${k.task_priority} · ${rel(k.task_deadline)}
        </span>`;

    function draw() {

        const saved = load(K.f, [])
            .filter(
                f => f.focus_date === day
            )
            .map(
                f =>
                    T().find(
                        k => k.task_id === f.focus_task_id
                    )
            )
            .filter(Boolean);

        $('#mine').innerHTML =
            saved
                .map(
                    k =>
                        `<li class="item">
                            <div>
                                <b>${esc(k.task_title)}</b>
                                ${info(k)}
                            </div>

                            <button
                                class="btn ghost sm"
                                data-rm="${k.task_id}"
                            >
                                Remove
                            </button>
                        </li>`
                )
                .join('') ||
            '<li class="muted">Nothing here yet. Tick up to 3 tasks, then save.</li>';

        $('#pick').innerHTML =
            T()
                .filter(
                    k =>
                        k.task_status !== 'Completed' ||
                        sel.has(k.task_id)
                )
                .map(
                    k =>
                        `<li>
                            <label class="pick">
                                <input
                                    type="checkbox"
                                    value="${k.task_id}"
                                    ${sel.has(k.task_id) ? 'checked' : ''}
                                >

                                <span>
                                    <b>${esc(k.task_title)}</b>
                                    ${info(k)}
                                </span>
                            </label>
                        </li>`
                )
                .join('') ||
            '<li class="muted">No tasks yet.</li>';

        count();
    }

    const count = () =>
        $('#count').textContent =
            `${sel.size} / 3 selected`;

    function persist() {

        const r = load(K.f, [])
            .filter(
                f => f.focus_date !== day
            );

        sel.forEach(
            id =>
                r.push({
                    focus_id: nextId(r, 'focus_id'),
                    focus_task_id: id,
                    focus_date: day
                })
        );

        save(K.f, r);
        draw();
    }

    $('#pick').onchange = e => {

        const id = +e.target.value;

        if (e.target.checked) {

            if (sel.size >= 3) {

                e.target.checked = false;

                $('#msg').textContent =
                    'Select up to 3 tasks. Uncheck one to pick another.';

                $('#msg').classList.remove('show');

                void $('#msg').offsetWidth;

                $('#msg').classList.add('show');

                return;
            }

            sel.add(id);

        } else {

            sel.delete(id);
        }

        $('#msg').textContent = '';

        count();
    };

    $('#save').onclick = () => {
        persist();
        toast('Focus saved');
    };

    $('#mine').onclick = e => {

        const b = e.target.closest('[data-rm]');

        if (b) {

            sel.delete(+b.dataset.rm);

            persist();

            toast('Removed from focus');
        }
    };

    draw();
}
