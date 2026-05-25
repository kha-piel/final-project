export function normalizeSchoolExamMarkdown(content: string) {
  const normalized = content.replace(/\r\n/g, '\n').trim()
  const withTables = [convertVitaminTable, convertGroupedDataTable].reduce(
    (value, transformer) => transformer(value),
    normalized,
  )

  const protectedBlocks: string[] = []
  const protectedContent = withTables.replace(/(?:^|\n)(\|.+\|\n\|[-:\s|]+\|\n(?:\|.*\|\n?)*)/g, (_, block) => {
    const token = `__TABLE_BLOCK_${protectedBlocks.length}__`
    protectedBlocks.push(block.trim())
    return `\n${token}\n`
  })

  const withParagraphBreaks = protectedContent
    .replace(/\n{3,}/g, '\n\n')
    .replace(/([^\n])\n([^\n])/g, '$1\n\n$2')

  return protectedBlocks.reduce(
    (value, block, index) => value.replace(`__TABLE_BLOCK_${index}__`, block),
    withParagraphBreaks,
  )
}

function convertVitaminTable(content: string) {
  return content.replace(
    /vitamin A\(mg\)\s+vitamin B \(mg\)\s+vitamin K\(mg\)\nX\s+([0-9.,]+)\s+([0-9.,]+)\s+([0-9.,]+)\nY\s+([0-9.,]+)\s+([0-9.,]+)\s+([0-9.,]+)/gi,
    (_, xa, xb, xk, ya, yb, yk) =>
      [
        '| Thực phẩm | vitamin A (mg) | vitamin B (mg) | vitamin K (mg) |',
        '|---|---:|---:|---:|',
        `| X | ${xa} | ${xb} | ${xk} |`,
        `| Y | ${ya} | ${yb} | ${yk} |`,
      ].join('\n'),
  )
}

function convertGroupedDataTable(content: string) {
  return content.replace(
    /(Quãng đường \(km\))\s+([^\n]+)\n(Số ngày)\s+([^\n]+)/gi,
    (_, rowLabelOne, headerSource, rowLabelTwo, rowValuesSource) => {
      const headers = headerSource.match(/\[[^\]]+\)|\([^)]+\)/g) ?? []
      const values = rowValuesSource.trim().split(/\s+/)

      if (headers.length === 0 || headers.length !== values.length) {
        return `${rowLabelOne} ${headerSource}\n${rowLabelTwo} ${rowValuesSource}`
      }

      return [
        `| ${rowLabelOne} | ${headers.join(' | ')} |`,
        `|---|${headers.map(() => '---:').join('|')}|`,
        `| ${rowLabelTwo} | ${values.join(' | ')} |`,
      ].join('\n')
    },
  )
}
