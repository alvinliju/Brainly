### Architecture + todo




## API architecture 

```
//auth routes
POST /api/v1/auth/register
POST /api/v1/auth/login

//brainly CRUD
GET /api/v1/content -> view all link 
POST /api/v1/content -> create a link
DELETE /api/v1/content/:id -> delete card by ID

//spaces
GET /api/v1/space -> get all spaces
POST /api/v1/space -> create a space
GET /api/v1/space/startup -> all the links in startup space
DELETE /api/v1/space/:id -> delete space by id

```
