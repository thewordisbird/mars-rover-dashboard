const fetchRoverData = (route, body) => {
 
  console.log("[fetchRoverData, rover, body]", route, body)
  const base = "http://localhost:5001/mars-rover-dashboard/us-central1/widgets";
    // const base = "http://localhost:3000";
    console.log("path", base + route);
    console.log(base + route);
    return fetch(base + route, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
      .then((resp) => {
        if (!resp.ok) {
          console.log('error');
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return resp.json()
      })
};

export default fetchRoverData;