export default async function repositories(app) {
  app.locals.db = { connected: true };
  console.log("Repositories initialized");
}
