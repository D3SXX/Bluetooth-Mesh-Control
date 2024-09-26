export const fetcherGET = async (url: string) => {
  const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000/${url}`;
  const res = await fetch(apiUrl, {
    method: "GET",
  });
  return res.text();
};

export const fetcherPOST = (requestData: object) => async (url: string) => {
  const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000/${url}`;
  const res = await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.text();
};

export const fetcherDELETE = async (url: string) => {
  const apiUrl = `http://${process.env.NEXT_PUBLIC_SERVER_IP}:10000/${url}`;
  const res = await fetch(apiUrl, {
    method: "DELETE",
  });
  return res.text();
};
