const BASE = "/api"

async function request(method, path, body){
    const opts = {
        method,
        headers: { "Content-Type": "application/json" },
    }
    if (body !== undefined) opts.body = JSON.stringify(body)

    const res = await fetch(`${BASE}${path}`, opts)

    if (res.status === 204) return null

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    return data
}

export const api = {
    investigations: {
        list:   ()            => request("GET",    "/investigations"),
        get:    (id)          => request("GET",    `/investigations/${id}`),
        create: (payload)     => request("POST",   "/investigations", payload),
        update: (id, patch)   => request("PUT",    `/investigations/${id}`, patch),
        delete: (id)          => request("DELETE", `/investigations/${id}`),
        bulk:   (invs)        => request("POST",   "/investigations/bulk", { investigations: invs }),
    },

    workspaces: {
        get:   (id)          => request("GET",   `/investigations/${id}/workspace`),
        save:  (id, ws)      => request("PUT",   `/investigations/${id}/workspace`, ws),
        patch: (id, fields)  => request("PATCH", `/investigations/${id}/workspace`, fields),
    },
}