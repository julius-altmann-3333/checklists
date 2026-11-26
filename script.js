
    /* =============================================================
       PROJECT DEFINITIONS
       =============================================================

       There are 30 separate project areas.

       Each project receives its own:
       - section
       - task list
       - task counter
       - drop zone
       - priority ordering
       ============================================================= */

    const PROJECTS = {

        checklist: [
            "checklist"
        ],

        work: [
            "Industry",
            "Code",
            "Clients",
            "Marketing",
            "Finance",
            "Sales",
            "Operations",
            "Research",
            "Meetings",
            "Administration"
        ],

        personal: [
            "Dentist",
            "Fitness",
            "Family",
            "Home",
            "Travel",
            "Learning",
            "Health",
            "Appointments",
            "Personal Finance",
            "Shopping"
        ],

        miscellaneous: [
            "Investment",
            "Side Project",
            "Real Estate",
            "Ideas",
            "Errands",
            "Car",
            "Documents",
            "Networking",
            "Hobbies",
            "Other",
        ],

        projects: [
            "Scanshop",
            "Carvebench",
            "Mampfshop",
            "Real Estate Landingpage Maison Aurelia",
            "BuildDeck - 3D Development Software",
            "Aurelis Capital",
            "Onlineshop Platform"
        ]
    };


    /* =============================================================
       APPLICATION STATE
       =============================================================

       Everything is stored in this object.

       Example:

       state.projects.work.code = [
           {
               id: "...",
               text: "Finish API",
               finished: false
           }
       ]

       The order in each array IS the priority order.

       First task = highest priority.
       ============================================================= */

    let state = {
        projects: {},
        github: {
            owner: "",
            repo: "",
            path: "checklist-data.json"
        }
    };


    /* =============================================================
       LOCAL STORAGE KEY
       ============================================================= */

    const STORAGE_KEY = "projectChecklist_v2";


    /* =============================================================
       CREATE A UNIQUE TASK ID
       ============================================================= */

    function createId() {

        return (
            Date.now().toString(36) +
            "-" +
            Math.random().toString(36).substring(2, 10)
        );
    }


    /* =============================================================
       NORMALIZE PROJECT NAME
       =============================================================

       Converts a project name such as:

           Personal Finance

       into:

           personal-finance

       This is used as a safe HTML ID.
       ============================================================= */

    function projectId(category, project) {

        return (
            category +
            "-" +
            project
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
        );
    }


    /* =============================================================
       INITIALIZE EMPTY STATE
       ============================================================= */

    function createEmptyState() {

        const newState = {
            projects: {},
            github: {
                owner: "",
                repo: "",
                path: "checklist-data.json"
            }
        };


        Object.keys(PROJECTS).forEach(category => {

            newState.projects[category] = {};

            PROJECTS[category].forEach(project => {

                newState.projects[category][project] = [];

            });

        });

        return newState;
    }


    /* =============================================================
       LOAD DATA FROM LOCAL STORAGE
       ============================================================= */

    function loadLocalData() {

        try {

            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {

                state = createEmptyState();

                return;

            }

            const parsed = JSON.parse(saved);

            const empty = createEmptyState();

            /*
                Merge saved data into the known project structure.

                This means adding new projects in the future will not
                destroy existing saved tasks.
            */

            Object.keys(empty.projects).forEach(category => {

                Object.keys(empty.projects[category]).forEach(project => {

                    if (
                        parsed.projects &&
                        parsed.projects[category] &&
                        Array.isArray(parsed.projects[category][project])
                    ) {

                        empty.projects[category][project] =
                            parsed.projects[category][project];

                    }

                });

            });


            if (parsed.github) {

                empty.github = {
                    ...empty.github,
                    ...parsed.github
                };

            }


            state = empty;

        } catch (error) {

            console.error("Could not load local data:", error);

            state = createEmptyState();

        }

    }


    /* =============================================================
       SAVE DATA TO LOCAL STORAGE
       ============================================================= */

    function saveLocalData() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    }


    /* =============================================================
       SAVE GITHUB SETTINGS
       ============================================================= */

    function saveGithubSettings() {

        state.github.owner =
            document.getElementById("github-owner").value.trim();

        state.github.repo =
            document.getElementById("github-repo").value.trim();

        state.github.path =
            document.getElementById("github-path").value.trim()
            || "checklist-data.json";

        saveLocalData();

    }


    /* =============================================================
       LOAD GITHUB SETTINGS INTO THE FORM
       ============================================================= */

    function loadGithubSettings() {

        document.getElementById("github-owner").value =
            state.github.owner || "";

        document.getElementById("github-repo").value =
            state.github.repo || "";

        document.getElementById("github-path").value =
            state.github.path || "checklist-data.json";

    }


    /* =============================================================
       BUILD PROJECT SELECTOR
       ============================================================= */

    function buildProjectSelector() {

        const selector =
            document.getElementById("project-selector");

        selector.innerHTML = "";


        Object.keys(PROJECTS).forEach(category => {

            const group =
                document.createElement("optgroup");

            group.label =
                category.charAt(0).toUpperCase() +
                category.slice(1);


            PROJECTS[category].forEach(project => {

                const option =
                    document.createElement("option");

                option.value =
                    category + "|" + project;

                option.textContent =
                    project;

                group.appendChild(option);

            });


            selector.appendChild(group);

        });

    }


