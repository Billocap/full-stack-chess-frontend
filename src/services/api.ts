/**
 * Returns a api url string.
 * @param endpoint The type of information to fetch.
 */
 const url = (endpoint: string) => `http://localhost:5000/${endpoint}`

/**
 * Fetches JSON data from the api.
 * @param url The url to fetch the data from.
 * @param init Init object.
 */
async function fetchJson(url: string, init?: RequestInit): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      ...init
    })

    const data = await response.json()

    if (response.status != 200) throw new Error(data.message)

    return data
  } catch (err) {
    throw err
  }
}

const api = {
  login(email: string, password: string) {
    return fetchJson(url("login"), {
      method: "POST",
      body: JSON.stringify({email, password})
    })
  },
  register(username: string, email: string, password: string) {
    return fetchJson(url("register"), {
      method: "POST",
      body: JSON.stringify({username, email, password})
    })
  }
}

export default api
