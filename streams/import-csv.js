import { parse } from "csv-parse"
import fs from "node:fs"

const csvPath = new URL("./notes.csv", import.meta.url)

const csvStream = fs.createReadStream(csvPath)

async function startStream() {
    const streamData = csvStream.pipe(parse({ delimiter: ",", columns: true }))

    for await (const row of streamData) {
        const { title, description } = row

        await new Promise((resolve) => {
            console.log(
                `Título: ${row.title}, Descrição: ${row.description} - ✅`
            )
            setTimeout(() => {
                resolve()
            }, 500)
        })

        await fetch("http://localhost:3333/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                description,
            }),
        })
    }
    console.log("Notas importadas com sucesso!")
}

startStream()
