import { app } from "./metrics.js";

const PORT = 9090;
app.listen(PORT, () => {
  console.log(`Metrics server is running on port ${PORT}`);
});
