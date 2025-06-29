const fs = require('fs')
const path = require('path')

let output = ''

function printFolderStructure(dir, indent = '') {
  const items = fs.readdirSync(dir).filter(item => {
    return !item.startsWith('.') && item !== 'node_modules' && item !== '.git'
  })

  items.forEach((item, index) => {
    const fullPath = path.join(dir, item)
    const isLast = index === items.length - 1
    const prefix = isLast ? '└── ' : '├── '
    const nextIndent = indent + (isLast ? '    ' : '│   ')

    const isDir = fs.statSync(fullPath).isDirectory()
    output += indent + prefix + (isDir ? `📁 ${item}` : `📄 ${item}`) + '\n'

    if (isDir) {
      printFolderStructure(fullPath, nextIndent)
    }
  })
}

const rootDir = process.argv[2] || process.cwd()

output += `Project Folder Structure: ${rootDir}\n`
printFolderStructure(rootDir)

fs.writeFileSync('structure.txt', output, 'utf8')
console.log('✅ Folder structure saved to structure.txt')
