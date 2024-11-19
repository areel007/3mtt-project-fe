document.addEventListener("DOMContentLoaded", () => {
  const BASE_URI = "https://threemtt-task-management-system.onrender.com/api";

  // Check if user is authenticated
  const authToken = sessionStorage.getItem("authToken");
  if (!authToken) {
    window.location.href = "../index.html";
    return;
  }

  // const filterSvg = document.querySelector(".filter svg");
  const filterContent = document.querySelector(".filter__content");
  const tasksInner = document.querySelector(".tasks__inner");
  const searchInput = document.querySelector(".search input");
  const filterDropdown = document.querySelector(".filter__content select");
  const filterDate = document.querySelector(
    ".filter__content input[type=date]"
  );
  const editTaskBtn = document.querySelector(".edit__btn");
  const closeEditForm = document.querySelector(".close__edit__form");

  let taskId; // Global variable to hold the task ID

  const renderTasks = (tasks) => {
    tasksInner.innerHTML = ""; // Clear previous tasks

    if (tasks.length === 0) {
      const noTasksMessage = document.createElement("p");
      noTasksMessage.textContent = "Zero task";
      noTasksMessage.classList.add("no-tasks-message"); // Add a class for styling if needed
      tasksInner.appendChild(noTasksMessage);
      return;
    }

    tasks.forEach((task) => {
      const taskCard = document.createElement("div"); // Create a new task card for each task
      const date = new Date(task.deadline);
      const options = { year: "numeric", month: "short", day: "numeric" };
      const formattedDate = date.toLocaleDateString("en-US", options);

      taskCard.classList.add("task__card", task.priority);
      taskCard.dataset.taskId = task._id;
      taskCard.innerHTML = `
        <div class="task__card__header">
          <h3>${task.title}</h3>
          <span>${task.priority}</span>
        </div>
        <p class="description">${task.description}</p>
        <div class="date-edit-delete">
          <span class="due__date">${formattedDate}</span>
          <div class="svgs__wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" id="edit__icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 del__btn">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </div>
        </div>
      `;
      tasksInner.appendChild(taskCard);
    });
  };

  const fetchTasks = async (query = "") => {
    try {
      const url = query ? `${BASE_URI}/task?${query}` : `${BASE_URI}/task`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch tasks.");
        return;
      }

      const data = await response.json();
      renderTasks(data.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  fetchTasks();

  // Update tasks dynamically as the user types in the search input
  searchInput.addEventListener("input", (event) => {
    const searchQuery = event.target.value.trim(); // Get the search query
    const query = searchQuery ? `query=${encodeURIComponent(searchQuery)}` : "";
    fetchTasks(query); // Fetch and update tasks based on the search query
  });

  // Handle filter dropdown visibility
  const filter = document.querySelector(".filter svg");

  if (filter) {
    filter.addEventListener("click", () => {
      if (filterContent) {
        // Toggle visibility
        filterContent.style.display =
          filterContent.style.display === "flex" ? "none" : "flex";
      }
    });
  }

  // Update tasks based on the priority filter
  filterDropdown.addEventListener("change", (event) => {
    filterContent.style.display = "none";
    const priorityQuery = event.target.value
      ? (priority = `${event.target.value}`)
      : "";

    const query = priorityQuery
      ? `priority=${encodeURIComponent(priorityQuery)}`
      : "";

    fetchTasks(query); // Fetch and update tasks
  });

  // update tasks based on date
  filterDate.addEventListener("change", (event) => {
    filterContent.style.display = "none"; // Hide the filter content dropdown after a selection
    const selectedDate = event.target.value; // Get the selected date

    const query = selectedDate
      ? `deadline=${encodeURIComponent(selectedDate)}`
      : "";

    fetchTasks(query); // Fetch and update tasks based on the selected date
  });

  tasksInner.addEventListener("click", async (e) => {
    const editIcon = e.target.closest("#edit__icon");
    if (editIcon) {
      const taskCard = editIcon.closest(".task__card");
      taskId = taskCard.dataset.taskId; // Set the global task ID
      const editTaskForm = document.querySelector(".edit__task__form");
      editTaskForm.style.display = "grid";

      fetchTask();
    }

    const deleteIcon = e.target.closest(".del__btn");
    if (deleteIcon) {
      const taskCard = deleteIcon.closest(".task__card");
      const taskId = taskCard.dataset.taskId; // Get the task ID

      try {
        const response = await fetch(`${BASE_URI}/task/${taskId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`, // Use the saved token
          },
        });

        if (!response.ok) {
          console.error("Failed to delete task.");
          return;
        }

        console.log("Task deleted successfully");
        fetchTasks(); // Refresh tasks after deletion
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  });

  const fetchTask = async () => {
    try {
      const response = await fetch(`${BASE_URI}/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch task");

      const task = await response.json();
      const taskTitle = document.querySelector(
        ".edit__task__form input[type=text]"
      );
      const taskDescriptionInput = document.querySelector(
        ".edit__task__form textarea"
      );
      const taskPriority = document.querySelector(".edit__task__form select");
      const taskDeadline = document.querySelector(
        ".edit__task__form input[type=date]"
      );

      taskTitle.value = task.task.title || "";
      taskDescriptionInput.value = task.task.description || "";
      taskPriority.value = task.task.priority || "";
      taskDeadline.value = task.task.deadline || "";
    } catch (error) {
      console.error(error.message);
    }
  };

  editTaskBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const title = document.querySelector(".edit__task__form input[type=text]");
    const description = document.querySelector(".edit__task__form textarea");
    const priority = document.querySelector(".edit__task__form select");
    const deadline = document.querySelector(
      ".edit__task__form input[type=date]"
    );

    try {
      const response = await fetch(`${BASE_URI}/task/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          title: title.value,
          description: description.value,
          priority: priority.value,
          deadline: deadline.value,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update task.");
        return;
      }

      const editTaskForm = document.querySelector(".edit__task__form");
      editTaskForm.style.display = "none";
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  });

  if (closeEditForm) {
    closeEditForm.addEventListener("click", () => {
      const editTaskForm = document.querySelector(".edit__task__form");
      editTaskForm.style.display = "none";
    });
  }

  // user
  const user = document.querySelector(".user");
  const fetchUser = async () => {
    const response = await fetch(
      `${BASE_URI}/user/${window.sessionStorage.getItem("userId")}`
    );

    const _user = await response.json();

    user.textContent = _user.user.username[0];
  };

  fetchUser();

  // add task
  const addTask = document.querySelector(".add__task");
  if (addTask) {
    const addTaskForm = document.querySelector(".task__form");
    const addFormBtn = document.querySelector(".add__btn");

    addTask.addEventListener("click", () => {
      // Toggle the form visibility
      if (addTaskForm) {
        const isFormVisible = addTaskForm.style.display === "grid";
        addTaskForm.style.display = isFormVisible ? "none" : "grid";

        // Update the button textContent
        addTask.textContent = isFormVisible ? "+" : "x";
      }
    });

    const handleAddTask = async (event) => {
      event.preventDefault();

      const addFormTitle = document.querySelector(
        ".task__form input[type=text]"
      );
      const addFormDescription = document.querySelector(".task__form textarea");
      const addFormPriority = document.querySelector(".task__form select");
      const addFormDate = document.querySelector(
        ".task__form input[type=date]"
      );
      const addFormError = document.querySelector(".task__form .task__error");

      try {
        // Check if any field is missing or empty
        if (
          !addFormTitle?.value ||
          !addFormDescription?.value ||
          !addFormPriority?.value ||
          !addFormDate?.value
        ) {
          if (addFormError) {
            addFormError.style.display = "inline-block";
            addFormError.textContent = "*All fields must be filled.";
          }
          return;
        }

        // Make API request
        const response = await fetch(`${BASE_URI}/task`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`, // Use the saved token
          },
          body: JSON.stringify({
            user: sessionStorage.getItem("userId"),
            title: addFormTitle.value,
            description: addFormDescription.value,
            priority: addFormPriority.value,
            deadline: addFormDate.value,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Display error message
          if (addFormError) {
            addFormError.textContent = data.message || "Error adding task";
            addFormError.style.display = "block"; // Make the error message visible
            setTimeout(() => {
              addFormError.textContent = ""; // Clear the error message after 1 second
              addFormError.style.display = "none"; // Hide the error
            }, 1000);
          }
          return;
        }

        // Redirect to dashboard
        window.location.href = "../../pages/dashboard.html";
      } catch (error) {
        console.error("Error adding task:", error);
        if (addFormError) {
          addFormError.textContent =
            "An unexpected error occurred. Please try again.";
          addFormError.style.display = "block";
          setTimeout(() => {
            addFormError.textContent = ""; // Clear the error message after 5 seconds
            addFormError.style.display = "none"; // Hide the error
          }, 5000);
        }
      }
    };

    if (addFormBtn) {
      addFormBtn.addEventListener("click", handleAddTask);
    }
  }

  // logout user
  const logout = document.querySelector(".logout__icon");
  if (logout) {
    logout.addEventListener("click", () => {
      window.sessionStorage.clear();
      window.location.href = "../index.html";
    });
  }
});
