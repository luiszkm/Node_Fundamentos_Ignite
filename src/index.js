const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find(user => user.username === username)
  if (!userExists) {
    return response.status(404).json({ error: "Usuário não encontrado" })
    //throw new Error(`Usuário não encontrado`);
  }
  request.username = username;
  return next()

}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const userExists = users.find(user => user.username === username)
  if (userExists) {
    return response.status(404).json({ error: "Usuário Já cadastrado" })
    //  throw new Error(`User ${username} already exists`);
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const userTask = users.find(task => task.username === username)

  return response.status(201).json(userTask.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { title } = request.body
  const userTasks = users.find(task => task.username === username) || []
  const newTask = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date().toISOString(),
    created_at: new Date().toISOString()
  }

  userTasks.todos.push(newTask)

  return response.status(201).json(userTasks)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const userTasks = users.find((task) => task.username === username) || []
  const taskUpdated = userTasks.todos.find(task => task.id === id)

  if (!taskUpdated || taskUpdated === undefined) {
    return response.status(404).json({ error: "tarefa não encontrada" })
  }

  taskUpdated.title = title
  taskUpdated.deadline = new Date(deadline)

  return response.status(201).json(taskUpdated)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { id } = request.params
  const userTasks = users.find((task) => task.username === username) || []
  const taskUpdated = userTasks.todos.find(task => task.id === id)
  if (!taskUpdated || taskUpdated === undefined) {
    return response.status(404).json({ error: "tarefa não encontrada" })
  }
  taskUpdated.done = true
  taskUpdated.deadline = new Date().toISOString()

  return response.status(201).json(taskUpdated)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { id } = request.params
  const userTasks = users.find((task) => task.username === username) || []
  const taskUpdated = userTasks.todos.find(task => task.id === id)
  if (!taskUpdated || taskUpdated === undefined) {
    return response.status(404).json({ error: "tarefa não encontrada" })
  }
  const taskDeleted = userTasks.todos.filter(task => task !== taskUpdated)



  return response.status(204).json(taskDeleted)
});

module.exports = app;