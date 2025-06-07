import fs from "node:fs/promises"

const databasePath = new URL("../db.json", import.meta.url)
import { formatDate } from "./routes.js"

export class Database {
    #database = {}

    constructor() {
        fs.readFile(databasePath, "utf8")
            .then((data) => {
                this.#database = JSON.parse(data)
            })
            .catch(() => {
                this.#persist()
            })
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database))
    }

    select(table, search) {
        let data = this.#database[table] ?? []

        if (search) {
            data = data.filter((row) => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase())
                })
            })
        }

        return data
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            this.#database[table] = [data]
        }

        this.#persist()

        return data
    }

    update(table, id, data) {
        const rowIndex = this.#database[table].findIndex((row) => row.id === id)

        if (rowIndex > -1) {
            this.#database[table][rowIndex] = {
                ...this.#database[table][rowIndex],
                ...data,
            }
            this.#persist()
            return true
        }

        return false
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex((row) => row.id === id)

        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1)
            this.#persist()
            return true
        }

        return false
    }

    complete(table, id) {
        const rowIndex = this.#database[table].findIndex((row) => row.id === id)

        if (rowIndex > -1) {
            const row = this.#database[table][rowIndex]
            row.completed_at = row.completed_at ? null : formatDate(new Date())
            this.#persist()
            return true
        }
    }
}
