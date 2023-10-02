const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const initiatingDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("It's Running...");
    });
  } catch (e) {
    console.log(`Error is ${e.message}`);
    process.exit(1);
  }
};
initiatingDB();
const hasPASP = (i) => {
  return i.priority !== undefined && i.status !== undefined;
};
const hasPP = (i) => {
  return i.priority !== undefined;
};
const hasSP = (i) => {
  return i.status !== undefined;
};
const hasCAS = (i) => {
  return i.category !== undefined && i.status !== undefined;
};
const hasCAP = (i) => {
  return i.priority !== undefined && i.category !== undefined;
};
const hasSeP = (i) => {
  return i.search_q !== undefined;
};
const hasCP = (i) => {
  return i.category !== undefined;
};
const outPutResult = (j) => {
  return {
    id: j.id,
    todo: j.todo,
    priority: j.priority,
    category: j.category,
    status: j.status,
    dueDate: j.due_date,
  };
};
//API-1
app.get("/todos/", async (request, response) => {
  let data = null;
  let query = "";
  const { search_q = "", priority, status, category } = request.query;
  switch (true) {
    case hasPASP(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          query = `SELECT * FROM todo WHERE status = '${status}' AND priority = '${priority}';`;
          data = await db.all(query);
          response.send(data.map((k) => outPutResult(k)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasCAS(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          query = `SELECT * FROM todo WHERE status = '${status}' AND category = '${category}';`;
          data = await db.all(query);
          response.send(data.map((k) => outPutResult(k)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasCAP(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          query = `SELECT * FROM todo WHERE category = '${category}' AND priority = '${priority}';`;
          data = await db.all(query);
          response.send(data.map((k) => outPutResult(k)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasPP(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        query = `SELECT * FROM todo WHERE priority = '${priority}';`;
        data = await db.all(query);
        response.send(data.map((k) => outPutResult(k)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasSP(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        query = `SELECT * FROM todo WHERE status = '${status}';`;
        data = await db.all(query);
        response.send(data.map((k) => outPutResult(k)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasSeP(request.query):
      query = `SELECT * FROM todo WHERE todo like '%${search_q}%';`;
      data = await db.all(query);
      response.send(data.map((k) => outPutResult(k)));
      break;
    case hasCP(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        query = `SELECT * FROM todo WHERE category = '${category}';`;
        data = await db.all(query);
        response.send(data.map((k) => outPutResult(k)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      query = `SELECT * FROM todo;`;
      data = await db.all(query);
      response.send(data.map((k) => outPutResult(k)));
  }
});
//API-2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo WHERE id = ${todoId};`;
  const res = await db.get(query);
  response.send(outPutResult(res));
});
//API-3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const query = `SELECT * FROM todo WHERE due_date='${newDate}';`;
    const res = await db.all(query);
    response.send(res.map((k) => outPutResult(k)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});
//API-4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postNewDueDate = format(new Date(dueDate), "yyyy-MM-dd");
          const query = `INSERT INTO todo (id, todo, priority, status, category, due_date) VALUES (${id}, '${todo}', '${priority}', '${status}', '${category}', '${postNewDueDate}');`;
          await db.run(query);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});
//API-5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  const query = `SELECT * FROM todo WHERE id = ${todoId};`;
  const res = await db.get(query);
  const {
    todo = res.todo,
    priority = res.priority,
    status = res.status,
    category = res.category,
    dueDate = res.dueDate,
  } = request.body;
  let updateTodoQuery;
  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id=${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id=${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestBody.todo !== undefined:
      updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id=${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;
    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id=${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${newDueDate}' WHERE id=${todoId};`;
        await db.run(updateTodoQuery);
        response.send(`Due Date Updated`);
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});
//API-6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(query);
  response.send("Todo Deleted");
});
module.exports = app;
