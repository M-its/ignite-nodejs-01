import { randomUUID } from "node:crypto"
import { Database } from "./database.js"
import { buildRoutePath } from "./utils/build-route-path.js"

const database = new Database()

export function formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
}

export const routes = [
    {
        method: "GET",
        path: buildRoutePath("/notes"),
        handler: (req, res) => {
            const { title, description } = req.query || {}

            let filters = null

            if (title || description) {
                filters = {}
                if (title) {
                    filters.title = decodeURIComponent(title)
                }
                if (description) {
                    filters.description = decodeURIComponent(description)
                }
            }

            const notes = database.select("notes", filters)

            return res.end(JSON.stringify(notes))
        },
    },
    {
        method: "POST",
        path: buildRoutePath("/notes"),
        handler: (req, res) => {
            const { title, description } = req.body

            if (!title || !description) {
                return res.writeHead(400).end(
                    JSON.stringify({
                        message: "Title and description are required",
                    })
                )
            }

            const note = {
                id: randomUUID(),
                title,
                description,
                created_at: formatDate(new Date()),
                updated_at: formatDate(new Date()),
                completed_at: null,
            }

            database.insert("notes", note)

            return res.writeHead(201).end()
        },
    },
    {
        method: "PUT",
        path: buildRoutePath("/notes/:id"),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body

            const UpdatedData = {
                updated_at: formatDate(new Date()),
                ...(title && { title }),
                ...(description && { description }),
            }

            const updated = database.update("notes", id, UpdatedData)

            if (!updated) {
                return res.writeHead(404).end(
                    JSON.stringify({
                        error: "Note not found",
                    })
                )
            }

            return res.writeHead(204).end()
        },
    },
    {
        method: "DELETE",
        path: buildRoutePath("/notes/:id"),
        handler: (req, res) => {
            const { id } = req.params

            const deletedNote = database.delete("notes", id)

            if (!deletedNote) {
                return res.writeHead(404).end(
                    JSON.stringify({
                        error: "Note not found",
                    })
                )
            }

            return res.writeHead(204).end()
        },
    },
    {
        method: "PATCH",
        path: buildRoutePath("/notes/:id"),
        handler: (req, res) => {
            const { id } = req.params

            database.complete("notes", id)

            return res.writeHead(204).end()
        },
    },
]