function buildJumpSelector() {

    const jump = document.getElementById("jump-selector");

    jump.innerHTML = '<option value="">Jump to project…</option>';

    Object.keys(PROJECTS).forEach(category => {

        const group = document.createElement("optgroup");
        group.label = category.charAt(0).toUpperCase() + category.slice(1);

        PROJECTS[category].forEach(project => {
            const option = document.createElement("option");
            option.value = "project-" + category + "-" + project.replace(/\s+/g, "-");
            option.textContent = project;
            group.appendChild(option);
        });

        jump.appendChild(group);
    });

    jump.addEventListener("change", () => {
        const target = document.getElementById(jump.value);
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        jump.value = "";   // reset so the same project can be picked again
    });
}


    /* =============================================================
       RENDER THE COMPLETE APPLICATION
       ============================================================= */

    function render() {

        const container =
            document.getElementById("project-container");

        container.innerHTML = "";


        Object.keys(PROJECTS).forEach(category => {

            /*
                Category heading
            */

            const heading =
                document.createElement("div");

            heading.className =
                "category-heading";

            const headingTitle =
                document.createElement("h2");

            headingTitle.textContent =
                category.charAt(0).toUpperCase() +
                category.slice(1);


            const projectCount =
                document.createElement("span");

            projectCount.className =
                "badge bg-secondary";

            projectCount.textContent =
                PROJECTS[category].length +
                " projects";


            heading.appendChild(headingTitle);
            heading.appendChild(projectCount);

            container.appendChild(heading);


            /*
                Bootstrap-style responsive row
            */

            const row =
                document.createElement("div");

            row.className = "row";


            /*
                Create one separate card for every project.
            */

            PROJECTS[category].forEach(project => {

                const column =
                    document.createElement("div");

                column.className =
                    "col-12 col-md-6 col-xl-4";

                column.id = "project-" + category + "-" + project.replace(/\s+/g, "-");

                const card =
                    document.createElement("div");

                card.className =
                    "card project-card";


                /*
                    Project card header
                */

                const header =
                    document.createElement("div");

                header.className =
                    "card-header project-header";


                const title =
                    document.createElement("span");

                title.className =
                    "project-name";

                title.textContent =
                    project;


                const count =
                    document.createElement("span");

                count.className =
                    "badge bg-primary project-task-count";


                header.appendChild(title);
                header.appendChild(count);


                /*
                    Project body
                */

                const body =
                    document.createElement("div");

                body.className =
                    "card-body";


                /*
                    Drop zone / task list
                */

                const list =
                    document.createElement("ul");

                list.className =
                    "task-list";

                list.dataset.category =
                    category;

                list.dataset.project =
                    project;


                const tasks =
                    state.projects[category][project];


                count.textContent =
                    tasks.length +
                    (tasks.length === 1 ? " task" : " tasks");


                if (tasks.length === 0) {

                    const empty =
                        document.createElement("div");

                    empty.className =
                        "empty-message";

                    empty.textContent =
                        "Drop tasks here or add a new task.";

                    list.appendChild(empty);

                } else {

                    tasks.forEach((task, index) => {

                        list.appendChild(
                            createTaskElement(
                                task,
                                category,
                                project,
                                index
                            )
                        );

                    });

                }


                /*
                    Enable drag-and-drop on this project.
                */

                setupDropZone(list);


                body.appendChild(list);
                card.appendChild(header);
                card.appendChild(body);

                column.appendChild(card);
                row.appendChild(column);

            });


            container.appendChild(row);

        });

    }


    /* =============================================================
       CREATE A TASK ELEMENT
       ============================================================= */

    function createTaskElement(
        task,
        category,
        project,
        index
    ) {

        const li =
            document.createElement("li");

        li.className =
            "task-item";

        li.dataset.taskId =
            task.id;

        li.dataset.category =
            category;

        li.dataset.project =
            project;


        if (task.finished) {

            li.classList.add("finished");

        }


        /*
            ========================================================
            GRAB HANDLE
            ========================================================

            This is the part the user physically grabs to move
            the task.

            HTML5 drag-and-drop is not reliable on every mobile
            browser, so this implementation uses Pointer Events.
        */

        const handle =
            document.createElement("button");

        handle.type = "button";

        handle.className =
            "drag-handle";

        handle.textContent =
            "☷";

        handle.title =
            "Grab and drag this task";

        handle.setAttribute(
            "aria-label",
            "Grab and drag task"
        );

        /*
            Pointer dragging is started here.
        */

        handle.addEventListener(
            "pointerdown",
            startPointerDrag
        );


        /*
            ========================================================
            CHECKBOX
            ========================================================
        */

        const checkbox =
            document.createElement("input");

        checkbox.type =
            "checkbox";

        checkbox.className =
            "task-checkbox";

        checkbox.checked =
            task.finished;


        checkbox.addEventListener(
            "change",
            () => {

                task.finished =
                    checkbox.checked;

                saveLocalData();

                render();

            }
        );


        /*
            ========================================================
            TASK TEXT
            ========================================================
        */

        const text =
            document.createElement("span");

        text.className =
            "task-text";

        text.textContent =
            task.text;


        /*
            ========================================================
            PRIORITY NUMBER
            ========================================================

            The first task is priority 1.
        */

        const priority =
            document.createElement("span");

        priority.className =
            "badge bg-info priority-number";

        priority.textContent =
            index + 1;

        priority.title =
            "Priority " + (index + 1);


        /*
            ========================================================
            ACTION BUTTONS
            ========================================================
        */

        const actions =
            document.createElement("div");

        actions.className =
            "task-actions";


        /*
            Move task up
        */

        const up =
            document.createElement("button");

        up.type = "button";

        up.className =
            "btn btn-sm btn-outline-secondary";

        up.textContent =
            "↑";

        up.title =
            "Increase priority";

        up.addEventListener(
            "click",
            () => moveTask(
                category,
                project,
                task.id,
                -1
            )
        );


        /*
            Move task down
        */

        const down =
            document.createElement("button");

        down.type = "button";

        down.className =
            "btn btn-sm btn-outline-secondary";

        down.textContent =
            "↓";

        down.title =
            "Decrease priority";

        down.addEventListener(
            "click",
            () => moveTask(
                category,
                project,
                task.id,
                1
            )
        );


        /*
            Edit button
        */

        const edit =
            document.createElement("button");

        edit.type = "button";

        edit.className =
            "btn btn-sm btn-outline-primary";

        edit.textContent =
            "Edit";


        edit.addEventListener(
            "click",
            () => {

                const newText =
                    prompt(
                        "Edit task:",
                        task.text
                    );


                if (
                    newText !== null &&
                    newText.trim() !== ""
                ) {

                    task.text =
                        newText.trim();

                    saveLocalData();

                    render();

                }

            }
        );


        /*
            Delete button
        */

        const del =
            document.createElement("button");

        del.type = "button";

        del.className =
            "btn btn-sm btn-danger";

        del.textContent =
            "×";

        del.title =
            "Delete task";


        del.addEventListener(
            "click",
            () => {

                state.projects[category][project] =
                    state.projects[category][project]
                        .filter(
                            item => item.id !== task.id
                        );

                saveLocalData();

                render();

            }
        );


        actions.appendChild(up);
        actions.appendChild(down);
        actions.appendChild(edit);
        actions.appendChild(del);


        /*
            Assemble task.
        */

        li.appendChild(handle);
        li.appendChild(checkbox);
        li.appendChild(text);
        li.appendChild(priority);
        li.appendChild(actions);


        return li;

    }


    /* =============================================================
       MOVE TASK UP / DOWN
       ============================================================= */

    function moveTask(
        category,
        project,
        taskId,
        direction
    ) {

        const tasks =
            state.projects[category][project];


        const index =
            tasks.findIndex(
                task => task.id === taskId
            );


        if (index === -1) {
            return;
        }


        const newIndex =
            index + direction;


        if (
            newIndex < 0 ||
            newIndex >= tasks.length
        ) {

            return;

        }


        /*
            Swap the two tasks.

            This changes their priority.
        */

        [
            tasks[index],
            tasks[newIndex]
        ] = [
            tasks[newIndex],
            tasks[index]
        ];


        saveLocalData();

        render();

    }


    /* =============================================================
       POINTER DRAGGING
       =============================================================

       This implements the "grab" function.

       It works with:
       - mouse
       - touchscreen
       - stylus

       The user grabs the ☷ handle and drags the task over another
       task or another project section.
       ============================================================= */

    let dragState = null;


    function startPointerDrag(event) {

        event.preventDefault();

        const handle =
            event.currentTarget;

        const taskElement =
            handle.closest(".task-item");

        if (!taskElement) {
            return;
        }


        /*
            Capture pointer movements even when the pointer leaves
            the handle.
        */

        try {
            handle.setPointerCapture(event.pointerId);
        } catch (error) {
            /* Some browsers may not support pointer capture. */
        }


        dragState = {

            taskId:
                taskElement.dataset.taskId,

            category:
                taskElement.dataset.category,

            project:
                taskElement.dataset.project,

            element:
                taskElement,

            pointerId:
                event.pointerId

        };


        taskElement.classList.add("dragging");


        /*
            Add movement handlers.
        */

        document.addEventListener(
            "pointermove",
            pointerDragMove,
            { passive: false }
        );

        document.addEventListener(
            "pointerup",
            pointerDragEnd,
            { once: true }
        );

        document.addEventListener(
            "pointercancel",
            pointerDragEnd,
            { once: true }
        );

    }


    function pointerDragMove(event) {

        if (!dragState) {
            return;
        }


        event.preventDefault();


        /*
            Find the element currently underneath the pointer.
        */

        const target =
            document.elementFromPoint(
                event.clientX,
                event.clientY
            );


        if (!target) {
            return;
        }


        const targetTask =
            target.closest(".task-item");

        const targetList =
            target.closest(".task-list");


        /*
            Highlight a possible drop zone.
        */

        document
            .querySelectorAll(".task-list.drag-over")
            .forEach(list =>
                list.classList.remove("drag-over")
            );


        if (targetList) {

            targetList.classList.add("drag-over");

        }


        /*
            If we're over another task, show where the dragged
            task would be inserted.
        */

        document
            .querySelectorAll(".task-item.drop-target")
            .forEach(item =>
                item.classList.remove("drop-target")
            );


        if (
            targetTask &&
            targetTask !== dragState.element
        ) {

            targetTask.classList.add("drop-target");

        }

    }


    function pointerDragEnd(event) {

        if (!dragState) {
            return;
        }


        const source =
            dragState;


        const target =
            document.elementFromPoint(
                event.clientX,
                event.clientY
            );


        /*
            Remove all visual drag indicators.
        */

        document
            .querySelectorAll(".drag-over")
            .forEach(element =>
                element.classList.remove("drag-over")
            );

        document
            .querySelectorAll(".drop-target")
            .forEach(element =>
                element.classList.remove("drop-target")
            );

        source.element.classList.remove("dragging");


        /*
            Determine target project.
        */

        const targetList =
            target
                ? target.closest(".task-list")
                : null;


        if (!targetList) {

            cleanupDrag();

            return;

        }


        const targetCategory =
            targetList.dataset.category;

        const targetProject =
            targetList.dataset.project;


        /*
            Find the task being moved.
        */

        const sourceTasks =
            state.projects[source.category][source.project];


        const sourceIndex =
            sourceTasks.findIndex(
                task => task.id === source.taskId
            );


        if (sourceIndex === -1) {

            cleanupDrag();

            return;

        }


        /*
            Remove the task from its original project.
        */

        const [movedTask] =
            sourceTasks.splice(
                sourceIndex,
                1
            );


        /*
            Find where the task should be inserted.
        */

        const targetTask =
            target
                ? target.closest(".task-item")
                : null;


        const targetTasks =
            state.projects[targetCategory][targetProject];


        let insertIndex =
            targetTasks.length;


        if (
            targetTask &&
            targetTask.dataset.taskId !== source.taskId
        ) {

            const targetIndex =
                targetTasks.findIndex(
                    task =>
                        task.id ===
                        targetTask.dataset.taskId
                );


            if (targetIndex !== -1) {

                const rect =
                    targetTask.getBoundingClientRect();


                /*
                    Dropping on the upper half places the task
                    before the target.

                    Dropping on the lower half places it after.
                */

                const before =
                    event.clientY <
                    rect.top + rect.height / 2;


                insertIndex =
                    before
                        ? targetIndex
                        : targetIndex + 1;

            }

        }


        /*
            If moving within the same list and the source was before
            the insertion point, compensate for its removal.
        */

        if (
            source.category === targetCategory &&
            source.project === targetProject &&
            sourceIndex < insertIndex
        ) {

            insertIndex--;

        }


        /*
            Keep the insertion index valid.
        */

        insertIndex =
            Math.max(
                0,
                Math.min(
                    insertIndex,
                    targetTasks.length
                )
            );


        targetTasks.splice(
            insertIndex,
            0,
            movedTask
        );


        /*
            Save immediately so moving tasks also works offline.
        */

        saveLocalData();

        render();

        cleanupDrag();

    }


    function cleanupDrag() {

        document
            .querySelectorAll(".drag-over")
            .forEach(element =>
                element.classList.remove("drag-over")
            );

        document
            .querySelectorAll(".drop-target")
            .forEach(element =>
                element.classList.remove("drop-target")
            );


        if (dragState) {

            dragState.element.classList.remove(
                "dragging"
            );

        }


        document.removeEventListener(
            "pointermove",
            pointerDragMove
        );


        dragState = null;

    }


    /* =============================================================
       SETUP PROJECT DROP ZONE
       ============================================================= */

    function setupDropZone(list) {

        /*
            Dragging over an empty project is also supported.

            pointerDragMove handles the visual highlighting.
        */

        list.addEventListener(
            "pointerenter",
            () => {

                if (dragState) {

                    list.classList.add(
                        "drag-over"
                    );

                }

            }
        );

    }


    /* =============================================================
       ADD NEW TASK
       ============================================================= */

    function addTask() {

        const input =
            document.getElementById("new-task");

        const selector =
            document.getElementById("project-selector");


        const text =
            input.value.trim();


        if (!text) {

            input.focus();

            return;

        }


        const selection =
            selector.value.split("|");


        const category =
            selection[0];

        const project =
            selection.slice(1).join("|");


        /*
            New tasks are inserted at priority 1.

            This means newly added tasks automatically become the
            highest-priority task in the selected project.
        */

        const task = {

            id: createId(),

            text: text,

            finished: false

        };


        state.projects[category][project].unshift(
            task
        );


        input.value = "";

        saveLocalData();

        render();

        input.focus();

    }


    /* =============================================================
       DELETE ALL COMPLETED TASKS
       ============================================================= */

    function deleteCompleted() {

        let deleted = false;


        Object.keys(state.projects).forEach(
            category => {

                Object.keys(
                    state.projects[category]
                ).forEach(project => {

                    const tasks =
                        state.projects[category][project];


                    const remaining =
                        tasks.filter(
                            task => !task.finished
                        );


                    if (
                        remaining.length !==
                        tasks.length
                    ) {

                        deleted = true;

                    }


                    state.projects[category][project] =
                        remaining;

                });

            }
        );


        if (deleted) {

            saveLocalData();

            render();

        }

    }


    /* =============================================================
       CLEAR EVERYTHING
       ============================================================= */

    function clearEverything() {

        const confirmed =
            confirm(
                "Delete every task from every project?"
            );


        if (!confirmed) {
            return;
        }


        state = createEmptyState();

        saveLocalData();

        loadGithubSettings();

        render();

    }


    /* =============================================================
       EXPORT DATA
       ============================================================= */

    function exportData() {

        const json =
            JSON.stringify(
                state,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type: "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "checklist-backup.json";

        link.click();


        URL.revokeObjectURL(url);

    }


    /* =============================================================
       IMPORT DATA
       ============================================================= */

    function importData(file) {

        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload = function () {

            try {

                const imported =
                    JSON.parse(
                        reader.result
                    );


                /*
                    Basic validation.
                */

                if (
                    !imported.projects
                ) {

                    throw new Error(
                        "Invalid checklist file."
                    );

                }


                const empty =
                    createEmptyState();


                /*
                    Merge only known projects.
                */

                Object.keys(
                    empty.projects
                ).forEach(category => {

                    Object.keys(
                        empty.projects[category]
                    ).forEach(project => {

                        if (
                            imported.projects[category] &&
                            Array.isArray(
                                imported.projects[
                                    category
                                ][project]
                            )
                        ) {

                            empty.projects[
                                category
                            ][project] =
                                imported.projects[
                                    category
                                ][project];

                        }

                    });

                });


                if (imported.github) {

                    empty.github = {
                        ...empty.github,
                        ...imported.github
                    };

                }


                state = empty;

                saveLocalData();

                loadGithubSettings();

                render();

                alert(
                    "Checklist imported successfully."
                );


            } catch (error) {

                alert(
                    "Import failed: " +
                    error.message
                );

            }

        };


        reader.readAsText(file);

    }


    /* =============================================================
       GITHUB HELPERS
       ============================================================= */


    /*
        Convert normal UTF-8 text into Base64.

        GitHub's Contents API expects file contents as Base64.
    */

    function encodeBase64(text) {

        const bytes =
            new TextEncoder().encode(text);

        let binary = "";

        bytes.forEach(
            byte =>
                binary += String.fromCharCode(byte)
        );

        return btoa(binary);

    }


    /*
        Decode Base64 received from GitHub.
    */

    function decodeBase64(base64) {

        const binary =
            atob(
                base64.replace(/\n/g, "")
            );


        const bytes =
            Uint8Array.from(
                binary,
                character =>
                    character.charCodeAt(0)
            );


        return new TextDecoder().decode(bytes);

    }


    /*
        Display GitHub status messages.
    */

    function githubStatus(
        message,
        type = "info"
    ) {

        const element =
            document.getElementById(
                "github-status"
            );


        element.textContent =
            message;

        element.className =
            "status visible " + type;

    }


    /* =============================================================
       SAVE TO GITHUB
       =============================================================

       Uses:

       PUT /repos/{owner}/{repo}/contents/{path}

       The GitHub token needs permission to write repository
       contents.

       IMPORTANT:
       A GitHub token is sensitive.

       This application stores it only in the browser while the
       page is open. It is NOT written into checklist-data.json.

       For maximum security, use a fine-grained token restricted
       to the specific repository and Contents: Read and write.
       ============================================================= */

    async function saveToGithub() {

        saveGithubSettings();


        const owner =
            document.getElementById(
                "github-owner"
            ).value.trim();


        const repo =
            document.getElementById(
                "github-repo"
            ).value.trim();


        const path =
            document.getElementById(
                "github-path"
            ).value.trim();


        const token =
            document.getElementById(
                "github-token"
            ).value.trim();


        if (
            !owner ||
            !repo ||
            !path ||
            !token
        ) {

            githubStatus(
                "Please enter the GitHub owner, repository, file path and token.",
                "error"
            );

            return;

        }


        githubStatus(
            "Saving checklist to GitHub...",
            "info"
        );


        try {

            const apiUrl =
                "https://api.github.com/repos/" +
                encodeURIComponent(owner) +
                "/" +
                encodeURIComponent(repo) +
                "/contents/" +
                path
                    .split("/")
                    .map(
                        encodeURIComponent
                    )
                    .join("/");


            /*
                First check whether the file already exists.

                We need its SHA to update it.
            */

            let sha = null;


            const existingResponse =
                await fetch(
                    apiUrl,
                    {
                        headers: {
                            "Authorization":
                                "Bearer " + token,

                            "Accept":
                                "application/vnd.github+json",

                            "X-GitHub-Api-Version":
                                "2022-11-28"
                        }
                    }
                );


            if (existingResponse.ok) {

                const existing =
                    await existingResponse.json();

                sha = existing.sha;

            }


            /*
                Do not store the GitHub token in the JSON.
            */

            const exportableState =
                {
                    projects:
                        state.projects
                };


            const json =
                JSON.stringify(
                    exportableState,
                    null,
                    2
                );


            const body = {

                message:
                    "Update checklist data",

                content:
                    encodeBase64(json),

                branch:
                    undefined

            };


            if (sha) {

                body.sha = sha;

            }


            const response =
                await fetch(
                    apiUrl,
                    {
                        method: "PUT",

                        headers: {

                            "Authorization":
                                "Bearer " + token,

                            "Accept":
                                "application/vnd.github+json",

                            "Content-Type":
                                "application/json",

                            "X-GitHub-Api-Version":
                                "2022-11-28"

                        },

                        body:
                            JSON.stringify(body)

                    }
                );


            if (!response.ok) {

                const error =
                    await response.json();

                throw new Error(
                    error.message ||
                    "GitHub rejected the request."
                );

            }


            githubStatus(
                "Checklist successfully saved to GitHub.",
                "success"
            );


        } catch (error) {

            console.error(error);

            githubStatus(
                "GitHub save failed: " +
                error.message,
                "error"
            );

        }

    }


    /* =============================================================
       LOAD FROM GITHUB
       ============================================================= */

    async function loadFromGithub() {

        saveGithubSettings();


        const owner =
            document.getElementById(
                "github-owner"
            ).value.trim();


        const repo =
            document.getElementById(
                "github-repo"
            ).value.trim();


        const path =
            document.getElementById(
                "github-path"
            ).value.trim();


        const token =
            document.getElementById(
                "github-token"
            ).value.trim();


        if (
            !owner ||
            !repo ||
            !path ||
            !token
        ) {

            githubStatus(
                "Please enter the GitHub owner, repository, file path and token.",
                "error"
            );

            return;

        }


        githubStatus(
            "Loading checklist from GitHub...",
            "info"
        );


        try {

            const apiUrl =
                "https://api.github.com/repos/" +
                encodeURIComponent(owner) +
                "/" +
                encodeURIComponent(repo) +
                "/contents/" +
                path
                    .split("/")
                    .map(
                        encodeURIComponent
                    )
                    .join("/");


            const response =
                await fetch(
                    apiUrl,
                    {
                        headers: {

                            "Authorization":
                                "Bearer " + token,

                            "Accept":
                                "application/vnd.github+json",

                            "X-GitHub-Api-Version":
                                "2022-11-28"

                        }
                    }
                );


            if (!response.ok) {

                const error =
                    await response.json();

                throw new Error(
                    error.message ||
                    "Could not load GitHub file."
                );

            }


            const file =
                await response.json();


            const json =
                decodeBase64(
                    file.content
                );


            const imported =
                JSON.parse(json);


            if (!imported.projects) {

                throw new Error(
                    "The GitHub file does not contain valid checklist data."
                );

            }


            const empty =
                createEmptyState();


            /*
                Merge only recognized projects.
            */

            Object.keys(
                empty.projects
            ).forEach(category => {

                Object.keys(
                    empty.projects[category]
                ).forEach(project => {

                    if (
                        imported.projects[category] &&
                        Array.isArray(
                            imported.projects[
                                category
                            ][project]
                        )
                    ) {

                        empty.projects[
                            category
                        ][project] =
                            imported.projects[
                                category
                            ][project];

                    }

                });

            });


            state.projects =
                empty.projects;


            saveLocalData();

            render();


            githubStatus(
                "Checklist successfully loaded from GitHub.",
                "success"
            );


        } catch (error) {

            console.error(error);

            githubStatus(
                "GitHub load failed: " +
                error.message,
                "error"
            );

        }

    }


    /* =============================================================
       EVENT LISTENERS
       ============================================================= */

    /*
        Add task button
    */

    document
        .getElementById("add-task-btn")
        .addEventListener(
            "click",
            addTask
        );


    /*
        Pressing Enter in the task input also adds a task.
    */

    document
        .getElementById("new-task")
        .addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    addTask();

                }

            }
        );


    /*
        Delete completed tasks
    */

    document
        .getElementById("delete-checked-btn")
        .addEventListener(
            "click",
            deleteCompleted
        );


    /*
        Clear everything
    */

    document
        .getElementById("clear-all-btn")
        .addEventListener(
            "click",
            clearEverything
        );


    /*
        Export
    */

    document
        .getElementById("export-btn")
        .addEventListener(
            "click",
            exportData
        );


    /*
        Import button opens the hidden file input.
    */

    document
        .getElementById("import-btn")
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById("import-file")
                    .click();

            }
        );


    /*
        Import selected JSON file.
    */

    document
        .getElementById("import-file")
        .addEventListener(
            "change",
            event => {

                importData(
                    event.target.files[0]
                );

                /*
                    Reset the file input so the same file can
                    be selected again later.
                */

                event.target.value = "";

            }
        );


    /*
        Show / hide GitHub controls.
    */

    document
        .getElementById("github-toggle")
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById("github-panel")
                    .classList.toggle(
                        "visible"
                    );

            }
        );


    /*
        GitHub save
    */

    document
        .getElementById("github-save")
        .addEventListener(
            "click",
            saveToGithub
        );


    /*
        GitHub load
    */

    document
        .getElementById("github-load")
        .addEventListener(
            "click",
            loadFromGithub
        );


    /*
        Save GitHub configuration whenever the user changes it.
    */

    [
        "github-owner",
        "github-repo",
        "github-path"
    ].forEach(id => {

        document
            .getElementById(id)
            .addEventListener(
                "change",
                saveGithubSettings
            );

    });


    /* =============================================================
       INITIAL APPLICATION STARTUP
       ============================================================= */

    /*
        1. Load local data.
        2. Build project selector.
        3. Load GitHub configuration.
        4. Render all 30 project sections.
    */

    loadLocalData();

    buildProjectSelector();

    buildJumpSelector();

    loadGithubSettings();

    render();
