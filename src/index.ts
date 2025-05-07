import express from 'express';
import { env } from './config/env'; 
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
const swaggerDocument = YAML.load("./src/docs/swagger.yaml");
const app = express();
 
app.use(express.json());

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true })
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
  console.log(`📚 Swagger at http://localhost:${env.PORT}/docs`);
}); 
