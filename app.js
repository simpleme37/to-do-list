// 當 DOM 內容加載完成後，執行這段程式碼
const todoInput = document.getElementById("todo-input");
const addTodoButton = document.getElementById("add-todo");
const todoList = document.getElementById("todo-list");
// 空白訊息的變數
const emptyMessage = document.getElementById("empty-message");
const emptyMessageContainer = document.getElementById(
  "empty-message-container"
);
// 清空列表的變數
const clearButton = document.getElementById("clear-list");
// 編輯標題的變數
const editButton = document.getElementById("edit-icon");
const title = document.getElementById("title");
const defaultTitle = title.textContent;
// 換主題的變數
const pageStickers = document.querySelectorAll(".page-sticker");
const root = document.documentElement;
// 計算項目數
const count = document.getElementById("count");

// 編輯標題
editButton.addEventListener("click", () => {
  title.setAttribute("contenteditable", true);
  title.focus();
});

// 標題 blur 時
title.addEventListener("blur", () => {
  title.setAttribute("contenteditable", false);
  if (title.textContent.trim() === "") {
    title.textContent = defaultTitle;
  }
});

// 按下 Enter 之後自動保存 ( 觸發title blur )
title.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    title.blur();
  }
});

// 換主題
pageStickers.forEach((sticker) => {
  sticker.addEventListener("click", () => {
    // 獲取當前書籤的主題顏色
    const theme = sticker.id.split("_")[1]; // 提取主題名稱，例如 'blue', 'green', 'yellow', 'pink'

    // 將主題應用到根元素上
    root.setAttribute("data-theme", theme);

    // 移除所有書籤的active class
    pageStickers.forEach((sticker) => sticker.classList.remove("active"));

    // 給當前書籤加上active class
    sticker.classList.add("active");
  });
});

// 預設藍色主題
root.setAttribute("data-theme", "blue");
document.getElementById("page_blue").classList.add("active");

// 加載local storage中的待辦事項
function loadTodos() {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  todos.forEach((todo) => addTodoItem(todo.text, todo.completed));
  updateMessage();
}

// 更新local storage中的待辦事項
function saveTodos() {
  const todos = [];
  todoList.querySelectorAll("li").forEach((li) => {
    // 類似map出來?
    const text = li.querySelector("span").textContent;
    const completed = li.classList.contains("completed");
    todos.push({ text, completed });
  });
  localStorage.setItem("todos", JSON.stringify(todos));
}

// 更新空清單提示 + 更新計算項目數
function updateMessage() {
  const totalTodos = todoList.children.length;
  const doneTodos = todoList.querySelectorAll(".completed").length;
  count.textContent = `已完成 ${doneTodos}/${totalTodos} 項`;
  // 如果清單是空的
  if (todoList.children.length === 0) {
    emptyMessage.style.display = "block";
    clearButton.style.display = "none";
    todoList.style.margin = "0"; // 去掉margin
    emptyMessageContainer.style.margin = "24px 0"; // 照常顯示margin
  } else {
    // 如果不是空的
    emptyMessage.style.display = "none";
    clearButton.style.display = "block";
    todoList.style.margin = "24px 0"; // 照常顯示margin
    emptyMessageContainer.style.margin = "0"; // 去掉margin
  }
}

// 清空清單
clearButton.addEventListener("click", () => {
  todoList.innerHTML = "";
  updateMessage();
  localStorage.removeItem("todos");
});

// 綁定事件，當點擊添加按鈕時執行
addTodoButton.addEventListener("click", addTodo);
// 綁定事件，按下enter時執行
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});

function addTodo() {
  const todoText = todoInput.value.trim();
  // 如果有內容的話，呼叫 addTodoItem 函數並且將 todoInput 重置
  if (todoText) {
    addTodoItem(todoText, false); // 初始是false
    todoInput.value = "";
    saveTodos();
  }
}

// 添加代辦事項
function addTodoItem(text, completed = false) {
  // 創建代辦事項項目
  const li = document.createElement("li");

  // 如果completed是true，給item添加completed這個class
  // 因為loadTodos中會取用，這行是有作用的
  if (completed) {
    li.classList.add("completed");
  }

  // 創建待辦事項的內容容器
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("todo-item-content");

  // 創建待辦事項的內容文字span
  const itemSpan = document.createElement("span");
  itemSpan.textContent = text;

  // 創建待辦事項的刪除按鈕
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
  deleteButton.addEventListener("click", () => {
    // 刪除之後更新空清單提示
    todoList.removeChild(li);
    updateMessage();
    saveTodos();
  });

  // 創建待辦事項的checkbox
  const doneCheckBox = document.createElement("input");
  doneCheckBox.type = "checkbox";
  doneCheckBox.classList.add("done-checkbox");
  doneCheckBox.checked = completed; // 初始狀態
  doneCheckBox.addEventListener("click", () => {
    // 給li套上已完成/未完成的樣式
    li.classList.toggle("completed");

    // 查找列表中的所有已完成项目
    const completedItems = Array.from(todoList.children).filter((item) =>
      item.classList.contains("completed")
    );

    console.log("Completed items:", completedItems);

    // 如果當前item是已完成的
    if (li.classList.contains("completed")) {
      // 如果已有已完成item，將他放在已完成項目的最上方
      if (completedItems.length > 1) {
        todoList.insertBefore(li, completedItems[1]);
      } else {
        // 如果這是第一個已完成的item，放在列表的最底部
        todoList.appendChild(li);
      }
    } else {
      // 如果當前item是未完成的
      // 未完成的 li 移到未完成項目的最下方
      if (completedItems.length > 0) {
        // 如果列表中有已完成項目
        todoList.insertBefore(li, completedItems[0]);
      } else {
        // 如果列表中沒有已完成項目(*最後一個，可能沒有第一個完成項目)
        todoList.appendChild(li);
      }
    }

    updateMessage();
    saveTodos();
  });

  // 將 checkbox 和文本節點添加到內容容器
  contentDiv.appendChild(doneCheckBox);
  contentDiv.appendChild(itemSpan);

  // 將添加到待辦事項項目中
  li.appendChild(contentDiv);
  li.appendChild(deleteButton);

  // 將待辦事項項目添加到待辦事項列表中
  todoList.prepend(li);
  // 添加項目後更新空清單提示
  updateMessage();
}

// 加載待辦事項
// 等所有的DOM元素加載完
document.addEventListener("DOMContentLoaded", loadTodos);
