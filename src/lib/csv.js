export function parseCsv(text) {
  const rows = []
  let current = ''
  let row = []
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && char === ',') {
      row.push(current)
      current = ''
      continue
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        index += 1
      }
      row.push(current)
      if (row.some((value) => value !== '')) {
        rows.push(row)
      }
      row = []
      current = ''
      continue
    }

    current += char
  }

  row.push(current)
  if (row.some((value) => value !== '')) {
    rows.push(row)
  }

  if (rows.length === 0) {
    return []
  }

  const [header, ...body] = rows
  return body.map((values) => {
    const record = {}
    header.forEach((key, columnIndex) => {
      record[key] = values[columnIndex] ?? ''
    })
    return record
  })
}
