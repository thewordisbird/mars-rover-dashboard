const fetchRoverData = async (route, body) => {
  const base = "http://localhost:5001/mars-rover-dashboard/us-central1/widgets";
    // const base = "http://localhost:3000";
    console.log("path", base + route);
    console.log(base + route);
    const response = await fetch(base + route, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        console.log('error');
        throw new Error(`HTTP error! status: ${response.status}`);
    } else {
        console.log(response);
        return response.json();
    }
};

export default fetchRoverData;