marked.use({
    extensions: [
        {
            name: 'emoji',
            level: 'inline',

            start(src) {
                return src.indexOf(':')
            },

            tokenizer(src) {
                const match = /^:([a-zA-Z0-9_+-]+):/.exec(src);

                if (!match) {
                    return;

                }

                return {
                    type: 'emoji',
                    raw: match[0],
                    name: match[1]
                };
            }
        }
    ]
})

const trace = (...args) => console.log(args)

async function addMD(file, lang) {
    const path = `assets/text/${lang}/${file}.md`

    const res = await fetch(path)

    const tokens = marked.lexer(await res.text())

    const container = document.getElementById('main')

    function render(tokens, parent) {
        if (!tokens)
            return

        for (const token of tokens) {
            switch (token.type) {
                case 'emoji':
                    const img = document.createElement('img')

                    img.src = `assets/emojis/${token.name}.png`
                    img.style.width = '1.25em'
                    img.style.height = '1.25em'
                    img.style.verticalAlign = 'middle'

                    parent.appendChild(img)

                    break

                case 'text':
                    parent.appendChild(document.createTextNode(token.text))

                    break
            }
        }
    }

    for (const token of tokens) {
        switch (token.type) {
            case 'paragraph':
                const p = document.createElement('p')

                render(token.tokens, p)

                container.appendChild(p)
        }
    }
}

addMD('0', 'es')