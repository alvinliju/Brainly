import cluster from 'cluster';
import os from 'os';
import app from '../backend/src/app';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});