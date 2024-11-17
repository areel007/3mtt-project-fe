document.addEventListener("DOMContentLoaded", () => {
  // Utility function: Check if token is expired
  const isTokenExpired = (token) => {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode payload
    return payload.exp * 1000 < Date.now(); // Compare expiration time with current time
  };

  // Check for token and validate it
  const token = sessionStorage.getItem("authToken");
  if (!token || isTokenExpired(token)) {
    sessionStorage.clear(); // Clear any stored data
    window.location.href = "../../index.html"; // Redirect to login page
    return;
  }

  // Fetch and render tasks
  const tasksInner = document.querySelector(".tasks__inner");
  const searchInput = document.querySelector(".search input");
  const filterDropdown = document.querySelector(".filter__content select");
  const filterDate = document.querySelector(
    ".filter__content input[type=date]"
  );

  const renderTasks = (tasks) => {
    tasksInner.innerHTML = ""; // Clear previous tasks
    tasks.forEach((task) => {
      // Format date
      const date = new Date(task.deadline);
      const options = { year: "numeric", month: "short", day: "numeric" };
      const formattedDate = date.toLocaleDateString("en-US", options);

      // Create task card
      const taskCard = document.createElement("div");
      taskCard.classList.add("task__card", task.priority);
      taskCard.innerHTML = `
        <div class="task__card__header">
          <h3>${task.title}</h3>
          <span>${task.priority}</span>
        </div>
        <p class="description">${task.description}</p>
        <span class="due__date">${formattedDate}</span>
      `;
      tasksInner.appendChild(taskCard);
    });
  };

  const fetchTasks = async (query = "") => {
    try {
      const url = query
        ? `http://localhost:5000/api/task?${query}`
        : `http://localhost:5000/api/task`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`, // Use the saved token
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

  // Initial fetch of all tasks
  fetchTasks();

  // Update tasks dynamically as the user types in the search input
  searchInput.addEventListener("input", (event) => {
    const searchQuery = event.target.value.trim(); // Get the search query
    const priorityQuery = filterDropdown.value
      ? `priority=${filterDropdown.value}`
      : "";
    const query = `${searchQuery ? `query=${searchQuery}` : ""}${
      searchQuery && priorityQuery ? "&" : ""
    }${priorityQuery}`;
    fetchTasks(query); // Fetch and update tasks
  });

  filterDate.addEventListener("change", (event) => {
    filterContent.style.display = "none";
    const searchQuery = searchInput.value.trim();
    const priorityQuery = filterDropdown.value
      ? `priority=${filterDropdown.value}`
      : "";
    const query = `${searchQuery ? `query=${searchQuery}` : ""}${
      searchQuery && priorityQuery ? "&" : ""
    }${priorityQuery}&deadline=${event.target.value}`;
    fetchTasks(query); // Fetch and update tasks
  });

  // Update tasks based on the priority filter
  const filterContent = document.querySelector(".filter__content");
  filterDropdown.addEventListener("change", (event) => {
    filterContent.style.display = "none";
    const priorityQuery = event.target.value
      ? `priority=${event.target.value}`
      : "";
    const searchQuery = searchInput.value.trim();
    const query = `${searchQuery ? `query=${searchQuery}` : ""}${
      searchQuery && priorityQuery ? "&" : ""
    }${priorityQuery}`;
    fetchTasks(query); // Fetch and update tasks
  });

  // Handle filter dropdown visibility
  const filter = document.querySelector(".filter svg");
  if (filter) {
    filter.addEventListener("click", () => {
      if (filterContent) {
        filterContent.style.display =
          filterContent.style.display === "flex" ? "none" : "flex";
      }
    });
  }

  // handle logout
  const logout = document.querySelector(".user-logout svg");
  if (logout) {
    logout.addEventListener("click", () => {
      sessionStorage.removeItem("authToken");
      window.location.href = "../../index.html";
    });
  }

  // get user
  const userId = sessionStorage.getItem("userId");
  let user = document.querySelector(".user");
  const fetchUser = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`, // Use the saved token
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user.");
        return;
      }

      const data = await response.json();
      const _user = data.user;

      user.textContent = _user.username[0];

      if (user) {
        const username = document.querySelector(".username");
        if (username) {
          username.textContent = user.username;
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  fetchUser();

  // Add task
  const addBtn = document.querySelector(".add__task");
  const addTaskForm = document.querySelector("form.task__form");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      // Toggle the form visibility
      if (addTaskForm) {
        const isFormVisible = addTaskForm.style.display === "grid";
        addTaskForm.style.display = isFormVisible ? "none" : "grid";

        // Update the button textContent
        addBtn.textContent = isFormVisible ? "+" : "x";
      }
    });
  }
  const addFormBtn = document.querySelector(".add__btn");

  const handleAddTask = async (event) => {
    event.preventDefault();

    const addFormTitle = document.querySelector(".task__form input[type=text]");
    const addFormDescription = document.querySelector(".task__form textarea");
    const addFormPriority = document.querySelector(".task__form select");
    const addFormDate = document.querySelector(".task__form input[type=date]");
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
      const response = await fetch("http://localhost:5000/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`, // Use the saved token
        },
        body: JSON.stringify({
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
});
