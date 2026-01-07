import axios from "axios";

const BASE_URL = "http://localhost:3005/api/auth";

async function verify() {
  const paths = ["/signup/email", "/sign-up/email"];

  for (const path of paths) {
    try {
      console.log(`Checking ${BASE_URL}${path}...`);
      // We use POST because signup is typically a POST request
      const response = await axios.post(`${BASE_URL}${path}`, {}, {
        validateStatus: (status) => true // Don't throw on 404/405/400
      });
      console.log(`Response Status: ${response.status}`);
      if (response.status === 404) {
        console.log(`Result: NOT FOUND`);
      } else {
        console.log(`Result: FOUND (Status ${response.status})`);
      }
    } catch (error: any) {
      console.log(`Error checking ${path}: ${error.message}`);
    }
    console.log("---");
  }
}

verify();
