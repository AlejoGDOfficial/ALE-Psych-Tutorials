const trace = (...args) => console.log(args)

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

                if (!match)
                    return

                return {
                    type: 'emoji',
                    raw: match[0],
                    name: match[1]
                };
            }
        },
        {
            name: 'subtext',
            level: 'inline',

            start(src) {
                return src.indexOf('-# ')
            },

            tokenizer(src) {
                const match = /^-# ([^\n]*)/.exec(src)

                if (!match)
                    return

                return {
                    type: 'subtext',
                    raw: match[0],
                    text: match[1]
                }
            }
        }
    ]
})

function setProperties(obj, props) {
    if (!obj || !props)
        return

    for (const key of Object.keys(props)) {
        const value = props[key]

        if (value && typeof value === 'object' && !Array.isArray(value))
            setProperties(obj[key], value)
        else
            obj[key] = value
    }
}

function create(tag, props, toAppend, tokens, parent) {
    if (!tag)
        return

    const obj = document.createElement(tag)

    setProperties(obj, props)

    render(tokens, parent ?? obj)

    if (toAppend)
        toAppend.appendChild(obj)

    return obj
}

function render(tokens, parent) {
    if (!tokens)
        return

    const container = document.getElementById('main')

    for (const token of tokens) {
        switch (token.type) {
            case 'paragraph':
                create('p', null, container, token.tokens)

                break

            case 'heading':
                create(`h${token.depth}`, null, container, token.tokens)

                break

            case 'emoji':
                create('img', {
                    src: `assets/emojis/${token.name}.png`,
                    style: {
                        width: '1.25em',
                        height: '1.25em',
                        verticalAlign: 'middle'
                    }
                }, parent)

                break

            case 'subtext':
                create('br', null, parent)

                create('sub', {
                    textContent: token.text,
                    style: {
                        opacity: 0.75
                    }
                }, parent)

                break

            case 'em':
                create('em', null, parent, token.tokens)

                break

            case 'strong':
                create('strong', null, parent, token.tokens)

                break

            case 'text':
                parent.appendChild(document.createTextNode(token.text))

                break
        }
    }
}

async function addMD(file, lang) {
    render(marked.lexer(await (await fetch(`assets/text/${lang}/${file}.md`)).text()))
}

addMD('0', 'es')