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

    threatActors: {
        list:   ()            => request("GET",    "/threat-actors"),
        get:    (id)          => request("GET",    `/threat-actors/${id}`),
        create: (payload)     => request("POST",   "/threat-actors", payload),
        update: (id, payload) => request("PUT",    `/threat-actors/${id}`, payload),
        delete: (id)          => request("DELETE", `/threat-actors/${id}`),
        seed:   (actors)      => request("POST",   "/threat-actors/seed", { actors }),
    },

    malware: {
        list:   ()            => request("GET",    "/malware"),
        get:    (id)          => request("GET",    `/malware/${id}`),
        create: (payload)     => request("POST",   "/malware", payload),
        update: (id, payload) => request("PUT",    `/malware/${id}`, payload),
        delete: (id)          => request("DELETE", `/malware/${id}`),
        seed:   (malware)     => request("POST",   "/malware/seed", { malware }),
    },

    iocs: {
        list:   ()            => request("GET",    "/iocs"),
        get:    (id)          => request("GET",    `/iocs/${id}`),
        create: (payload)     => request("POST",   "/iocs", payload),
        update: (id, payload) => request("PUT",    `/iocs/${id}`, payload),
        delete: (id)          => request("DELETE", `/iocs/${id}`),
    },

    detections: {
        list:   ()            => request("GET",    "/detections"),
        get:    (id)          => request("GET",    `/detections/${id}`),
        create: (payload)     => request("POST",   "/detections", payload),
        update: (id, payload) => request("PUT",    `/detections/${id}`, payload),
        delete: (id)          => request("DELETE", `/detections/${id}`),
    },
}