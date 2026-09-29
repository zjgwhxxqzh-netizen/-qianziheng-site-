import handleAdminRequest from "../../netlify/functions/admin-api.mjs";

export default {
  fetch(request) {
    return handleAdminRequest(request);
  },
};
