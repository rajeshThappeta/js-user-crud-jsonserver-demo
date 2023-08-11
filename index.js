let tbody = document.querySelector("tbody");
const user_form = document.querySelector(".user-form");
const add_user_btn = document.querySelector(".add-user");
let users = [];
let noUsersElement = document.createElement("h1");
let validationErrorMessage = document.createElement("p");

const addUser = async (event) => {
  event.preventDefault();
  //read data from inputs
  let name = document.querySelector("#name").value;
  let email = document.querySelector("#email").value;
  let dob = document.querySelector("#dob").value;
  let gender = "";
  if (document.querySelector("#male").checked) {
    gender = document.querySelector("#male").value;
  }
  if (document.querySelector("#female").checked) {
    gender = document.querySelector("#female").value;
  }
  validationErrorMessage.remove();
  //validating user data
  let validationStatus = validateUserData({ name, email, dob, gender });

  console.log(validationStatus);
  if (validationStatus.status === false) {
    showUserDataValidationMessage(validationStatus.message);
    return;
  }
  try {
    let res = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, dob, gender }),
    });
    // console.log(res);
    if (res.status === 201) {
      showAlert("New user added", "lightgreen");
      getUsers();
    }
    // users = await res.json();
  } catch (err) {
    console.log("err", err);
  }
};

//add user
user_form.addEventListener("submit", addUser, false);

//form vaidation function
const validateUserData = (user) => {
  if (user.name === "") {
    return { status: false, message: "Name of the User required" };
  } else if (user.email === "") {
    return { status: false, message: "Email of the User required" };
  } else if (user.dob === "") {
    return { status: false, message: "Date of birth is required" };
  } else if (user.gender === "") {
    return { status: false, message: "Gender is required" };
  } else {
    return { status: true };
  }
};

//delete user
//update user

//read present users
const getUsers = async () => {
  let res = await fetch("http://localhost:3000/users", { method: "GET" });
  users = await res.json();
  // console.log("get users", users);
  displayUserstable();
};

//display users in table
const displayUserstable = async () => {
  //get present users

  //console.log("display users", users.length);
  if (users.length === 0) {
    noUsersElement.setAttribute("class", "text-center text-white fs-1");
    noUsersElement.textContent = "No Users";
    document.querySelector("#users-table").style.display = "none";
    document.querySelector(".users-view").appendChild(noUsersElement);
  } else {
    document.querySelector("#users-table").style.display = "revert";
    noUsersElement.remove();
    tbody.innerHTML = null;
    for (let user of users) {
      tbody.innerHTML += `<tr>
                  <td>${user.name}</td>
                  <td>${user.email}</td>
                  <td>${user.dob}</td>
                  <td>${user.gender}</td>
                  <td>
                    <button class="btn btn-sm btn-warning me-2" onclick="editUser(' ${encodeURIComponent(
                      JSON.stringify(user)
                    )}')"><i class="fa-regular fa-pen-to-square"></i></button>
                    <button class='btn btn-sm  me-1' style='background-color:#CB4335;color:white' onclick='deleteUserByID(${
                      user.id
                    })'><i class="fa-regular fa-trash-can"></i></button>
                  </td>
              </tr>`;
    }

    //console.log(tbody);
  }
};
let userToEdit = {};
let myModal;
//user edit
const editUser = (user) => {
  userToEdit = JSON.parse(decodeURIComponent(user));

  myModal = new bootstrap.Modal(document.getElementById("modal-template"));
  myModal.show();

  //set user data to edit form
  document.querySelector("#edit-name").value = userToEdit.name;
  document.querySelector("#edit-email").value = userToEdit.email;
  document.querySelector("#edit-dob").value = userToEdit.dob;

  if (userToEdit.gender === "M") {
    document.querySelector("#edit-male").checked = true;
  }
  if (userToEdit.gender === "F") {
    document.querySelector("#edit-female").checked = true;
  }
};

//save edited user
const saveModifiedUser = async (event) => {
  event.preventDefault();
  let editUserId = userToEdit.id;
  let name = document.querySelector("#edit-name").value;
  let email = document.querySelector("#edit-email").value;
  let dob = document.querySelector("#edit-dob").value;
  let gender = "";
  if (document.querySelector("#edit-male").checked) {
    gender = document.querySelector("#male").value;
  }
  if (document.querySelector("#edit-female").checked) {
    gender = document.querySelector("#female").value;
  }

  try {
    let res = await fetch(`http://localhost:3000/users/${userToEdit.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ editUserId, name, email, dob, gender }),
    });

    if (res.status === 200) {
      // showAlert("New user added", "lightgreen");
      myModal.hide();
      getUsers();
    }
    users = await res.json();
  } catch (err) {
    console.log("err", err);
  }
};

//delete user by ID
const deleteUserByID = async (id) => {
  console.log(id);
  let res = await fetch(`http://localhost:3000/users/${Number(id)}`, {
    method: "DELETE",
  });
  if (res.status === 200) {
    showAlert("User removed");
    getUsers();
  }
};
//add user
document
  .querySelector(".user-edit-form")
  .addEventListener("submit", saveModifiedUser, false);

//operation alert
const showAlert = (message, className) => {
  let obj;
  if (message === "New user added") {
    obj = document.querySelector("#add-alert");
  }
  if (message === "User removed") {
    obj = document.querySelector("#delete-alert");
  }
  obj.style.display = "revert";

  obj.textContent = message;
  obj.style.color = className;
  obj.setAttribute("class", "text-center  ");
  obj.style.animation = "fadeIn 2s";
  // obj.style['-webkit-animation']='fadeIn 2s'
  setTimeout(() => {
    obj.style.display = "none";
  }, 2000);
};

//user form validation error messages
const showUserDataValidationMessage = (message) => {
  validationErrorMessage = document.createElement("p");
  validationErrorMessage.textContent = message;
  validationErrorMessage.setAttribute("class", "lead fs-6  fst-italic");
  validationErrorMessage.style.fontFamily = "arial";
  validationErrorMessage.style.position = "absolute";
  validationErrorMessage.style.top = "5px";
  validationErrorMessage.style.right = "10px";
  validationErrorMessage.style.color = "#ff4e6a";

  document.querySelector(".add-user-form").appendChild(validationErrorMessage);
};

getUsers();
