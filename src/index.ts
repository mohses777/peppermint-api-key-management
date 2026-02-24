import app from './app';
import connectDB from './config/database';
import config from './config/index';

const PORT = config.app.port;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
