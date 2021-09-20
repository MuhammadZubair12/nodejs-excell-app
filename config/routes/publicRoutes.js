module.exports = {
  'POST /user': 'UserController.register',
  'POST /sheet1': 'SheetController.create',
  'POST /register': 'UserController.register', // alias for POST /user
  'POST /login': 'UserController.login',
  'POST /validate': 'UserController.validate',

  'GET /sync-db': 'GeneralController.sync',

  'POST /driver': 'UserController.createDriver',
  'POST /sheet': 'UserController.sheet',
  'POST /abc': 'UserController.abc',
  'GET /driver/:id': 'UserController.getDriver',
  'GET /driver': 'UserController.getAllDrivers',


  'POST /upload': 'FileController.uploadFile',
  'POST /upload/agent-import': 'AgentController.importAgents',
};
