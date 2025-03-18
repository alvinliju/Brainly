import cluster from 'cluster';
import os from 'os';


if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    
    cluster.on('exit', (worker) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    import('../backend/src/app').then(({ default: app }) => {
      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`Worker ${process.pid} listening on port ${port}`);
      });
    });
  }