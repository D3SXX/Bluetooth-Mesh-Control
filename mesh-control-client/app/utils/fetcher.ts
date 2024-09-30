export const fetcherGET = async (url: string, port: number = 10000) => {
  const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:${port}/${url}`;
  const res = await fetch(apiUrl, {
    method: "GET",
  });
 
  const response = await res.json();
  return response;
};

export const fetcherPOST = (requestData: object) => async (url: string, port: number = 10000) => {
  const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:${port}/${url}`;
  const res = await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response = await res.json();
  return response;
};

export const fetcherDELETE = async (url: string) => {
  const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000/${url}`;
  const res = await fetch(apiUrl, {
    method: "DELETE",
  });
  const response = await res.json();
  return response;
};

export const fetcherPUT = async (url: string) => {
  const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000/${url}`;
  const res = await fetch(apiUrl, {
    method: "PUT",
  });
  const response = await res.json();
  return response;
};
