module.exports = {
  'GET /users': 'UserController.getAll',
  'PUT /update_password': 'UserController.updateUserPass',
  'PUT /users': 'UserController.updateUser',
  'GET /me': 'UserController.me',
  'GET /users/:id': 'UserController.getSingle',


  'GET /bulk/drivers': 'BulkController.drivers',
  'GET /bulk/routes': 'BulkController.collection_routes',
  'GET /bulk/vehicles': 'BulkController.vehicles',
  'GET /bulk/agents': 'BulkController.agents',

  'PUT /driver': 'UserController.updateDriver',

  'POST /vehicle': 'VehicleController.create',
  'PUT /vehicle': 'VehicleController.update',
  'GET /vehicle': 'VehicleController.get',
  'GET /vehicle/:id': 'VehicleController.getById',

  'POST /agent': 'AgentController.create',
  'PUT /agent': 'AgentController.update',
  'GET /agent': 'AgentController.getAll',
  'GET /agent/:id': 'AgentController.get',

  'POST /route': 'CollectionRouteController.create',
  'PUT /route': 'CollectionRouteController.update',
  'GET /route': 'CollectionRouteController.get',
  'GET /route_details': 'CollectionRouteController.getById',

  'POST /collection': 'CollectionController.create',
  'DELETE /collection': 'CollectionController.remove',
  'GET /collection': 'CollectionController.get',
  'GET /collection-by-date' : 'CollectionController.getByDate',
  'PUT /collection' : 'CollectionController.update',
  'PUT /collected' : 'CollectionController.collected',
  'POST /bulk-schedule': 'CollectionController.mutliScheduling',

  'POST /qrcode' : 'QRCodeController.create',
};
