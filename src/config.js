const prod = {
 url: {
  API_URL: "https://accountability-api.dxe.io"
 }
};
const dev = {
 url: {
  API_URL: "http://localhost:3000"
 }
};
export const config = process.env.NODE_ENV === "development" ? dev : prod;

export const dashboardStartDate = "2019-11-11"